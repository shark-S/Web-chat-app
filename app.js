// step 1 create instance of server
"use strict"
var http = require('http');
var websocket = require('websocket').server;

var colors = ['red','green','blue','magenta','purple','plum','orange'];
colors.sort(function(a,b){
	return Math.random()>0.5
});
var clients =[ ];
var history = [ ];
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
var server = http.createServer(function(req,res){

});
var wsServer = new websocket({
	httpServer : server
});
wsServer.on('request',function(request){
	// code to run connection
	// for accept clients use echo-protocol
	console.log((new Date()) + 'connection from origin '+request.origin+'.');
	var connection = request.accept(null, request.origin);
	var id = clients.push(connection)-1;
	// store connections details
	var user = false;
	var ucolor = false;
	console.log((new Date()) + ' connection accepted');
	// listen for incoming message and broadcast
	if(history.length>0)
		connection.sendUTF(JSON.stringify({type:'history',data:history}));

	
	

	connection.on('message',function(message){
		if(message.type ==='utf8'){
			if(user===false){
				 user = htmlEntities(message.utf8Data);
				ucolor= colors.shift();
			connection.sendUTF(JSON.stringify({type:'color',data:ucolor}));
			console.log((new Date()) + 'User is known as: '+ user +' with '+ ucolor +'color.');

			}
			else {
				console.log((new Date()) + 'received message from '+ user+ ': '+ message.utf8Data);
				var Obj = {
					time:(new Date()).getTime(),
					text:htmlEntities(message.utf8Data),
					author:user,
					color:ucolor
				};
				history.push(Obj);
				history = history.slice(-100);
				var json = JSON.stringify({type:'message',data:Obj});
				for(var i=0;i<clients.length;i++)
					clients[i].sendUTF(json);
			}
		}
	});
	connection.on('close',function(connection){
	if(user!==false  && ucolor!== false){	clients.splice(id,1);
		colors.push(ucolor);
		console.log(new Date() + ' Peer '+connection.remoteAddres+ ' disconnected. ');
	}
});

});
server.listen(1234);
console.log('server is running on port 1234');
