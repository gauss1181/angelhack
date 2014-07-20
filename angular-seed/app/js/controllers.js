'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
.controller('MyCtrl1', ['$scope', '$timeout','$http',
	function($scope, $timeout, $http) {

	$scope.$on('$locationChangeStart', function(event) {
	       	pubnub.history({
				channel: 'in-game-chat',
				count: 100,
				callback: function(m){
					console.log(m);
					var list = m[0];
					for(var i = 0; i < list.length; i++){
						receive(list[i]);						
					}
				}
			});
	    
	});

	function user_init(){
		if(localStorage.user == undefined || 
			localStorage.user == "undefined" || 
			localStorage.user == null || 
			localStorage.user == "null"){
			angular.element('#userDetails').modal('show');
			console.log('user_init!');
		}
		$scope.getQuestions();
	}

	 angular.element(document).ready(function(){
	 	
	 });

	var pubnub;
	(function(){

		pubnub = PUBNUB.init({
			publish_key   : 'pub-c-39919f39-4f8e-4d25-9c5d-e939f597226a',
			subscribe_key : 'sub-c-39857530-0f9c-11e4-8880-02ee2ddab7fe',
			ssl : true
		});


		pubnub.subscribe({
			channel : "in-game-chat",
			message : function(m){ 
					receive(m)
				 },
			connect : welcome
		});

		pubnub.subscribe({
			channel : "typing",
			message : function(m){ console.log(m) },
			connect : typing_welcome
		});

		pubnub.subscribe({
			channel : "answers",
			message : function(m){ receive(m) },
			connect : answer_welcome
		});

		pubnub.history({
			channel: 'in-game-chat',
			count: 100,
			callback: function(m){
				console.log(m);
				var list = m[0];
				for(var i = 0; i < list.length; i++){
					receive(list[i]);						
				}
			}
		});

		// user_init();
		$timeout(function() {user_init()}, 1000);

		
	})();

	function welcome() {
		console.log('Welcome to the math contest game!');
	}

	function answer_welcome() {
		console.log('You may now begin answering questions.');
	}
	function typing_welcome() {
		console.log('Listening to typing updates...');
	}

	function publish(isMessage) {
		var text = document.getElementById('message').value;
		if(isMessage){
			pubnub.publish({
				channel : "in-game-chat",
				message : localStorage.user + ": " + text
			});
		} else {
			pubnub.publish({
				channel : "typing",
				message : "typing update!"
			});
		}



	}

	function receive(text){
		var chat = document.getElementById('chat');
		var div = document.createElement('div');
		div.innerHTML = text;
		chat.appendChild(div);
		angular.element('#chat').scrollTop(2000);
	}

	$scope.detectTyping = function(){
		console.log('typing!');
		$scope.publish(false);
	}

	$scope.publish = function(isMessage){
		if(localStorage.user == undefined || 
			localStorage.user == "undefined" || 
			localStorage.user == null || 
			localStorage.user == "null"){
			if(confirm("Please set up a username before beginning.")){
				$scope.user_change();
			} 

		}else if (angular.element('#message').val() == '') {
			console.log('message is empty.');

		}else {
			publish(isMessage);
			if(isMessage){
				angular.element('#message').val('');			
			}
		}


	}

	$scope.enterPressed = function(d){
		console.log("pressed!");
		console.log(angular.element(d).val());
		$scope.publish(true);

	};

	$scope.user_change = function(){
		angular.element('#userDetails').modal('show');	
	}

	$scope.saveUser = function(){
		localStorage.user = angular.element('#username').val();
		angular.element('#username').val('');
		angular.element('#userDetails').modal('hide');
	}
	$scope.clearChat = function(){
		for(var i = 0 ; i < 100; i++){
			pubnub.publish({
				channel : "in-game-chat",
				message : " "
			});
		}
		console.log("chat should be cleared!");
	}

	$scope.getQuestions = function(){
		var url = "http://localhost:1212/questions";
		var method = "GET";

		$http({
			method: method,
			url: url
		})
		.success(function(res){
			console.log("success");
			console.log(res.data);
		})
		.error(function(res){
			console.log("error");
			console.log(res.data);
		});
	}

}])
.controller('MyCtrl2', ['$scope', function($scope) {

}]);
