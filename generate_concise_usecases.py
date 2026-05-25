import re
import os

def translate_title(title):
    title_map = {
        "Sign In Use Case": "Đăng nhập",
        "Sign In": "Đăng nhập",
        "Adjust Customer Use Case": "Quản lý Khách hàng",
        "Adjust Customer": "Điều chỉnh Khách hàng",
        "Search Customer": "Tìm kiếm Khách hàng",
        "View list of Customers": "Xem danh sách Khách hàng",
        "Adjust Goods Use Case": "Quản lý Hàng hóa",
        "Adjust Goods": "Điều chỉnh Hàng hóa",
        "Create Goods": "Thêm hàng hóa mới",
        "Update Goods": "Cập nhật Hàng hóa",
        "Search Goods": "Tìm kiếm Hàng hóa",
        "View list of Goods": "Xem danh sách Hàng hóa",
        "Restock Goods": "Nhập kho Hàng hóa",
        "Export Goods": "Xuất kho Hàng hóa",
        "Adjust Promotion Program Use Case": "Quản lý Chương trình Khuyến mãi",
        "Adjust Promotion Program": "Điều chỉnh Chương trình Khuyến mãi",
        "Create Promotion Program": "Tạo chương trình Khuyến mãi mới",
        "Update Promotion Program": "Cập nhật Chương trình Khuyến mãi",
        "Search Promotion Program": "Tìm kiếm chương trình Khuyến mãi",
        "View list of Promotion Program": "Xem danh sách chương trình Khuyến mãi",
        "Adjust Staff Use Case": "Quản lý Nhân sự",
        "Adjust Staff": "Điều chỉnh Nhân sự",
        "Create Staff": "Thêm nhân viên mới",
        "Update Staff": "Cập nhật Nhân viên",
        "Search Staff": "Tìm kiếm Nhân viên",
        "View list of Staffs": "Xem danh sách Nhân viên",
        "Adjust Supplier Use Case": "Quản lý Nhà cung cấp",
        "Adjust Supplier": "Điều chỉnh Nhà cung cấp",
        "Create Supplier": "Thêm nhà cung cấp mới",
        "Update Supplier": "Cập nhật Nhà cung cấp",
        "Search Supplier": "Tìm kiếm Nhà cung cấp",
        "View list of Suppliers": "Xem danh sách Nhà cung cấp",
        "View Supplier Order Status": "Xem trạng thái đơn đặt hàng Nhà cung cấp",
        "Place order from Supplier Use Case": "Đặt hàng từ Nhà cung cấp",
        "Feedback Use Case": "Phản hồi & Đánh giá",
        "Feedback": "Gửi phản hồi",
        "Submit Comment": "Gửi ý kiến đóng góp",
        "Manage Business Report Use Case": "Quản lý Báo cáo Doanh nghiệp",
        "Manage Business Report": "Lập báo cáo doanh số",
        "View Business Report": "Xem báo cáo doanh số",
        "Manage Instruction Use Case": "Quản lý Chỉ thị công việc",
        "Manage Instruction": "Điều chỉnh chỉ thị công việc",
        "Create Instruction": "Tạo chỉ thị công việc mới",
        "Send Instruction": "Gửi chỉ thị công việc",
        "Search Instruction": "Tìm kiếm chỉ thị công việc",
        "Manage Membership Points And Promotion Use Case": "Điểm thành viên & Khuyến mãi",
        "Manage Membership Points And Promotion": "Tích lũy điểm & Khuyến mãi",
        "View Promotion": "Xem khuyến mãi khả dụng",
        "View Membership": "Xem thông tin thành viên",
        "Manage Profile Use Case": "Quản lý thông tin cá nhân",
        "Manage Profile": "Điều chỉnh thông tin cá nhân",
        "View Profile": "Xem hồ sơ cá nhân",
        "Change Password": "Thay đổi mật khẩu",
        "Update Personal Information": "Cập nhật thông tin cá nhân",
        "Manage Staff Report Use Case": "Quản lý báo cáo ca trực",
        "Manage Staff Report": "Điều chỉnh báo cáo ca trực",
        "View Report": "Xem báo cáo ca trực",
        "Search Report": "Tìm kiếm báo cáo ca trực",
        "Export Staff’s Report": "Xuất báo cáo ca trực",
        "Approve Staff’s Report": "Phê duyệt báo cáo ca trực",
        "Reject Staff’s Report": "Từ chối báo cáo ca trực",
        "Sign Up For Customer Use Case": "Đăng ký tài khoản Khách hàng",
        "View List Of Goods (Customer)": "Xem danh mục sản phẩm (Khách hàng)",
        "View Product Details": "Xem chi tiết sản phẩm",
        "View Instruction": "Xem chỉ thị công việc (Nhân viên)",
        "Search And View Instruction": "Tìm kiếm và xem chỉ thị",
        "Report Management (Staff)": "Quản lý báo cáo (Nhân viên)",
        "Report Delivery Issues": "Báo cáo sự cố giao hàng",
        "Generate performance reports": "Tạo báo cáo hiệu suất",
        "Record Customer's Information": "Ghi nhận thông tin Khách hàng",
        "Add Customer": "Đăng ký thẻ thành viên mới tại quầy",
        "Supervise Goods On Shelves": "Giám sát hàng hóa trên kệ",
        "Record Damaged/Out-of-Stock Item": "Ghi nhận hàng hỏng hoặc hết hàng",
        "Search Damaged/Out-of-Stock Item": "Tìm kiếm hàng kệ",
        "Update Damaged/Out-of-Stock Item": "Cập nhật hàng hỏng trên kệ",
        "Adjust Goods On Shelves": "Điều chỉnh sản phẩm trên kệ",
        "Search Product": "Tìm kiếm sản phẩm xếp kệ",
        "Update Product on Shelves": "Cập nhật bổ sung sản phẩm lên kệ",
        "Order Management (Customer)": "Đặt hàng online & Giỏ hàng",
        "Add Product To Cart": "Thêm sản phẩm vào giỏ hàng",
        "Place Order": "Đặt hàng online",
        "Apply Discount / Use Membership Points": "Áp dụng mã giảm giá / Tiêu điểm tích lũy",
        "Rate Order": "Đánh giá đơn hàng",
        "View Order Status": "Xem trạng thái đơn hàng online",
        "View Order History": "Xem lịch sử mua hàng online",
        "Process Customer's Payment": "Thanh toán & Biên lai tại quầy POS",
        "Process Customer's Payment and Create Receipt": "Thực hiện thanh toán và in hóa đơn tại quầy",
        "Search Payment History": "Tìm kiếm lịch sử giao dịch",
        "Adjust Invoice": "Quản lý hóa đơn bán lẻ",
        "Create Invoice": "Tạo hóa đơn bán lẻ tại quầy",
        "View list of assigned delivery orders": "Xem danh sách đơn giao hàng được phân công",
        "View order information": "Xem thông tin chi tiết đơn giao hàng",
        "Accept delivery task": "Xác nhận nhận đơn giao hàng",
        "View Delivery History": "Xem lịch sử giao hàng của tài xế",
        "View Specific Order": "Xem chi tiết đơn giao hàng lịch sử"
    }
    # Handle variations in whitespace or symbols
    title_clean = title.replace("'", "’").strip()
    return title_map.get(title_clean, title_clean)

