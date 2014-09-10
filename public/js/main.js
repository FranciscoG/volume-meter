/*
The MIT License (MIT)

Copyright (c) 2014 Chris Wilson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/***************************************************************
 * Some utilities
 */

var Ajax = (function(params) {
  var request = new XMLHttpRequest();

  if (params.type.toLowerCase() === "post") {
    request.open('POST', params.url, true);
    request.send(params.data);
    return;
  }

  if (params.type.toLowerCase() === "get") {
    request.open('GET', params.url, true);
    request.responseType = params.data;

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        if (typeof params.success === "function") {
          params.success(request.responseText);
        }
      } else {
        // server returned an error
        if (typeof params.onerror === "function") {
          params.onerror("error");
        }

      }
    };

    if (typeof params.onerror === "function") {
      request.onerror = params.onerror;
    }

    request.send();
  }

});


var log_error = function() {
  return console.error(Array.prototype.slice.call(arguments));
};

var log = function() {
  return console.log(Array.prototype.slice.call(arguments));
};

/****************************************************************
 * Monkey Patching Audio Api section
 */

// monkeypatch Web Audio
window.AudioContext = window.AudioContext || window.webkitAudioContext;

// monkeypatch getUserMedia
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

navigator.cancelAnimationFrame = navigator.cancelAnimationFrame || navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;

navigator.requestAnimationFrame = navigator.requestAnimationFrame || navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;


/****************************************************************
 * Begin Global Variables
 */

(function() {


  var audioContext = new AudioContext();
  var canvas = null;
  var meter = null;
  var context = null;
  var rafID = null;
  var x, y, apiVol, volText;

  // size of the circle
  var radius = 100;

  // timing related 
  var fps = 5;
  var now;
  var then = Date.now();
  var interval = 1000 / fps;

  // how long to run the meter after pressing begin
  var clickStartTime = null;
  var count = 1;
  var howlongInSeconds = 5;

  var elapsed, begin, countdown, stop, save_link;

  // audio recorder related globals
  var audioInput = null,
    inputPoint = null,
    audioRecorder = null;

  function didntGetStream() {
    log_error('Stream generation failed.');
  }

  /****************************************************************
   * Functions for audio recording
   */

  function saveAudio() {
    audioRecorder.exportWAV(doneEncoding);
  }

  function gotBuffers(buffers) {
    // the ONLY time gotBuffers is called is right after a new recording is completed - 
    // so here's where we should set up the download.
    audioRecorder.exportWAV(doneEncoding);
  }

  function doneEncoding(blob) {
    Recorder.setupDownload(blob, "myScream_" + Date.now() + ".wav");
  }

  /****************************************************************
   * We got an Audio stream, now lets do something with it
   */

  function gotStream(stream) {
    // Create an AudioNode from the stream.
    var mediaStreamSource = audioContext.createMediaStreamSource(stream);
    var realAudioInput = audioContext.createMediaStreamSource(stream);

    // for audio recording
    inputPoint = audioContext.createGain();
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);
    audioRecorder = new Recorder(inputPoint);
    var zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect(zeroGain);
    zeroGain.connect(audioContext.destination);

    // Create a new volume meter and connect it.
    meter = createAudioMeter(audioContext);
    mediaStreamSource.connect(meter);

    // only draw on canvas when clicked
    begin.addEventListener("click", function() {
      clickStartTime = internalStart = Date.now();
      drawLoop();
      audioRecorder.clear();
      audioRecorder.record();
    }, false);

    // stop any drawing to the canvas
    stop.addEventListener("click", function() {
      window.cancelAnimationFrame(rafID);
    }, false);
  }


  /****************************************************************
   * Drawing Volume Meter on canvas
   */

  function drawLoop(time) {

    now = Date.now();
    elapsed = now - then;

    context.beginPath();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.closePath();

    // check if we're currently clipping
    if (meter.checkClipping()) {
      context.strokeStyle = "red";
    } else {
      context.strokeStyle = "blue";
    }

    // clear the background
    var startAngle = 0.5 * Math.PI;
    var endAngle = ((meter.volume * 1.5) * Math.PI) - 4;
    var volumation = Math.ceil(meter.volume * 1000);

    //log(meter.volume, endAngle);

    context.beginPath();
    context.arc(x, y, radius, startAngle, endAngle, false);
    context.lineWidth = 25;
    context.stroke();

    if (elapsed > interval) {
      then = now - (elapsed % interval);

      apiVol.textContent = meter.volume;

      // only update the text if volume is higher so we always know the loudest it got
      if (volumation > vol.textContent) {
        vol.textContent = volumation;
      }

      countdown.textContent = Math.ceil((now - clickStartTime) / 1000);

      context.font = "bold 40px Arial";
      context.fillText(volumation, x - 30, y);
    }

    if ((now - clickStartTime) > (howlongInSeconds * 1000)) {
      window.cancelAnimationFrame(rafID);
      rafID = null;
      log('animation done');
      audioRecorder.stop();
      audioRecorder.getBuffers(gotBuffers);
      return;
    }

    // set up the next visual callback
    rafID = window.requestAnimationFrame(drawLoop);
  }

  /****************************************************************
   * Init
   */

  window.onload = function() {

    canvas = document.getElementById("meter");
    apiVol = document.getElementById("apiVol");
    volText = document.getElementById("vol");
    begin = document.getElementById("begin");
    countdown = document.getElementById("countdown");
    stop = document.getElementById("stop");
    save_link = document.getElementById("save");

    // get exact center coordinates
    x = canvas.width / 2;
    y = canvas.height / 2;

    // grab our canvas
    context = canvas.getContext("2d");

    // Attempt to get audio input
    try {
      // ask for an audio input
      navigator.getUserMedia({
        audio: true
      }, gotStream, didntGetStream);
    } catch (e) {
      log_error('getUserMedia threw exception :' + e);
    }

  };

})();