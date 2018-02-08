---
title: Sử dụng Free Tier trong AWS
layout:   post
category: tutorial-tips
tags:     [aws]
feature:  /assets/img/fi_aws_free_tier.jpg
---

## Free Tier ?

Bạn có thể sử dụng một số dịch vụ AWS "chùa" trong một giới hạn nhất định. AWS gọi đây là [AWS Free Tier](https://aws.amazon.com/free/){:target="_blank"}
. Khi tạo mới một tài khoản AWS bạn nghiễm nhiên được sử dụng chế độ ưu đãi Free Tier trong 12 tháng. Khi Free Tier
hết hạn, AWS bắt đầu tính phí theo mức thông thường cho một số dịch vụ và tài nguyên bạn đang sử dụng.

<!--more-->

*Làm sao để biết tài khoản đủ điều kiện sử dụng chế độ Free Tier ?*<br>
Khi truy cập vào [Billing and Cost Management console](https://console.aws.amazon.com/billing/home#/){:target="_blank"},
nếu tài khoản đủ điều kiện sử dụng chế độ Free Tier thì bạn sẽ thấy một thông báo trong phần __Alerts & Notifications__ như
dưới đây:
![Free Tier Eligible](/assets/img/free-tier-eligible.png)

Tài khoản AWS được tạo thông qua *AWS Organizations*, Chế độ Free Tier sẽ áp dụng cho tất cả các tài khoản member ngày
bắt đầu sẽ tính từ khi *organization* được tạo ra.

Khi chế độ Free Tier sắp kết thúc, AWS sẽ gửi thông báo đến địa chỉ mail đăng ký của bạn. Lúc này, bạn có thể sử dụng tiếp
và tính phí như bình thường hoặc xóa các dịch vụ tài nguyên hay là đóng tài khoản AWS của mình.

## Free Tier Limits ?

Như đã nói ở trên, AWS cung cấp Free Tier trong 12 tháng, không phải tất cả các dịch vụ sẽ hết hạn trong 12 tháng đó mà
mỗi dịch vụ đều có những kiểu giới hạn riêng, có thể chia thành 2 kiểu chính :

* Hết hạn sau 12 tháng :
  * Amazon EC2: 750 giờ mỗi tháng sử dụng các t2.micro instance của Linux, RHEL hoặc là SLES, và 750 giờ mỗi tháng
    với t2.micro instance của Window.
  * Amazon S3: 5GB dung lượng lưu trữ, 20.000 get requests, 2.000 put requests, và 15 GB of data transfer mỗi tháng.
  * Amazon RDS: 750 giờ mỗi tháng với db.t2.micro database
  * Amazon CloudFront: 50GB Data Transfer Out, 2.000.000 request HTTP hoặc HTTPS.
  * Amazon ElastiCache: 750 giờ sử dụng node cache.t2micro mỗi tháng.
  * ...
* Không hết hạn sau 12 tháng :
  * Amazon DynamoDB: 25 GB dung lượng lưu trữ, 25 đơn vị đọc, 25 đơn vị ghi, đủ để xử lý tới 200 triệu request mỗi tháng.
  * AWS Key Management Service: 20.000 request miễn phí mỗi tháng.
  * ...

# Hourly Usage in the Free Tier ?

Một số dịch vụ như Amazon EC2, Amazon RDS, and Elastic Load Balancing được tính phí dựa trên giờ sử dụng. Điển hình như
Amazon EC2 cung cấp 750 giờ sử dụng một t2.micro instance của Linux mỗi tháng, cộng thêm 750 giờ sử dụng cho một t2.micro instance của Window.
Nếu ta sử dụng 10 linux instance thì thời gian chỉ là 75 giờ sử dụng cho mỗi instance.

![Free ec2 usage](/assets/img/free-ec2-usage.png?style=center)

Để tối ưu thời gian sử dụng trong chế độ Free Tier cần lưu ý cách tính số giờ sử dụng. Khi chạy Amazon EC2 instance
chỉ trong một phần của 1 giờ thì AWS sẽ tính là bạn sử dụng trong toàn bộ giờ đó. Vì vậy, nếu stop và start một Amazon EC2 instance
3 lần trong một giờ, thời gian sẽ được tính là 3 giờ sử dụng.