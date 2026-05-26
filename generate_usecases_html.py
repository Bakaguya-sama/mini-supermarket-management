import os

usecases = [
    {
        "id": "uc-Bảng-3-1",
        "num": "Bảng 3.1: Đặc tả Use Case \"Đăng ký\"",
        "fields": [
            ("Tên Use Case", "Đăng ký."),
            ("Mô tả", "Cho phép người dùng mới (bao gồm bác sĩ hoặc bệnh nhân) tạo tài khoản trên hệ thống để bắt đầu sử dụng các dịch vụ y tế và quản lý sức khỏe."),
            ("Tác nhân", "Người dùng (Bác sĩ, Bệnh nhân)."),
            ("Điều kiện kích hoạt", "Người dùng nhấn vào nút hoặc liên kết Đăng ký trên giao diện của ứng dụng."),
            ("Yêu cầu trước khi thực hiện", "• Người dùng chưa có tài khoản đăng ký trên hệ thống.<br>• Người dùng có một địa chỉ email hoạt động và hợp lệ để nhận mã xác thực."),
            ("Yêu cầu sau khi thực hiện", "• Thông tin tài khoản mới của người dùng được lưu trữ vào hệ thống.<br>• Đối với bệnh nhân: Tài khoản được kích hoạt ngay sau khi xác thực email và bệnh nhân có thể đăng nhập trực tiếp.<br>• Đối với bác sĩ: Tài khoản ở trạng thái chờ phê duyệt từ phía quản trị viên trước khi có thể hoạt động."),
            ("Luồng sự kiện chính", "• 1. Người dùng chọn chức năng đăng ký trên giao diện chính của ứng dụng.<br>• 2. Hệ thống hiển thị biểu mẫu đăng ký yêu cầu người dùng chọn vai trò là bác sĩ hoặc bệnh nhân và điền các thông tin cá nhân bao gồm họ tên, địa chỉ email, số điện thoại, mật khẩu và xác nhận mật khẩu. Đối với bác sĩ, hệ thống yêu cầu tải thêm các giấy tờ chứng minh chuyên môn và chứng chỉ hành nghề.<br>• 3. Người dùng nhập đầy đủ thông tin cá nhân và nhấn nút xác nhận đăng ký.<br>• 4. Hệ thống kiểm tra tính hợp lệ của thông tin đã điền.<br>• 5. Hệ thống gửi một mã xác thực một lần qua email của người dùng.<br>• 6. Người dùng lấy mã xác thực từ email và nhập vào giao diện xác thực của hệ thống.<br>• 7. Hệ thống xác nhận mã xác thực chính xác.<br>• 8. Đối với bệnh nhân, hệ thống kích hoạt tài khoản ngay lập tức và thông báo đăng ký thành công. Đối với bác sĩ, hệ thống ghi nhận hồ sơ đăng ký vào danh sách chờ duyệt, gửi thông báo cho quản trị viên và yêu cầu bác sĩ chờ phản hồi phê duyệt."),
            ("Luồng sự kiện phụ", "• Nếu địa chỉ email hoặc số điện thoại đã tồn tại trên hệ thống, hệ thống hiển thị thông báo lỗi rằng thông tin đã được sử dụng và yêu cầu nhập lại.<br>• Nếu mật khẩu và xác nhận mật khẩu không trùng khớp, hệ thống hiển thị cảnh báo lỗi và yêu cầu người dùng kiểm tra lại mật khẩu.<br>• Nếu mã xác thực nhập vào không chính xác hoặc đã hết thời gian hiệu lực, hệ thống hiển thị thông báo lỗi tương ứng và yêu cầu nhập lại hoặc gửi lại mã mới.<br>• Nếu bác sĩ tải lên tệp tin giấy tờ chuyên môn không đúng định dạng hoặc vượt quá kích thước cho phép, hệ thống cảnh báo và yêu cầu tải lại tệp tin hợp lệ."),
            ("Yêu cầu phi chức năng", "• Thời gian xử lý kiểm tra thông tin và gửi email xác thực không quá 5 giây.<br>• Mã xác thực email chỉ có hiệu lực trong vòng 5 phút để đảm bảo an toàn.<br>• Mật khẩu của người dùng phải được mã hóa bảo mật trước khi lưu trữ vào cơ sở dữ liệu.")
        ]
    },
    {
        "id": "uc-Bảng-3-2",
        "num": "Bảng 3.2: Đặc tả Use Case \"Đăng nhập\"",
        "fields": [
            ("Tên Use Case", "Đăng nhập."),
            ("Mô tả", "Cho phép người dùng (bao gồm quản trị viên, bác sĩ hoặc bệnh nhân) đăng nhập vào hệ thống để thực hiện các chức năng tương ứng với quyền hạn của mình."),
            ("Tác nhân", "Người dùng (Quản trị viên, Bác sĩ, Bệnh nhân)."),
            ("Điều kiện kích hoạt", "Người dùng chọn chức năng Đăng nhập trên giao diện hệ thống."),
            ("Yêu cầu trước khi thực hiện", "• Người dùng đã có tài khoản hợp lệ đã được đăng ký và kích hoạt trên hệ thống."),
            ("Yêu cầu sau khi thực hiện", "• Người dùng đăng nhập thành công và được chuyển đến giao diện trang chủ hoặc bảng điều khiển phù hợp với vai trò của mình."),
            ("Luồng sự kiện chính", "• 1. Người dùng truy cập vào ứng dụng và nhấn nút Đăng nhập.<br>• 2. Hệ thống hiển thị giao diện đăng nhập yêu cầu nhập email và mật khẩu.<br>• 3. Người dùng nhập email và mật khẩu đã đăng ký, sau đó nhấn nút xác nhận đăng nhập.<br>• 4. Hệ thống tiến hành kiểm tra thông tin đăng nhập trong cơ sở dữ liệu và xác minh tính hợp lệ của tài khoản.<br>• 5. Hệ thống ghi nhận phiên đăng nhập hoạt động của người dùng, hiển thị thông báo đăng nhập thành công và tự động chuyển hướng người dùng đến giao diện trang chủ tương ứng với vai trò."),
            ("Luồng sự kiện phụ", "• Nếu email hoặc mật khẩu nhập vào không chính xác, hệ thống hiển thị thông báo lỗi rằng thông tin đăng nhập không hợp lệ và yêu cầu người dùng kiểm tra và nhập lại.<br>• Nếu tài khoản của người dùng đang bị khóa do vi phạm hoặc chưa được kích hoạt, hệ thống sẽ hiển thị thông báo từ chối truy cập cùng lý do tương ứng."),
            ("Yêu cầu phi chức năng", "• Thời gian xử lý đăng nhập và chuyển hướng trang không quá 5 giây.<br>• Bảo mật thông tin cá nhân và thông tin tài khoản theo đúng quy định.<br>• Phiên làm việc của người dùng tự động kết thúc hoặc yêu cầu đăng nhập lại sau một khoảng thời gian dài không tương tác.")
        ]
    },
    {
        "id": "uc-Bảng-3-3",
        "num": "Bảng 3.3: Đặc tả Use Case \"Đăng xuất\"",
        "fields": [
            ("Tên Use Case", "Đăng xuất."),
            ("Mô tả", "Cho phép người dùng (bao gồm quản trị viên, bác sĩ hoặc bệnh nhân) thoát khỏi tài khoản của mình trên hệ thống để bảo mật thông tin cá nhân."),
            ("Tác nhân", "Người dùng (Quản trị viên, Bác sĩ, Bệnh nhân)."),
            ("Điều kiện kích hoạt", "Người dùng bấm nút Đăng xuất trên giao diện hệ thống."),
            ("Yêu cầu trước khi thực hiện", "• Người dùng đang trong trạng thái đăng nhập thành công vào hệ thống."),
            ("Yêu cầu sau khi thực hiện", "• Phiên đăng nhập của người dùng bị hủy bỏ hoàn toàn trên hệ thống.<br>• Người dùng được chuyển về màn hình đăng nhập của ứng dụng và không thể thực hiện các thao tác yêu cầu quyền truy cập nếu chưa đăng nhập lại."),
            ("Luồng sự kiện chính", "• 1. Người dùng đang ở trong phiên đăng nhập và bấm vào nút Đăng xuất trên giao diện hệ thống.<br>• 2. Hệ thống hiển thị hộp thoại yêu cầu người dùng xác nhận hành động đăng xuất.<br>• 3. Người dùng nhấn nút xác nhận đồng ý đăng xuất.<br>• 4. Hệ thống tiến hành hủy bỏ phiên đăng nhập hiện tại, xóa bỏ các thông tin xác thực lưu trữ tạm thời của tài khoản.<br>• 5. Hệ thống hiển thị thông báo đăng xuất thành công và tự động chuyển hướng người dùng về trang đăng nhập."),
            ("Luồng sự kiện phụ", "• Nếu xảy ra lỗi hệ thống hoặc sự cố mạng trong quá trình thực hiện đăng xuất, hệ thống sẽ tự động hủy phiên khi người dùng rời khỏi trang hoặc tải lại trang."),
            ("Yêu cầu phi chức năng", "• Thời gian xử lý đăng xuất không quá 5 giây.<br>• Bảo mật tuyệt đối thông tin phiên làm việc, đảm bảo không thể khôi phục lại phiên cũ sau khi đã đăng xuất.")
        ]
    },
    {
        "id": "uc-Bảng-3-4",
        "num": "Bảng 3.4: Đặc tả Use Case \"Quên mật khẩu\"",
        "fields": [
            ("Tên Use Case", "Quên mật khẩu."),
            ("Mô tả", "Cho phép người dùng khôi phục lại mật khẩu truy cập hệ thống thông qua cơ chế xác thực bằng email đã đăng ký và mã xác thực một lần để đảm bảo an toàn tài khoản."),
            ("Tác nhân", "Người dùng (Quản trị viên, Bác sĩ, Bệnh nhân)."),
            ("Điều kiện kích hoạt", "Người dùng chọn chức năng Quên mật khẩu trên giao diện đăng nhập."),
            ("Yêu cầu trước khi thực hiện", "• Người dùng đã có tài khoản hợp lệ đã được đăng ký trên hệ thống."),
            ("Yêu cầu sau khi thực hiện", "• Mật khẩu của người dùng được cập nhật mới thành công.<br>• Người dùng có thể đăng nhập lại vào hệ thống bằng mật khẩu mới vừa tạo."),
            ("Luồng sự kiện chính", "• 1. Người dùng nhấn chọn chức năng Quên mật khẩu tại giao diện đăng nhập.<br>• 2. Hệ thống hiển thị biểu mẫu yêu cầu người dùng cung cấp địa chỉ email đã đăng ký.<br>• 3. Người dùng nhập địa chỉ email của mình và nhấn nút gửi yêu cầu.<br>• 4. Hệ thống kiểm tra tính tồn tại của email trong cơ sở dữ liệu.<br>• 5. Hệ thống tự động tạo và gửi một mã xác thực một lần qua email của người dùng.<br>• 6. Người dùng lấy mã xác thực từ email và nhập mã này vào biểu mẫu xác minh trên giao diện hệ thống.<br>• 7. Hệ thống hiển thị giao diện để người dùng thiết lập mật khẩu mới, yêu cầu nhập mật khẩu mới và xác nhận mật khẩu mới.<br>• 8. Người dùng nhập mật khẩu mới cùng xác nhận trùng khớp và nhấn nút lưu lại.<br>• 9. Hệ thống xác thực mã xác thực, cập nhật mật khẩu mới của người dùng vào cơ sở dữ liệu và hiển thị thông báo cập nhật mật khẩu thành công."),
            ("Luồng sự kiện phụ", "• Nếu email người dùng nhập không tồn tại trong hệ thống, hệ thống hiển thị thông báo lỗi email không tồn tại và yêu cầu kiểm tra lại.<br>• Nếu mã xác thực nhập vào bị sai hoặc đã hết thời gian hiệu lực, hệ thống hiển thị thông báo lỗi tương ứng và yêu cầu nhập lại hoặc gửi lại mã mới.<br>• Nếu mật khẩu mới nhập vào không trùng khớp với mật khẩu xác nhận, hệ thống hiển thị thông báo yêu cầu nhập lại chính xác."),
            ("Yêu cầu phi chức năng", "• Thời gian gửi mã xác thực qua email và lưu thông tin mật khẩu mới không quá 5 giây.<br>• Mã xác thực gửi qua email có thời hạn hiệu lực tối đa là 5 phút để bảo mật.<br>• Mật khẩu mới thiết lập phải tuân thủ các quy tắc về độ dài và độ an toàn bảo mật.")
        ]
    },
    {
        "id": "uc-Bảng-3-5",
        "num": "Bảng 3.5: Đặc tả Use Case \"Thống kê của quản trị viên\"",
        "fields": [
            ("Tên Use Case", "Thống kê của quản trị viên."),
            ("Mô tả", "Cho phép quản trị viên theo dõi tổng quan tình hình hoạt động của toàn bộ hệ thống thông qua các số liệu thống kê về người dùng, tốc độ tăng trưởng thành viên và các biểu đồ trực quan để phục vụ việc quản lý."),
            ("Tác nhân", "Quản trị viên."),
            ("Điều kiện kích hoạt", "Quản trị viên đã đăng nhập hệ thống và chọn chức năng Thống kê trên menu quản trị."),
            ("Yêu cầu trước khi thực hiện", "• Quản trị viên đã đăng nhập thành công và có quyền truy cập vào chức năng thống kê của hệ thống."),
            ("Yêu cầu sau khi thực hiện", "• Các dữ liệu thống kê, báo cáo và biểu đồ hoạt động được hiển thị đầy đủ, chính xác trên màn hình."),
            ("Luồng sự kiện chính", "• 1. Quản trị viên truy cập vào trang thống kê của bảng điều khiển.<br>• 2. Hệ thống tiếp nhận yêu cầu và tiến hành tổng hợp, truy vấn dữ liệu từ các danh mục người dùng, lượt tư vấn và lịch sử hoạt động.<br>• 3. Hệ thống hiển thị các số liệu tổng quan lên màn hình bao gồm tổng số lượng tài khoản bệnh nhân, tổng số lượng tài khoản bác sĩ, tỷ lệ tăng trưởng người dùng mới theo tuần hoặc tháng.<br>• 4. Hệ thống vẽ và hiển thị các biểu đồ trực quan mô tả xu hướng đăng ký mới, số ca tư vấn y tế đã thực hiện.<br>• 5. Quản trị viên có thể tùy chỉnh bộ lọc thời gian để xem thống kê theo các mốc thời gian cụ thể và hệ thống sẽ tự động cập nhật lại dữ liệu hiển thị."),
            ("Luồng sự kiện phụ", "• Nếu xảy ra lỗi trong quá trình truy xuất dữ liệu từ máy chủ hoặc chưa có dữ liệu thống kê, hệ thống hiển thị thông báo lỗi tải dữ liệu và cung cấp nút bấm để yêu cầu quản trị viên tải lại trang."),
            ("Yêu cầu phi chức năng", "• Thời gian xử lý truy vấn dữ liệu phức tạp và vẽ biểu đồ không vượt quá 5 giây.<br>• Dữ liệu hiển thị phải đảm bảo tính chính xác cao và được cập nhật liên tục từ cơ sở dữ liệu.<br>• Giao diện biểu đồ hiển thị cần sinh động, rõ ràng và thân thiện với người dùng.")
        ]
    },
    {
        "id": "uc-Bảng-3-6",
        "num": "Bảng 3.6: Đặc tả Use Case \"Quản lý người dùng của quản trị viên\"",
        "fields": [
            ("Tên Use Case", "Quản lý người dùng."),
            ("Mô tả", "Cho phép quản trị viên thực hiện quản lý danh sách tài khoản người dùng, xem thông tin chi tiết, phê duyệt hoặc từ chối đơn đăng ký làm bác sĩ, khóa hoặc mở khóa tài khoản người dùng vi phạm và xem danh sách báo cáo phản hồi từ bệnh nhân."),
            ("Tác nhân", "Quản trị viên."),
            ("Điều kiện kích hoạt", "Quản trị viên đăng nhập hệ thống và chọn chức năng Quản lý người dùng."),
            ("Yêu cầu trước khi thực hiện", "• Quản trị viên đã đăng nhập thành công vào hệ thống và có quyền quản lý người dùng."),
            ("Yêu cầu sau khi thực hiện", "• Thông tin người dùng được quản trị viên nắm bắt đầy đủ.<br>• Trạng thái tài khoản người dùng (hoạt động hoặc bị khóa) được cập nhật chính xác trong cơ sở dữ liệu.<br>• Đơn đăng ký hành nghề của bác sĩ được xử lý thành công (chấp nhận hoặc từ chối)."),
            ("Luồng sự kiện chính", "• 1. Quản trị viên truy cập trang quản lý người dùng.<br>• 2. Quản trị viên chọn một trong ba mục: Danh sách tài khoản, Xét duyệt đơn đăng ký, hoặc Báo cáo.<br>• 3. Đối với Danh sách tài khoản: Hệ thống hiển thị danh sách người dùng trong hệ thống. Quản trị viên chọn một người dùng để xem thông tin chi tiết (họ tên, email, trạng thái tài khoản) hoặc xem phản hồi của bệnh nhân dành cho bác sĩ đó. Quản trị viên thực hiện thao tác khóa hoặc mở khóa tài khoản. Hệ thống cập nhật trạng thái tài khoản và thông báo kết quả.<br>• 4. Đối với Báo cáo: Hệ thống hiển thị danh sách các đơn báo cáo phản hồi từ bệnh nhân. Quản trị viên chọn một đơn báo cáo để xem chi tiết nội dung.<br>• 5. Đối với Xét duyệt đơn đăng ký: Quản trị viên chọn mục “Đơn xét duyệt”. Hệ thống hiển thị danh sách các đơn đăng ký của bác sĩ. Quản trị viên chọn một đơn đăng ký để xem thông tin cá nhân và tài liệu chuyên môn. Quản trị viên nhấn nút chấp nhận hoặc từ chối. Hệ thống cập nhật trạng thái tài khoản bác sĩ tương ứng và gửi thông báo kết quả cho bác sĩ."),
            ("Luồng sự kiện phụ", "• Nếu không tìm thấy thông tin người dùng hoặc xảy ra lỗi trong quá trình cập nhật trạng thái tài khoản, hệ thống hiển thị thông báo lỗi cập nhật thất bại và giữ nguyên trạng thái cũ."),
            ("Yêu cầu phi chức năng", "• Thời gian xử lý cập nhật trạng thái và lưu thông tin phê duyệt không quá 5 giây.<br>• Dữ liệu cá nhân và các giấy tờ chuyên môn của bác sĩ phải được bảo mật tuyệt đối.<br>• Hệ thống đảm bảo tính chính xác và toàn vẹn dữ liệu khi thực hiện các thao tác.")
        ]
    },
    {
        "id": "uc-Bảng-3-7",
        "num": "Bảng 3.7: Đặc tả Use Case \"Quản lý hệ thống AI của quản trị viên\"",
        "fields": [
            ("Tên Use Case", "Quản lý hệ thống AI."),
            ("Mô tả", "Cho phép quản trị viên nạp hoặc gỡ bỏ các tài liệu y khoa chuẩn để làm cơ sở dữ liệu tri thức cho trợ lý trí tuệ nhân tạo, đồng thời chỉnh sửa danh sách các từ ngữ nguy hiểm, nhạy cảm dùng để kiểm duyệt nội dung chat."),
            ("Tác nhân", "Quản trị viên."),
            ("Điều kiện kích hoạt", "Quản trị viên đăng nhập hệ thống và truy cập chức năng Quản lý hệ thống AI."),
            ("Yêu cầu trước khi thực hiện", "• Quản trị viên đã đăng nhập thành công và có quyền quản lý cấu hình trí tuệ nhân tạo."),
            ("Yêu cầu sau khi thực hiện", "• Danh sách tài liệu y khoa tri thức và danh sách từ ngữ nguy hiểm được cập nhật chính xác trong cơ sở dữ liệu của hệ thống trí tuệ nhân tạo."),
            ("Luồng sự kiện chính", "• 1. Quản trị viên truy cập trang quản lý hệ thống AI.<br>• 2. Quản trị viên chọn một trong hai mục: Tài liệu y khoa hoặc Chỉnh sửa từ ngữ nguy hiểm.<br>• 3. Đối với Tài liệu y khoa: Hệ thống hiển thị danh sách các tài liệu y khoa chuẩn hiện có. Quản trị viên có thể xem chi tiết tài liệu, chọn tải lên tài liệu y học định dạng văn bản mới hoặc chọn gỡ bỏ tài liệu cũ. Hệ thống tiến cập nhật kho tri thức y học cho trí tuệ nhân tạo và thông báo cập nhật thành công.<br>• 4. Đối với Chỉnh sửa từ ngữ nguy hiểm: Hệ thống hiển thị danh sách các từ ngữ nhạy cảm, từ cấm dùng để kiểm duyệt tin nhắn trong cuộc trò chuyện. Quản trị viên thêm từ ngữ mới, sửa đổi hoặc xóa bớt từ ngữ trong danh sách. Hệ thống lưu trữ danh sách từ cấm mới và thông báo cập nhật thành công."),
            ("Luồng sự kiện phụ", "• Nếu tài liệu tải lên không đúng định dạng quy định hoặc xảy ra lỗi lưu trữ, hệ thống hiển thị thông báo lỗi chi tiết và yêu cầu kiểm tra lại tệp tin.<br>• Nếu xảy ra lỗi kết nối cơ sở dữ liệu trong lúc cập nhật từ ngữ nguy hiểm, hệ thống hiển thị thông báo cập nhật thất bại và giữ nguyên danh sách cũ."),
            ("Yêu cầu phi chức năng", "• Thời gian xử lý nạp tài liệu hoặc lưu danh sách từ cấm không quá 5 giây.<br>• Hệ thống trí tuệ nhân tạo phải cập nhật dữ liệu tri thức mới nạp một cách đồng bộ.")
        ]
    },
    {
        "id": "uc-Bảng-3-8",
        "num": "Bảng 3.8: Đặc tả Use Case \"Tư vấn bệnh nhân của bác sĩ\"",
        "fields": [
            ("Tên Use Case", "Tư vấn bệnh nhân."),
            ("Mô tả", "Cho phép bác sĩ tiếp nhận yêu cầu tư vấn y tế từ hàng đợi của bệnh nhân, xem hồ sơ sức khỏe của họ và tiến hành trò chuyện tư vấn trực tiếp theo thời gian thực."),
            ("Tác nhân", "Bác sĩ."),
            ("Điều kiện kích hoạt", "Bác sĩ đăng nhập vào hệ thống và chọn chức năng tư vấn bệnh nhân."),
            ("Yêu cầu trước khi thực hiện", "• Bác sĩ đã đăng nhập thành công và có quyền tư vấn y tế.<br>• Tài khoản bác sĩ đang ở trạng thái trực tuyến."),
            ("Yêu cầu sau khi thực hiện", "• Phiên tư vấn được bắt đầu và kết thúc thành công.<br>• Ghi chú và lời khuyên y tế của bác sĩ được lưu trữ vào lịch sử sức khỏe của bệnh nhân."),
            ("Luồng sự kiện chính", "• 1. Bác sĩ truy cập vào mục tư vấn.<br>• 2. Hệ thống hiển thị danh sách các cuộc tư vấn do bệnh nhân gửi yêu cầu đang nằm trong hàng đợi.<br>• 3. Bác sĩ chọn một yêu cầu và nhấn nút “Tiếp nhận”.<br>• 4. Hệ thống hiển thị giao diện trò chuyện trực tiếp giữa bác sĩ và bệnh nhân, đồng thời hiển thị hồ sơ sức khỏe cá nhân của bệnh nhân đó bên cạnh màn hình.<br>• 5. Bác sĩ và bệnh nhân tiến hành nhắn tin trao đổi thông tin y tế qua lại theo thời gian thực.<br>• 6. Sau khi hoàn thành quá trình tư vấn, bác sĩ nhấn nút Kết thúc tư vấn.<br>• 7. Hệ thống hiển thị biểu mẫu yêu cầu bác sĩ nhập ghi chú bệnh án và lời khuyên y tế dành cho bệnh nhân.<br>• 8. Bác sĩ nhập nội dung lời khuyên, sau đó nhấn nút Lưu. Hệ thống lưu trữ toàn bộ lịch sử cuộc trò chuyện và lời khuyên của bác sĩ, đóng phòng chat và chuyển trạng thái cuộc tư vấn thành đã kết thúc."),
            ("Luồng sự kiện phụ", "• Nếu bệnh nhân đột ngột bị mất kết nối mạng, hệ thống hiển thị cảnh báo bệnh nhân đã ngoại tuyến. Bác sĩ có thể lựa chọn chờ đợi bệnh nhân kết nối lại hoặc nhấn nút Kết thúc tư vấn để nhập lời khuyên ngay.<br>• Nếu xảy ra lỗi trong quá trình gửi tin nhắn, hệ thống hiển thị biểu tượng cảnh báo lỗi bên cạnh tin nhắn và cho phép bác sĩ nhấn nút gửi lại tin nhắn đó."),
            ("Yêu cầu phi chức năng", "• Độ trễ truyền tải tin nhắn giữa bác sĩ và bệnh nhân dưới 1 giây để đảm bảo trải nghiệm.<br>• Thông tin bệnh án và nội dung chat của bệnh nhân phải được bảo mật và mã hóa.")
        ]
    },
    {
        "id": "uc-Bảng-3-9",
        "num": "Bảng 3.9: Đặc tả Use Case \"Quản lý cá nhân của bác sĩ\"",
        "fields": [
            ("Tên Use Case", "Quản lý cá nhân."),
            ("Mô tả", "Cho phép bác sĩ theo dõi các chỉ số thống kê về hiệu suất làm việc cá nhân bao gồm số ca tư vấn thành công, các đánh giá nhận xét từ bệnh nhân, điểm số đánh giá trung bình và cập nhật trạng thái hoạt động trực tuyến hoặc ngoại tuyến."),
            ("Tác nhân", "Bác sĩ."),
            ("Điều kiện kích hoạt", "Bác sĩ đã đăng nhập vào hệ thống và truy cập trang chủ cá nhân."),
            ("Yêu cầu trước khi thực hiện", "• Bác sĩ đã đăng nhập thành công vào hệ thống và có quyền quản lý cá nhân."),
            ("Yêu cầu sau khi thực hiện", "• Các số liệu thống kê cá nhân được hiển thị đầy đủ.<br>• Trạng thái hoạt động (Trực tuyến hoặc Ngoại tuyến) của bác sĩ được cập nhật chính xác trong hệ thống."),
            ("Luồng sự kiện chính", "• 1. Bác sĩ truy cập vào trang chủ dành riêng cho bác sĩ.<br>• 2. Hệ thống hiển thị các số liệu thống kê hiệu suất làm việc của bác sĩ bao gồm tổng số ca tư vấn đã hoàn thành, danh sách các đánh giá từ bệnh nhân, số sao trung bình nhận được và biểu đồ số lượng ca tư vấn theo mốc thời gian.<br>• 3. Bác sĩ thực hiện thao tác trên nút chuyển đổi trạng thái hoạt động để thay đổi giữa trạng thái Trực tuyến (sẵn sàng tiếp nhận bệnh nhân) và Ngoại tuyến (nghỉ ngơi).<br>• 4. Hệ thống ghi nhận trạng thái mới của bác sĩ vào cơ sở dữ liệu để điều phối và hiển thị danh sách bác sĩ trực tuyến phù hợp cho bệnh nhân."),
            ("Luồng sự kiện phụ", "• Nếu xảy ra lỗi kết nối mạng khiến hệ thống không thể tải dữ liệu thống kê từ máy chủ, hệ thống hiển thị thông báo lỗi tải dữ liệu và hiển thị nút yêu cầu bác sĩ nhấn để tải lại trang."),
            ("Yêu cầu phi chức năng", "• Thời gian xử lý và hiển thị thông tin thống kê không quá 5 giây.<br>• Đảm bảo tính cập nhật thời gian thực đối với trạng thái hoạt động trực tuyến/ngoại tuyến của bác sĩ.<br>• Giao diện hiển thị trực quan và rõ ràng hỗ trợ bác sĩ phân tích hiệu suất làm việc.")
        ]
    },
    {
        "id": "uc-Bảng-3-10",
        "num": "Bảng 3.10: Đặc tả Use Case \"Quản lý hồ sơ sức khoẻ của bệnh nhân\"",
        "fields": [
            ("Tên Use Case", "Quản lý hồ sơ sức khỏe."),
            ("Mô tả", "Cho phép bệnh nhân cập nhật các thông tin sức khỏe cá nhân, các chỉ số sinh tồn và theo dõi xu hướng các chỉ số này thông qua các biểu đồ thống kê trực quan, đồng thời nhận thông báo cảnh báo nếu có chỉ số bất thường."),
            ("Tác nhân", "Bệnh nhân."),
            ("Điều kiện kích hoạt", "Bệnh nhân đã đăng nhập vào hệ thống và truy cập chức năng hồ sơ sức khỏe cá nhân."),
            ("Yêu cầu trước khi thực hiện", "• Bệnh nhân đã đăng nhập thành công vào hệ thống và có quyền truy cập quản lý hồ sơ sức khỏe."),
            ("Yêu cầu sau khi thực hiện", "• Thông tin sức khỏe và chỉ số sinh tồn được cập nhật thành công.<br>• Biểu đồ theo dõi sức khỏe hiển thị trực quan và hệ thống gửi cảnh báo sức khỏe nếu phát hiện chỉ số bất thường."),
            ("Luồng sự kiện chính", "• 1. Bệnh nhân truy cập mục hồ sơ sức khỏe cá nhân trên ứng dụng.<br>• 2. Hệ thống hiển thị các số liệu và biểu đồ theo dõi các chỉ số sức khỏe tổng quan (như huyết áp, nhịp tim, chiều cao, cân nặng).<br>• 3. Bệnh nhân chọn chức năng cập nhật thông tin và nhập các chỉ số sức khỏe mới của bản thân.<br>• 4. Hệ thống kiểm tra tính hợp lệ của dữ liệu nhập và tiến hành cập nhật vào cơ sở dữ liệu hồ sơ sức khỏe.<br>• 5. Hệ thống phân tích chỉ số vừa nhập. Nếu phát hiện chỉ số nằm ngoài ngưỡng an toàn sinh lý bình thường, hệ thống tự động tạo và gửi cảnh báo sức khỏe hiển thị trên màn hình chính của bệnh nhân cùng các lời khuyên sơ bộ."),
            ("Luồng sự kiện phụ", "• Nếu bệnh nhân nhập dữ liệu sai định dạng (như nhập chữ vào trường số đo huyết áp), hệ thống hiển thị cảnh báo lỗi định dạng và yêu cầu nhập lại thông tin chính xác.<br>• Nếu xảy ra lỗi kết nối cơ sở dữ liệu khi đang lưu chỉ số, hệ thống hiển thị thông báo lỗi cập nhật thất bại và yêu cầu bệnh nhân ấn nút tải lại trang."),
            ("Yêu cầu phi chức năng", "• Thời gian lưu trữ dữ liệu và hiển thị biểu đồ không quá 5 giây.<br>• Dữ liệu sức khỏe cá nhân của bệnh nhân phải được bảo mật tuyệt đối.<br>• Giao diện biểu diễn dữ liệu dưới dạng đồ thị cần dễ hiểu và dễ theo dõi.")
        ]
    },
    {
        "id": "uc-Bảng-3-11",
        "num": "Bảng 3.11: Đặc tả Use Case \"Tư vấn sức khoẻ với AI của bệnh nhân\"",
        "fields": [
            ("Tên Use Case", "Tư vấn sức khỏe với AI."),
            ("Mô tả", "Cho phép bệnh nhân thực hiện trò chuyện, đặt câu hỏi về các vấn đề sức khỏe với trợ lý trí tuệ nhân tạo để nhận được các tư vấn và lời khuyên y học sơ bộ hữu ích."),
            ("Tác nhân", "Bệnh nhân."),
            ("Điều kiện kích hoạt", "Bệnh nhân đã đăng nhập vào hệ thống và truy cập chức năng \"Chat với AI\"."),
            ("Yêu cầu trước khi thực hiện", "• Bệnh nhân đã đăng nhập thành công vào hệ thống và có quyền sử dụng chức năng chat với AI."),
            ("Yêu cầu sau khi thực hiện", "• Bệnh nhân nhận được phản hồi tư vấn sức khỏe từ trí tuệ nhân tạo dựa trên các tài liệu y khoa chuẩn."),
            ("Luồng sự kiện chính", "• 1. Bệnh nhân chọn chức năng “Chat với AI” trên giao diện màn hình chính.<br>• 2. Hệ thống mở cửa sổ trò chuyện với trợ lý trí tuệ nhân tạo.<br>• 3. Bệnh nhân nhập tin nhắn văn bản hỏi về các triệu chứng hoặc vấn đề sức khỏe, có thể đính kèm thêm hình ảnh minh họa và nhấn gửi.<br>• 4. Trí tuệ nhân tạo của hệ thống tiếp nhận câu hỏi, thực hiện tra cứu kho tri thức y khoa chuẩn và phân tích nội dung để đưa ra phản hồi tư vấn y tế phù hợp.<br>• 5. Phản hồi của trí tuệ nhân tạo được hiển thị trên màn hình trò chuyện của bệnh nhân.<br>• 6. Trong quá trình trò chuyện, bệnh nhân có thể chọn chức năng gửi phản hồi/khiếu nại về chất lượng tư vấn của trí tuệ nhân tạo để hệ thống cải tiến.<br>• 7. Khi kết thúc cuộc trò chuyện, bệnh nhân nhấn nút \"Thoát cuộc trò chuyện\" để quay lại màn hình chính của ứng dụng."),
            ("Luồng sự kiện phụ", "• Nếu tin nhắn gửi đi có chứa các từ ngữ nguy hiểm hoặc vi phạm nguyên tắc cộng đồng, hệ thống sẽ chặn không cho gửi tin nhắn và hiển thị thông báo cảnh báo người dùng.<br>• Nếu xảy ra lỗi kết nối với máy chủ trí tuệ nhân tạo, hệ thống hiển thị thông báo lỗi mất kết nối và hiển thị nút yêu cầu bệnh nhân tải lại trang chat."),
            ("Yêu cầu phi chức năng", "• Phản hồi từ trợ lý trí tuệ nhân tạo được sinh ra và hiển thị trong vòng 5 giây sau khi bệnh nhân gửi câu hỏi.<br>• Đảm bảo tính riêng tư và bảo mật tuyệt đối của toàn bộ nội dung trò chuyện y tế.")
        ]
    },
    {
        "id": "uc-Bảng-3-12",
        "num": "Bảng 3.12: Đặc tả Use Case \"Tư vấn sức khoẻ với bác sĩ của bệnh nhân\"",
        "fields": [
            ("Tên Use Case", "Tư vấn sức khỏe với bác sĩ."),
            ("Mô tả", "Cho phép bệnh nhân tìm kiếm và lựa chọn bác sĩ từ danh sách theo chuyên khoa, gửi yêu cầu tư vấn y tế, tham gia cuộc trò chuyện trực tiếp để nhận tư vấn, đánh giá chất lượng phục vụ của bác sĩ và xem lại lịch sử các phiên tư vấn."),
            ("Tác nhân", "Bệnh nhân."),
            ("Điều kiện kích hoạt", "Bệnh nhân đăng nhập vào hệ thống và truy cập mục tư vấn sức khỏe với bác sĩ."),
            ("Yêu cầu trước khi thực hiện", "• Bệnh nhân đã đăng nhập thành công vào hệ thống và có quyền yêu cầu tư vấn y tế từ bác sĩ."),
            ("Yêu cầu sau khi thực hiện", "• Phiên tư vấn trực tiếp được hoàn thành và được lưu trữ vào lịch sử hệ thống.<br>• Đánh giá chất lượng của bệnh nhân dành cho bác sĩ được ghi nhận thành công."),
            ("Luồng sự kiện chính", "• 1. Bệnh nhân chọn chức năng “Tư vấn với bác sĩ”.<br>• 2. Hệ thống hiển thị giao diện gồm hai mục chính: Khởi tạo phiên tư vấn mới và Lịch sử tư vấn.<br>• 3. Đối với Khởi tạo phiên tư vấn mới: Bệnh nhân duyệt danh sách bác sĩ hoặc tìm kiếm theo bộ lọc chuyên khoa (như Da liễu, Tim mạch, Nội tiết). Bệnh nhân nhấn chọn một bác sĩ để xem hồ sơ chi tiết. Bệnh nhân nhập tiêu đề câu hỏi y tế và nhấn nút \"Bắt đầu trò chuyện\". Hệ thống đưa yêu cầu vào hàng đợi của bác sĩ và chờ phản hồi tiếp nhận. Sau khi bác sĩ tiếp nhận, hệ thống mở cửa sổ chat trực tiếp và hai bên tiến hành nhắn tin trao đổi sức khỏe thời gian thực.<br>• 4. Đối với Lịch sử tư vấn: Bệnh nhân chọn xem danh sách các phiên tư vấn trong quá khứ. Bệnh nhân có thể nhấn chọn một cuộc tư vấn để đọc lại nội dung tin nhắn và ghi chú, lời khuyên của bác sĩ. Nếu phiên tư vấn đang diễn ra, bệnh nhân có thể tiếp tục trò chuyện.<br>• 5. Khi hoàn thành quá trình tư vấn, bác sĩ hoặc bệnh nhân nhấn nút Kết thúc.<br>• 6. Hệ thống đóng khung chat và hiển thị biểu mẫu yêu cầu bệnh nhân đánh giá chất lượng tư vấn từ 1 đến 5 sao kèm nhận xét.<br>• 7. Bệnh nhân gửi đánh giá, hệ thống lưu trữ đánh giá, cập nhật trạng thái phiên tư vấn thành đã kết thúc và cập nhật điểm đánh giá trung bình của bác sĩ."),
            ("Luồng sự kiện phụ", "• Nếu không có bác sĩ nào đang trực tuyến hoặc phù hợp với bộ lọc chuyên khoa, hệ thống hiển thị thông báo hiện không có bác sĩ phù hợp và gợi ý bệnh nhân sử dụng trợ lý trí tuệ nhân tạo để được hỗ trợ sơ bộ.<br>• Nếu bác sĩ đột ngột ngoại tuyến trong phiên trò chuyện đang diễn ra, hệ thống hiển thị thông báo bác sĩ hiện đang ngoại tuyến, vui lòng để lại tin nhắn và bác sĩ sẽ phản hồi sau.<br>• Nếu xảy ra lỗi kết nối trong khi nhắn tin, hệ thống hiển thị cảnh báo mất kết nối mạng và yêu cầu tải lại trang."),
            ("Yêu cầu phi chức năng", "• Thời gian tải danh sách bác sĩ và lịch sử trò chuyện không quá 3 giây.<br>• Tốc độ truyền tải tin nhắn trong phòng chat thời gian thực dưới 1 giây.<br>• Toàn bộ dữ liệu tin nhắn tư vấn y tế phải được mã hóa bảo mật.")
        ]
    }
]

