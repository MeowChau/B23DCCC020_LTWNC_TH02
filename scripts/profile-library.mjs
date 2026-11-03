import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { cpus } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { createServer } from 'vite';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const pageUrl = 'http://127.0.0.1:5176/profiling.html';
const debuggerUrl = 'http://127.0.0.1:9233';
const chromePath = process.env.CHROME_PATH ?? (process.platform === 'win32'
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome');
const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
let ownedServer;
let browser;
let socket;
let browserVersion;
const pending = new Map();
let sequence = 0;

async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}
function send(method, params = {}) {
  const id = ++sequence;
  return new Promise((resolveMessage, reject) => {
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 60000);
    pending.set(id, { resolve: resolveMessage, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, timeout: 60000 });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function measure(mode) {
  const result = await evaluate(`window.workoutProfiler.measure(${JSON.stringify(mode)})`);
  assert.equal(result.domRows, mode === 'plain' ? 10000 : 12);
  assert.equal(result.commitCount, 1, 'Phải đo đúng một commit mount');
  assert.ok(Number.isFinite(result.duration) && result.duration > 0);
  return result;
}

try {
  assert.ok(existsSync(chromePath), 'Không tìm thấy Chrome. Đặt CHROME_PATH trỏ đến executable của Chrome/Chromium.');
  let serverRunning = false;
  try {
    const response = await fetch(pageUrl, { signal: AbortSignal.timeout(1500) });
    if (response.ok) {
      const body = await response.text();
      assert.ok(body.includes('workoutDevtools'), 'Cổng 5176 đang phục vụ ứng dụng khác.');
      serverRunning = true;
    }
  } catch (error) {
    if (error instanceof assert.AssertionError) throw error;
  }
  if (!serverRunning) {
    ownedServer = await createServer({ root: projectRoot, server: { host: '127.0.0.1', port: 5176, strictPort: true } });
    await ownedServer.listen();
  }
  let debuggerBusy = false;
  try { await fetchJson(debuggerUrl + '/json/version'); debuggerBusy = true; } catch { /* Cổng đang trống. */ }
  assert.equal(debuggerBusy, false, 'Cổng 9233 đang bận; hãy đóng lượt đo trước.');
  const browserProfile = resolve(projectRoot, '.qa/profile-browser');
  await mkdir(browserProfile, { recursive: true });
  browser = spawn(chromePath, ['--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run',
    '--no-default-browser-check', '--remote-debugging-port=9233', `--user-data-dir=${browserProfile}`, 'about:blank'],
  { stdio: 'ignore', windowsHide: true });
  browser.on('error', (error) => console.error('Chrome:', error.message));
  for (let attempt = 0; attempt < 100; attempt++) {
    try { browserVersion = await fetchJson(debuggerUrl + '/json/version'); break; } catch { await sleep(100); }
  }
  assert.ok(browserVersion, 'Chrome không mở được cổng CDP.');
  const targets = await fetchJson(debuggerUrl + '/json');
  const page = targets.find((target) => target.type === 'page');
  assert.ok(page);
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolveOpen, reject) => { socket.onopen = resolveOpen; socket.onerror = reject; });
  const runtimeErrors = [];
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails);
    const request = pending.get(message.id);
    if (!request) return;
    clearTimeout(request.timeout); pending.delete(message.id);
    if (message.error) request.reject(new Error(JSON.stringify(message.error)));
    else request.resolve(message.result);
  };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await send('Page.navigate', { url: pageUrl });
  let ready = false;
  for (let attempt = 0; attempt < 200; attempt++) {
    if (await evaluate('window.workoutProfiler?.ready === true')) { ready = true; break; }
    await sleep(100);
  }
  assert.ok(ready, 'Trang đo không sẵn sàng.');
  await evaluate('document.fonts.ready.then(() => true)');
  for (const mode of ['plain', 'virtual']) {
    const result = await measure(mode);
    console.log(`Warm-up ${mode}: ${result.duration.toFixed(3)} ms, ${result.domRows} dòng DOM (không đưa vào kết quả)`);
  }
  const samples = { plain: [], virtual: [] };
  for (let round = 0; round < 5; round++) {
    for (const mode of round % 2 === 0 ? ['plain', 'virtual'] : ['virtual', 'plain']) {
      const result = await measure(mode);
      samples[mode].push(result);
      console.log(`Lượt ${round + 1} ${mode}: ${result.duration.toFixed(3)} ms, ${result.domRows} dòng DOM`);
    }
  }
  assert.deepEqual(runtimeErrors, []);
  const packageVersion = async (name) => JSON.parse(await readFile(resolve(projectRoot, `node_modules/${name}/package.json`), 'utf8')).version;
  const summary = {
    tool: 'Official React DevTools Profiler backend (react-devtools-core)',
    recordedAt: new Date().toISOString(),
    metric: 'First mount commitData.duration in milliseconds; median of 5 runs per mode after 1 warm-up each',
    environment: { node: process.version, react: await packageVersion('react'), devtools: await packageVersion('react-devtools-core'),
      browser: browserVersion.Browser, platform: process.platform, cpu: cpus()[0].model, viewport: [1440, 1100],
      deviceScaleFactor: 1, cpuThrottlingRate: 1, strictMode: false, build: 'development' },
    results: {},
  };
  await mkdir(resolve(projectRoot, 'profiling/raw'), { recursive: true });
  for (const mode of ['plain', 'virtual']) {
    const ordered = [...samples[mode]].sort((a, b) => a.duration - b.duration);
    const median = ordered[2];
    summary.results[mode] = { medianMs: median.duration, domRows: median.domRows,
      samplesMs: samples[mode].map((sample) => sample.duration), commitsPerSample: 1,
      rawMedianProfile: `raw/${mode}.json.gz` };
    await writeFile(resolve(projectRoot, `profiling/raw/${mode}.json.gz`), gzipSync(JSON.stringify(median.profile)));
  }
  await writeFile(resolve(projectRoot, 'profiling/results.json'), JSON.stringify(summary, null, 2) + '\n');
  console.log('\nKết quả trung vị:', JSON.stringify(summary.results));
} finally {
  if (socket?.readyState === WebSocket.OPEN) socket.close();
  if (browserVersion) {
    try {
      const closer = new WebSocket(browserVersion.webSocketDebuggerUrl);
      await new Promise((resolveOpen, reject) => { closer.onopen = resolveOpen; closer.onerror = reject; });
      closer.send(JSON.stringify({ id: 1, method: 'Browser.close' }));
      await new Promise((resolveClose) => { closer.onclose = resolveClose; setTimeout(resolveClose, 2000); });
    } catch { /* Chỉ dừng process do chính script tạo. */ }
  }
  if (browser && browser.exitCode === null) browser.kill();
  if (ownedServer) await ownedServer.close();
}
