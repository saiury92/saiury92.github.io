---
title: 'Sử dụng ansible để thiết lập và triển khai nodejs app tới docker containners'
layout:   post
category: tutorial-tips
tags:     [ansible, docker, nodejs]
feature:  /assets/img/ansible-docker-nodejs.png
---

Hôm nay, Hà Nội về đông lạnh quá ! Sáng đến công ty lúc 7h30, hành ông anh đôi trận PES, ăn sáng, rùi lóc cóc bật slack xem có task mới nào không ? Á đù "Hiện tại khách hàng chưa có task mới nhé, nên có thể làm việc khác", ông PM nhắn tin. Ngồi không vừa buồn ngủ vừa lạnh, check telegram thì không gì mới, nghĩ đến cái blog "màng nhện giăng tơ...", thui đành ngồi chia sẻ đôi chút cho anh em về ansible đêm qua nằm mơ học được.

<!--more-->

Trong bài viết này, mình sẽ sử dụng hai docker containners như cái chiếu mới, chẳng cái cắm gì, được base từ `ubuntu:18.04`
, à có cài `openssh-server` để  có thể ssh vào từ ngoài host và python để  ansible có thể vận công trong đó. Ansible sẽ thực thi playbooks để cài đặt môi trường nodejs và triển khai ứng dụng nodejs vào trong hai cái containners đó ! Tất nhiên các bạn cần phải [cài docker](https://docs.docker.com/engine/install){:target="_blank"} và [cài ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html#installing-ansible-on-ubuntu){:target="_blank"} vào máy host của các bạn nhé.

## Ansible Là gì ?
Hiểu đơn giản nó là một platform opensource, bạn cần khai báo địa chỉ server đích và các tập lệnh, ansible sẽ giúp bạn thực thi các script bạn vừa viết trong server đó. Trong bài viết sử dụng hai docker containners như hai server đích.

## Tạo docker containers
Sử  dụng `Dockerfile` dưới đây để tạo `ubuntu-ssh-enabled` image
```ruby
FROM ubuntu:18.04

RUN apt-get update && apt-get install -y openssh-server && apt-get install -y python python-setuptools python-dev build-essential
RUN mkdir /var/run/sshd
RUN echo 'root:Passw0rd' | chpasswd
RUN sed -i 's/#*PermitRootLogin prohibit-password/PermitRootLogin yes/g' /etc/ssh/sshd_config

# SSH login fix. Otherwise user is kicked off after login
RUN sed -i 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' /etc/pam.d/sshd

ENV NOTVISIBLE "in users profile"
RUN echo "export VISIBLE=now" >> /etc/profile

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D"]
```

```properties
# Tạo image với tên ubuntu-ssh-enabled
ubuntu:~$ docker build -t ubuntu-ssh-enabled .
```

Tạo hai docker containners từ image trên

```properties
# Tạo containner với tên node-server1
ubuntu:~$ docker run -itd --name node-server1 ubuntu-ssh-enabled

# Tạo containner với tên node-server2
ubuntu:~$ docker run -itd --name node-server2 ubuntu-ssh-enabled

# Danh sách các containner đang chạy
ubuntu:~$ docker ps
#CONTAINER ID        IMAGE                COMMAND               CREATED             STATUS              PORTS               NAMES
#176489c45758        ubuntu-ssh-enabled   "/usr/sbin/sshd -D"   About an hour ago   Up About an hour    22/tcp              node-server2
#50649e702271        ubuntu-ssh-enabled   "/usr/sbin/sshd -D"   About an hour ago   Up About an hour    22/tcp              node-server1
```

Kiểm tra ssh connection vào các containers trên từ host<br />
Username: `root`<br />
Password: `Passw0rd`

```properties
# Lấy ip của node-server1 container
ubuntu:~$ docker inspect -f '{{ site.data.docker.inspect-format }}' node-server1
#172.17.0.2

# Lấy ip của node-server2 container
ubuntu:~$ docker inspect -f '{{ site.data.docker.inspect-format }}' node-server2
#172.17.0.3

# Kết nối tới node-server1 container
ubuntu:~$ ssh root@172.17.0.2
root@172.17.0.2's password:

# Welcome to Ubuntu 18.04.3 LTS (GNU/Linux 4.15.0-123-generic x86_64)

#  * Documentation:  https://help.ubuntu.com
#  * Management:     https://landscape.canonical.com
#  * Support:        https://ubuntu.com/advantage

# This system has been minimized by removing packages and content that are
# not required on a system that users do not log into.

# To restore this content, you can run the 'unminimize' command.
# Last login: Thu Nov 19 04:55:09 2020 from 172.17.0.1
# root@50649e702271:~#
```

## Thiết lập ansible
Tạo folder chứa tất cả config và source code nodejs sau này

```properties
ubuntu:~$ mkdir ~/docker-ansible-nodejs && cd $_
```

Trong folder trên, tạo file `inventory` để định nghĩa thông tin host name cho các server containers

```ruby
# ~/docker-ansible-nodejs/inventory
node-server1
node-server2
```

Có thể thiết lập các thông số như ssh user hay ssh password ở ngay trong file `inventory` trên, nhưng để chuyên nghiệp và dễ dàng quản lý các host name, ta nên thiết lập các cấu hình đó vào trong các file yml tương ứng với các host name ở folder `host_vars`. Cụ thể  trong phạm vi bài viết là  hai file `~/docker-ansible-nodejs/host_vars/node-server1.yml` và `~/docker-ansible-nodejs/host_vars/node-server2.yml` (chú ý tên file phải trùng với host name ở inventory)

```yml
# Tạo file ~/docker-ansible-nodejs/host_vars/node-server1.yml
ansible_host: 172.17.0.2 # container ip của node-server1
ansible_user: root
ansible_ssh_pass: Passw0rd
ansible_ssh_extra_args: -o StrictHostKeyChecking=no
ansible_python_interpreter: /usr/bin/python

# Tạo file ~/docker-ansible-nodejs/host_vars/node-server2.yml
ansible_host: 172.17.0.3 # container ip của node-server2
ansible_user: root
ansible_ssh_pass: Passw0rd
ansible_ssh_extra_args: -o StrictHostKeyChecking=no
ansible_python_interpreter: /usr/bin/python
```

Kiểm tra kết nối xem có hoạt động hay không, ta sử dụng ansible để ping đến các containers

```bash
ubuntu:~/docker-ansible-nodejs$ ansible node-server* -m ping -i inventory
# Output
node-server1 | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
node-server2 | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
```
Sau khi đã kết nối vào các container, bước tiếp theo là tạo file playbook yml chứa các task cần tự động hóa như cài môi trường nodejs, copy js file cho app vào trong các containers, chạy server nodejs ,...

```yml
# Tạo file ~/docker-ansible-nodejs/main.yml
- name: Deploy a Web Application
  hosts: node-server1, node-server2
  tasks:
    - name: Nodejs | Add repository key
      apt_key:
        url: https://deb.nodesource.com/gpgkey/nodesource.gpg.key

    - name: Nodejs | Add repository
      apt_repository:
        repo: deb http://deb.nodesource.com/node_12.x {{ ansible_lsb.codename }} main
        state: present
        update_cache: yes

    - name: Nodejs | Install
      apt:
        name:
          - nodejs
        state: present

    - name: Copy source code directory src
      copy:
        src: src
        dest: /opt

    - name: Install forever (to run Node.js app).
      npm: name=forever global=yes state=present

    - name: Check list of Node.js apps running.
      command: forever list
      register: forever_list
      changed_when: false

    - name: Start Node.js app if app not running.
      command: forever start /opt/src/app.js
      when: forever_list.stdout.find('/opt/src/app.js') == -1

    - name: Restart Node.js app if app running.
      command: forever restart /opt/src/app.js
      when: forever_list.stdout.find('/opt/src/app.js') != -1
```

Cuối cùng là tạo file js `~/docker-ansible-nodejs/src/app.js` cho nodejs app demo

```js
// Tao file ~/docker-ansible-nodejs/src/app.js
const http = require('http');
const os = require('os');

const nets = os.networkInterfaces();
const results = {};
for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }

            results[name].push(net.address);
        }
    }
}
const hostname = results['eth0'][0];
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`Hello World! Server running at ${hostname}:${port}`);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
```

## Chạy main playbook
Sau khi tiến hành đầy đủ các cấu hình trên, chỉ cần chạy playbook lên ngồi uống trà và đợi thụ kết quả

```bash
ubuntu:~/docker-ansible-nodejs$ ansible-playbook main.yml -i inventory
# Output
PLAY [Deploy a Web Application] ******************************************************************************************************************************************************************************

TASK [Gathering Facts] ***************************************************************************************************************************************************************************************
ok: [node-server2]
ok: [node-server1]

TASK [Nodejs | Add repository key] ***************************************************************************************************************************************************************************
changed: [node-server2]
changed: [node-server1]

TASK [Nodejs | Add repository] *******************************************************************************************************************************************************************************
changed: [node-server1]
changed: [node-server2]

TASK [Nodejs | Install] **************************************************************************************************************************************************************************************
changed: [node-server2]
changed: [node-server1]

TASK [Copy source code directory src] ************************************************************************************************************************************************************************
changed: [node-server1]
changed: [node-server2]

TASK [Install forever (to run Node.js app).] *****************************************************************************************************************************************************************
changed: [node-server1]
changed: [node-server2]

TASK [Check list of Node.js apps running.] *******************************************************************************************************************************************************************
ok: [node-server1]
ok: [node-server2]

TASK [Start Node.js app if app not running.] *****************************************************************************************************************************************************************
changed: [node-server1]
changed: [node-server2]

TASK [Restart Node.js app if app running.] *******************************************************************************************************************************************************************
skipping: [node-server1]
skipping: [node-server2]

PLAY RECAP ***************************************************************************************************************************************************************************************************
node-server1               : ok=8    changed=6    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   
node-server2               : ok=8    changed=6    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0
```

Kiểm tra app trong hai containers xem có chạy không nào ???? Có thể truy cập vào hai địa chỉ `http://172.17.0.2:3000/` và `http://172.17.0.3:3000/` từ browser hoặc sử dụng curl

```bash
ubuntu:~/docker-ansible-nodejs$ curl 172.17.0.2:3000
# Output
Hello World! Server running at 172.17.0.2:3000

ubuntu:~/docker-ansible-nodejs$ curl 172.17.0.3:3000
# Output
Hello World! Server running at 172.17.0.3:3000
```

## Clean up
Anh em nào giống tôi không ? Máy công ty lúc nào cũng trong tình trạng full ổ đĩa nên sau khi học cái gì là phải clean up, clean up và clean up !!! Command ở dưới đây nhé các bạn !

```properties
# Xóa containners và image
ubuntu:~$ docker stop node-server1 node-server2 && docker rm node-server1 node-server2 && docker rmi ubuntu-ssh-enabled
```

###### Link --> [github](https://github.com/saiury92/docker-ansible-nodejs){:target="_blank"} <--- cho bạn nào muốn ăn xổi !!!