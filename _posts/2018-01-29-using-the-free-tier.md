---
title: Sử dụng Free Tier trong AWS
layout:   post
category: tutorial-tips
tags:     [aws]
feature:  /assets/img/fi_aws_free_tier.jpg
---

## Free Tier ?

Bạn có thế sử dụng một số dịch vụ AWS "chùa" trong một giới hạn nhất định. AWS gọi đây là [AWS Free Tier](https://aws.amazon.com/free/){:target="_blank"}
. Khi tạo mới một tài khoản AWS bạn nghiễm nhiên được sử dụng chế độ ưu đãi Free Tier trong 12 tháng. Khi Free Tier
hết hạn, AWS bắt đầu tính phí theo mức thông thường cho những dịch vụ và tài nguyên bạn đang sử dụng.

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