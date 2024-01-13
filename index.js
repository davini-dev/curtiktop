import { WebcastPushConnection } from 'tiktok-live-connector';

import { W3bstreamClient } from "w3bstream-client-js";

const URL = "http://127.0.0.1:8889/srv-applet-mgr/v0/event/eth_0xf3dcbe4f65d04c492ff30b48a4699a3fe2c0ce5b_curtiktop";
const API_KEY = "w3b_MV8xNzAzNjAyNDgyXzo6Y1J3PGJkLUYnXg";

const client = new W3bstreamClient(URL, API_KEY);

// header should include device ID
const header = {
    device_id: "device_001",
  };

// payload can be an object
const payload = {
    event_type: 'DEFAULT',  
    tiktokUsername: "",
    roomId : "",
    action : "",
    user: "",
};


// Username of someone who is currently live
//let tiktokUsername = "ystefani.ol";

let tiktokUsername = process.env.CURTIKTOPUSER;


try {
     // Create a new wrapper object and pass the username
     let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);
} catch (error) {
     console.info("Especificar o usuário do Tiktok");
}


// Connect to the chat (await can be used as well)
tiktokLiveConnection.connect().then(state => {
    console.info(tiktokUsername+` - Connected to roomId ${state.roomId}`);
    payload.roomId = state.roomId;
    payload.tiktokUsername = tiktokUsername;
}).catch(err => {
    console.error('Failed to connect', err);
})



// Define the events that you want to handle
// In this case we listen to chat messages (comments)
tiktokLiveConnection.on('chat', data => {
    //console.log(`${data.uniqueId} (userId:${data.userId}) writes: ${data.comment}`);
})

// And here we receive gifts sent to the streamer
tiktokLiveConnection.on('gift', data => {
    //console.log(`${data.uniqueId} (userId:${data.userId}) sends ${data.giftId}`);
})

tiktokLiveConnection.on('like', data => {
    //console.log(`${data.uniqueId} (userId:${data.userId}) like`);

    payload.user = data.uniqueId;
    payload.action = 'like';

    const eventsObj = [{
      header,
      payload
    }];

    const main = async () => {
        try {
         eventsObj.header = header;
         eventsObj.payload = payload;

         client.publishEvents(eventsObj).subscribe({
         // will be called for each batch of messages
         next: (res) => {
            //console.log(res.data.length);
         },
         error: (err) => {
           console.log(err.message);
         },
           complete: () => {
             console.log('User:'+payload.user+' - like - '+"publishing completed");
         },
         });


        } catch (error) {
          console.error(error);
        }
      };
      main();
})

// ...and more events described in the documentation below