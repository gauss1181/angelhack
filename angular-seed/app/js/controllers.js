'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
.controller('MyCtrl1', ['$scope', '$timeout','$http', '$route', '$location',
	function($scope, $timeout, $http, $route, $location) {
		
		var pubnub;

		$timeout(function() {user_init()}, 1000);

		$scope.$on('$locationChangeStart', function(event) {
			if(pubnub != null){
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

				pubnub.history({
					channel: 'game_list',
					count: 1,
					callback: function(m){
						console.log("loading game history");
						console.log(m[0]);
						var list = m[0];
						localStorage.games = list;
						$scope.$apply(function(){
							$scope.games = localStorage.games.split(",");
						});
						// $route.reload();
						console.log("reloaded!")
					}
				});			
			}
			
			if($location.$$path == "/partial1.html"){
				$timeout(function() {$scope.generateProblem()}, 3000);
				console.log($location.path);
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
			}
		});

		var problems = [
            {
              question: 'Hello this is a new math problem. What is your answer? Type it below.',
              answer: 'Hi'
            },
            {
              question: 'Bye',
              answer: 'So long'
            },
            {
              question: 'Find the area of a square with length 5 and height 2.',
              answer: '10'
            },
            {
              question: 'Find the volume of a rectangular prism with length 9, width 6, and height 4.',
              answer: '216'
            },
            {
              question: 'What is the answer to life, the universe, and everything?',
              answer: '42'
            },
            {
              question: 'asdfasdf',
              answer: '1'
            },
            {
              question: 'ghjk',
              answer: '0'
            },
            {
              question: 'poinpon',
              answer: 'blah'
            },
            {
              question: 'lol',
              answer: 'hi'
            },
            {
              question: 'test',
              answer: 'test'
            }];

        $scope.generateProblem = function(){
            	document.getElementById("problem").innerHTML = problems[Math.floor(Math.random() * 10)].question;
        		console.log("new problem!");
        };



            //document.getElementById("problem").innerHTML = problems[Math.floor(Math.random() * 10)].question;

            /*function submit() {
              var answer = document.getElementById("answer").value;
              if (answer == document.getElementById("problem").innerHTML.answer) {
                document.getElementById("result").innerHTML = "Correct";
              }
              else {
                document.getElementById("result").innerHTML = "Incorrect";
              }
            }*/

		function user_init(){
			if(localStorage.user == undefined || 
				localStorage.user == "undefined" || 
				localStorage.user == null || 
				localStorage.user == "null"){
				angular.element('#userDetails').modal('show');
			console.log('user_init!');
			} else {
				login(localStorage.user);
			}
			$scope.getQuestions();
		}

		function login(user){
			pubnub = PUBNUB.init({
						publish_key   : 'pub-c-39919f39-4f8e-4d25-9c5d-e939f597226a',
						subscribe_key : 'sub-c-39857530-0f9c-11e4-8880-02ee2ddab7fe',
						ssl : true
			});
			pubnub.time(
				function(time){
					pubnub = PUBNUB.init({
						publish_key   : 'pub-c-39919f39-4f8e-4d25-9c5d-e939f597226a',
						subscribe_key : 'sub-c-39857530-0f9c-11e4-8880-02ee2ddab7fe',
						ssl : true,
						uuid:  user + time
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
						channel : "game_list",
						message : function(m){ 
							console.log("updated games list!"); 
							console.log(m);
							$scope.games = m; 
							localStorage.games = m;
						},
						connect : function(){ console.log("Listening for game list updates!") }
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

					pubnub.history({
						channel: 'game_list',
						count: 1,
						callback: function(m){
							console.log(m);
							var list = m[0];
							localStorage.games = list;
							$scope.$apply(function(){
								$scope.games = localStorage.games.split(",");

							});

							// localStorage.games = JSON.parse(list[0]);
						}
					});
				});
		}


		angular.element(document).ready(function(){

		});

		function welcome() {
			console.log('Welcome to the math contest game!');
		}

		function game_welcome() {
			console.log('Welcome to a new game!');
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
			login(localStorage.user);
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
				console.log(res);
			})
			.error(function(res){
				console.log("error");
				console.log(res);
			});
		}

		$scope.createNewGame = function(){
			pubnub.uuid(function(uuid){
				console.log("trying to make a new game with " +uuid);
				pubnub.publish({
					channel: "new_game",
					message: uuid
				});
				pubnub.subscribe({
					channel: uuid,
					message : function(m){ 
						receive(m)
					},
					connect : game_welcome
				});
			});
		}

		$scope.loadGames = function(){
			pubnub.state({
	        	channel: "game_list",
	        	uuid: "global-game-list",
	        	callback: function(json){
	        		console.log("loading games!");
	        		console.log(json);
	        		$scope.games = json.games;
	        		$scope.$apply(function(){
						$scope.games = json.games;
					});
	        	}
        	});
		}



	}



])
.controller('MyCtrl2', ['$scope', function($scope) {

}]);
