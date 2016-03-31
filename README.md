# newbeely

    简单易用的轻量级nodejs服务框架.
    框架简单到只有组件逻辑,不同的组件提供不同的服务,使用外部的配置文件(只有一个配置文件)方便的组合成一个完整的服务框架.
    整个服务使用bearcat(网易开源的nodejs面向切面编程的轻量级框架(AOP))管理,极大的解耦组件间的耦合.(关于代码热更新后续开放).
    
    网络服务 支持http方式的api服务和基于express的web服务.
        1. http 组件: httpComponent
        2. express 组件: expressComponent
        3. 基于 web socket 和 socket io的长连接机制后续完善.
        
    数据库支持mongodb,redis.
        1. mongodb 使用mongoose作为中间件
            mongooseComponent 纯粹的mongoose组件
            mongooseRedisCacheComponent 优化mongodb io压力. 用redis作为读取缓存.
        2. redis  使用连接池实现的一个redis客户端组件
        
    分布式rpc组件(未完成)
        使用redis的subscribe机制广播作为rpc调用的机制 可以理解为借用redis实现一个mqtt协议的服务.
        
    自动生成的项目带有pm2启动部署的配置文件(前提是安装pm2的linux系统下使用).
        根目录内的app.json 是一个描述pm2启动的配置,具体参数请产考pm2官方文档)
        根目录内提供了start和stop的shell脚本,直接在linux内启动服务.
        
    补充:
        1. bearcat 官方目录 https://github.com/bearcatjs/bearcat
        2. pm2 官方目录 https://github.com/Unitech/pm2
        
### Install

    npm install newbeely-nodejs -g

### Create project (on current direction)

    newbeely init
    newbeely init project-name
    
### Components describe

    httpComponent : https://github.com/Gandalfull/newbeely-nodejs/blob/master/lib/components/httpComponent/ReadMe.MD
    expressComponent : https://github.com/Gandalfull/newbeely-nodejs/blob/master/lib/components/expressComponent/ReadMe.MD
    mongooseComponent : https://github.com/Gandalfull/newbeely-nodejs/blob/master/lib/components/mongooseComponent/ReadMe.MD
    mongooseRedisComponent : https://github.com/Gandalfull/newbeely-nodejs/blob/master/lib/components/mongooseRedisCacheComponent/ReadMe.MD
    redisComponent : https://github.com/Gandalfull/newbeely-nodejs/blob/master/lib/components/redisComponent/ReadMe.MD