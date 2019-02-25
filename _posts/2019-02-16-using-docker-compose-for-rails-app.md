---
title: Sử dụng Docker Compose để thiết lập và chạy ứng dụng Rails
layout:   post
category: tutorial-tips
tags:     [rails, docker]
feature: /assets/img/docker-compose-for-rails.png
---

Phận làm dev như phận culi, chỉ đâu đánh đấy, nay code dự án này mai lại chuyển dự án khác, code đồng thời 1 lúc dăm ba dự 
án là chuyện xưa nay không hiếm gặp. Dự án thì khách hàng yêu cầu cái gì cũng phải mới nhất ruby-2.6.1, rails-6.0.0, mysql-8.0,
dự án khác thì đã phát triển từ thời napoleon ruby-2.0.0, rails-4.0.0, mysql-5.5. Các dự án có môi trường dev muôn hình muôn vẻ
mà công ty chỉ cấp cho một cái máy để dev cả nhiệm kỳ. Trời sinh trouble ắt sinh docker !!!

<!--more-->

Hồi sinh viên tôi có được các thầy giới thiệu sử dụng `Virtualbox` để tạo môi trường máy ảo, sau này đi làm thì được biết `Vagrant`.
Nhưng kể từ khi biết đến `docker` thì tôi mới biết đến cái đích mà mình cần. Nếu bạn chưa biết chút gì về docker thì hãy xem qua 
bài [Docker Overview](https://docs.google.com/document/d/1fafzN1MGgEwZXqbPD9t0VopTRsfvh-Rf6gXJ-1sdEHc){:target="_blank"}
rồi hãy tiếp tục bài viết này.

Giả thuyết rằng bạn đã nắm rõ cơ bản về `docker`, `docker container`, `docker compose`, và máy tính bạn cũng cài đủ các service trên.
Và ông sếp bạn mới cho bạn join và dự án mới với môi trường sử dụng `ruby-2.1.2`, `rails-4.0.4`, `mysql-5.5.61`, `redis-3.2.4`.
Và hãy cũng đi thiết lập môi trường nào !


##### Bước 1: Tạo Dockerfile, docker-compose.yml

Chúng ta có thể tạo `Dockerfile` và `docker-compose.yml` ở bất cứ đâu, để tiện cho quản lý chúng ta có thể tạo ngay ở thư mục dự 
án và git ignore chúng.
+ Dockerfile

```ruby
# Định nghĩa base image cần dùng tương ứng với ruby 2.1.2
FROM ruby:2.1.2
# Cài đặt một số package cần thiết cho ứng dụng Rails
RUN apt-get update && apt-get install -y build-essential nodejs
# Tạo và cấu hình thư mục làm việc chính.
# Các lệnh RUN, COPY, and ENTRYPOINT sau này sẽ được trỏ đến thư mục này.
RUN mkdir -p /app
WORKDIR /app

# Copy Gemfile, Gemfile.lock từ dự án và cài đặt sẵn các RubyGems trong images đươc build  
COPY Gemfile Gemfile.lock ./
RUN gem install bundler -v '1.16.2' && bundle install --jobs 20 --retry 5
# Copy source code vào trong image của app 
COPY . ./
# Mở cổng 3000 của docker host, có thể truy câp qua nó sau này
EXPOSE 3000
```
+ docker-compose.yml

```ruby
version: "3"
services:
  db:
    image: mysql:5.5.61
    environment:
      - MYSQL_ROOT_PASSWORD=123456
  redis:
    image: redis:3.2.4-alpine
    ports:
      - 6379:6379
  web:
    build: .
    command: bash -c "rm -f tmp/pids/server.pid && bundle install && bundle exec rails s -p 3000 -b '0.0.0.0'"
    tty: true
    stdin_open: true
    volumes:
      - .:/app
    ports:
      - "3000:3000"
    depends_on:
      - db
      - redis
  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    links:
      - db:mysql
    restart: always
    ports:
      - 8080:80
```

Trong `docker-compose.yml` mô tả các services mà ứng dụng cần dùng (database, redis, web app và phpmyadmin), dựa vào 
những mô tả định nghĩa này sẽ build ra những images tướng ứng và các container ứng với những images đó, các container sẽ
được cấu hình để liên kết với nhau thông qua các cổng được expose.


##### Bước 2: Cấu hình database.yml

```ruby
default: &default
  adapter: mysql2
  encoding: utf8mb4
  host: db
  username: root
  password: 123456
  pool: 5

development:
  <<: *default
  database: app_development

  redis:
    host: 127.0.0.1
    port: 6379
    db: 0
    options:
      namespace: app_development
      expires_in: 86400
      compress: false

test:
  <<: *default
  database: app_test
```

##### Bước 3: Tạo images và containers

```ruby
# Để chỉ tạo image cho web app
docker-compose build
```

```ruby
# Tạo ra các images được cấu hình trong docker-compose.yml nếu chưa tồn tại và các containers tương ứng.
docker-compose up

# Hiển thị tất cả các containers
docker ps -a

# CONTAINER ID    IMAGE                   COMMAND                  CREATED           STATUS          PORTS                            NAMES
# 3eea6fde4ca5    app_web                 "bash -c 'rm -f tmp/…"   22 minutes ago    Up 22 minutes   0.0.0.0:3000->3000/tcp           app_web_1
# 54fc4f2b3d15    phpmyadmin/phpmyadmin   "/run.sh supervisord…"   22 minutes ago    Up 22 minutes   9000/tcp, 0.0.0.0:8080->80/tcp   app_phpmyadmin_1
# 26e74cbf1bc1    redis:3.2.4-alpine      "docker-entrypoint.s…"   22 minutes ago    Up 22 minutes   0.0.0.0:6379->6379/tcp           app_redis_1
# e021f50ec5e5    mysql:5.5.61            "docker-entrypoint.s…"   22 minutes ago    Up 22 minutes   3306/tcp                         app_db_1
```

##### Bước 4: Debug và Console
Sau khi đã tạo vào chạy các containers, có thể truy cập vào app web theo đường dẫn `http://localhost:3000` và giao diện web của phpmyadmin
theo đường dẫn `http://localhost:8080`

Để có thể tương tác với log của rails server trong shell cần thiết lập hai thuộc tính `tty: true`, `stdin_open: true` trong 
docker-compose.yml như trên, và sử dụng `docker attach app_web_1` để follow theo dòng log của rails server, và thao tác debug
khi app hỗ trợ một số thư viện debug như `pry`. Hoặc có thể sử dụng `docker exec -it app_web_1 /bin/bash` truy cập vào 
trong thưc mục chứa dự án trong container.

##### TL;DR

Tùy thuộc vào cấu hình của từng dự án mà ta có thể tìm version các images tướng ứng, để lựa chọn các version có thể truy cập
[Docker Hub](https://hub.docker.com){:target="_blank"} tìm kiếm những version cần dùng.
 