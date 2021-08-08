---
title: 'Kubernetes Part II | Khái niệm và kiến trúc'
layout:   post
category: tutorial-tips
tags:     [kubernetes]
feature:  /assets/img/kubernetes/kubernetes-p2.png
---

Hí anh em, sau bài viết [Part I](https://blog.thiennk.net/2021-08-04/kubernetes-basic-p1.html) nhận
được sự quan tâm, động viên và ủng hộ rất lớn từ anh em, tôi xin mạn phép được tát nước theo mưa tiếp tục
gửi tới anh em part II, nội dung chính vẫn là một số khái niệm và kiến trúc trong K8s.

<!--more-->

![](/assets/img/kubernetes/k8s-architecture-1.png?style=center){: style='margin: 10px; width: 100%'}

K8s cluster là tập hợp nhiều node, node có thể là physical machine hoặc virtual machine, node cung cấp
các tài nguyên như computing, memory , storage, networking. Một số tài liệu cũ node còn gọi là Minion.
Có hai loại node chính trong k8s cluster đó là master node và worker node.

## Master node
Master node còn gọi là control plane, chịu trách nhiệm quản lý K8s cluster. Thông thường master node gồm
4 thành phần chính bên trong là API server, scheduler, controller manager và etcd. Ngoài ra, khi k8s cluster chạy trên các
cloud provider thì có thêm cloud controller manager.
![](/assets/img/kubernetes/master-node.png?style=center){: style='margin-top: 10px; margin-bottom: 10px; width: 60%'}
* API server: Cung cấp RESTful API cho client (như kubectl) tương tác với k8s, và giúp các thành phần khác trong cluster liên lạc với
nhau.
  ![](/assets/img/kubernetes/api-server.png?style=center){: style='margin-top: 10px; margin-bottom: 10px; width: 70%'}
* Scheduler: Sử dụng k8s API để theo dõi các pod chưa được lên lịch (pod chưa được gán vào node nào). Sau đó, scheduler sẽ đặt
  các pod đó vào các node thích hợp dựa trên tài nguyên hiện có và các ràng buộc khác được định nghĩa trong manifest file của pod. Scheduler
  đảm bảo các pod của cùng application được phân bố trên các node khác nhau để đảm bảo tính khả dụng.
  ![](/assets/img/kubernetes/scheduler.png?style=center){: style='margin-top: 10px; margin-bottom: 10px; width: 100%'}
* Controller Manager: Quản lý các controllers trong cluster. Về mặt logic thì mỗi controller là một process riêng biệt, nhưng để giảm độ phức tạp, tất cả controllers được biên dịch thành một tệp nhị phân duy nhất (single binary) và chạy trong một process duy nhất. Một số loại controller này là:
  * Node controller: Theo dõi, thông báo phản hồi khi node gặp sự cố.
  * Job controller: Job là một đối tượng của k8s chạy trên một hoặc một số pod, để thực hiện một tác vụ tới khi hoàn thành. Khi có một job mới, Job controller sẽ yêu cầu API server tạo pod và xóa pod khi job hoàn thành.
  * Replication controller: Chịu trách nhiệm duy trì số lượng pods theo đúng số lượng mong muốn.
  * Endpoints controller: Kết nối services và pods với nhau.
  * Service Account & Token controllers: Tạo account mặc định và API access token cho những namespace mới.
* Etcd: đơn giản nó là cơ sở dữ liệu của k8s cluster, cụ thể hơn nó là một cơ sở dữ liệu phân tán lưu trữ dưới dạng key-value, nhẹ, bền vững và tính khả dụng cao chỉ giao tiếp mới API Server. Etcd lưu trữ cấu hình, trạng thái, các thay đổi, nói chung là tất cả thông tin của k8s cluster.
* Cloud controller manager: Giúp tương tác với các API của cloud provider khi k8s cluster chạy trên các cloud provider đó.
  
## Worker node
![](/assets/img/kubernetes/worker-node-1.png?style=center){: style='margin-top: 10px; margin-bottom: 10px; width: 100%'}
Worker node là nơi mà các ứng dụng được triển khai. Trong một k8s cluster có thể  có nhiều worker nodes, trong một worker node có thể có nhiều pods, trong pod có thể có nhiều containers. Worker node gồm 3 thành phần chính: kube-proxy, kubelet, container runtime.
![](/assets/img/kubernetes/worker-node-2.png?style=center){: style='margin-top: 10px; margin-bottom: 10px;}
* Kubelet là một node agent hoạt động dưới dạng PodSpec. Kubelet nhận tập các PodSpecs (đặc tính của Pod) được cung cấp thông qua các cơ chế khác nhau và bảo đảm rằng các containers được mô tả trong những PodSpecs này chạy ổn định và khỏe mạnh (healthy).
![](/assets/img/kubernetes/podSpec.png?style=center){: style='margin-top: 10px; margin-bottom: 10px; width: 60%'}
* Kube-proxy là một dịch vụ network proxy chạy trên mỗi node, giúp các pods giao tiếp với nhau và ra bên ngoài.
* Container runtime là một dịch vụ dùng để chạy các containers, một số container runtimes phổ biến như: containerd, CRI-O, Docker.


Trải qua [Part I](https://blog.thiennk.net/2021-08-04/kubernetes-basic-p1.html) và Part II dường như chúng ta đã hình dung được k8s là gì, thành phần cơ bản nó là gì. Nếu anh em còn bỡ ngỡ thì đừng lo, hôm sau tôi sẽ giới thiệu cho các bạn bài về **minikube** giúp chúng ta thực hành k8s trên local để hiểu chi tiết hơn.