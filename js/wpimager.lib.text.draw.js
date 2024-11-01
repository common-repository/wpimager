/*!
 WPImager 1.0.0    
 Text Draw Object
 https://wpimager.com/
 2018 WPImager  
 */

/**
 * Text Draw Object
 * Contains methods and properties to draw text layers objects on canvas
 */

(function ($) {
    WPImagerUI.drawText = function (textlayer, textdraw) {
        var layer = parseInt(textlayer);
        // var textdraw = WPImager.layer[layer];
        var txtx = textdraw.xOffset;
        var txty = textdraw.yOffset;
        var txtr = textdraw.rotation;
        var txta = textdraw.textangle;
        var txtw = textdraw.width;
        var txth = textdraw.height;
        var visible = textdraw.visible;
        var fontsize = textdraw.fontsize;
        if (!visible)
            return;
        if (textdraw.disposed > 0)
            return;

        var alpha = textdraw.alpha;
        var maxWidth = txtw;
        var maxHeight = txth;
        var calibratedY = 0;

        var x = 0, y = 0, fx = textdraw.xFine, fy = textdraw.yFine - calibratedY;
        var absLeft, absTop, absRight, absBottom, textWidthWidest;
        var align = textdraw.align;
        var valign = textdraw.valign;

        if (textdraw.circOn || textdraw.shape == UI.SHAPE.CURVEDTEXT) {
            valign = "middle";
        }

        var textdir = WPImager.canvas.textdir;

        if (align === "center") {
            this.ctx.textAlign = "center";
        } else if (align === "right") {
            if (textdir === "rtl") {
                this.ctx.textAlign = "start";
            } else {
                this.ctx.textAlign = "end";
            }
        } else {
            if (textdir === "rtl") {
                this.ctx.textAlign = "end";
            } else {
                this.ctx.textAlign = "start";
            }
        }
        x = txtx;
        absLeft = x;

//            this.ctx.font = (textdraw.italic ? "italic " : "") + (textdraw.bold ? "bold " : "") + fontsize + "px " + textdraw.fontfamily.toString().replace(/\+/g, ' ').trim();
        var fontWeight = textdraw.fontweight.toString();
        this.ctx.font = (textdraw.italic ? "italic " : "") + fontWeight + " " + fontsize + "px " + textdraw.fontfamily.toString().replace(/\+/g, ' ').trim();

        if (valign === "middle" || valign === "bottom") {
//            this.ctx.textBaseline = valign;
            this.ctx.textBaseline = "alphabetic";
            y = 0;
            var wrapped = this.drawWrapText(this.ctx, textlayer, textdraw, x, y, fx, fy, txtr, txta, false);
            var maxY = wrapped.y;
            textWidthWidest = wrapped.textWidthWidest;
            y = txty;
            absTop = y;
            wrapped = this.drawWrapText(this.ctx, textlayer, textdraw, x, y, fx, fy, txtr, txta, true, wrapped);
            absBottom = wrapped.y;
        } else {
            //          this.ctx.textBaseline = "top";
            this.ctx.textBaseline = "alphabetic";
            y = txty;
            var wrapped = this.drawWrapText(this.ctx, textlayer, textdraw, x, y, fx, fy, txtr, txta, false);
            absTop = y;
            wrapped = this.drawWrapText(this.ctx, textlayer, textdraw, x, y, fx, fy, txtr, txta, true, wrapped);
            var maxY = wrapped.y;
            textWidthWidest = wrapped.textWidthWidest;
            absBottom = maxY;
        }


        textdraw.absLeft = absLeft;
        textdraw.absRight = absLeft + maxWidth;
        textdraw.absTop = absTop;
        textdraw.absBottom = absTop + maxHeight;

        // draw text tip
        if (UI.hitLayer >= 0)
        {
            var hitlayer = parseInt(UI.hitLayer);
            this.ctx.globalAlpha = 1;
            var h = txth;
            var w = txtw;
            var borderGap = textdraw.borderPlusGap();
            var borderGap2 = borderGap * 2;
            if (layer === hitlayer && layer !== parseInt(WPImager.current)
                    || (WPImager.canvas.picktool === 1 && layer === hitlayer)) {
                var color = (textdraw.locked) ? "#aa1111" : "#ffffff";
                if (UI.isPrinting) {
                    // skip         
                } else if (UI.resizeCVS) {
                    // skip                             
                } else if (UI.console == UI.CNSL.TXTCURVED
                        && UI.console_shape == UI.CNSL.SHAPETOOLEDIT) {
                    // skip                    
                } else if (UI.console == UI.CNSL.SHAPETOOLBAR && (UI.console == UI.CNSL.SHAPETOOLNEW
                        || UI.console_shape == UI.CNSL.SHAPETOOLNEWLINE
                        || UI.console == UI.CNSL.SHAPETOOLEDIT || UI.console == UI.CNSL.SHAPETOOLDRAW)) {
                    // skip                    
                } else if (textdraw.shape == UI.SHAPE.LINE) {
                    var moveX = 0, moveY = 0;
                    var shiftX = w / 2, shiftY = h / 2;
                    this.draw_line_guide(textdraw, txtx, txty, moveX, moveY, shiftX, shiftY, textdraw.rotation, "orange");
                } else if (UI.expectPoint == -1) {
                    this.draw_expect_guide(1, color, txtx - borderGap, txty - borderGap, w + borderGap2, h + borderGap2, 0, 0, w / 2, h / 2, w + borderGap2, h + borderGap2, textdraw.rotation, false);
                }
            }
        }

        if (UI.resizeCVS) {
            // skip drawing guide
        } else if ((layer === parseInt(WPImager.current) && WPImager.canvas.picktool === 0) ||
                WPImager.multiselect.indexOf(layer) !== -1)
        {
            var color = (textdraw.locked) ? "#aa1111" : "#4285f4";
            color = (textdraw.slide == 0) ? "#008000" : color;
            var x = txtx;
            var y = txty;
            var h = txth;
            var w = txtw;
            var alpha = textdraw.alpha;
            var moveX = 0;
            var moveY = 0;
            shiftX = w / 2;
            shiftY = h / 2;
            var dw = w;
            var dh = h;
            var borderGap = textdraw.borderPlusGap();
            var borderGap2 = borderGap * 2;

            if (WPImager.multiselect.indexOf(layer) !== -1) {
                color = (textdraw.locked) ? "#aa1111" : "#ffffff";
                if (!UI.isPrinting)
                    this.draw_expect_guide(1, color, x - borderGap, y - borderGap, w + borderGap2, h + borderGap2, moveX, moveY, shiftX, shiftY, dw + borderGap2, dh + borderGap2, textdraw.rotation, false);
            } else if (!UI.isPrinting) {
                if (WPImager.multiselect.length + WPImager.multiselect.length == 0) {
                    var deg = textdraw.rotation;
                    if ((UI.isCropping || UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)
                            && WPImager.current == layer) {
                        deg = 0;
                    }
                    if (textdraw.shape == UI.SHAPE.LINE) {
                        this.draw_line_guide(textdraw, x, y, moveX, moveY, shiftX, shiftY, deg);

                        if (textdraw.locked) {
                            this.draw_line_guide(textdraw, x, y, moveX, moveY, shiftX, shiftY, deg, "#aa1111");
                        } else if (layer === hitlayer || (UI.draggingMouse && UI.expectPoint == -1)) {
                            this.draw_line_guide(textdraw, x, y, moveX, moveY, shiftX, shiftY, deg, "#4f81bd");
                        }

                    } else if (UI.console == UI.CNSL.SHAPETOOLBAR && (UI.console_shape == UI.CNSL.SHAPETOOLNEW || UI.console_shape == UI.CNSL.SHAPETOOLNEWLINE)) {
                        // skip
                    } else if (UI.console == UI.CNSL.SHAPETOOLBAR &&
                            (UI.console_shape == UI.CNSL.SHAPETOOLEDIT || UI.console_shape == UI.CNSL.SHAPETOOLDRAW)) {
                        this.draw_point_guide(textdraw, x, y, moveX, moveY, shiftX, shiftY, deg);
                    } else if (UI.console == UI.CNSL.TXTCURVED
                            && UI.console_shape == UI.CNSL.SHAPETOOLEDIT) {
                        this.draw_point_guide(textdraw, x, y, moveX, moveY, shiftX, shiftY, deg);
                    } else {
                        this.draw_current_guide(color, x - borderGap, y - borderGap, w + borderGap2, h + borderGap2, moveX, moveY, shiftX, shiftY, dw + borderGap2, dh + borderGap2, deg, this.degMax, UI.isRotating, textdraw.locked);
                    }
                } else {
                    this.draw_expect_guide(1, color, x - borderGap, y - borderGap, w + borderGap2, h + borderGap2, moveX, moveY, shiftX, shiftY, dw + borderGap2, dh + borderGap2, textdraw.rotation, false);
                }
            }
        }

    };

    WPImagerUI.drawWrapText = function (context, layer, textdraw, x, y, fx, fy, rotation, textangle, draw, wrapped) {
        //  var textdraw = WPImager.layer[layer];
        var fontSize = textdraw.fontsize;
        var fontFamily = textdraw.fontfamily;
        var fontColor = textdraw.fontcolor;
        var text = textdraw.content;
        var lineHeight = parseInt(fontSize * textdraw.lineheight);
        var maxWidth = textdraw.width;
        var maxHeight = textdraw.height;
        var padding = textdraw.padding;
        var letterspacing = textdraw.textspacing;
        var textalpha = textdraw.alpha;
        var textradius = (textdraw.shape == UI.SHAPE.CIRCLE) ? textdraw.width / 2 + 1 : textdraw.textradius;
        var textoutline = textdraw.textoutline;
        var textborder = textdraw.textborder;
        var polyradius = textdraw.radius;
        var skewA = textdraw.skewA;
        var skewB = textdraw.skewB;
        var skewP = textdraw.skewP;
        var skewDir = textdraw.skewDir;

        var align = textdraw.align;
        var valign = textdraw.valign;
        if (textdraw.circOn || textdraw.shape == UI.SHAPE.CURVEDTEXT) {
            valign = "middle";
        }

        var drawTransparentText = (textdraw.fontcoloroption == "color" && (fontColor == "#0000ffff"));
        var drawColoredText = !drawTransparentText;

        var calibratedY = 0;

        fy = textdraw.yFine; // drop calibratedY value;


        context.save();
        textalpha = (textalpha > 0 && textalpha < 100) ? textalpha / 100 : 1;
        //manage carriage return
        text = text.replace(/(\r\n|\n\r|\r|\n)/g, "\n");
        //manage tabulation
        text = text.replace(/(\t)/g, "    "); // 4 spaces for tabulation
        //array of lines
        var sections = text.split("\n");
        var textWidthWidest = 0;
        var y_shift = 0;
        var deg = rotation;
        var shiftX = 0, shiftY = 0;
        var moveX = 0, moveY = 0;
        if (draw) {
            textWidthWidest = wrapped.textWidthWidest; // second pass
            moveX = maxWidth / 2;
            moveY = maxHeight / 2;
            if (align === "left") {
                shiftX += maxWidth / 2;
                shiftX = maxWidth / 2;
                shiftX -= padding;
            } else if (align === "right") {
                shiftX += -maxWidth / 2;
                shiftX = -maxWidth / 2;
                shiftX += padding;
            } else {

            }
            if (valign == "middle") {
                shiftY += wrapped.textHeight / 2;
            } else if (valign == "bottom") {
                shiftY = padding;
//                shiftY += 1;   // compensate to avoid exceeeding bottom of container
                shiftY += -maxHeight / 2 + wrapped.textHeight;
            } else {
                shiftY = -padding;
//                shiftY += maxHeight / 2 - lineHeight / 2;
                shiftY += maxHeight / 2;
            }
            shiftY -= (textdraw.fontsize * textdraw.lineheight) * 0.75;
        }


        context.translate((x + moveX), (y + moveY));

        if ((UI.isCropping || UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)
                && WPImager.current == layer) {
            deg = 0; // don't rotate when cropping or editing text layer  
            textangle = 0;
        }

        // var BGCanvas = document.createElement('canvas');
        var BGCanvas = document.getElementById('BGCanvas');

        if (draw) {
            // var backalpha = textdraw.backalpha;
            var backalpha = textdraw.alpha;
            backalpha = (backalpha > 0 && backalpha < 100) ? backalpha / 100 : 1;
            context.globalAlpha = backalpha;

            BGCanvas.width = (UI.comScale.active) ? UI.comScale.scaledWidth : this.canvas.width;
            BGCanvas.height = (UI.comScale.active) ? UI.comScale.scaledHeight : this.canvas.height;
            var BGCtx = BGCanvas.getContext('2d');
            BGCtx.clearRect(0, 0, BGCanvas.width, BGCanvas.height);
            BGCtx.fillStyle = context.fillStyle;
            BGCtx.lineCap = textdraw.lineCap();
            BGCtx.lineJoin = textdraw.lineJoin();
            if (UI.comScale.active) {
                var moveH = (x + moveX) * UI.comScale.scaleX;
                var moveV = (y + moveY) * UI.comScale.scaleY;
                BGCtx.translate(moveH, moveV);

            } else {
                BGCtx.translate((x + moveX), (y + moveY));
            }
            // var rotate = textdraw.polyangle + deg;
            var rotate = deg;
            BGCtx.rotate(rotate * Math.PI / 180);
            if (false && drawColoredText) {
                // ** draw background                    
                this.drawTextColoredBackground(BGCtx, layer, textdraw, maxWidth, maxHeight);
                // redraw border for curve line / custom shape 
                if (UI.comScale.active) {
                    context.drawImage(BGCanvas, -(x + moveX), -(y + moveY), BGCanvas.width, BGCanvas.height);

                } else {
                    context.drawImage(BGCanvas, -(x + moveX), -(y + moveY), BGCanvas.width, BGCanvas.height);
                }
            }
        }

        context.rotate(deg * Math.PI / 180);
        context.fillStyle = fontColor;
//            context.font = (textdraw.italic ? "italic " : "") + (textdraw.bold ? "bold " : "") + fontSize + "px " + fontFamily.toString().replace(/\+/g, ' ').trim();
        var fontWeight = textdraw.fontweight.toString();
        context.font = (textdraw.italic ? "italic " : "") + fontWeight + " " + fontSize + "px " + fontFamily.toString().replace(/\+/g, ' ').trim();

        var maskCtx, maskCtx2;
        if (draw) {// && drawTransparentText) {

            this.drawTextTransparentBackground(BGCtx, layer, textdraw, maxWidth, maxHeight);
            //        var maskCanvas = document.createElement('canvas');            
            var maskCanvas = document.getElementById('MaskCanvas');
            var maskCanvas2 = document.getElementById('MaskCanvas2');

            // Ensure same dimensions as canvas
            maskCanvas.width = (UI.comScale.active) ? UI.comScale.scaledWidth : this.canvas.width;
            maskCanvas.height = (UI.comScale.active) ? UI.comScale.scaledHeight : this.canvas.height;
            maskCtx = maskCanvas.getContext('2d');
            maskCtx.textBaseline = context.textBaseline;
            maskCtx.textAlign = context.textAlign;
            maskCtx.lineCap = textdraw.lineCap();
            maskCtx.lineJoin = textdraw.lineJoin();

            maskCanvas2.width = (UI.comScale.active) ? UI.comScale.bgrCanvasWidth : this.canvas.width;
            maskCanvas2.height = (UI.comScale.active) ? UI.comScale.bgrCanvasHeight : this.canvas.height;
            maskCtx2 = maskCanvas2.getContext('2d');
            maskCtx2.textBaseline = context.textBaseline;
            maskCtx2.textAlign = context.textAlign;
            maskCtx2.lineCap = textdraw.lineCap();
            maskCtx2.lineJoin = textdraw.lineJoin();


            // var rotate = textdraw.polyangle + deg;


            var rotate = deg;
            maskCtx.drawImage(BGCanvas, 0, 0, BGCanvas.width, BGCanvas.height);

            maskCtx.translate((x + moveX), (y + moveY));
            maskCtx2.translate((x + moveX), (y + moveY));

            maskCtx.rotate(rotate * Math.PI / 180);


            // prepare to draw transparent text
            // maskCtx.rotate(-textdraw.polyangle * Math.PI / 180);
            // maskCtx.font = (textdraw.italic ? "italic " : "") + (textdraw.bold ? "bold " : "") + fontSize + "px " + fontFamily.toString().replace(/\+/g, ' ').trim();
            var fontWeight = textdraw.fontweight.toString();
            maskCtx.font = (textdraw.italic ? "italic " : "") + fontWeight + " " + fontSize + "px " + fontFamily.toString().replace(/\+/g, ' ').trim();
            maskCtx.save();
            maskCtx.beginPath();

            // maskCtx2.font = (textdraw.italic ? "italic " : "") + (textdraw.bold ? "bold " : "") + fontSize + "px " + fontFamily.toString().replace(/\+/g, ' ').trim();
            maskCtx2.font = (textdraw.italic ? "italic " : "") + fontWeight + " " + fontSize + "px " + fontFamily.toString().replace(/\+/g, ' ').trim();
            maskCtx2.rotate(deg * Math.PI / 180);

            if (drawColoredText) {
//                // ** draw background                    
//                this.drawTextColoredBackground(BGCtx, layer, textdraw, maxWidth, maxHeight);
//                // redraw border for curve line / custom shape 
//                if (UI.comScale.active) {
//                    context.drawImage(BGCanvas, -(x + moveX), -(y + moveY), BGCanvas.width, BGCanvas.height);
//
//                } else {
//                    context.drawImage(BGCanvas, -(x + moveX), -(y + moveY), BGCanvas.width, BGCanvas.height);
//                }

                var backalpha = textdraw.alpha;
                backalpha = (backalpha > 0 && backalpha < 100) ? backalpha / 100 : 1;
                context.globalAlpha = backalpha;
                context.shadowColor = "transparent";
                if (textdraw.textshadowfillOn) {
                    context.shadowColor = textdraw.textshadowfillcolor;
                    context.shadowOffsetX = textdraw.textshadowfillOx * (UI.comScale.active ? UI.comScale.scaleX : 1);
                    context.shadowOffsetY = textdraw.textshadowfillOy * (UI.comScale.active ? UI.comScale.scaleY : 1);
                    context.shadowBlur = textdraw.textshadowfill * (UI.comScale.active ? UI.comScale.scaleX : 1);
                }
                context.rotate(-deg * Math.PI / 180); // adjust rotation temporarily to reset position
                context.drawImage(maskCanvas, -(x + moveX), -(y + moveY), maskCanvas.width, maskCanvas.height);
                context.rotate(deg * Math.PI / 180);

                maskCtx.restore();

            }


        }

        // ** draw text
        if (draw) {
            moveX = maxWidth / 2;
            moveY = maxHeight / 2;
            if (drawTransparentText) {
//                maskCtx2.translate((-x - moveX), (-y - moveY));
//                    maskCtx2.scale(UI.comScale.scaleX, UI.comScale.scaleY);
//                maskCtx2.translate(x + moveX, y + moveY);
                maskCtx.rotate(-rotate * Math.PI / 180);
                maskCtx.translate((-x - moveX), (-y - moveY));
                if (UI.comScale.active) {
                    maskCtx.scale(UI.comScale.scaleX, UI.comScale.scaleY);
                }
                maskCtx.translate(x + moveX, y + moveY);
                maskCtx.rotate(rotate * Math.PI / 180);
            } else {
                context.rotate(-rotate * Math.PI / 180);
                context.translate((-x - moveX), (-y - moveY));
                if (UI.comScale.active) {
                    context.scale(UI.comScale.scaleX, UI.comScale.scaleY);
                }
                context.translate(x + moveX, y + moveY);
                context.rotate(rotate * Math.PI / 180);
            }
        }
        var cursor_start = 0;
        var cursor_stop = 0;
        var lineNow = -1;
        var mapLineNo = -1;
        if (draw && UI.input.cursormove !== 0 && layer == WPImager.current) {
            mapLineNo = 0;  // zero triggers array UI.input.cursorLineUpDown refresh
        }

        if (draw && !textdraw.fontgradline) {
            // for whole block of text
            var _oY = (valign == "top") ? -maxHeight / 2 + wrapped.textHeight / 2 + padding : 0;
            _oY = (valign == "bottom") ? maxHeight / 2 - wrapped.textHeight / 2 - padding : _oY;
            if (align == "right") {
                this.setContextGradientText(context, draw, textdraw, -shiftX - textWidthWidest / 2 + letterspacing / 2, _oY - calibratedY, textWidthWidest * 2, wrapped.textHeight, textdraw.fontgradrotation);
            } else if (align == "left") {
                this.setContextGradientText(context, draw, textdraw, -shiftX + textWidthWidest / 2 - letterspacing / 2, _oY - calibratedY, textWidthWidest * 2, wrapped.textHeight, textdraw.fontgradrotation);
            } else {
                this.setContextGradientText(context, draw, textdraw, -shiftX, _oY - calibratedY, textWidthWidest * 2, wrapped.textHeight, textdraw.fontgradrotation);
            }
        }

        for (var s = 0, len = sections.length; s < len; s++) {

            var words = sections[s].split(' ');
            var line = '';
            if (mapLineNo >= 0)
                mapLineNo++;
            lineNow++;
            // iterating one sentence or section at a time, all the words in the sentence
            for (var n = 0; n < words.length; n++) {
                context.shadowColor = "transparent";
                this.setContextShadow(context, draw, textdraw);
                if (draw && drawTransparentText) {
                    this.setContextShadow(maskCtx, draw, textdraw);
                    maskCtx.globalAlpha = textalpha;
                }
                var testLine = line + words[n] + ' ';
                var testLine_NoEndSpace = line + words[n];
                var metrics = context.measureText(testLine);
                var testWidth = metrics.width + 2 * padding + testLine_NoEndSpace.length * letterspacing;
                if (n > 0 && testWidth > maxWidth) {
                    // text overflow
                    if (draw) {
                        context.globalAlpha = textalpha;
                        var textout = line.replace(/ $/, "");

//                        if (s > 0) 
                        cursor_start = cursor_stop;
                        cursor_stop = cursor_start + textout.length + (lineNow > 0 ? 1 : 0);


                        var _ctx = (drawTransparentText) ? maskCtx : context;

                        if ((UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)
                                && UI.input.selection[1] != UI.input.selection[0] && UI.input.cursorPos >= 0 && layer == WPImager.current) {
                            // textarea has selection, draw it if in section
                            var selStart = UI.input.selection[0];
                            var selStop = UI.input.selection[1];
                            var selection_insection = false;
                            if (selStart > cursor_start && selStart < cursor_stop || selStart == 0 && cursor_start == 0) {
                                selStop = (selStop > cursor_stop) ? cursor_stop : selStop;
                                selection_insection = true;
                            } else if (selStart < cursor_start + 1 && selStop > cursor_start) {
                                selStop = (selStop > cursor_stop) ? cursor_stop : selStop;
                                selStart = cursor_start + 1;
                                selection_insection = true;

                            }
                            if (selection_insection) {
                                _ctx.globalCompositeOperation = "source-over";
                                var _letterspacing = (textdraw.shape == UI.SHAPE.CURVEDTEXT || textdraw.circOn) ? 0 : letterspacing;
                                this.highlightText(_ctx, layer, lineNow, textout, wrapped, align, valign, maxWidth, maxHeight,
                                        lineHeight, _letterspacing, padding, y_shift + textdraw.yFine - calibratedY, fontSize, selection_insection, cursor_start, selStart, selStop);
                            }
                        }
                        if (UI.input.cursorPos < 0) {
                            var _letterspacing = (textdraw.shape == UI.SHAPE.CURVEDTEXT || textdraw.circOn) ? 0 : letterspacing;
                            this.placeCursor(context, UI.hoverX - textdraw.xOffset - textdraw.xFine, UI.hoverY - textdraw.yOffset - textdraw.yFine + calibratedY, layer, lineNow, cursor_start, textout, maxWidth, maxHeight, lineHeight, _letterspacing, padding, valign, align, wrapped, y_shift, fontSize);
                        }
                        if (UI.input.cursorPos >= 0 && UI.input.selection[1] == UI.input.selection[0]) {
                            _ctx.globalCompositeOperation = "source-over";
                            var _letterspacing = (textdraw.shape == UI.SHAPE.CURVEDTEXT || textdraw.circOn) ? 0 : letterspacing;

                            var cursor_insection = (UI.input.cursorPos < cursor_stop && UI.input.cursorPos > cursor_start || UI.input.cursorPos == cursor_stop || UI.input.cursorPos == 0 && cursor_start == 0 && lineNow == 0);
                            this.drawCursor(_ctx, layer, x + moveX, y + moveY, textout, wrapped, align, valign, maxWidth, maxHeight,
                                    lineHeight, _letterspacing, padding, y_shift + textdraw.yFine - calibratedY, textdraw.xFine, fontSize, cursor_insection, cursor_start, lineNow, mapLineNo);
                        }

                        if (!(textdraw.circOn || textdraw.shape == UI.SHAPE.CURVEDTEXT) || (layer == WPImager.current && (UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)))
                        {
                            if (drawTransparentText) {
                                maskCtx.globalCompositeOperation = "source-over";
                                if (textdraw.textshadowOn) {
                                    maskCtx.fillStyle = textdraw.backcolor;
                                    maskCtx.renderFillText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, letterspacing);
                                }
                                // draw stroke with shadow
                                if (textdraw.textoutline > 0) {
                                    maskCtx.globalAlpha = textalpha;
                                    maskCtx.strokeStyle = textdraw.textoutlinecolor;
                                    maskCtx.lineWidth = textoutline;
                                    maskCtx.renderStrokeText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, letterspacing);
                                }
                                // draw fill text with shadow
                                maskCtx2.fillStyle = "#ffffff";
                                maskCtx2.shadowColor = "transparent";
                                maskCtx2.renderFillText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, letterspacing);
                                maskCtx.globalCompositeOperation = "destination-out";
                                // reverse any group rotation
                                maskCtx.rotate(-deg * Math.PI / 180);
                                maskCtx.drawImage(maskCanvas2, -(x + moveX), -(y + moveY), maskCanvas2.width, maskCanvas2.height);
                                maskCtx.rotate(deg * Math.PI / 180);
                                this.setContextShadow(maskCtx, draw, textdraw);
                            } else if (drawColoredText) {
                                if (textdraw.textoutline > 0) {
                                    context.strokeStyle = textdraw.textoutlinecolor;
                                    context.lineWidth = textoutline;
                                    context.renderStrokeText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, letterspacing);
                                }
                                var metrics = context.measureText(textout);
                                var textout_width = metrics.width + letterspacing * textout.length;
                                if (textdraw.fontgradline) {
                                    textout_width *= 2;
                                    if (align == "right") {
                                        this.setContextGradientText(context, draw, textdraw, -shiftX - textout_width / 4 + letterspacing / 2, y_shift - shiftY - calibratedY - fontSize / 4, textout_width, fontSize, textdraw.fontgradrotation);
                                    } else if (align == "left") {
                                        this.setContextGradientText(context, draw, textdraw, -shiftX + textout_width / 4 - letterspacing / 2, y_shift - shiftY - calibratedY - fontSize / 4, textout_width, fontSize, textdraw.fontgradrotation);
                                    } else {
                                        this.setContextGradientText(context, draw, textdraw, -shiftX, y_shift - shiftY - calibratedY - fontSize / 4, textout_width, fontSize, textdraw.fontgradrotation);
                                    }
                                } else {
//                                    var _oY = (valign == "top") ? -maxHeight / 2 + wrapped.textHeight / 2 + padding : 0;
//                                    _oY = (valign == "bottom") ? maxHeight / 2 - wrapped.textHeight / 2 - padding : _oY;
//                                    if (align == "right") {
//                                        this.setContextGradientText(context, draw, textdraw, -shiftX - textWidthWidest / 2 + letterspacing / 2, _oY - calibratedY, textWidthWidest * 2, wrapped.textHeight, textdraw.fontgradrotation);
//                                    } else if (align == "left") {
//                                        this.setContextGradientText(context, draw, textdraw, -shiftX + textWidthWidest / 2 - letterspacing / 2, _oY - calibratedY, textWidthWidest * 2, wrapped.textHeight, textdraw.fontgradrotation);
//                                    } else {
//                                        this.setContextGradientText(context, draw, textdraw, -shiftX, _oY - calibratedY, textWidthWidest * 2, wrapped.textHeight, textdraw.fontgradrotation);
//                                    }
                                }

                                if (textdraw.textshadowOn) {
                                    context.renderFillText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, letterspacing);
                                }
                                context.shadowColor = "transparent";
                                if (textdraw.textoutline > 0) {
                                    context.strokeStyle = textdraw.textoutlinecolor;
                                    context.lineWidth = textoutline;
                                    context.renderStrokeText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, letterspacing);
                                }
                                // loop textout
                                context.renderFillText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, letterspacing);
//                                    context.renderFillText(textout, -shiftX +50, y_shift - shiftY - calibratedY + 50, fx, fy, textangle, letterspacing);
                                this.setContextShadow(context, draw, textdraw);

                            }
                        }
                    } else {
                        var _textout = line.replace(/ $/, "");
                        var testWidth = context.measureText(_textout).width + _textout.length * letterspacing;
                        if (testWidth > textWidthWidest) {
                            textWidthWidest = testWidth;
                        }
                    }
                    line = words[n] + ' '; // restart line
                    y_shift += lineHeight;
                    if (mapLineNo >= 0)
                        mapLineNo++;
                    lineNow++;
                } else {
                    // text not overflow, include the next word
                    if (!draw && testWidth > textWidthWidest) {
                        // first pass - calculate textWidthWidest
                        var testWidth = context.measureText(testLine_NoEndSpace).width + /* 2 * padding + */ testLine_NoEndSpace.length * letterspacing;
                        if (testWidth > textWidthWidest) {
                            textWidthWidest = testWidth;
                        }
                    }
                    line = testLine;
                }
            }

            // draw the whole sentence or last part of the sentence if overflow present

            if (draw) {
                context.globalAlpha = textalpha;
                var textout = line.replace(/ $/, "");

                cursor_start = cursor_stop;
                cursor_stop = cursor_start + textout.length + (lineNow > 0 ? 1 : 0);

                var _ctx = (drawTransparentText) ? maskCtx : context;
                // draw the selection
                if ((UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)
                        && UI.input.selection[1] != UI.input.selection[0] && UI.input.cursorPos >= 0 && layer == WPImager.current) {
                    // textarea has selection, draw it if in section
                    var selStart = UI.input.selection[0];
                    var selStop = UI.input.selection[1];
                    var selection_insection = false;// (selStart < cursor_stop && selStart > cursor_start || selStart == cursor_stop || selStart == 0 &&  cursor_start == 0);
                    if (selStart > cursor_start && selStart < cursor_stop || selStart == 0 && cursor_start == 0) {
                        selStop = (selStop > cursor_stop) ? cursor_stop : selStop;
                        selection_insection = true;
                    } else if (selStart < cursor_start + 1 && selStop > cursor_start) {
                        selStop = (selStop > cursor_stop) ? cursor_stop : selStop;
                        selStart = cursor_start + 1;
                        selection_insection = true;

                    }
                    if (selection_insection) {
                        _ctx.globalCompositeOperation = "source-over";
                        var _letterspacing = (textdraw.shape == UI.SHAPE.CURVEDTEXT || textdraw.circOn) ? 0 : letterspacing;
                        this.highlightText(_ctx, layer, lineNow, textout, wrapped, align, valign, maxWidth, maxHeight,
                                lineHeight, _letterspacing, padding, y_shift + textdraw.yFine - calibratedY, fontSize, selection_insection, cursor_start, selStart, selStop);
                    }

                }

                if (UI.input.cursorPos == UI.input.CURSORPUT_MOUSECLICK || UI.input.cursorPos == UI.input.CURSORCALC_MOUSECLICK) {
                    var _letterspacing = (textdraw.shape == UI.SHAPE.CURVEDTEXT || textdraw.circOn) ? 0 : letterspacing;
                    this.placeCursor(context, UI.hoverX - textdraw.xOffset - textdraw.xFine, UI.hoverY - textdraw.yOffset - textdraw.yFine + calibratedY, layer, lineNow, cursor_start, textout, maxWidth, maxHeight, lineHeight, _letterspacing, padding, valign, align, wrapped, y_shift, fontSize);
                } else if (UI.input.cursorPos == UI.input.CURSORPUT_LINEDOWN) {

                }

                if (s == len - 1 && UI.input.cursorPos < 0 && layer == WPImager.current) {
                    // click found below last line of text, put cursor at end of text
                    var _letterspacing = (textdraw.shape == UI.SHAPE.CURVEDTEXT || textdraw.circOn) ? 0 : letterspacing;
                    this.placeCursor(context, UI.hoverX - textdraw.xOffset - textdraw.xFine + WPImager.canvas.width, UI.hoverY - textdraw.yOffset - textdraw.yFine + calibratedY - WPImager.canvas.height, layer, lineNow, cursor_start, textout, maxWidth, maxHeight, lineHeight, _letterspacing, padding, valign, align, wrapped, y_shift, fontSize);
                }

                if (drawTransparentText) {
                    maskCtx.globalCompositeOperation = "source-over";
                    if (textdraw.textshadowOn) {
                        maskCtx.fillStyle = textdraw.backcolor;
                        if (textdraw.circOn) {
                            if (layer == WPImager.current && (UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)) {
//                                this.setContextGradientText(maskCtx, draw, textdraw, -shiftX, y_shift - shiftY - calibratedY - fontSize / 4, 10, fontSize, 90);
                                maskCtx.renderFillText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, 0 /* letterspacing */);
                            } else {
                                this.drawCircularText(maskCtx, textdraw, true, false);
                            }
                        } else if (textdraw.shape == UI.SHAPE.CURVEDTEXT) {
                            if (layer == WPImager.current && (UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)) {
//                                this.setContextGradientText(maskCtx, draw, textdraw, 0, y_shift - shiftY -fontSize / 2 + fontSize / 8, 10, fontSize, 90);                                
////                                this.setContextGradientText(maskCtx, draw, textdraw, 0, -fontSize / 2 + fontSize / 8, 10, fontSize, 90);
                                maskCtx.renderFillText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, 0/* letterspacing */);
                            } else {
                                this.drawCurvedText(maskCtx, textdraw, true, false);
                            }
                        } else {
                            maskCtx.renderFillText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, letterspacing);
                        }
                    }
                    // draw stroke with shadow
                    if (textdraw.textoutline > 0)
                    {
                        maskCtx.globalAlpha = textalpha;
                        maskCtx.strokeStyle = textdraw.textoutlinecolor;
                        maskCtx.lineWidth = textoutline;
                        if (textdraw.circOn) {
                            if (layer == WPImager.current && (UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)) {
                                maskCtx.renderStrokeText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, 0 /*letterspacing*/);
                            } else {
                                this.drawCircularText(maskCtx, textdraw, false, true);
                            }
                        } else if (textdraw.shape == UI.SHAPE.CURVEDTEXT) {
                            if (layer == WPImager.current && (UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)) {
                                maskCtx.renderStrokeText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, 0/* letterspacing */);
                            } else {
                                this.drawCurvedText(maskCtx, textdraw, false, true);
                            }
                        } else {
                            maskCtx.renderStrokeText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, letterspacing);
                        }
                    }
                    // draw fill text with shadow   
                    maskCtx2.fillStyle = "#ffffff";
                    maskCtx2.shadowColor = "transparent";
                    if (textdraw.circOn) {
                        if (layer == WPImager.current && (UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)) {
////                            var textout_width = metrics.width;
////                            this.setContextGradientText(maskCtx2, draw, textdraw, -shiftX, y_shift - shiftY - calibratedY - fontSize / 4 - fontSize / 8, 10, fontSize, 90);
                            maskCtx2.renderFillText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, 0 /*letterspacing*/);
                        } else {
                            this.drawCircularText(maskCtx2, textdraw, true, false);
                        }
                    } else if (textdraw.shape == UI.SHAPE.CURVEDTEXT) {
                        if (layer == WPImager.current && (UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)) {
////                            this.setContextGradientText(maskCtx2, draw, textdraw, 0, y_shift - shiftY - fontSize / 2 + fontSize / 8, 10, fontSize, 90);
                            maskCtx2.renderFillText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, 0/* letterspacing */);
                        } else {
                            this.drawCurvedText(maskCtx2, textdraw, true, false);
                        }
                    } else {
                        maskCtx2.renderFillText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, letterspacing);
                    }

                    maskCtx.rotate(-deg * Math.PI / 180);
                    maskCtx.globalCompositeOperation = "destination-out";
                    // reverse any group rotation