def get_concise_actor(raw_actor):
    raw_actor_lower = raw_actor.lower()
    actors = []
    if "manager" in raw_actor_lower:
        actors.append("Quản lý")
    if "warehouse" in raw_actor_lower or "stock" in raw_actor_lower:
        actors.append("Nhân viên kho")
    if "cashier" in raw_actor_lower or "thu ngân" in raw_actor_lower:
        actors.append("Thu ngân")
    if "merchandise" in raw_actor_lower or "shelf" in raw_actor_lower:
        actors.append("Nhân viên quầy kệ")
    if "customer" in raw_actor_lower or "khách hàng" in raw_actor_lower:
        actors.append("Khách hàng")
    if "delivery" in raw_actor_lower or "giao hàng" in raw_actor_lower:
        actors.append("Nhân viên giao hàng")
    if "staff" in raw_actor_lower and len(actors) == 0:
        actors.append("Nhân viên")
    if "user" in raw_actor_lower and len(actors) == 0:
        actors.append("Người dùng")
        
    if not actors:
        return "Người dùng."
    return ", ".join(actors) + "."

def main():
    html_path = "usecases_tables.html"
    # Read srs.txt
    with open("srs.txt", "r", encoding="utf-8", errors="ignore") as f:
        lines = f.read().splitlines()

    # Parse TOC (lines 140 to 236, which is index 139 to 235)
    toc_entries = []
    for idx in range(139, 236):
        line = lines[idx].strip()
        match = re.match(r"^(2\.1\.\d+(?:\.\d+)*)\s+(.*?)(?:\s+\d+)?$", line)
        if match:
            num = match.group(1)
            title = match.group(2).strip()
            toc_entries.append({"num": num, "title": title})

    # Find the positions in body text
    body_text = "\n".join(lines[253:4075])
    
    positions = []
    for entry in toc_entries:
        num = entry["num"]
        title = entry["title"]
        
        num_esc = re.escape(num)
        title_esc = re.escape(title)
        
        pattern = re.compile(rf"^(?:{num_esc}\s+)?{title_esc}\s*$", re.MULTILINE | re.IGNORECASE)
        matches = list(pattern.finditer(body_text))
        if matches:
            positions.append((entry, matches[0].start()))
        else:
            pattern2 = re.compile(rf"^{title_esc}\s*$", re.MULTILINE | re.IGNORECASE)
            matches2 = list(pattern2.finditer(body_text))
            if matches2:
                positions.append((entry, matches2[0].start()))
            else:
                # Fallback to loose title match
                positions.append((entry, -1))

    positions.sort(key=lambda x: x[1])

    # Build leaf/parent maps
    nums = [entry["num"] for entry in toc_entries]
    parent_map = {}
    for num in nums:
        # If there is another number starting with this number + "."
        has_child = any(other != num and other.startswith(num + ".") for other in nums)
        parent_map[num] = has_child

    # Parse sections
    parsed_usecases = []
    for i, (entry, pos) in enumerate(positions):
        num = entry["num"]
        title = entry["title"]
        is_parent = parent_map[num]
        
        vn_title = translate_title(title)
        
        if is_parent:
            # Generate default concise parent use case details
            actor = get_concise_actor(title)
            if "Customer" in title:
                actor = "Khách hàng."
            elif "Staff" in title:
                actor = "Quản lý."
            elif "Goods" in title or "Supplier" in title or "Promotion" in title:
                actor = "Quản lý."
            else:
                actor = "Người dùng."
            
            if not actor.endswith("."):
                actor = actor + "."

            desc = f"Cho phép {actor.lower().replace('.', '')} thực hiện các thao tác quản lý liên quan đến {vn_title.lower()} trong hệ thống."
            trigger = f"Khi {actor.lower().replace('.', '')} chọn chức năng “{vn_title}” trên giao diện hệ thống."
            pre = "- Đã đăng nhập vào hệ thống với quyền hạn hợp lệ.<br>- Thiết bị kết nối Internet."
            post = f"- Hệ thống chuyển hướng người dùng đến giao diện của phân hệ “{vn_title}”."
            main_flow = f"- {actor.replace('.', '')} chọn phân hệ “{vn_title}” trên thanh điều hướng.<br>- Hệ thống hiển thị các tính năng chi tiết thuộc phân hệ.<br>- {actor.replace('.', '')} chọn tính năng nghiệp vụ cụ thể để thực hiện."
            alt_flow = "- Người dùng hủy bỏ thao tác hoặc quay lại trang chủ."
            
            parsed_usecases.append({
                "id": f"uc-{num.replace('.', '-')}",
                "num_title": f"{num} - {vn_title} (Use Case Tổng quát)",
                "fields": [
                    ("Tên Use Case", f"{vn_title} (Tổng quát)."),
                    ("Mô tả", desc),
                    ("Tác nhân", actor),
                    ("Điều kiện kích hoạt", trigger),
                    ("Yêu cầu trước khi thực hiện", pre),
                    ("Yêu cầu sau khi thực hiện", post),
                    ("Luồng sự kiện chính", main_flow),
                    ("Luồng sự kiện phụ", alt_flow),
                    ("Yêu cầu phi chức năng", "- Thời gian xử lý không quá 5 giây.<br>- Bảo mật thông tin cá nhân theo quy định.")
                ]
            })
        else:
            # Leaf use case: extract from slice
            if pos != -1:
                start = pos
                # find next valid pos
                next_pos = len(body_text)
                for j in range(i + 1, len(positions)):
                    if positions[j][1] != -1:
                        next_pos = positions[j][1]
                        break
                slice_text = body_text[start:next_pos]
            else:
                slice_text = ""

            # Extract fields from slice_text
            lines_slice = slice_text.splitlines()
            
            markers = {
                "Name": None, "Description": None, "Actor": None, "Trigger": None,
                "Pre-condition": None, "Pre-conditions": None,
                "Post-condition": None, "Post-conditions": None,
                "Sequence Flow": None, "Activities Flow": None, "Business Rules": None
            }
            for idx_l, line_l in enumerate(lines_slice):
                l_strip = line_l.strip()
                for marker in markers:
                    if l_strip == marker or l_strip.startswith(marker + " ") or l_strip.startswith(marker + "\t"):
                        markers[marker] = idx_l

            pre_idx = markers.get("Pre-condition") or markers.get("Pre-conditions")
            post_idx = markers.get("Post-condition") or markers.get("Post-conditions")
            seq_idx = markers.get("Sequence Flow")
            act_idx = markers.get("Activities Flow")
            br_idx = markers.get("Business Rules")
            name_idx = markers.get("Name")
            desc_idx = markers.get("Description")
            actor_idx = markers.get("Actor")
            trigger_idx = markers.get("Trigger")

            def get_text_between(s_idx, e_idx):
                if s_idx is None:
                    return ""
                # Next marker index
                all_nexts = [x for x in [name_idx, desc_idx, actor_idx, trigger_idx, pre_idx, post_idx, seq_idx, act_idx, br_idx] if x is not None and x > s_idx]
                end_pos_idx = min(all_nexts) if all_nexts else len(lines_slice)
                if e_idx is not None and e_idx < end_pos_idx:
                    end_pos_idx = e_idx
                return "\n".join(lines_slice[s_idx + 1:end_pos_idx]).strip()

            raw_name = get_text_between(name_idx, desc_idx) or title
            raw_desc = get_text_between(desc_idx, actor_idx)
            raw_actor = get_text_between(actor_idx, trigger_idx)
            raw_trigger = get_text_between(trigger_idx, pre_idx)
            raw_pre = get_text_between(pre_idx, post_idx)
            raw_post = get_text_between(post_idx, min([x for x in [seq_idx, act_idx, br_idx] if x is not None]) if [x for x in [seq_idx, act_idx, br_idx] if x is not None] else None)
            
            # Clean up the raw fields
            actor = get_concise_actor(raw_actor if raw_actor else title)
            actor_name = actor.replace('.', '').strip()
            
            # Formulate simplified Vietnamese values
            desc_vn = f"Cho phép {actor_name.lower()} thực hiện {vn_title.lower()} trong hệ thống."
            
            # Trigger
            trigger_vn = f"Khi {actor_name.lower()} chọn chức năng “{vn_title}” trên giao diện hệ thống."
            
            # Pre
            pre_vn = "- Thiết bị kết nối Internet.<br>- Tài khoản hoạt động bình thường."
            if "Quản lý" in actor:
                pre_vn = "- Đã đăng nhập bằng tài khoản Quản lý.<br>- Thiết bị kết nối Internet."
            elif "Nhân viên" in actor or "Thu ngân" in actor or "Kho" in actor or "giao hàng" in actor:
                pre_vn = "- Đã đăng nhập bằng tài khoản Nhân viên.<br>- Thiết bị kết nối Internet."
            elif "Khách hàng" in actor:
                pre_vn = "- Đã đăng nhập bằng tài khoản Khách hàng.<br>- Thiết bị kết nối Internet."
                
            # Post
            post_vn = f"- Hệ thống ghi nhận thông tin và xử lý thành công."

            # Main Flow (Luồng sự kiện chính) - extremely clean, concise, 3-4 steps based on action, bulleted using '-'
            if "Đăng nhập" in vn_title:
                main_flow = f"- {actor_name} truy cập vào ứng dụng và bấm nút “Đăng nhập”.<br>- {actor_name} sử dụng email và mật khẩu để đăng nhập.<br>- Hệ thống kiểm tra thông tin, thực hiện phiên đăng nhập và chuyển hướng đến trang chính."
            elif "Đăng ký" in vn_title:
                main_flow = f"- {actor_name} chọn chức năng “Đăng ký” trên giao diện.<br>- {actor_name} nhập các thông tin đăng ký: họ tên, email, mật khẩu, xác nhận mật khẩu.<br>- Hệ thống kiểm tra tính hợp lệ và gửi mã xác thực qua email.<br>- {actor_name} xác thực và hệ thống tạo tài khoản mới thành công."
            elif "Thêm" in vn_title or "Tạo" in vn_title or "Place" in title or "Create" in title:
                main_flow = f"- {actor_name} nhấn nút thêm mới hoặc tạo mới trên giao diện.<br>- Hệ thống hiển thị biểu mẫu điền thông tin.<br>- {actor_name} điền các dữ liệu bắt buộc và nhấn “Lưu” hoặc “Xác nhận”.<br>- Hệ thống kiểm tra tính hợp lệ, lưu thông tin mới và thông báo thành công."
            elif "Chỉnh sửa" in vn_title or "Cập nhật" in vn_title or "Sửa" in vn_title or "Update" in title or "Adjust" in title or "Restock" in title or "Export" in title or "Rate" in title or "Apply" in title or "Feedback" in title or "Submit" in title:
                main_flow = f"- {actor_name} chọn mục dữ liệu cần cập nhật từ danh sách.<br>- Hệ thống hiển thị biểu mẫu chứa thông tin hiện tại.<br>- {actor_name} thay đổi thông tin cần thiết và nhấn “Lưu” hoặc “Cập nhật”.<br>- Hệ thống kiểm tra tính hợp lệ, cập nhật thông tin vào cơ sở dữ liệu và thông báo thành công."
            elif "Tìm kiếm" in vn_title or "Search" in title:
                main_flow = f"- {actor_name} nhập từ khóa tìm kiếm vào ô tìm kiếm.<br>- {actor_name} nhấn nút tìm kiếm hoặc nhấn phím Enter.<br>- Hệ thống thực hiện tìm kiếm và hiển thị danh sách kết quả phù hợp."
            elif "Xem danh sách" in vn_title or "Xem chi tiết" in vn_title or "Xem" in vn_title or "View" in title:
                main_flow = f"- {actor_name} chọn chức năng xem dữ liệu tương ứng.<br>- Hệ thống truy vấn thông tin từ cơ sở dữ liệu.<br>- Hệ thống hiển thị danh sách hoặc thông tin chi tiết lên màn hình."
            else:
                main_flow = f"- {actor_name} chọn chức năng “{vn_title}” trên giao diện.<br>- Hệ thống hiển thị giao diện thực hiện tương ứng.<br>- {actor_name} thực hiện các thao tác nghiệp vụ và xác nhận.<br>- Hệ thống lưu trữ thông tin và thông báo kết quả thành công."

            # Luồng sự kiện phụ
            if "Đăng nhập" in vn_title:
                alt_flow = "- Nếu thông tin đăng nhập không hợp lệ, hệ thống hiển thị thông báo lỗi và yêu cầu nhập lại."
            elif "Đăng ký" in vn_title:
                alt_flow = "- Nếu email đã tồn tại hoặc dữ liệu nhập không hợp lệ, hệ thống thông báo lỗi và yêu cầu nhập lại."
            elif "Thêm" in vn_title or "Tạo" in vn_title or "Sửa" in vn_title or "Cập nhật" in vn_title or "Nhập" in vn_title or "Xuất" in vn_title:
                alt_flow = "- Nếu các trường dữ liệu bắt buộc bị bỏ trống hoặc trùng lặp mã, hệ thống hiển thị thông báo lỗi và yêu cầu kiểm tra lại."
            elif "Tìm kiếm" in vn_title:
                alt_flow = "- Nếu không tìm thấy bản ghi phù hợp với từ khóa, hệ thống hiển thị danh sách trống."
            else:
                alt_flow = "- Nếu xảy ra lỗi kết nối hoặc gián đoạn hệ thống, hệ thống hiển thị thông báo lỗi và yêu cầu thử lại."

            parsed_usecases.append({
                "id": f"uc-{num.replace('.', '-')}",
                "num_title": f"{num} - {vn_title}",
                "fields": [
                    ("Tên Use Case", vn_title + "."),
                    ("Mô tả", desc_vn),
                    ("Tác nhân", actor),
                    ("Điều kiện kích hoạt", trigger_vn),
                    ("Yêu cầu trước khi thực hiện", pre_vn),
                    ("Yêu cầu sau khi thực hiện", post_vn),
                    ("Luồng sự kiện chính", main_flow),
                    ("Luồng sự kiện phụ", alt_flow),
                    ("Yêu cầu phi chức năng", "- Thời gian xử lý không quá 5 giây.<br>- Bảo mật thông tin cá nhân theo quy định.")
                ]
            })

    # Output the complete usecases_tables.html file
    html_content = """<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Đặc tả chi tiết toàn bộ Use Case hệ thống</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 40px;
            background-color: #f7f9fb;
            color: #333;
        }

        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            font-size: 24px;
        }

        .instruction {
            background-color: #e8f4f8;
            border-left: 4px solid #3498db;
            padding: 15px;
            margin-bottom: 30px;
            font-size: 14px;
            line-height: 1.5;
        }

        .uc-container {
            background-color: #fff;
            padding: 20px;
            margin-bottom: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }

        .uc-title {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 12px;
            display: inline-block;
        }

        .btn-copy {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 6px 12px;
            cursor: pointer;
            border-radius: 4px;
            font-size: 13px;
            font-weight: bold;
            float: right;
            transition: background-color 0.2s;
        }

        .btn-copy:hover {
            background-color: #2980b9;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-family: 'Times New Roman', Times, serif;
            font-size: 13pt;
            /* Font size 13pt as requested */
            margin-top: 10px;
        }

        td {
            border: 1px solid #000000;
            padding: 8px 12px;
            vertical-align: top;
            line-height: 1.4;
        }

        .selector-box {
            margin-bottom: 25px;
            padding: 10px;
            background-color: #fff;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
        }

        select {
            padding: 8px 12px;
            font-size: 14px;
            border-radius: 4px;
            border: 1px solid #cbd5e1;
            width: 100%;
            max-width: 500px;
        }
    </style>
    <script>
        async function copyTableToClipboard(tableId, btnId) {
            const table = document.getElementById(tableId);
            const btn = document.getElementById(btnId);
            if (!table) return;

            try {
                const type = 'text/html';
                const blob = new Blob([table.outerHTML], { type });
                const data = [new ClipboardItem({ [type]: blob })];
                await navigator.clipboard.write(data);

                const originalText = btn.innerText;
                btn.innerText = 'Đã Copy!';
                btn.style.backgroundColor = '#2ecc71';
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.backgroundColor = '#3498db';
                }, 2000);
            } catch (err) {
                console.error(err);
                alert('Trình duyệt không hỗ trợ copy tự động. Bạn hãy quét bôi đen bảng này và nhấn Ctrl+C nhé!');
            }
        }

        function scrollToUseCase() {
            const select = document.getElementById('uc-selector');
            const targetId = select.value;
            if (targetId) {
                const element = document.getElementById(targetId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    </script>
</head>

<body>
    <h1>Mô tả đặc tả chi tiết các Use Case hệ thống (Cỡ chữ 13pt - Sẵn sàng Copy vào Word)</h1>

    <div class="instruction">
        <strong>💡 Cách copy cực nhanh vào Microsoft Word (Giữ nguyên định dạng, bảng biểu, cỡ chữ 13pt):</strong><br>
        1. Bấm nút <strong>"Copy Bảng"</strong> màu xanh ở phía trên bên phải của bảng cần copy.<br>
        2. Mở tài liệu Word của bạn, đặt con trỏ chuột vào nơi cần dán và nhấn <strong>Ctrl + V</strong>.<br>
        3. Bảng sẽ tự động được dán vào Word với định dạng viền đen chuẩn, cột bên trái tô màu xanh nhạt và cỡ chữ 13pt
        chuẩn Times New Roman như ảnh mẫu!
    </div>

    <div class="selector-box">
        <label for="uc-selector" style="font-weight: bold; display: block; margin-bottom: 5px;">Chọn nhanh Use Case để
            xem:</label>
        <select id="uc-selector" onchange="scrollToUseCase()">
            <option value="">-- Chọn Use Case --</option>
            <option value="uc-Bảng-3-2">Bảng 3.2: Đăng ký (Tài khoản Y tế - Bảng mẫu)</option>
"""
    # Options for 96 usecases
    for uc in parsed_usecases:
        html_content += f'            <option value="{uc["id"]}">{uc["num_title"]}</option>\n'
        
    # Options for extra sections
    html_content += """            <option value="uc-matrix">Bảng 3.3: Ma trận phân quyền truy cập (Actor Matrix)</option>
            <option value="uc-nfr">Bảng 3.4 & 3.5: Yêu cầu phi chức năng & Triển khai</option>
            <option value="uc-archive">Bảng 3.6 & 3.7: Yêu cầu Lưu trữ & Kiểm toán</option>
            <option value="uc-sites">Bảng 3.8: Các phân hệ hệ thống (Sites)</option>
            <option value="uc-lists">Bảng 3.9: Các danh mục dữ liệu chính (Lists)</option>
            <option value="uc-glossary">Bảng 3.10: Thuật ngữ viết tắt (Glossary)</option>
            <option value="uc-messages">Bảng 3.11: Danh mục thông báo hệ thống (Messages)</option>
        </select>
    </div>
"""

    # Add the sample usecase table
    html_content += """    <div class="uc-container" id="uc-Bảng-3-2">
        <span class="uc-title">Bảng 3.2 - Đăng ký (Tài khoản Y tế - Bảng mẫu)</span>
        <button class="btn-copy" id="btn-uc-Bảng-3-2"
            onclick="copyTableToClipboard('table-uc-Bảng-3-2', 'btn-uc-Bảng-3-2')">Copy Bảng</button>
        <table id="table-uc-Bảng-3-2"
            style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 13pt; border: 1px solid #000000; margin-top: 10px;">
            <tbody>
                <tr>
                    <td
                        style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: 'Times New Roman', Times, serif; font-size: 13pt;">
                        Tên Use Case</td>
                    <td
                        style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: 'Times New Roman', Times, serif; font-size: 13pt;">
                        Đăng ký</td>
                </tr>
                <tr>
                    <td
                        style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: 'Times New Roman', Times, serif; font-size: 13pt;">
                        Mô tả</td>
                    <td
                        style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: 'Times New Roman', Times, serif; font-size: 13pt;">
                        Cho phép người dùng mới (bác sĩ hoặc bệnh nhân) tạo tài khoản trên hệ thống bằng cách cung cấp
                        các thông tin cần thiết và xác thực thông qua email, nhằm sử dụng các chức năng của hệ thống.
                    </td>
                </tr>
                <tr>
                    <td
                        style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: 'Times New Roman', Times, serif; font-size: 13pt;">
                        Tác nhân</td>
                    <td
                        style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: 'Times New Roman', Times, serif; font-size: 13pt;">
                        Người dùng</td>
                </tr>
                <tr>
                    <td
                        style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: 'Times New Roman', Times, serif; font-size: 13pt;">
                        Điều kiện kích hoạt</td>
                    <td
                        style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: 'Times New Roman', Times, serif; font-size: 13pt;">
                        Người dùng chọn chức năng “Đăng ký” trên giao diện hệ thống.</td>
                </tr>
                <tr>
                    <td
                        style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: 'Times New Roman', Times, serif; font-size: 13pt;">
                        Yêu cầu trước khi thực hiện</td>
                    <td
                        style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: 'Times New Roman', Times, serif; font-size: 13pt;">
                        - Người dùng chưa có tài khoản trên hệ thống.<br>- Người dùng có địa chỉ email hợp lệ.</td>
                </tr>
                <tr>
                    <td
                        style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: 'Times New Roman', Times, serif; font-size: 13pt;">
                        Yêu cầu sau khi thực hiện</td>
                    <td
                        style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: 'Times New Roman', Times, serif; font-size: 13pt;">
                        - Tài khoản người dùng được tạo thành công trên hệ thống.<br>- Người dùng có thể đăng nhập và sử
                        dụng các chức năng của hệ thống sau khi xác thực email (nếu có).</td>
                </tr>
                <tr>
                    <td
                        style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: 'Times New Roman', Times, serif; font-size: 13pt;">
                        Luồng sự kiện chính</td>
                    <td
                        style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: 'Times New Roman', Times, serif; font-size: 13pt;">
                        - Người dùng chọn chức năng Đăng ký.<br>
                        - Người dùng nhập các thông tin đăng ký: họ tên, email, mật khẩu, xác nhận mật khẩu.<br>
                        - Hệ thống kiểm tra tính hợp lệ của thông tin nhập vào.<br>
                        - Hệ thống gửi mã OTP hoặc liên kết xác thực đến email người dùng.<br>
                        - Người dùng xác thực tài khoản thông qua OTP hoặc liên kết được gửi.<br>
                        - Với bác sĩ, sau khi xác thực tài khoản thông qua OTP phải đợi admin duyệt:<br>
                        &nbsp;&nbsp;+ Chấp nhận → nhận email đăng ký thành công<br>
                        &nbsp;&nbsp;+ Từ chối → nhận email đăng ký thất bại, yêu cầu sửa đổi thông tin đăng ký<br>
                        - Hệ thống tạo tài khoản mới và thông báo đăng ký thành công.</td>
                </tr>
                <tr>
                    <td
                        style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: 'Times New Roman', Times, serif; font-size: 13pt;">
                        Luồng sự kiện phụ</td>
                    <td
                        style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: 'Times New Roman', Times, serif; font-size: 13pt;">
                        - Email đã tồn tại trong hệ thống → hiển thị thông báo lỗi.<br>
                        - Mật khẩu không trùng khớp với xác nhận → yêu cầu nhập lại.<br>
                        - OTP hoặc liên kết xác thực không hợp lệ hoặc hết hạn → yêu cầu xác thực lại.</td>
                </tr>
                <tr>
                    <td
                        style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: 'Times New Roman', Times, serif; font-size: 13pt;">
                        Yêu cầu phi chức năng</td>
                    <td
                        style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: 'Times New Roman', Times, serif; font-size: 13pt;">
                        - Thời gian xử lý đăng nhập không quá 5 giây.<br>
                        - Bảo mật thông tin cá nhân theo quy định.<br>
                        - Mã OTP hoặc liên kết xác thực có thời hạn hiệu lực.</td>
                </tr>
            </tbody>
        </table>
    </div>
"""

    # Add the 96 concise tables
    for uc in parsed_usecases:
        table_id = f"table-{uc['id']}"
        btn_id = f"btn-{uc['id']}"
        
        html_content += f'    <div class="uc-container" id="{uc["id"]}">\n'
        html_content += f'        <span class="uc-title">{uc["num_title"]}</span>\n'
        html_content += f'        <button class="btn-copy" id="{btn_id}" onclick="copyTableToClipboard(\'{table_id}\', \'{btn_id}\')">Copy Bảng</button>\n'
        html_content += f'        <table id="{table_id}" style="width: 100%; border-collapse: collapse; font-family: \'Times New Roman\', Times, serif; font-size: 13pt; border: 1px solid #000000; margin-top: 10px;">\n'
        html_content += '            <tbody>\n'
        
        for field_name, field_val in uc["fields"]:
            html_content += '                <tr>\n'
            html_content += f'                    <td style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: \'Times New Roman\', Times, serif; font-size: 13pt;">{field_name}</td>\n'
            html_content += f'                    <td style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top; font-family: \'Times New Roman\', Times, serif; font-size: 13pt;">{field_val}</td>\n'
            html_content += '                </tr>\n'
            
        html_content += '            </tbody>\n'
        html_content += '        </table>\n'
        html_content += '    </div>\n\n'

    # Add the 7 trailing tables
    html_content += """    <!-- BẢNG 3.3: MA TRẬN PHÂN QUYỀN TRUY CẬP -->
    <div class="uc-container" id="uc-matrix">
        <span class="uc-title">Bảng 3.3 - Ma trận phân quyền truy cập người dùng (User Access and Security Matrix)</span>
        <button class="btn-copy" id="btn-uc-matrix" onclick="copyTableToClipboard('table-uc-matrix', 'btn-uc-matrix')">Copy Bảng</button>
        <table id="table-uc-matrix" style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 13pt; border: 1px solid #000000; margin-top: 10px;">
            <thead>
                <tr style="background-color: #d9e1f2; font-weight: bold;">
                    <td style="width: 25%; border: 1px solid #000000; padding: 8px 12px; text-align: center; vertical-align: middle;">Chức năng (Function)</td>
                    <td style="width: 12.5%; border: 1px solid #000000; padding: 8px 12px; text-align: center; vertical-align: middle;">Quản lý<br>(Manager)</td>
                    <td style="width: 12.5%; border: 1px solid #000000; padding: 8px 12px; text-align: center; vertical-align: middle;">NV Kho<br>(Warehouse)</td>
                    <td style="width: 12.5%; border: 1px solid #000000; padding: 8px 12px; text-align: center; vertical-align: middle;">Thu ngân<br>(Cashier)</td>
                    <td style="width: 12.5%; border: 1px solid #000000; padding: 8px 12px; text-align: center; vertical-align: middle;">NV Quầy kệ<br>(Merchandise)</td>
                    <td style="width: 12.5%; border: 1px solid #000000; padding: 8px 12px; text-align: center; vertical-align: middle;">Khách hàng<br>(Customer)</td>
                    <td style="width: 12.5%; border: 1px solid #000000; padding: 8px 12px; text-align: center; vertical-align: middle;">NV Giao hàng<br>(Delivery)</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Adjust customer (Điều chỉnh khách hàng)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Adjust goods on receiving (Nhận/nhập kho)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Adjust goods (Quản lý danh mục hàng hóa)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Adjust Invoice (Quản lý hóa đơn)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Adjust Promotion Program (Quản lý khuyến mãi)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Adjust Staff (Quản lý nhân sự)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Adjust Suppliers (Quản lý nhà cung cấp)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Feedback (Gửi phản hồi & đánh giá)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X(*)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Manage business report (Quản lý báo cáo doanh thu)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Manage instruction (Quản lý chỉ thị công việc)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Manage membership points & promotion (Điểm & Ưu đãi)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Manage profile (Quản lý thông tin cá nhân)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X(*)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Manage report (staff) (Nộp báo cáo ca làm việc)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Order management (Quản lý giỏ hàng & Đặt hàng online)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X(*)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Process customer’s payment (Thanh toán tại quầy POS)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Record customer’s information (Ghi nhận thông tin KH)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Sign in (Đăng nhập hệ thống)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Sign up (Đăng ký tài khoản)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Supervise goods on shelves (Giám sát hàng hóa trên kệ)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Supervise inventory (Giám sát tồn kho tổng)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">View assigned delivery orders (Xem đơn giao hàng được giao)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">View instruction (Xem chỉ thị công việc)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">View list of goods (Xem danh sách sản phẩm)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">View order history (Xem lịch sử mua hàng)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                </tr>
            </tbody>
        </table>
        <div style="margin-top: 10px; font-size: 11pt; font-style: italic;">
            * Ghi chú:<br>
            - <strong>X</strong>: Tác nhân có đầy đủ quyền hạn thực hiện hành động.<br>
            - <strong>X(*)</strong>: Tác nhân có quyền hạn thực hiện hành động trên dữ liệu cá nhân của chính họ.<br>
            - <strong>X(**)</strong>: Tác nhân có quyền hạn thực hiện hành động trên các mục được phân công gửi đến cho họ.
        </div>
    </div>

    <!-- BẢNG 3.4 & 3.5: YÊU CẦU PHI CHỨC NĂNG & TRIỂN KHAI -->
    <div class="uc-container" id="uc-nfr">
        <span class="uc-title">Bảng 3.4 - Yêu cầu phi chức năng về hiệu năng và tài nguyên hệ thống</span>
        <button class="btn-copy" id="btn-uc-nfr-1" onclick="copyTableToClipboard('table-uc-nfr-1', 'btn-uc-nfr-1')">Copy Bảng 3.4</button>
        <table id="table-uc-nfr-1" style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 13pt; border: 1px solid #000000; margin-top: 10px;">
            <tbody>
                <tr>
                    <td style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">Chỉ số hiệu năng (Performance)</td>
                    <td style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">
                        - Số lượng người dùng truy cập đồng thời tối đa (Concurrent Users): 500 người dùng.<br>
                        - Số lượng người dùng nội bộ/nghiệp vụ hoạt động đồng thời (Business Users): 50 người dùng.
                    </td>
                </tr>
                <tr>
                    <td style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">Dung lượng dữ liệu (Data Volume)</td>
                    <td style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">
                        - Số lượng tài liệu/bản ghi dữ liệu ban đầu: 10,000 bản ghi.<br>
                        - Tỷ lệ tăng trưởng dữ liệu dự kiến: 20% mỗi năm.
                    </td>
                </tr>
                <tr>
                    <td style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">Độ sẵn sàng (Availability)</td>
                    <td style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">
                        - Yêu cầu hệ thống sẵn sàng và hoạt động liên tục 24/7 để phục vụ bán lẻ và đặt hàng online.
                    </td>
                </tr>
                <tr>
                    <td style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">Tần suất sử dụng (Usage Frequency)</td>
                    <td style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">
                        - Hoạt động liên tục hàng ngày (Daily).
                    </td>
                </tr>
            </tbody>
        </table>

        <br><br>

        <span class="uc-title">Bảng 3.5 - Yêu cầu môi trường triển khai hệ thống (Implementation Requirements)</span>
        <button class="btn-copy" id="btn-uc-nfr-2" onclick="copyTableToClipboard('table-uc-nfr-2', 'btn-uc-nfr-2')">Copy Bảng 3.5</button>
        <table id="table-uc-nfr-2" style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 13pt; border: 1px solid #000000; margin-top: 10px;">
            <tbody>
                <tr>
                    <td style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">Địa điểm triển khai (Location)</td>
                    <td style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">
                        Website và các ứng dụng di động sẽ được cài đặt và vận hành chính thức tại: Thành phố Hồ Chí Minh.
                    </td>
                </tr>
                <tr>
                    <td style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">Thời gian chỉ đọc tối đa (Read-only Duration)</td>
                    <td style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">
                        Thời gian tối đa mà hệ thống có thể hoạt động ở chế độ chỉ đọc (read-only) phục vụ chuyển đổi/sao lưu: 1 ngày.
                    </td>
                </tr>
                <tr>
                    <td style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">Khung thời gian chỉ đọc (Read-only Timeframe)</td>
                    <td style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">
                        Khung giờ bảo trì đưa hệ thống về trạng thái chỉ đọc: Từ 2 AM đến 4 AM EST (tương đương 14:00 đến 16:00 giờ Việt Nam).
                    </td>
                </tr>
                <tr>
                    <td style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">Thời gian bảo trì (Maintenance Window)</td>
                    <td style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">
                        Cửa sổ bảo trì định kỳ được lên lịch hàng quý, diễn ra vào dịp cuối tuần cuối cùng của mỗi quý.
                    </td>
                </tr>
                <tr>
                    <td style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">Lịch trình chuyển đổi dữ liệu (Conversion Timeline)</td>
                    <td style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">
                        Các hoạt động chuyển đổi dữ liệu và cập nhật lớn được lên lịch cố định vào ngày 5 và ngày 20 hàng tháng.
                    </td>
                </tr>
                <tr>
                    <td style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">Các kế hoạch và hoạt động khác</td>
                    <td style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">N/A</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- BẢNG 3.6 & 3.7: YÊU CẦU LƯU TRỮ VÀ KIỂM TOÁN -->
    <div class="uc-container" id="uc-archive">
        <span class="uc-title">Bảng 3.6 - Chức năng lưu trữ dữ liệu lịch sử hệ thống (Archive Function)</span>
        <button class="btn-copy" id="btn-uc-archive-1" onclick="copyTableToClipboard('table-uc-archive-1', 'btn-uc-archive-1')">Copy Bảng 3.6</button>
        <table id="table-uc-archive-1" style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 13pt; border: 1px solid #000000; margin-top: 10px;">
            <thead>
                <tr style="background-color: #d9e1f2; font-weight: bold;">
                    <td style="width: 30%; border: 1px solid #000000; padding: 8px 12px; text-align: center;">Danh mục lưu trữ (List)</td>
                    <td style="width: 20%; border: 1px solid #000000; padding: 8px 12px; text-align: center;">Tác nhân (Actor)</td>
                    <td style="width: 50%; border: 1px solid #000000; padding: 8px 12px; text-align: center;">Điều kiện lưu trữ (Condition)</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Thông tin nhân viên (Staff Information)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản lý (Manager)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản lý có thể nén và đưa vào kho lưu trữ (archive) các bản ghi nhân viên cũ dựa theo ngày tạo lập.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Thông tin sản phẩm (Product Information)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản lý (Manager)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản lý có thể đưa các sản phẩm ngưng kinh doanh vào danh mục lưu trữ dựa trên ngày khởi tạo.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Thông tin khách hàng (Customer Information)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản lý (Manager)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản lý thực hiện lưu trữ thông tin các khách hàng ngừng hoạt động dựa theo ngày tạo.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Thông tin khuyến mãi (Promotion Information)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản lý (Manager)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản lý thực hiện đóng và lưu trữ thông tin các chương trình khuyến mãi đã hết hạn theo ngày tạo.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Báo cáo (Report)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản lý (Manager)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản lý thực hiện lưu trữ các báo cáo doanh số và báo cáo nhân viên định kỳ dựa theo ngày lập báo cáo.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Chỉ thị (Instruction)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản lý (Manager)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản lý có thể thực hiện lưu trữ các chỉ thị cũ đã hoàn thành dựa trên ngày tạo.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Nhà cung cấp (Supplier)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản lý (Manager)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản lý có thể lưu trữ thông tin của các nhà cung cấp ngừng hợp tác dựa theo ngày tạo lập.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Tồn kho (Inventory)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản lý (Manager) / Nhân viên Kho</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản lý hoặc nhân viên kho thực hiện nén và lưu trữ dữ liệu lịch sử xuất nhập kho dựa trên ngày tạo.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Hóa đơn (Invoice)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản lý (Manager) / Thu ngân</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Các bản ghi hóa đơn cũ có thể được chuyển vào kho lưu trữ dữ liệu tài chính lịch sử theo ngày tạo.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Hàng hóa trên kệ (Goods on shelves)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản lý / Nhân viên Quầy kệ</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Dữ liệu lịch sử sắp xếp trưng bày hàng trên kệ có thể được lưu trữ theo ngày tạo lập.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Đơn giao hàng được phân công (Assigned Delivery Order)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Nhân viên giao hàng</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Nhân viên giao hàng có thể lưu trữ lịch sử các đơn hàng đã giao hoàn thành dựa trên ngày tạo lập.</td>
                </tr>
            </tbody>
        </table>

        <br><br>

        <span class="uc-title">Bảng 3.7 - Chức năng giám sát và kiểm toán bảo mật (Security Audit Function)</span>
        <button class="btn-copy" id="btn-uc-archive-2" onclick="copyTableToClipboard('table-uc-archive-2', 'btn-uc-archive-2')">Copy Bảng 3.7</button>
        <table id="table-uc-archive-2" style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 13pt; border: 1px solid #000000; margin-top: 10px;">
            <tbody>
                <tr>
                    <td style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">Nội dung chức năng</td>
                    <td style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">
                        Hệ thống tự động kích hoạt tính năng Ghi nhận lịch sử kiểm toán bảo mật (Security Audit Function) dành riêng cho vai trò "Quản lý" (Manager) để theo dõi, ghi vết toàn bộ các chỉnh sửa liên quan đến phân quyền truy cập người dùng trong hệ thống (phát hiện hành vi nâng quyền trái phép hoặc thay đổi vai trò nhân sự).
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- BẢNG 3.8: CÁC PHÂN HỆ HỆ THỐNG -->
    <div class="uc-container" id="uc-sites">
        <span class="uc-title">Bảng 3.8 - Danh mục các phân hệ giao diện của hệ thống Mini-Supermarket</span>
        <button class="btn-copy" id="btn-uc-sites" onclick="copyTableToClipboard('table-uc-sites', 'btn-uc-sites')">Copy Bảng 3.8</button>
        <table id="table-uc-sites" style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 13pt; border: 1px solid #000000; margin-top: 10px;">
            <thead>
                <tr style="background-color: #d9e1f2; font-weight: bold;">
                    <td style="width: 8%; border: 1px solid #000000; padding: 8px 12px; text-align: center;">STT</td>
                    <td style="width: 27%; border: 1px solid #000000; padding: 8px 12px; text-align: center;">Tên Phân hệ (Site Name)</td>
                    <td style="width: 65%; border: 1px solid #000000; padding: 8px 12px; text-align: center;">Mô tả chức năng (Description)</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">1</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Phân hệ Quản lý (Manager Site)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Đây là bảng điều khiển dành cho cấp Quản lý/Quản trị viên. Cung cấp đầy đủ các chức năng Thêm, Đọc, Sửa, Xóa (CRUD) các danh mục dữ liệu chính gồm Nhân viên, Khách hàng, Sản phẩm, Khuyến mãi, Báo cáo ca trực, Chỉ thị công việc và đối tác Nhà cung cấp. Ngoài ra, Quản lý có thể xem chi tiết tất cả các báo cáo hiệu suất của nhân viên.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">2</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Phân hệ Giao hàng (Delivery Site)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Giao diện dành riêng cho tài xế/nhân viên giao hàng trên thiết bị di động. Cho phép nhân viên xem danh sách các đơn hàng được phân công giao nhận, xem lịch sử giao hàng thành công/thất bại để thống kê doanh số. Nhận trực tiếp các chỉ thị công việc từ Quản lý và thực hiện lập báo cáo ca trực nộp lên hệ thống.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">3</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Phân hệ Giám sát Quầy kệ (Merchandise Supervisor Site)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Giao diện dành cho nhân viên quầy trưng bày sản phẩm. Cho phép thực hiện giám sát số lượng hàng trưng bày, thực hiện xuất sản phẩm từ kho tổng lên kệ (CRUD) và tạo các báo cáo về sự cố hàng hỏng, vỡ, hết hạn sử dụng. Nhận chỉ thị từ Quản lý và nộp báo cáo tiến độ công việc hàng ngày.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">4</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Phân hệ Nhân viên Kho (Warehouse Staff Site)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Thiết kế cho thủ kho/nhân viên kho. Cung cấp các chức năng CRUD đối với số lượng sản phẩm nằm trong kho tổng của siêu thị phục vụ nhận hàng và kiểm kho. Nhận chỉ thị từ Quản lý và lập báo cáo kho nộp lên hệ thống.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">5</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Phân hệ Thu ngân (Cashier Site)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Giao diện tại quầy POS dành cho nhân viên thu ngân. Cung cấp các chức năng xử lý thanh toán đơn hàng trực tiếp, tích điểm thành viên, áp dụng voucher khuyến mãi, quản lý lịch sử hóa đơn bán lẻ và cập nhật hồ sơ khách hàng.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">6</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Phân hệ Khách hàng (Customer Site)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Giao diện web/mobile dành cho người tiêu dùng. Hỗ trợ xem danh mục sản phẩm, thêm sản phẩm vào giỏ hàng trực tuyến, áp dụng mã ưu đãi, thực hiện thanh toán online tạo đơn đặt hàng, tra cứu lịch sử mua sắm cá nhân và gửi các khiếu nại, phản hồi chấm điểm dịch vụ.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- BẢNG 3.9: DANH MỤC DỮ LIỆU CHÍNH -->
    <div class="uc-container" id="uc-lists">
        <span class="uc-title">Bảng 3.9 - Danh mục các bảng/danh sách dữ liệu chính trong hệ thống</span>
        <button class="btn-copy" id="btn-uc-lists" onclick="copyTableToClipboard('table-uc-lists', 'btn-uc-lists')">Copy Bảng 3.9</button>
        <table id="table-uc-lists" style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 13pt; border: 1px solid #000000; margin-top: 10px;">
            <thead>
                <tr style="background-color: #d9e1f2; font-weight: bold;">
                    <td style="width: 6%; border: 1px solid #000000; padding: 8px 12px; text-align: center;">STT</td>
                    <td style="width: 12%; border: 1px solid #000000; padding: 8px 12px; text-align: center;">Mã (Code)</td>
                    <td style="width: 22%; border: 1px solid #000000; padding: 8px 12px; text-align: center;">Tên Danh mục (List Name)</td>
                    <td style="width: 60%; border: 1px solid #000000; padding: 8px 12px; text-align: center;">Mô tả dữ liệu lưu trữ (Description)</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">1</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Lis01</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Nhân viên (Staff)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Lưu giữ các dữ liệu cơ bản của nhân viên: họ tên, email, số điện thoại, vai trò nghiệp vụ (thủ kho, thu ngân, giao hàng, giám sát quầy kệ), ngày tuyển dụng, mức lương và trạng thái tài khoản.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">2</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Lis02</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Sản phẩm (Product)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Chứa thông tin về các hàng hóa kinh doanh: tên sản phẩm, phân mục, đơn giá bán lẻ, đơn giá nhập, mã vạch (barcode), mã SKU phân loại sản phẩm và đối tác cung ứng.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">3</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Lis03</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Khách hàng (Customer)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Lưu trữ thông tin khách hàng thành viên: Họ tên, email, số điện thoại liên lạc, giới tính, ngày sinh, hạng thành viên tích lũy và số điểm thưởng tích lũy hiện có.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">4</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Lis04</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Khuyến mãi (Promotion)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Chi tiết về các chương trình ưu đãi: tên sự kiện, hình thức giảm giá (theo % hoặc trừ tiền trực tiếp), mức giảm, ngày bắt đầu/kết thúc, giới hạn số lần sử dụng và điều kiện áp dụng hóa đơn.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">5</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Lis05</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Báo cáo (Report)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Lưu trữ các báo cáo nộp từ nhân viên (báo cáo doanh số bán hàng trong ca, số lượng giao nhận, chấm công ca trực, sự cố xảy ra) làm cơ sở cho quản lý đối chiếu và phê duyệt chấm công.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">6</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Lis06</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Chỉ thị (Instruction)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Lưu thông tin các chỉ thị, chỉ đạo công việc do Quản lý soạn thảo gửi xuống cho các nhân viên, bao gồm tiêu đề, mô tả chi tiết, thời hạn và danh sách nhân sự nhận việc.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">7</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Lis07</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Nhà cung cấp (Supplier)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Thông tin về các đối tác cung cấp hàng hóa cho siêu thị: tên nhà cung ứng, người đại diện, SĐT, địa chỉ email, MST doanh nghiệp và thông tin tài khoản ngân hàng phục vụ thanh toán.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">8</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Lis08</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Tồn kho (Inventory)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Danh sách theo dõi lượng tồn kho thực tế trong kho tổng: mã sản phẩm, số lượng tồn kho tự do, ngưỡng cảnh báo tồn tối thiểu/tối đa và vị trí lưu trữ trong kho tổng.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">9</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Lis09</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Hóa đơn (Invoice)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Bản ghi hóa đơn chi tiết bán hàng: thông tin khách hàng mua, ngày lập, danh sách sản phẩm, số lượng, đơn giá, thuế VAT áp dụng, số tiền được giảm trừ và tổng tiền thực tế khách phải trả.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">10</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Lis10</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Hàng hóa trên kệ (Goods on shelves)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Danh sách theo dõi chi tiết số lượng sản phẩm đang trưng bày tại các kệ hàng vật lý ngoài quầy POS phục vụ khách mua trực tiếp, bao gồm số lượng trưng bày thực tế, vị trí kệ hàng.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">11</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Lis11</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Đơn giao hàng được phân công (Assigned Delivery Order)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Thông tin các đơn hàng giao nhận được phân công cho tài xế: thông tin người nhận, địa chỉ giao nhận, số điện thoại khách, danh mục sản phẩm, phí giao hàng, hình thức thanh toán (COD hoặc trả trước) và trạng thái giao hàng.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- BẢNG 3.10: THUẬT NGỮ VIẾT TẮT -->
    <div class="uc-container" id="uc-glossary">
        <span class="uc-title">Bảng 3.10 - Bảng thuật ngữ viết tắt (Glossary)</span>
        <button class="btn-copy" id="btn-uc-glossary" onclick="copyTableToClipboard('table-uc-glossary', 'btn-uc-glossary')">Copy Bảng 3.10</button>
        <table id="table-uc-glossary" style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 13pt; border: 1px solid #000000; margin-top: 10px;">
            <thead>
                <tr style="background-color: #d9e1f2; font-weight: bold;">
                    <td style="width: 25%; border: 1px solid #000000; padding: 8px 12px; text-align: center;">Thuật ngữ (Term)</td>
                    <td style="width: 75%; border: 1px solid #000000; padding: 8px 12px; text-align: center;">Diễn giải ý nghĩa (Description)</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">BR</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quy tắc Nghiệp vụ (Business Rule) - Các quy định logic cần tuân thủ trong quy trình bán hàng/vận hành.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">CBR</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quy tắc Nghiệp vụ Chung (Common Business Rule) - Các quy định chung áp dụng cho nhiều chức năng.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">DB</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Cơ sở dữ liệu (Database) - Nơi lưu trữ thông tin có cấu trúc của hệ thống.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">MSG</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Thông báo (Message) - Các thông điệp hiển thị lên màn hình cảnh báo, báo lỗi hoặc báo thành công cho người dùng.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">UC</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Trường hợp Sử dụng (Use Case) - Mô tả các hành động tương tác giữa tác nhân người dùng và hệ thống.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">N/A</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Không áp dụng / Không có sẵn (Not Applicable / Not Available).</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">UI</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Giao diện Người dùng (User Interface).</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">SRS</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Tài liệu Đặc tả Yêu cầu Phần mềm (Software Requirements Specification).</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">TBD</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Sẽ được xác định thêm sau (To be determined).</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">OTP</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Mã xác thực một lần sử dụng bảo mật cao (One-Time Password) gửi qua SMS hoặc email.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">AI</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Trí tuệ nhân tạo (Artificial Intelligence) hỗ trợ tối ưu hóa và đưa ra gợi ý/dự báo trong hệ thống.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">JWT</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Mã định danh dạng chuỗi (JSON Web Token) dùng để xác thực và truyền tải thông tin an toàn giữa client và server.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">Bcrypt</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Thuật toán băm bảo mật (Bcrypt Hash) dùng để mã hóa mật khẩu người dùng trước khi lưu trữ vào cơ sở dữ liệu.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">API</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Giao diện lập trình ứng dụng (Application Programming Interface) định nghĩa cách các thành phần phần mềm tương tác với nhau.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">COD</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Thanh toán khi nhận hàng (Cash on Delivery) - Hình thức thanh toán bằng tiền mặt khi shipper giao hàng đến tay người mua.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">Real-time</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Thời gian thực (Real-time) - Cơ chế xử lý phản hồi dữ liệu lập tức mà không có độ trễ cảm nhận được.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">SKU</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Đơn vị phân loại hàng hóa (Stock Keeping Unit) - Mã ký tự dùng để quản lý và định danh chi tiết từng thuộc tính sản phẩm.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">Sentiment</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Phân tích thái độ/cảm xúc (Sentiment Analysis) - Thuật toán AI phân tích phản hồi của khách hàng để nhận diện tích cực/tiêu cực.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">VAT</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Thuế giá trị gia tăng (Value Added Tax) - Thuế tiêu dùng đánh trên giá trị tăng thêm của hàng hóa dịch vụ.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- BẢNG 3.11: DANH MỤC THÔNG BÁO HỆ THỐNG -->
    <div class="uc-container" id="uc-messages">
        <span class="uc-title">Bảng 3.11 - Danh mục các thông điệp thông báo hệ thống (Messages)</span>
        <button class="btn-copy" id="btn-uc-messages" onclick="copyTableToClipboard('table-uc-messages', 'btn-uc-messages')">Copy Bảng 3.11</button>
        <table id="table-uc-messages" style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 13pt; border: 1px solid #000000; margin-top: 10px;">
            <thead>
                <tr style="background-color: #d9e1f2; font-weight: bold;">
                    <td style="width: 15%; border: 1px solid #000000; padding: 8px 12px; text-align: center;">Mã thông báo (Code)</td>
                    <td style="width: 70%; border: 1px solid #000000; padding: 8px 12px; text-align: center;">Nội dung thông điệp hiển thị (Message Content)</td>
                    <td style="width: 15%; border: 1px solid #000000; padding: 8px 12px; text-align: center;">Nút bấm (Button)</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 1</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Trường dữ liệu này là bắt buộc. Bạn vui lòng nhập đầy đủ thông tin để tiếp tục thực hiện hành động.</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 2</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Tên đăng nhập hoặc mật khẩu của bạn có thể không chính xác. Vui lòng kiểm tra kỹ lại.</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 3</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Đăng nhập tài khoản thành công!</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 4</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Thông tin bạn vừa nhập không đúng định dạng yêu cầu. Vui lòng kiểm tra lại.</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 5</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Địa chỉ email này đã tồn tại trên hệ thống. Vui lòng sử dụng địa chỉ email khác.</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 6</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Số điện thoại này đã tồn tại trong hệ thống. Vui lòng sử dụng số điện thoại khác.</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 7</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Lưu trữ và cập nhật dữ liệu thành công!</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 8</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Kích thước của hình ảnh tải lên quá lớn. Bạn cần nén ảnh xuống thấp trước khi đăng tải.</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 9</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Thao tác thất bại do vi phạm ràng buộc cơ sở dữ liệu của hệ thống.</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 10</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Tên đăng nhập này đã tồn tại trên hệ thống. Vui lòng chọn một tên đăng nhập khác.</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 11</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Bạn có chắc chắn muốn xóa vĩnh viễn mục dữ liệu [item] này không?</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Yes/No</td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>"""

    # Write the compiled html
    with open(html_path, "w", encoding="utf-8") as f_out:
        f_out.write(html_content)
    print("Successfully built clean usecases_tables.html with 96 concise use cases!")

if __name__ == "__main__":
    main()
