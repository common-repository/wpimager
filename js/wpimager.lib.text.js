/*!
 WPImager 1.0.0    
 Layer Text Object
 https://wpimager.com/
 2018 WPImager  
 */


/**
 * LayerText Object
 * Contains methods and properties to create, define and handle text object layers on the canvas
 */

function LayerText(slide, index) {
    this.slide = slide;
    this.index = index;
    this.code = 0;
    this.name = "Text";
    this.setval(0); // initialize layer with default values  
}

(function ($) {

    LayerText.prototype = {
        setval: function (cloudlayer) {
            this.slide = this.getval(cloudlayer.slide, WPImager.slide);
            this.order = this.getval(cloudlayer.order, 1);
            this.layernote = this.getval(cloudlayer.layernote, "");
            this.fontfamily = this.getval(cloudlayer.fontfamily, "Lato");
            this.fontsize = this.getval(cloudlayer.fontsize, 36);
            this.fontweight = this.getval(cloudlayer.fontweight, 400);
            this.fontcolor = this.getval(cloudlayer.fontcolor, "#ffffff");
            this.fontsrctype = this.getval(cloudlayer.fontsrctype, 3);
            this.valign = this.getval(cloudlayer.valign, "middle");
            this.align = this.getval(cloudlayer.align, "center");
            this.xOffset = this.getval(cloudlayer.xOffset, 0);
            this.yOffset = this.getval(cloudlayer.yOffset, 0);
            this.xFine = this.getval(cloudlayer.xFine, 0);
            this.yFine = this.getval(cloudlayer.yFine, 0);
            this.width = this.getval(cloudlayer.width, 0);
            this.height = this.getval(cloudlayer.height, 0);
            this.content = this.getval(cloudlayer.content, "");
            this.padding = this.getval(cloudlayer.padding, 0);
            this.polysides = this.getval(cloudlayer.polysides, 4);
            this.polyspoke = this.getval(cloudlayer.polyspoke, false);
            this.polyspokeratio = this.getval(cloudlayer.polyspokeratio, 1);
            this.textangle = this.getval(cloudlayer.textangle, 0);
            this.circOn = this.getval(cloudlayer.circOn, false);
            this.circangle = this.getval(cloudlayer.circangle, 0);
            this.circradadj = this.getval(cloudlayer.circradadj, 0);
            this.circio = this.getval(cloudlayer.circio, 0);
            this.shape = this.getval(cloudlayer.shape, 0);
            this.skewA = this.getval(cloudlayer.skewA, 0);
            this.skewB = this.getval(cloudlayer.skewB, 0);
            this.skewP = this.getval(cloudlayer.skewP, 0);
            this.skewDir = this.getval(cloudlayer.skewDir, 0);
            this.radius = this.getval(cloudlayer.radius, 0);
            this.bold = this.getval(cloudlayer.bold, false);
            this.italic = this.getval(cloudlayer.italic, false);
            this.lineheight = this.getval(cloudlayer.lineheight, 1.3);
            this.alpha = this.getval(cloudlayer.alpha, 100);
            this.fontgradrotation = this.getval(cloudlayer.fontgradrotation, 90);
            this.fontgradient = this.getval(cloudlayer.fontgradient, "");
            this.fontgradline = this.getval(cloudlayer.fontgradline, false);
            this.fontcoloroption = this.getval(cloudlayer.fontcoloroption, "color");
            this.backalpha = this.getval(cloudlayer.backalpha, 100);
            this.backcoloroption = this.getval(cloudlayer.backcoloroption, "color");
            this.backcolor = this.getval(cloudlayer.backcolor, "#0000ffff");
            this.backgradient = this.getval(cloudlayer.backgradient, "");
            this.backgradrotation = this.getval(cloudlayer.backgradrotation, 0);
            this.backradialOx = this.getval(cloudlayer.backradialOx, 0);
            this.backradialOy = this.getval(cloudlayer.backradialOy, 0);
            this.backradialRad = this.getval(cloudlayer.backradialRad, 50);
            this.backradialWidth = this.getval(cloudlayer.backradialWidth, 60);
            this.backtilewidth = this.getval(cloudlayer.backtilewidth, 100);
            this.backstripeOx = this.getval(cloudlayer.backstripeOx, 0);
            this.backinvert = this.getval(cloudlayer.backinvert, 0);
            this.textradius = this.getval(cloudlayer.textradius, 0);
            this.textspacing = this.getval(cloudlayer.textspacing, 0);
            this.textborder = this.getval(cloudlayer.textborder, 0);
            this.textborderdash = this.getval(cloudlayer.textborderdash, "0 10 10 0");
            this.textbordercolor = this.getval(cloudlayer.textbordercolor, "#ffffff");
            this.bordergap = this.getval(cloudlayer.bordergap, 0);
            this.bordergapcolor = this.getval(cloudlayer.bordergapcolor, "#0000ffff");
            this.textoutline = this.getval(cloudlayer.textoutline, 0);
            this.textoutlinecolor = this.getval(cloudlayer.textoutlinecolor, "#ffffff");
            this.textshadowOn = this.getval(cloudlayer.textshadowOn, false);
            this.textshadow = this.getval(cloudlayer.textshadow, 0);  // blur
            this.textshadowcolor = this.getval(cloudlayer.textshadowcolor, "#000000");
            this.textshadowOx = this.getval(cloudlayer.textshadowOx, 0);
            this.textshadowOy = this.getval(cloudlayer.textshadowOy, 0);
            this.textshadowfillOn = this.getval(cloudlayer.textshadowfillOn, false);
            this.textshadowfill = this.getval(cloudlayer.textshadowfill, 0);
            this.textshadowfillcolor = this.getval(cloudlayer.textshadowfillcolor, "#000000");
            this.textshadowfillOx = this.getval(cloudlayer.textshadowfillOx, 0);
            this.textshadowfillOy = this.getval(cloudlayer.textshadowfillOy, 0);
            this.textgrow = this.getval(cloudlayer.textgrow, 0);
            this.growdir = this.getval(cloudlayer.growdir, 0);
            this.textangle1 = this.getval(cloudlayer.textangle1, 0);
            this.textangle2 = this.getval(cloudlayer.textangle2, 0);
            this.textupright = this.getval(cloudlayer.textupright, false);
            this.pathPoints = this.getval(cloudlayer.pathPoints, "");
            this.pathClosed = this.getval(cloudlayer.pathClosed, false);
            this.linestyle = this.getval(cloudlayer.linestyle, "");
            this.lineVH = this.getval(cloudlayer.lineVH, 0);
            this.rotation = this.getval(cloudlayer.rotation, 0);
            this.absLeft = this.getval(cloudlayer.absLeft, 0);
            this.absRight = this.getval(cloudlayer.absRight, 0);
            this.absTop = this.getval(cloudlayer.absTop, 0);
            this.absBottom = this.getval(cloudlayer.absBottom, 0);
            this.locked = this.getval(cloudlayer.locked, false);
            this.visible = this.getval(cloudlayer.visible, true);
            this.disposed = this.getval(cloudlayer.disposed, 0);

            if (cloudlayer !== 0 && (this.width == 0 || this.height == 0)) {
                var objectSize = 80;
                // this shouldn't happen, just in case
                this.width = objectSize;
                this.height = objectSize;
            }
            if (cloudlayer !== 0) {
                for (var key in cloudlayer) {
                    if (cloudlayer.hasOwnProperty(key)) {
                        if (typeof this[key] == "undefined") {
                            this[key] = cloudlayer[key];
                        }
                    }
                }
            }
        },
        createToolLayer: function (layerIndex, prepend) {
            var content = this.content;
            var k = this.index;
            if (typeof layerIndex === "undefined")
                layerIndex = k;
            this.temp = layerIndex;
            var tlnote = (this.layernote.length > 0) ? this.layernote : "Layer #" + k.toString();
            if (this.layernote.length == 0) {
                this.layernote = tlnote;
            }
            // add to the top or bottom of Layers Toolbox
            var html = '<div class="toolboxLayer toolboxLayerText" id="lyr' + k.toString() + '" data-order="' + layerIndex.toString() + '" data-var-index="' + k.toString() + '"><button id="btn-layer-visible-' + k.toString() + '" class="btn-layer-visible"><span class="fa fa-eye"></span></button><canvas id="tlg' + k.toString() + '" width="32" height="10" class="tlg"></canvas><div id="tlc' + k.toString() + '" class="tlc"></div><div id="tlcb' + k.toString() + '" class="tlcb"></div><div class="sorthandle"><span class="fa fa-sort"></span></div><div class="square bg" id="txt' + k.toString() + '"><div class="label-template"><i class="fa fa-paw"></i></div><div class="content"><div class="table"><div class="table-cell"><span class="fa fa-eye-slash icon-hidehide"></span><span class="fa fa-lock icon-hidehide"></span></div></div></div><div class="tl"><div class="tleditnote"></div><div class="tlnote"></div><div class="tlcontent">' + content + '</div></div></div><div class="ttl" id="ttl' + k.toString() + '"><button class="btn btn-xs btn-link editLayerNote"><span class="fa fa-pencil"></span></button></div></div>';
            // remove layer if exists
            $("#lyr" + k.toString()).remove();
            if (prepend)
                $("#toolboxLayerSortable").prepend(html);
            else
                $("#toolboxLayerSortable").append(html);
            $("#lyr" + k.toString() + " .tlnote").text(tlnote);
            // set font & color indicator of new layer
            $("#txt" + k.toString() + " .tlcontent").css("font-family", this.fontfamily);
            $("#toolboxLayerSortable").scrollTop($("#lyr" + this.index.toString()).position().top);
            if (this.shape == UI.SHAPE.POLYGON) {
                $("#txt" + k.toString() + ".square").addClass("polysquare");
            } else if (this.shape == UI.SHAPE.CUSTOM) {
                $("#txt" + k.toString() + ".square").addClass("customsquare");
            } else if (this.shape == UI.SHAPE.LINE) {
                $("#txt" + k.toString() + ".square").addClass("linesquare");
            } else if (this.shape == UI.SHAPE.CURVEDTEXT) {
                $("#txt" + k.toString() + ".square").addClass("curvedtext");
            }
            if (this.disposed > 0) {
                $("#lyr" + k.toString()).hide();
            }
            // this.refreshToolLayerColorIndicator();
        },
        createtoolboxLayer: function (layerIndex, uid, prepend) {
            var content = this.content;
            var k = this.index;
            if (typeof layerIndex === "undefined")
                layerIndex = k;
            this.temp = layerIndex;
            var tlnote = (this.layernote.length > 0) ? this.layernote : "Layer #" + k.toString();
            if (this.layernote.length == 0) {
                this.layernote = tlnote;
            }
            // add to the top or bottom of Layers Toolbox
            var html = '<div class="toolboxLayer toolboxLayerText" id="a-lyr' + k.toString() + '"  data-uid="' + uid.toString() + '" data-order="' + layerIndex.toString() + '" data-var-index="' + k.toString() + '"><button id="btn-layer-visible-' + k.toString() + '" class="btn-layer-visible pull-right"><span class="fa fa-eye"></span></button><div class="square bg" id="a-txt' + k.toString() + '"><div class="tl"><div class="tleditnote"></div><div class="tlnote"></div><div class="tlcontent">' + content + '</div></div></div><div class="ttl" id="a-ttl' + k.toString() + '"><button class="btn btn-xs btn-link editLayerNote"><span class="fa fa-pencil"></span></button></div></div>';
            // remove layer if exists
            $("#a-lyr" + k.toString()).remove();
            if (prepend)
                $("#toolboxLayersSortable").prepend(html);
            else
                $("#toolboxLayersSortable").append(html);
            $("#a-lyr" + k.toString() + " .tlnote").text(tlnote);
            // set font & color indicator of new layer
            $("#a-txt" + k.toString() + " .tlcontent").css("font-family", this.fontfamily);
            $("#toolboxLayersSortable").scrollTop($("#a-lyr" + this.index.toString()).position().top);
            if (this.shape == UI.SHAPE.POLYGON) {
                $("#a-txt" + k.toString() + ".square").addClass("polysquare");
            } else if (this.shape == UI.SHAPE.CUSTOM) {
                $("#a-txt" + k.toString() + ".square").addClass("customsquare");
            } else if (this.shape == UI.SHAPE.LINE) {
                $("#a-txt" + k.toString() + ".square").addClass("linesquare");
            }
            if (this.disposed > 0) {
                $("#a-lyr" + k.toString()).hide();
            }
//        this.refreshToolLayerColorIndicator();
        },
        X: function () {
            return this.xOffset;
        },
        Y: function () {
            return this.yOffset;
        },
        setX: function (x) {
            this.xOffset = x;
        },
        setY: function (y) {
            this.yOffset = y;
        },
        posX: function () {
            // get object's center x-coordinate
            return this.xOffset + this.width / 2;
        },
        posY: function () {
            // get object's center y-coordinate
            return this.yOffset + this.height / 2;
        },
        calXYFromCenter: function (cx, cy) {
            this.xOffset = cx - (this.width / 2);
            this.yOffset = cy - (this.height / 2);
        },
        rotated: function () {
            return this.rotation;
        },
        updateAbsPos: function () {
            this.absLeft = this.xOffset;
            this.absRight = this.xOffset + this.width;
            this.absTop = this.yOffset;
            this.absBottom = this.yOffset + this.height;
        },
        alignHorizontal: function (oalign, canvas_width) {
            // align layer horizontally, rotation considered
            var w = this.width;
            var origin_x = UI.edgeHandles[0]._x + (UI.edgeHandles[7]._x - UI.edgeHandles[0]._x) / 2;
            var origin_y = UI.edgeHandles[0]._y + (UI.edgeHandles[7]._y - UI.edgeHandles[0]._y) / 2;
            var rotated;
            rotated = this.rotate(UI.edgeHandles[0]._x, UI.edgeHandles[0]._y, origin_x, origin_y, this.rotation);
            var x1 = this.xOffset - rotated[0];
            rotated = this.rotate(UI.edgeHandles[2]._x, UI.edgeHandles[2]._y, origin_x, origin_y, this.rotation);
            var x2 = this.xOffset - rotated[0];
            rotated = this.rotate(UI.edgeHandles[5]._x, UI.edgeHandles[5]._y, origin_x, origin_y, this.rotation);
            var x3 = this.xOffset - rotated[0];
            rotated = this.rotate(UI.edgeHandles[7]._x, UI.edgeHandles[7]._y, origin_x, origin_y, this.rotation);
            var x4 = this.xOffset - rotated[0];
            if (oalign === "left") {
                this.xOffset = Math.max(x1, x2, x3, x4);
            } else if (oalign === "right")
                this.xOffset = canvas_width + Math.min(x1, x2, x3, x4);
            else {
                this.xOffset = (canvas_width - w) / 2;
            }
            setTimeout(function () {
                $("#txt_oalign_left, #txt_oalign_right, #txt_oalign_center").removeClass("active");
            }, 100);

        },
        alignVertical: function (voalign, canvas_height) {
            // align layer vertically, rotation considered
            var h = this.height;
            var origin_x = UI.edgeHandles[0]._x + (UI.edgeHandles[7]._x - UI.edgeHandles[0]._x) / 2;
            var origin_y = UI.edgeHandles[0]._y + (UI.edgeHandles[7]._y - UI.edgeHandles[0]._y) / 2;
            var rotated;
            rotated = this.rotate(UI.edgeHandles[0]._x, UI.edgeHandles[0]._y, origin_x, origin_y, this.rotation);
            var y1 = this.yOffset - rotated[1];
            rotated = this.rotate(UI.edgeHandles[2]._x, UI.edgeHandles[2]._y, origin_x, origin_y, this.rotation);
            var y2 = this.yOffset - rotated[1];
            rotated = this.rotate(UI.edgeHandles[5]._x, UI.edgeHandles[5]._y, origin_x, origin_y, this.rotation);
            var y3 = this.yOffset - rotated[1];
            rotated = this.rotate(UI.edgeHandles[7]._x, UI.edgeHandles[7]._y, origin_x, origin_y, this.rotation);
            var y4 = this.yOffset - rotated[1];
            if (voalign === "top") {
                this.yOffset = Math.max(y1, y2, y3, y4);
            } else if (voalign === "bottom") {
                this.yOffset = canvas_height + Math.min(y1, y2, y3, y4);
            } else {
                this.yOffset = (canvas_height - h) / 2;
            }
            setTimeout(function () {
                $("#txt_ovalign_top, #txt_ovalign_middle, #txt_ovalign_bottom").removeClass("active");
            }, 100);
        },
        applyCanvasWidth: function (canvas) {
            var deg = (this.rotation + 360) % 360;
            var makeEqualWH = (this.shape == UI.SHAPE.SQUARE || this.shape == UI.SHAPE.CIRCLE);

            if (deg % 90 !== 0)
                return;

            for (var i = 0; i <= 10; i++) {
                var dx = canvas.width - this.width;
                var dy = (makeEqualWH) ? canvas.width - this.height : 0;
                this.resizeCustomShape(dx, dy);
            }

            if (deg % 180 == 0) {
                this.width = canvas.width;
                if (makeEqualWH)
                    this.height = this.width;
            } else if (deg % 90 == 0) {
                var old_height = this.height;
                this.height = canvas.width;
                this.yOffset = this.yOffset - (canvas.width - old_height) / 2;
                if (makeEqualWH)
                    this.width = this.height;
            }
            this.refreshEdgeHandlers();
            this.alignHorizontal("left", WPImager.slides[this.slide].canvas_width);
            if (this.shape == UI.SHAPE.CURVEDTEXT || this.shape == UI.SHAPE.CUSTOM || this.shape == UI.SHAPE.LINE) {
                UI.populatePointHandlers(this.xOffset, this.yOffset, this.width, this.height, this.pathPoints);
            }
        },
        applyCanvasHeight: function (canvas) {
            var deg = (this.rotation + 360) % 360;
            var makeEqualWH = (this.shape == UI.SHAPE.SQUARE || this.shape == UI.SHAPE.CIRCLE);
            if (deg % 90 !== 0)
                return;

            for (var i = 0; i <= 10; i++) {
                var dx = (makeEqualWH) ? canvas.height - this.width : 0;
                var dy = canvas.height - this.height;
                this.resizeCustomShape(dx, dy);
            }

            if (deg % 180 == 0) {
                this.height = canvas.height;
                if (makeEqualWH)
                    this.width = this.height;
            } else if (deg % 90 == 0) {
                var old_width = this.width;
                this.width = canvas.height;
                this.xOffset = this.xOffset - (canvas.height - old_width) / 2;
                if (makeEqualWH)
                    this.height = this.width;
            }
            this.refreshEdgeHandlers();
            this.alignVertical("top", WPImager.slides[this.slide].canvas_height);
            if (this.shape == UI.SHAPE.CURVEDTEXT || this.shape == UI.SHAPE.CUSTOM || this.shape == UI.SHAPE.LINE) {
                UI.populatePointHandlers(this.xOffset, this.yOffset, this.width, this.height, this.pathPoints);
            }
        },
        selectLayer: function () {
            this.restoreLayer();
            $(".ttl,.itl,.gtl").hide();
            $("#ttl" + this.index.toString()).show();
            $("#txtconsole").show();
            this.refreshEdgeHandlers();
            this.controlUpdate();
            var is90deg = (this.rotation % 90 == 0);
            if (is90deg)
                $('#resizeTextWidth2Canvas,#resizeTextHeight2Canvas,#resizeText2Canvas').removeClass('disabled');
            else
                $('#resizeTextWidth2Canvas,#resizeTextHeight2Canvas,#resizeText2Canvas').addClass('disabled');
            $('#backinvert').prop("checked", (this.backinvert == 1));
            WPImager.refreshIconVisible();
            WPImager.refreshIconLock();
            $(".toolboxLayer,.toolboxLayer,.toolboxLayerMix,.toolFormLayer").removeClass("active multi");
            $("#lyr" + this.index.toString()).addClass("active selected");
            $("#a-lyr" + this.index.toString()).addClass("active selected");
            $("#am-lyr" + this.index.toString()).addClass("active selected");
            if ($("#fontfamily").val() == "FontAwesome")
                $('#iconpicker').show();
            else
                $('#iconpicker').hide();

            this.txtconsole_litebar();
            this.selectToolbar();

        },
        txtconsole_litebar: function () {
            $(".txtconsole_litebar").hide();
            $("#txtconsole_litebar_edit").show();
        },
        hitTest: function (x, y) {
            var hit = false;
            if (this.visible && this.disposed == 0) {
                if (this.shape == UI.SHAPE.LINE) {
                    hit = this.hitLine(-x, -y);
                } else {
                    var borderGap = this.borderPlusGap();
                    hit = this.hit(-x, -y, this.absLeft - borderGap, this.absTop - borderGap, this.absRight + borderGap, this.absBottom + borderGap, this.rotation);
                }
            }
            return hit;
        },
        hit: function (x, y, absLeft, absTop, absRight, absBottom, rotation) {
            var w = absRight - absLeft;
            var h = absBottom - absTop;
            var mx = absLeft + w / 2;
            var my = absTop + h / 2;
            // rotate x,y instead in reverse direction, check if hits the unrotated text layer
            var unrotate = this.rotate(x, y, mx, my, -rotation);
            x = unrotate[0];
            y = unrotate[1];
            return (x > absLeft
                    && x < absRight
                    && y > absTop
                    && y < absBottom);
        },
        hitLine: function (x, y) {
            var hit = false;
            var _t = this.pathPoints.split(',');
            var pathPoints = '';
            var tolerance = 5 + this.textborder;
            if (_t.length == 2) {
                var coor1 = _t[0].split(' ');
                var x1 = this.xOffset + UI.parseFloat(coor1[0]), y1 = this.yOffset + UI.parseFloat(coor1[1]);
                var coor2 = _t[1].split(' ');
                var x2 = this.xOffset + UI.parseFloat(coor2[0]), y2 = this.yOffset + UI.parseFloat(coor2[1]);
                if (Math.abs(x2 - x1) > 10 && (x < Math.min(x1, x2) || x > Math.max(x1, x2))) {
                    hit = false;
                } else if (Math.abs(y2 - y1) > 10 && (y < Math.min(y1, y2) || y > Math.max(y1, y2))) {
                    hit = false;
                } else {
                    var line = {x1: x1, y1: y1, x2: x2, y2: y2};
                    var linepoint = this.linepointNearestMouse(line, x, y);
                    var dx = x - linepoint.x;
                    var dy = y - linepoint.y;
                    var distance = Math.abs(Math.sqrt(dx * dx + dy * dy));
                    if (distance < tolerance) {
                        hit = true;
                    }
                }
            }
            return hit;
        },
        // calculate the point on the line that's 
        // nearest to the mouse position
        linepointNearestMouse: function (line, x, y) {
            //
            lerp = function (a, b, x) {
                return(a + x * (b - a));
            };
            var dx = line.x2 - line.x1;
            var dy = line.y2 - line.y1;
            var t = ((x - line.x1) * dx + (y - line.y1) * dy) / (dx * dx + dy * dy);
            var lineX = lerp(line.x1, line.x2, t);
            var lineY = lerp(line.y1, line.y2, t);
            return({x: lineX, y: lineY});
        },
        mouseClick: function () {
            if (UI.isCropping) {
                UI.isCropping = false;
            }

            $("#toolboxLayerSortable").scrollTop($("#lyr" + this.index.toString()).position().top);
            if (!this.locked) {
                UI.draggingMouse = true;
            }

            WPImager.clearMultiLayers();
            $(".toolboxLayer,.toolboxLayer,.toolFormLayer").removeClass("multi selected");

            if (!(this.shape == UI.SHAPE.CURVEDTEXT || this.shape == UI.SHAPE.CUSTOM)
                    && UI.console == UI.CNSL.SHAPETOOLBAR) {
                $('#showTextToolbar').click();
                this.selectToolbar();
            }

        },
        getActivePointCode: function () {
            var _t = this.pathPoints.split(',');
            var pathPoints = '';
            var code = 0;
            $.each(_t, function (i, el) {
                if (i == UI.activePoint) {
                    var coor = el.split(' ');
                    code = parseInt(coor[2]);
                }
            });
            return code;
        },
        setActivePointCode: function (pointcode) {

            var _t = this.pathPoints.split(',');
            var pathPoints = '';
            var nodes = this.pathPoints.split(',');

            $.each(_t, function (i, el) {
                if (i == UI.activePoint) {
                    var coor = el.split(' ');
                    var x = UI.parseFloat(coor[0]), y = UI.parseFloat(coor[1]);
                    var code = parseInt(coor[2]);
                    //   var code = ((coor.length >= 3) ? UI.parseFloat(coor[2]) : 0) % 3;
                    var xB = x - 20, yB = y;
                    var xA = x + 20, yA = y;

                    if (coor.length == 3 || code == 1 && (pointcode == 2 || pointcode == 3)) {
                        // current code is expected to be 0
                        if (pointcode == 0) {
                            pathPoints += x + ' ' + y + ' ' + pointcode.toString() + ',';
                        } else if (pointcode == 1) {
                            var iprev = (i - 1 < 0) ? nodes.length - 1 : i - 1;
                            var coor1 = nodes[iprev].split(' ');
                            var coor2 = nodes[(i + 1) % nodes.length].split(' ');
                            var x1 = UI.parseFloat(coor1[0]), y1 = UI.parseFloat(coor1[1]);
                            var x2 = UI.parseFloat(coor2[0]), y2 = UI.parseFloat(coor2[1]);
                            var gradB = (y1 - y) / (x1 - x);
                            var gradA = (y2 - y) / (x2 - x);
                            var xB, xA, yB, yA;

                            // point B
                            if (!isFinite(gradB)) {
                                yB = (y < y1) ? y + 20 : y - 20;
                                xB = x;
                            } else if (Math.abs(gradB) < 1) {
                                xB = (x < x1) ? x + 20 : x - 20;
                                yB = gradB * (xB - x) + y;
                            } else {
                                yB = (y < y1) ? y + 20 : y - 20;
                                xB = (yB - y) / gradB + x;
                            }

                            // point A
                            if (!isFinite(gradA)) {
                                yA = (y < y2) ? y + 20 : y - 20;
                                xA = x;
                            } else if (Math.abs(gradA) < 1) {
                                xA = (x < x2) ? x + 20 : x - 20;
                                yA = gradA * (xA - x) + y;
                            } else {
                                yA = (y < y2) ? y + 20 : y - 20;
                                xA = (yA - y) / gradA + x;
                            }
                            pathPoints += x + ' ' + y + ' ' + pointcode.toString() + ' ' + xB + ' ' + yB + ' ' + xA + ' ' + yA + ',';

                        } else if (pointcode == 2 || pointcode == 3) {
                            // add and generate control points 
                            var iprev = (i - 1 < 0) ? nodes.length - 1 : i - 1;
                            var coor1 = nodes[iprev].split(' ');
                            var coor2 = nodes[(i + 1) % nodes.length].split(' ');
                            var x1 = UI.parseFloat(coor1[0]), y1 = UI.parseFloat(coor1[1]);
                            var x2 = UI.parseFloat(coor2[0]), y2 = UI.parseFloat(coor2[1]);
                            var grad = (y2 - y1) / (x2 - x1);

                            var xB, xA, yB, yA;
                            if (!isFinite(grad)) {
                                yB = (y1 < y2) ? y - 20 : y + 20;
                                yA = (y1 < y2) ? y + 20 : y - 20;
                                xB = x;
                                xA = x;
                            } else if (Math.abs(grad) < 1) {
                                xB = (x1 < x2) ? x - 20 : x + 20;
                                xA = (x1 < x2) ? x + 20 : x - 20;
                                yB = grad * (xB - x) + y;
                                yA = grad * (xA - x) + y;
                            } else {
                                yB = (y1 < y2) ? y - 20 : y + 20;
                                yA = (y1 < y2) ? y + 20 : y - 20;
                                xB = (yB - y) / grad + x;
                                xA = (yA - y) / grad + x;
                            }
                            pathPoints += x + ' ' + y + ' ' + pointcode.toString() + ' ' + xB + ' ' + yB + ' ' + xA + ' ' + yA + ',';
                        }
                    } else if (coor.length == 7) {
                        xB = UI.parseFloat(coor[3]);
                        yB = UI.parseFloat(coor[4]);
                        xA = UI.parseFloat(coor[5]);
                        yA = UI.parseFloat(coor[6]);
                        if (code == 2 && pointcode == 3) {
                            var dxB = xB - x, dyB = yB - y;
                            xA = x - dxB;
                            yA = y - dyB; // symmetric                      
                        }
                        pathPoints += x + ' ' + y + ' ' + pointcode.toString() + ' ' + xB + ' ' + yB + ' ' + xA + ' ' + yA + ',';
                    }
                } else {
                    pathPoints += el + ',';
                }

            });
            this.pathPoints = pathPoints.substr(0, pathPoints.length - 1);
            UI.populatePointHandlers(this.xOffset, this.yOffset, this.width, this.height, this.pathPoints);

        },
        setActivePoint: function (point) {
            UI.activePoint = point;
        },
        addShapePoint: function (nextpoint) {

            if (UI.activePoint < 0)
                UI.activePoint = 0;
            var nodes = this.pathPoints.split(',');
            var pathPoints = "";
            for (var i = 0; i < nodes.length; i++) {
                pathPoints += nodes[i] + ',';
                if (i == UI.activePoint) {
                    var i_next = (i + nextpoint) % nodes.length;
                    i_next = (i_next >= 0) ? i_next : nodes.length - 1;
                    var coor1 = nodes[i].split(' ');
                    var coor2 = nodes[i_next].split(' ');
                    var x1 = UI.parseFloat(coor1[0]), y1 = UI.parseFloat(coor1[1]);
                    var x2 = UI.parseFloat(coor2[0]), y2 = UI.parseFloat(coor2[1]);
                    var x = (x1 + x2) / 2, y = (y1 + y2) / 2;
                    var grad = (y2 - y1) / (x2 - x1);

                    if (Math.abs(grad) < 1) {
                        var xB = x + 20, yB = grad * (xB - x) + y;
                        var xA = x - 20, yA = grad * (xA - x) + y;
                    } else {
                        var yB = y + 20, xB = (yB - y) / grad + x;
                        var yA = y - 20, xA = (yA - y) / grad + x;
                    }
                    pathPoints += x.toString() + ' ' + y.toString() + ' 0 '
                            + xB.toString() + ' ' + yB.toString() + ' ' + xA.toString() + ' ' + yA.toString() + ',';
                }
            }
            pathPoints = pathPoints.substr(0, pathPoints.length - 1);
            this.pathPoints = pathPoints;
            UI.populatePointHandlers(this.xOffset, this.yOffset, this.width, this.height, this.pathPoints);
            UI.activePoint++;
        },
        appendShapePoint: function () {
            if (UI.activePoint < 0)
                UI.activePoint = 0;
            var pathPoints = "";
            var xOffset = this.xOffset;
            var yOffset = this.yOffset;
            var x = UI.hoverX - xOffset, y = UI.hoverY - yOffset;
            if (this.pathPoints == "") {
                pathPoints += x.toString() + ' ' + y.toString() + ' 0,';
            } else {
                var nodes = this.pathPoints.split(',');

                for (var i = 0; i < nodes.length; i++) {
                    pathPoints += nodes[i] + ',';
                    if (i == nodes.length - 1) {
                        if (UI.shift_pressed) {
                            var coor = nodes[i].split(' ');
                            var dx = UI.parseFloat(coor[0]) - x;
                            var dy = UI.parseFloat(coor[1]) - y;
                            if (Math.abs(dx) > Math.abs(dy)) {
                                y = UI.parseFloat(coor[1]);
                            } else {
                                x = UI.parseFloat(coor[0]);
                            }
                        }
                        pathPoints += x.toString() + ' ' + y.toString() + ' 0,';
                    }
                }
            }
            pathPoints = pathPoints.substr(0, pathPoints.length - 1);
            this.pathPoints = pathPoints;
            UI.populatePointHandlers(this.xOffset, this.yOffset, this.width, this.height, this.pathPoints);
            UI.activePoint++;
        },
        deleteShapePoint: function () {
            if (UI.activePoint < 0)
                return;
            var nodes = this.pathPoints.split(',');
            if (nodes.length > 2) {
                var pathPoints = "";
                for (var i = 0; i < nodes.length; i++) {
                    if (i != UI.activePoint) {
                        pathPoints += nodes[i] + ',';
                    }
                }
                pathPoints = pathPoints.substr(0, pathPoints.length - 1);
                this.pathPoints = pathPoints;
                UI.populatePointHandlers(this.xOffset, this.yOffset, this.width, this.height, this.pathPoints);
                UI.activePoint--;
                if (UI.activePoint < 0)
                    UI.activePoint = 0;
                this.recalculateShapeContainer();
            }
        },
        lineCap: function () {
            if (this.linestyle.indexOf("\CAPROUND") !== -1) {
                return "round";
            }
            return "butt";
        },
        lineJoin: function () {
            if (this.linestyle.indexOf("\JOINROUND") !== -1) {
                return "round";
            } else if (this.linestyle.indexOf("\JOINBEVEL") !== -1) {
                return "bevel";
            }
            return "miter";
        },
        flipShapeH: function () {
            this.flipShape(-1, 1);
        },
        flipShapeV: function () {
            this.flipShape(1, -1);
        },
        flipShape: function (scaleX, scaleY) {
            if (!(this.shape == UI.SHAPE.CUSTOM)) {
                return;
            }
            var _t = this.pathPoints.split(',');
            var pathPoints = '';
            var shiftX = (scaleX == -1) ? this.width : 0;
            var shiftY = (scaleY == -1) ? this.height : 0;
            $.each(_t, function (i, el) {
                var coor = el.split(' ');
                var x = UI.parseFloat(coor[0]), y = UI.parseFloat(coor[1]);
                var code = parseInt(coor[2]);
                var xB = x - 20, yB = y;
                xB += shiftX;
                yB += shiftY;
                var xA = x + 20, yA = y;
                xA += shiftX;
                yA += shiftY;
                x *= scaleX;
                x += shiftX;
                y *= scaleY;
                y += shiftY;
                if (coor.length == 3) {
                    pathPoints += x + ' ' + y + ' 0,';
                } else if (coor.length == 7) {
                    xB = UI.parseFloat(coor[3]) * scaleX;
                    xB += shiftX;
                    yB = UI.parseFloat(coor[4]) * scaleY;
                    yB += shiftY;
                    xA = UI.parseFloat(coor[5]) * scaleX;
                    xA += shiftX;
                    yA = UI.parseFloat(coor[6]) * scaleY;
                    yA += shiftY;
                    pathPoints += x + ' ' + y + ' ' + code.toString() + ' ' + xB + ' ' + yB + ' ' + xA + ' ' + yA + ',';
                }
            });
            this.pathPoints = pathPoints.substr(0, pathPoints.length - 1);
            this.recalculateShapeContainer();
            UI.populatePointHandlers(this.xOffset, this.yOffset, this.width, this.height, this.pathPoints);
        },
        moveLayer: function (dx, dy) {
            this.addLayerOffset(dx, dy);
            if (this.index == WPImager.current && (this.shape == UI.SHAPE.CURVEDTEXT || this.shape == UI.SHAPE.CUSTOM || this.shape == UI.SHAPE.LINE)) {
                UI.populatePointHandlers(this.xOffset, this.yOffset, this.width, this.height, this.pathPoints);
            }
        },
        mouseHovering: function (x, y) {
            var resizeBoxArea = 12;
            if (!this.locked) {

                if (this.shape == UI.SHAPE.LINE) {
                    var w = this.width;
                    var h = this.height;
                    var mx = this.xOffset + w / 2;
                    var my = this.yOffset + h / 2;
                    var unrotate = this.rotate(-x, -y, mx, my, -this.rotation);
                    var x_unrotated = -unrotate[0];
                    var y_unrotated = -unrotate[1];

                    this.refreshEdgeHandlers(WPImager.current);
                    var _boxArea = 16;
                    var _boxAreaHalf = _boxArea / 2;
                    var expectPoint = UI.expectPoint;
                    // check for main point - expectPoint
                    for (var i = 0; i < UI.pointHandles.length; i++) {
                        var cur = UI.pointHandles[i];
                        if (-x_unrotated >= cur.x - _boxAreaHalf && -x_unrotated <= cur.x + _boxAreaHalf &&
                                -y_unrotated >= cur.y - _boxAreaHalf && -y_unrotated <= cur.y + _boxAreaHalf) {
                            UI.expectPoint = i;
//                        UI.activePoint = i;
                            WPImagerUI.draw();
                            //$("#cvs").css("cursor", 'pointer');
                            return;
                        }
                    }
                    UI.expectPoint = -1;
                    if (expectPoint != -1) {
                        WPImagerUI.draw();
                    }
                    return;
                }
                var w = this.width;
                var h = this.height;
                var mx = this.xOffset + w / 2;
                var my = this.yOffset + h / 2;
                var unrotate = this.rotate(-x, -y, mx, my, -this.rotation);
                var x_unrotated = -unrotate[0];
                var y_unrotated = -unrotate[1];

                this.refreshEdgeHandlers(WPImager.current);
                // check for resize corner hit
                for (var i = 0; i <= 8; i++) {
                    var cur = UI.edgeHandles[i];
                    if (this.shape == UI.SHAPE.POLYGON && (i == 1 || i == 3 || i == 4 || i == 6)) {
                        // skip side resize for polygons
//                        continue;
                    }
                    var _resizeBoxArea = resizeBoxArea;
                    if (i === 8)
                        _resizeBoxArea = 18;
                    if (-x_unrotated >= cur.x && -x_unrotated <= cur.x + _resizeBoxArea &&
                            -y_unrotated >= cur.y && -y_unrotated <= cur.y + _resizeBoxArea) {
                        UI.expectResize = i;
                        UI.showResizeCursor(i);
                        WPImagerUI.draw();
                        return;
                    }
                }


            }
        },
        mouseHoveringDrawPoints: function (x, y) {
            WPImagerUI.draw();
        },
        mouseHoveringEditPoints: function (x, y) {
            var w = this.width;
            var h = this.height;
            var mx = this.xOffset + w / 2;
            var my = this.yOffset + h / 2;
            var unrotate = this.rotate(-x, -y, mx, my, -this.rotation);
            var x_unrotated = -unrotate[0];
            var y_unrotated = -unrotate[1];
            // check for custom point hit
            if ((this.shape == UI.SHAPE.CURVEDTEXT && UI.console_shape == UI.CNSL.SHAPETOOLEDIT)
                    || (UI.console == UI.CNSL.SHAPETOOLBAR && UI.console_shape == UI.CNSL.SHAPETOOLEDIT
                            && (this.shape == UI.SHAPE.CUSTOM || this.shape == UI.SHAPE.LINE))) {
                var _boxArea = 16;
                var _boxAreaHalf = _boxArea / 2;
                var boolDraw = false;
                // check for control point - controlPoint
                for (var i = 0; i < UI.pointHandles.length; i++) {
                    var cur = UI.pointHandles[i];
                    if (cur.code > 0) {
                        if (-x_unrotated >= cur.xB - _boxAreaHalf && -x_unrotated <= cur.xB + _boxAreaHalf &&
                                -y_unrotated >= cur.yB - _boxAreaHalf && -y_unrotated <= cur.yB + _boxAreaHalf) {
                            if (this.shape == UI.SHAPE.CURVEDTEXT) {
                                if (i == 1) {
                                    if (UI.expectCPointB != i) {
                                        UI.expectCPointB = i;    // only end point on curvetext                         
                                        $("#cvs").css("cursor", 'pointer');
                                        WPImagerUI.draw();
                                    }
                                    return;
                                }
                            } else {
                                UI.expectCPointB = i;
                                $("#cvs").css("cursor", 'pointer');
                                return;
                            }
                            WPImagerUI.draw();
                        } else if (-x_unrotated >= cur.xA - _boxAreaHalf && -x_unrotated <= cur.xA + _boxAreaHalf &&
                                -y_unrotated >= cur.yA - _boxAreaHalf && -y_unrotated <= cur.yA + _boxAreaHalf) {
                            if (this.shape == UI.SHAPE.CURVEDTEXT) {
                                if (i == 0) {
                                    if (UI.expectCPointA != i) {
                                        UI.expectCPointA = i;    // only end point on curvetext                         
                                        $("#cvs").css("cursor", 'pointer');
                                        WPImagerUI.draw();
                                    }
                                    return;
                                }
                            } else {
                                UI.expectCPointA = i;
                                $("#cvs").css("cursor", 'pointer');
                                return;
                            }
                            WPImagerUI.draw();
                        }
                    }
                }
                if (UI.expectCPointA != -1) {
                    UI.expectCPointA = -1;
                    boolDraw = true;
                }
                if (UI.expectCPointB != -1) {
                    UI.expectCPointB = -1;
                    boolDraw = true;
                }

                // check for main point - expectPoint
                for (var i = 0; i < UI.pointHandles.length; i++) {
                    var cur = UI.pointHandles[i];
                    if (-x_unrotated >= cur.x - _boxAreaHalf && -x_unrotated <= cur.x + _boxAreaHalf &&
                            -y_unrotated >= cur.y - _boxAreaHalf && -y_unrotated <= cur.y + _boxAreaHalf) {
                        UI.expectPoint = i;
                        WPImagerUI.draw();
                        //$("#cvs").css("cursor", 'pointer');
                        return;
                    }
                }
                if (UI.expectPoint != -1) {
                    UI.expectPoint = -1;
                    boolDraw = true;
                }


                if (boolDraw)
                    WPImagerUI.draw();

                $("#cvs").css("cursor", 'default');
            }


        },
        mouseDragging: function (dx, dy) {
            if (this.shape == UI.SHAPE.LINE && UI.expectPoint >= 0
                    && (this.lineVH == 1 | this.lineVH == 2)) {
                this.addLayerOffset(dx, dy);
            } else if (this.shape == UI.SHAPE.LINE && UI.expectPoint >= 0) {
                this.mouseMovePathPoint(dx, dy, UI.expectPoint);
                this.recalculateShapeContainer();

            } else if ((this.shape == UI.SHAPE.CURVEDTEXT && UI.console_shape == UI.CNSL.SHAPETOOLEDIT)
                    || (UI.console == UI.CNSL.SHAPETOOLBAR && UI.console_shape == UI.CNSL.SHAPETOOLEDIT
                            && (this.shape == UI.SHAPE.CUSTOM || this.shape == UI.SHAPE.LINE))) {
                if (UI.expectPoint >= 0 && UI.expectPoint == UI.activePoint) {
                    var x = this.xOffset, y = this.yOffset;
                    var w = this.width, h = this.height;
                    this.mouseMovePathPoint(dx, dy, UI.expectPoint);
                    this.recalculateShapeContainer();
                    // reposition shape due to change in width/height, compensate rotation
                    var unrotate = this.rotate(this.xOffset + this.width / 2, this.yOffset + this.height / 2, x + w / 2, y + h / 2, this.rotation);
                    var x_unrotated = unrotate[0];
                    var y_unrotated = unrotate[1];
                    this.xOffset += x_unrotated - (this.xOffset + this.width / 2);
                    this.yOffset += y_unrotated - (this.yOffset + this.height / 2);

                } else if (UI.expectCPointB >= 0 || UI.expectCPointA >= 0) {
                    this.mouseMovePathPointBA(dx, dy);
                    this.recalculateShapeContainer();
                }
            } else if (UI.console == UI.CNSL.SHAPETOOLBAR && UI.console_shape == UI.CNSL.SHAPETOOLDRAW
                    && (this.shape == UI.SHAPE.CURVEDTEXT || this.shape == UI.SHAPE.CUSTOM || this.shape == UI.SHAPE.LINE)) {
                if (UI.expectCPointX >= 0) {
                    this.mouseMovePathPointX(dx, dy);
                    this.recalculateShapeContainer();
                }
            } else {
                if (UI.isResizeDrag) {
                    if (UI.expectResize >= 0 && UI.expectResize <= 8) {
                        this.mouseResizeText(dx, dy);
                    }
                } else {
                    this.addLayerOffset(dx, dy);
                }
            }
        },
        borderPlusGap: function () {
            if (this.textborder > 0 && this.textbordercolor.toLowerCase() !== "#0000ffff") {
                return this.textborder + this.bordergap;
            }
            return 0;
        },
        boundingBox: function (ctx) {
            var w = WPImager.canvas.width * 3;
            var h = WPImager.canvas.height * 3;
            var alphaThreshold = 5;
            var data = ctx.getImageData(0, 0, w, h).data;
            var x, y, minX, minY, maxY, maxY;
            o1: for (y = h; y--; )
                for (x = w; x--; )
                    if (data[(w * y + x) * 4 + 3] > alphaThreshold) {
                        maxY = y;
                        break o1
                    }
            if (!maxY)
                return;
            o2: for (x = w; x--; )
                for (y = maxY + 1; y--; )
                    if (data[(w * y + x) * 4 + 3] > alphaThreshold) {
                        maxX = x;
                        break o2
                    }
            o3: for (x = 0; x <= maxX; ++x)
                for (y = maxY + 1; y--; )
                    if (data[(w * y + x) * 4 + 3] > alphaThreshold) {
                        minX = x;
                        break o3
                    }
            o4: for (y = 0; y <= maxY; ++y)
                for (x = minX; x <= maxX; ++x)
                    if (data[(w * y + x) * 4 + 3] > alphaThreshold) {
                        minY = y;
                        break o4
                    }
            return {x: minX, y: minY, maxX: maxX, maxY: maxY, w: maxX - minX, h: maxY - minY};
        },
        setActiveLayer: function () {
            // record layer info for resize
            var activeLayerWidth = this.layerWidth();
            var activeLayerHeight = this.layerHeight();
            var activeLayerX = this.xOffset;
            var activeLayerY = this.yOffset;
            this.temp = activeLayerX.toString() + ' ' + activeLayerY.toString() + ' ' + activeLayerWidth.toString() + ' ' + activeLayerHeight.toString();
            this.temp += "|" + this.pathPoints;
        },
        addLayerOffset: function (dx, dy) {
            if (this.locked)
                return;
            this.xOffset += dx;
            this.yOffset += dy;
        },
        autoSize: function (canvas, ctx) {
            var fontSize = this.fontsize;
            var fontFamily = this.fontfamily;
            var fontWeight = this.fontweight.toString();
            // var font = (this.italic ? "italic " : "") + (this.bold ? "bold " : "") + fontSize + "px " + fontFamily.toString().replace(/\+/g, ' ').trim();
            var font = (this.italic ? "italic " : "") + fontWeight + " " + fontSize + "px " + fontFamily.toString().replace(/\+/g, ' ').trim();
            ctx.font = font;
            this.width = ctx.measureText(this.content).width;
            if (this.width > canvas.width * 0.95) {
                this.width = canvas.width * 0.95;
            }
            var wrapped = WPImagerUI.drawWrapText(ctx, this.index, this, 0, 0, 0, 0, false);
            var maxY = wrapped.y;
            this.width = wrapped.textWidthWidest;
            this.height = maxY + fontSize * 0.5;
        },
        layerWidth: function () {
            return this.width;
        },
        layerHeight: function () {
            return this.height;
        },
        spinHeight: function (height, doratio, uirefresh)
        {
            if ($("#txtHeight").spinner("isValid")) {
                var moveY = (this.height - height) / 2;
                this.yOffset += moveY; // keep Y centered      
                var txtkeepratio = doratio && $("#txtkeepratio").prop("checked");
                if (txtkeepratio) {
                    // keep ratio of width
                    var width = (this.width / this.height) * height;
                    for (var i = 0; i < 2; i++) {
                        var dx = width - this.width;
                        var dy = height - this.height;
                        this.resizeCustomShape(dx, dy);
                    }
                    var moveX = (this.width - width) / 2;
                    this.xOffset += moveX; // keep X centered
                    this.width = width; // new width
                    if (uirefresh) {
                        $("#txtWidth").spinner("value", this.width);
                    }
                } else {
                    for (var i = 0; i < 2; i++) {
                        var dx = 0;
                        var dy = height - this.height;
                        this.resizeCustomShape(dx, dy);
                    }
                }
                this.height = height; // new height
                if (this.shape == UI.SHAPE.SQUARE || this.shape == UI.SHAPE.CIRCLE) {
                    this.width = height;
                    $("#txtWidth").spinner("value", this.width);
                }

            }
        },
        spinWidth: function (width, doratio, uirefresh)
        {
            if ($("#txtWidth").spinner("isValid")) {
                var moveX = (this.width - width) / 2;
                this.xOffset += moveX; // keep X centered                   
                var txtkeepratio = doratio && $("#txtkeepratio").prop("checked");
                if (this.shape == UI.SHAPE.SQUARE || this.shape == UI.SHAPE.CIRCLE) {
                    txtkeepratio = true;
                }
                if (txtkeepratio) {
                    // keep ratio of height 
                    var height = (this.height / this.width) * width;

                    for (var i = 0; i < 2; i++) {
                        var dx = width - this.width;
                        var dy = height - this.height;
                        this.resizeCustomShape(dx, dy);
                    }
                    var moveY = (this.height - height) / 2;
                    this.yOffset += moveY; // keep Y centered
                    this.height = height; // set new height
                    if (uirefresh) {
                        // refresh height spinner
                        $("#txtHeight").spinner("value", this.height);
                    }
                } else {
                    for (var i = 0; i < 2; i++) {
                        var dx = width - this.width;
                        var dy = 0;
                        this.resizeCustomShape(dx, dy);
                    }

                }
                $("#txtRadius").spinner("value", this.width / 2);
                // set new width
                this.width = width;
                if (this.shape == UI.SHAPE.SQUARE || this.shape == UI.SHAPE.CIRCLE) {
                    this.height = width;
                    $("#txtHeight").spinner("value", this.height);
                }

            }
        },
        sizeWidthHeight: function (width, height) {
            for (var i = 0; i < 2; i++) {
                var dx = width - this.width;
                var dy = height - this.height;
                this.resizeCustomShape(dx, dy);
            }
            this.width = width;
            this.height = height;
            if (this.shape == UI.SHAPE.POLYGON) {
                this.radius = this.width / 2;
            }

            if (this.shape == UI.SHAPE.SQUARE || this.shape == UI.SHAPE.CIRCLE) {
                this.height = width;
            }
        },
        ui_refresh: function () {

        },

        mouseResizeText: function (dx, dy) {
            var resizeMinWidth = 20, resizeMinHeight = 20;
            var temp = this.temp.split("|");
            var activeLayer = temp[0].split(" ");
            var activeLayerX = UI.parseFloat(activeLayer[0]);
            var activeLayerY = UI.parseFloat(activeLayer[1]);
            var activeLayerWidth = UI.parseFloat(activeLayer[2]);
            var activeLayerHeight = UI.parseFloat(activeLayer[3]);

            var x_corner_rotated = 0;
            var y_corner_rotated = 0;
            var _rotate = [0, 0];
            if (UI.expectResize !== 8) {
                this.xOffset = activeLayerX;
                this.yOffset = activeLayerY;
                this.width = activeLayerWidth;
                this.height = activeLayerHeight;

                // record anchor points
                switch (UI.expectResize) {
                    case 0: // corner
                        _rotate = this.rotate(this.xOffset + this.width, this.yOffset + this.height, this.posX(), this.posY(), this.rotation);
                        break;
                    case 1:
                        _rotate = this.rotate(this.xOffset + this.width / 2, this.yOffset + this.height, this.posX(), this.posY(), this.rotation);
                        break;
                    case 2: // corner
                        _rotate = this.rotate(this.xOffset, this.yOffset + this.height, this.posX(), this.posY(), this.rotation);
                        break;
                    case 3:
                        _rotate = this.rotate(this.xOffset + this.width, this.yOffset + this.height / 2, this.posX(), this.posY(), this.rotation);
                        break;
                    case 4:
                        _rotate = this.rotate(this.xOffset, this.yOffset + this.height / 2, this.posX(), this.posY(), this.rotation);
                        break;
                    case 5: // corner
                        _rotate = this.rotate(this.xOffset + this.width, this.yOffset, this.posX(), this.posY(), this.rotation);
                        break;
                    case 6:
                        _rotate = this.rotate(this.xOffset + this.width / 2, this.yOffset, this.posX(), this.posY(), this.rotation);
                        break;
                    case 7:
                        _rotate = this.rotate(this.xOffset, this.yOffset, this.posX(), this.posY(), this.rotation);
                        break;

                }
                x_corner_rotated = _rotate[0];
                y_corner_rotated = _rotate[1];

                var corner_unrotate = this.rotate(UI.touchedX, UI.touchedY, this.posX(), this.posY(), -this.rotation);
                var hover_unrotate = this.rotate(UI.hoverX, UI.hoverY, this.posX(), this.posY(), -this.rotation);
                dx = hover_unrotate[0] - corner_unrotate[0];
                dy = hover_unrotate[1] - corner_unrotate[1];
            }

            var resizeCustomScaleX = 1;
            var resizeCustomScaleY = 1;

            switch (UI.expectResize) {
                case 0:
                    if (this.height - dy >= resizeMinHeight && this.width - dx >= resizeMinWidth
                            || dx < 0 && dy < 0) {
                        // resize NW 
                        this.xOffset += (UI.shift_pressed || this.shape == UI.SHAPE.POLYGON) ? 0 : dx;
                        this.yOffset += (UI.shift_pressed || this.shape == UI.SHAPE.POLYGON) ? 0 : dy;
                        this.width += -dx;
                        this.height += -dy;
//                        this.resizeCustomShape(-dx, -dy, UI.touchedPathPoints, false);
                        resizeCustomScaleX = (activeLayerWidth - dx) / activeLayerWidth;
                        resizeCustomScaleY = (activeLayerHeight - dy) / activeLayerHeight;
                        this.resizeCustomShape(-dx, -dy, resizeCustomScaleX, resizeCustomScaleY, UI.touchedPathPoints, false);
                    }
                    break;
                case 1:
                    if (this.height - dy >= resizeMinHeight || dy < 0) {
                        // resize N
                        this.yOffset += dy;
                        this.height += -dy;
//                        this.resizeCustomShape(dx, -dy, UI.touchedPathPoints, false);
                        resizeCustomScaleY = (activeLayerHeight - dy) / activeLayerHeight;
                        this.resizeCustomShape(0, -dy, resizeCustomScaleX, resizeCustomScaleY, UI.touchedPathPoints, false);
                    }
                    break;
                case 2:
                    if (this.height - dy >= resizeMinHeight && this.width + dx >= resizeMinWidth
                            || dx > 0 && dy > 0) {

                        // resize NE
                        this.yOffset += (UI.shift_pressed || this.shape == UI.SHAPE.POLYGON) ? 0 : dy;
                        this.width += dx;
                        this.height += -dy;
//                        this.resizeCustomShape(dx, -dy, UI.touchedPathPoints, false);
                        resizeCustomScaleX = (activeLayerWidth + dx) / activeLayerWidth;
                        resizeCustomScaleY = (activeLayerHeight - dy) / activeLayerHeight;
                        this.resizeCustomShape(dx, -dy, resizeCustomScaleX, resizeCustomScaleY, UI.touchedPathPoints, false);
                    }
                    break;
                case 3:
                    if (this.width - dx >= resizeMinWidth || dx < 0) {
                        // resize W
                        this.xOffset += dx;
                        this.width += -dx;
//                        this.resizeCustomShape(-dx, 0, UI.touchedPathPoints, false);
                        resizeCustomScaleX = (activeLayerWidth - dx) / activeLayerWidth;
                        this.resizeCustomShape(-dx, 0, resizeCustomScaleX, resizeCustomScaleY, UI.touchedPathPoints, false);
                    }
                    break;
                case 4:
                    if (this.width + dx >= resizeMinWidth || dx > 0) {
                        // resize E
                        this.width += dx;
//                        this.resizeCustomShape(dx, 0, UI.touchedPathPoints, false);
                        resizeCustomScaleX = (activeLayerWidth + dx) / activeLayerWidth;
                        this.resizeCustomShape(dx, 0, resizeCustomScaleX, resizeCustomScaleY, UI.touchedPathPoints, false);
                    }
                    break;
                case 5:
                    if (this.height + dy >= resizeMinHeight && this.width - dx >= resizeMinWidth
                            || dx < 0 && dy > 0) {
                        // resize SW
                        this.xOffset += (UI.shift_pressed || this.shape == UI.SHAPE.POLYGON) ? 0 : dx;
                        this.width += -dx;
                        this.height += dy;
//                        this.resizeCustomShape(-dx, dy, UI.touchedPathPoints, false);
                        resizeCustomScaleX = (activeLayerWidth - dx) / activeLayerWidth;
                        resizeCustomScaleY = (activeLayerHeight + dy) / activeLayerHeight;
                        this.resizeCustomShape(-dx, dy, resizeCustomScaleX, resizeCustomScaleY, UI.touchedPathPoints, false);
                    }
                    break;
                case 6:
                    if (this.height + dy >= resizeMinHeight || dy > 0) {
                        // resize S
                        this.height += dy;
                        resizeCustomScaleY = (activeLayerHeight + dy) / activeLayerHeight;
                        this.resizeCustomShape(0, dy, resizeCustomScaleX, resizeCustomScaleY, UI.touchedPathPoints, false);
                    }
                    break;
                case 7:
                    if (this.height + dy >= resizeMinHeight && this.width + dx >= resizeMinWidth
                            || dx > 0 && dy > 0) {
                        // resize SE
                        this.width += dx;
                        this.height += dy;
                        resizeCustomScaleX = (activeLayerWidth + dx) / activeLayerWidth;
                        resizeCustomScaleY = (activeLayerHeight + dy) / activeLayerHeight;
                        this.resizeCustomShape(dx, dy, resizeCustomScaleX, resizeCustomScaleY, UI.touchedPathPoints, false);
                    }
//                    var y_corner_rotated = _rotate[1];

                    break;
                case 8:
                    // rotate
                    //this.rotation += dx;
                    var p2 = {x: UI.hoverX, y: UI.hoverY};
                    var p1 = {x: this.xOffset + this.width / 2, y: this.yOffset + this.height / 2};
                    this.rotation = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI + 90;
                    this.rotation = this.rotation % 360;
                    var is90deg = (this.rotation % 90 == 0);
                    // allow resize to canvas width,height only when 0,90,180,270 degrees
                    if (is90deg)
                        $('#resizeTextWidth2Canvas,#resizeTextHeight2Canvas,#resizeText2Canvas').removeClass('disabled');
                    else
                        $('#resizeTextWidth2Canvas,#resizeTextHeight2Canvas,#resizeText2Canvas').addClass('disabled');
                    break;
            }

            if (this.shape == UI.SHAPE.SQUARE || this.shape == UI.SHAPE.CIRCLE) {
                if (UI.expectResize == 1 || UI.expectResize == 6) {
                    this.width = this.height;
                } else if (UI.expectResize == 3 || UI.expectResize == 4) {
                    this.height = this.width;
                } else if (this.width > this.height) {
                    this.height = this.width;
                } else {
                    this.width = this.height;
                }
            } else if (UI.shift_pressed || this.shape == UI.SHAPE.POLYGON) {
                var ratio = (this.shape == UI.SHAPE.POLYGON) ? 1 : activeLayerWidth / activeLayerHeight;
                if (UI.expectResize == 1 || UI.expectResize == 6) {
                    this.width = this.height * ratio;
                } else if (UI.expectResize == 3 || UI.expectResize == 4) {
                    this.height = this.width / ratio;
                } else if (this.width / this.height > ratio) {
                    this.height = this.width / ratio;
                } else {
                    this.width = this.height * ratio;
                }
                this.radius = this.width / 2;
            }

            if (UI.expectResize !== 8) {
                switch (UI.expectResize) {
                    case 0: // corner
                        _rotate = this.rotate(this.xOffset + this.width, this.yOffset + this.height, this.posX(), this.posY(), this.rotation);
                        break;
                    case 1:
                        _rotate = this.rotate(this.xOffset + this.width / 2, this.yOffset + this.height, this.posX(), this.posY(), this.rotation);
                        break;
                    case 2: // corner
                        _rotate = this.rotate(this.xOffset, this.yOffset + this.height, this.posX(), this.posY(), this.rotation);
                        break;
                    case 3:
                        _rotate = this.rotate(this.xOffset + this.width, this.yOffset + this.height / 2, this.posX(), this.posY(), this.rotation);
                        break;
                    case 4:
                        _rotate = this.rotate(this.xOffset, this.yOffset + this.height / 2, this.posX(), this.posY(), this.rotation);
                        break;
                    case 5: // corner
                        _rotate = this.rotate(this.xOffset + this.width, this.yOffset, this.posX(), this.posY(), this.rotation);
                        break;
                    case 6:
                        _rotate = this.rotate(this.xOffset + this.width / 2, this.yOffset, this.posX(), this.posY(), this.rotation);
                        break;
                    case 7: // corner
                        _rotate = this.rotate(this.xOffset, this.yOffset, this.posX(), this.posY(), this.rotation);
                        break;

                }

                this.xOffset += x_corner_rotated - _rotate[0];
                this.yOffset += y_corner_rotated - _rotate[1];
                this.resizeCustomShape(0, 0); // recalculate shape container and populate edges
            }
            this.controlUpdate(this.current);
        },
        resizeCustomShape: function (dx, dy, _scaleX, _scaleY, _pathPoints, recalcontainer) {
            if (!(this.shape == UI.SHAPE.CURVEDTEXT || this.shape == UI.SHAPE.CUSTOM || this.shape == UI.SHAPE.LINE)) {
                return;
            }
            if (typeof recalcontainer === "undefined") {
                recalcontainer = true;
            }
            var scaleX = (this.width + dx) / this.width;
            var scaleY = (this.height + dy) / this.height;
            var _t = this.pathPoints.split(',');
            var pathPoints = '';
            if (typeof _pathPoints !== "undefined" && _pathPoints !== "") {
                _t = _pathPoints.split(",");
//            var activeLayer = _activeLayer.split(" ");
//            var activeLayerX = UI.parseFloat(activeLayer[0]);
//            var activeLayerY = UI.parseFloat(activeLayer[1]);
//            var activeLayerWidth = UI.parseFloat(activeLayer[2]);
//            var activeLayerHeight = UI.parseFloat(activeLayer[3]);
//            scaleX = (activeLayerWidth + dx) / activeLayerWidth;
//            scaleY = (activeLayerHeight + dy) / activeLayerHeight;   
                scaleX = _scaleX;
                scaleY = _scaleY;
            }
            $.each(_t, function (i, el) {
                var coor = el.split(' ');
                var x = UI.parseFloat(coor[0]), y = UI.parseFloat(coor[1]);
                var code = parseInt(coor[2]);
                var xB = x - 20, yB = y;
                var xA = x + 20, yA = y;
                x *= scaleX;
                y *= scaleY;
                if (coor.length == 3) {
                    pathPoints += x + ' ' + y + ' 0,';
                } else if (coor.length == 7) {
                    xB = UI.parseFloat(coor[3]) * scaleX;
                    yB = UI.parseFloat(coor[4]) * scaleY;
                    xA = UI.parseFloat(coor[5]) * scaleX;
                    yA = UI.parseFloat(coor[6]) * scaleY;
                    pathPoints += x + ' ' + y + ' ' + code.toString() + ' ' + xB + ' ' + yB + ' ' + xA + ' ' + yA + ',';
                }
            });
            this.pathPoints = pathPoints.substr(0, pathPoints.length - 1);
            if (recalcontainer)
            {
                this.recalculateShapeContainer();
                UI.populatePointHandlers(this.xOffset, this.yOffset, this.width, this.height, this.pathPoints);
            }
        },
        mouseMovePathPoint: function (dx, dy) {

            var w = this.width;
            var h = this.height;
            var mx = this.xOffset + w / 2;
            var my = this.yOffset + h / 2;

            var _t = this.pathPoints.split(',');
            var self = this;
            var rotation = this.rotation;
            var points = new Array();
            var minX = 0, maxX = 0;
            var minY = 0, maxY = 0;
            var _shape = this.shape;
            $.each(_t, function (i, el) {
                var boolContinue = true;
                var coords = el.split(' ');
                for (var j = 0; j < coords.length; j++) {
                    if (isNaN(coords[j])) {
                        boolContinue = false;
                        break;
                    }
                }

                if (boolContinue) {
                    var x = UI.parseFloat(coords[0]), y = UI.parseFloat(coords[1]);
                    var pointcode = parseInt(coords[2]);
                    var xB = 0, yB = 0, xA = 20, yA = 0;
                    if (coords.length == 7) {
                        xB = UI.parseFloat(coords[3]), yB = UI.parseFloat(coords[4]);
                        xA = UI.parseFloat(coords[5]), yA = UI.parseFloat(coords[6]);
                    }
                    var unrotate = self.rotate(dx, dy, 0, 0, -rotation);
                    var dx_unrotated = unrotate[0];
                    var dy_unrotated = unrotate[1];

                    if (i == UI.expectPoint) {
                        if (UI.shift_pressed && _shape == UI.SHAPE.LINE) {
                            var coor = _t[(i > 0) ? i - 1 : _t.length - 1].split(' ');
                            dx = UI.parseFloat(coor[0]) - x;
                            dy = UI.parseFloat(coor[1]) - y;
                            if (Math.abs(dx) > Math.abs(dy)) {
                                y = UI.parseFloat(coor[1]);
                                x += dx_unrotated;
                            } else {
                                x = UI.parseFloat(coor[0]);
                                y += dy_unrotated;
                            }
                        } else {
                            x += dx_unrotated, y += dy_unrotated;
                            xB += dx_unrotated, yB += dy_unrotated;
                            xA += dx_unrotated, yA += dy_unrotated;
                        }
                    }
                    if (pointcode > 0 || coords.length == 7) {
                        points.push([x, y, pointcode, xB, yB, xA, yA]);
                    } else if (coords.length == 3) {
                        points.push([x, y, pointcode]);
                    }

                    if (i == 0) {
                        minX = x;
                        maxX = x;
                        minY = y;
                        maxY = y;
                    } else {
                        minX = (x < minX) ? x : minX;
                        maxX = (x > maxX) ? x : maxX;
                        minY = (y < minY) ? y : minY;
                        maxY = (y > maxY) ? y : maxY;
                    }
                }
            });


            var pathPoints = '';
            var offsetX = -minX;
            var offsetY = -minY;
            $.each(points, function (i, el) {
                var x = el[0], y = el[1];
                var pointcode = parseInt(el[2]) % 4;
                var xB = x + 20, yB = y, xA = x - 20, yA = y;
                x += offsetX;
                y += offsetY;
                if (el.length == 3) {
                    pathPoints += x.toString() + ' ' + y.toString() + ' 0,';
                } else if (el.length == 7) {
                    xB = UI.parseFloat(el[3]) + offsetX;
                    yB = UI.parseFloat(el[4]) + offsetY;
                    xA = UI.parseFloat(el[5]) + offsetX;
                    yA = UI.parseFloat(el[6]) + offsetY;
                    pathPoints += x.toString() + ' ' + y.toString() + ' ' + pointcode.toString()
                            + ' ' + xB.toString() + ' ' + yB.toString() + ' ' + xA.toString() + ' ' + yA.toString() + ',';
                }
            });
            pathPoints = pathPoints.substr(0, pathPoints.length - 1);
            this.pathPoints = pathPoints;
            var unrotate = this.rotate(minX, minY, 0, 0, -rotation);
            var minX_unrotated = unrotate[0];
            var minY_unrotated = unrotate[1];

            this.xOffset += minX;
            this.yOffset += minY;

            UI.populatePointHandlers(this.xOffset, this.yOffset, this.width, this.height, this.pathPoints);
            if (this.shape == UI.SHAPE.LINE) {
                var _length = this.recalculateLineLength();
                $("#lineLength").spinner("value", parseInt(_length));
            }
        },
        mouseMovePathPointBA: function (dx, dy) {

            var _t = this.pathPoints.split(',');
            var self = this;
            var rotation = this.rotation;
            var points = new Array();
            $.each(_t, function (i, el) {
                var boolContinue = true;
                var coords = el.split(' ');
                for (var j = 0; j < coords.length; j++) {
                    if (isNaN(coords[j])) {
                        boolContinue = false;
                        break;
                    }
                }

                if (boolContinue) {
                    var x = UI.parseFloat(coords[0]), y = UI.parseFloat(coords[1]);
                    var pointcode = parseInt(coords[2]);
                    var xB = x + 20, yB = y, xA = x - 20, yA = y;
                    if (coords.length == 7) {
                        xB = UI.parseFloat(coords[3]), yB = UI.parseFloat(coords[4]);
                        xA = UI.parseFloat(coords[5]), yA = UI.parseFloat(coords[6]);
                    }
                    var unrotate = self.rotate(dx, dy, 0, 0, -rotation);
                    var dx_unrotated = unrotate[0];
                    var dy_unrotated = unrotate[1];

                    if (i == UI.expectCPointB) {
                        // point B moved by user
                        xB += dx_unrotated, yB += dy_unrotated;
                        var dxB = xB - x, dyB = yB - y;
                        if (pointcode == 3) {
                            xA = x - dxB;
                            yA = y - dyB; // symmetric                   
                        } else if (pointcode == 2) {
                            // move point A
                            // line from xy to xAyA
                            var lineA_square = (x - xA) * (x - xA) + (y - yA) * (y - yA);
                            var lineB_grad = (dyB / dxB);
                            if (!isFinite(lineB_grad)) {
                                xA = x;
                            } else {
                                var dxA = Math.sqrt(lineA_square / (1 + lineB_grad * lineB_grad));
                                var dyA = dxA * lineB_grad;
                                if (x - xB >= 0) {
                                    xA = dxA + x;
                                    yA = dyA + y;
                                } else {
                                    xA = -dxA + x;
                                    yA = -dyA + y;
                                }
                            }
                        }
                        UI.activePoint = i;
                    } else if (i == UI.expectCPointA) {
                        xA += dx_unrotated, yA += dy_unrotated;
                        if (UI.console == UI.CNSL.SHAPETOOLBAR && UI.console_shape == UI.CNSL.SHAPETOOLDRAW) {
                            // 
                            var new_xA = UI.hoverX - self.xOffset, new_yA = UI.hoverY - self.yOffset;
                            if ((new_xA - x) * (new_xA - x) + (new_yA - y) * (new_yA - y) > 100) {
                                xA = new_xA;
                                yA = new_yA;
                            }
                        }

                        var dxA = xA - x, dyA = yA - y;
                        if (pointcode == 3) {
                            xB = x - dxA;
                            yB = y - dyA; // symmetric                   
                        } else if (pointcode == 2) {
                            // 
                            var lineB_square = (x - xB) * (x - xB) + (y - yB) * (y - yB);
                            var lineA_grad = (dyA / dxA);
                            if (!isFinite(lineA_grad)) {
                                xB = x;
                            } else {
                                var dxB = Math.sqrt(lineB_square / (1 + lineA_grad * lineA_grad));
                                var dyB = dxB * lineA_grad;
                                if (x - xA >= 0) {
                                    xB = dxB + x;
                                    yB = dyB + y;
                                } else {
                                    xB = -dxB + x;
                                    yB = -dyB + y;
                                }
                            }
                        }
                        UI.activePoint = i;
                    }
                    if (pointcode > 0 || coords.length == 7) {
                        points.push([x, y, pointcode, xB, yB, xA, yA]);
                    } else {
                        points.push([x, y, pointcode]);
                    }

                }
            });


            var pathPoints = '';
            $.each(points, function (i, el) {
                var x = el[0], y = el[1];
                var pointcode = parseInt(el[2]) % 4;
                var xB = 0, yB = 0, xA = 20, yA = 0;
                if (el.length == 3) {
                    pathPoints += x.toString() + ' ' + y.toString() + ' 0,';
                } else if (el.length == 7) {
                    xB = UI.parseFloat(el[3]), yB = UI.parseFloat(el[4]);
                    xA = UI.parseFloat(el[5]), yA = UI.parseFloat(el[6]);
                    pathPoints += x.toString() + ' ' + y.toString() + ' ' + pointcode.toString()
                            + ' ' + xB.toString() + ' ' + yB.toString() + ' ' + xA.toString() + ' ' + yA.toString() + ',';
                }
            });
            pathPoints = pathPoints.substr(0, pathPoints.length - 1);
            this.pathPoints = pathPoints;
            UI.populatePointHandlers(this.xOffset, this.yOffset, this.width, this.height, this.pathPoints);
        },
        mouseMovePathPointX: function (dx, dy) {
            // called right after appending a point on shape
            var _t = this.pathPoints.split(',');
            var self = this;
            var rotation = this.rotation;
            var points = new Array();
            $.each(_t, function (i, el) {
                var boolContinue = true;
                var coords = el.split(' ');
                for (var j = 0; j < coords.length; j++) {
                    if (isNaN(coords[j])) {
                        boolContinue = false;
                        break;
                    }
                }

                if (boolContinue) {
                    var x = UI.parseFloat(coords[0]), y = UI.parseFloat(coords[1]);
                    var pointcode = parseInt(coords[2]);
                    var xB = x + 20, yB = y, xA = x - 20, yA = y;
                    if (coords.length == 7) {
                        xB = UI.parseFloat(coords[3]), yB = UI.parseFloat(coords[4]);
                        xA = UI.parseFloat(coords[5]), yA = UI.parseFloat(coords[6]);
                    }
                    var unrotate = self.rotate(dx, dy, 0, 0, -rotation);
                    var dx_unrotated = unrotate[0];
                    var dy_unrotated = unrotate[1];

                    if (i == UI.expectCPointX) {
                        xA += dx_unrotated, yA += dy_unrotated;
                        if (UI.console == UI.CNSL.SHAPETOOLBAR && UI.console_shape == UI.CNSL.SHAPETOOLDRAW) {
                            // 
                            var new_xA = UI.hoverX - self.xOffset, new_yA = UI.hoverY - self.yOffset;
                            if ((new_xA - x) * (new_xA - x) + (new_yA - y) * (new_yA - y) > 100) {
                                xA = new_xA;
                                yA = new_yA;
                                pointcode = 3;
                            }
                        }

                        var dxA = xA - x, dyA = yA - y;
                        if (pointcode == 3) {
                            xB = x - dxA;
                            yB = y - dyA; // symmetric                   
                        }
                        UI.activePoint = i;
                    }

                    if (pointcode > 0 || coords.length == 7) {
                        points.push([x, y, pointcode, xB, yB, xA, yA]);
                    } else {
                        points.push([x, y, pointcode]);
                    }
                }
            });


            var pathPoints = '';
            $.each(points, function (i, el) {
                var x = el[0], y = el[1];
                var pointcode = parseInt(el[2]) % 4;
                var xB = 0, yB = 0, xA = 20, yA = 0;
                if (el.length == 3) {
                    pathPoints += x.toString() + ' ' + y.toString() + ' 0,';
                } else if (el.length == 7) {
                    xB = UI.parseFloat(el[3]), yB = UI.parseFloat(el[4]);
                    xA = UI.parseFloat(el[5]), yA = UI.parseFloat(el[6]);
                    pathPoints += x.toString() + ' ' + y.toString() + ' ' + pointcode.toString()
                            + ' ' + xB.toString() + ' ' + yB.toString() + ' ' + xA.toString() + ' ' + yA.toString() + ',';
                }
            });
            pathPoints = pathPoints.substr(0, pathPoints.length - 1);
            this.pathPoints = pathPoints;
            UI.populatePointHandlers(this.xOffset, this.yOffset, this.width, this.height, this.pathPoints);
        },
        recalculateShapeContainer: function () {

            var BGCanvas3X = document.getElementById('BGCanvas3X');
            var cW = WPImager.canvas.width;
            var cH = WPImager.canvas.height;
            BGCanvas3X.width = cW * 3;
            BGCanvas3X.height = cH * 3;
            var BGCtx3X = BGCanvas3X.getContext('2d');
            BGCtx3X.fillStyle = "#000000";
            BGCtx3X.lineWidth = this.textborder * 2;
            BGCtx3X.strokeStyle = this.textbordercolor;
            BGCtx3X.fillStyle = this.textbordercolor;
            BGCtx3X.translate(this.xOffset + cW, this.yOffset + cH);
            WPImagerUI.customShape(BGCtx3X, 0, 0, this.width, this.height, this, false, true);
            BGCtx3X.translate(-this.xOffset - cW, -this.yOffset - cH);
            var box = this.boundingBox(BGCtx3X);
            if (!box)
                return;
            this.width = Math.max(box.w, 10);
            this.height = Math.max(box.h, 10);
            var offsetX = this.xOffset - (box.x - cW);
            var offsetY = this.yOffset - (box.y - cH);
            this.xOffset = box.x - cW;
            this.yOffset = box.y - cH;
            this.absLeft = this.xOffset, this.absTop = this.yOffset;
            this.absRight = this.absLeft + this.width, this.absBottom = this.absTop + this.height;
            var pathPoints = "";
            var _t = this.pathPoints.split(',');

            $.each(_t, function (i, element) {
                var el = element.split(' ');
                for (var i = 0; i < el.length; i++) {
                    if (isNaN(el[i]))
                        continue;
                }
                var x = UI.parseFloat(el[0]), y = UI.parseFloat(el[1]);
                var pointcode = parseInt(el[2]) % 4;
                var xB = 0, yB = 0, xA = 0, yA = 0;
                x += offsetX, y += offsetY;
                if (el.length == 3) {
                    pathPoints += x.toString() + ' ' + y.toString() + ' 0,';
                } else if (el.length == 7) {
                    xB = UI.parseFloat(el[3]), yB = UI.parseFloat(el[4]);
                    xA = UI.parseFloat(el[5]), yA = UI.parseFloat(el[6]);
                    xB += offsetX, yB += offsetY;
                    xA += offsetX, yA += offsetY;
                    pathPoints += x.toString() + ' ' + y.toString() + ' ' + pointcode.toString()
                            + ' ' + xB.toString() + ' ' + yB.toString() + ' ' + xA.toString() + ' ' + yA.toString() + ',';
                }
            });
            pathPoints = pathPoints.substr(0, pathPoints.length - 1);
            this.pathPoints = pathPoints;
        },
        selectToolbar: function () {

            $("#toolImage, #toolImageSelector, #imgconsole_task, .cvsconsole").css("display", "none");
            $("#txtconsole_task .btn-tab").show();
            $("#showQRConsole,#showCOMConsole").hide();


            if (this.shape == UI.SHAPE.POLYGON) {
                $("#texttoolbar,#spantxtHeight,#spantxtWidth,#spantxtKeepratio").hide();
                $("#txtconsole_task, #spantxtRadius").show();
            } else {
                $("#txtconsole_task,#texttoolbar,#spantxtHeight,#spantxtWidth,#spantxtKeepratio").show();
                $("#spantxtRadius").hide();
                if (this.shape == UI.SHAPE.LINE) {
                    $("#showTextToolbar").hide();
                }
            }

            $("#showPolygonConsole").css("display", this.shape == UI.SHAPE.POLYGON ? "inline-block" : "none");
            $("#showShapeEditConsole").css("display", (this.shape == UI.SHAPE.CUSTOM) ? "inline-block" : "none");
            $("#showCurveTextConsole").css("display", (this.shape == UI.SHAPE.CURVEDTEXT) ? "inline-block" : "none");
//            $("#showTextLineStyle").css("display", (this.shape == UI.SHAPE.CURVEDTEXT || this.shape == UI.SHAPE.CUSTOM || this.shape == UI.SHAPE.LINE) ? "inline-block" : "none");
            $("#showTextOutlineConsole,#showTextCircularConsole,#showTextShadowConsole,#showTextPositionConsole")
                    .css("display", (!(this.shape == UI.SHAPE.CUSTOM || this.shape == UI.SHAPE.BACKGROUND || this.shape == UI.SHAPE.LINE)) ? "inline-block" : "none");
            $("#showTextBorderConsole").html((this.shape == UI.SHAPE.CUSTOM || this.shape == UI.SHAPE.LINE) ? '<span class="fa fa-minus"></span> Line</button>' : '<span class="fa fa-square-o"></span> Border</button>');
            //     $("#showTextRotateConsole").css("display", (this.shape == UI.SHAPE.CUSTOM || this.shape == UI.SHAPE.LINE) ? "none":"inline-block");
            $("#showLineConsole").css("display", (this.shape == UI.SHAPE.LINE) ? "inline-block" : "none");

            if (this.shape == UI.SHAPE.RECTANGLE) {
                $("#btnBaseShapeTxt").html('<span class="fa fa-square-o stretch"></span>');
            } else if (this.shape == UI.SHAPE.SQUARE) {
                $("#btnBaseShapeTxt").html('<span class="fa fa-square-o"></span>');
            } else if (this.shape == UI.SHAPE.CIRCLE) {
                $("#btnBaseShapeTxt").html('<span class="fa fa-circle-thin"></span>');
            } else if (this.shape == UI.SHAPE.ELLIPSE) {
                $("#btnBaseShapeTxt").html('<span class="fa fa-circle-thin stretch"></span>');
            } else if (this.shape == UI.SHAPE.TRAPEZOID) {
                $("#btnBaseShapeTxt").html('<span class="fa fa-square-o trapezoid"></span>');
            } else if (this.shape == UI.SHAPE.PARALLELOGRAM) {
                $("#btnBaseShapeTxt").html('<span class="fa fa fa-square-o skewed"></span>');
            } else if (this.shape == UI.SHAPE.RIBBON) {
                $("#btnBaseShapeTxt").html('<span class="fa fa fa-bookmark-o rotate90"></span>');
            }

            if (this.shape == UI.SHAPE.SQUARE || this.shape == UI.SHAPE.CIRCLE) {
                $("#spantxtKeepratio").hide();
            } else {
                $("#spantxtKeepratio").show();
            }

            if (this.shape == UI.SHAPE.CURVEDTEXT) {
                $("#showTextCircularConsole,#showTextBgControls,#showTextLineStyle").hide();
            }
            $("#btnBaseShapeTxt").css("display", (this.shape == UI.SHAPE.CURVEDTEXT || this.shape == UI.SHAPE.POLYGON || this.shape == UI.SHAPE.CUSTOM || this.shape == UI.SHAPE.LINE) ? "none" : "inline-block");

//            if (this.shape == UI.SHAPE.LINE) {
//                UI.console = UI.CNSL.LINETOOLBAR;
//            } else if (this.shape == UI.SHAPE.CUSTOM) {
//                UI.console = UI.CNSL.SHAPETOOLBAR;
//            } else if (this.shape == UI.SHAPE.CURVEDTEXT) {
//                UI.console = UI.CNSL.TXTCURVED;
//            } else if (this.shape == UI.SHAPE.POLYGON) {
//                UI.console = UI.CNSL.POLYGONTOOLBAR;
//            } else if (this.shape == UI.SHAPE.BACKGROUND) {
//                UI.console = UI.CNSL.BACKGROUNDTOOLBAR;
//            } else if (UI.console == UI.CNSL.LINETOOLBAR && this.shape != UI.SHAPE.LINE) {
//                UI.console = UI.CNSL.TXTTOOLBAR;
//            }

            // select text tab as default when switching to from line or shape
//            if ((UI.console == UI.CNSL.LINETOOLBAR || UI.console == UI.CNSL.SHAPETOOLBAR)
//                    && (!(this.shape == UI.SHAPE.BACKGROUND || this.shape == UI.SHAPE.LINE || this.shape == UI.SHAPE.CUSTOM))) {
//                UI.console = UI.CNSL.TXTTOOLBAR;
//            }

            $("#showTextBorderConsole").toggle(this.shape !== UI.SHAPE.CURVEDTEXT);
            $("#showTextShadowFillConsole").toggle(this.shape !== UI.SHAPE.CURVEDTEXT);
            $("#spanTextAngle").toggle(this.shape !== UI.SHAPE.CURVEDTEXT);
            if (this.shape == UI.SHAPE.LINE) {
                $("#showTextBorderConsole,#showTextBgControls,#showTextRotateConsole").hide();
            }
            if (this.shape == UI.SHAPE.CUSTOM) {
                if (this.content.length > 0) {
                    $("#showTextShadowConsole,#showTextOutlineConsole,#showTextPositionConsole").show();
                }
            }
            if (this.shape == UI.SHAPE.BACKGROUND) {
                $("#showTextBgControls").html('<span class="fa fa-font"></span> Background');
                $("#showTextBgControls").after($("#showTextBorderConsole"));
                $("#showTextToolbar,#showTextBorderConsole,#showTextShadowFillConsole,#showTextRotateConsole,#showTextLineStyle").hide();
            } else {
                $("#showTextBgControls").html('<span class="fa fa-font"></span> Fill');
            }
            if (this.shape == UI.SHAPE.CURVEDTEXT) {
                $("#showTextPositionConsole").hide();
            }
        },
        controlUpdate: function () {
            // update controls to reflect layer values
            $("#txtWidth").spinner("value", this.width);
            $("#txtHeight").spinner("value", this.height);
            $("#alphaText").spinner("value", this.alpha);
            $("#alphaBack").spinner("value", this.backalpha);
            $("#radiusText").spinner("value", this.textradius);
            $("#spacingText").spinner("value", this.textspacing);
            $("#spacingText2").spinner("value", this.textspacing);
            $("#rotateText").spinner("value", this.rotation);
            $("#outlineText").spinner("value", this.textoutline);
            $('#outlinecolorText').colorichpicker({color: this.textoutlinecolor});
            $("#borderGap").spinner("value", this.bordergap);
            $("#borderText").spinner("value", this.textborder);
            $("#borderText2").spinner("value", this.textborder);
            $("#borderTextDash").spinner("value", 10);
            $("#borderTextSpace").spinner("value", 10);
            var borderdash = this.textborderdash.split(" ");
            $('#borderTextStyle').val("solid");
            if (borderdash.length == 4) {
                $('#borderTextStyle').val(borderdash[0] == 0 ? "solid" : "dashed");
                if (borderdash[0] == 2) {
                    $('#borderTextStyle').val("dashedgap");
                }
                $("#borderTextDash").spinner("value", borderdash[1]);
                $("#borderTextSpace").spinner("value", borderdash[2]);
                $("#borderTextDashset").spinner("value", borderdash[3]);
            }

            var enabledash = ($('#borderTextStyle').val() == "dashed" || $('#borderTextStyle').val() == "dashedgap");
            $("#borderTextDash").spinner({"disabled": !enabledash});
            $("#borderTextSpace").spinner({"disabled": !enabledash});
            $("#borderTextDashset").spinner({"disabled": !enabledash});

            var enablegap = this.textborder > 0;
            $("#borderGap").spinner({"disabled": !enablegap});

            $('#bordergapcolor').colorichpicker({color: this.bordergapcolor});
            $('#bordercolorText').colorichpicker({color: this.textbordercolor});
            $('#bordercolorText2').colorichpicker({color: this.textbordercolor});
            $("#shadowText").spinner("value", this.textshadow);
            $("#shadowTextFill").spinner("value", this.textshadowfill);
            $('#shadowcolorText').colorichpicker({color: this.textshadowcolor});
            $("#shadowOxText").spinner("value", this.textshadowOx);
            $("#shadowOyText").spinner("value", this.textshadowOy);
            $('#shadowcolorTextFill').colorichpicker({color: this.textshadowfillcolor});
            $("#shadowOxTextFill").spinner("value", this.textshadowfillOx);
            $("#shadowOyTextFill").spinner("value", this.textshadowfillOy);
            $("#shadow").spinner("value", this.textshadow);
            $('#textPadding').spinner("value", this.padding);
            $('#xFine').spinner("value", this.xFine);
            $('#yFine').spinner("value", this.yFine);
            $("#polygonSides").spinner("value", this.polysides);
            $("#polygonSpokeRatio").spinner("value", this.polyspokeratio);
            $("#textAngle").spinner("value", this.textangle);
            $("#circAngle").spinner("value", this.circangle);
            $("#circRadAdj").spinner("value", this.circradadj);
            $("#txtRadius").spinner("value", this.radius);
            $("#txtGrow").spinner("value", this.textgrow);
            $("#txtAngle1").spinner("value", this.textangle1);
            $("#txtAngle2").spinner("value", this.textangle2);

            $('#shadowTextOn').css('display', (this.textshadowOn ? "inline-block" : "none"));
            $('#shadowTextOff').css('display', (!this.textshadowOn ? "inline-block" : "none"));
            if (this.textshadowOn) {
                $("#shadowText,#shadowcolorText,#shadowOxText,#shadowOyText").removeClass("disabled");
            } else {
                $("#shadowText,#shadowcolorText,#shadowOxText,#shadowOyText").addClass("disabled");
            }
            $('#shadowTextFillOn').css('display', (this.textshadowfillOn ? "inline-block" : "none"));
            $('#shadowTextFillOff').css('display', (!this.textshadowfillOn ? "inline-block" : "none"));
            if (this.textshadowfillOn) {
                $("#shadowTextFill,#shadowcolorTextFill,#shadowOxTextFill,#shadowOyTextFill").removeClass("disabled");
            } else {
                $("#shadowTextFill,#shadowcolorTextFill,#shadowOxTextFill,#shadowOyTextFill").addClass("disabled");
            }
            $('#pathClosedOn').css('display', (this.pathClosed ? "inline-block" : "none"));
            $('#pathClosedOff').css('display', (!this.pathClosed ? "inline-block" : "none"));
            $('#circTextOn').css('display', (this.circOn ? "inline-block" : "none"));
            $('#circTextOff').css('display', (!this.circOn ? "inline-block" : "none"));
            $('#uprightTextOn').css('display', (this.textupright ? "inline-block" : "none"));
            $('#uprightTextOff').css('display', (!this.textupright ? "inline-block" : "none"));
            $("#curvedtexttoolbar .txtGrowDir").removeClass("activ");
            $("#txtGrowLeft").toggleClass("activ", this.growdir == 0);
            $("#txtGrowRight").toggleClass("activ", this.growdir == 1);
            $("#txtGrowCenter").toggleClass("activ", this.growdir == 2);
            $("#shape_mode_edit,#shape_mode_move").removeClass("active");
            if (this.shape == UI.SHAPE.LINE) {
                var _length = this.recalculateLineLength();
                $("#lineLength").spinner("value", parseInt(_length));
                $("#line_keep_horizontal").toggleClass("activ", this.lineVH == 2);
                $("#line_keep_vertical").toggleClass("activ", this.lineVH == 1);
            }

            if (this.shape == UI.SHAPE.CUSTOM) {
                if (UI.console_shape == UI.CNSL.SHAPETOOLEDIT) {
                    $('#mode_edit_controls button, #mode_edit_controls label').removeClass("disabled");
                } else {
                    $('#mode_edit_controls button, #mode_edit_controls label').addClass("disabled");
                }
            }

            $('#lineCap,[id^="linestyle_arrow"]').toggle(this.shape == UI.SHAPE.CUSTOM || this.shape == UI.SHAPE.LINE);
            $('#lineJoin').toggle(this.shape == UI.SHAPE.CUSTOM);
            if (this.linestyle.indexOf("\JOINROUND") !== -1) {
                $("#lineJoin").text("Round Join");
            } else if (this.linestyle.indexOf("\\JOINBEVEL") !== -1) {
                $("#lineJoin").text("Bevel Join");
            } else {
                $("#lineJoin").text("Miter Join");
            }
            $("#lineCap").toggleClass("activ", (this.linestyle.indexOf("\CAPROUND") !== -1));

            $("#spanRadiusText").toggle(
                    !(this.shape == UI.SHAPE.LINE
                            || this.shape == UI.SHAPE.CUSTOM
                            || this.shape == UI.SHAPE.TRAPEZOID
                            || this.shape == UI.SHAPE.RIBBON
                            || this.shape == UI.SHAPE.CURVEDTEXT
                            || this.shape == UI.SHAPE.PARALLELOGRAM)
                    );

            $("#radiusText").spinner({disabled: (this.shape == UI.SHAPE.CIRCLE || this.shape == UI.SHAPE.ELLIPSE)});
            $("#spanBorderGap").toggle(
                    !(this.shape == UI.SHAPE.CUSTOM
                            || this.shape == UI.SHAPE.LINE)
                    );
            $("#borderTextStyle_DashedGap").show();


        },
        setLineVH: function (VH) {
            if (this.shape !== UI.SHAPE.LINE)
                return;
            this.lineVH = (this.lineVH == VH) ? 0 : VH;
            $("#line_keep_vertical").toggleClass("activ", this.lineVH == 1);
            $("#line_keep_horizontal").toggleClass("activ", this.lineVH == 2);
            if (this.lineVH == 1 | this.lineVH == 2) {
                var nodes = this.pathPoints.split(',');
                if (nodes.length == 2) {
                    var pt0 = nodes[0].split(' ');
                    var pt1 = nodes[nodes.length - 1].split(' ');

                    if (pt0.length >= 2 && pt1.length >= 2) {
                        var pt0x = parseFloat(pt0[0]),
                                pt0y = parseFloat(pt0[1]),
                                pt1x = parseFloat(pt1[0]),
                                pt1y = parseFloat(pt1[1]);
                        var _len = this.recalculateLineLength();
                        var _cx = (pt0x + pt1x) / 2;
                        var _cy = (pt0y + pt1y) / 2;
                        var x0 = _cx, y0 = _cy;
                        var x1 = _cx, y1 = _cy;
                        if (this.lineVH == 1) {
                            y0 -= _len / 2;
                            y1 += _len / 2;
                        } else if (this.lineVH == 2) {
                            x0 -= _len / 2;
                            x1 += _len / 2;
                        }
                        this.pathPoints = x0.toString() + ' ' + y0.toString() + ' 0,';
                        this.pathPoints += x1.toString() + ' ' + y1.toString() + ' 0';

                        // recalculateShapeContainer
                        this.width = (this.lineVH == 1) ? this.textborder : _len;
                        this.height = (this.lineVH == 2) ? this.textborder : _len;
                        var box_x = this.xOffset + Math.min(x0, x1);
                        var box_y = this.yOffset + Math.min(y0, y1);
                        var offsetX = this.xOffset - box_x;
                        var offsetY = this.yOffset - box_y;
                        this.xOffset = box_x;
                        this.yOffset = box_y;


                        this.absLeft = this.xOffset, this.absTop = this.yOffset;
                        this.absRight = this.absLeft + this.width, this.absBottom = this.absTop + this.height;
                        var pathPoints = "";
                        var _t = this.pathPoints.split(',');

                        $.each(_t, function (i, element) {
                            var el = element.split(' ');
                            for (var i = 0; i < el.length; i++) {
                                if (isNaN(el[i]))
                                    continue;
                            }
                            var x = UI.parseFloat(el[0]), y = UI.parseFloat(el[1]);
                            x += offsetX, y += offsetY;
                            if (el.length == 3) {
                                pathPoints += UI.parseFloat(x).toString() + ' ' + UI.parseFloat(y).toString() + ' 0,';
                            }
                        });
                        pathPoints = pathPoints.substr(0, pathPoints.length - 1);
                        this.pathPoints = pathPoints;

                    }
                }

            }
        },
        resizeLineLength: function (length) {
            if (this.shape !== UI.SHAPE.LINE)
                return;
            var nodes = this.pathPoints.split(',');
            if (nodes.length == 2) {
                var pt0 = nodes[0].split(' ');
                var pt1 = nodes[nodes.length - 1].split(' ');

                if (pt0.length >= 2 && pt1.length >= 2) {
                    var pt0x = parseFloat(pt0[0]),
                            pt0y = parseFloat(pt0[1]),
                            pt1x = parseFloat(pt1[0]),
                            pt1y = parseFloat(pt1[1]);
                    // var _len = this.recalculateLineLength();
                    var _cx = (pt0x + pt1x) / 2;
                    var _cy = (pt0y + pt1y) / 2;
                    var _w = (pt1x - pt0x);
                    var _h = (pt1y - pt0y);
                    var rad = Math.atan(_h / _w);
                    var h = Math.sin(rad) * length;
                    var w = Math.cos(rad) * length;
                    var x0 = _cx - w / 2, y0 = _cy - h / 2;
                    var x1 = _cx + w / 2, y1 = _cy + h / 2;
                    this.pathPoints = x0.toString() + ' ' + y0.toString() + ' 0,';
                    this.pathPoints += x1.toString() + ' ' + y1.toString() + ' 0';
                }
            }
            this.recalculateShapeContainer();
        },
        recalculateLineLength: function () {
            if (this.shape !== UI.SHAPE.LINE)
                return;
            var nodes = this.pathPoints.split(',');
            var _length = 0;
            if (nodes.length == 2) {
                var pt0 = nodes[0].split(' ');
                var pt1 = nodes[nodes.length - 1].split(' ');

                if (pt0.length >= 2 && pt1.length >= 2) {
                    var pt0x = parseInt(pt0[0]),
                            pt0y = parseInt(pt0[1]),
                            pt1x = parseInt(pt1[0]),
                            pt1y = parseInt(pt1[1]);
                    _length = Math.sqrt((pt1x - pt0x) * (pt1x - pt0x) + (pt1y - pt0y) * (pt1y - pt0y));
                }
            }
            return _length;
        },
        restoreLayer: function () {
            UI.isUndoRedoing = true;
            input.value = this.content;
            $('#fontsize').val(this.fontsize);
            $('#fontsize3').val(this.fontsize);
            $('#fontfamily').val(this.fontfamily);
            $('#lineheight').val(this.lineheight);
            $('#fontcolor,#fontcolor3').val(this.fontcolor);
            $('#fontcolor,#fontcolor3').colorichpicker({color: this.fontcolor});
            $('#backcolor').val(this.backcolor);
            $('#backcolor').colorichpicker({color: this.backcolor});
            $('#lbl_curr_layer').text(this.order.toString());
            $("#align_" + this.align).prop("checked", true);
            $("#valign_" + this.valign).prop("checked", true);
            $("#txt_align_left, #txt_align_right, #txt_align_center").removeClass("active");
            $("#txt_align_" + this.align).addClass("active");
            $("#txt_valign_top, #txt_valign_bottom, #txt_valign_middle").removeClass("active");
            $("#txt_valign_" + this.valign).addClass("active");
            $("#txt_polyspoke_off, #txt_polyspoke_on").removeClass("active");
            $("#txt_polyspoke_" + (this.polyspoke ? "on" : "off")).addClass("active");
            if (this.polyspoke) {
                $("#polygonSpokeRatio").removeClass("disabled");
            } else {
                $("#polygonSpokeRatio").addClass("disabled");
            }
            var align = this.align;
            if (this.bold) {
                $('#bold').addClass("active");
            } else {
                $('#bold').removeClass("active");
            }
            if (this.italic) {
                $('#italic').addClass("active");
            } else {
                $('#italic').removeClass("active");
            }

            $("#txt" + this.index.toString() + " .tlcontent").html(this.content);
            $("#tlc" + this.index.toString()).css("background-color", this.fontcolor);
            $("#tlcb" + this.index.toString()).css("background-color", this.backcolor);
            $("#lyr" + this.index.toString() + " .tlnote").text(this.layernote);

            this.controlUpdate();
            $("#fontfamily").trigger("change", this.fontfamily, this.fontsrctype);
            UI.isUndoRedoing = false;
        },
        /*
        refreshToolLayerColorIndicator: function () {
            k = this.index;
            // set bacground color indicator on tool layers
            var tlc = "#tlc" + k.toString();
            var tlcb = "#tlcb" + k.toString();
            var tlg = "#tlg" + k.toString();

            $(tlc + "," + tlcb + "," + tlg).hide();
            if (this.backcoloroption == "color") {
                var fontcolor = (this.fontcolor.toLowerCase() == "#0000ffff") ? "transparent" : this.fontcolor;
                var backcolor = (this.backcolor.toLowerCase() == "#0000ffff") ? "transparent" : this.backcolor;
                $(tlc).css("background-color", fontcolor);
                $(tlcb).css("background-color", backcolor);
                $(tlc + "," + tlcb).show();
            } else if (this.backcoloroption == "linear" || this.backcoloroption == "radial") {
                var toolboxLayerCanvas = document.getElementById("tlg" + k.toString());
                var _context = toolboxLayerCanvas.getContext('2d');
                var gradient = _context.createLinearGradient(0, 0, 32, 0);
                var backgradient = (this.backgradient.length > 0) ? this.backgradient : "0% " + this.backcolor;

                var points = new Array();
                points = WPImagerUI.getGradientFromString(backgradient);
                $.each(points, function (i, el) {
                    if (!isNaN(parseInt(el[0])))
                    {
                        var color = el[1];
                        if (color.toLowerCase() == "#0000ffff")
                            color = "transparent";
                        gradient.addColorStop(parseInt(el[0]) / 100, color);
                    }
                });
                _context.clearRect(0, 0, 40, 10);
                _context.fillStyle = gradient;
                _context.fillRect(0, 0, 40, 10);
                $(tlg).removeClass("rounded");
                if (this.backcoloroption == "radial") {
                    $(tlg).addClass("rounded");
                }
                $(tlg).show();
            }

        }, */
        refreshFontColorCanvas: function () {
            if (this.fontcoloroption == "linear") {
                var gradientcanvas = document.getElementById("fontcolorcanvas");
                gradientcanvas.width = 100;
                gradientcanvas.height = 30;
                var _context = gradientcanvas.getContext('2d');
                var gradient = _context.createLinearGradient(0, 0, 100, 0);
                var fontgradient = (this.fontgradient.length > 0) ? this.fontgradient : "0% " + this.fontcolor;

                var points = new Array();
                points = WPImagerUI.getGradientFromString(fontgradient);
                $.each(points, function (i, el) {
                    if (!isNaN(parseInt(el[0])))
                    {
                        var color = el[1];
                        if (color.toLowerCase() == "#0000ffff")
                            color = "transparent";
                        gradient.addColorStop(parseInt(el[0]) / 100, color);
                    }
                });
                _context.clearRect(0, 0, gradientcanvas.width, gradientcanvas.height);
                _context.fillStyle = gradient;
                _context.fillRect(0, 0, gradientcanvas.width, gradientcanvas.height);
            }

        },
        refreshEdgeHandlers: function () {
            var borderGap = this.borderPlusGap();
            var borderGap2 = borderGap * 2;
            
            // calculate edge handles position for resize mouse hover hit test             
            UI.populateEdgeHandlers(this.xOffset - borderGap, this.yOffset - borderGap, this.width + borderGap2, this.height + borderGap2);
            if (this.shape == UI.SHAPE.CURVEDTEXT || this.shape == UI.SHAPE.CUSTOM || this.shape == UI.SHAPE.LINE) {
                UI.populatePointHandlers(this.xOffset, this.yOffset, this.width, this.height, this.pathPoints);
            }
        },
        setLayerTextParm: function (varname, value) {
            this[varname] = value;
            if (varname == "fontcolor") {
                var fontcolor = (this.fontcolor.toLowerCase() == "#0000ffff") ? "transparent" : this.fontcolor;
                $("#tlc" + this.index.toString()).css("background-color", fontcolor);
            } else if (varname == "backcolor") {
                var backcolor = (this.backcolor.toLowerCase() == "#0000ffff") ? "transparent" : this.backcolor;
                $("#tlcb" + this.index.toString()).css("background-color", backcolor);

            }

        },
        multiSelect: function () {
            // select layer on Layers toolbox
            $("#lyr" + this.index.toString()).addClass("multi selected");
        },
        multiDeSelect: function () {
            // deselect layer on Layers toolbox
            $("#lyr" + this.index.toString()).removeClass("multi selected");
        },
        rotate: function (x, y, xm, ym, a) {
            var cos = Math.cos,
                    sin = Math.sin,
                    a = a * Math.PI / 180, // Convert to radians 

                    // Subtract midpoints, so that midpoint is translated to origin
                    // and add it in the end again
                    xr = (x - xm) * cos(a) - (y - ym) * sin(a) + xm,
                    yr = (x - xm) * sin(a) + (y - ym) * cos(a) + ym;
            return [xr, yr];
        },
        getval: function (val, defaultval) {
            if (typeof val === "undefined") {
                return defaultval;
            } else {
                if (Number(val) === val && val % 1 !== 0) {
                    val = UI.parseFloat(val);
                }
            }
            return val;
        }
    };

})(jQuery);

