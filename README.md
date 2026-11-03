# TH02 — Bấm giờ tập luyện

Bài thực hành Lập trình Web nâng cao theo `LTWNC_TH02.pdf`. Dự án mới đặt tại `D:\TH_Web_Nc\TH2\workout-timer`, độc lập với các bài trước.

## Chạy dự án

Yêu cầu Node.js **22.12+ thuộc nhánh 22 LTS hoặc 24 LTS**. Môi trường thực hiện: Node.js 24.11.0, npm 11.6.2.

```powershell
cd D:\TH_Web_Nc\TH2\workout-timer
npm.cmd ci
npm.cmd run dev
```

Mở URL Local mà Vite in ra, thường là `http://localhost:5173`. Sau khi đã cài thư viện, chỉ cần `npm.cmd run dev`.

```powershell
npm.cmd run build
npm.cmd run preview
```

Ứng dụng không cần API, tài khoản hay file `.env`. Dữ liệu được sinh xác định ngay trong mã nguồn. Phông chữ Google Fonts có phông hệ thống dự phòng khi ngoại tuyến.

## Tiến độ theo các mốc commit

- [x] **Phần 1:** khung React Router v6, kho 10.000 bài tập, danh sách ảo hóa, tìm kiếm debounce, lọc, sắp xếp và tối ưu render.
- [x] **Phần 2:** đồng hồ buổi tập bằng Zustand, thanh đồng hồ và bài tập đã lưu với persist.
- [ ] **Phần 3:** giáo án với Context + useReducer, middleware log, sáng/tối và lazy loading.
- [ ] **Phần 4:** tối thiểu 12 test bằng Vitest/Testing Library; coverage Lines ≥ 70% cho `features` và `utils`, ảnh `coverage.png`.

Tại mốc Phần 2, ba nút Bắt đầu, ☆/★, + Buổi tập hoạt động ở kho bài tập và trang `/saved`. Thanh đồng hồ cố định ở đáy mọi trang. Các route `/routines`, `/routines/:id` vẫn là trang giữ chỗ, được triển khai ở Phần 3.

Đã chuẩn bị script `test`, `coverage` và cấu hình jsdom/Testing Library theo đề. Bộ test nộp bài sẽ được viết ở Phần 4; ở mốc Phần 2, `npm test` chưa có file test nguồn để chạy. Các lượt kiểm tra hồi quy cục bộ ở Phần 1–2 được ghi nhận bên dưới.

## Phần 1: triển khai và tự kiểm tra

| Yêu cầu | Triển khai |
| --- | --- |
| Dữ liệu | `generateExercises(10000)` gọi một lần tại cấp module, dùng công thức của đề. |
| Danh sách ảo | `FixedSizeList` từ `react-window@1`, cao 560px, dòng 56px, overscan 2, `itemKey` là `exercise.id`. |
| Tìm kiếm | Hook generic `useDebounce<T>`, chờ ngừng gõ 300ms, tìm tên bài hoặc HLV, không phân biệt hoa thường. |
| Lọc/sắp xếp | `useMemo`, lọc nhóm cơ, sort trên bản sao; tên dùng `localeCompare(..., 'vi')`. |
| Giảm render | `ExerciseRow` dùng `memo`; renderer danh sách dùng `memo` + `areEqual`; `itemData` dùng `useMemo`; các handler dùng `useCallback`. |
| Điều hướng | `NavLink` tô sáng menu hiện tại, có trang 404 cho URL không tồn tại. |

Chạy dev hoặc preview rồi kiểm tra:

1. Mở `/`: **Tìm thấy 10000 bài tập**. Trong DevTools Elements chỉ có khoảng 12–14 `.exercise-row`, thay đổi khi cuộn; không có 10.000 dòng DOM.
2. Gõ `đẩy`: sau khi ngừng gõ 300ms, **Tìm thấy 1250 bài tập**.
3. Giữ `đẩy`, chọn nhóm **Vai**: **Tìm thấy 250 bài tập**.
4. Chọn **Tất cả**, tìm `đức anh`: **Tìm thấy 1000 bài tập**.
5. Tìm `xyz`: **Không tìm thấy bài tập nào**. Nút **Đặt lại bộ lọc** khôi phục toàn bộ danh sách.
6. Xóa bộ lọc, chọn **Tên A–Z**: dòng đầu **Bật chậm 1**.
7. Chọn **Thời lượng tăng dần**: dòng đầu `0:30`, các dòng sau không giảm thời lượng.
8. Cuộn gần cuối rồi đổi từ khóa/nhóm/sắp xếp: danh sách tự trở về đầu kết quả.
9. Bật React DevTools → Highlight updates: khi đang gõ, các dòng giữ nguyên trước khi debounce kết thúc.
10. Thử menu **Đã lưu**, **Giáo án**, quay về **Kho bài tập**; mục hiện tại được tô sáng.

