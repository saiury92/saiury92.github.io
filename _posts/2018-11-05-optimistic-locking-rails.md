---
title: Optimistic Locking trong Rails
layout:   post
category: tutorial-tips
tags:     [ruby, rails]
feature: /assets/img/hqdefault.jpg
---

## Database locking ?
Database locking là một tính năng hữu ích trong cơ sở dữ liệu quan hệ, nhằm ngăn ngừa việc xung đột giữa các hành động thay đổi dữ liệu,
đảm bảo tính toàn vẹn dữ liệu giữa thời gian đọc và thời gian sử dụng.

<!--more-->
**Ví dụ :**<br>
Bạn có 1 tài khoản ngân hàng ! Vào một sáng chủ nhật đẹp trời, bạn rút 1 củ đi ăn sáng và uống cafe, vợ bạn chuyển khoản trên Internet Banking
để mua chiêc quần ren đỏ.<br>
Hai hành động trên tình cơ xảy ra đồng thời, bạn có 1 củ đi dẩy và vợ bạn có chiếc quần ren đỏ. Nhưng đời không như mơ `Locking` sẻ chỉ
cho bạn thưởng thức ly cafe hoặc là chiếc quần ren đỏ mà thôi.<br>

Có 2 loại locking trong hibernate là Pessimistic Locking và Optimistic Locking.
![Database Locking](/assets/img/hibernate-locking.png?style=center)

Đối với Pessimistic lock, khi bắt đầu 1 transaction, nó sẽ khóa dữ liệu mà nó sử dụng lại và mở khóa khi nó đã sử dụng xong.
Chỉ có người dùng đầu tiên truy cập đến các đối tượng mới có thể cập nhật nó, những người dùng khác không thể truy cập và cập nhật.<br>
Optimistic lock, chủ đề chính được nói trong bài viết ngày hôm nay, cho phép nhiều người có thể cùng truy cập đảm bảo nhiều transaction
có thể hoàn thành mà không ảnh hưởng đến nhau, các transaction tiến hành mà không cần khóa các tài nguyên lại. Trước khi commit,
mỗi transaction sẽ kiểm tra lại xem dữ liệu của nó có bị transaction khác làm thay đổi không, nếu có thì sẽ quay trở lại trạng thái lúc đầu (rollback).

```ruby
  account1 = Account.find(1)
  account2 = Account.find(2)

  account1.balance -= amount
  account1.save!

  account1.balance -= amount
  account1.save! # Raises a ActiveRecord::StaleObjectError
```

## Optimistic Locking trong rails thì sao ?
Rails đã cung cấp module `ActiveRecord::Locking::Optimistic` để xử lý việc này. Chúng ta chỉ cần add thêm column `lock_version` vào bảng chứa
dữ liệu việc còn lại để rails xử lý.

```ruby
  add_column :products, :lock_version, :integer, :default => 0, :null => false
```
Sau mỗi lần update `lock_version` sẻ tự động lên 1. Do đó, nếu hai yêu cầu muốn thực hiện cùng một đối tượng,
yêu cầu đầu tiên sẽ thành công vì `lock_version` của nó cũng giống như khi nó được đọc, yêu cầu thứ 2 sẽ fail vì `lock_version` lúc này
đã được tăng lên trong cơ sở dữ liệu, exception `StaleObjectError` sẽ được bắn ra.


```ruby
  account1 = Account.find(1) # Account id: 1, balance: 1000000, lock_version: 0
  account2 = Account.find(2) # Account id: 1, balance: 1000000, lock_version: 0

  account1.balance -= 1000000
  account1.save! # Account id: 1, balance: 0, lock_version: 1


  account1.balance -= 1000000 # Account id: 1, balance: 0, lock_version: 0
  account1.save! # Raises a ActiveRecord::StaleObjectError
  account1.destroy! # Raises an ActiveRecord::StaleObjectError

```
Lúc này chúng ta có thể dùng `rescue ActiveRecord::StaleObjectError` để bắt ngoại lệ. Cơ chế locking này hoạt động trong một tiến trình
Ruby đơn lẻ, để thực hiện trên tất cả requests từ Web chúng ta nên thêm hidden field `lock_version` vào form trong request.

```ruby
<%= form_for :account, :url => account_path(@account), :html => { :method => :put } do |f| %>
  <%= f.hidden_field :lock_version %>
  <%= f.hidden_field :amount %>
  <%= f.submit 'Withdrawal' %>
<% end %>
```
Ngoài ra, có thể cài đặt `ActiveRecord::Base.lock_optimistically = false`, để tắt tính năng lock khi không cần thiết. và nếu không muốn
lấy tên column là `lock_version`, ta override bằng cách thiết lập lại giá trị `locking_column` của Class.
```ruby
  class Account < ActiveRecord::Base
    self.locking_column = :lock_balance
  end
```



