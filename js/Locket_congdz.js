// Script này được thiết kế để sửa đổi phản hồi từ RevenueCat API
// nhằm giả lập trạng thái đăng ký thành công (hoặc "crack" như mô tả ban đầu).

// Chức năng chính sẽ được gọi bởi công cụ proxy khi một phản hồi khớp với pattern.
function handleResponse(response) {
    // Kiểm tra xem phản hồi có body và có thể giải mã được không
    if (response.bodyBytes) {
        try {
            // Giải mã body từ byte sang chuỗi UTF-8
            let originalBody = new TextDecoder().decode(response.bodyBytes);
            let json = JSON.parse(originalBody);

            // --- BẮT ĐẦU LOGIC SỬA ĐỔI ---

            // Tạo hoặc cập nhật một quyền lợi "pro" (hoặc bất kỳ tên quyền lợi nào bạn muốn)
            // Giả lập ngày hết hạn là một ngày trong tương lai xa
            const expiryDate = "2099-12-31T23:59:59Z";
            const purchaseDate = new Date().toISOString(); // Ngày mua là hiện tại
            const productIdentifier = "com.app.pro_yearly"; // ID sản phẩm giả định

            if (!json.subscriber) {
                json.subscriber = {};
            }
            if (!json.subscriber.entitlements) {
                json.subscriber.entitlements = {};
            }
            if (!json.subscriber.subscriptions) {
                json.subscriber.subscriptions = {};
            }

            // Thiết lập quyền lợi "pro"
            json.subscriber.entitlements.pro = {
                "expires_date": expiryDate,
                "purchase_date": purchaseDate,
                "product_identifier": productIdentifier,
                "active": true,
                "period_type": "normal", // hoặc "trial", "intro", v.v.
                "will_renew": true,
                "is_sandbox": false,
                "store": "app_store", // hoặc "play_store", "stripe", v.v.
            };

            // Có thể thiết lập tất cả các quyền lợi khác là "pro" nếu muốn
            json.subscriber.entitlements.all = json.subscriber.entitlements.pro;

            // Cập nhật thông tin đăng ký chung
            json.subscriber.first_seen = json.subscriber.first_seen || purchaseDate;
            json.subscriber.original_app_user_id = json.subscriber.original_app_user_id || "ohoang7_user";
            json.subscriber.original_purchase_date = json.subscriber.original_purchase_date || purchaseDate;
            json.subscriber.last_seen = purchaseDate;
            json.subscriber.non_subscriptions = json.subscriber.non_subscriptions || {};
            json.subscriber.original_application_version = json.subscriber.original_application_version || "1.0";

            // Cập nhật trạng thái đăng ký cụ thể (nếu có)
            json.subscriber.subscriptions[productIdentifier] = {
                "expires_date": expiryDate,
                "original_purchase_date": purchaseDate,
                "purchase_date": purchaseDate,
                "product_identifier": productIdentifier,
                "is_sandbox": false,
                "store": "app_store",
                "period_type": "normal",
                "state": "ACTIVE", // Đặt trạng thái là ACTIVE
                "auto_resume_date": null,
                "billing_issues_detected_at": null,
                "grace_period_expires_date": null,
                "refunded_at": null,
                "unsubscribe_detected_at": null,
                "managed_url": "https://example.com/manage-subscription" // URL quản lý giả định
            };

            // Cập nhật danh sách các đăng ký đang hoạt động
            json.subscriber.active_subscriptions = [productIdentifier];

            // Thiết lập các trường khác nếu cần thiết để đảm bảo tính nhất quán
            if (json.request_date) {
                json.request_date_ms = new Date(json.request_date).getTime();
            }

            // --- KẾT THÚC LOGIC SỬA ĐỔI ---

            // Mã hóa lại body thành byte và gán lại vào phản hồi
            response.bodyBytes = new TextEncoder().encode(JSON.stringify(json));

        } catch (e) {
            console.log("Lỗi khi phân tích hoặc sửa đổi JSON: " + e.message);
            // Có thể giữ nguyên phản hồi gốc nếu có lỗi
        }
    }
    return response;
}
