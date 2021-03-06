var express = require('express');
var dbHelper = require('./dbqs');
var http = require('http');
var router = express.Router();

// 该路由使用的中间件
router.use(function timeLog(req, res, next) {
	/*res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "x-requested-with");
    res.header('Access-Control-Allow-Headers', 'content-type');*/
  console.log('Time: ', (new Date()).Format('yyyy-MM-dd HH:mm:ss'));
  next();
});
/*通过城市获取当前的旅游景点*/
router.get('/', function (req, res, next) {//
    	console.log('------list-----');
	//dbHelper.list({id:1}, ['id desc'],'scenices', callback, res); select * from scenices where latitude>=23.3 and latitude<=23.38 and city_id = 282////select * from  cities where name='深圳' 
	dbHelper.list('select * from scenices where latitude>=23.3 and latitude<=23.38 and city_id = 282', callback, res);
    // list参数，第一个是whereSql查询条件，json格式；第二个是表名，第三个是回调函数，第四个是express返回客户端的response类
});

/*通过景点id获取旅游景点详情*/
router.get('/queryScenicById', function (req, res, next) {//
    	console.log('------通过景点id获取旅游景点详情-----');
	dbHelper.list('select * from scenices where id='+req.query.id, callback, res);
    // list参数，第一个是whereSql查询条件，json格式；第二个是表名，第三个是回调函数，第四个是express返回客户端的response类
});


router.get('/scenicSpotbyCity', function (req, res, next) {//scenicSpotbyCity
    	console.log('------通过城市获取当前的旅游景点-----');
	//dbHelper.list({id:1}, ['id desc'],'scenices', callback, res); select * from scenices where latitude>=23.3 and latitude<=23.38 and city_id = 282////select * from  cities where name='深圳' 
	dbHelper.list('select * from scenices where city_id = '+req.query.id, callback, res);
    // list参数，第一个是whereSql查询条件，json格式；第二个是表名，第三个是回调函数，第四个是express返回客户端的response类
});

/*通过经纬度获取*/
router.get('/scenicSpotbyPOS', function (req, res, next) {
    	console.log('------通过城市获取当前的旅游景点-----');
	//dbHelper.list({id:1}, ['id desc'],'scenices', callback, res); select * from scenices where latitude>=23.3 and latitude<=23.38 and city_id = 282////select * from  cities where name='深圳' 
	var zoom = parseInt(req.query.zoom)
	/*var datLng = 0.1,datLat = 0.1;
	if(zoom >=15){
		datLng = 0.05;
		datLat = 0.07;
	}*/
	
	var limitNum = 15;
	if(zoom < 15 && zoom >= 12){
		limitNum = 30;
	}else if(zoom < 12 && zoom > 10){
		limitNum = 10;
	}
	
	//topLat,bottomLat,leftLng,rightLng
	
	//获取要查询范围的经纬度范围(一般指地图上左下角和右上角)
	var lng_max  = parseFloat(req.query.rightLng);//parseFloat(req.query.lng)+datLng;
	var lng_min = parseFloat(req.query.leftLng);//parseFloat(req.query.lng)-datLng;
	var lat_max  = parseFloat(req.query.topLat);//parseFloat(req.query.lat)+datLat;
	var lat_min = parseFloat(req.query.bottomLat);//parseFloat(req.query.lat)-datLat;
	if(isNaN(lng_max)||isNaN(lng_min)||isNaN(lat_max)||isNaN(lat_min)){
		res.send({code:400,msg:'百度查询的地图的经纬度未查到'});
	}else
	dbHelper.list('select * from scenices where latitude>=' + lat_min + ' and latitude<=' + lat_max +'and longitude>=' + lng_min + ' and longitude<=' + lng_max + 'limit 0,'+limitNum, callback, res);
    // list参数，第一个是whereSql查询条件，json格式；第二个是表名，第三个是回调函数，第四个是express返回客户端的response类
});

