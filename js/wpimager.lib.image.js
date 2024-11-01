/*!
 WPImager 1.0.0    
 Layer Image Object
 https://wpimager.com/
 2018 WPImager  
 */

/**
 * LayerImage Object
 * Contains methods and properties to create, define and handle image object layers on the canvas
 */

function LayerImage(slide, index) {
    this.slide = slide;
    this.index = index;
    this.code = 1;
    this.name = "Image";
    this.setval(0); // set default values  
}

function LayerUnknown(slide, index) {
    this.slide = slide;
    this.index = index;
    this.code = -1;
    this.name = "Unknown";
    this.setval(0); // set default values  
}

(function ($) {
    LayerUnknown.prototype = {
        setval: function (cloudlayer) {
            this.slide = this.getval(cloudlayer.slide, WPImager.slide);
            this.order = this.getval(cloudlayer.order, 1);
            this.layernote = this.getval(cloudlayer.layernote, "");
            this.absLeft = this.getval(cloudlayer.absLeft, 0);
            this.absRight = this.getval(cloudlayer.absRight, 0);
            this.absTop = this.getval(cloudlayer.absTop, 0);
            this.absBottom = this.getval(cloudlayer.absBottom, 0);
            this.zplock = this.getval(cloudlayer.zplock, false);
            this.locked = this.getval(cloudlayer.locked, false);
            this.visible = this.getval(cloudlayer.visible, true);
            this.disposed = this.getval(cloudlayer.disposed, 0);
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
            var k = this.index;
            if (typeof layerIndex === "undefined")
                layerIndex = k;
            this.temp = layerIndex;
            var tlnote = (this.layernote.length > 0) ? this.layernote : "Layer #" + k.toString();
            if (this.layernote.length == 0) {
                this.layernote = tlnote;
            }
            var content = this.name;
            // add to the top or bottom of Layers Toolbox
            var html = '<div class="toolboxLayer toolboxLayerUnknown" id="lyr' + k.toString() + '" data-order="' + layerIndex.toString() + '" data-var-index="' + k.toString() + '"><button id="btn-layer-visible-' + k.toString() + '" class="btn-layer-visible"><span class="fa fa-eye"></span></button><div class="sorthandle"><span class="fa fa-sort"></span></div><div class="square bg" id="txt' + k.toString() + '"><div class="content"><div class="table"><div class="table-cell"><span class="fa fa-eye-slash icon-hidehide"></span><span class="fa fa-lock icon-hidehide"></span></div></div></div><div class="tl"><div class="tleditnote"></div><div class="tlnote"></div><div class="tlcontent">' + content + '</div></div></div><div class="ttl" id="ttl' + k.toString() + '"></div></div>';
            // remove layer if exists
            $("#lyr" + k.toString()).remove();
            if (prepend)
                $("#toolboxLayerSortable").prepend(html);
            else
                $("#toolboxLayerSortable").append(html);
            $("#lyr" + k.toString() + " .tlnote").text(tlnote);
            // set font & color indicator of new layer
            $("#toolboxLayerSortable").scrollTop($("#lyr" + this.index.toString()).position().top);
//        if (this.shape == UI.SHAPE.POLYGON) {
//            $("#txt" + k.toString() + ".square").addClass("polysquare");
//        } else if (this.shape == UI.SHAPE.CUSTOM) {
//            $("#txt" + k.toString() + ".square").addClass("customsquare");
//        } else if (this.shape == UI.SHAPE.LINE) {
//            $("#txt" + k.toString() + ".square").addClass("linesquare");
//        }
            if (this.disposed > 0) {
                $("#lyr" + k.toString()).hide();
            }
        },
        selectLayer: function () {
            $(".ttl,.itl,.gtl").hide();
            $("#ttl" + this.index.toString()).show();
            $("#txtconsole").show();
            WPImager.refreshIconVisible();
            WPImager.refreshIconLock();
            $(".toolboxLayer,.toolboxLayer,.toolboxLayerMix,.toolFormLayer").removeClass("active multi");
            $("#lyr" + this.index.toString()).addClass("active selected");
            $("#a-lyr" + this.index.toString()).addClass("active selected");
            $("#am-lyr" + this.index.toString()).addClass("active selected");
            $("#txtconsole_task,#imgconsole_task,#editLayerNote,#editActionNote").hide();
            $("#txtconsole,#imgconsole,.cvsconsole").hide();
            $("#showNilConsole").text("Unknown Object");
            $("#nilconsole").text("Please upgrade to the latest WPImager version");
            $("#nilconsole_task").show();
            $('#showNilConsole').click();

        },
        mouseClick: function () {

        },
        mouseHovering: function (x, y) {

        },
        hitTest: function (x, y) {
            var hit = false;
            return hit;
        },
        posX: function () {

        },
        posY: function () {

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

    LayerImage.prototype = {
        setval: function (cloudlayer) {
            this.slide = this.getval(cloudlayer.slide, WPImager.slide);
            this.order = this.getval(cloudlayer.order, 1);
            this.layernote = this.getval(cloudlayer.layernote, "");
            this.src = this.getval(cloudlayer.src, "");
            this.flagresize = false;
            this.imgx = this.getval(cloudlayer.imgx, 0);
            this.imgy = this.getval(cloudlayer.imgy, 0);
            this.imgwidth = this.getval(cloudlayer.imgwidth, 0);
            this.imgheight = this.getval(cloudlayer.imgheight, 0);
            this.imgwidth_ori = this.getval(cloudlayer.imgwidth_ori, 0);
            this.imgheight_ori = this.getval(cloudlayer.imgheight_ori, 0);
            this.imgcrop_x = this.getval(cloudlayer.imgcrop_x, 0);
            this.imgcrop_y = this.getval(cloudlayer.imgcrop_y, 0);
            this.imgcrop_h = this.getval(cloudlayer.imgcrop_h, 0);
            this.imgcrop_w = this.getval(cloudlayer.imgcrop_w, 0);
            this.imgrotation = this.getval(cloudlayer.imgrotation, 0);
            this.imgradius = this.getval(cloudlayer.imgradius, 0);
            this.imgshape = this.getval(cloudlayer.imgshape, 0);
            this.imgskewA = this.getval(cloudlayer.imgskewA, 0);
            this.imgskewB = this.getval(cloudlayer.imgskewB, 0);
            this.imgskewP = this.getval(cloudlayer.imgskewP, 0);
            this.imgskewDir = this.getval(cloudlayer.imgskewDir, 1);
            this.imgborder = this.getval(cloudlayer.imgborder, 0);
            this.imgbordercolor = this.getval(cloudlayer.imgbordercolor, "#ffffff");
            this.imgblur = this.getval(cloudlayer.imgblur, 0);
            this.imgshadow = this.getval(cloudlayer.imgshadow, 0);
            this.imgshadowOn = this.getval(cloudlayer.imgshadowOn, false);
            this.imgshadowOx = this.getval(cloudlayer.imgshadowOx, 0);
            this.imgshadowOy = this.getval(cloudlayer.imgshadowOx, 0);
            this.imgshadowcolor = this.getval(cloudlayer.imgshadowcolor, "#000000");
            this.absLeft = this.getval(cloudlayer.absLeft, 0);
            this.absRight = this.getval(cloudlayer.absRight, 0);
            this.absTop = this.getval(cloudlayer.absTop, 0);
            this.absBottom = this.getval(cloudlayer.absBottom, 0);
            this.imgalpha = this.getval(cloudlayer.imgalpha, 100);
            this.zplock = this.getval(cloudlayer.zplock, false);
            this.locked = this.getval(cloudlayer.locked, false);
            this.visible = this.getval(cloudlayer.visible, true);
            this.disposed = this.getval(cloudlayer.disposed, 0);
        },
        createToolLayer: function (layerIndex, prepend) {
            var k = this.index;
            this.temp = layerIndex;
            var src = "";
            var progBar = '<div id="progressWrap' + k.toString() + '" class="progress-uploading"><div id="progressOuter' + k.toString() + '" class="progress progress-striped active"><div id="progressBar' + k.toString() + '" class="progress-bar progress-bar-success" style="width: 0%"></div></div></div>';
            var tlnote = (this.layernote.length > 0) ? this.layernote : "Layer #" + k.toString();
            if (this.layernote.length == 0) {
                this.layernote = tlnote;
            }

            var html = '<div class="toolboxLayer toolboxLayerImage" id="lyr' + k.toString() + '" data-order="' + layerIndex.toString() + '" data-var-index="' + k.toString() + '"><button id="btn-layer-visible-' + k.toString() + '" class="btn-layer-visible"><span class="fa fa-eye"></span></button><div class="sorthandle"><span class="fa fa-sort"></span></div>' + progBar + '<div class="square bg" id="img' + k.toString() + '"><div class="label-template"><i class="fa fa-paw"></i></div><div class="content"><div class="table"><div class="table-cell"><span class="fa fa-eye-slash icon-hidehide"></span><span class="fa fa-lock icon-hidehide"></span></div></div></div><div class="tl"><div class="tlnote"></div></div></div><div class="itl" id="itl' + k.toString() + '"><button class="btn btn-xs btn-link editLayerNote"><span class="fa fa-pencil"></span></button></div></div>';

            $("#lyr" + k.toString()).remove();
            if (prepend)
                $("#toolboxLayerSortable").prepend(html);
            else
                $("#toolboxLayerSortable").append(html);

            $("#lyr" + k.toString() + " .tlnote").text(tlnote);

            if (typeof this.src !== "" && this.src.length > 0) {
                src = this.src;
                $("#img" + k.toString()).css("background-image", "url('" + src + "')");
            }
            $("#img" + k.toString()).css("background-repeat", "no-repeat"); //.css("background-position", "center");
            $("#toolboxLayerSortable").scrollTop($("#lyr" + this.index.toString()).position().top);
            if (this.disposed > 0) {
                $("#lyr" + k.toString()).hide();
            }
        },
        createtoolboxLayer: function (layerIndex, prepend) {
            var uid = layerIndex;
            var k = this.index;
            this.temp = layerIndex;
            var src = "";
            var tlnote = (this.layernote.length > 0) ? this.layernote : "Layer #" + k.toString();
            if (this.layernote.length == 0) {
                this.layernote = tlnote;
            }
            var html = '<div class="toolboxLayer toolboxLayerImage" id="a-lyr' + k.toString() + '" data-uid="' + uid.toString() + '" data-order="' + layerIndex.toString() + '" data-var-index="' + k.toString() + '"><button id="btn-layer-visible-' + k.toString() + '" class="btn-layer-visible pull-right"><span class="fa fa-eye"></span></button><div class="sorthandle"><span class="fa fa-sort"></span></div><div class="square bg" id="a-img' + k.toString() + '">x<div class="content"><div class="table"><div class="table-cell"><span class="fa fa-eye-slash icon-hidehide"></span><span class="fa fa-lock icon-hidehide"></span></div></div></div><div class="tl"><div class="tlnote"></div></div></div><div class="itl" id="a-itl' + k.toString() + '"><button class="btn btn-xs btn-link editLayerNote"><span class="fa fa-pencil"></span></button></div></div>';

            $("#a-lyr" + k.toString()).remove();
            if (prepend)
                $("#toolboxLayersSortable").prepend(html);
            else
                $("#toolboxLayersSortable").append(html);

            $("#a-lyr" + k.toString() + " .tlnote").text(tlnote);

            if (typeof this.src !== "" && this.src.length > 0) {
                src = this.src;
                $("#a-img" + k.toString()).css("background-image", "url('" + src + "')");
            }
            $("#a-img" + k.toString()).css("background-repeat", "no-repeat"); //.css("background-position", "center");
            $("#toolboxLayersSortable").scrollTop($("#a-lyr" + this.index.toString()).position().top);
            if (this.disposed > 0) {
                $("#a-lyr" + k.toString()).hide();
            }
        },
        X: function () {
            return this.imgx;
        },
        Y: function () {
            return this.imgy;
        },
        setX: function (x) {
            this.imgx = x;
        },
        setY: function (y) {
            this.imgy = y;
        },
        posX: function () {

            if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                var w = this.imgwidth; // thisimg.width;
                var shiftX = (w / 2);
                var moveX = 0;
            } else {
                var scaleX = this.imgwidth / this.imgwidth_ori;
                moveX = this.imgcrop_x * scaleX;
                shiftX = this.imgcrop_w * scaleX / 2;
            }
            return this.imgx + moveX + shiftX;

        },
        posY: function () {
            if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                var h = this.imgheight; // thisimg.height;
                var shiftY = (h / 2);
                var moveY = 0;
            } else if (this.imgcrop_w !== 0 && this.imgcrop_h !== 0) {
                var scaleY = this.imgheight / this.imgheight_ori;
                moveY = this.imgcrop_y * scaleY;
                shiftY = this.imgcrop_h * scaleY / 2;
            }
            return this.imgy + moveY + shiftY;

        },
        calXYFromCenter: function (cx, cy) {
            var shiftX, moveX, shiftY, moveY;
            if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                var w = this.imgwidth; // thisimg.width;
                var h = this.imgheight; // thisimg.height;
                shiftX = (w / 2);
                moveX = 0;
                shiftY = (h / 2);
                moveY = 0;
            } else {
                var scaleX = this.imgwidth / this.imgwidth_ori;
                var scaleY = this.imgheight / this.imgheight_ori;
                moveX = this.imgcrop_x * scaleX;
                shiftX = this.imgcrop_w * scaleX / 2;
                moveY = this.imgcrop_y * scaleY;
                shiftY = this.imgcrop_h * scaleY / 2;
            }
            this.imgx = cx - (moveX + shiftX);
            this.imgy = cy - (moveY + shiftY);
        },
        rotated: function () {
            return this.imgrotation;
        },
        updateAbsPos: function () {
            this.absLeft = this.imgx;
            this.absRight = this.imgx + this.imgwidth;
            this.absTop = this.imgy;
            this.absBottom = this.imgy + this.imgheight;

        },
        addImageOffset: function (dx, dy) {
            if (this.locked)
                return;
            this.imgx += dx;
            this.imgy += dy;
        },
        layerWidth: function () {
            if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                return this.imgwidth;
            } else {
                var scaleX = this.imgcrop_w / this.imgwidth_ori;
                return this.imgwidth * scaleX;
            }
        },
        calCropWidth: function (layerWidth) {
            return layerWidth * (this.imgwidth_ori / this.imgwidth);
        },
        layerImgWidth: function (layerWidth) {
            if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                return layerWidth;
            } else {
                return layerWidth * (this.imgwidth_ori / this.imgcrop_w);
            }
        },
        layerHeight: function () {
            if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                return this.imgheight;
            } else {
                var scaleY = this.imgcrop_h / this.imgheight_ori;
                return this.imgheight * scaleY;
            }
        },
        calCropHeight: function (layerHeight) {
            return layerHeight * (this.imgheight_ori / this.imgheight);
        },
        layerImgHeight: function (layerHeight) {
            if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                return layerHeight;
            } else {
                return layerHeight * (this.imgheight_ori / this.imgcrop_h);
            }
        },
        spinHeight: function (height, doratio, uirefresh) {
            var width;
            var imgkeepratio = doratio && $("#imgkeepratio").prop("checked");
            if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                if (imgkeepratio) {
                    width = (height / this.imgheight) * this.imgwidth;
                    var moveX = (this.imgwidth - width) / 2;
                    this.imgx += moveX; // keep X centered
                    this.imgwidth = width;
                }

                var moveY = (this.imgheight - height) / 2;
                this.imgy += moveY; // keep Y centered
                this.imgheight = height;
                if (this.imgshape == UI.SHAPE.SQUARE || this.imgshape == UI.SHAPE.CIRCLE) {
                    this.imgwidth = height;
                }
            } else {
                var old_height = this.imgheight;
                var old_width = this.imgwidth;
                var scaleY = this.imgheight_ori / this.imgcrop_h;
                var new_height = height * scaleY;
                var scaleY2 = this.imgheight / this.imgheight_ori;
                var old_origin_y = this.imgcrop_y * scaleY2 + this.imgcrop_h * scaleY2 / 2;

                this.imgheight = new_height;
                scaleY2 = this.imgheight / this.imgheight_ori;
                var new_origin_y = this.imgcrop_y * scaleY2 + this.imgcrop_h * scaleY2 / 2;
                this.imgy -= (new_origin_y - old_origin_y);

                if (this.imgshape == UI.SHAPE.SQUARE || this.imgshape == UI.SHAPE.CIRCLE) {
                    imgkeepratio = true;
                }

                if (imgkeepratio) {
                    var scaleX2 = this.imgwidth / this.imgwidth_ori;
                    var old_origin_x = this.imgcrop_x * scaleX2 + this.imgcrop_w * scaleX2 / 2;
                    var new_width = (new_height / old_height) * old_width;
                    this.imgwidth = new_width;
                    scaleX2 = this.imgwidth / this.imgwidth_ori;
                    var new_origin_x = this.imgcrop_x * scaleX2 + this.imgcrop_w * scaleX2 / 2;
                    this.imgx -= (new_origin_x - old_origin_x);
                    if (UI.isCropping) {
                        UI.cropBox.x += (new_origin_x - old_origin_x);
                    }
                }
                if (UI.isCropping) {
                    UI.cropBox.y += (new_origin_y - old_origin_y);
                }
            }
            if (uirefresh && imgkeepratio) {
                // update spinner
                if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                    $("#imageWidth").spinner("value", this.imgwidth);
                } else {
                    var scaleX = this.imgwidth / this.imgwidth_ori;
                    $("#imageWidth").spinner("value", this.imgcrop_w * scaleX);
                }
            }
            this.ui_skew_refresh();
        },
        sizeWidthHeight: function (width, height) {
            if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                this.imgwidth = width;
                this.imgheight = height;
                if (this.imgshape == UI.SHAPE.SQUARE || this.imgshape == UI.SHAPE.CIRCLE) {
                    this.imgheight = width;
                }
            } else {
                var scaleY = this.imgheight_ori / this.imgcrop_h;
                var new_height = height * scaleY;
                this.imgheight = new_height;

                var scaleX = this.imgwidth_ori / this.imgcrop_w;
                var new_width = width * scaleX;
                this.imgwidth = new_width;

                if (this.imgshape == UI.SHAPE.SQUARE || this.imgshape == UI.SHAPE.CIRCLE) {
                    this.imgheight = width;
                }

            }
        },
        spinWidth: function (width, doratio, uirefresh) {
            var height;
            var imgkeepratio = doratio && $("#imgkeepratio").prop("checked");
            if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                if (imgkeepratio) {
                    height = (width / this.imgwidth) * this.imgheight;
                    var moveY = (this.imgheight - height) / 2;
                    this.imgy += moveY; // keep Y centered
                    this.imgheight = height;
                }

                var moveX = (this.imgwidth - width) / 2;
                this.imgx += moveX; // keep X centered
                this.imgwidth = width;
                if (this.imgshape == UI.SHAPE.SQUARE || this.imgshape == UI.SHAPE.CIRCLE) {
                    this.imgheight = width;
                }
            } else {
                var old_height = this.imgheight;
                var old_width = this.imgwidth;
                var scaleX = this.imgwidth_ori / this.imgcrop_w;
                var new_width = width * scaleX;
                var scaleX2 = this.imgwidth / this.imgwidth_ori;
                var old_origin_x = this.imgcrop_x * scaleX2 + this.imgcrop_w * scaleX2 / 2;
                this.imgwidth = new_width;
                scaleX2 = this.imgwidth / this.imgwidth_ori;
                var new_origin_x = this.imgcrop_x * scaleX2 + this.imgcrop_w * scaleX2 / 2;
                this.imgx -= (new_origin_x - old_origin_x);

                if (this.imgshape == UI.SHAPE.SQUARE || this.imgshape == UI.SHAPE.CIRCLE) {
                    imgkeepratio = true;
                }

                if (imgkeepratio) {
                    var scaleY2 = this.imgheight / this.imgheight_ori;
                    var old_origin_y = this.imgcrop_y * scaleY2 + this.imgcrop_h * scaleY2 / 2;
                    var new_height = (new_width / old_width) * old_height;
                    this.imgheight = new_height;
                    scaleY2 = this.imgheight / this.imgheight_ori;
                    var new_origin_y = this.imgcrop_y * scaleY2 + this.imgcrop_h * scaleY2 / 2;
                    this.imgy -= (new_origin_y - old_origin_y);
                    if (UI.isCropping) {
                        UI.cropBox.y += (new_origin_y - old_origin_y);
                    }
                }
                if (UI.isCropping) {
                    UI.cropBox.x += (new_origin_x - old_origin_x);
                }

            }

            if (uirefresh && imgkeepratio) {
                // update spinner
                if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                    $("#imageHeight").spinner("value", this.imgheight);
                } else {
                    var scaleY = this.imgheight / this.imgheight_ori;
                    $("#imageHeight").spinner("value", this.imgcrop_h * scaleY);
                }
            }
            this.ui_skew_refresh();
        },
        ui_refresh: function () {
            // update spinner
            if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                $("#imageWidth").spinner("value", this.imgwidth);
                $("#imageHeight").spinner("value", this.imgheight);
            } else {
                var scaleX = this.imgwidth / this.imgwidth_ori;
                var scaleY = this.imgheight / this.imgheight_ori;
                $("#imageWidth").spinner("value", this.imgcrop_w * scaleX);
                $("#imageHeight").spinner("value", this.imgcrop_h * scaleY);
            }
        },
        ui_skew_refresh: function () {
            if (UI.console == UI.CNSL.IMGSKEW
                    && (this.imgshape == UI.SHAPE.PARALLELOGRAM || this.imgshape == UI.SHAPE.TRAPEZOID)) {
                $('#showSkewImageConsole').click(); // recalculate spinner skew values                    
            }
        },
        alignHorizontal: function (oalign, canvas_width) {
            var w = this.imgwidth;
            var scaleX = this.imgwidth / this.imgwidth_ori;
            var origin_x = UI.edgeHandles[0]._x + (UI.edgeHandles[7]._x - UI.edgeHandles[0]._x) / 2;
            var origin_y = UI.edgeHandles[0]._y + (UI.edgeHandles[7]._y - UI.edgeHandles[0]._y) / 2;
            var rotated;
            rotated = this.rotate(UI.edgeHandles[0]._x, UI.edgeHandles[0]._y, origin_x, origin_y, this.imgrotation);
            var x1 = -this.imgcrop_x * scaleX + (this.imgx + this.imgcrop_x * scaleX - rotated[0]);
            rotated = this.rotate(UI.edgeHandles[2]._x, UI.edgeHandles[2]._y, origin_x, origin_y, this.imgrotation);
            var x2 = -this.imgcrop_x * scaleX + (this.imgx + this.imgcrop_x * scaleX - rotated[0]);
            rotated = this.rotate(UI.edgeHandles[5]._x, UI.edgeHandles[5]._y, origin_x, origin_y, this.imgrotation);
            var x3 = -this.imgcrop_x * scaleX + (this.imgx + this.imgcrop_x * scaleX - rotated[0]);
            rotated = this.rotate(UI.edgeHandles[7]._x, UI.edgeHandles[7]._y, origin_x, origin_y, this.imgrotation);
            var x4 = -this.imgcrop_x * scaleX + (this.imgx + this.imgcrop_x * scaleX - rotated[0]);
            if (oalign === "left") {
                this.imgx = Math.max(x1, x2, x3, x4);
            } else if (oalign === "right")
                this.imgx = canvas_width + Math.min(x1, x2, x3, x4);
            else {
                if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                    this.imgx = (canvas_width - w) / 2;
                } else {

                    this.imgx = canvas_width / 2 - this.imgcrop_x * scaleX - this.imgcrop_w * scaleX / 2;
                }
            }
            setTimeout(function () {
                $("#img_oalign_left, #img_oalign_right, #img_oalign_center").removeClass("active");
            }, 100);
        },
        alignVertical: function (voalign, canvas_height) {
            var shiftY = 0;
            var h = this.imgheight;
            var scaleY = this.imgheight / this.imgheight_ori;
            var origin_x = UI.edgeHandles[0]._x + (UI.edgeHandles[7]._x - UI.edgeHandles[0]._x) / 2;
            var origin_y = UI.edgeHandles[0]._y + (UI.edgeHandles[7]._y - UI.edgeHandles[0]._y) / 2;
            var rotated;
            rotated = this.rotate(UI.edgeHandles[0]._x, UI.edgeHandles[0]._y, origin_x, origin_y, this.imgrotation);
            var y1 = -this.imgcrop_y * scaleY + (this.imgy + this.imgcrop_y * scaleY - rotated[1]);
            rotated = this.rotate(UI.edgeHandles[2]._x, UI.edgeHandles[2]._y, origin_x, origin_y, this.imgrotation);
            var y2 = -this.imgcrop_y * scaleY + (this.imgy + this.imgcrop_y * scaleY - rotated[1]);
            rotated = this.rotate(UI.edgeHandles[5]._x, UI.edgeHandles[5]._y, origin_x, origin_y, this.imgrotation);
            var y3 = -this.imgcrop_y * scaleY + (this.imgy + this.imgcrop_y * scaleY - rotated[1]);
            rotated = this.rotate(UI.edgeHandles[7]._x, UI.edgeHandles[7]._y, origin_x, origin_y, this.imgrotation);
            var y4 = -this.imgcrop_y * scaleY + (this.imgy + this.imgcrop_y * scaleY - rotated[1]);
            if (voalign === "top") {
                this.imgy = Math.max(y1, y2, y3, y4);
            } else if (voalign === "bottom") {
                this.imgy = canvas_height + Math.min(y1, y2, y3, y4);
            } else {
                if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                    this.imgy = (canvas_height - h) / 2 + shiftY;
                } else {
                    this.imgy = canvas_height / 2 - this.imgcrop_y * scaleY - this.imgcrop_h * scaleY / 2;
                }
            }
            setTimeout(function () {
                $("#img_ovalign_top, #img_ovalign_middle, #img_ovalign_bottom").removeClass("active");
            }, 100);
        },
        applyCanvasWidth: function (canvas) {
            var deg = (this.imgrotation + 360) % 360;
            var makeEqualWH = (this.imgshape == UI.SHAPE.SQUARE || this.imgshape == UI.SHAPE.CIRCLE);

            if (deg % 90 !== 0)
                return;
            if (deg % 180 == 0) {
                if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                    this.imgwidth = canvas.width;
                } else {
                    this.imgwidth = (canvas.width * this.imgwidth_ori) / this.imgcrop_w;
                }
                if (makeEqualWH)
                    this.imgheight = this.imgwidth;
            } else if (deg % 90 == 0) {
                if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                    this.imgheight = canvas.width;
                } else {
                    var scaleY = this.imgheight / this.imgheight_ori;
                    var old_height = this.imgcrop_h * scaleY;
                    var old_offset = this.imgcrop_y * scaleY;
                    this.imgheight = (canvas.width * this.imgheight_ori) / this.imgcrop_h;
                    scaleY = this.imgheight / this.imgheight_ori;
                    var new_offset = this.imgcrop_y * scaleY;
                    this.imgy = this.imgy - (canvas.width - old_height) / 2 - (new_offset - old_offset);
                }
                if (makeEqualWH)
                    this.imgwidth = (canvas.width * this.imgwidth_ori) / this.imgcrop_w;
            }
        },
        applyCanvasHeight: function (canvas) {
            var deg = (this.imgrotation + 360) % 360;
            var makeEqualWH = (this.imgshape == UI.SHAPE.SQUARE || this.imgshape == UI.SHAPE.CIRCLE);
            if (deg % 90 !== 0)
                return;
            if (deg % 180 == 0) {
                if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                    this.imgheight = canvas.height;
                } else {
                    this.imgheight = (canvas.height * this.imgheight_ori) / this.imgcrop_h;
                }
                if (makeEqualWH)
                    this.imgwidth = this.imgheight;
            } else if (deg % 90 == 0) {
                if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                    this.imgwidth = canvas.height;
                } else {
                    var scaleX = this.imgwidth / this.imgwidth_ori;
                    var old_width = this.imgcrop_w * scaleX;
                    var old_offset = this.imgcrop_x * scaleX;
                    this.imgwidth = (canvas.height * this.imgwidth_ori) / this.imgcrop_w;
                    scaleX = this.imgwidth / this.imgwidth_ori;
                    var new_offset = this.imgcrop_x * scaleX;
                    this.imgx = this.imgx - (canvas.height - old_width) / 2 - (new_offset - old_offset);
                }
                if (makeEqualWH)
                    this.imgheight = (canvas.height * this.imgheight_ori) / this.imgcrop_h;
            }
        },
        mouseClick: function () {
            if (UI.isCropping) {
                WPImagerUI.resize_image(WPImager.current);
                $(".cvsconsole").hide();
                $("#imgconsole").show();
                UI.isCropping = false;
            }

            // new layer selected
            $("#bigsquare").css("background-color", "#333333");
            $("#bigsquare").css("background-image", "url('" + this.src + "')");
            $("#toolboxLayerSortable").scrollTop($("#lyr" + this.index.toString()).position().top);
            if (!this.locked) {
                UI.draggingMouse = true;
            }


            $(".toolboxLayer,.toolboxLayer,.toolFormLayer").removeClass("multi selected");
        },
        setActiveLayer: function () {
            // record layer info for resize
            var activeLayerWidth = this.imgwidth;
            var activeLayerHeight = this.imgheight;
            var activeLayerX = this.imgx;
            var activeLayerY = this.imgy;
            if (UI.isRecropDrag) {
                activeLayerWidth = UI.cropBox.width;
                activeLayerHeight = UI.cropBox.height;
                activeLayerX = UI.cropBox.x;
                activeLayerY = UI.cropBox.y;
            }
            this.temp = activeLayerX.toString() + ' ' + activeLayerY.toString() + ' ' + activeLayerWidth.toString() + ' ' + activeLayerHeight.toString();
            this.temp += "|" + this.pathPoints;
        },
        moveLayer: function (dx, dy) {
            this.addImageOffset(dx, dy);
        },
        mouseHovering: function (x, y) {
            if (!this.locked) {

                var w = this.absRight - this.absLeft;
                var h = this.absBottom - this.absTop;
                var mx = this.absLeft + w / 2;
                var my = this.absTop + h / 2;
                var unrotate = this.rotate(-x, -y, mx, my, -this.imgrotation);
                var x_unrotated = -unrotate[0];
                var y_unrotated = -unrotate[1];
                var borderGap = this.borderPlusGap();
                var borderGap2 = borderGap * 2;
                
                if (UI.isCropping) {
                    x_unrotated = x;
                    y_unrotated = y;
                    UI.populateEdgeHandlers(this.imgx + UI.cropBox.x - borderGap, this.imgy + UI.cropBox.y - borderGap, UI.cropBox.width + borderGap2, UI.cropBox.height + borderGap2);
                } else {
                    this.refreshEdgeHandlers();
                }
                // check for resize corner hit
                for (var i = 0; i <= 9; i++) {
                    // 0  1  2
                    // 3  8  4
                    // 5  6  7

                    var cur = UI.edgeHandles[i];
                    var _resizeBoxArea = 12;
                    if (i === 8)
                        _resizeBoxArea = 18;
                    if (i === 9)
                        _resizeBoxArea = 32;
                    if (-x_unrotated >= cur.x && -x_unrotated <= cur.x + _resizeBoxArea &&
                            -y_unrotated >= cur.y && -y_unrotated <= cur.y + _resizeBoxArea) {
                        if (UI.isCropping) // && i !== 8) 
                        {
                            if (i !== 8) {
                                UI.expectRecrop = i;
                            }
                        } else {
                            if (i !== 9) {
                                UI.expectResize = i;
                            }
                        }
                        UI.showResizeCursor(i);
                        WPImagerUI.draw();
                        if (UI.expectResize === 8) {
                            return;
                        }
                        if (UI.expectRecrop === 8) {
                            return;
                        }
                    }
                }
            }
        },
        mouseDragging: function (dx, dy) {
            var resizeImage = false;
            if (UI.isResizeDrag) {
                if (UI.expectResize >= 0 && UI.expectResize <= 8) {
                    this.mouseResizeImage(dx, dy);
                    resizeImage = true;
                }
            } else if (UI.isRecropDrag && UI.expectRecrop == 9) {
                // reposition crop
                this.mouseRecropImageAdjust(dx, dy);
            } else if (UI.isRecropDrag) {
                if (UI.expectRecrop >= 0 && UI.expectRecrop <= 7) {
                    this.mouseRecropImage(dx, dy);
                    resizeImage = true;
                }
            } else if (UI.isCropping) {
                // reposition image
                this.mouseDragCropImage(dx, dy);
                WPImagerUI.resize_image(this.index);
            } else {
                this.addImageOffset(dx, dy);
            }

            if (resizeImage) {
                var thisimg = WPImagerUI.img[this.index];
                var imgdraw = WPImager.layer[this.index];
                thisimg.width = imgdraw.imgwidth;
                thisimg.height = imgdraw.imgheight;
                if (UI.expectResize >= 0 && UI.expectResize < 8 || UI.expectRecrop >= 0 && UI.expectRecrop < 8) {
                    WPImagerUI.resize_image(this.index);
                }
            }
        },
        mouseResizeImage: function (dx, dy) {
            var resizeMinWidth = 20, resizeMinHeight = 20;
            var isCropped = (this.imgcrop_h > 0 && this.imgcrop_w > 0);
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
                this.imgx = activeLayerX;
                this.imgy = activeLayerY;
                this.imgwidth = activeLayerWidth;
                this.imgheight = activeLayerHeight;
                // record anchor points
                if (isCropped) {
                    var scaleX = this.imgwidth / this.imgwidth_ori;
                    var scaleY = this.imgheight / this.imgheight_ori;
                    var crop_x = this.imgcrop_x * scaleX;
                    var crop_y = this.imgcrop_y * scaleY;
                    var crop_w = this.imgcrop_w * scaleX;
                    var crop_h = this.imgcrop_h * scaleY;

                    switch (UI.expectResize) {
                        case 0: // corner
                            _rotate = this.rotate(this.imgx + crop_x + crop_w,
                                    this.imgy + crop_y + crop_h, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 1:
                            _rotate = this.rotate(this.imgx + crop_x + crop_w / 2,
                                    this.imgy + crop_y + crop_h, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 2: // corner
                            _rotate = this.rotate(this.imgx + crop_x,
                                    this.imgy + crop_y + crop_h, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 3:
                            _rotate = this.rotate(this.imgx + crop_x + crop_w,
                                    this.imgy + crop_y + crop_h / 2, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 4:
                            _rotate = this.rotate(this.imgx + crop_x,
                                    this.imgy + crop_y + crop_h / 2, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 5: // corner
                            _rotate = this.rotate(this.imgx + crop_x + crop_w,
                                    this.imgy + crop_y, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 6:
                            _rotate = this.rotate(this.imgx + crop_x + crop_w / 2,
                                    this.imgy + crop_y, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 7:
                            _rotate = this.rotate(this.imgx + crop_x,
                                    this.imgy + crop_y, this.posX(), this.posY(), this.imgrotation);
                            break;

                    }
                } else {
                    switch (UI.expectResize) {
                        case 0: // corner
                            _rotate = this.rotate(this.imgx + this.imgwidth, this.imgy + this.imgheight, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 1:
                            _rotate = this.rotate(this.imgx + this.imgwidth / 2, this.imgy + this.imgheight, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 2: // corner
                            _rotate = this.rotate(this.imgx, this.imgy + this.imgheight, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 3:
                            _rotate = this.rotate(this.imgx + this.imgwidth, this.imgy + this.imgheight / 2, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 4:
                            _rotate = this.rotate(this.imgx, this.imgy + this.imgheight / 2, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 5: // corner
                            _rotate = this.rotate(this.imgx + this.imgwidth, this.imgy, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 6:
                            _rotate = this.rotate(this.imgx + this.imgwidth / 2, this.imgy, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 7:
                            _rotate = this.rotate(this.imgx, this.imgy, this.posX(), this.posY(), this.imgrotation);
                            break;

                    }

                }


                x_corner_rotated = _rotate[0];
                y_corner_rotated = _rotate[1];

                var corner_unrotate = this.rotate(UI.touchedX, UI.touchedY, this.posX(), this.posY(), -this.imgrotation);
                var hover_unrotate = this.rotate(UI.hoverX, UI.hoverY, this.posX(), this.posY(), -this.imgrotation);
                dx = hover_unrotate[0] - corner_unrotate[0];
                dy = hover_unrotate[1] - corner_unrotate[1];
            }

            var scaleX = this.imgwidth / this.imgwidth_ori;
            var scaleY = this.imgheight / this.imgheight_ori;
            var w = this.imgcrop_w * scaleX;
            var h = this.imgcrop_h * scaleY;
            var x = this.imgx + this.imgcrop_x * scaleX;
            var x_right = this.imgx + this.imgcrop_x * scaleX + w;
            var y = this.imgy + this.imgcrop_y * scaleY;
            var y_bottom = this.imgy + this.imgcrop_y * scaleY + h;

            switch (UI.expectResize) {
                case 0:
                    if (isCropped) {
                        var imgwidth_new = (w - dx) * this.imgwidth_ori / this.imgcrop_w;
                        var w_new = this.imgcrop_w * imgwidth_new / this.imgwidth_ori;
                        var imgheight_new = (h - dy) * this.imgheight_ori / this.imgcrop_h;
                        var h_new = this.imgcrop_h * imgheight_new / this.imgheight_ori;
                        if (w_new >= resizeMinWidth && h_new >= resizeMinHeight) {
                            this.imgwidth = imgwidth_new;
                            scaleX = this.imgwidth / this.imgwidth_ori;
                            w = this.imgcrop_w * scaleX;
                            this.imgx = x_right - this.imgcrop_x * scaleX - w;
                            this.imgheight = imgheight_new;
                            scaleY = this.imgheight / this.imgheight_ori;
                            h = this.imgcrop_h * scaleY;
                            this.imgy = y_bottom - this.imgcrop_y * scaleY - h;
                        }
                    } else if (this.imgheight - dy >= resizeMinHeight && this.imgwidth - dx >= resizeMinWidth) {
                        this.imgx += (UI.shift_pressed) ? 0 : dx;
                        this.imgy += (UI.shift_pressed) ? 0 : dy;
                        this.imgwidth += -dx;
                        this.imgheight += -dy;
                    }
                    break;
                case 1:
                    if (isCropped) {
                        var imgheight_new = (h - dy) * this.imgheight_ori / this.imgcrop_h;
                        var h_new = this.imgcrop_h * imgheight_new / this.imgheight_ori;
                        if (h_new >= resizeMinHeight) {
                            this.imgheight = imgheight_new;
                            scaleY = this.imgheight / this.imgheight_ori;
                            h = this.imgcrop_h * scaleY;
                            this.imgy = y_bottom - this.imgcrop_y * scaleY - h;
                        }
                    } else if (this.imgheight - dy >= resizeMinHeight) {
                        this.imgy += dy;
                        this.imgheight += -dy;
                    }
                    break;
                case 2:
                    if (isCropped) {
                        var imgwidth_new = (w + dx) * this.imgwidth_ori / this.imgcrop_w;
                        var w_new = this.imgcrop_w * imgwidth_new / this.imgwidth_ori;
                        var imgheight_new = (h - dy) * this.imgheight_ori / this.imgcrop_h;
                        var h_new = this.imgcrop_h * imgheight_new / this.imgheight_ori;
                        if (w_new >= resizeMinWidth && h_new >= resizeMinHeight) {
                            this.imgwidth = imgwidth_new;
                            scaleX = this.imgwidth / this.imgwidth_ori;
                            this.imgx = x - this.imgcrop_x * scaleX;
                            this.imgheight = imgheight_new;
                            scaleY = this.imgheight / this.imgheight_ori;
                            h = this.imgcrop_h * scaleY;
                            this.imgy = y_bottom - this.imgcrop_y * scaleY - h;
                        }
                    } else if (this.imgheight - dy >= resizeMinHeight && this.imgwidth + dx >= resizeMinWidth) {
                        this.imgy += (UI.shift_pressed) ? 0 : dy;
                        this.imgwidth += dx;
                        this.imgheight += -dy;
                    }
                    break;
                case 3:
                    if (isCropped) {
                        var imgwidth_new = (w - dx) * this.imgwidth_ori / this.imgcrop_w;
                        var w_new = this.imgcrop_w * imgwidth_new / this.imgwidth_ori;
                        if (w_new >= resizeMinWidth) {
                            this.imgwidth = imgwidth_new;
                            scaleX = this.imgwidth / this.imgwidth_ori;
                            w = this.imgcrop_w * scaleX;
                            this.imgx = x_right - this.imgcrop_x * scaleX - w;
                        }
                    } else if (this.imgwidth - dx >= resizeMinWidth) {
                        this.imgx += dx;
                        this.imgwidth += -dx;
                    }
                    break;
                case 4:
                    if (isCropped) {
                        var imgwidth_new = (w + dx) * this.imgwidth_ori / this.imgcrop_w;
                        var w_new = this.imgcrop_w * imgwidth_new / this.imgwidth_ori;
                        if (w_new >= resizeMinWidth) {
                            this.imgwidth = imgwidth_new;
                            scaleX = this.imgwidth / this.imgwidth_ori;
                            this.imgx = x - this.imgcrop_x * scaleX;
                        }
                    } else if (this.imgwidth + dx >= resizeMinWidth) {
                        this.imgwidth += dx;
                    }
                    break;
                case 5:
                    if (isCropped) {
                        var imgwidth_new = (w - dx) * this.imgwidth_ori / this.imgcrop_w;
                        var w_new = this.imgcrop_w * imgwidth_new / this.imgwidth_ori;
                        var imgheight_new = (h + dy) * this.imgheight_ori / this.imgcrop_h;
                        var h_new = this.imgcrop_h * imgheight_new / this.imgheight_ori;
                        if (w_new >= resizeMinWidth && h_new >= resizeMinHeight) {
                            this.imgwidth = imgwidth_new;
                            scaleX = this.imgwidth / this.imgwidth_ori;
                            w = this.imgcrop_w * scaleX;
                            this.imgx = x_right - this.imgcrop_x * scaleX - w;
                            this.imgheight = imgheight_new;
                            scaleY = this.imgheight / this.imgheight_ori;
                            this.imgy = y - this.imgcrop_y * scaleY;
                        }
                    } else if (this.imgheight + dy >= resizeMinHeight && this.imgwidth - dx >= resizeMinWidth) {
                        this.imgx += (UI.shift_pressed) ? 0 : dx;
                        this.imgwidth += -dx;
                        this.imgheight += dy;
                    }
                    break;
                case 6:
                    if (isCropped) {
                        var imgheight_new = (h + dy) * this.imgheight_ori / this.imgcrop_h;
                        var h_new = this.imgcrop_h * imgheight_new / this.imgheight_ori;
                        if (h_new >= resizeMinHeight) {
                            this.imgheight = imgheight_new;
                            scaleY = this.imgheight / this.imgheight_ori;
                            this.imgy = y - this.imgcrop_y * scaleY;
                        }
                    } else if (this.imgheight + dy >= resizeMinHeight) {
                        this.imgheight += dy;
                    }
                    break;
                case 7:
                    if (isCropped) {
                        var imgheight_new = (h + dy) * this.imgheight_ori / this.imgcrop_h;
                        var h_new = this.imgcrop_h * imgheight_new / this.imgheight_ori;
                        var imgwidth_new = (w + dx) * this.imgwidth_ori / this.imgcrop_w;
                        var w_new = this.imgcrop_w * imgwidth_new / this.imgwidth_ori;
                        if (w_new >= resizeMinWidth && h_new >= resizeMinHeight) {
                            this.imgwidth = imgwidth_new;
                            scaleX = this.imgwidth / this.imgwidth_ori;
                            this.imgx = x - this.imgcrop_x * scaleX;
                            this.imgheight = imgheight_new;
                            scaleY = this.imgheight / this.imgheight_ori;
                            this.imgy = y - this.imgcrop_y * scaleY;
                        }
                    } else if (this.imgheight + dy >= resizeMinHeight && this.imgwidth + dx >= resizeMinWidth) {
                        this.imgwidth += dx;
                        this.imgheight += dy;
                    }
                    break;
                case 8:
//                this.imgrotation += dx;
                    var p2 = {x: UI.hoverX, y: UI.hoverY};
                    var p1 = {x: this.posX(), y: this.posY()};

                    this.imgrotation = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI + 90;

                    this.imgrotation = this.imgrotation % 360;
                    this.controlUpdate();
                    break;
            }

            // keep resize ratio at mouse down
            if (UI.shift_pressed || this.imgshape == UI.SHAPE.SQUARE || this.imgshape == UI.SHAPE.CIRCLE) {
                var ratio = activeLayerWidth / activeLayerHeight;
                if (UI.expectResize == 1 || UI.expectResize == 6) {
                    this.imgwidth = this.imgheight * ratio;
                } else if (UI.expectResize == 3 || UI.expectResize == 4) {
                    this.imgheight = this.imgwidth / ratio;
                } else if (this.imgwidth / this.imgheight > ratio) {
                    this.imgheight = this.imgwidth / ratio;
                } else {
                    this.imgwidth = this.imgheight * ratio;
                }

                // readjust offset
                scaleX = this.imgwidth / this.imgwidth_ori;
                scaleY = this.imgheight / this.imgheight_ori;
                w = this.imgcrop_w * scaleX;
                h = this.imgcrop_h * scaleY;

                switch (UI.expectResize) {
                    case 0:
                        this.imgx = x_right - this.imgcrop_x * scaleX - w;
                        this.imgy = y_bottom - this.imgcrop_y * scaleY - h;
                        break;
                    case 1:
                    case 2:
                        this.imgx = x - this.imgcrop_x * scaleX;
                        this.imgy = y_bottom - this.imgcrop_y * scaleY - h;
                        break;
                    case 3:
                        this.imgx = x_right - this.imgcrop_x * scaleX - w;
                        this.imgy = y - this.imgcrop_y * scaleY;
                        break;
                    case 5:
                        this.imgx = x_right - this.imgcrop_x * scaleX - w;
                        this.imgy = y - this.imgcrop_y * scaleY;
                        break;
                    case 4:
                    case 6:
                    case 7:
                        this.imgx = x - this.imgcrop_x * scaleX;
                        this.imgy = y - this.imgcrop_y * scaleY;
                        break;
                }
            }

            if (UI.expectResize !== 8) {
                if (isCropped) {
                    var scaleX = this.imgwidth / this.imgwidth_ori;
                    var scaleY = this.imgheight / this.imgheight_ori;
                    var crop_x = this.imgcrop_x * scaleX;
                    var crop_y = this.imgcrop_y * scaleY;
                    var crop_w = this.imgcrop_w * scaleX;
                    var crop_h = this.imgcrop_h * scaleY;
                    switch (UI.expectResize) {
                        case 0: // corner
                            _rotate = this.rotate(this.imgx + crop_x + crop_w,
                                    this.imgy + crop_y + crop_h, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 1:
                            _rotate = this.rotate(this.imgx + crop_x + crop_w / 2,
                                    this.imgy + crop_y + crop_h, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 2: // corner
                            _rotate = this.rotate(this.imgx + crop_x,
                                    this.imgy + crop_y + crop_h, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 3:
                            _rotate = this.rotate(this.imgx + crop_x + crop_w,
                                    this.imgy + crop_y + crop_h / 2, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 4:
                            _rotate = this.rotate(this.imgx + crop_x,
                                    this.imgy + crop_y + crop_h / 2, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 5: // corner
                            _rotate = this.rotate(this.imgx + crop_x + crop_w,
                                    this.imgy + crop_y, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 6:
                            _rotate = this.rotate(this.imgx + crop_x + crop_w / 2,
                                    this.imgy + crop_y, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 7:
                            _rotate = this.rotate(this.imgx + crop_x,
                                    this.imgy + crop_y, this.posX(), this.posY(), this.imgrotation);
                            break;
                    }
                } else {
                    switch (UI.expectResize) {
                        case 0: // corner
                            _rotate = this.rotate(this.imgx + this.imgwidth, this.imgy + this.imgheight, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 1:
                            _rotate = this.rotate(this.imgx + this.imgwidth / 2, this.imgy + this.imgheight, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 2: // corner
                            _rotate = this.rotate(this.imgx, this.imgy + this.imgheight, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 3:
                            _rotate = this.rotate(this.imgx + this.imgwidth, this.imgy + this.imgheight / 2, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 4:
                            _rotate = this.rotate(this.imgx, this.imgy + this.imgheight / 2, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 5: // corner
                            _rotate = this.rotate(this.imgx + this.imgwidth, this.imgy, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 6:
                            _rotate = this.rotate(this.imgx + this.imgwidth / 2, this.imgy, this.posX(), this.posY(), this.imgrotation);
                            break;
                        case 7: // corner
                            _rotate = this.rotate(this.imgx, this.imgy, this.posX(), this.posY(), this.imgrotation);
                            break;

                    }
                }

                this.imgx += x_corner_rotated - _rotate[0];
                this.imgy += y_corner_rotated - _rotate[1];
            }
        },
        mouseDragCropImage: function (dx, dy) {
            UI.cropBox.x += dx;
            UI.cropBox.y += dy;
            // limit cropping within image
            if (UI.cropBox.x < 0)
                UI.cropBox.x = 0;
            if (UI.cropBox.y < 0)
                UI.cropBox.y = 0;
            if (UI.cropBox.x + UI.cropBox.width > this.imgwidth)
                UI.cropBox.x = this.imgwidth - UI.cropBox.width;
            if (UI.cropBox.y + UI.cropBox.height > this.imgheight)
                UI.cropBox.y = this.imgheight - UI.cropBox.height;
        },
        mouseRecropImageAdjust: function (dx, dy) {
            if (UI.cropBox.x - dx >= 0
                    && (UI.cropBox.x + UI.cropBox.width - dx <= this.imgwidth)) {
                UI.cropBox.x -= dx;
                this.imgx += dx;
            }

            if (UI.cropBox.y - dy >= 0
                    && (UI.cropBox.y + UI.cropBox.height - dy <= this.imgheight)) {
                UI.cropBox.y -= dy;
                this.imgy += dy;
            }

        },
        mouseRecropImage: function (dx, dy) {
            var cropMinWidth = 20, cropMinHeight = 20;
            var temp = this.temp.split("|");
            var activeLayer = temp[0].split(" ");
            var activeLayerX = UI.parseFloat(activeLayer[0]);
            var activeLayerY = UI.parseFloat(activeLayer[1]);
            var activeLayerWidth = UI.parseFloat(activeLayer[2]);
            var activeLayerHeight = UI.parseFloat(activeLayer[3]);

            if (UI.shift_pressed || this.imgshape == UI.SHAPE.SQUARE || this.imgshape == UI.SHAPE.CIRCLE) {
                UI.cropBox.x = activeLayerX;
                UI.cropBox.y = activeLayerY;
                UI.cropBox.width = activeLayerWidth;
                UI.cropBox.height = activeLayerHeight;
                dx = UI.touchedDX;
                dy = UI.touchedDY;
            }
            // isRecropDrag 
            switch (UI.expectRecrop) {
                case 0:
                    if (UI.cropBox.height - dy > cropMinHeight && UI.cropBox.width - dx > cropMinWidth) {
                        UI.cropBox.x += (UI.shift_pressed || this.imgshape == UI.SHAPE.SQUARE || this.imgshape == UI.SHAPE.CIRCLE) ? 0 : dx;
                        UI.cropBox.y += (UI.shift_pressed || this.imgshape == UI.SHAPE.SQUARE || this.imgshape == UI.SHAPE.CIRCLE) ? 0 : dy;
                        if (UI.cropBox.x < 0) {
                            UI.cropBox.x = 0;
                        } else {
                            UI.cropBox.width += -dx;
                        }
                        if (UI.cropBox.y < 0) {
                            UI.cropBox.y = 0;
                        } else {
                            UI.cropBox.height += -dy;
                        }
                    }
                    break;
                case 1:
                    if (UI.cropBox.height - dy > cropMinHeight) {
                        UI.cropBox.y += dy;
                        if (UI.cropBox.y < 0) {
                            UI.cropBox.y = 0;
                        } else {
                            UI.cropBox.height += -dy;
                        }
                    }
                    break;
                case 2:
                    if ((UI.cropBox.height - dy > cropMinHeight) && (UI.cropBox.width + dx > cropMinWidth)) {
                        UI.cropBox.y += (UI.shift_pressed || this.imgshape == UI.SHAPE.SQUARE || this.imgshape == UI.SHAPE.CIRCLE) ? 0 : dy;
                        UI.cropBox.width += dx;
                        if (UI.cropBox.x + UI.cropBox.width > this.imgwidth) {
                            UI.cropBox.width = this.imgwidth - UI.cropBox.x;
                        }
                        if (UI.cropBox.y < 0) {
                            UI.cropBox.y = 0;
                        } else {
                            UI.cropBox.height += -dy;
                        }
                    }
                    break;
                case 3:
                    if (UI.cropBox.width - dx > cropMinWidth) {
                        UI.cropBox.x += dx;
                        if (UI.cropBox.x < 0) {
                            UI.cropBox.x = 0;
                        } else {
                            UI.cropBox.width += -dx;
                        }
                    }
                    break;
                case 4:
                    if (UI.cropBox.width + dx > cropMinWidth) {
                        UI.cropBox.width += dx;
                        if (UI.cropBox.x + UI.cropBox.width > this.imgwidth) {
                            UI.cropBox.width = this.imgwidth - UI.cropBox.x;
                        }
                    }
                    break;
                case 5:
                    if (UI.cropBox.height + dy > cropMinHeight && UI.cropBox.width - dx > cropMinWidth) {
                        UI.cropBox.x += (UI.shift_pressed || this.imgshape == UI.SHAPE.SQUARE || this.imgshape == UI.SHAPE.CIRCLE) ? 0 : dx;
                        UI.cropBox.height += dy;
                        if (UI.cropBox.y + UI.cropBox.height > this.imgheight) {
                            UI.cropBox.height = this.imgheight - UI.cropBox.y;
                        }
                        if (UI.cropBox.x < 0) {
                            UI.cropBox.x = 0;
                        } else {
                            UI.cropBox.width += -dx;
                        }
                    }
                    break;
                case 6:
                    if (UI.cropBox.height + dy > cropMinHeight) {
                        UI.cropBox.height += dy;
                        if (UI.cropBox.y + UI.cropBox.height > this.imgheight) {
                            UI.cropBox.height = this.imgheight - UI.cropBox.y;
                        }
                    }
                    break;
                case 7:
                    if (UI.cropBox.height + dy > cropMinHeight && UI.cropBox.width + dx > cropMinWidth) {
                        UI.cropBox.height += dy;
                        UI.cropBox.width += dx;
                        if (UI.cropBox.y + UI.cropBox.height > this.imgheight) {
                            UI.cropBox.height = this.imgheight - UI.cropBox.y;
                        }
                        if (UI.cropBox.x + UI.cropBox.width > this.imgwidth) {
                            UI.cropBox.width = this.imgwidth - UI.cropBox.x;
                        }
                    }
                    break;
            }

            // keep resize ratio at mouse down
            if (UI.shift_pressed || this.imgshape == UI.SHAPE.SQUARE || this.imgshape == UI.SHAPE.CIRCLE) {
                var ratio = activeLayerWidth / activeLayerHeight;

                if (UI.expectRecrop == 1 || UI.expectRecrop == 6) {
                    UI.cropBox.width = UI.cropBox.height * ratio;
                } else if (UI.expectRecrop == 3 || UI.expectRecrop == 4) {
                    UI.cropBox.height = UI.cropBox.width / ratio;
                } else if (UI.cropBox.width / UI.cropBox.height > ratio) {
                    UI.cropBox.height = UI.cropBox.width / ratio;
                } else {
                    UI.cropBox.width = UI.cropBox.height * ratio;
                }

                // readjust offset
                switch (UI.expectRecrop) {
                    case 0:
                        UI.cropBox.x -= UI.cropBox.width - activeLayerWidth;
                        UI.cropBox.y -= UI.cropBox.height - activeLayerHeight;
                        break;
                    case 2:
                        UI.cropBox.y -= UI.cropBox.height - activeLayerHeight;
                        break;
                    case 5:
                        UI.cropBox.x -= UI.cropBox.width - activeLayerWidth;
                        break;
                }
            }
            // refresh spinner values
            $("#cropImageWidth").spinner("value", UI.cropBox.width);
            $("#cropImageHeight").spinner("value", UI.cropBox.height);
        },
        cropImage: function () {
            var scaleX = this.imgwidth_ori / this.imgwidth;
            var scaleY = this.imgheight_ori / this.imgheight;
            this.imgcrop_x = UI.cropBox.x * scaleX;
            this.imgcrop_y = UI.cropBox.y * scaleY;
            this.imgcrop_w = UI.cropBox.width * scaleX;
            this.imgcrop_h = UI.cropBox.height * scaleY;
        },
        readyCropBox: function (canvas) {
            var h = this.imgcrop_h;
            var w = this.imgcrop_w;
            if (h == 0 || w == 0) {
                UI.cropBox.height = this.imgheight - 20; //* 0.8;
                UI.cropBox.width = this.imgwidth - 20; //* 0.8;
                UI.cropBox.x = 10; // this.imgwidth * 0.1;
                UI.cropBox.y = 10; // this.imgheight * 0.1;

                // resize if not in cropBox not in view
                if (this.imgx + UI.cropBox.x < 0) {
                    UI.cropBox.x = -this.imgx + 10; // canvas.width * 0.1;
                    UI.cropBox.width = canvas.width - 20; // * 0.8;
                    if (UI.cropBox.x + UI.cropBox.width > this.imgwidth) {
                        UI.cropBox.width = this.imgwidth - UI.cropBox.x - 10;
                    }
                }
                // resize if cropBox width exceeds canvas boundary
                if (this.imgx + UI.cropBox.x + UI.cropBox.width > canvas.width) {
                    UI.cropBox.width = canvas.width - (UI.cropBox.x + this.imgx) - 10;
                }

                if (this.imgy + UI.cropBox.y < 0) {
                    UI.cropBox.y = -this.imgy + 10; //canvas.height * 0.1;
                    UI.cropBox.height = canvas.height - 20; // * 0.8;
                    if (UI.cropBox.y + UI.cropBox.height > this.imgheight) {
                        UI.cropBox.height = this.imgheight - UI.cropBox.y - 10;
                    }
                }

                // resize if cropBox width exceeds canvas boundary
                if (this.imgy + UI.cropBox.y + UI.cropBox.height > canvas.height) {
                    UI.cropBox.height = canvas.height - (UI.cropBox.y + this.imgy) - 10;
                }

                if (UI.cropBox.width < 20 || UI.cropBox.height < 20)
                    return;
            } else {
                var scaleX = this.imgwidth / this.imgwidth_ori;
                var scaleY = this.imgheight / this.imgheight_ori;
                UI.cropBox.height = h * scaleY;
                UI.cropBox.width = w * scaleX;
                UI.cropBox.x = this.imgcrop_x * scaleX;
                UI.cropBox.y = this.imgcrop_y * scaleY;
            }
        },
        selectToolbar: function () {

            $("#toolCanvas, #toolText, #texttoolbar, #input, #txtconsole_task, #nilconsole_task, .cvsconsole").css("display", "none");
            $("#imgconsole_task").css("display", "block");
            $("[id^='show']").removeClass("active");
            if (this.imgshape == UI.SHAPE.RECTANGLE) {
                $("#btnBaseShapeImg").html('<span class="fa fa-square-o stretch"></span>');
            } else if (this.imgshape == UI.SHAPE.SQUARE) {
                $("#btnBaseShapeImg").html('<span class="fa fa-square-o"></span>');
            } else if (this.imgshape == UI.SHAPE.CIRCLE) {
                $("#btnBaseShapeImg").html('<span class="fa fa-circle-thin"></span>');
            } else if (this.imgshape == UI.SHAPE.ELLIPSE) {
                $("#btnBaseShapeImg").html('<span class="fa fa-circle-thin stretch"></span>');
            } else if (this.imgshape == UI.SHAPE.TRAPEZOID) {
                $("#btnBaseShapeImg").html('<span class="fa fa-square-o trapezoid"></span>');
            } else if (this.imgshape == UI.SHAPE.PARALLELOGRAM) {
                $("#btnBaseShapeImg").html('<span class="fa fa fa-square-o skewed"></span>');
            }
            if (this.imgshape == UI.SHAPE.SQUARE || this.imgshape == UI.SHAPE.CIRCLE) {
                $("#spanimgKeepratio").hide();
            } else {
                $("#spanimgKeepratio").show();
            }

        },
        controlUpdate: function () {
            if (this.imgcrop_h == 0 || this.imgcrop_w == 0) {
                $("#imageHeight").spinner("value", this.imgheight);
                $("#imageWidth").spinner("value", this.imgwidth);
            } else {
                var scaleX = this.imgwidth / this.imgwidth_ori;
                var scaleY = this.imgheight / this.imgheight_ori;
                $("#imageWidth").spinner("value", this.imgcrop_w * scaleX);
                $("#imageHeight").spinner("value", this.imgcrop_h * scaleY);
            }
            $("#alphaImage").spinner("value", this.imgalpha);
            $("#rotateImage").spinner("value", this.imgrotation);
            $("#radiusImage").spinner("value", this.imgradius);
            $("#borderImage").spinner("value", this.imgborder);
            $("#blurImage").spinner("value", this.imgblur);
            $("#shadowImage").spinner("value", this.imgshadow);
            $("#shadowOxImage").spinner("value", this.imgshadowOx);
            $("#shadowOyImage").spinner("value", this.imgshadowOy);

            $('#shadowImageOn').css('display', (this.imgshadowOn ? "inline-block" : "none"));
            $('#shadowImageOff').css('display', (!this.imgshadowOn ? "inline-block" : "none"));
            if (this.imgshadowOn) {
                $("#shadowImage,#shadowcolorImage,#shadowOxImage,#shadowOyImage").removeClass("disabled");
            } else {
                $("#shadowImage,#shadowcolorImage,#shadowOxImage,#shadowOyImage").addClass("disabled");
            }

            if (this.src.length > 0) {
                $("#imgconsole").show();
                $("#imgconsole").hide().show();
            } else {
                $("#imgconsole").hide();
            }
        },
        restoreLayer: function () {
            $("#lyr" + this.index.toString() + " .tlnote").text(this.layernote);
        },
        refreshEdgeHandlers: function ()  {
            var borderGap = this.borderPlusGap();
            var borderGap2 = borderGap * 2;

            if (this.imgcrop_h === 0 && this.imgcrop_w === 0) {
                UI.populateEdgeHandlers(this.imgx - borderGap, this.imgy - borderGap, this.imgwidth + borderGap2, this.imgheight + borderGap2);
            } else {
                var scaleX = this.imgwidth / this.imgwidth_ori;
                var scaleY = this.imgheight / this.imgheight_ori;
                UI.populateEdgeHandlers(this.imgx + this.imgcrop_x * scaleX - borderGap, this.imgy + this.imgcrop_y * scaleY - borderGap, 
                this.imgcrop_w * scaleX + borderGap2, this.imgcrop_h * scaleY + borderGap2);
            }
        },
        selectLayer: function () {
            $(".ttl,.itl,.gtl").hide();
            $("#itl" + this.index.toString()).show();

            if (this.src !== "") {
                $("#bigsquare").css("background-color", "#333333");
                $("#bigsquare").css("background-image", "url('" + this.src + "')");
                $('#imageurl').text(this.src);
            } else {
                $("#bigsquare").css("background-image", "none");
                $("#bigsquare").css("background-color", "#333333");
                $('#imageurl').text("");
            }
            $("#imgconsole").show();
            if (parseInt($("#mainimageconsole").data('resize-layer')) !== this.index) {
                $("#spanimagesize").empty(); // clear sizes options
                $("#mainimageconsole").data('resize-layer', '-1');
                $("#spanimagesize").html('Original Size &bull; ' + this.imgwidth_ori.toString() + 'x' + this.imgheight_ori.toString() + '');
            } else {
            }


            this.selectToolbar();
            WPImagerUI.resize_image(this.index);
            WPImager.layerEdgeHandlers(this.index);
            this.controlUpdate();
            var is90deg = (this.imgrotation % 90 == 0);
            if (is90deg) {
                $('#resizeWidthImage2Canvas,#resizeHeightImage2Canvas,#resizeImage2Canvas').removeClass('disabled');
            } else {
                $('#resizeWidthImage2Canvas,#resizeHeightImage2Canvas,#resizeImage2Canvas').addClass('disabled');
            }
            WPImager.refreshIconVisible();
            WPImager.refreshIconLock();
            $(".toolboxLayer,.toolboxLayer,.toolboxLayerMix,.toolFormLayer").removeClass("active multi");
            $("#lyr" + this.index.toString()).addClass("active selected");
            $("#a-lyr" + this.index.toString()).addClass("active selected");
            $("#am-lyr" + this.index.toString()).addClass("active selected");
        },
        hitTest: function (x, y) {
            var hit = false;
            if (this.visible
                    && this.src.length > 0
                    && this.disposed == 0) {
                var w = this.absRight - this.absLeft;
                var h = this.absBottom - this.absTop;
                var mx = this.absLeft + w / 2;
                var my = this.absTop + h / 2;
                var unrotate = this.rotate(-x, -y, mx, my, -this.imgrotation);
                var x_unrotated = -unrotate[0];
                var y_unrotated = -unrotate[1];
                var borderGap = this.borderPlusGap();
                hit = this.hit(-x, -y, this.absLeft - borderGap, this.absTop - borderGap, this.absRight + borderGap, this.absBottom + borderGap, this.imgrotation);
            }
            return hit;
        },
        hit: function (x, y, absLeft, absTop, absRight, absBottom, rotation) {

            var w = absRight - absLeft;
            var h = absBottom - absTop;
            var mx = absLeft + w / 2;
            var my = absTop + h / 2;
            var unrotate = this.rotate(x, y, mx, my, -rotation);
            var x = unrotate[0];
            var y = unrotate[1];
            var hit = (x > absLeft
                    && x < absRight
                    && y > absTop
                    && y < absBottom);
            return hit;
        },
        borderPlusGap: function () {
            if (this.imgborder > 0 && this.imgbordercolor.toLowerCase() !== "#0000ffff") {
                return this.imgborder;
            }
            return 0;
        },
        multiSelect: function () {
            $("#lyr" + this.index.toString()).addClass("multi selected");
        },
        multiDeSelect: function () {
            $("#lyr" + this.index.toString()).removeClass("multi selected");
        },
        rotate: function (x, y, xm, ym, a) {
            var cos = Math.cos,
                    sin = Math.sin,
                    a = a * Math.PI / 180, // Convert to radians because that is what
                    // JavaScript likes

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

jQuery(function ($) {

    if (typeof wpimager_mod_image !== "undefined") {

        var uploadFileBtn = document.getElementById('upload_file');
        fileUploader = new ss.SimpleUpload({
            button: uploadFileBtn,
            url: ajaxurl,
            name: 'uploadfile',
            hoverClass: 'hover',
            focusClass: 'focus',
            responseType: 'json',
            allowedExtensions: ['png', 'jpg', 'jpeg'],
            multiple: false,
            maxUploads: 1,
            maxSize: max_upload_size * 1024,
            dropzone: $("#TB_uploader"),
            dragClass: 'dropactive2',
            startXHR: function () {
                $("#uploadProgressBar").css("width", "0%");
                $("#uploadProgressWrap").find(".start-show").show();
                $("#uploadProgressWrap").find(".start-hide").hide();
                $("#uploadProgressWrap").show();
                $('#uploadProgressBar').addClass("progress-bar-success");
                $("#uploadDropSelect").hide();
                isuploading = true;
            },
            onSubmit: function () {
                var self = this;
                self.setData({
                    action: 'uploadmediaimage', canvas_id: WPImager.canvas.id, _wpnonce: UI.nonce
                });
            },
            onProgress: function (pct) {
                //Do something with upload progress
                $("#uploadProgressBar").css("width", parseInt(pct) + "%");
            },
            onComplete: function (filename, response, uploadBtn, size, layer) {
                $("#uploadDropSelect").show();
                // hide progress bar when upload is completed
                if (!response) {
                    $("#uploadProgressWrap").hide();
                    return;
                }

                if (response.success === true) {
                    var attachment = response.attach_data;
                    UI.media_attachment_model[attachment.attach_id] = response.attach_data;
                    var imgsrc = wpimager_baseurl + '/' + attachment.file;
                    var basedir = imgsrc.substring(0, imgsrc.lastIndexOf('/')) + "/";
                    if (typeof attachment.sizes !== "undefined" && typeof attachment.sizes.thumbnail !== "undefined") {
                        imgsrc = basedir + attachment.sizes.thumbnail.file;
                    }
                    var item = '<div class="item upload" data-attachment-id="' + attachment.attach_id + '" data-url="' + imgsrc + '" data-w="' + attachment.width + '" data-h="' + attachment.height + '"><img src="' + imgsrc + '"></div>';
                    $('#media_results').prepend(item);
                    $("#uploadProgressWrap").hide();
                    $("#tabMediaLibrary").click();
                    $("#media_results > div:first").click();

                } else {
                    if (typeof response.message !== "undefined") {
                        $('#uploadErrorMsg').text(response.message);
                    } else {
                        $('#uploadErrorMsg').text("Unexpected response from server.");
                    }
                    $("#uploadProgressWrap").find(".error-show").show();
                    $("#uploadProgressWrap").find(".error-hide").hide();
                }
                $("#TB_container").scrollTop(0);
            },
            onAbort: function (filename, uploadBtn, size, layer) {
                $("#uploadProgressWrap").hide();
                $("#uploadDropSelect").show();
                fileUploader.setAbortBtn($("#xhr-abort-upload"), false);
            },
            onError: function (filename, type, status, statusText, response, uploadBtn, size, layer) {
                if (typeof response.message !== "undefined") {
                    $('#uploadErrorMsg').text(response.message);
                } else {
                    $('#uploadErrorMsg').text("Unexpected response from server.");
                }
                $("#uploadProgressWrap").find(".error-show").show();
                $("#uploadProgressWrap").find(".error-hide").hide();
            }
        });
        fileUploader.setAbortBtn($("#xhr-abort-upload"), false);

        $("#text_upload_mb").text(max_upload_size.toString());

        $(document).on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
            if (e.target.className.indexOf("ui-draggable") !== -1) {
                // allow dragging
            } else {
                if ($("#canvas_bottom").is(":visible")) {
                    // preventing the unwanted behaviours
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        });

        $("#tabUploadFile").click(function (e) {
            $("#TB_container,#media_selected_panel").hide();
            $("#TB_uploader").show();
            $("#TB_container_menu li").removeClass("active");
            $("#TB_uploader").removeClass("dropactive");
            $(this).parent().addClass("active");
        });

        $("#tabMediaLibrary").click(function (e) {
            $("#TB_container,#media_selected_panel").show();
            $("#TB_uploader").hide();
            $("#TB_container_menu li").removeClass("active");
            $(this).parent().addClass("active");
        });

        $("#media_selected_insert").click(function (e) {
            var attachment_id = $(this).data("attachment-id");
            var target = $(this).data("target");
//            if (target == "layer") {
//                WPImager.addAttachmentImageLayer(attachment_id);
//            }
//            if (target == "slide") {
//                WPImager.prepareAttachmentSlide(attachment_id);
//            }
            if (target == "image") {
                WPImager.replaceOptAttachmentImage(attachment_id);
                WPImager.replaceCurrentImage();
                $('#dialog-replace-image').modal({backdrop: 'static'});
                $("#dialog-replace-image .modal-dialog").draggable();
            }

        });

        WPImager.replaceOptAttachmentImage = function (attachment_id) {
            if (parseInt(attachment_id) > 0) {
                for (var id in UI.media_attachment_model) {
                    if (id == attachment_id) {
                        var attachment = UI.media_attachment_model[id];
                        var image_url = wpimager_baseurl + '/' + attachment.file;
                        var layer = WPImager.current;
                        UI.media_replace_options.src = image_url;
                        if (image_url.match(/\.(jpg|jpeg|png|bmp|gif)$/)) {
                            WPImager.layer[layer].disposed = 0;
                            WPImager.layer[layer].src = image_url;
                            draw();
                        }
                        tb_remove();

                        // create selection buttons for different image sizes 
                        $("#replaceimagesizes").empty();
                        if (typeof attachment.sizes !== "undefined") {
                            var hasOriginalSize = false;
                            for (var size in attachment.sizes) {
                                var w = attachment.sizes[size].width;
                                var h = attachment.sizes[size].height;
                                if (attachment.width == w && attachment.height == h) {
                                    hasOriginalSize = true;
                                }
                            }
                            if (!hasOriginalSize) {
                                attachment.sizes["original"] = {
                                    width: attachment.width,
                                    height: attachment.height,
                                    file: image_url.substring(image_url.lastIndexOf("/") + 1)
                                };
                            }
                            var hasCropNG = false;
                            for (var size in attachment.sizes) {
                                var w = attachment.sizes[size].width;
                                var h = attachment.sizes[size].height;
                                var basedir = image_url.substring(0, image_url.lastIndexOf('/')) + "/";
                                var url = basedir + attachment.sizes[size].file;
                                var isCropOK = (parseInt(w) > UI.media_replace_options.imgwidth_prior && parseInt(h) > UI.media_replace_options.imgheight_prior);
                                var btnStyle = (attachment.width == w && attachment.height == h) ? 'btn-primary' : 'btn-slate';
                                btnStyle += (isCropOK ? ' isCropOK' : ' isCropNG');
                                hasCropNG = hasCropNG || !isCropOK;
                                UI.media_replace_options.size_width = w;
                                UI.media_replace_options.size_height = h;

                                $button = $('<button/>',
                                        {
                                            'text': w.toString() + ' x ' + h.toString(),
                                            'class': 'btn btn-sm btn-insert-image ' + btnStyle,
                                            'data-width': w.toString(),
                                            'data-height': h.toString(),
                                            'data-url': url,
                                            click: function () {
                                                var image_url = $(this).data("url");
                                                var image_width = parseInt($(this).data("width"));
                                                var image_height = parseInt($(this).data("height"));
                                                UI.media_replace_options.src = image_url;
                                                UI.media_replace_options.size_width = image_width;
                                                UI.media_replace_options.size_height = image_height;
                                                WPImager.replaceCurrentImage();
                                                $(".btn-insert-image").removeClass("btn-primary").addClass("btn-slate");
                                                $(this).addClass("btn-primary").removeClass("btn-slate");
                                                //                          $("#viewLayers").click();
                                            }
                                        });
                                $("#replaceimagesizes").append($button).append(' ');
                            }
                            $("#tip-replace-image-warn-size").toggle(hasCropNG);

                            // find and click best size
                            $("#replaceimagesizes button").each(function () {
                                if ($(this).hasClass("isCropOK")) {
                                    $(this).click();
                                    return false;
                                }
                            });
                        }

                    }
                }
            }
        }

        WPImager.replaceCurrentImage = function () {
            var layer = WPImager.current;
            var image_url = UI.media_replace_options.src,
                    image_width = UI.media_replace_options.size_width,
                    image_height = UI.media_replace_options.size_height;
            var resizeOption = UI.media_replace_options.resize_option;

            if (image_url.match(/\.(jpg|jpeg|png|bmp|gif)$/)) {
                WPImager.layer[layer].src = image_url;
                WPImager.layer[layer].imgwidth_ori = image_width;
                WPImager.layer[layer].imgheight_ori = image_height;
                if (resizeOption == UI.MEDIAREPLACE.CROP) {
                    var isCropOK = (parseInt(image_width) > UI.media_replace_options.imgwidth_prior
                            && parseInt(image_height) > UI.media_replace_options.imgheight_prior);
                    WPImager.layer[layer].imgx = UI.media_replace_options.imgcx_prior - image_width / 2;
                    WPImager.layer[layer].imgy = UI.media_replace_options.imgcy_prior - image_height / 2;
                    WPImager.layer[layer].imgwidth = image_width;
                    WPImager.layer[layer].imgheight = image_height;
                    var scaleX = UI.media_replace_options.imgwidth_prior / UI.media_replace_options.imgwidth_ori_prior,
                            scaleY = UI.media_replace_options.imgheight_prior / UI.media_replace_options.imgheight_ori_prior;
                    if (isCropOK) {
                        if (UI.media_replace_options.imgcrop_w == 0 || UI.media_replace_options.imgcrop_w == 0) {
                            var crop_w = UI.media_replace_options.imgwidth_prior;
                            var crop_h = UI.media_replace_options.imgheight_prior;
                            WPImager.layer[layer].imgcrop_x = (image_width - crop_w) / 2;
                            WPImager.layer[layer].imgcrop_y = (image_height - crop_h) / 2;
                        } else {
                            var crop_w = (UI.media_replace_options.imgcrop_w * scaleX);
                            var crop_h = (UI.media_replace_options.imgcrop_h * scaleY);
                            WPImager.layer[layer].imgcrop_x = (image_width - crop_w) / 2;
                            WPImager.layer[layer].imgcrop_y = (image_height - crop_h) / 2;
                        }
                        WPImager.layer[layer].imgcrop_w = crop_w;
                        WPImager.layer[layer].imgcrop_h = crop_h;
                    } else if (parseInt(image_width) > UI.media_replace_options.imgwidth_prior) {
                        if (UI.media_replace_options.imgcrop_w == 0 || UI.media_replace_options.imgcrop_w == 0) {
                            var crop_w = UI.media_replace_options.imgwidth_prior;
                            var crop_h = image_height;
                            WPImager.layer[layer].imgcrop_x = (image_width - crop_w) / 2;
                            WPImager.layer[layer].imgcrop_y = (image_height - crop_h) / 2;
                        } else {
                            var crop_w = (UI.media_replace_options.imgcrop_w * scaleX);
                            var crop_h = image_height;
                            WPImager.layer[layer].imgcrop_x = (image_width - crop_w) / 2;
                            WPImager.layer[layer].imgcrop_y = (image_height - crop_h) / 2;
                        }
                        WPImager.layer[layer].imgcrop_w = crop_w;
                        WPImager.layer[layer].imgcrop_h = crop_h;
                        $("#tip-replace-image-options").text("Crop image limited to image width.");
                    } else if (parseInt(image_height) > UI.media_replace_options.imgheight_prior) {

                        if (UI.media_replace_options.imgcrop_w == 0 || UI.media_replace_options.imgcrop_w == 0) {
                            var crop_w = image_width;
                            var crop_h = UI.media_replace_options.imgheight_prior;
                            WPImager.layer[layer].imgcrop_x = (image_width - crop_w) / 2;
                            WPImager.layer[layer].imgcrop_y = (image_height - crop_h) / 2;
                        } else {
                            var crop_w = image_width;
                            var crop_h = (UI.media_replace_options.imgcrop_h * scaleY);
                            WPImager.layer[layer].imgcrop_x = (image_width - crop_w) / 2;
                            WPImager.layer[layer].imgcrop_y = (image_height - crop_h) / 2;
                        }
                        WPImager.layer[layer].imgcrop_w = crop_w;
                        WPImager.layer[layer].imgcrop_h = crop_h;
                        $("#tip-replace-image-options").text("Crop image limited to image height.");

                    } else {
                        // don't resize
                        WPImager.layer[layer].imgcrop_x = 0;
                        WPImager.layer[layer].imgcrop_y = 0;
                        WPImager.layer[layer].imgcrop_w = 0;
                        WPImager.layer[layer].imgcrop_h = 0;
                        WPImager.layer[layer].imgx = UI.media_replace_options.imgcx_prior - image_width / 2;
                        WPImager.layer[layer].imgy = UI.media_replace_options.imgcy_prior - image_height / 2;
                        $("#tip-replace-image-options").text("Unable to crop image smaller than the crop area size.");
                    }
                } else if (resizeOption == UI.MEDIAREPLACE.RESIZE) {
                    WPImager.layer[layer].imgwidth = UI.media_replace_options.imgwidth_prior;
                    WPImager.layer[layer].imgheight = UI.media_replace_options.imgheight_prior;
                    WPImager.layer[layer].imgcrop_x = 0;
                    WPImager.layer[layer].imgcrop_y = 0;
                    WPImager.layer[layer].imgcrop_w = 0;
                    WPImager.layer[layer].imgcrop_h = 0;
                    if (UI.media_replace_options.imgcrop_w == 0 || UI.media_replace_options.imgcrop_w == 0) {
                        WPImager.layer[layer].imgx = UI.media_replace_options.imgx_prior;
                        WPImager.layer[layer].imgy = UI.media_replace_options.imgy_prior;
                    } else {
                        var scaleX = UI.media_replace_options.imgwidth_prior / UI.media_replace_options.imgwidth_ori_prior,
                                scaleY = UI.media_replace_options.imgheight_prior / UI.media_replace_options.imgheight_ori_prior;
                        var crop_w = (UI.media_replace_options.imgcrop_w * scaleX);
                        var crop_h = (UI.media_replace_options.imgcrop_h * scaleY);
                        WPImager.layer[layer].imgx = UI.media_replace_options.imgcx_prior - crop_w / 2;
                        WPImager.layer[layer].imgy = UI.media_replace_options.imgcy_prior - crop_h / 2;
                        WPImager.layer[layer].imgwidth = crop_w;
                        WPImager.layer[layer].imgheight = crop_h;
                    }

                } else {
                    // no resize
                    WPImager.layer[layer].imgwidth = image_width;
                    WPImager.layer[layer].imgheight = image_height;
                    WPImager.layer[layer].imgcrop_x = 0;
                    WPImager.layer[layer].imgcrop_y = 0;
                    WPImager.layer[layer].imgcrop_w = 0;
                    WPImager.layer[layer].imgcrop_h = 0;
                    WPImager.layer[layer].imgx = UI.media_replace_options.imgcx_prior - image_width / 2;
                    WPImager.layer[layer].imgy = UI.media_replace_options.imgcy_prior - image_height / 2;
                }
                UI.isCropping = false;
                WPImagerUI.loadImageShow(layer, image_url);
                WPImagerUI.resize_image(layer);
                WPImager.layer[layer].ui_refresh();
            }

        };


        $("#media_results").on("click", ".item", function (e) {
            var attachment_id = $(this).data("attachment-id");
            $("#media_results .item").removeClass("active");
            $(this).addClass("active");
            $("#media_selected_insert").data("attachment-id", attachment_id).removeClass("disabled");
            for (var id in UI.media_attachment_model) {
                if (id == attachment_id) {
                    var attachment = UI.media_attachment_model[id];
                    var image_url = wpimager_baseurl + '/' + attachment.file;
                    var img = '<div style="border:1px solid #ccc;display:inline-block;"><img src="' + image_url + '" style="max-width:140px;border:3px solid #fff"/></div>';
                    var filename = '<div style="font-weight:bold;color:#333;">' + attachment.file.substring(attachment.file.lastIndexOf("/") + 1) + '</div>';
                    var size = '<div>' + attachment.width.toString() + 'x' + attachment.height.toString() + '</div>';
                    var delete_link = '<div><a id="media_selected_delete" href="#" class="text-danger" data-attachment-id="' + attachment_id.toString() + '">Delete Permanently</a></div>';
                    var html = img + '<div style="padding:6px 4px">' + filename + size + delete_link + '</div>';
                    $("#media_selected_panel div").html(html);
                }
            }
            $("#media_selected_delete").on("click", function (e) {
                var attachment_id = $(this).data("attachment-id");
                var confirmation = confirm("Confirm you want to delete the image permanently?");
                if (confirmation) {
                    $.ajax({
                        type: 'POST',
                        url: ajaxurl,
                        data: {action: 'deletemediaimage', attachment_id: attachment_id, canvas_id: WPImager.canvas.id, _wpnonce: UI.nonce
                        },
                        dataType: 'json',
                        cache: false,
                        success: function (data) {
                            if (data.success) {
                                for (var id in UI.media_attachment_model) {
                                    if (id == attachment_id) {
                                        delete UI.media_attachment_model[id];
                                    }
                                }
                                $('#media_results .item[data-attachment-id="' + attachment_id.toString() + '"]').remove();
                                $("#media_selected_panel > div").empty();
                                $("#media_selected_insert").data("attachment-id", 0).addClass("disabled");
                                return;
                            }
                        }
                    }); // end of .ajax
                }

                return false;
            });


        });

        function render_mediaimages(data, p) {
            var s = '', image_count = 0;
            $.each(data, function (k, v) {
                if (typeof UI.media_attachment_model[k] === "undefined") {
                    var imgsrc = wpimager_baseurl + '/' + v.file;
                    var basedir = imgsrc.substring(0, imgsrc.lastIndexOf('/')) + "/";
                    if (typeof v.sizes !== "undefined" && typeof v.sizes.thumbnail !== "undefined") {
                        imgsrc = basedir + v.sizes.thumbnail.file;
                    }
                    var item = '<div class="item upload" data-attachment-id="' + k + '" data-url="' + imgsrc + '" data-w="' + v.width + '" data-h="' + v.height + '"><img src="' + imgsrc + '"></div>';
                    s = item + s;
                    image_count++;
                }
            });
            $('#media_results').html($('#media_results').html() + s);
            // if (p < pages) 
            if (image_count > 0)
            {
                if ($("#TB_container").height() > $("#media_results").height()) {
                    UI.media_attachment_page++;
                    load_media_images();
                } else {
                    $("#TB_container").scroll(function () {
                        if ($("#TB_container").scrollTop() + $("#TB_container").height() > $("#media_results").height() - 100) {
                            $("#TB_container").off('scroll');
                            UI.media_attachment_page++;
                            load_media_images();
                        }
                    });
                }
            }
        }

        function load_media_images() {
            $.ajax({
                type: 'POST',
                url: ajaxurl,
                data: {action: 'loadmediaimages', paged: UI.media_attachment_page, canvas_id: WPImager.canvas.id, _wpnonce: UI.nonce
                },
                dataType: 'json',
                cache: false,
                success: function (data) {
                    if (data.success) {
                        render_mediaimages(data.images, data.paged);
                        $.extend(UI.media_attachment_model, data.images);
                        return;
                    }
                }
            }); // end of .ajax

        }

        $("#cmdReplaceImage").click(function (e) {
            // save
            var imgdraw = WPImager.layer[WPImager.current];
            var resizeOption = UI.media_replace_options.resize_option;
            UI.media_replace_options = {
                size_width: 0,
                size_height: 0,
                src: "",
                imgsrc_prior: imgdraw.src,
                imgx_prior: imgdraw.imgx,
                imgy_prior: imgdraw.imgy,
                imgwidth_prior: imgdraw.imgwidth,
                imgheight_prior: imgdraw.imgheight,
                imgwidth_ori_prior: imgdraw.imgwidth_ori,
                imgheight_ori_prior: imgdraw.imgheight_ori,
                imgcrop_x: imgdraw.imgcrop_x,
                imgcrop_y: imgdraw.imgcrop_y,
                imgcrop_w: imgdraw.imgcrop_w,
                imgcrop_h: imgdraw.imgcrop_h,
                imgcx_prior: imgdraw.posX(),
                imgcy_prior: imgdraw.posY()
            };
            UI.media_replace_options.resize_option = resizeOption;

            $("#lblReplacedSize").text(parseInt(imgdraw.imgwidth).toString() + 'x' + parseInt(imgdraw.imgheight).toString());
            // show image thickbox

            tb_show('Media Image', '#TB_inline?inlineId=wpimager-media&amp;modal=false', null);
            $("#TB_window").on('dragenter', function (e) {
                $("#tabUploadFile").click();
            });


            window.dispatchEvent(new Event('resize'));
            start_media_images("image");
            return false;
        });

        window.start_media_images = function (target) {
            tb_show('Media Image', '#TB_inline?inlineId=wpimager-media&amp;modal=false', null);
            $("#TB_window").on('dragenter', function (e) {
                $("#tabUploadFile").click();
            });


            var dropzone = document.getElementById("TB_uploader");
            new Dragster(dropzone);

            document.addEventListener("dragster:enter", function (e) {
                e.target.classList.add("dropactive");

            }, false);

            document.addEventListener("dragster:leave", function (e) {
                e.target.classList.remove("dropactive");
            }, false);


            $("#media_selected_insert").data("target", target);

            window.dispatchEvent(new Event('resize'));

            if (UI.media_attachment_page == 0) {
                UI.media_attachment_page = 1;
                load_media_images();
            } else {
                if ($("#TB_container").height() > $("#media_results").height()) {
                    UI.media_attachment_page++;
                    load_media_images();
                } else {
                    $("#TB_container").scroll(function () {
                        if ($("#TB_container").scrollTop() + $("#TB_container").height() > $("#media_results").height() - 100) {
                            $("#TB_container").off('scroll');
                            UI.media_attachment_page++;
                            load_media_images();
                        }
                    });
                }
            }

        }

        $("#cmd-replace-image-options").on("click", "button", function () {
            var resizeOption = parseInt($(this).data("resize-option"));
            UI.media_replace_options.resize_option = resizeOption;
            $("#tip-replace-image-options").text($(this).data("tip")); // call first
            WPImager.replaceCurrentImage();
            $("#cmd-replace-image-options button").removeClass("btn-primary").addClass("btn-darkslate");
            $(this).addClass("btn-primary").removeClass("btn-darkslate")
        });

        $("#cmd-replace-image-ok").click(function () {
            $("#dialog-replace-image").modal("hide");
            if (UI.media_replace_options.resize_option == UI.MEDIAREPLACE.CROP) {
                $("#showCropImageConsole").click();
            }
            WPImagerUI.flagCanvasSave();
            $("#img" + WPImager.current.toString()).css("background-image", "url('" + UI.media_replace_options.src + "')");

        });
        $("#cmd-replace-image-cancel").click(function () {
            var imgdraw = WPImager.layer[WPImager.current];
            imgdraw.src = UI.media_replace_options.imgsrc_prior;
            imgdraw.imgx = UI.media_replace_options.imgx_prior;
            imgdraw.imgy = UI.media_replace_options.imgy_prior;
            imgdraw.imgwidth = UI.media_replace_options.imgwidth_prior;
            imgdraw.imgheight = UI.media_replace_options.imgheight_prior;
            imgdraw.imgwidth_ori = UI.media_replace_options.imgwidth_ori_prior;
            imgdraw.imgheight_ori = UI.media_replace_options.imgheight_ori_prior;
            imgdraw.imgcrop_x = UI.media_replace_options.imgcrop_x;
            imgdraw.imgcrop_y = UI.media_replace_options.imgcrop_y;
            imgdraw.imgcrop_w = UI.media_replace_options.imgcrop_w;
            imgdraw.imgcrop_h = UI.media_replace_options.imgcrop_h;
            WPImagerUI.loadImageShow(WPImager.current, imgdraw.src);
            WPImagerUI.resize_image(WPImager.current);
            $("#dialog-replace-image").modal("hide");

        });

    }
    // text box crop to new layer button
    $('#cropTextNewLayer').click(function () {
        var textdraw = WPImager.layer[WPImager.current];
        UI.isPrinting = true;
        draw();
        var border = textdraw.textborder;
        var x = textdraw.xOffset - border,
                y = textdraw.yOffset - border,
                w = Math.round(textdraw.width) + border * 2;
        h = Math.round(textdraw.height) + border * 2;
        base64data = Canvas2Image.convertToImage(canvas, x, y, w, h, WPImager.canvas.ext);
        base64data = base64data.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
        WPImager.addImageLayer();
        WPImager.uploadBase64Image(base64data, WPImager.canvas.ext);
        WPImager.layer[WPImager.current].imgrotation = textdraw.rotation;
        UI.isPrinting = false;
    });

    // text box crop download button
    $('#cropTextDownload').click(function () {
        var textdraw = WPImager.layer[WPImager.current];
        var fname = WPImagerUI.convertToSlug($("#pagetitle").text());
        UI.isPrinting = true;
        draw();

        var border = textdraw.textborder;
        var x = textdraw.xOffset - border,
                y = textdraw.yOffset - border,
                w = Math.round(textdraw.width) + border * 2;
        h = Math.round(textdraw.height) + border * 2;

        var ext = WPImager.canvas.ext;
        if (canvas.msToBlob) { //for IE
            var cropCanvas = document.createElement('canvas');
            var cropCtx = cropCanvas.getContext('2d');
            cropCanvas.width = w;
            cropCanvas.height = h;
            cropCtx.drawImage(cropCanvas, x, y, w, h, 0, 0, w, h);
            var blob = cropCanvas.msToBlob();
            window.navigator.msSaveBlob(blob, fname + "." + ext);
        } else if (UI.support_download) {
            // download attribute supported by browser
            Canvas2Image.saveAsImage(canvas, x, y, w, h, ext, fname + "." + ext);
        } else {
            // download attribute not supported, upload then download image
            var imgBase64 = Canvas2Image.convertToImage(canvas, x, y, w, h, ext);
            imgBase64 = imgBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
            WPImager.postdownload(imgBase64, ext);
        }
        UI.isPrinting = false;
    });


    WPImager.uploadBase64Image = function (imageData, ext) {

        $.ajax({
            type: 'POST',
            url: ajaxurl,
            data: {action: 'uploadbase64', imageData: imageData, ext: ext, canvas_id: this.canvas.id, current_layer: WPImager.current, _wpnonce: UI.nonce},
            dataType: 'json',
            cache: false,
            beforeSend: function () {
                var layer = WPImager.current.toString();
                $('#progressWrap' + layer).show();
                $('#progressBar' + layer).addClass("progress-bar-success");
                $('#progressWrap' + layer).append('<button class="btn btn-xs btn-danger" id="xhr-abort-' + layer + '" data-index="' + layer + '">Cancel</button>');
                $('#xhr-abort-' + layer).click(function () {
                    var layer = parseInt($(this).data("index"));
                    WPImager.removeUploadingIndex(layer);
                    UI.xhr[layer].abort();
                    $('#progressWrap' + layer).hide();
                });
                WPImager.createUploadingIndex(WPImager.current);
            },
            error: function (jqXHR, status, err) {
                var matches = this.data.match(/current_layer=([^&]*)/);
                var layer = parseInt(matches[1]);
                var alertmsg = "Error Uploading Image";
                $('#progressWrap' + layer.toString()).hide();
                WPImager.removeUploadingIndex(layer);
                $('#xhr-abort-' + layer).remove();
            },
            success: function (msg) {
                var matches = this.data.match(/current_layer=([^&]*)/);
                var layer = parseInt(matches[1]);
                WPImager.layer[layer].src = msg.src;
                WPImagerUI.loadImageNew(layer, msg.src);
                $('#progressBar' + layer.toString()).removeClass("progress-bar-success");
                $('#xhr-abort-' + layer).remove();
                var attachment = msg.attachment;
                UI.media_attachment_model[attachment.attach_id] = attachment;
                var imgsrc = wpimager_baseurl + '/' + attachment.file;
                var basedir = imgsrc.substring(0, imgsrc.lastIndexOf('/')) + "/";
                if (typeof attachment.sizes !== "undefined" && typeof attachment.sizes.thumbnail !== "undefined") {
                    imgsrc = basedir + attachment.sizes.thumbnail.file;
                }
                var item = '<div class="item upload" data-attachment-id="' + attachment.attach_id + '" data-url="' + imgsrc + '" data-w="' + attachment.width + '" data-h="' + attachment.height + '"><img src="' + imgsrc + '"></div>';
                $('#media_results').prepend(item);

            },
            xhr: function () {
                var matches = this.data.match(/current_layer=([^&]*)/);
                var layer = parseInt(matches[1]);
                UI.xhr[layer] = new window.XMLHttpRequest();
                //Upload progress
                UI.xhr[layer].upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = evt.loaded / evt.total * 100;
                        //Do something with upload progress
                        $("#progressBar" + layer.toString()).css("width", parseInt(percentComplete) + "%");
                    }
                }, false);
                return UI.xhr[layer];
            }
        });
    };


});
