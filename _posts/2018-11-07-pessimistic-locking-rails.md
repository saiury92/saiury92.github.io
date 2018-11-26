---
title: Pessimistic Locking trong Rails
layout:   post
category: tutorial-tips
tags:     [ruby, rails]
feature: /assets/img/hqdefault.jpg
---

Trước khi đến với Pessimistic Locking, hãy cùng nhìn lại [database locking](https://saiury92.github.io/2018-11-05/optimistic-locking-rails.html){:target="_blank"}
và [optimistic locking](https://saiury92.github.io/2018-11-05/optimistic-locking-rails.html){:target="_blank"} được đề cập ở bài viết lần trước.

## Pessimistic Locking ?
Khác với optimistic locking là kiểm tra `lock_version` khi cập nhật dữ liệu, pessimistic locking sẽ khóa record ngay khi người dùng đầu tiên
truy cập vào dữ liệu đó, tất cả những người dùng khác sẽ bị loại cho đến khi tiến trình cập nhật của dữ liệu của người dùng lock đầu tiên
hoàn thành.

<!--more-->
```ruby
  account = Account.find_by_user_id(5)
  account.lock!
  #no other users can read this account, they have to wait until the lock is released
  account.save!
  #lock is released, other users can read this account
```
## Pessimistic Locking trong rails thì sao ?
Rails thực hiện Pessimistic Locking bằng cách sử dụng những truy vấn câu lệnh khóa trong cơ sở dữ liệu.

```ruby
  Account.transaction do
    # In mysql: `FOR UPDATE`, `LOCK IN SHARE MODE`
    # SELECT * FROM accounts WHERE id = 1 LIMIT 1 FOR UPDATE
    account = Account.lock("FOR UPDATE").find_by(id: 1)
    # SELECT * FROM accounts WHERE id = 1 LIMIT 1 LOCK IN SHARE MODE
    account = Account.lock("LOCK IN SHARE MODE").find_by(id: 1)

    # In postgresql: `FOR UPDATE`, `FOR UPDATE NOWAIT`, `FOR NO KEY UPDATE`, `FOR SHARE`, `FOR KEY SHARE`
    # SELECT * FROM accounts WHERE id = 1 LIMIT 1 FOR UPDATE NOWAIT
    account = Account.lock("FOR UPDATE NOWAIT").find_by(id: 1)
    # SELECT * FROM accounts WHERE id = 1 LIMIT 1 FOR NO KEY UPDATE
    account = Account.lock("FOR NO KEY UPDATE").find_by(id: 1)
  end
```
Chúng ta có thể sử dụng phương thức `ActiveRecord::Base#lock!` để để khóa 1 record bằng id. Đây là cách tốt nhất nếu không
cần thiết phải khóa mọi row trong cơ sở dữ liệu, mặt định sẽ dùng kiểu khóa `FOR UPDATE`

```ruby
  Account.transaction do
    account = Account.find(1)

    # SELECT * FROM accounts WHERE id = 1 LIMIT 1 FOR UPDATE
    account.lock!
    account.balance -= 1000000
    account.save!
  end
```



