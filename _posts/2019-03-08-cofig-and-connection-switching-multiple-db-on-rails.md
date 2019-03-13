---
title: 'Cấu hình và chuyển đổi kết nối giữa nhiều cơ sở dữ liệu trong Rails'
layout:   post
category: tutorial-tips
tags:     [rails, rails-6]
feature:  /assets/img/multiple-db-pic1.png
---

Trong thời kỳ các dịch vụ cloud phát triển mạnh mẽ, việc xây dựng cơ sở dữ liệu cho phép chia sẽ dữ liệu giữa nhiều
ứng dụng khác nhau không có gì mới. Ví dụ như ứng dụng quản lý dân cư, quản lý trường học, bệnh viện,.. trong khu chung cư
dùng chung database chứa `users`, người dùng trong `users` điều có thể đăng nhập, truy cập vào các ứng dụng trên.

<!--more-->

##### Bài toán ?
Giả sử ta bắt đầu xây dựng một ứng dựng quản lý dân cư trong khu chung cư, có liên kết với một cơ sở dữ liệu chính `primary`
và hai cơ sở dữ liệu `secondary` và `tertiary` được chia sẻ với các ứng dụng khác:
![](/assets/img/multiple-db-pic1.png?style=center){: style='margin-top: 20px;'}

Dữ liệu `addresses` sẽ được đọc từ database `tertiary` và được xử lý cập nhật tới database `primary`, thông tin người 
dùng `users` được hoàn toàn xử lý trên database `secondary`.

Để giải quyết bài toán trên ta sử dụng phương thức `#establish_connection` chỉ định kết nối model `User` ánh xạ tới bảng
`users` của database `secondary`, phương thức mới cứng `connects_to` của rails 6.0.0 trong việc chuyển đổi kết nối đọc ghi model
`Address` giữa database `primary` và `tertiary`.

##### Cấu hình file database.yml ?

```ruby
default: &default
  adapter: mysql2
  encoding: utf8mb4
  host: db
  username: root
  password: 123456
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>

development:
  primary:
    <<: *default
    database: app_primary_development
  secondary:
    <<: *default
    database: app_secondary_development
    migrations_paths: "db/secondary_migrate"
  tertiary:
    <<: *default
    database: app_tertiary_development
    replica: true
```
Do hai database `primary` và `secondary` là độc lập nên cần tách biệt với nhau khi chạy task migrate, `migrations_paths` 
sẽ chỉ định đường dẫn tới thư mục chứa file migrate, nếu không khai báo sẽ mặc định ở `db/migrate`,
và khi chạy `rails generate migration` thêm lựa chọn `--database=DATABASE` để khai báo migrate tương ứng với database nào.

```ruby
# Tạo file migrate cho database primary
rails g  migration CreateAddresses --database=primary
# Chạy task migrate cho database primary
rake db:migrate:primary

# Tạo file migrate cho database secondary
rails g  migration CreateUsers --database=secondary
# Chạy task migrate cho database secondary
rake db:migrate:secondary
```

![](/assets/img/multiple-db-pic2.png){: style='margin-top: 20px;'}

Do database `tertiary` chúng ta chỉ dùng để đọc dữ liệu nên không cần sinh ra migration cho nó, với option `replica: true`
các task migrate sẽ không ảnh hưởng tới chúng.

##### Cấu hình trong model ?

```ruby
# application_record.rb
class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true
end

# address.rb
class Address < ApplicationRecord
  connects_to database: { writing: :primary, reading: :tertiary }

  has_one :user, :class_name => User.name, :foreign_key => :uid, :primary_key => :uid
end

# secondary_base.rb
class SecondaryBase < ActiveRecord::Base
  self.abstract_class = true
  establish_connection :secondary
end

# user.rb
class User < SecondaryBase
  belongs_to :address, :class_name => Address.name, :foreign_key => :uid, :primary_key => :uid
end
```
Model `User` lúc này được ánh xạ đến bảng `users` trong `secondary` và `Address` sẽ được ánh xạ tới `addresses` trong `primary`,
và có khả năng chuyển đối tới `tertiary` qua `role: reading`. Và chúng ta có thể sử dụng các association như bình thường.

