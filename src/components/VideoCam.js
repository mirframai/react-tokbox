import React, { useEffect, useState } from 'react';
const OT = require('@opentok/client');

let apiKey = "46155362";
let sessionId = "1_MX40NjE1NTM2Mn5-MTU3Mjk0MzMxNDc1Nn5OcW96K0Vnc3IwYnp6b1Q4MkYxMmd2SnV-fg";
let token = "T1==cGFydG5lcl9pZD00NjE1NTM2MiZzaWc9ZGExYTMyNzBiMGYzNDI4YzRhMDU3OGEwMTgxZTQzM2Y5MGJiMDZlMTpzZXNzaW9uX2lkPTFfTVg0ME5qRTFOVE0yTW41LU1UVTNNamswTXpNeE5EYzFObjVPY1c5NkswVm5jM0l3WW5wNmIxUTRNa1l4TW1kMlNuVi1mZyZjcmVhdGVfdGltZT0xNTcyOTQzMzM0Jm5vbmNlPTAuNTQ0NDk1MTg1MjY1OTE1JnJvbGU9cHVibGlzaGVyJmV4cGlyZV90aW1lPTE1NzM1NDgxMzQmY29ubmVjdGlvbl9kYXRhPXh0cmVhbXJVc2VySWQlM0QwJmluaXRpYWxfbGF5b3V0X2NsYXNzX2xpc3Q9";
let session;
let streamId;

const VideoCam = () => {

    const [name, setName] = useState('');

    function handleSubmit(event) {
      event.preventDefault();
      sendSignal(name);
      setName('');
    }

    function handleInput(e) {
      setName(e.target.value)
    }

    function initSession() {
      session = OT.initSession(apiKey, sessionId);
  
      // Subscribe to a newly created stream
      session.on('streamCreated', function(event) {
        streamId = event.stream.streamId;
        session.subscribe(event.stream, 'subscriber', {
          insertMode: 'append',
          width: '100%',
          height: '100%'
        }, handleError);
      });
      session.on("signal:XT_ON_STREAM_NAME_REQUESTED", function(event) {
        sendSignal(name)
      });
      // Create a publisher
      let publisher = OT.initPublisher('publisher', {
        insertMode: 'append',
        name: 'COLLABORATOR/123',
        width: '100%',
        height: '100%'
      }, handleError);
    
      publisher.on('streamCreated', event => {
          streamId = event.stream.streamId;
      })
    
      // Connect to the session
      session.connect(token, function(error) {
        // If the connection is successful, publish to the session
        if (error) {
          handleError(error);
        } else {
          session.publish(publisher, handleError);
        }
      });
    };

    useEffect(() => {
        initSession();
    }, []);

    return (
        <div>
            <div id="videos">
                <div id="subscriber"></div>
                <div id="publisher"></div>
            </div>
            <form onSubmit={handleSubmit}>
                <label>Name:</label>
                <input type="text" name="name" placeholder="Set your name" value={name} onChange={handleInput}></input>
                <input type="submit" value="Submit" />
            </form>
        </div>
    );
}

function sendSignal(value) {
    const data = JSON.stringify({
        name: value,
        streamId
    })
    session.signal({
        data,
        type: 'XT_ON_STREAM_NAME_UPDATED'
    },
    function(error) {
        if (error) {
            console.log("signal error ("
                        + error.name
                        + "): " + error.message);
        } else {
            console.log("signal sent.");
        }
    })
}

// Handling all of our errors here by alerting them
function handleError(error) {
    if (error) {
      alert(error.message);
    }
  }

export default VideoCam;