//获取网络图片
router.get('/imageFromNet', function (request, response, next) {

	var url = 'http://api.map.baidu.com/panorama/v2?ak=tulhDZioYexd9Zub0DojUU9g&width=1024&height=512&location='+request.query.location+'&fov=360';
	http.get(url,function(res){
	　　var chunks = []; //用于保存网络请求不断加载传输的缓冲数据
	　　var size = 0;　　 //保存缓冲数据的总长度

	　　res.on('data',function(chunk){
	　　　　chunks.push(chunk);　 //在进行网络请求时，会不断接收到数据(数据不是一次性获取到的)，

	　　　　　　　　　　　　　　　　//node会把接收到的数据片段逐段的保存在缓冲区（Buffer），

	　　　　　　　　　　　　　　　　//这些数据片段会形成一个个缓冲对象（即Buffer对象），

	　　　　　　　　　　　　　　　　//而Buffer数据的拼接并不能像字符串那样拼接（因为一个中文字符占三个字节），

	　　　　　　　　　　　　　　　　//如果一个数据片段携带着一个中文的两个字节，下一个数据片段携带着最后一个字节，

	　　　　　　　　　　　　　　　　//直接字符串拼接会导致乱码，为避免乱码，所以将得到缓冲数据推入到chunks数组中，

	　　　　　　　　　　　　　　　　//利用下面的node.js内置的Buffer.concat()方法进行拼接

	　　　　　　　　　
	　　　　size += chunk.length;　　//累加缓冲数据的长度
	　　});

	　　

	　　res.on('end',function(err){

	　　　　var data = Buffer.concat(chunks, size);　　//Buffer.concat将chunks数组中的缓冲数据拼接起来，返回一个新的Buffer对象赋值给data

	　　　　console.log('判断变量是否为一个Buffer对象'+Buffer.isBuffer(data));　　　　//可通过Buffer.isBuffer()方法判断变量是否为一个Buffer对象

	　　　　

	　　　　var base64Img = data.toString('base64');　　//将Buffer对象转换为字符串并以base64编码格式显示

	　　　　//console.log(base64Img);　　 //进入终端terminal,然后进入index.js所在的目录，

	　　　　　　　　　　　　　　　　　　　//在终端中输入node index.js

	　　　　　　　　　　　　　　　　　　　//打印出来的就是图片的base64编码格式，格式如下　　　　
			if (!err && 　　res.statusCode === 200) {
            var contentType = 　　res.headers['content-type'];
            　　	res.setEncoding('binary');
            response.set('Content-Type', contentType);
            response.send(base64Img);
        }
	　　});

	});
	
});


//通过已有的图片url获取网络图片
router.get('/imageFromNetByURL', function (request, response, next) {

	var url = request.query.url;
	console.log('通过已有的图片url获取网络图片='+url);
	if(!url){
		response.send({code:400,msg:'路径为空'});
	}else{
	http.get(url,function(res){
	　　var chunks = []; //用于保存网络请求不断加载传输的缓冲数据
	　　var size = 0;　　 //保存缓冲数据的总长度

	　　res.on('data',function(chunk){
	　　　　chunks.push(chunk);　 //在进行网络请求时，会不断接收到数据(数据不是一次性获取到的)，

	　　　　　　　　　　　　　　　　//node会把接收到的数据片段逐段的保存在缓冲区（Buffer），

	　　　　　　　　　　　　　　　　//这些数据片段会形成一个个缓冲对象（即Buffer对象），

	　　　　　　　　　　　　　　　　//而Buffer数据的拼接并不能像字符串那样拼接（因为一个中文字符占三个字节），

	　　　　　　　　　　　　　　　　//如果一个数据片段携带着一个中文的两个字节，下一个数据片段携带着最后一个字节，

	　　　　　　　　　　　　　　　　//直接字符串拼接会导致乱码，为避免乱码，所以将得到缓冲数据推入到chunks数组中，

	　　　　　　　　　　　　　　　　//利用下面的node.js内置的Buffer.concat()方法进行拼接

	　　　　　　　　　
	　　　　size += chunk.length;　　//累加缓冲数据的长度
	　　});

	　　

	　　res.on('end',function(err){

	　　　　var data = Buffer.concat(chunks, size);　　//Buffer.concat将chunks数组中的缓冲数据拼接起来，返回一个新的Buffer对象赋值给data

	　　　　console.log('判断变量是否为一个Buffer对象'+Buffer.isBuffer(data));　　　　//可通过Buffer.isBuffer()方法判断变量是否为一个Buffer对象

	　　　　//console.log(data)

	　　　//　var base64Img = data.toString('base64');　　//将Buffer对象转换为字符串并以base64编码格式显示

	　　　//　console.log("base64图片:"+base64Img);　　 //进入终端terminal,然后进入index.js所在的目录，

	　　　　　　　　　　　　　　　　　　　//在终端中输入node index.js

	　　　　　　　　　　　　　　　　　　　//打印出来的就是图片的base64编码格式，格式如下　　　　
			if (!err && 　　res.statusCode === 200) {
            var contentType = 　　res.headers['content-type'];
            　　	res.setEncoding('binary');
            response.set('Content-Type', contentType);
            response.send(data);
        }
	　　});

	});
	}
});


