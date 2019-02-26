---
title: Một số tính năng mới đáng chú ý trong Ruby 2.6.0
layout:   post
category: tutorial-tips
tags:     [ruby]
feature:  /assets/img/new-features-in-ruby-2-6.png
---
Vào ngày 25/12/2018, phiên bản ruby 2.6.0 chính thức được phát hành, kèm theo đó là những tính năng mới được bổ sung và
cải tiền về hiệu suất. Một trình biên dịch mới `JIT(Just-In-Time)` được ra đời, một module mới `RubyVM::AbstractSyntaxTree`
được đưa vào, hiệu suất được cải thiện [1.7 lần](https://gist.github.com/saiury92/16d81d7d2a65fdcf1dca71bae4835ebb){:target="_blank"}
 so với Ruby 2.5. Chúng ta hãy cùng điểm qua một số tính năng mới đáng chú ý ở phiên bản Ruby 2.6.0
 
 <!--more-->
![](/assets/img/ruby-releases.png?style=center)

##### 1. Thêm alias `#then` cho `Kernel#yield_self`
Ruby 2.5 đã giới thiệu phương thức `#yield_self` nó sẽ trả về một block với dữ liệu nhận vào chính là đối tượng gọi method,
kết quả trả về của block đó là một đối tượng mới, từ Ruby 2.6 chúng ta có thể gọi `#then` tương tự như `#yield_self`

```ruby
2.5.0 :1 > "Hello".yield_self { |str| str + " World" }.yield_self { |str| str + " , I am saiury92" }
#=> "Hello World , I am saiury92"
2.6.0 :1 > "Hello".then { |str| str + " World" }.then { |str| str + " , I am saiury92" } 
#=> "Hello World , I am saiury92" 
```
##### 2. Tên constant có thể bắt đầu bằng chữ cái in hoa không phải ASCII
Trước ruby 2.6, tên constant cần bắt đầu bởi ký tự in hoa ASCII, nó đồng nghĩa với việc tên các `class` và `module` không thể
bắt đầu bằng chữ cái in hoa không phải ASCII, đoạn code dưới đây sẽ bắn ra exception `class/module name must be CONSTANT`

```ruby
2.5.0 :1 > class Большойдвоичный
2.5.0 :1 > end
#=> SyntaxError: (eval):2: class/module name must be CONSTANT
```
Nhưng Ruby 2.6 cho phép đặt tên các `class` và `module` bắt đầu bằng chữ in hoa không phải ASCII.
```ruby
# Không có lỗi, không sinh exception
2.6.0 :1 > class Большойдвоичный
2.6.0 :2 > end
```

##### 3. Endless ranges và phương thức `Range#%`
Với những phiên bản Ruby trước, nếu muốn tạo vòng lặp vô hạn cùng với chỉ sổ thì ta sử dụng `Float::INFINITY` cùng với `upto`
hoặc `Range`, hoặc sử dụng `Numeric#step`, sang ruby 2.6 ta có thể dùng `(1..)` hoặc `(1..nil)`
```ruby
2.5.0 :1 > (1..Float::INFINITY).each { |n| puts n }
2.5.0 :2 > 1.step.each { |n| puts n }

2.6.0 :1 > (1..).each { |n| puts n }
2.6.0 :2 > (1..nil).each { |n| puts n }
```
Ngoài ra class `Range` trong ruby 2.6.0 có thêm phương thức mới `%` trả về  đối tượng `Enumerator::ArithmeticSequence` ,
như ví dụ dưới đây sẽ lấy ra array có bước nhảy là `3`.
    
```ruby
2.6.0 :1 > ((0..) % 3).take(10)
#=> [0, 3, 6, 9, 12, 15, 18, 21, 24, 27]
```

##### 4. Hai subclass mới của `Enumerator`: `Enumerator::Chain` và `Enumerator::ArithmeticSequence`

Như chúng ta đã biết class `Range` được include module `Enumerable`, với phiên bản ruby 2.6.0 module `Enumerable` được thêm
phương thức `Enumerable#chain` sẽ khởi tạo 1 object từ `Enumerator::Chain`. Dựa vào đây chúng ta có thể cộng 
một Range cho một Array như sau:

```ruby
2.6.0 :1 > e = (1..3).chain([4, 5])
#=> #<Enumerator::Chain: [1..3, [4, 5]]> 
2.6.0 :2 > e.to_a
#=> [1, 2, 3, 4, 5]
```

Với những bản ruby trước 2.6.0 thì gọi phương `Range#step` sẽ trả về 1 object của `Enumerator` sẽ không lấy được phần tử cuối cùng
của range đó theo phương thức `#last`, nhưng với ruby 2.6.0 thì `Range#step` trả về `Enumerator::ArithmeticSequence` và sẽ có 
thể dùng `Enumerator::ArithmeticSequence#last` để lấy được phần tử cuối cùng.

```ruby
2.5.0 :1 > (1..10).step(2).class
#=> Enumerator
2.5.0 :2 > (1..10).step(2).last
#=> undefined method `last' for #<Enumerator: 1..10:step(2)>
2.5.0 :3 > (1..10).step(2) == (1..10).step(2)
#=> false
 
2.6.0 :1 > (1..10).step(2).class
#=> Enumerator::ArithmeticSequence
2.6.0 :2 > (1..10).step(2).last
#=> 9
2.6.0 :3 > (1..10).step(2) == (1..10).step(2)
#=> true
```

##### 5. Merge hash với nhiều đối số truyền vào.
Ở các phiên bản cũ hơn phương thức `Hash#merge` chỉ có 1 đối số truyền vào nhưng ở bản 2.6.0 sẽ không giới hạn đối
số truyền vào.
```ruby
2.5.0 :1 > a = { a: 1 }
           b = { b: 2 }
           c = { c: 3 }
2.5.0 :2 > a.merge(b).merge(c)
#=> {:a=>1, :b=>2, :c=>3}
2.5.0 :3 > a.merge(b, c)
#=> ArgumentError (wrong number of arguments (given 2, expected 1))

2.6.0 :1 > a.merge(b, c)
#=> {:a=>1, :b=>2, :c=>3}
```
##### 6. Thêm tùy chọn `exception` vào `Integer()` và `Float()`
```ruby
2.5.0 :1 > Integer('foo')
#=> ArgumentError (invalid value for Integer(): "foo")
2.5.0 :2 > Integer('foo') rescue nil
#=> nil
 
2.6.0 :1 > Integer('foo', exception: false)
#=> nil
2.6.0 :2 > Float('foo', exception: false)
#=> nil 

2.6.0 :1 > Benchmark.ips do |x|
2.6.0 :2 >   x.report("rescue") {
2.6.0 :3 >     Integer('foo') rescue nil
2.6.0 :4 >   }
2.6.0 :5 >   x.report("kwarg") {
2.6.0 :6 >     Integer('foo', exception: false)
2.6.0 :7 >   }
2.6.0 :8 >   x.compare!
2.6.0 :9 > end
Warming up --------------------------------------
              rescue    57.120k i/100ms
               kwarg   235.373k i/100ms
Calculating -------------------------------------
              rescue    666.623k (± 1.9%) i/s -      3.370M in   5.057321s
               kwarg      3.615M (± 0.8%) i/s -     18.124M in   5.013689s

Comparison:
               kwarg:  3615095.7 i/s
              rescue:   666623.0 i/s - 5.42x  slower
```
Với lựa chọn `exception` chúng ta có thể kiểm soát được hành vi của phương thức thay vì sử dụng `rescue` như ở các phiên bản
trước và điều này cũng giúp phần tăng tốc độ xử lý (nhanh hơn 5.42x so với sử dụng rescue ở ví dụ trên).

##### 7. Random.bytes
Để sinh ra các byte ngẫu nhiên chúng ta đã quá quen với phương thức `SecureRandom#random_bytes`, ở phiên bản 2.6.0 có
thêm phương thức `Random#bytes` với tốc độ xử lý nhanh hơn nhiều (gấp 8.27x).

```ruby
2.6.0 :1 > Benchmark.ips do |x|
2.6.0 :2 >   x.report("random bytes") {
2.6.0 :3 >     Random.bytes(10)
2.6.0 :4 >   }
2.6.0 :5 >   x.report("secure random bytes") {
2.6.0 :6 >     SecureRandom.random_bytes(10)
2.6.0 :7 >   }
2.6.0 :8 >   x.compare!
2.6.0 :9 > end
Warming up --------------------------------------
        random bytes   449.938k i/100ms
 secure random bytes   116.499k i/100ms
Calculating -------------------------------------
        random bytes     11.778M (± 5.2%) i/s -     58.942M in   5.020230s
 secure random bytes      1.424M (± 3.2%) i/s -      7.223M in   5.078557s

Comparison:
        random bytes: 11778264.6 i/s
 secure random bytes:  1423807.3 i/s - 8.27x  slower
```

##### 8. Array#union & Array#difference
Hai phương thức mới `#union` và `#difference` được thêm vào lớp `Array` trong Ruby 2.6, để phân biệt và kết hợp giữa các
mảng.

```ruby
2.6.0 :1 > [1,2,3,4,5].difference([3])
#=> [1, 2, 4, 5] 
2.6.0 :2 > [1,2,3,4,5].union([5,6,7])
#=> [1, 2, 3, 4, 5, 6, 7]
```

##### 9. Thêm toán tử thành phần chức năng `<<` và `>>` vào `Proc`

```ruby
2.6.0 :1 > f = proc{|x| x + 2}
#=> #<Proc:0x000056240c75d290@(irb):1> 
2.6.0 :2 > g = proc{|x| x * 3}
#=> #<Proc:0x000056240c74fa78@(irb):2> 
2.6.0 :3 > (f << g).call(3)  # Gống như f.call(g.call(3))
#=> 11
2.6.0 :4 > (f >> g).call(3)  # Gống như g.call(f.call(3))
#=> 15
```

##### 10. Thêm phương thức `FileUtils#cp_lr`

Phương thức `FileUtils#ln_s` hay `FileUtils#ln_sf` (tự động `force` ghi đè khi liên kết tồn tại) sẽ tạo liên kết tượng trưng
(symbolic link), trong phiên bản mới ruby 2.6 sẽ thêm phương thức `FileUtils#cp_lr`  tạo liên kết cứng (hard link) từ thư mục
hoặc file nguồn đến thư mục đích, để hiểu rõ về 2 loại liên kết này hãy tham khảo bải viết
[hard link và symbolic link](https://saiury92.github.io/2019-02-25/hard-link-vs-symbolic-link-in-linux.html){:target="_blank"}.

```ruby
# Cài đặt thư viện 'lib' tới 'mylib' tới thư mục app.
FileUtils.rm_r 'app/mylib', :force => true
FileUtils.cp_lr 'lib/', 'app/mylib'
```