def generate_html():
    html_content = """<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Đặc tả chi tiết toàn bộ Use Case hệ thống Y tế</title>
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
    <h1>Mô tả đặc tả chi tiết các Use Case hệ thống Y tế (Cỡ chữ 13pt - Sẵn sàng Copy vào Word)</h1>

    <div class="instruction">
        <strong>💡 Cách copy cực nhanh vào Microsoft Word (Giữ nguyên định dạng, bảng biểu, cỡ chữ 13pt):</strong><br>
        1. Bấm nút <strong>"Copy Bảng"</strong> màu xanh ở phía trên bên phải của bảng cần copy.<br>
        2. Mở tài liệu Word của bạn, đặt con trỏ chuột vào nơi cần dán và nhấn <strong>Ctrl + V</strong>.<br>
        3. Bảng sẽ tự động được dán vào Word với định dạng viền đen chuẩn, cột bên trái tô màu xanh nhạt và cỡ chữ 13pt
        chuẩn Times New Roman như ảnh mẫu!
    </div>

    <div class="selector-box">
        <label for="uc-selector" style="font-weight: bold; display: block; margin-bottom: 5px;">Chọn nhanh để xem:</label>
        <select id="uc-selector" onchange="scrollToUseCase()">
            <option value="">-- Chọn Bảng --</option>
"""
    for uc in usecases:
        html_content += f'            <option value="{uc["id"]}">{uc["num"]}</option>\n'
        
    html_content += """            <option value="uc-matrix">Bảng 3.13: Ma trận phân quyền truy cập (Actor Matrix)</option>
            <option value="uc-nfr">Bảng 3.14: Yêu cầu phi chức năng</option>
            <option value="uc-deploy">Bảng 3.15: Yêu cầu triển khai hệ thống</option>
            <option value="uc-archive">Bảng 3.16 & 3.17: Yêu cầu Lưu trữ & Kiểm toán</option>
            <option value="uc-sites">Bảng 3.18: Các phân hệ hệ thống (Sites)</option>
            <option value="uc-lists">Bảng 3.19: Các danh mục dữ liệu chính (Lists)</option>
            <option value="uc-glossary">Bảng 3.20: Thuật ngữ viết tắt (Glossary)</option>
            <option value="uc-messages">Bảng 3.21: Danh mục thông báo hệ thống (Messages)</option>
        </select>
    </div>
"""

    for uc in usecases:
        table_id = f"table-{uc['id']}"
        btn_id = f"btn-{uc['id']}"
        
        html_content += f'    <div class="uc-container" id="{uc["id"]}">\n'
        html_content += f'        <span class="uc-title">{uc["num"]}</span>\n'
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

    # BẢNG 3.13: MA TRẬN PHÂN QUYỀN TRUY CẬP
    html_content += """    <div class="uc-container" id="uc-matrix">
        <span class="uc-title">Bảng 3.13 - Ma trận phân quyền truy cập người dùng (User Access and Security Matrix)</span>
        <button class="btn-copy" id="btn-uc-matrix" onclick="copyTableToClipboard('table-uc-matrix', 'btn-uc-matrix')">Copy Bảng 3.13</button>
        <table id="table-uc-matrix" style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 13pt; border: 1px solid #000000; margin-top: 10px;">
            <thead>
                <tr style="background-color: #d9e1f2; font-weight: bold;">
                    <td style="width: 40%; border: 1px solid #000000; padding: 8px 12px; text-align: center; vertical-align: middle;">Chức năng (Function)</td>
                    <td style="width: 20%; border: 1px solid #000000; padding: 8px 12px; text-align: center; vertical-align: middle;">Quản trị viên<br>(Admin)</td>
                    <td style="width: 20%; border: 1px solid #000000; padding: 8px 12px; text-align: center; vertical-align: middle;">Bác sĩ<br>(Doctor)</td>
                    <td style="width: 20%; border: 1px solid #000000; padding: 8px 12px; text-align: center; vertical-align: middle;">Bệnh nhân<br>(Patient)</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Đăng ký (Sign Up)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Đăng nhập / Đăng xuất / Quên mật khẩu</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Xem số liệu thống kê hệ thống (Admin Dashboard)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Quản lý tài khoản, phê duyệt bác sĩ và khóa người dùng</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Quản lý tri thức y khoa và từ cấm của AI</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Tiếp nhận và thực hiện tư vấn bệnh nhân</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Quản lý hiệu suất cá nhân & Trạng thái làm việc</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Xem hồ sơ sức khỏe và cập nhật chỉ số sinh tồn</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Tư vấn sức khỏe trực tuyến với AI</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Tìm kiếm bác sĩ, yêu cầu tư vấn và đánh giá</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;"></td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">X</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- BẢNG 3.14: YÊU CẦU PHI CHỨC NĂNG -->
    <div class="uc-container" id="uc-nfr">
        <span class="uc-title">Bảng 3.14 - Đặc tả Yêu cầu phi chức năng (Non-Functional Requirements)</span>
        <button class="btn-copy" id="btn-uc-nfr" onclick="copyTableToClipboard('table-uc-nfr', 'btn-uc-nfr')">Copy Bảng 3.14</button>
        <table id="table-uc-nfr" style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 13pt; border: 1px solid #000000; margin-top: 10px;">
            <thead>
                <tr style="background-color: #d9e1f2; font-weight: bold;">
                    <td style="width: 30%; border: 1px solid #000000; padding: 8px 12px; text-align: center;">Phân loại yêu cầu (Type)</td>
                    <td style="width: 70%; border: 1px solid #000000; padding: 8px 12px; text-align: center;">Nội dung chi tiết đặc tả (Specification)</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Hiệu năng (Performance)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">• Thời gian tải danh sách bác sĩ và lịch sử trò chuyện không quá 3 giây.<br>• Tốc độ truyền tin nhắn thời gian thực trong phòng chat có độ trễ dưới 1 giây.<br>• Trợ lý AI phản hồi câu hỏi tư vấn trong vòng tối đa 5 giây.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">An toàn & Bảo mật (Security)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">• Mật khẩu người dùng được mã hóa bằng thuật toán băm một chiều mạnh.<br>• Toàn bộ tin nhắn trao đổi y tế và hồ sơ bệnh án phải được mã hóa bảo mật trên đường truyền.<br>• Phân quyền truy cập nghiêm ngặt thông qua JWT để bảo vệ thông tin cá nhân của bệnh nhân.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Tính khả dụng (Usability)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">• Giao diện thiết kế thân thiện, trực quan và dễ sử dụng cho cả đối tượng bệnh nhân lớn tuổi.<br>• Biểu đồ theo dõi sức khỏe và các cảnh báo hiển thị rõ ràng, dễ hiểu.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- BẢNG 3.15: YÊU CẦU TRIỂN KHAI -->
    <div class="uc-container" id="uc-deploy">
        <span class="uc-title">Bảng 3.15 - Yêu cầu triển khai hệ thống (Deployment Requirements)</span>
        <button class="btn-copy" id="btn-uc-deploy" onclick="copyTableToClipboard('table-uc-deploy', 'btn-uc-deploy')">Copy Bảng 3.15</button>
        <table id="table-uc-deploy" style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 13pt; border: 1px solid #000000; margin-top: 10px;">
            <thead>
                <tr style="background-color: #d9e1f2; font-weight: bold;">
                    <td style="width: 30%; border: 1px solid #000000; padding: 8px 12px; text-align: center;">Môi trường triển khai</td>
                    <td style="width: 70%; border: 1px solid #000000; padding: 8px 12px; text-align: center;">Yêu cầu cấu hình triển khai</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Phía máy chủ (Backend Server)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">• Triển khai trên môi trường Node.js và Express kết nối cơ sở dữ liệu MongoDB.<br>• Sử dụng Socket.io để xử lý kết nối nhắn tin trực tiếp thời gian thực.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Phía máy khách (Client Application)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">• Ứng dụng web được xây dựng bằng React, đảm bảo hiển thị tương thích tốt trên cả thiết bị di động (Responsive UI).</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- BẢNG 3.16 & 3.17: YÊU CẦU LƯU TRỮ VÀ KIỂM TOÁN -->
    <div class="uc-container" id="uc-archive">
        <span class="uc-title">Bảng 3.16 - Yêu cầu lưu trữ thông tin (Data Archive Function)</span>
        <button class="btn-copy" id="btn-uc-archive-1" onclick="copyTableToClipboard('table-uc-archive-1', 'btn-uc-archive-1')">Copy Bảng 3.16</button>
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
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Lịch sử phiên tư vấn (Consultation History)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản trị viên</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Toàn bộ nội dung tin nhắn chat và lời khuyên y học của bác sĩ phải được nén và lưu trữ lịch sử sau khi kết thúc phiên tư vấn.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Chỉ số sức khỏe bệnh nhân (Patient Health Data)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản trị viên</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Các chỉ số sinh tồn của bệnh nhân được lưu trữ lâu dài trong hồ sơ bệnh án điện tử để theo dõi tiến trình sức khỏe.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Đánh giá bác sĩ (Doctor Ratings)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản trị viên</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Lưu giữ lịch sử phản hồi, nhận xét và số sao đánh giá của bệnh nhân dành cho bác sĩ để phục vụ thống kê hiệu suất.</td>
                </tr>
            </tbody>
        </table>

        <br><br>

        <span class="uc-title">Bảng 3.17 - Chức năng giám sát và kiểm toán bảo mật (Security Audit Function)</span>
        <button class="btn-copy" id="btn-uc-archive-2" onclick="copyTableToClipboard('table-uc-archive-2', 'btn-uc-archive-2')">Copy Bảng 3.17</button>
        <table id="table-uc-archive-2" style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 13pt; border: 1px solid #000000; margin-top: 10px;">
            <tbody>
                <tr>
                    <td style="width: 25%; background-color: #d9e1f2; font-weight: bold; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">Nội dung chức năng</td>
                    <td style="width: 75%; border: 1px solid #000000; padding: 8px 12px; vertical-align: top;">
                        Hệ thống tự động ghi nhật ký hệ thống đối với toàn bộ các thao tác chỉnh sửa nhạy cảm của Quản trị viên (như việc thay đổi danh sách từ cấm của AI, nạp/gỡ tri thức y học, duyệt bác sĩ, khóa hoặc mở khóa tài khoản người dùng) để phục vụ việc kiểm toán bảo mật và phát hiện các hành vi bất thường.
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- BẢNG 3.18: CÁC PHÂN HỆ HỆ THỐNG -->
    <div class="uc-container" id="uc-sites">
        <span class="uc-title">Bảng 3.18 - Danh mục các phân hệ giao diện của hệ thống tư vấn sức khỏe</span>
        <button class="btn-copy" id="btn-uc-sites" onclick="copyTableToClipboard('table-uc-sites', 'btn-uc-sites')">Copy Bảng 3.18</button>
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
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Phân hệ Quản trị viên (Admin Portal)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Bảng điều khiển dành riêng cho quản trị viên. Cung cấp các công cụ theo dõi thống kê người dùng, xét duyệt hồ sơ đăng ký của bác sĩ, khóa hoặc mở khóa tài khoản người dùng vi phạm. Quản trị viên còn có thể tải lên các tài liệu tri thức y khoa chuẩn cho AI và chỉnh sửa danh sách từ ngữ nhạy cảm dùng để kiểm duyệt tin nhắn.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">2</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Phân hệ Bác sĩ (Doctor Portal)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Giao diện dành riêng cho bác sĩ y khoa. Cho phép tiếp nhận các ca tư vấn từ hàng đợi, theo dõi hồ sơ sức khỏe và chỉ số sinh tồn của bệnh nhân, nhắn tin tư vấn trực tiếp thời gian thực, nhập ghi chú bệnh án kèm lời khuyên y khoa khi kết thúc ca, xem thống kê hiệu suất làm việc cá nhân và cập nhật trạng thái làm việc trực tuyến hoặc ngoại tuyến.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">3</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Phân hệ Bệnh nhân (Patient Portal)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Giao diện dành cho người dùng bệnh nhân. Cho phép quản lý hồ sơ sức khỏe cá nhân (nhập và theo dõi các chỉ số sinh tồn dưới dạng biểu đồ), nhận cảnh báo sức khỏe bất thường, trò chuyện tư vấn sức khỏe trực tuyến với AI, duyệt danh sách bác sĩ để gửi yêu cầu chat trực tiếp, chấm điểm đánh giá và viết nhận xét sau khi hoàn thành tư vấn, đồng thời xem lại lịch sử các phiên tư vấn trước đây.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- BẢNG 3.19: DANH MỤC DỮ LIỆU CHÍNH -->
    <div class="uc-container" id="uc-lists">
        <span class="uc-title">Bảng 3.19 - Danh mục các danh sách dữ liệu chính trong hệ thống</span>
        <button class="btn-copy" id="btn-uc-lists" onclick="copyTableToClipboard('table-uc-lists', 'btn-uc-lists')">Copy Bảng 3.19</button>
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
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Tài khoản Người dùng (User Account)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Lưu giữ các dữ liệu tài khoản gồm họ tên, địa chỉ email, số điện thoại, vai trò (quản trị viên, bác sĩ, bệnh nhân), mật khẩu được mã hóa an toàn và trạng thái tài khoản.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">2</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Lis02</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Hồ sơ Bác sĩ (Doctor Profile)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Lưu trữ các thông tin chi tiết của bác sĩ phục vụ hiển thị và kiểm duyệt gồm chuyên khoa, kinh nghiệm, bằng cấp và chứng chỉ hành nghề tải lên, điểm đánh giá trung bình.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">3</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Lis03</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Hồ sơ sức khỏe Bệnh nhân (Health Record)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Lưu giữ lịch sử các chỉ số sinh tồn của bệnh nhân (huyết áp, nhịp tim, chiều cao, cân nặng) theo thời gian để theo dõi và hỗ trợ chẩn đoán.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">4</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Lis04</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Phiên tư vấn y tế (Consultation Session)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Chi tiết về các cuộc tư vấn sức khỏe giữa bệnh nhân với bác sĩ, bao gồm tiêu đề, thời gian bắt đầu/kết thúc, trạng thái phiên, lịch sử chat và ghi chú, lời khuyên y tế của bác sĩ.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">5</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Lis05</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Tri thức y học AI (AI Knowledge Base)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Lưu giữ danh sách các tài liệu hướng dẫn y học chuẩn do quản trị viên tải lên làm dữ liệu nền tảng cho trợ lý AI tư vấn.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">6</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Lis06</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Danh sách từ ngữ cấm (Censored Words)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Lưu trữ các từ ngữ nhạy cảm, từ cấm, thô tục hoặc nguy hiểm dùng để tự động lọc và kiểm duyệt nội dung tin nhắn trò chuyện trực tiếp.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">7</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Lis07</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Đánh giá & Phản hồi (Rating & Feedback)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Chi tiết các chấm sao và nhận xét phản hồi của bệnh nhân dành cho bác sĩ sau khi kết thúc buổi tư vấn trực tiếp.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">8</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Lis08</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold;">Thông báo cảnh báo sức khỏe (Health Alert)</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Lưu trữ thông tin các cảnh báo sức khỏe tự động gửi tới bệnh nhân khi chỉ số sinh tồn của họ vượt ngưỡng an toàn cho phép.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- BẢNG 3.20: THUẬT NGỮ VIẾT TẮT -->
    <div class="uc-container" id="uc-glossary">
        <span class="uc-title">Bảng 3.20 - Bảng thuật ngữ viết tắt (Glossary)</span>
        <button class="btn-copy" id="btn-uc-glossary" onclick="copyTableToClipboard('table-uc-glossary', 'btn-uc-glossary')">Copy Bảng 3.20</button>
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
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quy tắc Nghiệp vụ (Business Rule) - Các quy định logic cần tuân thủ trong quy trình vận hành và kiểm soát của hệ thống.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">CBR</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quy tắc Nghiệp vụ Chung (Common Business Rule) - Các quy định chung áp dụng thống nhất cho nhiều chức năng trong hệ thống.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">DB</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Cơ sở dữ liệu (Database) - Nơi lưu trữ thông tin có cấu trúc của hệ thống y tế.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">MSG</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Thông báo (Message) - Các thông điệp hiển thị lên màn hình để thông báo trạng thái thành công, cảnh báo hoặc báo lỗi cho người dùng.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">UC</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Trường hợp Sử dụng (Use Case) - Mô tả chuỗi các tương tác giữa tác nhân người dùng và hệ thống nhằm đạt được một mục tiêu cụ thể.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">N/A</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Không áp dụng / Không có sẵn (Not Applicable / Not Available) - Thể hiện thông tin không có giá trị hoặc không cần thiết tại vị trí đó.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">UI</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Giao diện Người dùng (User Interface) - Phần không gian tương tác trực quan giữa người sử dụng và hệ thống phần mềm.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">SRS</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Tài liệu Đặc tả Yêu cầu Phần mềm (Software Requirements Specification) - Tài liệu mô tả chi tiết tất cả các yêu cầu chức năng và phi chức năng của hệ thống.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">TBD</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Sẽ được xác định thêm sau (To be determined) - Thể hiện nội dung cần được thảo luận hoặc làm rõ thêm trong tương lai.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">OTP</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Mã xác thực dùng một lần (One-Time Password) - Mã số bảo mật ngắn hạn được gửi qua email nhằm xác thực danh tính người dùng khi đăng ký hoặc đổi mật khẩu.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">AI</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Trí tuệ nhân tạo (Artificial Intelligence) - Trợ lý ảo được tích hợp trong hệ thống nhằm hỗ trợ tư vấn sức khỏe sơ bộ cho bệnh nhân dựa trên kho tri thức y học.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">Admin</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Quản trị viên (Administrator) - Người dùng có quyền hành cao nhất trong hệ thống, chịu trách nhiệm quản lý tài khoản, dữ liệu AI và kiểm duyệt nội dung.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">CRUD</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Thêm, Đọc, Sửa, Xóa (Create, Read, Update, Delete) - Các thao tác cơ bản tương tác với cơ sở dữ liệu đối với một danh mục thông tin.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">JWT</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Mã xác thực dạng chuỗi (JSON Web Token) - Cơ chế mã hóa thông tin xác thực để duy trì phiên làm việc an toàn giữa máy khách và máy chủ.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">Bcrypt</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Thuật toán mã hóa mật khẩu - Thuật toán băm một chiều được dùng để mã hóa mật khẩu người dùng trước khi lưu vào cơ sở dữ liệu.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">API</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Giao diện lập trình ứng dụng (Application Programming Interface) - Phương thức kết nối và truyền tải dữ liệu giữa các phân hệ giao diện và máy chủ hệ thống.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">COD</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Giao hàng thu tiền hộ (Cash on Delivery) - Hình thức thanh toán bằng tiền mặt khi nhận hàng (thường áp dụng cho việc mua bán sản phẩm/dịch vụ).</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">real-time</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Thời gian thực - Trạng thái truyền tải dữ liệu tức thời (như việc nhắn tin trực tiếp giữa bác sĩ và bệnh nhân mà không có độ trễ nhận biết).</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">SKU</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Đơn vị phân loại hàng hóa (Stock Keeping Unit) - Mã định danh duy nhất của sản phẩm trong kho (thường áp dụng cho thiết bị y tế hoặc thuốc).</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">Sentiment</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Phân tích cảm xúc - Công nghệ đánh giá cảm xúc tiêu cực, tích cực hoặc trung lập của bệnh nhân thông qua từ ngữ phản hồi.</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center;">VAT</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Thuế giá trị gia tăng (Value Added Tax) - Loại thuế gián thu tính trên giá trị tăng thêm của hàng hóa, dịch vụ phát sinh trong quá trình sản xuất, lưu thông (áp dụng khi tính phí dịch vụ tư vấn).</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- BẢNG 3.21: DANH MỤC THÔNG BÁO HỆ THỐNG -->
    <div class="uc-container" id="uc-messages">
        <span class="uc-title">Bảng 3.21 - Danh mục các thông điệp thông báo hệ thống (Messages)</span>
        <button class="btn-copy" id="btn-uc-messages" onclick="copyTableToClipboard('table-uc-messages', 'btn-uc-messages')">Copy Bảng 3.21</button>
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
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Trường thông tin này là bắt buộc. Bạn vui lòng nhập đầy đủ thông tin để tiếp tục thực hiện hành động.</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok (Đồng ý)</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 2</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Địa chỉ email hoặc mật khẩu của bạn không chính xác. Vui lòng kiểm tra kỹ lại thông tin đăng nhập.</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok (Đồng ý)</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 3</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Đăng nhập tài khoản thành công!</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok (Đồng ý)</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 4</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Thông tin bạn vừa nhập không đúng định dạng yêu cầu. Vui lòng kiểm tra lại.</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok (Đồng ý)</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 5</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Địa chỉ email này đã tồn tại trên hệ thống. Vui lòng sử dụng địa chỉ email khác.</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok (Đồng ý)</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 6</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Số điện thoại này đã tồn tại trong hệ thống. Vui lòng sử dụng số điện thoại khác.</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok (Đồng ý)</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 7</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Lưu trữ và cập nhật dữ liệu thành công!</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok (Đồng ý)</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 8</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Tệp tin tải lên có dung lượng vượt quá giới hạn hoặc định dạng tệp không hợp lệ. Vui lòng kiểm tra và tải lại.</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok (Đồng ý)</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 9</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Mã xác thực dùng một lần nhập vào không chính xác hoặc đã hết hạn sử dụng. Vui lòng kiểm tra lại.</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok (Đồng ý)</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 10</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Bác sĩ hiện đang ngoại tuyến. Bạn có thể để lại tin nhắn hoặc tìm kiếm bác sĩ khác đang trực tuyến.</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok (Đồng ý)</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 11</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Hệ thống phát hiện tin nhắn chứa từ ngữ không phù hợp hoặc vi phạm kiểm duyệt. Vui lòng điều chỉnh lại.</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok (Đồng ý)</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 12</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Bạn có chắc chắn muốn kết thúc phiên tư vấn sức khỏe hiện tại này không?</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Có / Không</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; font-weight: bold;">MSG 13</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px;">Gửi đánh giá và nhận xét chất lượng tư vấn y khoa thành công! Xin cảm ơn ý kiến đóng góp của bạn.</td>
                    <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center;">Ok (Đồng ý)</td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>
"""

    with open(r"c:\mini-supermarket-management\usecases_tables.html", 'w', encoding='utf-8') as f:
        f.write(html_content)
    print("Successfully generated usecases_tables.html")

if __name__ == "__main__":
    generate_html()
