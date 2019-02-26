---
title: Hard Link và Symbolic Link trong Linux
layout:   post
category: tutorial-tips
tags:     [linux]
feature:  /assets/img/hard-link-vs-symbolic-link-in-linux.png
---

Hẳn hai khái niệm `hard link`, `symbolic link(soft link)` gây không ít khó khăn, nhiêu khê cho những người mới tìm hiểu về linux,
và với những cả những lão làng bẵng đi một thời gian đọc lại vẫn loạn cả lên. Chúng ta hãy cùng làm rõ 2 khái niệm trên,
so sánh ưu nhược điểm của 2 loại này.

 <!--more-->
 
Muốn nắm rõ bản chất của hai khái niệm trên ta cần biết hệ điều hành quản lý file như thế nào. Lấy ví dụ một file chứa 
dữ liệu có tên là `filename`. Về phía người dùng ta có thể dễ dàng phân biệt với các file khác dựa vào tên `filename`,
nhưng về phía hệ điều hành các file được phân biệt định danh bằng chỉ số `inode`. Mỗi một tên file có một chỉ số inode đi kèm,
chỉ số `inode` tham chiếu đến một vùng bộ nhớ trong đó có chứa địa chỉ vùng bộ nhớ lưu trữ dữ liệu. File là vậy các thư mục
cũng được quản lý tương tự.

```console
root@localhost:~$ ls -i
2245505 filename   #Chỉ số inode của filename là 2245505
```
##### 1. Liên kết cứng(hard link)

![](/assets/img/hard-link.png?style=center){: style='margin-top: 20px;'}

Ta có file nguồn tên là `filename`, có chỉ số inode là `inode`, địa chỉ bộ nhớ `addresses`, vùng lưu trữ dữ liệu là `data`. 
Khi tạo hard link có tên file `othername`, thì chỉ số đi kèm với nó sẽ chính là `inode` của `filename`.


```console
root@localhost:~$ ls -i
2245505 filename   #Chỉ số inode của filename là 2245505
root@localhost:~$ ln filename othername
root@localhost:~$ ls -i
2245505 filename  2245505 othername   #Chỉ số inode của filename, othername cùng là 2245505
```
Vì cùng chỉ số `inode` nên sẽ cùng tham chiếu đến một vùng nhớ chứa địa chỉ `addresses` của dữ liệu do đó sẽ cùng trỏ đến một vùng
lưu trữ dữ liệu `data`. Tuy 2 mà 1, `filename` và `othername` cũng chỉ là hai cái tên về mặt người dùng nhưng đối với hệ thống
nó **gần như** là như nhau. Khi chỉnh sửa dữ liệu `filename` thì `othername` cũng được cập nhật và ngược lại.

```console
root@localhost:~$ echo 'hard link' > filename
root@localhost:~$ cat filename
hard link
root@localhost:~$ cat othername
hard link
root@localhost:~$ echo 'hard link update' > othername
root@localhost:~$ cat filename
hard link update
```

##### 2. Liên kết tượng trưng (symbolic link)

![](/assets/img/soft-link.png?style=center){: style='margin-top: 20px;'}

Khi tạo symbolic link với tên là `othername` thì hệ thống sẽ tạo ra một chỉ số inode khác tương ứng với tên file đó. Inode
này sẽ tham chiếu đến một vùng nhớ khác chứa địa chỉ, địa chỉ này sẽ trỏ đến một vùng nhớ chứa dữ liệu lưu trữ đường dẫn 
đến file gốc `filename`.

```console
root@localhost:~$ ls -i
2245505 filename   #Chỉ số inode của filename là 2245505
root@localhost:~$ ln -s filename othername
root@localhost:~$ ls -il
2245505 -rw-r--r-- 1 root root 17 Thg 2 26 09:36 filename   #Chỉ số inode của filename là 2245505
2245506 lrwxrwxrwx 1 root root  8 Thg 2 26 10:17 othername -> filename   #Chỉ số inode của othername là 2245506
```

##### 3. Sự khác nhau giữa hard link và symbolic link ?

![](/assets/img/diff-hard-link-vs-soft-link.png?style=center){: style='margin-top: 20px;'}

Liên kết tượng trưng (symbolic link) sẽ sinh ra inode mới tham chiếu đến địa chỉ trỏ đến vùng nhớ đường dẫn của file gốc, còn liên kết
cứng (hard link) thì không. Chính điều này dẫn đến việc khi xóa file nguồn đường dẫn đến file gốc sẽ bị mất, sẽ không truy
cập được dữ liệu thông qua symbolic link, về phía hard link vẫn được tham chiếu đến địa chỉ và vùng nhớ lưu trữ dữ liệu. Chỉ
khi nào tất cả các hard link, tên file tương ứng với inode đó bị xóa thì dữ liệu mới bị xóa.

```console
root@localhost:~$ ls -i
2245505 filename   #Chỉ số inode của filename là 2245505
root@localhost:~$ ln filename hardlink
root@localhost:~$ ln -s filename symboliclink
2245505 -rw-r--r-- 2 thiennk-d2 thiennk-d2 0 Thg 2 26 11:07 filename
2245505 -rw-r--r-- 2 thiennk-d2 thiennk-d2 0 Thg 2 26 11:07 hardlink
2245506 lrwxrwxrwx 1 thiennk-d2 thiennk-d2 8 Thg 2 26 11:08 symboliclink -> filename
root@localhost:~$ echo 'hard link vs symbolic link' > filename
root@localhost:~$ echo -e "Content in hardlink file: '$(cat hardlink)'\nContent in symboliclink file: '$(cat symboliclink)'"
Content in hardlink file: 'hard link vs symbolic link'
Content in symboliclink file: 'hard link vs symbolic link'
root@localhost:~$ rm filename
root@localhost:~$ echo -e "Content in hardlink file: '$(cat hardlink)'\nContent in symboliclink file: '$(cat symboliclink)'"
cat: symboliclink: No such file or directory
Content in hardlink file: 'hard link vs symbolic link'
Content in symboliclink file: ''
```
##### 3. Ưu nhược điểm của hard link và symbolic link?
+ Ưu điểm của hard link:
    - Dùng chung inode, tìm kiếm sẽ nhanh hơn
    - Có thể làm việc với mọi ứng dụng
    - File gốc bị xóa, file hard link vẫn còn
+ Hạn chế của hard link:
    - Không hard link sang một filesystem khác được
    - Không hard link được thư mục
    - Phải dựa vào chỉ inode để biết một file có những hard link nào
+ Ưu điểm của symbolic link:
    - Liên kết được thư mục
    - Dễ dàng kiểm tra file có liên kết nào qua command 'ls -l'
+ Hạn chế của symbolic link:
    - Một số ứng dụng không cho phép symbolic link
    - Xóa file gốc, file liên kết vô giá trị
