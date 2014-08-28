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

var log = function() {
  return console.log(Array.prototype.slice.call(arguments));
};

var audioContext = null;
var canvas = null;
var meter = null;
var canvasContext = null;
var WIDTH = 500;
var HEIGHT = 500;
var rafID = null;
var x, y;
// size of the circle
var radius = 100;

window.onload = function() {

  canvas = document.getElementById("meter");

  // get exact center coordinates
  x = canvas.width / 2;
  y = canvas.height / 2;

  // grab our canvas
  canvasContext = canvas.getContext("2d");

  // monkeypatch Web Audio
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  // grab an audio context
  audioContext = new AudioContext();

  // Attempt to get audio input
  try {
    // monkeypatch getUserMedia
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;

    // ask for an audio input
    navigator.getUserMedia({
      audio: true
    }, gotStream, didntGetStream);
  } catch (e) {
    alert('getUserMedia threw exception :' + e);
  }

};


function didntGetStream() {
  alert('Stream generation failed.');
}

function gotStream(stream) {
  // Create an AudioNode from the stream.
  var mediaStreamSource = audioContext.createMediaStreamSource(stream);

  // Create a new volume meter and connect it.
  meter = createAudioMeter(audioContext);
  mediaStreamSource.connect(meter);

  // kick off the visual updating
  drawLoop();
}



function drawLoop(time) {

  //canvasContext.clearRect(0, 0, WIDTH, HEIGHT);

  //canvasContext.globalCompositeOperation = 'destination-out';
  canvasContext.beginPath();
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  canvasContext.closePath();

  // check if we're currently clipping
  if (meter.checkClipping()) {
    canvasContext.strokeStyle = "red";
  } else {
    canvasContext.strokeStyle = "blue";
  }


  // clear the background
  var startAngle = 0.5 * Math.PI;
  var endAngle = ((meter.volume * 1.5) * Math.PI) - 4;
  //log(meter.volume, endAngle);

  canvasContext.beginPath();
  canvasContext.arc(x, y, radius, startAngle, endAngle, false);
  canvasContext.lineWidth = 20;
  canvasContext.stroke();

  // draw a bar based on the current volume
  // canvasContext.fillRect(0, 0, meter.volume * WIDTH * 1.4, HEIGHT);

  // set up the next visual callback
  rafID = window.requestAnimationFrame(drawLoop);
}