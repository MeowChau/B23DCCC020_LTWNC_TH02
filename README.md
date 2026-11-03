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
- [ ] **Phần 2:** đồng hồ buổi tập bằng Zustand, thanh đồng hồ và bài tập đã lưu với persist.
- [ ] **Phần 3:** giáo án với Context + useReducer, middleware log, sáng/tối và lazy loading.
- [ ] **Phần 4:** tối thiểu 12 test bằng Vitest/Testing Library; coverage Lines ≥ 70% cho `features` và `utils`, ảnh `coverage.png`.

Tại mốc Phần 1, ba nút Bắt đầu, ☆, + Buổi tập đã có trên từng dòng và đang khóa. Các route `/saved`, `/routines`, `/routines/:id` có trang giữ chỗ. Hành vi của các chức năng này được bổ sung đúng ở Phần 2–3.

Đã chuẩn bị script `test`, `coverage` và cấu hình jsdom/Testing Library theo đề. Bộ test sẽ được viết ở Phần 4; ở mốc Phần 1, `npm test` chưa có file test để chạy.

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

## Cấu trúc Phần 1

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
```

## Commit Phần 1

Repository Git cục bộ đã được khởi tạo trên nhánh `main`. Remote `origin` trỏ đến repository GitHub public [MeowChau/B23DCCC020_LTWNC_TH02](https://github.com/MeowChau/B23DCCC020_LTWNC_TH02).

```powershell
cd D:\TH_Web_Nc\TH2\workout-timer
git status
git add .
git commit -m "Phan 1"
git push -u origin main
```

Giữ `package-lock.json` trong Git. `node_modules`, `dist`, báo cáo `coverage` và file kiểm tra cục bộ `.qa` được bỏ qua. Khi hoàn thành toàn bài, chạy cả `npm.cmd run build` và `npm.cmd test` trước khi nộp.

Tham khảo: [React memo](https://react.dev/reference/react/memo), [React Router v6](https://reactrouter.com/6.30.3/start/overview), [Vite](https://vite.dev/guide/), [react-window v1](https://github.com/bvaughn/react-window/tree/v1.8.11).