##### Time to test !!!!

```ruby
# Dữ liệu từ primary database
Address.first
#=> Address id: 1, uid: "u001", address_name: "address in primary", created_at: "2019-03-01 00:00:00", updated_at: "2019-03-01 00:00:00"

# Với role: :reading sẽ chuyển đổi kết nối tới tertiary database
Address.connected_to(role: :reading) do
  Address.first
end
#=> Address id: 1, uid: "u001", address_name: "address in tertiary", created_at: "2019-03-01 00:00:00", updated_at: "2019-03-01 00:00:00"

# Sẽ sinh ra exception khi cố gắng ghi dữ liệu vào tertiary database
Address.connected_to(role: :reading) do
  Address.create!
end
#=> ActiveRecord::ReadOnlyError
```

Chúng ta cũng có thể đọc dữ liệu trong database `tertiary` và cập nhật vào database `primary`

```ruby
# Dữ liệu từ primary database
Address.find(1)
#=> Address id: 1, uid: "u001", address_name: "address in primary", created_at: "2019-03-01 00:00:00", updated_at: "2019-03-01 00:00:00"

# Dữ liệu từ tertiary database
Address.connected_to(role: :reading) do
  @address = Address.find(1)
  #=> Address id: 1, uid: "u001", address_name: "address in tertiary", created_at: "2019-03-01 00:00:00", updated_at: "2019-03-01 00:00:00"
end
@address.address_name = @address.address_name + " to primary"
# Dữ liệu được cập nhật tới primary database
@address.save!
# Dữ liệu từ primary database
Address.find(1)
#=> Address id: 1, uid: "u001", address_name: "address in tertiary to primary", created_at: "2019-03-01 00:00:00", updated_at: "2019-03-12 08:51:02"
```
Các liên kêt association giữa các model vẫn được bảo toàn.

```ruby
@user = User.find_by(uid: 'u001')
#=> User id: 1, uid: "u001", username: "Tokuda", created_at: "2019-03-01 00:00:00", updated_at: "2019-03-01 00:00:00"
@user.address
#=> Address id: 1, uid: "u001", address_name: "address in primary", created_at: "2019-03-01 00:00:00", updated_at: "2019-03-12 08:55:05"
Address.connected_to(role: :reading) do
  # Khi gọi @user.address ở trên bị cache, thêm reload vào để thực hiện query lại.
  @user.address.reload
end
#=> Address id: 1, uid: "u001", address_name: "address in tertiary", created_at: "2019-03-01 00:00:00", updated_at: "2019-03-01 00:00:00"
```

##### Demo time !!!!

* Tải source code của rails 6.0.0.beta2 có sẵn docker-compose.yml, Dockerfile, dump file của tertiary database:

```console
# Clone with SSH
root@localhost:~$ git clone git@github.com:saiury92/multiple-db-on-rails.git app/
# Clone with HTTPS
root@localhost:~$ git clone https://github.com/saiury92/multiple-db-on-rails.git app/
```

* Tạo images nếu images chưa tồn tại, đồng thời tạo và khởi động các containers:

```console
root@localhost:~$ cd app/
root@localhost:~/app$ docker-compose up
```

* Truy cập vào web_app container và chạy task migrate để tạo database, sinh dữ liệu mẫu:

```console
root@localhost:~/app$ docker exec -it app_web rails db:setup
```

* Có thể truy cập vào rails console để chạy command ở phần test trên:

```console
root@localhost:~/app$ docker exec -it app_web rails c
```

* Chạy rails server và truy cập `http://localhost:3000` để vào web app:

```console
root@localhost:~/app$ docker exec -it app_web rails s
```