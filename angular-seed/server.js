var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logfmt = require("logfmt");


var pubnub = require("pubnub").init({
	publish_key   : 'pub-c-39919f39-4f8e-4d25-9c5d-e939f597226a',
	subscribe_key : 'sub-c-39857530-0f9c-11e4-8880-02ee2ddab7fe',
	ssl : true,
	uuid: "global-game-list"
});

var app = express();

app.set('port', process.env.PORT || 1212);
app.use(logger('dev'));
app.use(logfmt.requestLogger());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

var games = [];

app.get('/questions', function(req, res){
	// res.header("Access-Control-Allow-Origin", "http://localhost");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.writeHead(200, {'Content-Type': 'application/json'});
    var msg = JSON.stringify({questions: ['question1','question2']});

    res.end(msg);
    // res.end("hi");
    // res.send();
    console.log("sending questions!");
});

pubnub.subscribe({
    channel  : "new_game",
    callback : function(message) {
        console.log( "adding game with uuid: " + message );
        games.push(message);
        pubnub.state({
        	channel: "game_list",
        	uuid: "global-game-list",
        	state: {
        		games: games
        	},
        	callback: function(){
		        pubnub.publish({
		        	channel: 'game_list' ,
		        	message: games
		        });
        	}
        });

    },
    state: {
    	games: []
    }
});


