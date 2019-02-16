---
title: 'Tổng hợp một số câu hỏi về Ruby và Rails [P2]'
layout:   post
category: tutorial-tips
tags:     [ruby, rails]
feature:  /assets/img/ruby-knowledge-quiz.png

---
##### 11. Lệnh rollback một file migration trong rails ?

+ [ ] {: style='margin-right: 3px;'} rake db:migrate:redo
+ [x] {: style='margin-right: 3px;'} rake db:migrate:down
+ [ ] {: style='margin-right: 3px;'} rake db:rollback
+ [ ] {: style='margin-right: 3px;'} rake db:migrate:reset
{: style='list-style-type: none; margin: 8px; font-size: 15px;'}

<!--more-->
##### 12. class Baz được định nghĩa như dưới đây, cách gọi nào dưới bị lỗi ?

![](/assets/img/ruby-knowledge-quiz/q12.png){: style='margin: 8px;'}

+ [ ] {: style='margin-right: 3px;'} Baz.bar
+ [ ] {: style='margin-right: 3px;'} Baz.new.foo
+ [ ] {: style='margin-right: 3px;'} Baz.foo
+ [x] {: style='margin-right: 3px;'} Baz.new.bar
{: style='list-style-type: none; margin: 8px; font-size: 15px;'}

##### 13. Câu lệnh nào dùng để truy cập trực tiếp vào DBMS, và chạy các câu lệnh truy vấn trực tiếp ?

+ [x] {: style='margin-right: 3px;'} rails db
+ [ ] {: style='margin-right: 3px;'} rake db:setup
+ [x] {: style='margin-right: 3px;'} mysql -u username -p password
+ [ ] {: style='margin-right: 3px;'} rails console
{: style='list-style-type: none; margin: 8px; font-size: 15px;'}

##### 14. Câu lệnh nào sau đây trả về User có id là 1 or 3 ?

+ [x] {: style='margin-right: 3px;'} User.find(1,3)
+ [ ] {: style='margin-right: 3px;'} User.where(id: 1..3)
+ [ ] {: style='margin-right: 3px;'} User.where(id: [1,3])
+ [x] {: style='margin-right: 3px;'} User.find([1,3])
{: style='list-style-type: none; margin: 8px; font-size: 15px;'}

##### 15. Thứ tự thực thi các tiến trình nào dưới đây là đúng khi truy cập vào ApplicationController ?

![](/assets/img/ruby-knowledge-quiz/q15.png){: style='margin: 8px;'}

+ [ ] {: style='margin-right: 3px;'} before_action_test -> after_action_test -> append_before_action_test -> append_after_action_test
+ [ ] {: style='margin-right: 3px;'} append_before_action_test -> before_action_test -> after_action_test -> append_after_action_test
+ [ ] {: style='margin-right: 3px;'} append_before_action_test -> append_after_action_test -> after_action_test -> after_action_test
+ [x] {: style='margin-right: 3px;'} before_action_test -> append_before_action_test -> append_after_action_test -> after_action_test
{: style='list-style-type: none; margin: 8px; font-size: 14px;'}

##### 16. Với function update User và params như dưới đây. Hãy chỉ ra phát biểu nào là đúng ?

![](/assets/img/ruby-knowledge-quiz/q16.png){: style='margin: 8px;'}

+ [ ] {: style='margin-right: 3px;'} Không update được thông tin current_user với params như trên
+ [x] {: style='margin-right: 3px;'} Chỉ update được các thông tin first_name, last_name, email cho current_user
+ [ ] {: style='margin-right: 3px;'} Chỉ update được thông tin is_admin cho current_user
+ [ ] {: style='margin-right: 3px;'} Update được current_user với tất cả các tham số truyền lên
{: style='list-style-type: none; margin: 8px; font-size: 15px;'}


##### 17. Câu lệnh SQL nào sẽ được thực thi khi ta gọi lênh User.take ?

+ [ ] {: style='margin-right: 3px;'} SELECT "users".* FROM "users" ORDER BY id ASC
+ [x] {: style='margin-right: 3px;'} SELECT "users".* FROM "users" LIMIT 1
+ [ ] {: style='margin-right: 3px;'} SELECT "users".* FROM "users" ORDER BY id DESC
+ [ ] {: style='margin-right: 3px;'} SELECT "users".* FROM "users" ORDER BY id ASC LIMIT 1
{: style='list-style-type: none; margin: 8px; font-size: 15px;'}

##### 18. Phát biểu nào dưới đây đúng khi nói về hạn chế của Rails 4 ?

+ [x] {: style='margin-right: 3px;'} Không hỗ trợ kết nối nhiều database trong một thời điểm
+ [ ] {: style='margin-right: 3px;'} Không hỗ trợ SOAP web services
+ [ ] {: style='margin-right: 3px;'} Không hỗ trợ kết nối với nhiều database server trong một thời điểm
+ [x] {: style='margin-right: 3px;'} Không hỗ trợ add Foreign keys cho database
{: style='list-style-type: none; margin: 8px; font-size: 15px;'}

##### 19. Với model User dưới đây để lấy tất cả user có deleted_flg = true thì dùng lệnh nào ?

![](/assets/img/ruby-knowledge-quiz/q19.png){: style='margin: 8px;'}

+ [ ] {: style='margin-right: 3px;'} User.where(deleted_flg: true)
+ [x] {: style='margin-right: 3px;'} User.unscoped.where(deleted_flg: true)
+ [ ] {: style='margin-right: 3px;'} User.where("deleted_flg = false")
+ [ ] {: style='margin-right: 3px;'} User.where("deleted_flg != false")
{: style='list-style-type: none; margin: 8px; font-size: 15px;'}

##### 20. Thứ tự thực thi các tiến trình nào dưới đây là đúng khi dùng lệnh Option.create(name: "name", url: "url") ?

![](/assets/img/ruby-knowledge-quiz/q20.png){: style='margin: 8px;'}

+ [ ] {: style='margin-right: 3px;'} after_update_test -> after_save_test -> after_commit_test
+ [ ] {: style='margin-right: 3px;'} after_save_test -> after_create_test -> -> after_commit_test
+ [x] {: style='margin-right: 3px;'} after_create_test -> after_save_test -> after_commit_test
+ [ ] {: style='margin-right: 3px;'} after_create_test -> after_update_test -> after_save_test -> after_commit_test
{: style='list-style-type: none; margin: 8px; font-size: 15px;'}

