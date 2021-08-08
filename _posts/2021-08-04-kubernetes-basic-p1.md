---
title: 'Kubernetes Part I | Khái niệm và kiến trúc'
layout:   post
category: tutorial-tips
tags:     [kubernetes]
feature:  /assets/img/kubernetes/kubernetes-p1.png
---

Hí anh em, đến hẹn lại lên một năm viết một bài, tôi đã quay trở lại rồi đây - với loạt bài về kubernetes,
dự kiến sẽ gồm 5 đến 6 phần, nhưng cũng có thể kết thúc ngay ở part I này tùy hứng, rất mong anh em ủng hộ và góp 
ý để cải thiện bài viết tốt hơn.

<!--more-->

Trong phần hôm nay, tôi sẽ giới thiệu đến với các bạn những khái niệm, thành phần <s>và kiến trúc</s> cơ bản nên anh em nào không hứng thú
với mớ lý thuyết thì có thể đợi phần sau.

## Kubernetes là gì?
Kubernetes, tiếng việt là kư bơ nét dis, hay viết tắt bằng cách bỏ đi 8 chữ ubernete là k8s, được biết đến như
một nền tảng mã nguồn mở giúp triển khai, mở rộng và quản lý các ứng dụng dưới dạng container (containerized applications).
Ta có thể sử dụng k8s on-premises hoặc các k8s service được quản lý bởi cloud provider như Kubernetes Engine(Google Cloud),
Amazon EKS(AWS), Azure Kubernetes Service - AKS (Microsoft Azure).

## Kubernetes làm được gì?
Kubernetes cung cấp nhiều tính năng như service discovery, load balancing, rollout, rollback, self-healing,.. giúp cho
việc triển khai, mở rộng và quản lý các ứng dụng microservices, với hàng trăm hàng ngàn container một cách đơn giản và dễ dàng.
- Service discovery, load balancing: Khi ứng dụng triển khai trên nhiều container, số lượng container có thể tăng giảm,
  bị xóa hoặc thêm mới. Kubernetes luôn đảm bảo sự ổn định truy cập (zero-downtime) bằng cách expose một DNS endpoint hoặc external ip 
  làm entry point cho các container, khi lưu lượng truy cập tăng cao sẽ được cân bằng tải, phân phối lưu lượng truy cập đến các container.
- Automated rollouts and rollback: Thêm mới, xóa, nhân rộng, thu hẹp số lượng container cho ứng dụng rất đơn giản chỉ cần mô tả 
  trong manifest file hoặc command line.
- Self-healing: K8s tự khởi động lại các container bị lỗi, thay thế, loại bỏ các container không phản hồi health-check mà ta đã
định nghĩa.
  
Ngoài ra Kubernetes còn làm rất nhiều thứ hay ho khác khi chúng ta tìm hiểu sâu về nó. 

## Kubernetes concepts?
Trong kubernetes có rất nhiều khái niệm mà phải mất hàng tuần ta mới có thể học được hết, dưới đây tôi chỉ đưa ra một số 
các khái niệm cơ bản mà chúng ta cần phải biết.
* Pod: Là đơn vị nhỏ nhất trong k8s chứa một hoặc nhiều container, và chỉ nên triển khai một ứng dụng trên một pod. Mỗi 
  pod sẽ sở hữu một internal ip riêng và có thể communicate với nhau. Pod là ephemeral, nó có thể bị xóa, thay thế.
  ![](/assets/img/kubernetes/k8s-pod.png){: style='margin: 10px; width: 100%'}
* Service: Là layer nằm trên nhiều pod được xác định dựa trên label và đại diện cho entry point truy cập vào các pod đó.  Mỗi service 
  có địa chỉ IP và port không đổi. Client có thể kết nối đến IP và port của service, sau đó sẽ được điều hướng đến các pod để xử lý.
  Trong mô hình microservices, ta có thể sử dụng external service cho frontend, và sử dụng internal service cho api server hay database.
  ![](/assets/img/kubernetes/k8s-svc.png){: style='margin: 10px; width: 100%'}
* Ingress: Với external service ta hoàn toàn có thể truy cập từ bên ngoài thông qua IP và port của service. Nhưng để giải 
  quyết về terminate SSL/TLS, routing traffic, externally-reachable URLs hay là name-based virtual hosting thì ingress sẽ
  giải quyết các vấn đề này.
  ![](/assets/img/kubernetes/k8s-ing.png){: style='margin: 10px; width: 100%'}
* ConfigMap: Lưu trữ các cấu hình của biến môi trường ứng dụng trong pod hay thiết lập các argument khi gọi câu lệnh,
  giúp tách biệt phần cấu hình với phần code.
  ![](/assets/img/kubernetes/k8s-cfm.png){: style='margin: 10px; width: 100%'}
* Secret: ConfigMap chỉ dùng để lưu trữ non-confidential data còn với những data yêu cầu tính bảo mật như password, token hay key
  ta sẽ sử dụng secret, data của sẽ được mã hóa theo kiểu base64.
  ![](/assets/img/kubernetes/k8s-secret.png){: style='margin: 10px; width: 100%'}
* Deployment: Cung cấp khai báo cấu hình cho tập hợp các pods như số lượng replica của pod, container image sử dựng là gì, port của
  container, strategy cho rolling update, ...
  ![](/assets/img/kubernetes/k8s-deploy.png){: style='margin: 10px; width: 100%'}
* Statefulset: Chúng ta biết khi client gửi dữ liệu lên server, server thực thi xong, trả kết quả thì “quan hệ” giữa client và server bị “cắt đứt” – server 
  không lưu bất cứ dữ liệu gì của client đó là stateless app. Còn với stateful app thì có sự ràng buộc giữa client và server sau mỗi request,
  data được lưu lại phía server có thể làm input parameters cho lần kế tiếp. Statefulset cơ bản là như Deployment, nhưng nó cung cấp persistent storage để tránh
  mất dữ liệu khi pod bị crash, các pod trong statefulset đều có thứ tự và được định danh nó giúp cho việc khi client tương tác
  tới pod cho phép 'sticky sessions', đảm bảo client go back đến pod thường xuyên nhất có thể. Tuy giúp cho ứng dụng nhất
  quán về mặt dữ liệu nhưng thiết lập statefulset phức tạp nên chúng ta thường sử dụng stateful app, database ngoài cluster.
  ![](/assets/img/kubernetes/k8s-statefulset.png){: style='margin: 10px; width: 100%'}
  
Lý thuyết nhàm chán đúng không nào? Tôi hứa sẽ các cho bạn thực hành mớ lý trên ở bài **minikube** trong phần III, và **helm** trong phần IV.
Còn [phần II](https://blog.thiennk.net/2021-08-08/kubernetes-basic-p2.html) tôi vẫn sẽ tiếp tục giới thiệu về kiến trúc k8s với nhưng khái niệm master node, worker node, APIServer, Etcd, .. 
Chào thân ái và hiện gặp lại !

