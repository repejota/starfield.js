//
// BEGIN LICENSE BLOCK
//
// The MIT License (MIT)
//
// Copyright (c) 2014 Raül Pérez
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// END LICENSE BLOCK
//

/**
 * requestAnimationFrame
 *
 * Tells the browser that we are gonna use animation and requests to call a
 * method that updates an animation before each repaint.
 * The number of callbacks are usually 60 times per second ( 60 frames per
 * second ) but it can change according the current browser's refresh rate.
 *
 * @see https://developer.mozilla.org/en/docs/Web/API/window.requestAnimationFrame
 */
window.requestAnimFrame = (function () {

    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) { window.setTimeout(callback); };

})();

// get dimensions of window and resize the canvas to fit
var width = window.innerWidth;
var height = window.innerHeight;

// sets the initial cursor position to the center of the canvas
var mouseX = width / 2;
var mouseY = height / 2;

// resize canvas to fill the whole browser's viewport
var canvas = document.querySelector(".canvas");
canvas.width = width;
canvas.height = height;

// get 2d graphics context
var Graph = canvas.getContext("2d");

// set global alpha
Graph.globalAlpha = 0.25;

// constants and storage for objects that represent star positions
var warpZ = 12;
var units = 500;                // number of available stars
var stars = [];                 // collection of stars
var cycle = 0;
var Z = 0.01;                  // Z range is (0.01 .. 0.5)


/**
 * Mouse movement Event Handler
 *
 * When mouse cursors changes position and it's over the canvas, the point
 * of origin of the starts also moves with the same proportion.
 *
 * @param {Event} e - Mouse event
 */
function mouseMoveHandler (e) {
    "use strict";
    mouseX = e.clientX;
    mouseY = e.clientY;
}
/**
 * Add an event listener to 'mousemove' event in canvas
 */
canvas.addEventListener("mousemove", mouseMoveHandler, false);

/**
 * Mouse wheel Event Handler
 * @param e
 */
function mouseWheelHandler (e) {
    var delta = 0;
    if (e.detail) {
        delta = -e.detail / 3;
    } else {
        delta = e.wheelDelta / 120;
    }
    var deltaOffset = (delta / 25);
    if (delta > 0 && Z + deltaOffset <= 0.5 || delta < 0 && Z + deltaOffset >= 0.01) {
        Z += (delta / 25);
    }
}
canvas.addEventListener("DOMMouseScroll", mouseWheelHandler, false);
canvas.addEventListener("mousewheel", mouseWheelHandler, false);

/**
 * Resets an object star properties
 * @param star
 */
function resetStar (star) {
    star.x = (Math.random() * width - (width * 0.5)) * warpZ;
    star.y = (Math.random() * height - (height * 0.5)) * warpZ;
    star.z = warpZ;
    star.px = 0;
    star.py = 0;
}

/**
 * Initializes all available stars and builds a list with all of them.
 */
var i = 0;
for (i = 0; i < units; i++) {
    var star = {};
    resetStar(star);
    stars.push(star);
}

/**
 * Starfield rendering & animation
 */
var renderStarfield = function () {

    // clear background
    Graph.fillStyle = "#000";
    Graph.fillRect(0, 0, width, height);

    // mouse position to head towards
    var cx = (mouseX - width / 2) + (width / 2);
    var cy = (mouseY - height / 2) + (height / 2);

    // update all stars
    var sat = Math.floor(Z * 500);       // Z range 0.01 -> 0.5
    if (sat > 100) {
        sat = 100;
    }
    var i;
    for (i = 0; i < units; i++) {
        // the star
        var n = stars[i];
        // star position
        var xx = n.x / n.z;
        var yy = n.y / n.z;
        // size i.e. z
        var e = (1.0 / n.z + 1) * 2;

        if (n.px !== 0) {
            // hsl colour from a sine wave
            Graph.strokeStyle = "hsl(" + ((cycle * i) % 360) + "," + sat + "%,80%)";
            Graph.lineWidth = e;
            Graph.beginPath();
            Graph.moveTo(xx + cx, yy + cy);
            Graph.lineTo(n.px + cx, n.py + cy);
            Graph.stroke();
        }

        // update star position values with new settings
        n.px = xx;
        n.py = yy;
        n.z -= Z;

        // reset when star is out of the view field
        if (n.z < Z || n.px > width || n.py > height) {
            // reset star
            resetStar(n);
        }
    }

    // colour cycle sinewave rotation
    cycle += 0.01;

    window.requestAnimFrame(renderStarfield);
};

window.requestAnimFrame(renderStarfield);