import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import LibraryPage from '../src/features/library/LibraryPage';
import { RoutineProvider } from '../src/features/routines/RoutineContext';
import '../src/styles.css';

let root;
const output = document.querySelector('#profile-result');

async function measure(mode) {
  if (root) flushSync(() => root.unmount());
  const rendererID = [...window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.keys()][0];
  if (rendererID === undefined) throw new Error('Chưa có React renderer để đo');
  const devtools = window.workoutDevtools;
  devtools.send('startProfiling', { recordChangeDescriptions: false });
  root = createRoot(document.querySelector('#profile-root'));
  flushSync(() => root.render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <RoutineProvider><LibraryPage virtualized={mode === 'virtual'} /></RoutineProvider>
    </MemoryRouter>,
  ));
  const domRows = document.querySelectorAll('.exercise-row').length;
  devtools.send('stopProfiling');
  const profile = await devtools.readProfile(rendererID);
  const commits = profile.dataForRoots.flatMap((item) => item.commitData);
  if (commits.length === 0) throw new Error('Profiler không ghi được commit mount');
  const duration = commits[0].duration;
  output.textContent = `${mode}: ${duration.toFixed(3)} ms — ${domRows} dòng DOM`;
  return { mode, duration, domRows, commitCount: commits.length, profile };
}

window.workoutProfiler = { ready: true, measure };
for (const button of document.querySelectorAll('button[data-mode]')) {
  button.addEventListener('click', async () => {
    const buttons = [...document.querySelectorAll('button[data-mode]')];
    buttons.forEach((item) => { item.disabled = true; });
    try { await measure(button.dataset.mode); }
    catch (error) { output.textContent = String(error); }
    finally { buttons.forEach((item) => { item.disabled = false; }); }
  });
}
output.textContent = 'Sẵn sàng. Bấm một chế độ để ghi commit mount của kho bài tập.';
