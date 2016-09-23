var channel = "presence-demo/" + Math.random().toString(16).substr(2, 8) ; 
var client0 = emitter.connect({ secure: true });
var client1 = null;
var client2 = null; 

var key = 'X4-nUeHjiAygHMdN8wst82S3c2KcCMn7';
var vue = new Vue({
    el: '#app',
    data: {
        users: [],
        occupancy: 0,
        device1: "login",
        device2: "login"
    },
    methods: {
        toggleDevice1: function () {
            client1 = toggleConnection(client1, "Margaret");
            vue.$data.device1 = (client1) ? "logout" : "login";
        },

        toggleDevice2: function() {
            client2 = toggleConnection(client2, "Alan");
            vue.$data.device2 = (client2) ? "logout" : "login";
        },
    }
});


/**
 * Function that togggles the connection on a particular emitter client.
 */
function toggleConnection(client, name) {
    if(client) {
        // If client is already connected, disconnect it
        client.disconnect();
        return null;
    } else {
        // If client is not yet connected, connect and subscribe to the channel
        client = emitter.connect({ secure: true, username: name });
        client.on('connect', function(){
            client.subscribe({
                key: key,
                channel: channel
            });
        });
        return client;
    }
}

client0.on('connect', function(){
    // once we're connected, subscribe to the 'chat' channel
    console.log('emitter: connected');

    // Query the presence state
    client0.presence({
        key: key,
        channel: channel
    })
})

// on every presence event, print it out
client0.on('presence', function(msg){
    console.log(msg);    
    var users = vue.$data.users;
    switch(msg.event){
        // Occurs when we've received a full response with a complete list of clients
        // that are currently subscribed to this channel. 
        case 'status':
            for(var i=0; i<msg.who.length;++i){
                users.push(msg.who[i]);
            }
        break;

        // Occurs when a user subscribes to a channel.
        case 'subscribe':
            users.push(msg.who);
        break;

        // Occurs when a user unsubscribes or disconnects from a channel.
        case 'unsubscribe':
            vue.$data.users = users.filter(function( obj ) {
                return obj.id !== msg.who.id;
            });
        break;
    }

    // Also, set the occupancy
    vue.$data.occupancy = msg.occupancy;
});