$(function() {

     // setting up the canvas and one paper tool
    var canvas = document.getElementById('myCanvas');
    paper.setup(canvas);
    var tool = new paper.Tool();
    
    var state = {
      "id": Date.now() + Math.random(),
      "device": (window.location.href.indexOf("small") > -1) ? "user" : "display",
      "color": new paper.Color({
        hue: Math.random() * 360,
        saturation: 1,
        brightness: 1
      }),
      "paths": []
    };
    console.log("local device id: "+state.id+", type: " + state.device);
  
    var notSelf = function(other) { return other.id !== state.id };
  
    var users = {};

    var socket = new WebSocket('ws://p4-stecd-stephaniecd114968.codeanyapp.com:8765/');
  
    socket.onopen = function(e) {
      socket.send(JSON.stringify({
        "type": "connection",
        "id": state.id,
        "device": state.device
      }));      
    };
  
    socket.onmessage = function(recv) {
      var data = JSON.parse(recv.data);
      switch(data.type) {
        case "connection":
          // add something to handle disconnects and remove lines
          console.log(data);
          onRecvConnection(data);
          break;
        case "state":
          console.log(data);
          onRecvState(data);
          break;
        case "newline":
          console.log(data);
          onRecvNewLine(data);
          break;
        case "addpoint":
          //console.log(data);
          onRecvPoint(data);
          break;
        default:
          console.warning("unknown socket message data type " + data.type);          
          console.log(data);
          break;
      }      
    };

    socket.onclose = function(e) {
      console.error('Socket closed unexpectedly');
    };
  
    function onRecvConnection(data) {
      console.log(data.id + " just joined!")
      socket.send(JSON.stringify({
        "type": "state",
        "id": state.id,
        "device": state.device,
        "hue": state.color.hue,
        "state": serializeState()
      }));
    }
  
    function onRecvState(data) {     
      console.log(data.id + " just sent their state!")
      if (notSelf(data) && !(data.id in users) && state.device === "display") {
        console.log(data.id + " is an untracked user; adding information")
        users[data.id] = {
          "paths": [],
          "color": new paper.Color({
            hue: data.hue,
            saturation: 1,
            brightness: 1
          })
        };
        for (var i = 0; i < data.state.paths.length; i++) {
          var path = new paper.Path({
            segments: data.state.paths[i],
            strokeColor: users[data.id].color
          });
          users[data.id].paths.push(path);
        }
      }
    }
  
    function onRecvNewLine(data) {
      if (notSelf(data) && state.device === "display") {
        console.log(data.id + " just created a new line!")
        var path = new paper.Path({
          segments: [data.point],
          strokeColor: users[data.id].color
        });
        users[data.id].paths.push(path);
        if (users[data.id].paths.length - 1 !== data.lineid) {
          console.error("oh no I don't know what happened");
        }
      }
    }
  
    function onRecvPoint(data) {
      if (notSelf(data) && state.device === "display") {
        users[data.id].paths[data.lineid].add(new paper.Point(data.point));
      }
    }
  
    function segmentToArray(i) {
      return [i.point.x, i.point.y];
    }
  
    function serializeState() {
      return {
        "paths": state.paths.map(i => { return i.segments.map(segmentToArray); })
      };
    }  

    tool.onMouseDown = function onMouseDown(event) {
      state.paths.push(new paper.Path());
      var lineid = state.paths.length - 1;
      
      state.paths[lineid].strokeColor = state.color;
      state.paths[lineid].add(event.point);
      socket.send(JSON.stringify({
        "type": "newline",
        "id": state.id,
        "lineid": lineid,
        "point": [event.point.x, event.point.y]
      }));
    }

    tool.onMouseDrag = function onMouseDrag(event) {
      var lineid = state.paths.length - 1;
      state.paths[lineid].add(event.point);
      socket.send(JSON.stringify({
        "type": "addpoint",
        "id": state.id,
        "lineid": lineid,
        "point": [event.point.x, event.point.y]
      }));
    }
    
    window.addEventListener('deviceorientation', function(e) {
      var roll = e.gamma; // interval [-90,90] degrees, positive is bank right
      

      // Because we don't want to have the device upside down
      // We constrain the x value to the range [-90,90]
      if (x > 90) {
        x = 90
      };
      if (x < -90) {
        x = -90
      };

      // To make computation easier we shift the range of 
      // x and y to [0,180]
      x += 90;
      y += 90;

      // 10 is half the size of the ball
      // It center the positioning point to the center of the ball
      ball.style.top = (maxX * x / 180 - 10) + "px";
      ball.style.left = (maxY * y / 180 - 10) + "px";
    });

    window.addEventListener('unload', function(e) {
      // send message to remove paths from everyone else
    });
  
})()