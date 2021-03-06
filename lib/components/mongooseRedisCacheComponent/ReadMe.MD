#简介
    使用mongoose驱动mongodb的一个数据库组件,对比mongooseComponent组件差异在这个组件可以通过配置Schema的 redisCache来控制是否使用 redis加速查询.

#配置
   config/services.json

    {
        "YourName":{
            "bean":"mongooseComponent","host":"localhost","port":27017,"dbname":"test","user":"admin","password":"adafdsfgarfg","pool":1,"redis":{
                "host":"127.0.0.1",
                "port":6379,
                "pass":""
            }
        }
    }
    编写后在项目根目录内创建 app/YourName文件夹, 然后在YourName内创建 context.json 文件 和 schemas 文件夹
   
   context.json
   
    { "name":"YourName","beans":[] }
    
   工具生成
    
    npm install newbeely-nodejs -g
    newbeely init
    
    ...
    
    {input 3:YourName}
    
   参数详解
   
    YourName: 自定义组件名称 这个名称可以在工程内任意地方使用 Bearcat.getBean('application').getComponent('YourName') 获得到组件对象.
    bean:必须指定为expressComponent
    host:数据库地址
    port:数据库服务端口号
    user:认证用户名
    password:认证用户密码
    dbname:待连接的数据库名称
    pool:保活的连接数
    redis:{
        "host":redis的服务地址,
        "port":redis的服务端口,
        "pass":redis提供的秘钥
    }
    
#数据库表schema规范
   可以参考 mongoose 官方提供的规范
   以下为工具生成的代码模板 
   
    var Mongoose = require('mongoose');
    var Table = {
        createTime: {type: Date, index: -1},
        data: {type: Mongoose.Schema.Types.Mixed, default: {}},
        uid: {type: String, default: ""}
    };
    var SchemaOption = {};
    var Schema = new Mongoose.Schema(Table, SchemaOption);
    Schema.set('redisCache','loggerSchema');
    Schema.set('expire',60000);
    
    module.exports = {
        "name": "example",
        "schema": Schema
    };
   导出的 name 视为数据库表名
   
       /// 设置使用 redis加速read 
       Schema.set('redisCache','loggerSchema');
       /// 设置redis缓存有效期 单位是秒
       Schema.set('expire',60000);