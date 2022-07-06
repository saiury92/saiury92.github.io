---
title: 'Distroless, Alpine, Slim - Ai là người tí hon ?'
layout:   post
category: tutorial-tips
tags:     [docker]
feature:  /assets/img/distroless-alpine-slim.png
---

Nhớ thời gian đầu khi mới học docker tôi chẳng quan tâm gì đến các loại base image cứ <strong>full official image</strong> mà sài, vừa 
an toàn vừa ổn định. Cho đến 1 ngày cái ổ cứng SSD 150GB của tôi nó bị full, check ```docker images``` thì ối dồi ôi ơi toàn image 1GB trở lên, mau mải ```docker container prune``` và ```docker image prune``` để chữa cháy tạm thời. Lên google search thì google bảo mày hãy sài <strong>alpine</strong>, đây là base image nhẹ nhất rồi. Đến hôm qua đi uống bia với thằng cu em nó giới thiệu <strong>distroless</strong> còn nhẹ hơn cả <strong>alpine</strong> ????

<!--more-->

Trăm nghe không bằng một thấy, trăm thấy không bằng tự mình build image. Mình sẽ build một nodejs express app dựa trên 4 base image và so sánh size giữa các docker image xem ai là người ti hon (source code [tại đây](https://github.com/saiury92/distroless-node-express){:target="_blank"} nhé):

### Full official image

```dockerfile
FROM node:18
ADD . /app
WORKDIR /app
RUN npm install --omit=dev
EXPOSE 3000
CMD ["index.js"]
```

Build normal-app image:

```
docker build -f Dockerfile -t normal-app .
```

### Slim image

```dockerfile
FROM node:18 AS build-env
ADD . /app
WORKDIR /app
RUN npm install --omit=dev

FROM node:18-buster-slim
COPY --from=build-env /app /app
WORKDIR /app
EXPOSE 3000
CMD ["index.js"]
```

Build slim-app image:

```
docker build -f Dockerfile.buster-slim -t slim-app .
```

### Alpine image

```dockerfile
FROM node:18 AS build-env
ADD . /app
WORKDIR /app
RUN npm install --omit=dev

FROM node:18-alpine
COPY --from=build-env /app /app
WORKDIR /app
EXPOSE 3000
CMD ["index.js"]
```

Build alpine-app image:

```
docker build -f Dockerfile.alpine -t alpine-app .
```

### Distroless image

```dockerfile
FROM node:18 AS build-env
ADD . /app
WORKDIR /app
RUN npm install --omit=dev

FROM gcr.io/distroless/nodejs:18
COPY --from=build-env /app /app
WORKDIR /app
EXPOSE 3000
CMD ["index.js"]
```
```
docker build -f Dockerfile.distroless -t distroless-app .
```

### Ai là người tí hon ?
```shell
docker images *app
=>
REPOSITORY       TAG       IMAGE ID       CREATED       SIZE
distroless-app   latest    168a0525bf63   4 hours ago   169MB
alpine-app       latest    f8ec86502d70   4 hours ago   176MB
slim-app         latest    7a6d14a968c8   4 hours ago   238MB
normal-app       latest    0e5b38441fd0   4 hours ago   1GB
```

Òa ! Như lời đồn ! <strong>distroless-app</strong> dẫn đầu với chỉ <strong>169MB</strong>, sau đó là alpine-app, slim-app, normal-app.
Vì sao nhẹ vậy như được giới thiệu ở [đây](https://github.com/GoogleContainerTools/distroless#distroless-container-images){:target="_blank"} thì <strong>"Distroless"</strong> images chỉ bao gồm ứng dụng và runtime dependencies kèm theo, lược bỏ các gói quản lý, shell và một số service khác. 

### Chú ý !
Bài viết này chỉ mang tính chất so sánh vui vẻ chứ không đi sâu vào phân tích công nghệ của distroless hay của alpine. 





