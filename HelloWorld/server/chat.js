var express = require('express');
var router = express.Router();
var dbHelper = require('./dbqs');
var socket_io = require('socket.io');
// 该路由使用的中间件
router.use(function timeLog(req, res, next) {
	/*res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "x-requested-with");
    res.header('Access-Control-Allow-Headers', 'content-type');*/
  console.log('Time: ', Date.now());
  next();
});
 
//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = {};
 
//按用户的userid保存生成的socket
var users = {};
router.prepareSocketIO = function (server) {
	console.log("-----------------群聊---------------");
	 var io = socket_io(server);
	io.on('connection', function(socket){
    console.log('a user connected');
     
    //监听新用户加入
    socket.on('login', function(obj){
        //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
        socket.name = obj.userid;
        socket.groupid = obj.groupid;
        users[obj.userid] = socket;//保存当前用户的socket,还是放到外面
        //检查在线列表，如果不在里面就加入
        if(!onlineUsers[obj.groupid])onlineUsers[obj.groupid]={};
        if(!onlineCount[obj.groupid])onlineCount[obj.groupid]=0;
        if(!onlineUsers[obj.groupid].hasOwnProperty(obj.userid)) {
            onlineUsers[obj.groupid][obj.userid] = obj.username;
            
            
            
            //在线人数+1
            onlineCount[obj.groupid]++;
        }
         
        //向所有客户端广播用户加入
        io.emit('login'+obj.groupid, {onlineUsers:onlineUsers[obj.groupid], onlineCount:onlineCount[obj.groupid], user:obj});
        console.log(obj.username+'加入了聊天室');
    });
     
    //监听用户退出
    socket.on('disconnect', function(){
        //将退出的用户从在线列表中删除
        if(onlineUsers.hasOwnProperty(socket.name)) {
            //退出用户的信息
            var obj = {userid:socket.name, username:onlineUsers[socket.name]};
             
            //删除
            delete onlineUsers[socket.groupid][socket.name];
            //在线人数-1
            onlineCount[socket.groupid]--;
             
            //向所有客户端广播用户退出
            io.emit('logout'+socket.groupid, {onlineUsers:onlineUsers[socket.groupid], onlineCount:onlineCount[obj.groupid], user:obj});
            console.log(obj.username+'退出了聊天室');
        }
    });
     
    //监听用户发布聊天内容
    socket.on('message', function(obj){
        //向所有客户端广播发布的消息
        io.emit('message'+obj.groupid, obj);
       // console.log(obj.username+'说：'+obj.content);
    });
   
});
}

//http.listen(3000, function(){
//  console.log('listening on *:3000');
//});
module.exports = router;