//update `scenices` set isground=1,ground_img='http://pcsv1.map.bdimg.com/?qt=pdata&sid=0902890012170607113549000IN&pos=0_0&z=1&udt=20171116' where id= 11095;

var FurionImgHandler = function (req, res) {
    var url = req.url.split('/fimg/')[1];
    var options = {
        url: url
    };

    function callback (error, response, body) {
        if (!error && response.statusCode === 200) {
            var contentType = response.headers['content-type'];
            response.setEncoding('binary');
            res.set('Content-Type', contentType);
            res.send(body);
        }
    }

    request.get(options, callback);
};



/*通过城市名获取id*/
router.get('/getIdbyCityName', function (req, res, next) {
	console.log(req.query,req.query.cityName)
	dbHelper.list('select * from  cities where name="'+req.query.cityName+'"', callback, res);
});

/*根据不同的用户等级更新scenices景点表格数据*/
router.post('/update', function (req, res, next) {
	console.log('------开始更新数据,首先用户权限验证----');//对于用户的权限验证
	if(req.session.user){
		if(req.session.user.user_level < 3){
			res.send({code:400,msg:'您等级不够3级,请努力刷分!'});
		}else{
			if(!req.body.id||isNaN(req.body.id)){
				res.send({code:400,msg:'输入的景点id非法'});
			}else if(!req.body.editor_content|| typeof req.body.editor_content != 'string'){
				res.send({code:400,msg:'输入的景点内容非法'});
			}else{
				dbHelper.list('select a.audit_status from scenices as a where id='+req.body.id, function (data_list, ress) {
					if(data_list.length>0){
						if(data_list[0].audit_status==2){//审核中
							ress.send({code:400,msg:'此景点已经有内容在审核中请稍后提交!'});
						}else{
							var sql = 'update scenices set editor_content = '+req.body.editor_content+' ,audit_status = '+ 2 +',update_time="'+(new Date()).Format('yyyy-MM-dd HH:mm:ss')+'"  where id='+req.body.id;
							console.log('景点表格sql=',sql);
							dbHelper.list( sql
							, function (data, resss) {
								resss.send({code:200,msg:'更新景点数据成功!'});
							}, res);
						}
					}else{
						res.send({code:400,msg:'该景点无数据'});
					}
					
				},res)
				
				
				
			}
			
		}
	}else{
		res.send({code:332,msg:'请您登录'});
	}
});

var callback = function (data, res) {
   // res.render('list', {listData: data});
    // 第一个参数：模板名称对应list.ejs，第二个是参数名和数据

    console.log('success');
	res.send(data);
};

Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时         
        "H+" : this.getHours(), //小时     
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}



module.exports = router;
