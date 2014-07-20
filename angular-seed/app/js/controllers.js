'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
.controller('MyCtrl1', ['$scope', '$timeout','$http', '$route', '$location',
	function($scope, $timeout, $http, $route, $location) {
		
		var pubnub;
		$scope.score = 0;

		$scope.safeApply = function(fn) {

			var phase = this.$root.$$phase;

			if(phase == '$apply' || phase == '$digest') {

				if(fn && (typeof(fn) === 'function')) {

					fn();

				}

			} else {

				this.$apply(fn);

			}

		};

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
						$scope.safeApply(function(){
							$scope.games = localStorage.games.split(",");
						});
						// $route.reload();
						console.log("reloaded!")
					}
				});			
			}
			
			if($location.$$path == "/partial1"){
				console.log("currently on partial!");
				
				setTimeout(function() {
					$scope.safeApply (function(){
						console.log($location.path);
						$scope.generateProblem();
					});
				}, 1000);

			}


				// pubnub.history({
				// 	channel: 'in-game-chat',
				// 	count: 100,
				// 	callback: function(m){
				// 		console.log(m);
				// 		var list = m[0];
				// 		for(var i = 0; i < list.length; i++){
				// 			receive(list[i]);						
				// 		}
				// 	}
				// });

});

var problems = [
            {
              question: 'Walking down Jane Street, Ralph passed four houses in a row, each painted a different color. He passed the orange house before the red house, and he passed the blue house before the yellow house. The blue house was not next to the yellow house. How many orderings of the colored houses are possible?',
              answer: '3'
            },
            {
              question: 'The difference between a two-digit number and the number obtained by reversing its digits is 5 times the sum of the digits of either number. What is the sum of the two digit number and its reverse?',
              answer: '99'
            },
            {
              question: 'Five positive consecutive integers starting with a have average b. What is the average of 5 consecutive integers that start with b?',
              answer: 'a+4'
            },
            {
              question: 'Convex quadrilateral ABCD has AB = 3, BC = 4, CD = 13, AD = 12, and angle ABC = 90 degrees, as shown. What is the area of the quadrilateral?',
              answer: '36'
            },
            {
              question: 'A set S consists of triangles whose sides have integer lengths less than 5, and no two elements of S are congruent or similar. What is the largest number of elements that S can have?',
              answer: '9'
            },
            {
              question: 'Let P be a cubic polynomial with P(0) = k, P(1) = 2k, and P(-1) = 3k. What is P(2) + P(-2)?',
              answer: '14k'
            },
            {
              question: 'Leah has 13 coins, all of which are pennies and nickels. If she had one more nickel than she has now, then she would have the same number of pennies and nickels. In cents, how much are her coins worth?',
              answer: '37'
            },
            {
              question: 'Susie pays for 4 muffins and 3 bananas. Calvin spends twice as much paying for 2 muffins and 16 bananas. A muffin is how many times as expensive as a banana?',
              answer: '5/3'
            },
            {
              question: 'What is the sum of the exponents of the prime factors of the square root of the largest perfect square that divides 12!?',
              answer: '8'
            },
            {
              question: 'A fair coin is tossed 3 times. What is the probability of at least two consecutive heads?',
              answer: '3/8'
            }];

$scope.checkAnswer = function(){
	$scope.answer = document.getElementById("answer").value;
	$scope.currentProblem = document.getElementById("problem").className;
	if ($scope.answer == $scope.currentProblem) {
		console.log('Correct!');
		$scope.score += 1;
		document.getElementById("result").innerHTML = "Correct!";
		document.getElementById("result").style.color = "green";
		var problem = problems[Math.floor(Math.random() * 10)];
		document.getElementById("problem").innerHTML = problem.question;
		document.getElementById("problem").className = problem.answer;
		console.log("new problem!");
		angular.element('#answer').val('');
	}
	else {
		console.log('Incorrect!');
		document.getElementById("result").innerHTML = "Incorrect, please try again.";
		document.getElementById("result").style.color = "red";
	}
};

$scope.generateProblem = function(){
	var problem = problems[Math.floor(Math.random() * 10)];
	document.getElementById("problem").innerHTML = problem.question;
	document.getElementById("problem").className = problem.answer;
	console.log("new problem!");
}



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
      					$scope.safeApply(function(){
      						$scope.games = localStorage.games.split(",");

      					});

							// localStorage.games = JSON.parse(list[0]);
						}
					});
      		});
}


angular.element(document).ready(function(){
	if($location.$$path == "/partial1"){
		console.log("currently on partial!");
		setTimeout(function() {
			$scope.safeApply(function(){
				console.log($location.path);
				$scope.generateProblem();
			});
		}, 1000);
	}
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
			$scope.safeApply(function(){
				$scope.games = json.games;
			});
		}
	});
}

$scope.getPlayers = function(game){
	pubnub.here_now({
		channel: game,

	})
}



}



])
.controller('MyCtrl2', ['$scope', function($scope) {

}]);