### Kết quả kiểm tra tại mốc Phần 1

- `npm.cmd run build`: thành công, gồm kiểm tra TypeScript và build production.
- 12 nhóm kiểm tra cục bộ trên Chrome và dữ liệu nguồn đều đạt: dữ liệu/định dạng, kích thước danh sách ảo, debounce, tìm theo tên/HLV, lọc nhóm cơ, trạng thái rỗng, hai cách sắp xếp, cuộn tới cuối, điều hướng/404 và giao diện 390px.
- Chỉ 12 dòng bài tập tồn tại trong DOM khi mở trang; vẫn tối đa 15 dòng khi cuộn tới bài cuối.
- Không có lỗi JavaScript hoặc `console.error` trong lượt kiểm tra trình duyệt.
- Bộ test Vitest chính thức và báo cáo coverage thuộc Phần 4, chưa được triển khai tại mốc này.

## Phần 2: đồng hồ và bài tập đã lưu

| Yêu cầu | Triển khai |
| --- | --- |
| Buổi tập | `useSessionStore` dùng `create<SessionState>()(...)`, gồm queue, chỉ số bài hiện tại, trạng thái chạy và số giây đã tập. |
| Bắt đầu từ kho | Chụp danh sách đã lọc/sắp xếp vào queue, bắt đầu đúng bài được bấm. Thay bộ lọc sau đó không làm đổi buổi đang tập. |
| Điều khiển | Bắt đầu/Tạm dừng, Trước, Sau. Trước khi elapsed > 3 chỉ đặt lại bài; elapsed ≤ 3 lùi về bài trước. Bài cuối dừng đồng hồ. |
| Thêm bài | `addToSession` thêm cuối queue theo ID, bỏ qua bài trùng; nút Bắt đầu ở thanh đồng hồ cũng khởi động được queue thêm thủ công. |
| Tick | `setInterval` mỗi 1000ms khi đang chạy; cleanup khi tạm dừng hoặc unmount. `tick()` đọc state bằng `get()`, tự chuyển bài khi hết thời lượng. |
| Giảm render | Chỉ `CountdownBar` đăng ký `elapsed`. Các component khác dùng selector riêng; mỗi dòng kho chỉ đăng ký trạng thái đã lưu của chính ID đó. |
| Đã lưu | Store riêng dùng `persist`, chỉ ghi `ids` vào localStorage key `workout-saved`. ☆/★ có nhãn `Lưu bài tập`/`Bỏ lưu` và `aria-pressed`. |
| Trang `/saved` | Danh sách không ảo hóa, có Tập tất cả và trạng thái rỗng. Bỏ lưu không làm thay đổi buổi tập đang chạy. |

### Tự kiểm tra Phần 2

