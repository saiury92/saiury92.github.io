---
title: 'Kubernetes Part III | Triển khai ứng dụng hello world với minikube'
layout:   post
category: tutorial-tips
tags:     [kubernetes]
feature:  /assets/img/kubernetes/kubernetes-p3.png
---

Chào anh em ! Sau loạt bài khái niệm và kiến trúc [part I](https://blog.thiennk.net/2021-08-04/kubernetes-basic-p1.html?){:target="_blank"} và [part II](https://blog.thiennk.net/2021-08-08/kubernetes-basic-p2.html){:target="_blank"} thì tôi được đi tiêm vaccine phòng covid, và sau một tuần kiêng chất kích thích thì nay tôi mới được dùng lại để có cảm hướng gửi tới anh em phần tiếp theo.

<!--more-->

Hôm nay, tôi sẽ giới thiệu cho anh em về  công cụ minikube và một số  câu lệnh kubectl giúp chạy ứng dụng đơn giản trên local.

## Minikube là gì?
Minikube là một công cụ giúp developer thực hành và triển khai các ứng dụng trên local. Minikube dùng virtual machine để tạo ra một single node k8s cluster. Thông thường một k8s cluster sẽ gồm master node và worker node nhưng với minikube thì các process của master và worker sẽ chạy chung trên một node dưới dạng các container. Ngoài minikube chúng ta có thể  sử dụng một số công cụ khác để thực hành trên local như kind và k3s.
![](/assets/img/kubernetes/minikube.png){: style='margin-top: 10px; margin-bottom: 10px; width: 100%'}

Việc cài đặt minikube khá đơn giản, anh em truy cập đường dẫn dưới đây để tiến hành cài đặt minikube:
``` none
https://minikube.sigs.k8s.io/docs/start

```

Sau khi cài đặt minikube xong, chạy ```minikube start``` để  tạo và khởi động k8s cluster. Chạy ```minikube status``` để kiểm tra
trang thái hoạt động.
``` bash
minikube start
minikube status
```
![](/assets/img/kubernetes/minikube-start.png){: style='margin-top: 10px; margin-bottom: 10px; width: 100%'}

## Kubectl là gì?
Như trong phần lý thuyết đã đề cập ở trước, API server cung cấp RESTful API cho client tương tác với k8s cluster, và để  gọi đến API server đó thì ta sẽ sử dụng các câu lệnh kubectl. Dưới hình sau đây là một số câu lệnh chính:
![](/assets/img/kubernetes/kubectl.png){: style='margin-top: 10px; margin-bottom: 10px; width: 100%'}

## Triển khai ứng dụng hello world sử  dụng kubectl?
Trước khi triển khai ứng dụng tới k8s, tôi đã chuẩn bị trước một image chứa ứng dụng hello-world và đưa nó lên DockerHub.
Để kiểm tra hoạt động của ứng dụng trong image ta có thể  sử dụng docker để chạy container trên local.
``` bash
docker run --rm -it -p 3000:3000 saiury92/hello-world:latest
```
![](/assets/img/kubernetes/image-hello.png){: style='margin-top: 10px; margin-bottom: 10px; width: 100%'}
Ứng dụng sẽ chạy trên port 3000 và hiển thị trên browser dòng chữ "Hello World, I am Saiury92" kèm theo private ip của container đang chạy ứng dụng. Nhiệm vụ của chúng ta bây giờ là triển khai ứng dụng trên 2 pod khác nhau và sử dụng k8s service với nhiệm vụ cân bằng tải.
#### 1. Tạo deployment
Sử dụng câu lệnh ```kubectl create deployment``` để tạo deployment với tên là **hello-world**
``` bash
kubectl create deployment hello-world \
    --replicas=2 \
    --image=saiury92/hello-world:latest \
    --port=3000
```
![](/assets/img/kubernetes/create-deployment.png){: style='margin-top: 10px; margin-bottom: 10px; width: 100%'}
Với option **--replicas=2** là số lượng pod được tạo, **--image=saiury92/hello-world:latest** xác định image để tạo container, **--port=3000** là port của container được expose.
#### 2. Tạo service
Sử dụng câu lệnh ```kubectl expose deployment hello-world``` để tạo service cho **hello-world** deployment.
``` bash
kubectl expose deployment hello-world \
    --type=LoadBalancer \
    --port=8080 \
    --target-port=3000
```
![](/assets/img/kubernetes/create-service.png){: style='margin-top: 10px; margin-bottom: 10px; width: 100%'}
Với option **--type=LoadBalancer** là loại service được tạo, đến đây các bạn sẽ thắc mắc sao không phải loại khác như ClusterIP hay NodePort, lý do đơn giản là vì với loại LoadBalancer thì chúng ta sẽ dễ  dàng expose một external-ip ra bên ngoài thông qua ```minikube tunnel```. Option **--port=8080** là port để truy cập service từ bên ngoài, **--target-port=3000** là port của container mà service gửi traffic tới.
#### 3. Truy cập ứng dụng
![](/assets/img/kubernetes/external-ip-pending.png){: style='margin-top: 10px; margin-bottom: 10px; width: 100%'}
Trang thái **EXTERNAL-IP** đang là **pending**, để truy cập được vào ứng dụng ta mở thêm tab mới ở terminal chạy ```minikube tunnel``` để expose external-ip.
![](/assets/img/kubernetes/external-ip.png){: style='margin-top: 10px; margin-bottom: 10px; width: 100%'}

Sau khi hoàn tất việc expose external-ip, ta có thể truy cập ứng dụng thông qua địa chỉ sau:
``` none
http://REPLACE_WITH_EXTERNAL_IP:8080
``` 
![](/assets/img/kubernetes/app.png){: style='margin-top: 10px; margin-bottom: 10px; width: 100%'}

Khi chúng ta refresh nhiều lần trên browser, thì traffic sẽ được cân bằng tải trên hai container khác nhau với ip là **172.17.0.7** và **172.17.0.8**

## Triển khai ứng dụng hello world sử  dụng yaml file?
Đến đây hẳn anh em đã nhận thấy sự bất cập của việc sử dụng câu lệnh, khi chúng ta muốn thay đổi nhiều cấu hình khác nhau thì câu lênh sẽ phức tạp hơn. Do đó, chúng ta có thể gom tất cả các cấu hình vào trong yaml file để dễ quản lý và chia sẻ.

Trước khi vào phần thực hành tiếp theo tôi sẽ clean up các resource đã tạo phần trước.
``` bash
kubectl delete service hello-world
kubectl delete deployment hello-world
```
![](/assets/img/kubernetes/cleanup-1.png){: style='margin-top: 10px; margin-bottom: 10px; width: 100%'}


#### 1. Tạo yaml file
Tạo file **hello-world.yaml** có nội dụng như dưới đây
``` bash
vi ~/hello-world.yaml
```
``` yaml
# Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-world
  labels:
    app: hello-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hello-app # has to match .spec.template.metadata.labels
  template:
    metadata:
      labels:
        app: hello-app # has to match .spec.selector.matchLabels
    spec:
      containers:
        - name: hello-world
          image: saiury92/hello-world:latest
          ports:
            - name: http
              containerPort: 3000
              protocol: TCP

---
# Service
apiVersion: v1
kind: Service
metadata:
  name: hello-world
spec:
  type: LoadBalancer
  selector:
    app: hello-app
  ports:
    - port: 8080
      targetPort: 3000
```
Chúng ta có thể tách source của deployment và service ra làm 2 yaml file khác nhau, nhưng để đơn giản tôi cho chung vào một file để triển khai cho nhanh.

#### 2. Tạo deployment và service
Sử dụng câu lệnh ```kubectl apply``` để tạo đồng thời deployment và service.
``` bash
kubectl apply -f ~/hello-world.yaml
```
![](/assets/img/kubernetes/kubectl-apply.png){: style='margin-top: 10px; margin-bottom: 10px; width: 100%'}

Việc truy cập ứng dụng bằng cách thông qua ```minikube tunnel``` giống như phần trên.

#### 2. Clean up
Sử dụng câu lệnh ```kubectl delete``` để xoá các resource.
``` bash
kubectl apply -f ~/hello-world.yaml
```
![](/assets/img/kubernetes/cleanup-2.png){: style='margin-top: 10px; margin-bottom: 10px; width: 100%'}

Tôi đang định gửi tới anh em thêm phần scale up số lượng pod nhưng bài viết hơi dài, để anh em thực hành như vậy là quá đủ trong một ngày rùi, nên tôi sẽ dừng bài viết ở đây đi ngủ để tối ưu hệ miễn dịch sau khi tiêm vaccine. Ak quên, phần sau tôi sẽ giới thiệu về  **helm** có gì
anh em cài đặt trước đi nhé. Còn bây giờ chào thân ái và hẹn gặp lại !