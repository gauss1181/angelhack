var pubnub;

$(document).ready(function(){
    $('#message').keypress(function(e){
      if(e.keyCode==13){
        publish();
        $('#message').val("");        
      }

    });
});

(function(){
 
      pubnub = PUBNUB.init({
         publish_key   : 'pub-c-39919f39-4f8e-4d25-9c5d-e939f597226a',
         subscribe_key : 'sub-c-39857530-0f9c-11e4-8880-02ee2ddab7fe',
         ssl : true
     });

 
     pubnub.subscribe({
         channel : "hello_world",
         message : function(m){ receive(m) },
         connect : publish
     });

    pubnub.subscribe({
         channel : "conversation",
         message : function(m){ receive(m) },
         connect : publish
     });

     pubnub.history({
        channel: 'hello_world',
        count: 100,
        callback: function(m){
                console.log(m);
                var list = m[0];
                for(var i = 0; i < list.length; i++){
                    receive(list[i]);
                }
            }
      });
 })();
 
 function publish() {
    var text = document.getElementById('message').value;
     pubnub.publish({
         channel : "hello_world",
         message : "" + text
     });

 }

 function receive(text){
    var chat = document.getElementById('chat');
    var div = document.createElement('div');
    div.innerHTML = text;
    chat.appendChild(div);
 }