//                        var favicon = document.getElementById('favicon');

                    maskCtx.drawImage(maskCanvas2, -(x + moveX), -(y + moveY), maskCanvas2.width, maskCanvas2.height);
                    //                  maskCtx.drawImage(favicon, 0, 0,  favicon.width, favicon.height,  -(x + moveX), -(y + moveY) ,  favicon.width, favicon.height);
                    maskCtx.rotate(deg * Math.PI / 180);
//                    maskCtx.drawImage(maskCanvas2, -(x + moveX), -(y + moveY), maskCanvas2.width, maskCanvas2.height);
//                    maskCtx.drawImage(maskCanvas2, 0, 0, maskCanvas2.width, maskCanvas2.height);
//                    maskCtx.rotate(deg * Math.PI / 180);
                    this.setContextShadow(maskCtx, draw, textdraw);
                } else if (drawColoredText) {
                    // outside loop textout
                    // draw stroke with shadow
                    if (textdraw.textoutline > 0) {
                        context.strokeStyle = textdraw.textoutlinecolor;
                        context.lineWidth = textoutline;
                        if (textdraw.circOn) {
                            if (layer == WPImager.current && (UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)) {
                                context.renderStrokeText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, 0/*letterspacing*/);
                            } else {
                                this.drawCircularText(context, textdraw, false, true);
                            }
                        } else if (textdraw.shape == UI.SHAPE.CURVEDTEXT) {
                            if (layer == WPImager.current && (UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)) {
                                context.renderStrokeText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, 0/* letterspacing */);
                            } else {
                                this.drawCurvedText(context, textdraw, false, true);
                            }
                        } else {
                            context.renderStrokeText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, letterspacing);
                        }
                    }
                    // outside loop textout
                    if (textdraw.textshadowOn) {
                        // draw fill text with shadow
                        if (textdraw.circOn) {
                            if (layer == WPImager.current && (UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)) {
                                this.setContextGradientText(context, draw, textdraw, -shiftX, y_shift - shiftY - calibratedY - fontSize / 4, 10, fontSize, 90);
                                context.renderFillText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, 0/*letterspacing*/);
                            } else {
                                this.drawCircularText(context, textdraw, true, false);
                            }
                        } else if (textdraw.shape == UI.SHAPE.CURVEDTEXT) {
                            if (layer == WPImager.current && (UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)) {
                                this.setContextGradientText(context, draw, textdraw, 0, y_shift - shiftY - fontSize / 4, 10, fontSize, 90);
                                context.renderFillText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, 0/* letterspacing */);
                            } else {
// ccccc                                
                                this.drawCurvedText(context, textdraw, true, false);
                            }
                        } else {
                            var metrics = context.measureText(textout);
                            var textout_width = metrics.width + letterspacing * textout.length;
                            if (textdraw.fontgradline) {
                                textout_width *= 2;
                                if (align == "right") {
                                    this.setContextGradientText(context, draw, textdraw, -shiftX - textout_width / 4 + letterspacing / 2, y_shift - shiftY - calibratedY - fontSize / 4, textout_width, fontSize, textdraw.fontgradrotation);
                                } else if (align == "left") {
                                    this.setContextGradientText(context, draw, textdraw, -shiftX + textout_width / 4 - letterspacing / 2, y_shift - shiftY - calibratedY - fontSize / 4, textout_width, fontSize, textdraw.fontgradrotation);
                                } else {
                                    var _oY = (valign == "top") ? -maxHeight / 2 + wrapped.textHeight / 2 : 0;
                                    _oY = (valign == "bottom") ? maxHeight / 2 - wrapped.textHeight / 2 : _oY;
                                    this.setContextGradientText(context, draw, textdraw, _oY - shiftX, y_shift - shiftY - calibratedY - fontSize / 4, textout_width, fontSize, textdraw.fontgradrotation);
                                }
                            } else {
                                // setContextGradientText already set for Whole Text (set once only) in textout loop 
                            }
                            // for last line
                            context.renderFillText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, letterspacing);
                        }
                        // shadowOn
                    }

                    // draw stroke without shadow
                    context.shadowColor = "transparent";
                    if (textdraw.textoutline > 0) {
                        context.strokeStyle = textdraw.textoutlinecolor;
                        context.lineWidth = textoutline;
                        if (layer == WPImager.current && (UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)) {

                        } else if (textdraw.circOn) {
                            this.drawCircularText(context, textdraw, false, true);
                        } else if (textdraw.shape == UI.SHAPE.CURVEDTEXT) {
                            this.drawCurvedText(context, textdraw, false, true);

                        } else {
                            context.renderStrokeText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, letterspacing);
                        }
                    }
                    if (textdraw.circOn) {
                        if (layer == WPImager.current && (UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)) {
                            this.setContextGradientText(context, draw, textdraw, 0, y_shift - shiftY - calibratedY - fontSize / 4 - fontSize / 8, 10, fontSize, 90);
                            context.renderFillText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, 0/*letterspacing*/);
                        } else {
                            this.drawCircularText(context, textdraw, true, false);
                        }
                    } else if (textdraw.shape == UI.SHAPE.CURVEDTEXT) {
                        if (layer == WPImager.current && (UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)) {
                            this.setContextGradientText(context, draw, textdraw, 0, y_shift - shiftY - fontSize / 4, 10, fontSize, 90);
                            context.renderFillText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, 0/* letterspacing */);
                        } else {
                            this.drawCurvedText(context, textdraw, true, false);
                        }
                    } else {
                        var metrics = context.measureText(textout);
                        var textout_width = metrics.width + letterspacing * textout.length;
                        if (textdraw.fontgradline) {
                            textout_width *= 2;
                            if (align == "right") {
                                this.setContextGradientText(context, draw, textdraw, -shiftX - textout_width / 4 + letterspacing / 2, y_shift - shiftY - calibratedY - fontSize / 4, textout_width, fontSize, textdraw.fontgradrotation);
                            } else if (align == "left") {
                                this.setContextGradientText(context, draw, textdraw, -shiftX + textout_width / 4 - letterspacing / 2, y_shift - shiftY - calibratedY - fontSize / 4, textout_width, fontSize, textdraw.fontgradrotation);
                            } else {
                                this.setContextGradientText(context, draw, textdraw, -shiftX, y_shift - shiftY - calibratedY - fontSize / 4, textout_width, fontSize, textdraw.fontgradrotation);
                            }
                        } else {
                            // setContextGradientText already set for Whole Text (set once only) in textout loop 
                        }
                        context.renderFillText(textout, -shiftX, y_shift - shiftY - calibratedY, fx, fy, textangle, letterspacing);
                    }
                    this.setContextShadow(context, draw, textdraw);

                }
                if (UI.input.cursorPos >= 0 && UI.input.selection[1] == UI.input.selection[0]) {
                    var cursor_insection = (UI.input.cursorPos < cursor_stop && UI.input.cursorPos > cursor_start || UI.input.cursorPos == cursor_stop || UI.input.cursorPos == 0 && cursor_start == 0 && lineNow == 0);
                    _ctx.globalCompositeOperation = "source-over";
                    var _letterspacing = (textdraw.shape == UI.SHAPE.CURVEDTEXT || textdraw.circOn) ? 0 : letterspacing;
                    this.drawCursor(_ctx, layer, x + moveX, y + moveY, textout, wrapped, align, valign, maxWidth, maxHeight,
                            lineHeight, _letterspacing, padding, y_shift + textdraw.yFine - calibratedY, textdraw.xFine, fontSize, cursor_insection, cursor_start, lineNow, mapLineNo);
                }

            }

            //new line for new section of the text
            y_shift += lineHeight;
        }

        // draw transparent text on main canvas
        if (draw && drawTransparentText) {
            context.globalAlpha = backalpha;
            context.shadowColor = "transparent";
            if (textdraw.textshadowfillOn) {
                context.shadowColor = textdraw.textshadowfillcolor;
                context.shadowOffsetX = textdraw.textshadowfillOx * (UI.comScale.active ? UI.comScale.scaleX : 1);
                context.shadowOffsetY = textdraw.textshadowfillOy * (UI.comScale.active ? UI.comScale.scaleY : 1);
                context.shadowBlur = textdraw.textshadowfill * (UI.comScale.active ? UI.comScale.scaleX : 1);
                context.fillStyle = textdraw.textshadowfillcolor;
            }
            context.rotate(-deg * Math.PI / 180); // adjust rotation temporarily to reset position
            context.drawImage(maskCanvas, -(x + moveX), -(y + moveY), maskCanvas.width, maskCanvas.height);
            context.rotate(deg * Math.PI / 180);

            maskCtx.restore();
        }
        //} else if (textdraw.shape == UI.SHAPE.CUSTOM || textdraw.shape == UI.SHAPE.LINE) {


        context.rotate(-deg * Math.PI / 180);
        context.translate((-x - moveX), (-y - moveY));
        context.restore();
        var _cursormove = UI.input.cursormove;
        var _cursorPos = -1;
        if (mapLineNo >= 0 && UI.input.cursormove !== 0) {
            if (_cursormove == UI.input.CURSORMOVE_LINEUP || _cursormove == UI.input.CURSORMOVE_LINEDOWN) {
                var lineOffset = -1;
                if (_cursormove == UI.input.CURSORMOVE_LINEDOWN)
                    lineOffset = 1;
                if (typeof UI.input.cursorLineUpDown[UI.input.cursorLine + lineOffset] !== "undefined") {
                    if (typeof UI.input.cursorLineUpDown[UI.input.cursorLine + lineOffset][UI.input.cursorChar] !== "undefined")
                        _cursorPos = UI.input.cursorLineUpDown[UI.input.cursorLine + lineOffset][UI.input.cursorChar];
                    else
                        _cursorPos = UI.input.cursorLineUpDown[UI.input.cursorLine + lineOffset][UI.input.cursorLineUpDown[UI.input.cursorLine + lineOffset].length - 1];
                    UI.input.cursormove = 0;
                    UI.input.cursorLine = UI.input.cursorLine + lineOffset;
                } else if (_cursormove == UI.input.CURSORMOVE_LINEUP) {
                    _cursorPos = UI.input.cursorLineUpDown[UI.input.cursorLine][0];
                    UI.input.cursorChar = 0;
                    UI.input.cursormove = 0;
                } else if (_cursormove == UI.input.CURSORMOVE_LINEDOWN) {
                    _cursorPos = UI.input.cursorLineUpDown[UI.input.cursorLine][UI.input.cursorLineUpDown[UI.input.cursorLine].length - 1];
                    UI.input.cursorChar = UI.input.cursorLineUpDown[UI.input.cursorLine].length - 1;
                    UI.input.cursormove = 0;
                }
            } else if (_cursormove == UI.input.CURSORMOVE_LEFT) {
                if (!UI.shift_pressed && UI.input.selection[0] != UI.input.selection[1]) {
                    _cursorPos = UI.input.selection[0];
                    UI.input.cursormove = 0;
                } else {
                    if (typeof UI.input.cursorLineUpDown[UI.input.cursorLine] !== "undefined") {
                        var nextPos = UI.input.cursorLineUpDown[UI.input.cursorLine][UI.input.cursorChar - 1];
                        if (typeof nextPos !== "undefined") {
                            _cursorPos = nextPos;
                            UI.input.cursorChar--;
                        } else if (UI.input.cursorLine - 1 > 0) {
                            // move to previous line, last character
                            _cursorPos = UI.input.cursorLineUpDown[UI.input.cursorLine - 1][UI.input.cursorLineUpDown[UI.input.cursorLine - 1].length - 1];
                            UI.input.cursorChar = UI.input.cursorLineUpDown[UI.input.cursorLine - 1].length - 1;
                            UI.input.cursorLine--;
                            UI.input.cursormove = 0;
                        } else {
                            UI.input.cursorChar = 0;
                        }
                        UI.input.cursormove = 0;
                    }
                }
            } else if (_cursormove == UI.input.CURSORMOVE_RIGHT) {
                if (!UI.shift_pressed && UI.input.selection[0] != UI.input.selection[1]) {
                    _cursorPos = UI.input.selection[1];
                    UI.input.cursormove = 0;
                } else {
                    if (typeof UI.input.cursorLineUpDown[UI.input.cursorLine] !== "undefined") {
                        var nextPos = UI.input.cursorLineUpDown[UI.input.cursorLine][UI.input.cursorChar + 1];
                        if (typeof nextPos !== "undefined") {
                            _cursorPos = nextPos;
                            UI.input.cursorChar++;
                        } else if (typeof UI.input.cursorLineUpDown[UI.input.cursorLine + 1] !== "undefined") {
                            _cursorPos = UI.input.cursorLineUpDown[UI.input.cursorLine + 1][0];
                            UI.input.cursorLine++;
                            UI.input.cursorChar = 0;
                        } else {
                            UI.input.cursorChar = UI.input.cursorLineUpDown[UI.input.cursorLine].length - 1;
                        }
                        UI.input.cursormove = 0;
                    }
                }
            } else if (_cursormove == UI.input.CURSORMOVE_LINE_HOME) {
                if (typeof UI.input.cursorLineUpDown[UI.input.cursorLine] !== "undefined")
                    if (typeof UI.input.cursorLineUpDown[UI.input.cursorLine][0] !== "undefined") {
                        _cursorPos = UI.input.cursorLineUpDown[UI.input.cursorLine][0];
                        UI.input.cursorChar = 0;
                        UI.input.cursormove = 0;
                    }
            } else if (_cursormove == UI.input.CURSORMOVE_LINE_END) {
                if (typeof UI.input.cursorLineUpDown[UI.input.cursorLine] !== "undefined")
                    if (typeof UI.input.cursorLineUpDown[UI.input.cursorLine][UI.input.cursorLineUpDown[UI.input.cursorLine].length - 1] !== "undefined") {
                        _cursorPos = UI.input.cursorLineUpDown[UI.input.cursorLine][UI.input.cursorLineUpDown[UI.input.cursorLine].length - 1];
                        UI.input.cursorChar = UI.input.cursorLineUpDown[UI.input.cursorLine].length - 1;
                        UI.input.cursormove = 0;
                    }
            }

            if (_cursorPos >= 0) {
                if (UI.shift_pressed) {
                    if (_cursorPos <= UI.input.cursorPos) {
                        $("#input").selectRange(_cursorPos, UI.input.cursorPos);
                        UI.input.selection[0] = _cursorPos;
                        UI.input.selection[1] = UI.input.cursorPos;
                    } else {
                        $("#input").selectRange(UI.input.cursorPos, _cursorPos);
                        UI.input.selection[1] = _cursorPos;
                        UI.input.selection[0] = UI.input.cursorPos;
                    }
                } else {
                    UI.input.cursorPos = _cursorPos;
                    $("#input").selectRange(UI.input.cursorPos);
                    UI.input.selection[1] = _cursorPos;
                    UI.input.selection[0] = _cursorPos;
                }
            }
        }

        return {y: y + y_shift, textWidthWidest: textWidthWidest, textHeight: y_shift};
    };


    WPImagerUI.customShape = function (ctx, x, y, width, height, textdraw, fill, stroke) {

        var isCurrentLayer = (textdraw.index == WPImager.current);
        ctx.save();
        ctx.beginPath();
        var nodes = textdraw.pathPoints.split(',');

        var ex, ey, ea = 0;
        var sx, sy, sa = 0, lx, ly;
        var cx1, cx2, cy1, cy2;
        var qx, qy;
        var _sx, _sy, _ex, _ey;
        var _cx1, _cx2, _cy1, _cy2;
        var _qx, _qy;

        var evenLineWidth = (ctx.lineWidth % 2 == 0);
        var oddLineWidth = !evenLineWidth;
        var isHorizontal = false, isVertical = false;

        if (textdraw.shape == UI.SHAPE.LINE && nodes.length == 2) {
            var pt0 = nodes[0].split(' ');
            var pt1 = nodes[nodes.length - 1].split(' ');

            if (pt0.length >= 2 && pt1.length >= 2) {
                isHorizontal = (parseInt(pt0[1]) == parseInt(pt1[1]));
                isVertical = (parseInt(pt0[0]) == parseInt(pt1[0]));
                var pt0x = parseInt(pt0[0]),
                        pt0y = parseInt(pt0[1]),
                        pt1x = parseInt(pt1[0]),
                        pt1y = parseInt(pt1[1]);
                if (oddLineWidth) {
                    if (isHorizontal) {
                        pt0y += 0.5;
                        pt1y += 0.5;
                    }
                    if (isVertical) {
                        pt0x += 0.5;
                        pt1x += 0.5;
                    }
                }
                nodes[0] = pt0x.toString() + ' ' + pt0y.toString() + ' 0';
                nodes[1] = pt1x.toString() + ' ' + pt1y.toString() + ' 0';
            }

        }

        for (var i = 0; i <= nodes.length; i++) {
            var node0, node1;
            if (i == nodes.length) {
                node1 = nodes[0].split(' ');
                node0 = nodes[nodes.length - 1].split(' ');
            } else {
                var iprev = (i - 1 < 0) ? nodes.length - 1 : i - 1;
                node1 = nodes[i].split(' ');
                node0 = nodes[iprev].split(' ');
            }


            if (UI.comScale.active) {
                for (var n = 0; n < node0.length; n++) {
                    if (n == 0 || n == 3 || n == 5) {
                        node0[n] *= UI.comScale.scaleX;
                    } else if (n == 1 || n == 4 || n == 6) {
                        node0[n] *= UI.comScale.scaleY;
                    }
                }
                for (var n = 0; n < node1.length; n++) {
                    if (n == 0 || n == 3 || n == 5) {
                        node1[n] *= UI.comScale.scaleX;
                    } else if (n == 1 || n == 4 || n == 6) {
                        node1[n] *= UI.comScale.scaleY;
                    }
                }
            }

            var x1 = UI.parseFloat(node1[0]), y1 = UI.parseFloat(node1[1]), code1 = parseInt(node1[2]), x1B = UI.parseFloat(node1[3]), y1B = UI.parseFloat(node1[4]), x1A = UI.parseFloat(node1[5]), y1A = UI.parseFloat(node1[6]);
            var x0 = UI.parseFloat(node0[0]), y0 = UI.parseFloat(node0[1]), code0 = parseInt(node0[2]), x0B = UI.parseFloat(node0[3]), y0B = UI.parseFloat(node0[4]), x0A = UI.parseFloat(node0[5]), y0A = UI.parseFloat(node0[6]);
            code1 = isNaN(code1) ? 0 : code1;
            code0 = isNaN(code0) ? 0 : code0;
            if (i == 0) {
                var node2 = nodes[1].split(' ');
                var x2 = UI.parseFloat(node2[0]), y2 = UI.parseFloat(node2[1]), code2 = parseInt(node2[2]), x2B = UI.parseFloat(node2[3]), y2B = UI.parseFloat(node2[4]), x2A = UI.parseFloat(node2[5]), y2A = UI.parseFloat(node2[6]);
                ctx.moveTo(x + x1, y + y1);
                lx = x + x1;
                ly = y + y1;
                _ex = x + x1;
                _ey = y + y1;
                if (code1 == 0 && code2 == 0) {
                    sa = 0;
                } else if (code2 > 0 && code1 > 0) {
                    sa = 1;
                    _cx1 = x + x2B;
                    _cy1 = y + y2B;
                    _cx2 = x + x1A;
                    _cy2 = y + y1A;
                } else if (code1 == 0 && code2 > 0) {
                    sa = 2;
                    _qx = x + x2B;
                    _qy = y + y2B;
                } else if (code1 > 0 && code2 == 0) {
                    sa = 2;
                    _qx = x + x1A;
                    _qy = y + y1A;
                }
            } else {
                if (i < nodes.length || i == nodes.length && textdraw.pathClosed) {
                    if (i == nodes.length && UI.console_shape == UI.CNSL.SHAPETOOLDRAW && isCurrentLayer) {
                        // don't close path
                    } else if (code1 == 0 && code0 == 0) {
                        sx = lx;
                        sy = ly;
                        // draw straight line
                        ctx.lineTo(x + x1, y + y1);
                        ex = x + x1;
                        ey = y + y1;
                        lx = ex;
                        ly = ey;
                        if (i == 1) {
                            _sx = ex;
                            _sy = ey;
                        }
                    } else if (code1 > 0 && code0 > 0) {
                        sx = lx;
                        sy = ly;
                        // draw bezier curve
                        ctx.bezierCurveTo(x + x0A, y + y0A, x + x1B, y + y1B, x + x1, y + y1);
                        ex = x + x1;
                        ey = y + y1;
                        ea = 1;
                        lx = ex;
                        ly = ey;
                        cx1 = x + x0A;
                        cy1 = y + y0A;
                        cx2 = x + x1B;
                        cy2 = y + y1B;
                        if (i == 1) {
                            _sx = ex;
                            _sy = ey;
                        }
                    } else if (code1 == 0 && code0 > 0) {
                        sx = lx;
                        sy = ly;
                        // draw quadratic curve
                        ctx.quadraticCurveTo(x + x0A, y + y0A, x + x1, y + y1);
                        ex = x + x1;
                        ey = y + y1;
                        ea = 2;
                        qx = x + x0A;
                        qy = y + y0A;
                        lx = ex;
                        ly = ey;
                        if (i == 1) {
                            _sx = ex;
                            _sy = ey;
                        }
                    } else if (code1 > 0 && code0 == 0) {
                        sx = lx;
                        sy = ly;
                        // draw quadratic curve
                        ctx.quadraticCurveTo(x + x1B, y + y1B, x + x1, y + y1);
                        ex = x + x1;
                        ey = y + y1;
                        ea = 2;
                        qx = x + x1B;
                        qy = y + y1B;
                        lx = ex;
                        ly = ey;
                        if (i == 1) {
                            _sx = ex;
                            _sy = ey;
                        }
                    }
                }
            }
        }

        if (UI.console_shape == UI.CNSL.SHAPETOOLDRAW && isCurrentLayer) {
            // don't close path
        } else if (textdraw.pathClosed) {
            ctx.closePath();
        }


        if (fill) {
            ctx.fill();
        }
        if (stroke) {
            ctx.stroke();
        }

        // draw arrow head
        var size = ctx.lineWidth;
        var endingAngle = 0;
        var startingAngle = 0;
        if (ea == 0) {
            endingAngle = -Math.atan2(ex - sx, ey - sy) + Math.PI / 2;
        } else if (ea == 1) {
            var pointAtEnd = new Bezier(sx, sy, cx1, cy1, cx2, cy2, ex, ey);
            var nv = pointAtEnd.derivative(1);
            endingAngle = Math.atan2(nv.y, nv.x);
        } else if (ea == 2) {
            endingAngle = -Math.atan2(ex - qx, ey - qy) + Math.PI / 2;
        }

        if (sa == 0) {
            startingAngle = -Math.atan2(_ex - _sx, _ey - _sy) + Math.PI / 2;
        } else if (sa == 1) {
            var pointAtEnd = new Bezier(_sx, _sy, _cx1, _cy1, _cx2, _cy2, _ex, _ey);
            var nv = pointAtEnd.derivative(1);
            startingAngle = Math.atan2(nv.y, nv.x);
        } else if (sa == 2) {
            startingAngle = -Math.atan2(_ex - _qx, _ey - _qy) + Math.PI / 2;
        }


        ctx.restore();
        // if (textdraw.linestyle.indexOf("\RIGHT") !== -1 || textdraw.linestyle.indexOf("\BOTH") !== -1) 
        {
            if (textdraw.linestyle.indexOf("\RIGHT") !== -1 || textdraw.linestyle.indexOf("\BOTH") !== -1) {
                // if (ea == 1 || ea== 2) 
                {
                    ctx.beginPath();
                    ctx.save();
                    ctx.translate(ex, ey);
                    ctx.rotate(endingAngle);
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, -size * 1.5);
                    ctx.lineTo(size * 2, 0);
                    ctx.lineTo(0, size * 1.5);
                    ctx.lineTo(0, 0);
                    ctx.closePath();
                    if (stroke) {
                        ctx.fill();
                    }
                    ctx.restore();
                }
            }
            if (textdraw.linestyle.indexOf("\LEFT") !== -1 || textdraw.linestyle.indexOf("\BOTH") !== -1) {
                // if (sa == 1 || sa== 2) 
                {
                    ctx.beginPath();
                    ctx.save();
                    ctx.translate(_ex, _ey);
                    ctx.rotate(startingAngle);
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, -size * 1.5);
                    ctx.lineTo(size * 2, 0);
                    ctx.lineTo(0, size * 1.5);
                    ctx.lineTo(0, 0);
                    ctx.closePath();
                    if (stroke) {
                        ctx.fill();
                    }
                    ctx.restore();
                }
            }
        }



    };

    WPImagerUI.setContextGradientText = function (ctx, draw, textdraw, offsetX, offsetY, _Width, _Height, fontgradrotation) {
        if (draw && textdraw.fontcoloroption == 'linear') {
            _Width = _Width / 2;
            var points = new Array();
            points = this.getGradientFromString(textdraw.fontgradient);
            var xy = this.rotateGradient(fontgradrotation /* + 90 */, _Width, _Height);
            var gradient = ctx.createLinearGradient(offsetX - _Width / 2 + xy.x1, offsetY - _Height / 2 + xy.y1, offsetX - _Width / 2 + xy.x2, offsetY - _Height / 2 + xy.y2);
            $.each(points, function (i, el) {
                if (!isNaN(parseInt(el[0]))) {
                    var color = el[1];
                    if (color.toLowerCase() == "#0000ffff")
                        color = "transparent";
                    gradient.addColorStop(Math.min(parseInt(el[0]) / 100, 1), color);
                }
            });
            ctx.fillStyle = gradient;
        }
    };
    WPImagerUI.setContextShadow = function (ctx, draw, textdraw) {
        if (draw && textdraw.textshadowOn) {
            ctx.shadowBlur = textdraw.textshadow * (UI.comScale.active ? UI.comScale.scaleX : 1);
            ctx.shadowColor = textdraw.textshadowcolor;
            ctx.shadowOffsetX = textdraw.textshadowOx * (UI.comScale.active ? UI.comScale.scaleX : 1);
            ctx.shadowOffsetY = textdraw.textshadowOy * (UI.comScale.active ? UI.comScale.scaleY : 1);
        }
    };
    WPImagerUI.setContextShadowFill = function (ctx, textdraw) {
        if (textdraw.textshadowfillOn) {
            ctx.shadowColor = textdraw.textshadowfillcolor;
            ctx.shadowOffsetX = textdraw.textshadowfillOx * (UI.comScale.active ? UI.comScale.scaleX : 1);
            ctx.shadowOffsetY = textdraw.textshadowfillOy * (UI.comScale.active ? UI.comScale.scaleY : 1);
            ctx.shadowBlur = textdraw.textshadowfill * (UI.comScale.active ? UI.comScale.scaleX : 1);
        }
    };
    WPImagerUI.getGradientFromString = function (gradient) {
        var arr = new Array(), _t = gradient.split(',');
        $.each(_t, function (i, el) {
            var position;
            if ((el.substr(el.indexOf('%') - 3, el.indexOf('%')) == '100') || (el.substr(el.indexOf('%') - 3, el.indexOf('%')) == '100%')) {
                position = '100%';
            } else if (el.indexOf('%') > 1) {
                position = parseInt(el.substr(el.indexOf('%') - 2, el.indexOf('%')));
                position += '%';
            } else {
                position = parseInt(el.substr(el.indexOf('%') - 1, el.indexOf('%')));
                position += '%';
            }
            var color = el.substr(el.indexOf('#'), 7);
            if (el.substr(el.indexOf('#'), 9).toLowerCase() == "#0000ffff")
                color = "#0000ffff";
            arr.push([position, color]);
        });
        return arr;
    };
    WPImagerUI.rotateGradient = function (rotateDegrees, width, height) {
        rotateDegrees = rotateDegrees % 360;

        // calculate breakpoint angle
        var _bpAngle = Math.atan2(height, width);
        var bpAngle = (_bpAngle * 180) / Math.PI;
        if ((0 <= rotateDegrees && rotateDegrees < bpAngle)) {
            x1 = 0;
            // y1 = height / 2 * (bpAngle - rotateDegrees) / bpAngle;
            y1 = height / 2 - 0.5 * width * Math.tan((rotateDegrees * Math.PI) / 180);
            x2 = width;
            y2 = height - y1;
        } else if ((bpAngle <= rotateDegrees && rotateDegrees < 180 - bpAngle)) {
            // x1 = width * (rotateDegrees - 45) / (135 - 45);
            x1 = width / 2 - (0.5 * height / Math.tan((rotateDegrees * Math.PI) / 180));
            y1 = 0;
            x2 = width - x1;
            y2 = height;
        } else if ((180 - bpAngle <= rotateDegrees && rotateDegrees < 180 + bpAngle)) {
            x1 = width;
            // y1 = height * (rotateDegrees - 135) / (225 - 135);
            y1 = height / 2 + 0.5 * width * Math.tan((rotateDegrees * Math.PI) / 180);
            x2 = 0;
            y2 = height - y1;
        } else if ((180 + bpAngle <= rotateDegrees && rotateDegrees < 360 - bpAngle)) {
//                x1 = width * (1 - (rotateDegrees - 225) / (315 - 225));
            x1 = width / 2 + (0.5 * height / Math.tan((rotateDegrees * Math.PI) / 180));
            y1 = height;
            x2 = width - x1;
            y2 = 0;
        } else if (360 - bpAngle <= rotateDegrees) {
            x1 = 0;
//                y1 = height - height / 2 * (rotateDegrees - 315) / (360 - 315);
            y1 = height / 2 - 0.5 * width * Math.tan((rotateDegrees * Math.PI) / 180);
            x2 = width;
            y2 = height - y1;
        }
        return {x1: x1, y1: y1, x2: x2, y2: y2};
    };

    WPImagerUI.ribbonRect = function (ctx, x, y, width, height, border, skewA, skewB, skewDir, fill, stroke)
    {
        ctx.save();

        if (fill || (stroke && ctx.lineWidth > 0)) {
            if (fill && border > 0) {
                var addSkewA = 0, addSkewB = 0;
                x -= border;
                y -= border;
                if (skewDir == 1) {
                    addSkewA = (skewA / width) * border;
                    skewA += addSkewA * 2;
                    addSkewB = (skewB / width) * border;
                    skewB += addSkewB * 2;
                } else {
                    addSkewA = (skewA / height) * border;
                    skewA += addSkewA * 2;
                    addSkewB = (skewB / height) * border;
                    skewB += addSkewB * 2;
                }
                width += border * 2;
                height += border * 2;
            }
            ctx.beginPath();

            var halfHeight = parseInt(height / 2);
            var halfWidth = parseInt(width / 2);
            if (skewDir == 1) {
                skewA = (skewA > halfHeight ? halfHeight : skewA);
                skewA = (skewA < -halfHeight ? -halfHeight : skewA);
                skewB = (skewB > halfHeight ? halfHeight : skewB);
                skewB = (skewB < -halfHeight ? -halfHeight : skewB);
                // vertical skew
                if (skewA >= 0 && skewB >= 0) {
                    // draw top and top right corner
                    ctx.moveTo(x, y + skewA);
                    ctx.lineTo(x + halfWidth, y);
                    ctx.lineTo(x + width, y + skewA);
                    ctx.lineTo(x + width, y + height - skewB);
                    ctx.lineTo(x + halfWidth, y + height);
                    ctx.lineTo(x, y + height - skewB);
                } else if (skewA >= 0 && skewB <= 0) {
                    ctx.moveTo(x, y + skewA);
                    ctx.lineTo(x + halfWidth, y);
                    ctx.lineTo(x + width, y + skewA);
                    ctx.lineTo(x + width, y + height);
                    ctx.lineTo(x + halfWidth, y + height + skewB);
                    ctx.lineTo(x, y + height);
                } else if (skewA <= 0 && skewB >= 0) {
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + halfWidth, y - skewA);
                    ctx.lineTo(x + width, y);
                    ctx.lineTo(x + width, y + height - skewB);
                    ctx.lineTo(x + halfWidth, y + height);
                    ctx.lineTo(x, y + height - skewB);
                } else if (skewA <= 0 && skewB <= 0) {
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + halfWidth, y - skewA);
                    ctx.lineTo(x + width, y);
                    ctx.lineTo(x + width, y + height);
                    ctx.lineTo(x + halfWidth, y + height + skewB);
                    ctx.lineTo(x, y + height);
                }
            } else {
                skewA = (skewA > halfWidth ? halfWidth : skewA);
                skewA = (skewA < -halfWidth ? -halfWidth : skewA);
                skewB = (skewB > halfWidth ? halfWidth : skewB);
                skewB = (skewB < -halfWidth ? -halfWidth : skewB);
                // horizontal skew
                if (skewA >= 0 && skewB >= 0) {
                    ctx.moveTo(x + skewA, y);
                    ctx.lineTo(x + width - skewB, y);
                    ctx.lineTo(x + width, y + halfHeight);
                    ctx.lineTo(x + width - skewB, y + height);
                    ctx.lineTo(x + skewA, y + height);
                    ctx.lineTo(x, y + halfHeight);
                } else if (skewA >= 0 && skewB <= 0) {
                    ctx.moveTo(x + skewA, y);
                    ctx.lineTo(x + width, y);
                    ctx.lineTo(x + width + skewB, y + halfHeight);
                    ctx.lineTo(x + width, y + height);
                    ctx.lineTo(x + skewA, y + height);
                    ctx.lineTo(x, y + halfHeight);
                } else if (skewA <= 0 && skewB >= 0) {
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + width - skewB, y);
                    ctx.lineTo(x + width, y + halfHeight);
                    ctx.lineTo(x + width - skewB, y + height);
                    ctx.lineTo(x, y + height);
                    ctx.lineTo(x - skewA, y + halfHeight);
                } else if (skewA <= 0 && skewB <= 0) {
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + width, y);
                    ctx.lineTo(x + width + skewB, y + halfHeight);
                    ctx.lineTo(x + width, y + height);
                    ctx.lineTo(x, y + height);
                    ctx.lineTo(x - skewA, y + halfHeight);
                }
            }
            ctx.closePath();
            if (fill) {
                ctx.fill();
            }
            if (stroke) {
                ctx.stroke();
            }
        }

        ctx.restore();	// restore context to what it was on entry
    };

    WPImagerUI.placeCursor = function (context, x, y, layer, lineNow, cursor_start, textout, maxWidth, maxHeight, lineHeight, letterspacing, padding, valign, align, wrapped, y_shift, fontSize) {
        if ((UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN) && layer == WPImager.current)
        {
            var adjY = maxHeight / 2 - lineHeight - padding;  // default for top
            if (valign == "middle") {
                adjY = wrapped.textHeight / 2 - lineHeight;
            } else if (valign == "bottom") {
                adjY = padding - maxHeight / 2 + wrapped.textHeight - lineHeight;
            }
            if (y - maxHeight / 2 < y_shift - adjY) {
                // now we get consider the x position
                var adjX = maxWidth / 2 - (context.measureText(textout).width + textout.length * letterspacing) / 2;  // default for center                   
                if (align === "left") {
                    adjX = padding;
                } else if (align === "right") {
                    adjX = maxWidth - padding - context.measureText(textout).width - textout.length * letterspacing;
                }
                var posOffset = (lineNow > 0) ? 1 : 0; // correct first line offset
                var xPos = textout.length + posOffset;
                var cursorOffset = 0;
                for (var i = 0; i <= textout.length; i++) {
                    var charWidth = context.measureText(textout[i]).width + letterspacing;
                    cursorOffset += charWidth;
                    // shift x by half character width
                    if (x + charWidth / 2 < cursorOffset + adjX) {
                        xPos = i + posOffset;
                        break;
                    }
                }

                if (UI.input.cursorPos == -1) {
                    // place cursor on this line
                    UI.input.cursorPos = cursor_start + xPos;
                    $("#input").selectRange(UI.input.cursorPos);
                } else {
                    // UI.input.cursorPos == -2, do not update #input selection
                    UI.input.cursorPos = cursor_start + xPos;
                }
                var input = document.getElementById('input');
                UI.input.selection = [input.selectionStart, input.selectionEnd];
            }

        }
    };

    WPImagerUI.highlightText = function (context, layer, lineNow, textout, wrapped, align, valign, maxWidth, maxHeight,
            lineHeight, letterspacing, padding, y_shift, fontSize, cursor_insection, cursor_start, selStart, selStop) {
        // draw cursor
        if ((UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)
                && cursor_insection && layer == WPImager.current)
        {
            var posOffset = (lineNow > 0) ? 1 : 0;
            var cursorOffset = context.measureText(textout.substring(0, selStart - cursor_start - posOffset)).width + (selStart - cursor_start - posOffset) * letterspacing - 0.5 * letterspacing;
            var adjX = -context.measureText(textout).width / 2;  // default for center                   
            if (align === "left") {
                adjX = -maxWidth / 2 + padding;
            } else if (align === "right") {
                adjX = maxWidth / 2 - padding;
                cursorOffset = -context.measureText(textout.substring(selStart - cursor_start - posOffset)).width - (textout.length - (selStart - cursor_start - posOffset)) * letterspacing + 0.5 * letterspacing;
            } else {
                adjX = -maxWidth / 2;
                adjX += (maxWidth - context.measureText(textout).width - textout.length * letterspacing) / 2;
                cursorOffset = context.measureText(textout.substring(0, selStart - cursor_start - posOffset)).width + (selStart - cursor_start - posOffset) * letterspacing - 0.5 * letterspacing;
            }

            var adjY = maxHeight / 2 - lineHeight - padding;  // default for top
            if (valign == "middle") {
                adjY = wrapped.textHeight / 2 - lineHeight;
            } else if (valign == "bottom") {
                adjY = padding - maxHeight / 2 + wrapped.textHeight - lineHeight;
            }

            var selectWidth = context.measureText(textout.substring(selStart - cursor_start - posOffset, selStop - cursor_start - posOffset)).width + (selStop - selStart) * letterspacing;


            var alpha = context.globalAlpha;
            var fillStyle = context.fillStyle;
            context.fillStyle = 'rgba(179, 212, 253, 0.8)';
            context.globalAlpha = 1;
            context.fillRect(cursorOffset + adjX, y_shift - adjY - lineHeight + 1, selectWidth, lineHeight - 2);
            context.globalAlpha = alpha;
            context.fillStyle = fillStyle;

        }
    };
    WPImagerUI.drawCursor = function (context, layer, moveX, moveY, textout, wrapped, align, valign, maxWidth, maxHeight,
            lineHeight, letterspacing, padding, y_shift, xFine, fontSize, cursor_insection, cursor_start, lineNow, mapLineNo) {
        // draw cursor
        if ((UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN)
                && layer == WPImager.current)
        {
            var posOffset = (lineNow > 0) ? 1 : 0;
            var cursorOffset = context.measureText(textout.substring(0, UI.input.cursorPos - cursor_start - posOffset)).width + (UI.input.cursorPos - cursor_start - posOffset) * letterspacing - 0.5 * letterspacing;
            var adjX = -context.measureText(textout).width / 2;  // default for center                   
            if (align === "left") {
                adjX = -maxWidth / 2 + padding;
            } else if (align === "right") {
                adjX = maxWidth / 2 - padding;
                cursorOffset = -context.measureText(textout.substring(UI.input.cursorPos - cursor_start - posOffset)).width - (textout.length - (UI.input.cursorPos - cursor_start - posOffset)) * letterspacing + 0.5 * letterspacing;
            } else {
                adjX = -maxWidth / 2;
                adjX += (maxWidth - context.measureText(textout).width - textout.length * letterspacing) / 2;
                cursorOffset = context.measureText(textout.substring(0, UI.input.cursorPos - cursor_start - posOffset)).width + (UI.input.cursorPos - cursor_start - posOffset) * letterspacing - 0.5 * letterspacing;
            }
            var calibratedY = 0;
            adjX += xFine - calibratedY;

            var adjY = maxHeight / 2 - lineHeight - padding;  // default for top
            if (valign == "middle") {
                adjY = wrapped.textHeight / 2 - lineHeight;
            } else if (valign == "bottom") {
                adjY = padding - maxHeight / 2 + wrapped.textHeight - lineHeight;
            }

            if (cursor_insection) {
                if (mapLineNo > 0 && UI.input.selection[0] == UI.input.selection[1]) {
                    UI.input.cursorChar = UI.input.cursorPos - cursor_start - posOffset;
                    UI.input.cursorLine = mapLineNo;
                }
                var xOffset = cursorOffset + adjX;
                var yOffset = y_shift - adjY - lineHeight + 1;

                if (UI.blink.yOffset != moveY + yOffset) {
                    var input_top = parseInt($("#cvswrap").css("margin-top")) + moveY + yOffset - $("#cvswrap").scrollTop();
                    $("#input").css("top", input_top.toString() + "px");
                    $("#input").width(maxWidth);
                }

                UI.blink.xOffset = moveX + xOffset;
                UI.blink.yOffset = moveY + yOffset;
                UI.blink.height = lineHeight - 1;
                if (UI.input.cursor) {
                    var alpha = context.globalAlpha;
                    var fillStyle = context.fillStyle;
                    context.globalAlpha = 1;
                    context.fillStyle = "#ffffff";
                    context.shadowBlur = 1;
                    context.shadowColor = "#000000";
                    context.fillRect(xOffset, yOffset, 1, UI.blink.height);
                    context.globalAlpha = alpha;
                    context.fillStyle = fillStyle;
                    context.shadowColor = "transparent";
                }
            }



            if (mapLineNo > 0) {
                // refresh record of cursor positions for current line
                var lineLength = textout.length;
                UI.input.cursorLineUpDown[mapLineNo] = new Array(lineLength);
                for (var i = 0; i <= lineLength; i++) {
                    UI.input.cursorLineUpDown[mapLineNo][i] = cursor_start + i + posOffset;
                }
            }
        }
    };

    WPImagerUI.drawCircularText = function (ctx, textdraw, fill, stroke) {
        var outChar;
        var outRad = [];
        var outRadSum = 0;
        var previous = 0;
        var fontSize = textdraw.fontsize;
        var fontFamily = textdraw.fontfamily;
        var color = textdraw.fontcolor;
        var radius = (textdraw.width < textdraw.height) ? textdraw.width / 2 : textdraw.height / 2;
        var centerX = textdraw.xFine;
        var centerY = textdraw.yFine;
        var angle = textdraw.circangle;
        var wordspace = textdraw.fontsize / 4 + textdraw.textspacing;
        var _content = textdraw.content;
        var inout = (textdraw.circio == 1) ? 1 : -1;

        radius += textdraw.circradadj;

        var fontWeight = textdraw.fontweight.toString();
        var font = (textdraw.italic ? "italic " : "") + fontWeight + " " + fontSize + "px " + fontFamily.toString().replace(/\+/g, ' ').trim();

        ctx.font = font;
        ctx.textAlign = 'center'; // letter must rotate from its center
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = color;

        angle = angle * Math.PI / 180;
        var _radius = radius - fontSize * 0.75;
        var wordSpaceRadians = getRadians(wordspace, _radius);
        var len = _content.length;
        for (var n = 0; n < len; n++) {
            outChar = _content[n];
            var _charWidth = this.charWidth(outChar, font, fontSize);

            outRad[n] = getRadians(_charWidth + textdraw.textspacing, _radius);
            if (outChar == ' ') {
                outRadSum += wordSpaceRadians;
            } else {
                outRadSum += outRad[n];
            }
        }

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle / 2 - inout * outRadSum / 2);

        for (var n = 0; n < len; n++) {
            outChar = _content[n];
            ctx.rotate(inout * outRad[n] / 2);
            ctx.rotate(inout * previous / 2);
            previous = outRad[n];
            if (outChar == ' ') {
                ctx.rotate(inout * wordSpaceRadians); // space between words
            }
            ctx.save();
            ctx.translate(0, -inout * radius);

            var calibratedY = (inout == 1) ? -textdraw.fontsize * 0.75 : textdraw.fontsize * 0.25;

            if (fill) {
                // var lineHeight = parseInt(fontSize * textdraw.lineheight);
                var lineHeight = fontSize;
//                this.setContextGradientText(ctx, true, textdraw, 0, 0 - calibratedY, wordspace, lineHeight, 90);
                this.setContextGradientText(ctx, true, textdraw, 0, -lineHeight / 4 - calibratedY, 10, lineHeight, 90);

                ctx.fillText(outChar, 0, 0 - calibratedY);
            }
            if (stroke) {
                ctx.strokeText(outChar, 0, 0 - calibratedY);
            }
            ctx.restore();
//            ctx.rotate(inout * space);  // space between characters
        }
        ctx.restore();

        function getRadians(len, r) {
            return  2 * Math.atan((len / 2) / r);
        }

    };

    WPImagerUI.drawCurvedText = function (ctx, textdraw, fill, stroke) {

        var _content = textdraw.content;
        var _points = textdraw.pathPoints.split(',');

        if (_points.length !== 2) {
            return;
        }


        var fontSize = textdraw.fontsize;
        var endingFontSize = textdraw.fontsize + textdraw.textgrow;
        var width = textdraw.width, height = textdraw.height;
        var offsetX = textdraw.xFine, offsetY = textdraw.yFine;
        var textspacing = textdraw.textspacing;
        var letterSpacing = ctx.measureText(" ").width / 4 + textspacing;
        var offsetAngle = textdraw.textangle * Math.PI / 180;

        var startPoint = _points[0].split(' ');
        var endPoint = _points[1].split(' ');
        if (startPoint.length !== 7 || endPoint.length !== 7) {
            return;
        }

        var ctxfont = ctx.font;

        ctx.textBaseline = 'alphabetic';

        var CurveData = {
            startX: UI.parseFloat(startPoint[0]), startY: UI.parseFloat(startPoint[1]),
            control1X: UI.parseFloat(startPoint[5]), control1Y: UI.parseFloat(startPoint[6]),
            control2X: UI.parseFloat(endPoint[3]), control2Y: UI.parseFloat(endPoint[4]),
            endX: UI.parseFloat(endPoint[0]), endY: UI.parseFloat(endPoint[1])
        };

        var calibratedY = -textdraw.fontsize * 0.25;
        var totalLength = Math.round(ctx.measureText(_content).width) + (_content.length - 1) * letterSpacing;
        var tLength = 0;
        for (var i = 0; i < _content.length; i++)
        {
            var incrementFontSize = (endingFontSize - fontSize) * (i / (_content.length - 1));
//            ctx.font = ctxfont.replace(/\d+px/, (parseInt(ctxfont.match(/\d+px/)) + incrementFontSize) + "px");
//                textdraw.fontgradline = false;
            if (textdraw.growdir == 2) {
                var midLen = Math.ceil(_content.length / 2);
                var iLetter = i;
                if (iLetter < midLen) {
                    incrementFontSize = (endingFontSize - fontSize) * (iLetter / (midLen - 1));
                } else {
                    if (_content.length % 2 == 0) {
                        incrementFontSize = (endingFontSize - fontSize) * ((_content.length - 1 - iLetter) / (_content.length - 1 - midLen));
                    } else {
                        incrementFontSize = (endingFontSize - fontSize) * ((_content.length - 1 - iLetter) / (_content.length - 1 - midLen + 1));
                    }
                }
                /// textdraw.fontgradline = true;
                // textdraw.fontgradrotation = 90;
            }
            if ((parseInt(ctxfont.match(/\d+px/)) + incrementFontSize) < 0) {
                incrementFontSize = -parseInt(ctxfont.match(/\d+px/)) + 1
            }
            ctx.font = ctxfont.replace(/\d+px/, (parseInt(ctxfont.match(/\d+px/)) + incrementFontSize) + "px");
            tLength += (ctx.measureText(_content[i]).width) + ctx.measureText(" ").width / 4 + textspacing * ((fontSize + incrementFontSize) / endingFontSize);
        }
        // start drawing
        ctx.rotate(offsetAngle);
        ctx.translate(offsetX, offsetY - calibratedY);
        ctx.translate(-width / 2, -height / 2);

        var curve = new Bezier(CurveData.startX, CurveData.startY, CurveData.control1X, CurveData.control1Y, CurveData.control2X, CurveData.control2Y, CurveData.endX, CurveData.endY);
        var startCharDist = (curve.length() - tLength) / 2;


        var pt_dist = 0, pt_last, pt_now;
        var curvature = [];
        for (var t = 0; t <= 1; t += 0.001) {
            var nv = curve.derivative(t);
            pt_now = curve.get(t);
            if (t == 0) {
                pt_last = pt_now;
            } else {
                pt_dist += Math.sqrt(((pt_now.x - pt_last.x) * (pt_now.x - pt_last.x)) + ((pt_now.y - pt_last.y) * (pt_now.y - pt_last.y)));
                pt_last = pt_now;
            }
            var angleRadians = Math.atan2(nv.y, nv.x);
            curvature.push({x: pt_now.x, y: pt_now.y, outRad: angleRadians, dist: pt_dist});
        }

        var pt_startChar = 0;
        for (i = 0; i < 1000; i++)
        {
            if (curvature[i].dist >= startCharDist)
            {
                pt_startChar = i;
                break;
            }
        }
        for (var i = 0; i < _content.length; i++)
        {
            var growAngle = ((textdraw.textangle2 - textdraw.textangle1) * (Math.PI / 180)) * (i / (_content.length - 1));
            var startAngle = textdraw.textangle1 * (Math.PI / 180);
            var outRad = textdraw.textupright ? 0 : curvature[pt_startChar].outRad;
            ctx.save();
            ctx.textAlign = "start";
            ctx.translate(curvature[pt_startChar].x, curvature[pt_startChar].y);
            ctx.rotate(outRad + startAngle + growAngle);
            var incrementFontSize = (endingFontSize - fontSize) * (i / (_content.length - 1));
            if (textdraw.growdir == 2) {
                var midLen = Math.ceil(_content.length / 2);
                var iLetter = i;
                if (iLetter < midLen) {
                    incrementFontSize = (endingFontSize - fontSize) * (iLetter / (midLen - 1));
                } else {
                    if (_content.length % 2 == 0) {
                        incrementFontSize = (endingFontSize - fontSize) * ((_content.length - 1 - iLetter) / (_content.length - 1 - midLen));
                    } else {
                        incrementFontSize = (endingFontSize - fontSize) * ((_content.length - 1 - iLetter) / (_content.length - 1 - midLen + 1));
                    }
                }
            } else if (textdraw.growdir == 1) {
                incrementFontSize = (endingFontSize - fontSize) * ((_content.length - 1 - i) / (_content.length - 1));
            }
            if ((parseInt(ctxfont.match(/\d+px/)) + incrementFontSize) < 0) {
                incrementFontSize = -parseInt(ctxfont.match(/\d+px/)) + 1
            }
            ctx.font = ctxfont.replace(/\d+px/, (parseInt(ctxfont.match(/\d+px/)) + incrementFontSize) + "px");

            if (fill) {
                var lineHeight = fontSize + incrementFontSize;
                var offsetY = 0;//(fontSize + incrementFontSize) * 0.25;
                this.setContextGradientText(ctx, true, textdraw, 0, -lineHeight / 4, 10, lineHeight, 90);
                ctx.fillText(_content[i], 0, 0);
            }
            if (stroke) {
                ctx.strokeText(_content[i], 0, 0);
            }
            var nextCharDist = curvature[pt_startChar].dist + ctx.measureText(_content[i]).width + ctx.measureText(" ").width / 4 + textspacing * ((fontSize + incrementFontSize) / endingFontSize); // letterSpacing;
            ctx.restore();

            for (var p = pt_startChar; p < 1000; p++)
            {
                if (curvature[p].dist >= nextCharDist)
                {
                    pt_startChar = p;
                    break;
                }
            }
        }
        ctx.translate(width / 2, height / 2);
        ctx.translate(-offsetX, -(offsetY - calibratedY));
        ctx.rotate(-offsetAngle);
        ctx.font = ctxfont;
    };

    WPImagerUI.charWidth = function (outChar, font, fontSize) {
        var cvsMeasure = document.getElementById("canvas_measuretext");
        var height = parseInt(fontSize * 2);
        var width = parseInt(fontSize * 2);
        cvsMeasure.setAttribute("height", height);
        cvsMeasure.setAttribute("width", width);
        var ctx = cvsMeasure.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        ctx.textAlign = "start";
        ctx.textBaseline = 'top';  // must be top
        ctx.fillStyle = 'white';
        ctx.font = font;
        ctx.fillText(outChar, 0, 0);
        var pixel = ctx.getImageData(0, 0, width, height).data;
        var leftPixel = -1;
        var rightPixel = -1;

        startTest:
                for (var col = 0; col < width; col++) {
            for (var row = 0; row < height; row++) {
                var index = (row * width + col) * 4;
                if (pixel[index] == 0 && pixel[index + 1] == 0 && pixel[index + 2] == 0) {
                    if (row == height - 1 && leftPixel != -1) {
                        rightPixel = col;
                        break startTest;
                    }
                    continue;
                } else {
                    if (leftPixel == -1) {
                        leftPixel = col;
                    }
                    break;
                }
            }
        }
        return rightPixel - leftPixel;
    };



})(jQuery);