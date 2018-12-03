---
title: Joins, preload, includes và eager_load trong Rails
layout:   post
category: tutorial-tips
tags:     [ruby, rails, sql]
feature: /assets/img/joins-includes-preload-eagerload.png
---

## N+1 Query là gì ?
Đa phần các ứng dụng trong ngôn ngữ lập trình web nói chung và trong Rails nói riêng đều sử dụng ORM để ánh xạ 
các record dữ liệu trong quan hệ quản trị cơ sở dữ liệu sang kiểu đối tượng mà mã nguồn định nghĩa trong các Class.
Việc này giúp truy xuất dữ liệu đơn giản hơn, nhưng cũng mang đến những "cạm bẫy" khi code chưa khéo và N+1 Query là một phần
trong số đó.
<!--more--> 

```ruby
  #Articles model
  class Article < ActiveRecord::Base
    has_many :comments
  end
  #Comment model
  class Comment < ActiveRecord::Base
    belongs_to :article
  end
  @articles = Article.limit(2)
  @articles.each {|article| puts "Comment Count: #{article.comments.size}"}
  # SELECT articles.* FROM articles LIMIT 2
  # SELECT COUNT(*) FROM comments WHERE comments.article_id = 1
  # SELECT COUNT(*) FROM comments WHERE comments.article_id = 2
```
Các ORM mặc định kích hoạt chức năng `lazy-loading` nên có 3(2+1) truy vấn tới cơ sở dữ liệu. Với `limit=2` chúng ta có 2+1 truy vấn, cơ sở dữ liệu lớn
hơn khi có tới 1000 record thì sẽ có 1000+1 truy vấn, như vậy sẽ rất tốn tài nguyên và ảnh hưởng đến performance của ứng dụng.<br>
Đừng lo, Rails đã cung cấp những phương thức truy vấn để load những dữ liệu quan hệ giải quyết vấn đề trên !
 
## Joins ?
```ruby
  @articles = Article.joins(:comments).limit(2)
  @articles.each {|article| puts "Comment Count: #{article.comments.size}"}
  # SELECT articles.* FROM articles INNER JOIN comments ON comments.article_id = articles.id LIMIT 2
  # SELECT COUNT(*) FROM comments WHERE comments.article_id = 1
  # SELECT COUNT(*) FROM comments WHERE comments.article_id = 2
```
Đù má lừa tao à! vẫn 3(2+1) truy vấn, đúng vậy! phương thức `joins` sử dụng `INNER JOIN` chứ không tải dữ liệu quan hệ vào bộ nhớ, để ngăn ngừa N+1 thì phải `select` thêm
dữ liệu của quan hệ mà ta cần dùng sau này.

```ruby
  @articles = Article.select('articles.*, COUNT(*) AS comments_count').joins(:comments).group(:id).limit(2)
  @articles.each {|article| puts "Comment Count: #{article.comments_count}"}
  # SELECT  articles.*, COUNT(*) AS comments_count FROM "articles" INNER JOIN "comments" ON "comments"."article_id" = "articles"."id" GROUP BY "articles"."id" LIMIT
```
Bằng việc thêm thuộc tính `comments_count` trong `select` kết hợp với hàm `COUNT(*)` chúng ta chỉ cần 1 câu lệnh truy vấn thay vì N+1 truy vấn.

## Preload ?
```ruby
  @articles = Article.preload(:comments).limit(2)
  @articles.each {|article| puts "Comment Count: #{article.comments.size}"}
  # SELECT articles.* FROM articles LIMIT 2
  # SELECT comments.* FROM comments WHERE comments.article_id IN (1, 2)
```
Preload sẽ tải thêm dữ liệu quan hệ trong một truy vấn riêng biệt, và sẽ không truy vấn lại khi sử dụng sau này. Chính vì cơ chế `preload`
luôn luôn tạo ra 2 câu lệnh sql riêng biệt nên không thể kết hợp với điều kiện ở bảng liên kết.