1. Bấm Bắt đầu ở e2: thanh dưới có **Đang tập: Kéo tạ đơn 1 – HLV Phương Anh**, **Còn lại: 1:07**, **Buổi tập: 10000 bài**. Sau 5 giây còn **1:02**.
2. Bấm Tạm dừng, chờ 3 giây: thời gian giữ nguyên. Bấm Bắt đầu để tiếp tục.
3. Bấm Sau: sang **Gập tạ đơn 1 – HLV Đức Anh**, còn **1:44**. Chuyển bài khi đang tạm dừng vẫn giữ trạng thái tạm dừng.
4. Bắt đầu e1 và tập hết 30 giây: tự sang e2. Ở e2, tập hơn 3 giây rồi bấm Trước: e2 trở về 1:07; tập 3 giây rồi bấm Trước: trở về e1.
5. Tìm `đẩy`, sắp xếp thời lượng tăng dần rồi bắt đầu một dòng: queue có 1250 bài, Sau đi đúng bài tiếp theo trong kết quả. Xóa bộ lọc không đổi queue đã bắt đầu.
6. Bấm ☆ ở e1 và e3, mở Đã lưu rồi F5: vẫn có hai bài; Local Storage → `workout-saved` có hai ID này. Buổi tập không được persist và trở về chưa bắt đầu khi F5.
7. Bấm Tập tất cả ở Đã lưu: queue có đúng e1 và e3. Hết bài cuối, đồng hồ dừng ở **0:00**. Bấm Bắt đầu có thể tập lại bài đó.
8. Bỏ lưu hết: **Bạn chưa lưu bài tập nào**, Tập tất cả bị khóa. Buổi đang tập vẫn được giữ nguyên.
9. Thử + Buổi tập hai lần ở cùng bài: số bài chỉ tăng một lần. Khi chưa bắt đầu, có thể khởi động queue bằng Bắt đầu ở thanh đồng hồ.
10. Chuyển qua các menu khi đồng hồ chạy: thời gian tiếp tục. Bật React DevTools Highlight updates: giữa các lần chuyển bài, chỉ phần thời gian/tiến trình cập nhật mỗi giây.

### Kết quả kiểm tra tại mốc Phần 2

- Build production và kiểm tra TypeScript thành công.
- 7 nhóm kiểm tra store đạt: khởi tạo, bắt đầu/tạm dừng, chuyển bài/hết buổi, ngưỡng Trước, thêm trùng, đầu vào không hợp lệ và persist/khôi phục bài đã lưu.
- 3 ca kiểm tra component bằng Vitest/Testing Library cục bộ đạt: không render lại kho/dòng/nút mỗi giây; StrictMode không nhân đôi interval và cleanup đầy đủ; lưu bài chỉ render lại đúng dòng đó.
- 9 nhóm kiểm tra Chrome production đạt, gồm chạy 5 giây thật, tạm dừng 3 giây, tự chuyển bài, queue theo bộ lọc/sắp xếp, F5, Tập tất cả, chuyển route, trạng thái rỗng và màn hình 320/390px.
- Không có lỗi JavaScript hoặc `console.error` trong lượt kiểm tra trình duyệt.
- Bộ test nộp bài đặt cạnh nguồn và coverage sẽ hoàn thiện tại Phần 4.

## Cấu trúc hiện tại

```text
src/
  App.tsx                     Khung trang và các route
  main.tsx                    StrictMode + BrowserRouter
  types.ts                    Kiểu Exercise, MuscleGroup
  setupTests.ts               Thiết lập Testing Library cho Vitest
  styles.css                  Giao diện và bố cục màn hình nhỏ
  components/Icon.tsx         Biểu tượng SVG
  data/exercises.ts           Bộ sinh dữ liệu và 10.000 bài tập
  hooks/useDebounce.ts        Hook debounce generic
  utils/format.ts             formatDuration
  features/library/
    LibraryPage.tsx           Tìm kiếm, bộ lọc và FixedSizeList
    ExerciseRow.tsx           Dòng bài tập được memo hóa
  features/session/
    useSessionStore.ts        Queue và các action buổi tập
    SessionBar.tsx            Thanh điều khiển và vòng interval
    CountdownBar.tsx          Thời gian còn lại và tiến trình
  features/saved/
    useSavedStore.ts          ID bài đã lưu, middleware persist
    SavedPage.tsx             Danh sách đã lưu và Tập tất cả
```

## Commit Phần 2

Repository Git cục bộ đã được khởi tạo trên nhánh `main`. Remote `origin` trỏ đến repository GitHub public [MeowChau/B23DCCC020_LTWNC_TH02](https://github.com/MeowChau/B23DCCC020_LTWNC_TH02).

```powershell
cd D:\TH_Web_Nc\TH2\workout-timer
git status
git add .
git commit -m "Phan 2"
git push
```

Giữ `package-lock.json` trong Git. `node_modules`, `dist`, báo cáo `coverage` và file kiểm tra cục bộ `.qa` được bỏ qua. Khi hoàn thành toàn bài, chạy cả `npm.cmd run build` và `npm.cmd test` trước khi nộp.

Tham khảo: [React memo](https://react.dev/reference/react/memo), [React Router v6](https://reactrouter.com/6.30.3/start/overview), [Vite](https://vite.dev/guide/), [react-window v1](https://github.com/bvaughn/react-window/tree/v1.8.11).
