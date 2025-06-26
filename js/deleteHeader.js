// Script này được thiết kế để sửa đổi (xóa) các tiêu đề HTTP
// trong các yêu cầu gửi đi đến RevenueCat API.
// Việc xóa các tiêu đề cụ thể đôi khi có thể giúp bypass một số kiểm tra.

// Chức năng chính sẽ được gọi bởi công cụ proxy khi một yêu cầu khớp với pattern.
function handleRequest(request) {
    // Kiểm tra xem yêu cầu có phần headers không
    if (request.headers) {
        // --- BẮT ĐẦU LOGIC SỬA ĐỔI HEADER ---

        // Ví dụ: Xóa một số tiêu đề phổ biến có thể dùng để theo dõi hoặc xác thực
        // Bạn có thể thêm hoặc bớt các tiêu đề tùy theo mục đích
        delete request.headers["X-RevenueCat-ETag"];
        delete request.headers["X-Ad-Id"];
        delete request.headers["X-Client-Version"];
        delete request.headers["X-Client-Build"];
        delete request.headers["If-None-Match"]; // Quan trọng, để không trả về 304 Not Modified
        delete request.headers["User-Agent"]; // Có thể cần thay đổi thay vì xóa hoàn toàn
        delete request.headers["Authorization"]; // Cẩn thận khi xóa, có thể làm hỏng xác thực
        delete request.headers["Cookie"]; // Cẩn thận khi xóa, có thể làm hỏng phiên đăng nhập

        // Nếu bạn muốn thay đổi giá trị của một header thay vì xóa
        // Ví dụ: request.headers["User-Agent"] = "MyApp/1.0 (iOS; Ohoang7)";

        // --- KẾT THÚC LOGIC SỬA ĐỔI HEADER ---
    }
    return request;
}
