const express = require('express');
const app = express();
const server = require('http').Server(app);
const rp = require('request-promise');
const cheerio = require('cheerio');
const io = require('socket.io')(server,{});

var options = {
	uri: 'http://www.zap.co.il/models.aspx?sog=c-pclaptop',
	transform: (body) =>{ return cheerio.load(body);}	
};
//number of the current page
var uriIndex = 1;

var list_computerprices = [];
var list_computername = [];

//build port and upload main file
app.get('/', function(req,res){
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
server.listen(125);
console.log("server connect");

function startScrap(){
	let check = false;
//request-promise
rp(options)
.then(($) => {	
    $('.pricesTxt').text((index,text) => {
		 list_computerprices.push({
			    index: index,
			    text:  text
		});
	});
	$('.ProdInfoTitle').text((index,text) => {			
		 list_computername.push({
			     index: index,
				 text:  text
		 });
	});
	 SendDataToClient();      	      	 
  })
.catch((err) => {
	console.log(err);
    check = true;	
 })
 .finally(() =>{
	 if(check)
		 uriIndex--;
  if(uriIndex < 264)
	 start();
 });
}

 //socket start
 io.on('connection',function(socket){	
	socket.on('client_connect', (data) => {console.log(data); startScrap();});    
}); 

// return object with 2 array of names and prices of computers in zap website
 function sendData(pack_age){io.emit('info' , pack_age);}

 function start(){	 
	 uriIndex++;
	 options.uri = "http://www.zap.co.il/models.aspx?sog=c-pclaptop&pageinfo=" + uriIndex;
	 console.log(options.uri);
	 startScrap();
 }
 function SendDataToClient(){
	 if(uriIndex%264 == 0)
	  sendData({
			names: list_computername, 
			prices: list_computerprices
		});
 }