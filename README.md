<p align="center">
<a href="http://www.oracle.com/technetwork/java/javase/overview/index.html"><img src="https://img.shields.io/badge/language-java%208.0-orange.svg"></a>
<a href="https://www.jetbrains.com/idea/"><img src="https://img.shields.io/badge/platform-jetbrains-green.svg"></a>
<a href="http://projects.spring.io/spring-boot/"><img src="https://img.shields.io/badge/SpringBoot-2.2.0.M4-990066.svg"></a>
<img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg">
<img src="https://img.shields.io/badge/release-0.1.0-brightgreen.svg">
</p>

# michat
一个基于小米即时消息云服务(MIMC)的Web IM。  
源码地址[github](https://github.com/jeesun/michat)和[gitee](https://gitee.com/jeesun/michat)同步。

## 截图展示
![聊天截图](screenshots/chat.png)

## 如何使用
直接运行类MichatApplication，启动项目。访问[http://localhost:8081/login](http://localhost:8081/login)，登录账号。默认配置了以下账号做测试：
```
用户名 密码
user 123456
admin 123456
jack 123456
rose 123456
simon 123456
ddd 123456
```

## 如何配置自己的MIMC
登录[https://dev.mi.com/console/appservice/mimc.html](https://dev.mi.com/console/appservice/mimc.html)，注册并创建应用，修改
chatIndex.js的mimc_appId，mimc_appSecret，mimc_appKey为你自己的值。