```ruby
  Article.preload(:comments)..limit(2)
  # SQLite3::SQLException: no such column: comments.id
```
Để khác phục vấn đề này rails cung cấp phương thức `includes`
## Includes ?
```ruby
  @articles = Article.includes(:comments).limit(2)
  @articles.each {|article| puts "Comment Count: #{article.comments.size}"}
  # SELECT articles.* FROM articles LIMIT 2
  # SELECT comments.* FROM comments WHERE comments.article_id IN (1, 2)
```
Với đoạn mã như trên `includes` giống hệt với `preload`, tạo ra thêm 1 truy vấn để tải dữ liệu quan hệ. Nhưng khi kết hợp với điều kiện
của bảng liên kết, `includes` sẽ **"trở mặt"** quay sang sử dụng `LEFT OUTER JOIN` để có thể kết hợp với điều kiện đầu vào.

```ruby
  Article.includes(:comments).where(comments: {id: [1,2]})
  =begin 
  SELECT articles.id AS t0_r0, articles.created_at AS t0_r1, articles.updated_at AS t0_r2, 
         comments.id AS t1_r0, comments.article_id AS t1_r1, comments.created_at AS t1_r2, comments.updated_at AS t1_r3 
  FROM articles 
  LEFT OUTER JOIN comments ON comments.article_id = articles.id 
  WHERE comments.id IN (1, 2)
  =end
```
**Làm thế nào bắt `includes` luôn luôn "trở mặt" chỉ sinh ra một câu lệnh truy vấn?**<br>
Có!  References sẽ giúp làm điều này! Khi kết hợp với `references`, `includes` sẽ sử dụng `LEFT OUTER JOIN` và chỉ tạo
ra một câu lệnh truy vấn duy nhất mà ko tạo thêm một truy vấn riêng biệt cho bảng liên kết

```ruby
  Article.includes(:comments).references(:comments)
  =begin
  SELECT articles.id AS t0_r0, articles.created_at AS t0_r1, articles.updated_at AS t0_r2,
         comments.id AS t1_r0, comments.article_id AS t1_r1, comments.created_at AS t1_r2, comments.updated_at AS t1_r3 
  FROM articles
  LEFT OUTER JOIN comments ON comments.article_id = articles.id
  =end
```
**Ủa vậy có cái bằng `includes` + `references` không?**
## Eager load?

```ruby
  Article.eager_load(:comments)
  =begin
  SELECT articles.id AS t0_r0, articles.created_at AS t0_r1, articles.updated_at AS t0_r2,
         comments.id AS t1_r0, comments.article_id AS t1_r1, comments.created_at AS t1_r2, comments.updated_at AS t1_r3 
  FROM articles LEFT OUTER JOIN comments ON comments.article_id = articles.id
  =end
```
Đoạn code trên đã cho biết cái gì tương tự như `includes` + `references`. Eager load sẽ sử dụng `LEFT OUTER JOIN` để tải tất cả
liên kết trong một câu lệnh truy vấn duy nhất.

## Sự kết hợp hoàn hảo ?
**Joins với Preload**, như đề cập ở trên phương thức `joins` không tự mình ngăn ngừa được N+1 Query, còn `preload` không thể lọc dữ liệu
theo điều kiện quan hệ liên kết.

```ruby
  @articles = Article.joins(:comments).where(comments: {id: [1,2]}).preload(:comments)
  @articles.each {|article| puts "Comment Count: #{article.comments.size}"}
  # SELECT articles.* FROM articles INNER JOIN comments ON comments.article_id = articles.id WHERE comments.id IN (1, 2)
  # SELECT comments.* FROM comments WHERE comments.article_id IN (4, 1)
```
Phương `joins` sẽ giúp lọc dữ liệu bảng `Article` theo điều kiện `id` của `comments` và `preload` sẽ tải tất cả dữ liệu 
comments theo quan hệ được lọc ở trên.

## TL;DR
Mỗi phương thức có những đặc điểm riêng phù hợp với từng mục đích sử dụng:
* Nếu chỉ để lọc hãy dùng `joins`
* Nếu truy cập đến các quan hệ thì dùng `includes`
* Nếu cảm thấy `includes` chậm khi bị chia ra thành 2 câu truy vấn thì sử dụng `eager_load` để gộp thành 1 và so sánh hiệu suất.