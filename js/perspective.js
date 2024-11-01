(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Perspective = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright 2010 futomi  http://www.html5.jp/
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// perspective.js v0.0.2
// 2010-08-28
//
// This file was modified by Fabien LOISON <http://www.flozz.fr/>


/* -------------------------------------------------------------------
 * define objects (name space) for this library.
 * ----------------------------------------------------------------- */

var html5jp = window.html5jp || {};

(function() {

    /* -------------------------------------------------------------------
     * constructor
     * ----------------------------------------------------------------- */
    html5jp.perspective = function(ctxd, image, crop_x, crop_y, crop_w, crop_h, add_height) {
        // check the arguments
        if( ! ctxd || ! ctxd.strokeStyle ) { return; }
        if( ! image || ! image.width || ! image.height ) { return; }
        // prepare a <canvas> for the image
        var cvso = document.getElementById('cvso'); //document.createElement('canvas');
        cvso.width = crop_w; //parseInt(image.width);
        cvso.height = crop_h; //parseInt(image.height);
        var ctxo = cvso.getContext('2d');
        ctxo.drawImage(image, crop_x, crop_y, crop_w, crop_h, 0, 0, crop_w, crop_h);
        // prepare a <canvas> for the transformed image
        var cvst = document.getElementById('cvst'); //document.createElement('canvas');
        cvst.width = cvso.width; // ctxd.canvas.width;
        cvst.height = cvso.height + add_height; // ctxd.canvas.height;
        var ctxt = cvst.getContext('2d');
        // parameters
        this.p = {
            ctxd: ctxd,
            cvso: cvso,
            ctxo: ctxo,
            ctxt: ctxt
        }
    };

    /* -------------------------------------------------------------------
     * prototypes
     * ----------------------------------------------------------------- */

    var proto = html5jp.perspective.prototype;

    /* -------------------------------------------------------------------
     * public methods
     * ----------------------------------------------------------------- */

    proto.draw = function(points, xOffset, yOffset, add_height) {
        var d0x = points[0][0];
        var d0y = points[0][1];
        var d1x = points[1][0];
        var d1y = points[1][1];
        var d2x = points[2][0];
        var d2y = points[2][1];
        var d3x = points[3][0];
        var d3y = points[3][1];
        // compute the dimension of each side
        var dims = [
            Math.sqrt( Math.pow(d0x-d1x, 2) + Math.pow(d0y-d1y, 2) ), // top side
            Math.sqrt( Math.pow(d1x-d2x, 2) + Math.pow(d1y-d2y, 2) ), // right side
            Math.sqrt( Math.pow(d2x-d3x, 2) + Math.pow(d2y-d3y, 2) ), // bottom side
            Math.sqrt( Math.pow(d3x-d0x, 2) + Math.pow(d3y-d0y, 2) )  // left side
                ];
        //
        var ow = this.p.cvso.width;
        var oh = this.p.cvso.height;
        // specify the index of which dimension is longest
        var base_index = 0;
        var max_scale_rate = 0;
        var zero_num = 0;
        for( var i=0; i<4; i++ ) {
            var rate = 0;
            if( i % 2 ) {
                rate = dims[i] / ow;
            } else {
                rate = dims[i] / oh;
            }
            if( rate > max_scale_rate ) {
                base_index = i;
                max_scale_rate = rate;
            }
            if( dims[i] == 0 ) {
                zero_num ++;
            }
        }
        if(zero_num > 1) { return; }
        //
        var step = 2;
        var cover_step = step * 5;
        //
        var ctxo = this.p.ctxo;
        var ctxt = this.p.ctxt;
       // ctxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height);
        if(base_index % 2 == 0) { // top or bottom side
            var ctxl = this.create_canvas_context(ow, cover_step);
            ctxl.globalCompositeOperation = "copy";
            var cvsl = ctxl.canvas;
            for( var y=0; y<oh; y+=step ) {
                var r = y / oh;
                var sx = d0x + (d3x-d0x) * r;
                var sy = d0y + (d3y-d0y) * r;
                var ex = d1x + (d2x-d1x) * r;
                var ey = d1y + (d2y-d1y) * r;
                var ag = Math.atan( (ey-sy) / (ex-sx) );
                var sc = Math.sqrt( Math.pow(ex-sx, 2) + Math.pow(ey-sy, 2) ) / ow;
                ctxl.setTransform(1, 0, 0, 1, 0, -y);
                ctxl.drawImage(ctxo.canvas, 0, 0);
                //
                ctxt.translate(sx, sy);
                ctxt.rotate(ag);
                ctxt.scale(sc, sc);
                ctxt.drawImage(cvsl, 0, 0);
                //
                ctxt.setTransform(1, 0, 0, 1, 0, 0);
            }
        } else if(base_index % 2 == 1) { // right or left side
            var ctxl = this.create_canvas_context(cover_step, oh);
            ctxl.globalCompositeOperation = "copy";
            var cvsl = ctxl.canvas;
            for( var x=0; x<ow; x+=step ) {
                var r =  x / ow;
                var sx = d0x + (d1x-d0x) * r;
                var sy = d0y + (d1y-d0y) * r;
                var ex = d3x + (d2x-d3x) * r;
                var ey = d3y + (d2y-d3y) * r;
                var ag = Math.atan( (sx-ex) / (ey-sy) );
                var sc = Math.sqrt( Math.pow(ex-sx, 2) + Math.pow(ey-sy, 2) ) / oh;
                ctxl.setTransform(1, 0, 0, 1, -x, 0);
                ctxl.drawImage(ctxo.canvas, 0, 0);
                //
                ctxt.translate(sx, sy);
                ctxt.rotate(ag);
                ctxt.scale(sc, sc);
                ctxt.drawImage(cvsl, 0, 0);
                //
                ctxt.setTransform(1, 0, 0, 1, 0, 0);
            }
        }
        // set a clipping path and draw the transformed image on the destination canvas.
  //      this.p.ctxd.save();
//        this.p.ctxd.drawImage(ctxt.canvas,xOffset, yOffset,  ctxt.canvas.width, ctxt.canvas.height, crop_x, crop_y, ctxt.canvas.width, ctxt.canvas.height);
        this.p.ctxd.drawImage(ctxt.canvas, xOffset, yOffset); // - parseInt(add_height / 2));
        this._applyMask(this.p.ctxd, [[d0x, d0y], [d1x, d1y], [d2x, d2y], [d3x, d3y]], xOffset, yOffset);
//        this.p.ctxd.restore();
    }

    /* -------------------------------------------------------------------
     * private methods
     * ----------------------------------------------------------------- */

    proto.create_canvas_context = function(w, h) {
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        return ctx;
    };

    proto._applyMask = function(ctx, points, xOffset, yOffset) {
        ctx.beginPath();
        ctx.moveTo(xOffset + points[0][0], yOffset + points[0][1]);
        for( var i=1; i<points.length; i++ ) {
            ctx.lineTo(xOffset + points[i][0], yOffset + points[i][1]);
        }
        ctx.closePath();
        ctx.globalCompositeOperation = "destination-in";
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
    };

})();


module.exports = html5jp.perspective;

},{}]},{},[1])(1)
});
