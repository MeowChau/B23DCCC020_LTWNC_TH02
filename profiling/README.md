# Phép đo React DevTools Profiler

Trang `profiling.html` và script `scripts/profile-library.mjs` dùng backend Profiler chính thức từ `react-devtools-core@8.0.0`. Hook được khởi tạo trước khi React được import, kết nối bằng `connectWithCustomMessagingProtocol`, sau đó thực hiện `startProfiling` → mount → `stopProfiling` → `getProfilingData` theo [API của React DevTools](https://github.com/react/react/blob/main/packages/react-devtools-core/README.md).

`entry.jsx` mount cùng `LibraryPage`, `MemoryRouter`, `RoutineProvider`, cùng dữ liệu và các callback. `virtualized=false` render đủ các dòng bằng `VirtualExerciseRow`; `virtualized=true` dùng `FixedSizeList`. Mỗi lượt unmount root cũ trước khi bắt đầu ghi, tạo root mới và dùng `flushSync` để hoàn thành commit mount. Script xác nhận mỗi mẫu có đúng một commit và đúng 10.000 hoặc 12 dòng DOM.

Số đo là `dataForRoots[].commitData[0].duration` (ms) của backend DevTools cho cây kho, tính cả Provider/Router giống nhau ở hai chế độ. Mẫu đo development không dùng StrictMode. Tải module, tải font và paint được tính riêng với thời gian render.

## Kết quả

| Chế độ | Năm mẫu render (ms), sau warm-up | Trung vị (ms) |
| --- | --- | ---: |
| Render thường | 1953,2; 2488,0; 2389,0; 2252,6; 2403,7 | **2389,0** |
| FixedSizeList | 29,1; 10,4; 17,5; 16,7; 37,9 | **17,5** |

Một warm-up cho mỗi chế độ được loại trước khi thu năm mẫu; thứ tự hai chế độ được đổi qua mỗi lượt. Đã đo lại với giao diện nền ngà/cam và component dòng hiện tại. Môi trường đầy đủ, thời điểm UTC và từng mẫu ở [results.json](results.json). Số liệu phụ thuộc môi trường và lần đo.

Hai file `raw/plain.json.gz`, `raw/virtual.json.gz` chứa nguyên payload JSON `profilingData` của backend cho mẫu trung vị, nén gzip. Có thể giải nén để đối chiếu `duration` với báo cáo.

## Chạy lại

Từ thư mục gốc dự án, sau `npm.cmd ci`:

```powershell
npm.cmd run profile:measure
```

Script dùng cổng 5176 cho trang đo và cổng 9233 cho Chrome riêng, tắt extension, viewport 1440×1100, device scale 1, CPU throttling 1×. Script tự chạy Vite nếu chưa có server tương ứng; sau khi xong đóng browser/server do nó tạo. Profile Chrome thử nghiệm nằm trong `.qa/profile-browser` và được Git bỏ qua.

Mặc định Chrome ở `C:\Program Files\Google\Chrome\Application\chrome.exe`; đặt biến môi trường `CHROME_PATH` nếu executable ở vị trí khác. Kết quả mới thay `results.json` và hai file raw; cập nhật bảng trong README gốc khi lưu lượt đo mới.

Để bấm từng chế độ bằng tay:

```powershell
npm.cmd run profile:serve
```

Mở `http://127.0.0.1:5176/profiling.html`. Trang cài sẵn bộ thu thập Profiler và hiện thời gian/dòng DOM sau mỗi lần bấm. `profiling.html` và backend DevTools không được đưa vào bản build production mặc định.
