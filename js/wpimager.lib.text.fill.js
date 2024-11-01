/*!
 WPImager 1.0.0    
 Text Fill Background
 https://wpimager.com/
 2018 WPImager  
 */

/**
 * Text Fill Background
 * Contains methods to draw text layer container background on canvas
 */


(function ($) {

    WPImagerUI.drawTextTransparentBackground = function (BGCtx, layer, textdraw, maxWidth, maxHeight) {

        var textradius = (textdraw.shape == UI.SHAPE.CIRCLE) ? textdraw.width / 2 + 1 : textdraw.textradius;
        var textborder = (textdraw.shape == UI.SHAPE.LINE) ? textdraw.textborder / 2 : textdraw.textborder;
        var bordergap = textdraw.bordergap;
        var bordergapcolor = textdraw.bordergapcolor;
//        var textalpha = textdraw.alpha;
        var skewA = textdraw.skewA;
        var skewB = textdraw.skewB;
        var skewP = textdraw.skewP;
        var skewDir = textdraw.skewDir;
        var polyradius = textdraw.radius;
        var backalpha = textdraw.alpha;
        backalpha = (backalpha > 0 && backalpha < 100) ? backalpha / 100 : 1;

        if (UI.comScale.active) {
            textborder *= UI.comScale.scaleX;
            bordergap *= UI.comScale.scaleX;
            textradius = (textdraw.shape == UI.SHAPE.CIRCLE) ? (textdraw.width * UI.comScale.scaleX) / 2 + 1 : textdraw.textradius * UI.comScale.scaleX;
            skewA *= (skewDir == 0 ? UI.comScale.scaleX : UI.comScale.scaleY);
            skewB *= (skewDir == 0 ? UI.comScale.scaleX : UI.comScale.scaleY);
            skewP *= (skewDir == 0 ? UI.comScale.scaleX : UI.comScale.scaleY);
            // polyradius *= UI.comScale.scaleX;
            maxWidth *= UI.comScale.scaleX;
            maxHeight *= UI.comScale.scaleY;
        }

        // ** draw border
        if (textdraw.textborder > 0) {
            BGCtx.lineWidth = textborder * 2;
            BGCtx.strokeStyle = textdraw.textbordercolor;
            BGCtx.fillStyle = textdraw.textbordercolor;
            BGCtx.setLineDash([]);
            if (textdraw.textborderdash.substring(0, 1) == "1") {
                var borderdash = textdraw.textborderdash.split(" ");
                if (borderdash.length == 4) {
                    var scaleDash = (UI.comScale.active ? (UI.comScale.scaleX + UI.comScale.scaleY) / 2 : 1);
                    var dash1 = parseInt(borderdash[1]) * scaleDash;
                    var dash2 = parseInt(borderdash[2]) * scaleDash;
                    var dashOffset = parseInt(borderdash[3]) * scaleDash;
                    BGCtx.setLineDash([dash1, dash2]);
                    BGCtx.lineDashOffset = dashOffset;
                }
            }
            // include border gap, cut out gap later
            BGCtx.lineWidth = textborder * 2 + bordergap * 2;
            if (UI.comScale.active && textdraw.shape == UI.SHAPE.CIRCLE) {
                this.ellipseRect(BGCtx, 0, 0, maxWidth, maxHeight, false, true);
            } else if (textdraw.shape == UI.SHAPE.TRAPEZOID) {
                this.skewedRect(BGCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textborder, skewA, skewB, skewDir, false, true);
            } else if (textdraw.shape == UI.SHAPE.RIBBON) {
                this.ribbonRect(BGCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textborder, skewA, skewB, skewDir, false, true);
            } else if (textdraw.shape == UI.SHAPE.PARALLELOGRAM) {
                this.skewedRect(BGCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textborder, skewP, -skewP, skewDir, false, true);
            } else if (textdraw.shape == UI.SHAPE.POLYGON) {
                this.roundedPolygonStroke(BGCtx, polyradius, textdraw.polysides, textradius, textdraw.polyspokeratio, textdraw.polyspoke);
            } else if (textdraw.shape == UI.SHAPE.CURVEDTEXT) {
                // no shape
            } else if (textdraw.shape == UI.SHAPE.CUSTOM || textdraw.shape == UI.SHAPE.LINE) {
                BGCtx.lineWidth = textborder;
                this.customShape(BGCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textdraw, false, true);
                BGCtx.lineWidth = textborder * 2;
            } else if (textdraw.shape == UI.SHAPE.ELLIPSE) {
                this.ellipseRect(BGCtx, 0, 0, maxWidth, maxHeight, false, true);
            } else {
                this.roundedRect(BGCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textradius, false, true);
            }

            // gap colored (drawTextTransparentBackground)
            if (bordergap > 0 && bordergapcolor.toLowerCase() !== "#0000ffff") {
                BGCtx.setLineDash([]);
                if (textdraw.textborderdash.substring(0, 1) == "2") {
                    var borderdash = textdraw.textborderdash.split(" ");
                    if (borderdash.length == 4) {
                        var scaleDash = (UI.comScale.active ? (UI.comScale.scaleX + UI.comScale.scaleY) / 2 : 1);
                        var dash1 = parseInt(borderdash[1]) * scaleDash;
                        var dash2 = parseInt(borderdash[2]) * scaleDash;
                        var dashOffset = parseInt(borderdash[3]) * scaleDash;
                        BGCtx.setLineDash([dash1, dash2]);
                        BGCtx.lineDashOffset = dashOffset;
                    }
                }
                
                BGCtx.lineWidth = bordergap * 2;
                BGCtx.strokeStyle = bordergapcolor;
                BGCtx.shadowColor = "transparent";

                if (textdraw.shape == UI.SHAPE.TRAPEZOID) {
                    this.skewedRect(BGCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textborder, skewA, skewB, skewDir, false, true);
                } else if (textdraw.shape == UI.SHAPE.PARALLELOGRAM) {
                    this.skewedRect(BGCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textborder, skewP, -skewP, skewDir, false, true);
                } else if (textdraw.shape == UI.SHAPE.RIBBON) {
                    this.ribbonRect(BGCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textborder, skewA, skewB, skewDir, false, true);
                } else if (textdraw.shape == UI.SHAPE.POLYGON) {
                    this.roundedPolygonStroke(BGCtx, polyradius, textdraw.polysides, textradius, textdraw.polyspokeratio, textdraw.polyspoke);
                } else if (textdraw.shape == UI.SHAPE.CURVEDTEXT) {
                    // skip
                } else if (textdraw.shape == UI.SHAPE.CUSTOM || textdraw.shape == UI.SHAPE.LINE) {
                    // skip
                } else if (textdraw.shape == UI.SHAPE.ELLIPSE) {
                    this.ellipseRect(BGCtx, 0, 0, maxWidth, maxHeight, false, true);
                } else {
                    this.roundedRect(BGCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textradius, false, true);
                }
            }

        } else {
            if (((WPImager.current == layer && textdraw.shape == UI.SHAPE.CURVEDTEXT /* && textdraw.shape == UI.SHAPE.CURVEDTEXT */ && UI.console_shape == UI.CNSL.SHAPETOOLEDIT)
                    || textdraw.shape == UI.SHAPE.CUSTOM) && textdraw.textborder == 0) {
                if ((textdraw.backcoloroption == "color" && textdraw.backcolor.length != 7) ||
                        (textdraw.backcoloroption == "radial" && textdraw.backgradient.length == 0) ||
                        (textdraw.backcoloroption == "linear" && textdraw.backgradient.length == 0)) {
                    BGCtx.lineWidth = 1;
                    BGCtx.strokeStyle = "#555555";
                    BGCtx.setLineDash([5, 5]);
                    this.customShape(BGCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textdraw, false, true);
                }
            }
        }

        // ** fill background
        this.drawFillBackground(BGCtx, textdraw, maxWidth, maxHeight);

        // redraw border for curve line / custom shape 
        if (/*(textdraw.shape == UI.SHAPE.CURVEDTEXT || */ textdraw.shape == UI.SHAPE.CUSTOM && textdraw.textborder > 0) {
            BGCtx.globalAlpha = backalpha;
            BGCtx.lineWidth = textborder; // * 2;
            BGCtx.strokeStyle = textdraw.textbordercolor;
            BGCtx.fillStyle = textdraw.textbordercolor;
            BGCtx.setLineDash([]);
            if (textdraw.textborderdash.substring(0, 1) == "1") {
                var borderdash = textdraw.textborderdash.split(" ");
                if (borderdash.length == 4) {
                    var scaleDash = (UI.comScale.active ? (UI.comScale.scaleX + UI.comScale.scaleY) / 2 : 1);
                    var dash1 = parseInt(borderdash[1]) * scaleDash;
                    var dash2 = parseInt(borderdash[2]) * scaleDash;
                    var dashOffset = parseInt(borderdash[3]) * scaleDash;
                    BGCtx.setLineDash([dash1, dash2]);
                    BGCtx.lineDashOffset = dashOffset;
                }
            }
            BGCtx.shadowColor = "transparent";
            this.customShape(BGCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textdraw, false, true);
            BGCtx.lineWidth = textborder * 2;  // reset linewidth
        }

    };

    WPImagerUI.drawTextColoredBackground = function (context, layer, textdraw, maxWidth, maxHeight) {

        var textradius = (textdraw.shape == UI.SHAPE.CIRCLE) ? textdraw.width / 2 + 1 : textdraw.textradius;
        var textborder = (textdraw.shape == UI.SHAPE.LINE) ? textdraw.textborder / 2 : textdraw.textborder;
        var bordergap = textdraw.bordergap;
        var bordergapcolor = textdraw.bordergapcolor;
        var textalpha = textdraw.alpha;
        var skewA = textdraw.skewA;
        var skewB = textdraw.skewB;
        var skewP = textdraw.skewP;
        var skewDir = textdraw.skewDir;
        var polyradius = textdraw.radius;
        var backalpha = textdraw.alpha;
        backalpha = (backalpha > 0 && backalpha < 100) ? backalpha / 100 : 1;

        textalpha = (textalpha > 0 && textalpha < 100) ? textalpha / 100 : 1;

        var backalpha = 1;

        if (UI.comScale.active) {
            textborder *= UI.comScale.scaleX;
            bordergap *= UI.comScale.scaleX;
//            textradius = (textdraw.shape == UI.SHAPE.CIRCLE) ? (textdraw.width * UI.comScale.scaleX) / 2 + 1 : textdraw.textradius * UI.comScale.scaleX;
            skewA *= (skewDir == 0 ? UI.comScale.scaleX : UI.comScale.scaleY);
            skewB *= (skewDir == 0 ? UI.comScale.scaleX : UI.comScale.scaleY);
            skewP *= (skewDir == 0 ? UI.comScale.scaleX : UI.comScale.scaleY);
            maxWidth *= UI.comScale.scaleX;
            maxHeight *= UI.comScale.scaleY;
        }

        // draw fill shadow
        if (textborder > 0) {
            if (textdraw.textshadowfillOn) {
                context.shadowColor = textdraw.textshadowfillcolor;
                context.shadowOffsetX = textdraw.textshadowfillOx * (UI.comScale.active ? UI.comScale.scaleX : 1);
                context.shadowOffsetY = textdraw.textshadowfillOy * (UI.comScale.active ? UI.comScale.scaleY : 1);
                context.shadowBlur = textdraw.textshadowfill * (UI.comScale.active ? UI.comScale.scaleX : 1);
                context.fillStyle = textdraw.textshadowfillcolor;
                var _textborder = textborder;
                if (textdraw.textborderdash.substring(0, 1) == "1") {
                    _textborder = 0;  // exclude shadow for dashed border
                }

                // draw shadow
                if (UI.comScale.active && textdraw.shape == UI.SHAPE.CIRCLE) {
                    this.ellipseRect(context, 0, 0, (maxWidth + _textborder * 2), (maxHeight + _textborder * 2), true, false);
                } else if (textdraw.shape == UI.SHAPE.TRAPEZOID) {
                    this.skewedRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, 0, skewA, skewB, skewDir, true, false);
                } else if (textdraw.shape == UI.SHAPE.RIBBON) {
                    this.ribbonRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, 0, skewA, skewB, skewDir, true, false);
                } else if (textdraw.shape == UI.SHAPE.PARALLELOGRAM) {
                    this.skewedRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, 0, skewP, -skewP, skewDir, true, false);
                } else if (textdraw.shape == UI.SHAPE.POLYGON) {
                    this.roundedPolygonFill(context, polyradius, textdraw.polysides, textradius, textdraw.polyspokeratio, textdraw.polyspoke);
                } else if (textdraw.shape == UI.SHAPE.CURVEDTEXT || textdraw.shape == UI.SHAPE.CUSTOM || this.shape == UI.SHAPE.LINE) {
                    // skip
                } else if (textdraw.shape == UI.SHAPE.ELLIPSE) {
                    this.ellipseRect(context, 0, 0, (maxWidth + _textborder * 2), (maxHeight + _textborder * 2), true, false);
                } else if (textdraw.backcolor.length == 7) {
                    this.roundedRect(context, (-maxWidth / 2 - _textborder), (-maxHeight / 2 - _textborder), (maxWidth + _textborder * 2), (maxHeight + _textborder * 2), textradius + _textborder, true, false);
                }
            }
        }
        // draw border
        if (textborder > 0) {
            context.globalAlpha = backalpha;
            context.lineWidth = textborder * 2;
            context.strokeStyle = textdraw.textbordercolor;
            context.fillStyle = textdraw.textbordercolor;
            context.setLineDash([]);
            if (textdraw.textborderdash.substring(0, 1) == "1") {
                var borderdash = textdraw.textborderdash.split(" ");
                if (borderdash.length == 4) {
                    var scaleDash = (UI.comScale.active ? (UI.comScale.scaleX + UI.comScale.scaleY) / 2 : 1);
                    var dash1 = parseInt(borderdash[1]) * scaleDash;
                    var dash2 = parseInt(borderdash[2]) * scaleDash;
                    var dashOffset = parseInt(borderdash[3]) * scaleDash;
                    context.setLineDash([dash1, dash2]);
                    context.lineDashOffset = dashOffset;
                }
            }
            // include border gap, cut out gap later
            context.lineWidth = textborder * 2 + bordergap * 2;
            if (UI.comScale.active && textdraw.shape == UI.SHAPE.CIRCLE) {
                this.ellipseRect(context, 0, 0, maxWidth, maxHeight, false, true);
            } else if (textdraw.shape == UI.SHAPE.TRAPEZOID) {
                this.skewedRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textborder, skewA, skewB, skewDir, false, true);
            } else if (textdraw.shape == UI.SHAPE.PARALLELOGRAM) {
                this.skewedRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textborder, skewP, -skewP, skewDir, false, true);
            } else if (textdraw.shape == UI.SHAPE.RIBBON) {
                this.ribbonRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textborder, skewA, skewB, skewDir, false, true);
            } else if (textdraw.shape == UI.SHAPE.POLYGON) {
                this.roundedPolygonStroke(context, polyradius, textdraw.polysides, textradius, textdraw.polyspokeratio, textdraw.polyspoke);
            } else if (textdraw.shape == UI.SHAPE.CURVEDTEXT) {
                // skip
            } else if (textdraw.shape == UI.SHAPE.CUSTOM || textdraw.shape == UI.SHAPE.LINE) {
                context.lineWidth = textborder;
                this.customShape(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textdraw, false, true);
                context.lineWidth = textborder * 2;
            } else if (textdraw.shape == UI.SHAPE.ELLIPSE) {
                this.ellipseRect(context, 0, 0, maxWidth, maxHeight, false, true);
            } else {
                this.roundedRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textradius, false, true);
            }

            // gap colored
            if (bordergap > 0 && bordergapcolor.toLowerCase() !== "#0000ffff") {
                context.setLineDash([]);
                if (textdraw.textborderdash.substring(0, 1) == "2") {
                    var borderdash = textdraw.textborderdash.split(" ");
                    if (borderdash.length == 4) {
                        var scaleDash = (UI.comScale.active ? (UI.comScale.scaleX + UI.comScale.scaleY) / 2 : 1);
                        var dash1 = parseInt(borderdash[1]) * scaleDash;
                        var dash2 = parseInt(borderdash[2]) * scaleDash;
                        var dashOffset = parseInt(borderdash[3]) * scaleDash;
                        context.setLineDash([dash1, dash2]);
                        context.lineDashOffset = dashOffset;
                    }
                }

                context.lineWidth = bordergap * 2;
                context.strokeStyle = bordergapcolor;
                context.shadowColor = "transparent";

                if (textdraw.shape == UI.SHAPE.TRAPEZOID) {
                    this.skewedRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textborder, skewA, skewB, skewDir, false, true);
                } else if (textdraw.shape == UI.SHAPE.PARALLELOGRAM) {
                    this.skewedRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textborder, skewP, -skewP, skewDir, false, true);
                } else if (textdraw.shape == UI.SHAPE.RIBBON) {
                    this.ribbonRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textborder, skewA, skewB, skewDir, false, true);
                } else if (textdraw.shape == UI.SHAPE.POLYGON) {
                    this.roundedPolygonStroke(context, polyradius, textdraw.polysides, textradius, textdraw.polyspokeratio, textdraw.polyspoke);
                } else if (textdraw.shape == UI.SHAPE.CURVEDTEXT) {
                    // skip
                } else if (textdraw.shape == UI.SHAPE.CUSTOM || textdraw.shape == UI.SHAPE.LINE) {
                    // skip
                } else if (textdraw.shape == UI.SHAPE.ELLIPSE) {
                    this.ellipseRect(context, 0, 0, maxWidth, maxHeight, false, true);
                } else {
                    this.roundedRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textradius, false, true);
                }
            }

            context.shadowColor = "transparent";
        } else if (((WPImager.current == layer && textdraw.shape == UI.SHAPE.CURVEDTEXT /* && textdraw.shape == UI.SHAPE.CURVEDTEXT */ && UI.console_shape == UI.CNSL.SHAPETOOLEDIT)
                || textdraw.shape == UI.SHAPE.CUSTOM || textdraw.shape == UI.SHAPE.LINE) && textborder == 0) {
            if ((textdraw.backcoloroption == "color" && textdraw.backcolor.length != 7) ||
                    (textdraw.backcoloroption == "radial" && textdraw.backgradient.length == 0) ||
                    (textdraw.backcoloroption == "linear" && textdraw.backgradient.length == 0)) {
                context.lineWidth = 1;
                context.strokeStyle = "#555555";
                context.setLineDash([5, 5]);
                this.customShape(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textdraw, false, true);
            }
        }
        context.shadowColor = "transparent";

        // draw fill
        context.globalAlpha = backalpha;


        this.drawFillBackground(context, textdraw, maxWidth, maxHeight);

        if ((/* textdraw.shape == UI.SHAPE.CURVEDTEXT || */ textdraw.shape == UI.SHAPE.CUSTOM) && textdraw.textborder > 0) {
            context.globalAlpha = backalpha;
            context.lineWidth = textborder;// * 2;
            context.strokeStyle = textdraw.textbordercolor;
            context.fillStyle = textdraw.textbordercolor;
            context.setLineDash([]);
            if (textdraw.textborderdash.substring(0, 1) == "1") {
                var borderdash = textdraw.textborderdash.split(" ");
                if (borderdash.length == 4) {
                    var scaleDash = (UI.comScale.active ? (UI.comScale.scaleX + UI.comScale.scaleY) / 2 : 1);
                    var dash1 = parseInt(borderdash[1]) * scaleDash;
                    var dash2 = parseInt(borderdash[2]) * scaleDash;
                    var dashOffset = parseInt(borderdash[3]) * scaleDash;
                    context.setLineDash([dash1, dash2]);
                    context.lineDashOffset = dashOffset;
                }
            }
            context.shadowColor = "transparent";
            this.customShape(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textdraw, false, true);
            context.lineWidth = textborder * 2; // reset lineWidth
        }

    };


    WPImagerUI.drawFillBackground = function (context, textdraw, maxWidth, maxHeight) {
        if (textdraw.shape == UI.SHAPE.LINE)
            return;

        if (textdraw.backcoloroption == "color" || textdraw.backcoloroption == "none") {
            this.textFillColor(textdraw, context, maxWidth, maxHeight);
        } else if (textdraw.backcoloroption == "linear" && textdraw.backgradient.length > 0) {
            this.textFillLinear(textdraw, context, maxWidth, maxHeight);
        } else if (textdraw.backcoloroption == "radial" && textdraw.backgradient.length > 0) {
            this.textFillRadial(textdraw, context, maxWidth, maxHeight);
        } else if (textdraw.backcoloroption == "stripes-radial") {
            this.textFillStripesRadial(textdraw, context, maxWidth, maxHeight);
        } else if ((textdraw.backcoloroption == "stripes" || textdraw.backcoloroption == "stripes-discrete") && textdraw.backgradient.length > 0) {
            this.textFillStripes(textdraw, context, maxWidth, maxHeight);
        }
    };

    WPImagerUI.textFillColor = function (textdraw, context, maxWidth, maxHeight) {
        var txtx = textdraw.xOffset;
        var txty = textdraw.yOffset;
        var txtw = textdraw.width;
        var txth = textdraw.height;
        var txtr = textdraw.rotation;
        var skewA = textdraw.skewA;
        var skewB = textdraw.skewB;
        var skewP = textdraw.skewP;
        var skewDir = textdraw.skewDir;
        var polyradius = textdraw.radius;
        var backtilewidth = textdraw.backtilewidth;
        var backradialOx = textdraw.backradialOx;
        var backradialOy = textdraw.backradialOy;
        var backstripeOx = textdraw.backstripeOx;


        var textborder = (textdraw.shape == UI.SHAPE.LINE) ? textdraw.textborder / 2 : textdraw.textborder;
        var textradius = (textdraw.shape == UI.SHAPE.CIRCLE) ? textdraw.width / 2 + 1 : textdraw.textradius;
        var bordergap = textdraw.bordergap;
        var bordergapcolor = textdraw.bordergapcolor;

        if (UI.comScale.active) {
            txtx *= UI.comScale.scaleX;
            txtw *= UI.comScale.scaleX;
            txty *= UI.comScale.scaleY;
            txth *= UI.comScale.scaleY;
            textborder *= UI.comScale.scaleX;
            bordergap *= UI.comScale.scaleX;
            // textradius = (textdraw.shape == UI.SHAPE.CIRCLE) ? (textdraw.width * UI.comScale.scaleX) / 2 + 1 : textdraw.textradius * UI.comScale.scaleX;
            skewA *= (skewDir == 0 ? UI.comScale.scaleX : UI.comScale.scaleY);
            skewB *= (skewDir == 0 ? UI.comScale.scaleX : UI.comScale.scaleY);
            skewP *= (skewDir == 0 ? UI.comScale.scaleX : UI.comScale.scaleY);
            backtilewidth *= UI.comScale.scaleX;
            backradialOx *= UI.comScale.scaleX;
            backradialOy *= UI.comScale.scaleX;
            backstripeOx *= UI.comScale.scaleX;
        }

        context.fillStyle = textdraw.backcolor;
        if (textdraw.shape == UI.SHAPE.POLYGON) {
            var sides = textdraw.polysides;
            var spokeratio = textdraw.polyspokeratio;
            //  text has border - cut out excess inner border with first fill
            if (textborder > 0) {
                context.fillStyle = "#ffffff";  // in case background is transparent
                context.globalCompositeOperation = "destination-out";
                this.roundedPolygonFill(context, polyradius - 1, sides, textradius, spokeratio, textdraw.polyspoke);
                if (bordergap > 0 && bordergapcolor.toLowerCase() === "#0000ffff") {
                    // cut fill & gap
                    context.lineWidth = bordergap * 2;
                    context.strokeStyle = "#ffffff";
                    context.setLineDash([]);
                    this.roundedPolygonStroke(context, polyradius, sides, textradius, spokeratio, textdraw.polyspoke);

                }

            }
            if (textdraw.backcoloroption == "none") {
                // no fill
            } else if (textdraw.backcolor.length === 7) {
                //  perform actual fill 
                context.globalCompositeOperation = "source-over";
                context.fillStyle = textdraw.backcolor;
                // include shadow fill
                if (textborder == 0) {
                    this.setContextShadowFill(context, textdraw);
                }
                this.roundedPolygonFill(context, polyradius, sides, textradius, spokeratio, textdraw.polyspoke);
            }
        } else if (textdraw.shape == UI.SHAPE.CURVEDTEXT) {
            // no fill
        } else if (textdraw.shape == UI.SHAPE.CUSTOM) {
            if (textdraw.backcoloroption == "none") {
                // no fill
            } else if (textdraw.backcolor.length === 7) {
                //  perform actual fill 
                context.globalCompositeOperation = "source-over";
                context.fillStyle = textdraw.backcolor;
                // include shadow fill
                if (textborder == 0) {
                    this.setContextShadowFill(context, textdraw);
                }
                this.customShape(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textdraw, true, false);
            }

        } else {
            //  text has border - cut out excess inner border with first fill
            var cutShrink = (textborder == 0) ? 0 : 1;

            if (textborder > 0) {
                if (bordergap > 0 && bordergapcolor.toLowerCase() === "#0000ffff") {
                    // cut fill & gap
                    context.lineWidth = bordergap * 2;
                    context.strokeStyle = "#ffffff";
                    context.setLineDash([]);
                } else {
                    // cut fill only
                    context.strokeStyle = "transparent";
                    context.lineWidth = 0;
                }
                context.globalCompositeOperation = "destination-out";
                if (UI.comScale.active && textdraw.shape == UI.SHAPE.CIRCLE) {
                    this.ellipseRect(context, 0, 0, maxWidth - 2 * cutShrink, maxHeight - 2 * cutShrink, true, false);
                } else if (textdraw.shape == UI.SHAPE.TRAPEZOID) {
                    this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, true, false);
                    this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, false, true);
                } else if (textdraw.shape == UI.SHAPE.RIBBON) {
                    this.ribbonRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, true, false);
                    this.ribbonRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, false, true);
                } else if (textdraw.shape == UI.SHAPE.PARALLELOGRAM) {
                    this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewP, -skewP, skewDir, true, false);
                    this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewP, -skewP, skewDir, false, true);
                } else if (textdraw.shape == UI.SHAPE.ELLIPSE) {
                    this.ellipseRect(context, 0, 0, maxWidth - 2 * cutShrink, maxHeight - 2 * cutShrink, true, false);
                    this.ellipseRect(context, 0, 0, maxWidth - 2 * cutShrink, maxHeight - 2 * cutShrink, false, true);
                } else {
                    this.roundedRect(context, (-maxWidth / 2 + cutShrink), (-maxHeight / 2 + cutShrink), (maxWidth - 2 * cutShrink), (maxHeight - 2 * cutShrink), textradius, true, false);
                    this.roundedRect(context, (-maxWidth / 2 + cutShrink), (-maxHeight / 2 + cutShrink), (maxWidth - 2 * cutShrink), (maxHeight - 2 * cutShrink), textradius, false, true);
                }
            }
            if (textdraw.backcoloroption == "none") {
                // no fill
            } else if (textdraw.backcolor.length === 7) {
                //  perform actual fill 
                context.globalCompositeOperation = "source-over";
                context.fillStyle = textdraw.backcolor;
                // include shadow fill
                if (textborder == 0) {
                    this.setContextShadowFill(context, textdraw);
                }
                cutShrink = 0;
                if (UI.comScale.active && textdraw.shape == UI.SHAPE.CIRCLE) {
                    this.ellipseRect(context, 0, 0, maxWidth - 2 * cutShrink, maxHeight - 2 * cutShrink, true, false);
                } else if (textdraw.shape == UI.SHAPE.TRAPEZOID) {
                    this.skewedRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, 0, skewA, skewB, skewDir, true, false);
                } else if (textdraw.shape == UI.SHAPE.RIBBON) {
                    this.ribbonRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, 0, skewA, skewB, skewDir, true, false);
                } else if (textdraw.shape == UI.SHAPE.PARALLELOGRAM) {
                    this.skewedRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, 0, skewP, -skewP, skewDir, true, false);
                } else if (textdraw.shape == UI.SHAPE.ELLIPSE) {
                    this.ellipseRect(context, 0, 0, maxWidth - 2 * cutShrink, maxHeight - 2 * cutShrink, true, false);
                } else {
                    this.roundedRect(context, (-maxWidth / 2 + cutShrink), (-maxHeight / 2 + cutShrink), (maxWidth - 2 * cutShrink), (maxHeight - 2 * cutShrink), textradius, true, false);
                }
            }
        }
    }


    WPImagerUI.textFillLinear = function (textdraw, context, maxWidth, maxHeight) {
        var txtx = textdraw.xOffset;
        var txty = textdraw.yOffset;
        var txtw = textdraw.width;
        var txth = textdraw.height;
        var txtr = textdraw.rotation;
        var skewA = textdraw.skewA;
        var skewB = textdraw.skewB;
        var skewP = textdraw.skewP;
        var skewDir = textdraw.skewDir;
        var polyradius = textdraw.radius;
        var backtilewidth = textdraw.backtilewidth;
        var backradialOx = textdraw.backradialOx;
        var backradialOy = textdraw.backradialOy;
        var backstripeOx = textdraw.backstripeOx;


        var textborder = (textdraw.shape == UI.SHAPE.LINE) ? textdraw.textborder / 2 : textdraw.textborder;
        var textradius = (textdraw.shape == UI.SHAPE.CIRCLE) ? textdraw.width / 2 + 1 : textdraw.textradius;
        var bordergap = textdraw.bordergap;
        var bordergapcolor = textdraw.bordergapcolor;

        if (UI.comScale.active) {
            txtx *= UI.comScale.scaleX;
            txtw *= UI.comScale.scaleX;
            txty *= UI.comScale.scaleY;
            txth *= UI.comScale.scaleY;
            textborder *= UI.comScale.scaleX;
            bordergap *= UI.comScale.scaleX;
            // textradius = (textdraw.shape == UI.SHAPE.CIRCLE) ? (textdraw.width * UI.comScale.scaleX) / 2 + 1 : textdraw.textradius * UI.comScale.scaleX;
            skewA *= (skewDir == 0 ? UI.comScale.scaleX : UI.comScale.scaleY);
            skewB *= (skewDir == 0 ? UI.comScale.scaleX : UI.comScale.scaleY);
            skewP *= (skewDir == 0 ? UI.comScale.scaleX : UI.comScale.scaleY);
            backtilewidth *= UI.comScale.scaleX;
            backradialOx *= UI.comScale.scaleX;
            backradialOy *= UI.comScale.scaleX;
            backstripeOx *= UI.comScale.scaleX;
        }

        var points = new Array();
        points = this.getGradientFromString(textdraw.backgradient);
        var xy = this.rotateGradient(textdraw.backgradrotation /* + 90 */, maxWidth, maxHeight);
        var gradient = context.createLinearGradient(-maxWidth / 2 + xy.x1, -maxHeight / 2 + xy.y1, -maxWidth / 2 + xy.x2, -maxHeight / 2 + xy.y2);

        $.each(points, function (i, el) {
            if (!isNaN(parseInt(el[0]))) {
                var color = el[1];
                if (color.toLowerCase() == "#0000ffff")
                    color = "transparent";
                gradient.addColorStop(Math.min(parseInt(el[0]) / 100, 1), color);
            }
        });

        context.fillStyle = "#ffffff";
        if (textdraw.shape == UI.SHAPE.POLYGON) {
            var sides = textdraw.polysides;
            var spokeratio = textdraw.polyspokeratio;

            //  cut out excess inner border with first fill
            if (textborder > 0) {
                context.globalCompositeOperation = "destination-out";
                if (bordergap > 0 && bordergapcolor.toLowerCase() === "#0000ffff") {
                    // cut fill & gap
                    context.lineWidth = bordergap * 2;
                    context.strokeStyle = "#ffffff";
                    context.setLineDash([]);
                } else {
                    // cut fill only
                    context.strokeStyle = "transparent";
                    context.lineWidth = 0;
                }
                this.roundedPolygonFill(context, polyradius - 1, sides, textradius, spokeratio, textdraw.polyspoke);
                this.roundedPolygonStroke(context, polyradius - 1, sides, textradius, spokeratio, textdraw.polyspoke);
            }
            // include shadow 
            if (textborder == 0) {
                this.setContextShadowFill(context, textdraw);
            }
            //  perform actual fill 
            context.globalCompositeOperation = "source-over";
            context.fillStyle = gradient;
            this.roundedPolygonFill(context, polyradius, sides, textradius, spokeratio, textdraw.polyspoke);
        } else if (textdraw.shape == UI.SHAPE.CURVEDTEXT || textdraw.shape == UI.SHAPE.CUSTOM) {
            // include shadow 
            //if (textborder == 0) 
            {
                this.setContextShadowFill(context, textdraw);
            }

            //  perform actual fill 
            context.globalCompositeOperation = "source-over";
            context.fillStyle = gradient;
            this.customShape(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textdraw, true, false);

        } else {
            //  cut out excess inner border with first fill
            if (textborder > 0) {
                context.globalCompositeOperation = "destination-out";
                if (bordergap > 0 && bordergapcolor.toLowerCase() === "#0000ffff") {
                    // cut fill & gap
                    context.lineWidth = bordergap * 2;
                    context.strokeStyle = "#ffffff";
                    context.setLineDash([]);
                } else {
                    // cut fill only
                    context.strokeStyle = "transparent";
                    context.lineWidth = 0;
                }
                if (UI.comScale.active && textdraw.shape == UI.SHAPE.CIRCLE) {
                    this.ellipseRect(context, 0, 0, maxWidth - 2, maxHeight - 2, true, false);
                    this.ellipseRect(context, 0, 0, maxWidth - 2, maxHeight - 2, false, true);
                } else if (textdraw.shape == UI.SHAPE.TRAPEZOID) {
                    this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, true, false);
                    this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, false, true);
                } else if (textdraw.shape == UI.SHAPE.RIBBON) {
                    this.ribbonRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, true, false);
                    this.ribbonRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, false, true);
                } else if (textdraw.shape == UI.SHAPE.PARALLELOGRAM) {
                    this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewP, -skewP, skewDir, true, false);
                    this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewP, -skewP, skewDir, false, true);
                } else if (textdraw.shape == UI.SHAPE.ELLIPSE) {
                    this.ellipseRect(context, 0, 0, maxWidth - 2, maxHeight - 2, true, false);
                    this.ellipseRect(context, 0, 0, maxWidth - 2, maxHeight - 2, false, true);
                } else {
                    this.roundedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, textradius, true, false);
                    this.roundedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, textradius, false, true);
                }
            }
            // include shadow 
            if (textborder == 0) {
                this.setContextShadowFill(context, textdraw);
            }
            //  perform actual fill 
            context.globalCompositeOperation = "source-over";
            context.fillStyle = gradient;
            if (UI.comScale.active && textdraw.shape == UI.SHAPE.CIRCLE) {
                this.ellipseRect(context, 0, 0, maxWidth, maxHeight, true, false);
            } else if (textdraw.shape == UI.SHAPE.TRAPEZOID) {
                this.skewedRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, 0, skewA, skewB, skewDir, true, false);
            } else if (textdraw.shape == UI.SHAPE.RIBBON) {
                this.ribbonRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, 0, skewA, skewB, skewDir, true, false);
            } else if (textdraw.shape == UI.SHAPE.PARALLELOGRAM) {
                this.skewedRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, 0, skewP, -skewP, skewDir, true, false);
            } else if (textdraw.shape == UI.SHAPE.ELLIPSE) {
                this.ellipseRect(context, 0, 0, maxWidth, maxHeight, true, false);
            } else {
                this.roundedRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textradius, true, false);
            }
        }
        // end of linear
    }



    WPImagerUI.textFillRadial = function (textdraw, context, maxWidth, maxHeight) {
        var txtx = textdraw.xOffset;
        var txty = textdraw.yOffset;
        var txtw = textdraw.width;
        var txth = textdraw.height;
        var txtr = textdraw.rotation;
        var skewA = textdraw.skewA;
        var skewB = textdraw.skewB;
        var skewP = textdraw.skewP;
        var skewDir = textdraw.skewDir;
        var polyradius = textdraw.radius;
        var backtilewidth = textdraw.backtilewidth;
        var backradialOx = textdraw.backradialOx;
        var backradialOy = textdraw.backradialOy;
        var backstripeOx = textdraw.backstripeOx;


        var textborder = (textdraw.shape == UI.SHAPE.LINE) ? textdraw.textborder / 2 : textdraw.textborder;
        var textradius = (textdraw.shape == UI.SHAPE.CIRCLE) ? textdraw.width / 2 + 1 : textdraw.textradius;
        var bordergap = textdraw.bordergap;
        var bordergapcolor = textdraw.bordergapcolor;

        if (UI.comScale.active) {
            txtx *= UI.comScale.scaleX;
            txtw *= UI.comScale.scaleX;
            txty *= UI.comScale.scaleY;
            txth *= UI.comScale.scaleY;
            textborder *= UI.comScale.scaleX;
            bordergap *= UI.comScale.scaleX;
            // textradius = (textdraw.shape == UI.SHAPE.CIRCLE) ? (textdraw.width * UI.comScale.scaleX) / 2 + 1 : textdraw.textradius * UI.comScale.scaleX;
            skewA *= (skewDir == 0 ? UI.comScale.scaleX : UI.comScale.scaleY);
            skewB *= (skewDir == 0 ? UI.comScale.scaleX : UI.comScale.scaleY);
            skewP *= (skewDir == 0 ? UI.comScale.scaleX : UI.comScale.scaleY);
            backtilewidth *= UI.comScale.scaleX;
            backradialOx *= UI.comScale.scaleX;
            backradialOy *= UI.comScale.scaleX;
            backstripeOx *= UI.comScale.scaleX;
        }

        var points = new Array();
        points = this.getGradientFromString(textdraw.backgradient);
        var radialRad = (textdraw.backradialRad / 100);
        var radius = (Math.sqrt(maxWidth * maxWidth + maxHeight * maxHeight) * radialRad); // diagonal length
        var gradient = context.createRadialGradient(backradialOx, backradialOy, 0, backradialOx, backradialOy, radius);
        $.each(points, function (i, el) {
            if (!isNaN(parseInt(el[0]))) {
                var color = el[1];
                if (color.toLowerCase() == "#0000ffff")
                    color = "transparent";
                gradient.addColorStop(1 - Math.min(parseInt(el[0]) / 100, 1), color);
            }
        });
        context.fillStyle = "#ffffff";
        if (textdraw.shape == UI.SHAPE.POLYGON) {
            var sides = textdraw.polysides;
            var spokeratio = textdraw.polyspokeratio;
            //  cut out excess inner border with first fill
            if (textborder > 0) {
                context.globalCompositeOperation = "destination-out";
                if (bordergap > 0 && bordergapcolor.toLowerCase() === "#0000ffff") {
                    // cut fill & gap
                    context.lineWidth = bordergap * 2;
                    context.strokeStyle = "#ffffff";
                    context.setLineDash([]);
                } else {
                    // cut fill only
                    context.strokeStyle = "transparent";
                    context.lineWidth = 0;
                }
                this.roundedPolygonFill(context, polyradius - 1, sides, textradius, spokeratio, textdraw.polyspoke);
                this.roundedPolygonStroke(context, polyradius - 1, sides, textradius, spokeratio, textdraw.polyspoke);
            }
            // include shadow 
            if (textborder == 0) {
                this.setContextShadowFill(context, textdraw);
            }
            //  perform actual fill 
            context.globalCompositeOperation = "source-over";
            context.fillStyle = gradient;
            // include shadow 
            if (textborder == 0) {
                this.setContextShadowFill(context, textdraw);
            }
            this.roundedPolygonFill(context, polyradius, sides, textradius, spokeratio, textdraw.polyspoke);
        } else if (textdraw.shape == UI.SHAPE.CURVEDTEXT || textdraw.shape == UI.SHAPE.CUSTOM) {
            //if (textborder == 0) 
            {
                this.setContextShadowFill(context, textdraw);
            }

            //  perform actual fill 
            context.globalCompositeOperation = "source-over";
            context.fillStyle = gradient;
            this.customShape(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textdraw, true, false);

        } else {
            //  cut out excess inner border with first fill
            if (textborder > 0) {
                context.globalCompositeOperation = "destination-out";
                if (bordergap > 0 && bordergapcolor.toLowerCase() === "#0000ffff") {
                    // cut fill & gap
                    context.lineWidth = bordergap * 2;
                    context.strokeStyle = "#ffffff";
                    context.setLineDash([]);
                } else {
                    // cut fill only
                    context.strokeStyle = "transparent";
                    context.lineWidth = 0;
                }
                if (UI.comScale.active && textdraw.shape == UI.SHAPE.CIRCLE) {
                    this.ellipseRect(context, 0, 0, maxWidth - 2, maxHeight - 2, true, false);
                    this.ellipseRect(context, 0, 0, maxWidth - 2, maxHeight - 2, false, true);
                } else if (textdraw.shape == UI.SHAPE.TRAPEZOID) {
                    this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, true, false);
                    this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, false, true);
                } else if (textdraw.shape == UI.SHAPE.RIBBON) {
                    this.ribbonRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, true, false);
                    this.ribbonRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, false, true);
                } else if (textdraw.shape == UI.SHAPE.PARALLELOGRAM) {
                    this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewP, -skewP, skewDir, true, false);
                    this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewP, -skewP, skewDir, false, true);
                } else if (textdraw.shape == UI.SHAPE.ELLIPSE) {
                    this.ellipseRect(context, 0, 0, maxWidth - 2, maxHeight - 2, true, false);
                    this.ellipseRect(context, 0, 0, maxWidth - 2, maxHeight - 2, false, true);
                } else {
                    this.roundedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, textradius, true, false);
                    this.roundedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, textradius, false, true);
                }
            }
            //  perform actual fill 
            context.globalCompositeOperation = "source-over";
            context.fillStyle = gradient;
            // include shadow 
            if (textborder == 0) {
                this.setContextShadowFill(context, textdraw);
            }
            if (UI.comScale.active && textdraw.shape == UI.SHAPE.CIRCLE) {
                this.ellipseRect(context, 0, 0, maxWidth, maxHeight, true, false);
            } else if (textdraw.shape == UI.SHAPE.TRAPEZOID) {
                this.skewedRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, 0, skewA, skewB, skewDir, true, false);
            } else if (textdraw.shape == UI.SHAPE.RIBBON) {
                this.ribbonRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, 0, skewA, skewB, skewDir, true, false);
            } else if (textdraw.shape == UI.SHAPE.PARALLELOGRAM) {
                this.skewedRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, 0, skewP, -skewP, skewDir, true, false);
            } else if (textdraw.shape == UI.SHAPE.ELLIPSE) {
                this.ellipseRect(context, 0, 0, maxWidth, maxHeight, true, false);
            } else {
                this.roundedRect(context, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textradius, true, false);
            }
        }
        // end of radial
    }


    WPImagerUI.textFillStripes = function (textdraw, context, maxWidth, maxHeight, stripes) {
        var txtx = textdraw.xOffset;
        var txty = textdraw.yOffset;
        var txtw = textdraw.width;
        var txth = textdraw.height;
        var txtr = textdraw.rotation;
        var polyradius = textdraw.radius;
        var backtilewidth = textdraw.backtilewidth;
        var backstripeOx = textdraw.backstripeOx;
        var skewA = textdraw.skewA;
        var skewB = textdraw.skewB;
        var skewP = textdraw.skewP;
        var skewDir = textdraw.skewDir;
        var textborder = (textdraw.shape == UI.SHAPE.LINE) ? textdraw.textborder / 2 : textdraw.textborder;
        var textradius = (textdraw.shape == UI.SHAPE.CIRCLE) ? textdraw.width / 2 + 1 : textdraw.textradius;
        var bordergap = textdraw.bordergap;
        var bordergapcolor = textdraw.bordergapcolor;

        var points = new Array();
        points = this.getGradientFromString(textdraw.backgradient);
        // var xy = this.rotateGradient(textdraw.backgradrotation + /* textdraw.polyangle + */ 90, maxWidth, maxHeight);
        var pattern = document.getElementById('PatternCanvas');
        pattern.width = backtilewidth;
        pattern.height = backtilewidth;
        var pctx = pattern.getContext('2d');
        var gradient = pctx.createLinearGradient(0, 0, backtilewidth, 0);
        var prevcolor = "";
        var discrete = (textdraw.backcoloroption == "stripes-discrete");
        var offset = ((backstripeOx % backtilewidth) + backtilewidth) % backtilewidth;

        $.each(points, function (i, el) {
            if (!isNaN(parseInt(el[0]))) {
                var color = el[1];
                if (color.toLowerCase() == "#0000ffff")
                    color = "transparent";
                if (discrete && prevcolor.length > 0) {
                    gradient.addColorStop(Math.min(parseInt(el[0]) / 100, 1), prevcolor);
                }
                gradient.addColorStop(Math.min(parseInt(el[0]) / 100, 1), color);
                prevcolor = color;
            }
        });
//            pctx.fillStyle = "#ffcc00";
//            pctx.fillRect(0, 0, backtilewidth, backtilewidth);
        pctx.fillStyle = gradient;
        pctx.translate(offset, 0);
        pctx.fillRect(0, 0, backtilewidth - offset, backtilewidth);
        pctx.fillStyle = gradient;
        pctx.translate(-backtilewidth, 0);
        pctx.fillRect(0, 0, backtilewidth, backtilewidth);

        var diagLength = Math.sqrt((txtw * txtw) + (txth * txth));
        var tile = backtilewidth,
                repeats = ((diagLength * 2) + offset) / tile;
        var stripes = this.ctx.createPattern(pattern, "repeat");


        if (textdraw.shape == UI.SHAPE.POLYGON) {
            var sides = textdraw.polysides;
            var spokeratio = textdraw.polyspokeratio;

            //  cut out excess inner border with first fill
            if (textborder > 0) {
                context.globalCompositeOperation = "destination-out";
                this.roundedPolygonFill(context, polyradius - 1, sides, textradius, spokeratio, textdraw.polyspoke);
                if (bordergap > 0 && bordergapcolor.toLowerCase() === "#0000ffff") {
                    // cut fill & gap
                    context.lineWidth = bordergap * 2;
                    context.strokeStyle = "#ffffff";
                    context.setLineDash([]);
                    this.roundedPolygonStroke(context, polyradius - 1, sides, textradius, spokeratio, textdraw.polyspoke);
                }

            }
            // include shadow 
            if (textborder == 0) {
                this.setContextShadowFill(context, textdraw);
            }
            //  perform actual fill 
            context.globalCompositeOperation = "source-over";
            //               
            var tempCanvas = document.getElementById('cvtemp');
            var tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = UI.comScale.active ? UI.comScale.scaledWidth : WPImager.canvas.width;
            tempCanvas.height = UI.comScale.active ? UI.comScale.scaledHeight : WPImager.canvas.height;

            tempCtx.globalAlpha = 1;
            tempCtx.fillStyle = stripes;
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

            tempCtx.translate(txtx + txtw / 2, txty + txth / 2);
            tempCtx.rotate(txtr * Math.PI / 180);
            tempCtx.rotate((textdraw.backgradrotation /* + textdraw.polyangle */) * Math.PI / 180);

            for (var i = 0; i < repeats; i++) {
                tempCtx.fillRect(-diagLength + (tile * i) - offset, -diagLength, backtilewidth + 1, diagLength * 2);
            }
            tempCtx.rotate(-(textdraw.backgradrotation /* + textdraw.polyangle */) * Math.PI / 180);
            tempCtx.fillStyle = "#ffffff";
            tempCtx.globalCompositeOperation = "destination-in";
            this.roundedPolygonFill(tempCtx, polyradius, sides, textradius, spokeratio, textdraw.polyspoke);
            tempCtx.rotate(-txtr * Math.PI / 180);
            tempCtx.translate(-(txtx + txtw / 2), -(txty + txth / 2));
            context.rotate(-txtr * Math.PI / 180);
            context.drawImage(tempCanvas, -maxWidth / 2 - txtx, -maxHeight / 2 - txty, tempCanvas.width, tempCanvas.height);
            context.rotate(txtr * Math.PI / 180);

        } else if (textdraw.shape == UI.SHAPE.CURVEDTEXT || textdraw.shape == UI.SHAPE.CUSTOM) {
            // include shadow 
            //if (textborder == 0) 
            {
                this.setContextShadowFill(context, textdraw);
            }

            //  perform actual fill 
            context.globalCompositeOperation = "source-over";
            //               
            var tempCanvas = document.getElementById('cvtemp');
            var tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = UI.comScale.active ? UI.comScale.scaledWidth : WPImager.canvas.width;
            tempCanvas.height = UI.comScale.active ? UI.comScale.scaledHeight : WPImager.canvas.height;

            tempCtx.globalAlpha = 1;
            tempCtx.fillStyle = stripes;
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

            tempCtx.translate(txtx + txtw / 2, txty + txth / 2);
            tempCtx.rotate(txtr * Math.PI / 180);
            tempCtx.rotate((textdraw.backgradrotation /* + textdraw.polyangle */) * Math.PI / 180);

            for (var i = 0; i < repeats; i++) {
                tempCtx.fillRect(-diagLength + (tile * i) - offset, -diagLength, backtilewidth + 1, diagLength * 2);
            }
            tempCtx.rotate(-(textdraw.backgradrotation /* + textdraw.polyangle */) * Math.PI / 180);
            tempCtx.fillStyle = "#ffffff";
            tempCtx.globalCompositeOperation = "destination-in";
            this.customShape(tempCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textdraw, true, false);
            tempCtx.rotate(-txtr * Math.PI / 180);
            tempCtx.translate(-(txtx + txtw / 2), -(txty + txth / 2));
            context.rotate(-txtr * Math.PI / 180);
            context.drawImage(tempCanvas, -maxWidth / 2 - txtx, -maxHeight / 2 - txty, tempCanvas.width, tempCanvas.height);
            context.rotate(txtr * Math.PI / 180);


        } else {
//                //  cut out excess inner border with first fill
            if (textborder > 0) {
                context.globalCompositeOperation = "destination-out";
                if (bordergap > 0 && bordergapcolor.toLowerCase() === "#0000ffff") {
                    // cut fill & gap
                    context.lineWidth = bordergap * 2;
                    context.strokeStyle = "#ffffff";
                    context.setLineDash([]);
                } else {
                    // cut fill only
                    context.strokeStyle = "transparent";
                    context.lineWidth = 0;
                }

                if (UI.comScale.active && textdraw.shape == UI.SHAPE.CIRCLE) {
                    this.ellipseRect(context, 0, 0, maxWidth - 2, maxHeight - 2, true, false);
                    this.ellipseRect(context, 0, 0, maxWidth - 2, maxHeight - 2, false, true);
                } else if (textdraw.shape == UI.SHAPE.TRAPEZOID) {
                    this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, true, false);
                    this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, false, true);
                } else if (textdraw.shape == UI.SHAPE.RIBBON) {
                    this.ribbonRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, true, false);
                    this.ribbonRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, false, true);
                } else if (textdraw.shape == UI.SHAPE.PARALLELOGRAM) {
                    this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewP, -skewP, skewDir, true, false);
                    this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewP, -skewP, skewDir, false, true);
                } else if (textdraw.shape == UI.SHAPE.ELLIPSE) {
                    this.ellipseRect(context, 0, 0, maxWidth - 2, maxHeight - 2, true, false);
                    this.ellipseRect(context, 0, 0, maxWidth - 2, maxHeight - 2, false, true);
                } else {
                    this.roundedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, textradius, true, false);
                    this.roundedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, textradius, false, true);
                }
            }
            // include shadow 
            if (textborder == 0) {
                this.setContextShadowFill(context, textdraw);
            }
            //  perform actual fill 
            context.globalCompositeOperation = "source-over";
            //               
            var tempCanvas = document.getElementById('cvtemp');
            var tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = UI.comScale.active ? UI.comScale.scaledWidth : WPImager.canvas.width;
            tempCanvas.height = UI.comScale.active ? UI.comScale.scaledHeight : WPImager.canvas.height;

            tempCtx.globalAlpha = 1;
            tempCtx.fillStyle = stripes;
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

            tempCtx.translate(txtx + txtw / 2, txty + txth / 2);
            tempCtx.rotate(txtr * Math.PI / 180);
            tempCtx.rotate(textdraw.backgradrotation * Math.PI / 180);

            for (var i = 0; i < repeats; i++) {
                tempCtx.fillRect(-diagLength + (tile * i) - offset, -diagLength, backtilewidth + 1, diagLength * 2);
            }
            tempCtx.rotate(-textdraw.backgradrotation * Math.PI / 180);
            tempCtx.fillStyle = "#ffffff";
            tempCtx.globalCompositeOperation = "destination-in";
            if (UI.comScale.active && textdraw.shape == UI.SHAPE.CIRCLE) {
                this.ellipseRect(tempCtx, 0, 0, maxWidth, maxHeight, true, false);
            } else if (textdraw.shape == UI.SHAPE.TRAPEZOID) {
                this.skewedRect(tempCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, 0, skewA, skewB, skewDir, true, false);
            } else if (textdraw.shape == UI.SHAPE.RIBBON) {
                this.ribbonRect(tempCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, 0, skewA, skewB, skewDir, true, false);
            } else if (textdraw.shape == UI.SHAPE.PARALLELOGRAM) {
                this.skewedRect(tempCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, 0, skewP, -skewP, skewDir, true, false);
            } else if (textdraw.shape == UI.SHAPE.ELLIPSE) {
                this.ellipseRect(tempCtx, 0, 0, maxWidth, maxHeight, true, false);
            } else {
                this.roundedRect(tempCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textradius, true, false);
            }
            tempCtx.rotate(-txtr * Math.PI / 180);
            tempCtx.translate(-(txtx + txtw / 2), -(txty + txth / 2));
            context.rotate(-txtr * Math.PI / 180);
            context.drawImage(tempCanvas, -maxWidth / 2 - txtx, -maxHeight / 2 - txty, tempCanvas.width, tempCanvas.height);
            context.rotate(txtr * Math.PI / 180);
        }
        // end of stripes & stripes-discrete

    }


    WPImagerUI.textFillStripesRadial = function (textdraw, context, maxWidth, maxHeight) {
        var txtx = textdraw.xOffset;
        var txty = textdraw.yOffset;
        var txtw = textdraw.width;
        var txth = textdraw.height;
        var txtr = textdraw.rotation;
        var skewA = textdraw.skewA;
        var skewB = textdraw.skewB;
        var skewP = textdraw.skewP;
        var skewDir = textdraw.skewDir;
        var polyradius = textdraw.radius;
        var backtilewidth = textdraw.backtilewidth;
        var backradialOx = textdraw.backradialOx;
        var backradialOy = textdraw.backradialOy;
        var backstripeOx = textdraw.backstripeOx;


        var textborder = (textdraw.shape == UI.SHAPE.LINE) ? textdraw.textborder / 2 : textdraw.textborder;
        var textradius = (textdraw.shape == UI.SHAPE.CIRCLE) ? textdraw.width / 2 + 1 : textdraw.textradius;
        var bordergap = textdraw.bordergap;
        var bordergapcolor = textdraw.bordergapcolor;

        if (UI.comScale.active) {
            txtx *= UI.comScale.scaleX;
            txtw *= UI.comScale.scaleX;
            txty *= UI.comScale.scaleY;
            txth *= UI.comScale.scaleY;
            textborder *= UI.comScale.scaleX;
            bordergap *= UI.comScale.scaleX;
            // textradius = (textdraw.shape == UI.SHAPE.CIRCLE) ? (textdraw.width * UI.comScale.scaleX) / 2 + 1 : textdraw.textradius * UI.comScale.scaleX;
            skewA *= (skewDir == 0 ? UI.comScale.scaleX : UI.comScale.scaleY);
            skewB *= (skewDir == 0 ? UI.comScale.scaleX : UI.comScale.scaleY);
            skewP *= (skewDir == 0 ? UI.comScale.scaleX : UI.comScale.scaleY);
            backtilewidth *= UI.comScale.scaleX;
            backradialOx *= UI.comScale.scaleX;
            backradialOy *= UI.comScale.scaleX;
            backstripeOx *= UI.comScale.scaleX;
        }

        var pattern = document.getElementById('PatternCanvas');
        pattern.width = backtilewidth;
        pattern.height = backtilewidth;
        var pctx = pattern.getContext('2d');
        var gradient = pctx.createLinearGradient(0, 0, backtilewidth, 0);
        var prevcolor = "";
        var discrete = (textdraw.backcoloroption == "stripes-discrete");
        var offset = ((backstripeOx % backtilewidth) + backtilewidth) % backtilewidth;

        var points = new Array();
        points = this.getGradientFromString(textdraw.backgradient);

        $.each(points, function (i, el) {
            if (!isNaN(parseInt(el[0]))) {
                var color = el[1];
                if (color.toLowerCase() == "#0000ffff")
                    color = "transparent";
                if (discrete && prevcolor.length > 0) {
                    gradient.addColorStop(Math.min(parseInt(el[0]) / 100, 1), prevcolor);
                }
                gradient.addColorStop(Math.min(parseInt(el[0]) / 100, 1), color);
                prevcolor = color;
            }
        });
//            pctx.fillStyle = "#ffcc00";
//            pctx.fillRect(0, 0, backtilewidth, backtilewidth);
        pctx.fillStyle = gradient;
        pctx.translate(offset, 0);
        pctx.fillRect(0, 0, backtilewidth - offset, backtilewidth);
        pctx.fillStyle = gradient;
        pctx.translate(-backtilewidth, 0);
        pctx.fillRect(0, 0, backtilewidth, backtilewidth);

        var stripes = this.ctx.createPattern(pattern, "repeat");



        var virwidth = txtw + Math.abs(backradialOx * 2);
        var virheight = txth + Math.abs(backradialOy * 2);
        var radius = Math.sqrt(virwidth * virwidth / 4 + virheight * virheight / 4);
        var tileAngle = textdraw.backradialWidth;
        var offset = ((backstripeOx % tileAngle) + tileAngle) % tileAngle - 90;
        var fromAngle = 0;
        var prevcolor;
        var loop = 0;
        var startAngle = 0;

//                //  cut out excess inner border with first fill
        if (textborder > 0) {
            context.globalCompositeOperation = "destination-out";
            if (bordergap > 0 && bordergapcolor.toLowerCase() === "#0000ffff") {
                // cut fill & gap
                context.lineWidth = bordergap * 2;
                context.strokeStyle = "#ffffff";
                context.setLineDash([]);
            } else {
                // cut fill only
                context.strokeStyle = "transparent";
                context.lineWidth = 0;
            }
            if (UI.comScale.active && textdraw.shape == UI.SHAPE.CIRCLE) {
                this.ellipseRect(context, 0, 0, maxWidth - 2, maxHeight - 2, true, false);
                this.ellipseRect(context, 0, 0, maxWidth - 2, maxHeight - 2, false, true);
            } else if (textdraw.shape == UI.SHAPE.TRAPEZOID) {
                this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, true, false);
                this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, false, true);
            } else if (textdraw.shape == UI.SHAPE.RIBBON) {
                this.ribbonRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, true, false);
                this.ribbonRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewA, skewB, skewDir, false, true);
            } else if (textdraw.shape == UI.SHAPE.PARALLELOGRAM) {
                this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewP, -skewP, skewDir, true, false);
                this.skewedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, 0, skewP, -skewP, skewDir, false, true);
            } else if (textdraw.shape == UI.SHAPE.POLYGON) {
                var sides = textdraw.polysides;
                var spokeratio = textdraw.polyspokeratio;
                this.roundedPolygonFill(context, polyradius - 1, sides, textradius, spokeratio, textdraw.polyspoke);
                this.roundedPolygonStroke(context, polyradius - 1, sides, textradius, spokeratio, textdraw.polyspoke);

            } else if (textdraw.shape == UI.SHAPE.CURVEDTEXT || textdraw.shape == UI.SHAPE.CUSTOM) {

            } else {
                if (textdraw.shape == UI.SHAPE.ELLIPSE) {
                    this.ellipseRect(context, 0, 0, maxWidth - 2, maxHeight - 2, true, false);
                    this.ellipseRect(context, 0, 0, maxWidth - 2, maxHeight - 2, false, true);
                } else {
                    this.roundedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, textradius, true, false);
                    this.roundedRect(context, -maxWidth / 2 + 1, -maxHeight / 2 + 1, maxWidth - 2, maxHeight - 2, textradius, false, true);
                }
            }
        }
        // include shadow 
        if (textborder == 0) {
            this.setContextShadowFill(context, textdraw);
        }
        //  perform actual fill 
        context.globalCompositeOperation = "source-over";
        //               
        var tempCanvas = document.getElementById('cvtemp');
        var tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = UI.comScale.active ? UI.comScale.scaledWidth : WPImager.canvas.width;
        tempCanvas.height = UI.comScale.active ? UI.comScale.scaledHeight : WPImager.canvas.height;

        tempCtx.globalAlpha = 1;
        tempCtx.fillStyle = stripes;
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

        tempCtx.translate(txtx + txtw / 2, txty + txth / 2);
        tempCtx.rotate(txtr * Math.PI / 180);

        while (startAngle < 360) {
            prevcolor = "";
            $.each(points, function (i, el) {
                if (!isNaN(parseInt(el[0]))) {
                    var color = el[1];
                    if (color.toLowerCase() == "#0000ffff")
                        color = "transparent";
                    var toAngle = startAngle + parseInt(el[0]) / 100 * tileAngle + offset;
                    tempCtx.lineWidth = 0.67;
                    tempCtx.strokeStyle = prevcolor;
                    if (prevcolor.length > 0) {
                        tempCtx.fillStyle = prevcolor;
                        tempCtx.beginPath();
                        tempCtx.moveTo(backradialOx, backradialOy);
                        tempCtx.arc(backradialOx, backradialOy, radius, fromAngle * Math.PI / 180, (toAngle + 1) * Math.PI / 180);
                        tempCtx.closePath();
                        tempCtx.fill();
                        tempCtx.stroke();
                        fromAngle = toAngle;
                    } else {
                        fromAngle = startAngle + offset;
                    }
                    prevcolor = color;
                }
            });
            // last segment 
            if (prevcolor.length > 0) {
                var toAngle = startAngle + tileAngle + offset;
                tempCtx.fillStyle = prevcolor;
                tempCtx.beginPath();
                tempCtx.moveTo(backradialOx, backradialOy);
                tempCtx.arc(backradialOx, backradialOy, radius, fromAngle * Math.PI / 180, toAngle * Math.PI / 180);
                tempCtx.closePath();
                tempCtx.fill();
            }
            startAngle = ++loop * tileAngle;
            fromAngle = startAngle;
        }

        tempCtx.fillStyle = "#ffffff";
        tempCtx.globalCompositeOperation = "destination-in";
        if (UI.comScale.active && textdraw.shape == UI.SHAPE.CIRCLE) {
            this.ellipseRect(tempCtx, 0, 0, maxWidth, maxHeight, true, false);
        } else if (textdraw.shape == UI.SHAPE.TRAPEZOID) {
            this.skewedRect(tempCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, 0, skewA, skewB, skewDir, true, false);
        } else if (textdraw.shape == UI.SHAPE.RIBBON) {
            this.ribbonRect(tempCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, 0, skewA, skewB, skewDir, true, false);
        } else if (textdraw.shape == UI.SHAPE.PARALLELOGRAM) {
            this.skewedRect(tempCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, 0, skewP, -skewP, skewDir, true, false);
        } else if (textdraw.shape == UI.SHAPE.POLYGON) {
            var sides = textdraw.polysides;
            var spokeratio = textdraw.polyspokeratio;
            this.roundedPolygonFill(tempCtx, polyradius, sides, textradius, spokeratio, textdraw.polyspoke);

        } else if (textdraw.shape == UI.SHAPE.CURVEDTEXT) {
            // skip
        } else if (textdraw.shape == UI.SHAPE.CUSTOM) {
            this.customShape(tempCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textdraw, true, false);
        } else if (textdraw.shape == UI.SHAPE.ELLIPSE) {
            this.ellipseRect(tempCtx, 0, 0, maxWidth, maxHeight, true, false);
        } else {
            this.roundedRect(tempCtx, -maxWidth / 2, -maxHeight / 2, maxWidth, maxHeight, textradius, true, false);
        }
        tempCtx.rotate(-txtr * Math.PI / 180);
        tempCtx.translate(-(txtx + txtw / 2), -(txty + txth / 2));
        context.rotate(-txtr * Math.PI / 180);
        context.drawImage(tempCanvas, -maxWidth / 2 - txtx, -maxHeight / 2 - txty, tempCanvas.width, tempCanvas.height);
        context.rotate(txtr * Math.PI / 180);
    };


})(jQuery);