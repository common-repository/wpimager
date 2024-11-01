/*!
 WPImager 1.0.0    
 https://wpimager.com/
 2018 WPImager  
 */

/**
 * WPImagerUI Object
 * Contains methods and properties to draw layers objects on canvas
 */

var WPImagerUI;
//
(function ($) {

    WPImagerUI = {
        img: {},
        imgsm: {},
        imgcanvas: {},
        imgsm_loaded: {},
        img_loaded: {},
        imgtemp: {},
        imgslide: -1,
        cW: 0, cH: 0, boot: 0,
        degMax: 60,
        targetCanvas: "cvs",
        imgOnloadNew: function (i) {
            // post upload call - calculate image x,y,w,h
            i = parseInt(i);
            var imgLoaded = WPImager.layer[i];
            thisimg = this.img[i];
            var isUploading = WPImager.isUploading(i);

            if (isUploading) {
                this.img_loaded[i] = 1;
                if (typeof WPImager.layer[WPImager.canvas.maxIndex].temp != "undefined"
                        && WPImager.layer[WPImager.canvas.maxIndex].temp === UI.UPLOAD.RESIZETOCANVAS) {
                    WPImager.canvas.width = thisimg.width;
                    WPImager.canvas.height = thisimg.height;
                }

                imgLoaded.imgx = (WPImager.canvas.width - thisimg.width) / 2;
                imgLoaded.imgy = (WPImager.canvas.height - thisimg.height) / 2;
                imgLoaded.imgwidth = thisimg.width;
                imgLoaded.imgheight = thisimg.height;
                imgLoaded.imgwidth_ori = thisimg.width;
                imgLoaded.imgheight_ori = thisimg.height;
                imgLoaded.disposed = 0;


                this.resize_image(i);
                if (imgLoaded.imgwidth > WPImager.canvas.width
                        && imgLoaded.imgheight > WPImager.canvas.height) {
//            WPImager.moveLayerToBackground();
                }


                this.draw();
                if (!UI.isCropping) {
                    WPImager.selectLayer(i);
                }
            }

            WPImager.removeUploadingIndex(i);
            WPImagerUI.flagCanvasSave();
            $('#progressWrap' + i.toString()).hide();

            if (i == WPImager.current && imgLoaded.disposed == 0) {
                WPImager.ui_refresh(i);
                $('#imageurl').text(imgLoaded.src);
                $("#bigsquare").css("background-image", "url('" + imgLoaded.src + "')").css("background-color", "#333333");
                $("#imgconsole").css("display", "block"); // may have been hidden on add image
            }
            $("#img" + i.toString()).css("background-image", "url('" + thisimg.src + "')");
        },
        imgOnloadShow: function (i) {
            // previously uploaded image, only to show it
            i = parseInt(i);
            var imgLoaded = WPImager.layer[i];
            thisimg = this.img[i];
            var isUploading = WPImager.isUploading(i);
            // loading during initialization, reset image
            this.img_loaded[i] = 1;
            imgLoaded.imgwidth_ori = thisimg.width;
            imgLoaded.imgheight_ori = thisimg.height;
            this.resize_image(i);
            this.draw();
            $("#img" + i.toString()).css("background-image", "url('" + thisimg.src + "')");
        },
        imgOnload: function (i) {
            i = parseInt(i);
            var imgLoaded = WPImager.layer[i];
            thisimg = this.img[i];
            var isUploading = WPImager.isUploading(i);

            if (isUploading && imgLoaded.imgwidth > 0 && imgLoaded.imgheight > 0) {
                // replace an existing image
                this.img_loaded[i] = 1;

                imgLoaded.imgwidth_ori = thisimg.width;
                imgLoaded.imgheight_ori = thisimg.height;

                var width = imgLoaded.imgwidth;
                if (thisimg.width < imgLoaded.imgwidth) {
                    width = thisimg.width;
                }

                if (imgLoaded.imgcrop_h == 0 || imgLoaded.imgcrop_w == 0) {
                    var height = (width / imgLoaded.imgwidth_ori) * imgLoaded.imgheight_ori;

                    var moveY = (imgLoaded.imgheight - height) / 2;
                    imgLoaded.imgy += moveY; // keep Y centered
                    imgLoaded.imgheight = height;

                    var moveX = (imgLoaded.imgwidth - width) / 2;
                    imgLoaded.imgx += moveX; // keep X centered
                    imgLoaded.imgwidth = width;
                } else {

                    var scaleX = imgLoaded.imgwidth / imgLoaded.imgwidth_ori;
                    var old_crop_width = imgLoaded.imgcrop_w * scaleX;
                    var width = old_crop_width;
                    if (thisimg.width < old_crop_width) {
                        width = thisimg.width;
                    }
                    imgLoaded.imgx += imgLoaded.imgcrop_x * scaleX;

                    var moveX = (old_crop_width - width) / 2;
                    imgLoaded.imgx += moveX; // keep X centered
                    imgLoaded.imgwidth = old_crop_width;

                    var height = (width / imgLoaded.imgwidth_ori) * imgLoaded.imgheight_ori;
                    var moveY = (imgLoaded.imgheight - height) / 2;
                    imgLoaded.imgy += moveY; // keep Y centered
                    imgLoaded.imgheight = height;

                    imgLoaded.imgcrop_h = 0;
                    imgLoaded.imgcrop_w = 0;


                }
                var _isCropping = UI.isCropping;
                UI.isCropping = false;
                this.resize_image(i);
                UI.isCropping = _isCropping;

                if (WPImager.boot > 0 && imgLoaded.imgwidth != imgLoaded.imgwidth_ori
                        && imgLoaded.imgheight != imgLoaded.imgheight_ori) {

                    $(".cvsconsole").hide();
                    $("#postuploadconsole").show();
                    $("#label_imgsize_ori").text(parseInt(imgLoaded.imgwidth).toString() + "x" + parseInt(imgLoaded.imgheight).toString());
                }
                this.draw();

            } else if (imgLoaded.imgwidth > 0 && imgLoaded.imgheight > 0) {
                // loading during initialization, reset image
                this.img_loaded[i] = 1;
                imgLoaded.imgwidth_ori = thisimg.width;
                imgLoaded.imgheight_ori = thisimg.height;
                this.resize_image(i);
                this.draw();
            } else if (isUploading) {
                this.img_loaded[i] = 1;

                if (typeof WPImager.layer[WPImager.canvas.maxIndex].temp != "undefined"
                        && WPImager.layer[WPImager.canvas.maxIndex].temp === UI.UPLOAD.RESIZETOCANVAS) {
                    WPImager.canvas.width = thisimg.width;
                    WPImager.canvas.height = thisimg.height;
                }

                imgLoaded.imgx = (WPImager.canvas.width - thisimg.width) / 2;
                imgLoaded.imgy = (WPImager.canvas.height - thisimg.height) / 2;
                imgLoaded.imgwidth = thisimg.width;
                imgLoaded.imgheight = thisimg.height;
                imgLoaded.imgwidth_ori = thisimg.width;
                imgLoaded.imgheight_ori = thisimg.height;
                imgLoaded.disposed = 0;
                if (imgLoaded.slide == 0) {
                    // update
//                SlideAction.loadSlide(0);
//                SlideAction.loadSlide(WPImager.slide);
                }

                this.resize_image(i);
                if (imgLoaded.imgwidth > WPImager.canvas.width
                        && imgLoaded.imgheight > WPImager.canvas.height) {
                    WPImager.moveLayerToBackground();
                }


                this.draw();
                if (!UI.isCropping) {
                    WPImager.selectLayer(i);
                }

            }

            WPImager.removeUploadingIndex(i);
            WPImagerUI.flagCanvasSave();
            $('#progressWrap' + i.toString()).hide();

            if (i == WPImager.current && imgLoaded.disposed == 0) {
                WPImager.ui_refresh(i);
                $('#imageurl').text(imgLoaded.src);
                $("#bigsquare").css("background-image", "url('" + imgLoaded.src + "')").css("background-color", "#333333");
                $("#imgconsole").css("display", "block"); // may have been hidden on add image
            }
            $("#img" + i.toString()).css("background-image", "url('" + thisimg.src + "')");

        },
        createCheckered: function () {
            // create checkered pattern to indicate transparent canvas background
            var patternLight = document.getElementById('PatternCanvasLight');
            patternLight.width = 20;
            patternLight.height = 20;
            var pctx = patternLight.getContext('2d');
            pctx.fillStyle = "#ffffff";
            pctx.fillRect(0, 0, 20, 20);
            pctx.fillStyle = "#c3c3c3";
            pctx.fillRect(0, 0, 10, 10);
            pctx.fillRect(10, 10, 10, 10);
            this.checkeredLight = this.ctx.createPattern(patternLight, "repeat");
            var patternDark = document.getElementById('PatternCanvasLight');
            patternDark.width = 20;
            patternDark.height = 20;
            var pctx2 = patternDark.getContext('2d');
            pctx2.fillStyle = "#333333";
            pctx2.fillRect(0, 0, 20, 20);
            pctx2.fillStyle = "#444444";
            pctx2.fillRect(0, 0, 10, 10);
            pctx2.fillRect(10, 10, 10, 10);
            this.checkeredDark = this.ctx.createPattern(patternDark, "repeat");
        },
        bootup: function () {
            this.canvas = document.getElementById("cvs");
            this.ctx = this.canvas.getContext('2d');
            this.createCheckered();
            this.boot = 1;
            $(".canvas_zoom").click();
        },
        setTargetCanvas: function (id) {
            if (typeof id == "undefined") {
                // default canvas
                this.canvas = document.getElementById("cvs");
                this.targetCanvas = "cvs";
            } else {
                this.canvas = document.getElementById(id);
                this.targetCanvas = id;
            }
            this.ctx = this.canvas.getContext('2d');
        },
//    loadImage: function (index, url) {
//        this.img[index] = new Image();
//        this.img[index].id = index;
//        this.img[index].src = url;
//        this.img[index].onload = function () {
//            WPImagerUI.imgOnload(this.id);
//        };
//    },
        loadImageNew: function (index, url) {
            this.img[index] = new Image();
            this.img[index].id = index;
            this.img[index].src = url;
            this.img[index].slide = WPImager.slide;
            this.img[index].onload = function () {
                WPImagerUI.imgOnloadNew(this.id);
            };
        },
        loadImageShow: function (index, url) {
            this.img[index] = new Image();
            this.img[index].id = index;
            this.img[index].src = url;
            this.img[index].slide = WPImager.slide;
            this.img[index].onload = function () {
                WPImagerUI.imgOnloadShow(this.id);
            };
        },
        imagedraw: function (k) {
            var findex = parseInt(k);
            var visible = WPImager.layer[findex].visible;


            if (findex === 0 || !visible)
                return;
            if (WPImager.layer[findex].disposed > 0)
                return;

            var thisimg = this.img[findex];
            if ((WPImager.layer[findex].src !== "") && typeof thisimg !== "undefined") {
                var imgdraw = WPImager.layer[findex];

                var isimgsm = false;
                if (typeof this.imgcanvas[findex] !== "undefined" && this.imgsm_loaded[findex] == 1 && typeof this.imgsm[findex] !== "undefined" && this.imgsm[findex] !== null) {
                    if (UI.isCropping || UI.isRecropDrag) {
                        if (UI.isCropping && findex == WPImager.current) {
                            isimgsm = true;
                            thisimg = this.imgsm[findex];

                        } else if (WPImager.canvas.picktool == 1 && findex != WPImager.current) {
                            isimgsm = true;
                            thisimg = this.imgsm[findex];
                        } else if (WPImager.canvas.picktool == 0) {
                            isimgsm = true;
                            thisimg = this.imgsm[findex];

                        }
                    } else {
                        isimgsm = true;
                        thisimg = this.imgsm[findex];
                    }
                }


                var w = imgdraw.imgwidth;
                var h = imgdraw.imgheight;
                var scaleX = imgdraw.imgwidth / imgdraw.imgwidth_ori;
                var scaleY = imgdraw.imgheight / imgdraw.imgheight_ori;
//            if (isimgsm) {
//                w = this.imgcanvas[findex].width;
//                h = this.imgcanvas[findex].height;
//                scaleX = w / imgdraw.imgwidth_ori;
//                scaleY = h / imgdraw.imgheight_ori;
//            }

                var deg = imgdraw.imgrotation;
                var imgalpha = imgdraw.imgalpha;
                imgalpha = (imgalpha >= 0 && imgalpha <= 100) ? (imgalpha / 100) : 1;
                var shiftY = (h / 2);
                var shiftX = (w / 2);
                var moveX = 0;
                var moveY = 0;
                // record absolute position
                imgdraw.absLeft = imgdraw.imgx;
                imgdraw.absTop = imgdraw.imgy;
                imgdraw.absRight = imgdraw.absLeft + w;
                imgdraw.absBottom = imgdraw.absTop + h;

                if (imgdraw.imgcrop_w !== 0 && imgdraw.imgcrop_h !== 0) {
                    scaleX = imgdraw.imgwidth / imgdraw.imgwidth_ori;
                    scaleY = imgdraw.imgheight / imgdraw.imgheight_ori;
                    moveX = imgdraw.imgcrop_x * scaleX;
                    moveY = imgdraw.imgcrop_y * scaleY;
                    shiftX = imgdraw.imgcrop_w * scaleX / 2;
                    shiftY = imgdraw.imgcrop_h * scaleY / 2;
                    // record absolute position
                    imgdraw.absLeft = imgdraw.imgx + moveX;
                    imgdraw.absTop = imgdraw.imgy + moveY;
                    imgdraw.absRight = imgdraw.absLeft + shiftX * 2;
                    imgdraw.absBottom = imgdraw.absTop + shiftY * 2;

                }
                // round up values for canvas
                var _shiftX = (shiftX);
                var _shiftY = (shiftY);
                var _moveX = (moveX);
                var _moveY = (moveY);
                var _imgx = (imgdraw.imgx);
                var _imgy = (imgdraw.imgy);
                var _crop_x = (imgdraw.imgcrop_x * scaleX);
                var _crop_y = (imgdraw.imgcrop_y * scaleY);
                var _crop_w = (imgdraw.imgcrop_w * scaleX);
                var _crop_h = (imgdraw.imgcrop_h * scaleY);

                var skewA, skewB, skewP, skewDir = imgdraw.imgskewDir;

                if (imgdraw.imgshape == UI.SHAPE.TRAPEZOID) {
                    if (skewDir == 1) {
                        skewA = imgdraw.imgskewA * (imgdraw.imgheight / imgdraw.imgheight_ori);
                        skewB = imgdraw.imgskewB * (imgdraw.imgheight / imgdraw.imgheight_ori);
                    } else {
                        skewA = imgdraw.imgskewA * (imgdraw.imgwidth / imgdraw.imgwidth_ori);
                        skewB = imgdraw.imgskewB * (imgdraw.imgwidth / imgdraw.imgwidth_ori);
                    }
                } else {
                    if (skewDir == 1) {
                        skewP = imgdraw.imgskewP * (imgdraw.imgheight / imgdraw.imgheight_ori);
                    } else {
                        skewP = imgdraw.imgskewP * (imgdraw.imgwidth / imgdraw.imgwidth_ori);
                    }
                }

                this.ctx.save();

                this.ctx.globalAlpha = imgalpha;

                // var BGCanvas = document.createElement('canvas');
                var BGCanvas = document.getElementById('BGCanvas');
                var BGCtx = BGCanvas.getContext('2d');
                BGCanvas.width = (UI.comScale.active) ? UI.comScale.scaledWidth : WPImager.canvas.width;
                BGCanvas.height = (UI.comScale.active) ? UI.comScale.scaledHeight : WPImager.canvas.height;



                BGCtx.lineWidth = imgdraw.imgborder * 2;
                BGCtx.shadowColor = "transparent";
                BGCtx.globalAlpha = 1;
                BGCtx.clearRect(0, 0, BGCanvas.width, BGCanvas.height);

                try {
                    var imgradius = (imgdraw.imgshape == UI.SHAPE.CIRCLE) ? imgdraw.imgwidth / 2 + 1 : imgdraw.imgradius;
                    var imgborder = imgdraw.imgborder;
                    if (WPImager.layer[findex].src !== "") {
                        this.ctx.translate((_imgx + _moveX + _shiftX), (_imgy + _moveY + _shiftY));

                        this.ctx.lineWidth = imgdraw.imgborder;
                        this.ctx.strokeStyle = imgdraw.imgbordercolor;
                        this.ctx.fillStyle = imgdraw.imgbordercolor;

                        if (imgdraw.imgshadowOn) {
                            BGCtx.shadowColor = imgdraw.imgshadowcolor;
                            BGCtx.shadowOffsetX = imgdraw.imgshadowOx;
                            BGCtx.shadowOffsetY = imgdraw.imgshadowOy;
                            BGCtx.shadowBlur = imgdraw.imgshadow;
                        }

                        if (UI.isCropping && WPImager.current == findex) {
                            if (!UI.isPrinting) {
                                // draw semi transparent background
                                this.ctx.drawImage(this.img[findex], -_moveX - _shiftX, -_moveY - _shiftY, w, h); // draw full image
                                this.ctx.globalAlpha = 0.3;
                                this.ctx.fillStyle = "#000000";
                                this.ctx.fillRect(-_moveX - _shiftX, -_moveY - _shiftY, w, UI.cropBox.y);
                                this.ctx.fillRect(-_moveX - _shiftX, -_moveY - _shiftY + UI.cropBox.y, UI.cropBox.x, UI.cropBox.height);
                                this.ctx.fillRect(-_moveX - _shiftX, -_moveY - _shiftY + UI.cropBox.y + UI.cropBox.height, w, h - UI.cropBox.y - UI.cropBox.height);
                                this.ctx.fillRect(-_moveX - _shiftX + UI.cropBox.x + UI.cropBox.width, -_moveY - _shiftY + UI.cropBox.y, w - UI.cropBox.x - UI.cropBox.width, UI.cropBox.height);
                            }
                            BGCtx.translate((_imgx + _moveX + _shiftX), (_imgy + _moveY + _shiftY));
                            this.ctx.globalAlpha = imgalpha;
                            var scaleX = imgdraw.imgwidth_ori / imgdraw.imgwidth;
                            var scaleY = imgdraw.imgheight_ori / imgdraw.imgheight;

                            // draw border
                            if (imgdraw.imgborder > 0) {
                                BGCtx.strokeStyle = imgdraw.imgbordercolor;
//                            if (imgdraw.imgshape == UI.SHAPE.ELLIPSE) {
//                                this.ellipseRect(BGCtx, -_moveX - _shiftX + UI.cropBox.x + UI.cropBox.width / 2, -moveY - _shiftY + UI.cropBox.y + UI.cropBox.height / 2, +UI.cropBox.width, +UI.cropBox.height, false, true);
//                            } else {
//                                this.roundedRect(BGCtx, -_moveX - _shiftX + UI.cropBox.x, -_moveY - _shiftY + UI.cropBox.y, +UI.cropBox.width, +UI.cropBox.height, imgradius, false, true);
//                            }

                                BGCtx.fillStyle = "#ffffff";
                                BGCtx.globalCompositeOperation = "destination-out";
                                if (imgdraw.imgshape == UI.SHAPE.ELLIPSE) {
                                    this.ellipseRect(BGCtx, -_moveX - _shiftX + UI.cropBox.x + UI.cropBox.width / 2, -_moveY - _shiftY + UI.cropBox.y + UI.cropBox.height / 2, +UI.cropBox.width - 2, +UI.cropBox.height - 2, true, false);
                                } else {
                                    this.roundedRect(BGCtx, -_moveX - _shiftX + UI.cropBox.x + 1, -_moveY - _shiftY + UI.cropBox.y + 1, +UI.cropBox.width - 2, +UI.cropBox.height - 2, imgradius, true, false);
                                }
                                BGCtx.globalCompositeOperation = "source-over";
                            }
                            BGCtx.shadowColor = "transparent";
                            if (isimgsm) {
                                this.ctx.drawImage(BGCanvas, -(_imgx + _moveX + _shiftX), -(_imgy + _moveY + _shiftY));
                            }
                            this.ctx.rotate(deg * Math.PI / 180);

                        } else if (imgdraw.imgcrop_w > 0 && imgdraw.imgcrop_h > 0) {
                            // draw cropped image
                            BGCtx.translate((_imgx + _moveX + _shiftX), (_imgy + _moveY + _shiftY));
                            BGCtx.rotate(deg * Math.PI / 180);
                            // displayed image is cropped
                            this.ctx.globalAlpha = imgalpha;
                            if (imgdraw.imgshadowOn) {
                                if (imgdraw.imgshape == UI.SHAPE.TRAPEZOID) {
                                    this.skewedRect(BGCtx, -(_shiftX) + 1, -(_shiftY) + 1, _crop_w - 2, _crop_h - 2, imgborder, skewA, skewB, skewDir, true, false);
                                } else if (imgdraw.imgshape == UI.SHAPE.PARALLELOGRAM) {
                                    this.skewedRect(BGCtx, -(_shiftX) + 1, -(_shiftY) + 1, _crop_w - 2, _crop_h - 2, imgborder, skewP, -skewP, skewDir, true, false);
                                } else if (imgdraw.imgshape == UI.SHAPE.ELLIPSE) {
                                    this.ellipseRect(BGCtx, 0, 0, _crop_w + imgborder * 2, _crop_h + imgborder * 2, true, false);
                                } else {
                                    this.roundedRect(BGCtx, -_shiftX - imgborder, -_shiftY - imgborder, _crop_w + imgborder * 2, _crop_h + imgborder * 2, (imgradius > 0) ? imgradius + imgborder : 0, true, false);
                                }
                            }
                            BGCtx.shadowColor = "transparent";

                            // draw border   
                            if (imgdraw.imgborder > 0) {
                                BGCtx.strokeStyle = imgdraw.imgbordercolor;
                                if (imgdraw.imgshape == UI.SHAPE.TRAPEZOID) {
                                    this.skewedRect(BGCtx, -(_shiftX), -(_shiftY), _crop_w, _crop_h, 0, skewA, skewB, skewDir, false, true);
                                } else if (imgdraw.imgshape == UI.SHAPE.PARALLELOGRAM) {
                                    this.skewedRect(BGCtx, -(_shiftX), -(_shiftY), _crop_w, _crop_h, 0, skewP, -skewP, skewDir, false, true);
                                } else if (imgdraw.imgshape == UI.SHAPE.ELLIPSE) {
                                    this.ellipseRect(BGCtx, 0, 0, _crop_w, _crop_h, false, true);
                                } else {
                                    this.roundedRect(BGCtx, -(_shiftX), -(_shiftY), _crop_w, _crop_h, imgradius, false, true);
                                }
                                // cut out excess border
                                BGCtx.fillStyle = "#ffffff";
                                BGCtx.globalCompositeOperation = "destination-out";
                                if (imgdraw.imgshape == UI.SHAPE.TRAPEZOID) {
                                    this.skewedRect(BGCtx, -(_shiftX), -(_shiftY), _crop_w, _crop_h, 0, skewA, skewB, skewDir, true, false);
                                } else if (imgdraw.imgshape == UI.SHAPE.PARALLELOGRAM) {
                                    this.skewedRect(BGCtx, -(_shiftX), -(_shiftY), _crop_w, _crop_h, 0, skewP, -skewP, skewDir, true, false);
                                } else if (imgdraw.imgshape == UI.SHAPE.ELLIPSE) {
                                    this.ellipseRect(BGCtx, 0, 0, _crop_w - 2, _crop_h - 2, true, false);
                                } else {
                                    this.roundedRect(BGCtx, -(_shiftX) + 1, -(_shiftY) + 1, _crop_w - 2, _crop_h - 2, imgradius, true, false);
                                }
                                BGCtx.globalCompositeOperation = "source-over";
                            }
                            if (isimgsm) {

                                var _w = this.imgcanvas[findex].width;
                                var _h = this.imgcanvas[findex].height;

                                BGCtx.drawImage(this.imgcanvas[findex], 0, 0, _w, _h,
                                        -parseInt(_shiftX), -parseInt(_shiftY), _w, _h);

                                this.ctx.drawImage(BGCanvas, -(_imgx + _moveX + _shiftX), -(_imgy + _moveY + _shiftY));
                            }

                        } else {
                            BGCtx.translate((_imgx + _moveX + _shiftX), (_imgy + _moveY + _shiftY));
                            BGCtx.rotate(deg * Math.PI / 180);

                            this.ctx.globalAlpha = imgalpha;

                            if (imgdraw.imgshadowOn) {
                                if (imgdraw.imgshape == UI.SHAPE.TRAPEZOID) {
                                    this.skewedRect(BGCtx, -(_moveX + _shiftX), -(_moveY + _shiftY), w, h, imgborder, skewA, skewB, skewDir, true, false);
                                } else if (imgdraw.imgshape == UI.SHAPE.PARALLELOGRAM) {
                                    this.skewedRect(BGCtx, -(_moveX + _shiftX), -(_moveY + _shiftY), w, h, imgborder, skewP, -skewP, skewDir, true, false);
                                } else if (imgdraw.imgshape == UI.SHAPE.ELLIPSE) {
                                    this.ellipseRect(BGCtx, -_moveX, -_moveY, w + imgborder * 2, h + imgborder * 2, true, false);
                                } else {
                                    this.roundedRect(BGCtx, -_moveX - _shiftX - imgborder, -_moveY - _shiftY - imgborder, w + imgborder * 2, h + imgborder * 2, (imgradius > 0) ? imgradius + imgborder : 0, true, false);
                                }
                            }
                            BGCtx.shadowColor = "transparent";

                            if (isimgsm) {
                                // draw border   
                                if (imgdraw.imgborder > 0) {
                                    BGCtx.strokeStyle = imgdraw.imgbordercolor;
                                    if (imgdraw.imgshape == UI.SHAPE.TRAPEZOID) {
                                        this.skewedRect(BGCtx, -(_moveX + _shiftX), -(_moveY + _shiftY), w, h, 0, skewA, skewB, skewDir, false, true);
                                    } else if (imgdraw.imgshape == UI.SHAPE.PARALLELOGRAM) {
                                        this.skewedRect(BGCtx, -(_moveX + _shiftX), -(_moveY + _shiftY), w, h, 0, skewP, -skewP, skewDir, false, true);
                                    } else if (imgdraw.imgshape == UI.SHAPE.ELLIPSE) {
                                        this.ellipseRect(BGCtx, -_moveX, -_moveY, w, h, false, true);
                                    } else {
                                        BGCtx.fillStyle = imgdraw.imgbordercolor;
                                        this.roundedRect(BGCtx, -_moveX - _shiftX - imgborder, -_moveY - _shiftY - imgborder, w + imgborder * 2, h + imgborder * 2, (imgradius > 0) ? imgradius + imgborder : 0, true, false);
                                        //                                this.roundedRect(BGCtx, -(_moveX + _shiftX), -(_moveY + _shiftY), w, h, (imgradius > 0) ? imgradius + imgborder : 0, false, true);
                                    }
                                    // cut out excess border
                                    BGCtx.fillStyle = "#ffffff";
                                    BGCtx.globalCompositeOperation = "destination-out";
                                    if (imgdraw.imgshape == UI.SHAPE.TRAPEZOID) {
                                        this.skewedRect(BGCtx, -(_moveX + _shiftX), -(_moveY + _shiftY), w, h, 0, skewA, skewB, skewDir, true, false);
                                    } else if (imgdraw.imgshape == UI.SHAPE.PARALLELOGRAM) {
                                        this.skewedRect(BGCtx, -(_moveX + _shiftX), -(_moveY + _shiftY), w, h, 0, skewP, -skewP, skewDir, true, false);
                                    } else if (imgdraw.imgshape == UI.SHAPE.ELLIPSE) {
                                        this.ellipseRect(BGCtx, -_moveX, -_moveY, w - 2, h - 2, true, false);
                                    } else {
                                        this.roundedRect(BGCtx, -(_moveX + _shiftX) + 1, -(_moveY + _shiftY) + 1, w - 2, h - 2, imgradius, true, false);
                                    }
                                    BGCtx.globalCompositeOperation = "source-over";
                                }


                                BGCtx.drawImage(this.imgcanvas[findex], -(_moveX + _shiftX), -(_moveY + _shiftY), w, h);

                                this.ctx.drawImage(BGCanvas, -(_imgx + _moveX + _shiftX), -(_imgy + _moveY + _shiftY));
                            }

                        }
                        this.ctx.translate(-(_imgx + _moveX + _shiftX), -(_imgy + _moveY + _shiftY));
                    }
                } catch (err) {

                }
                this.ctx.globalAlpha = 1;
                this.ctx.restore();

            }
            this.ctx.save();
            // highlight current image selection
            if (UI.console == UI.CNSL.SHAPETOOLBAR && UI.console_shape == UI.CNSL.SHAPETOOLDRAW) {
                // skip
            } else if (UI.resizeCVS) {
                // skip 
            } else if (findex === parseInt(WPImager.current) && WPImager.canvas.picktool == 1) {
                if (UI.isCropping) {
                    this.icropdraw_guide(0.92, "#ffffff", WPImager.current);
                } else if (UI.isTransforming) {
                    this.icropdraw_guide(0.92, "#ffffff", WPImager.current);
                } else {
                    var color = (WPImager.layer[WPImager.current].locked) ? "#aa1111" : "#4285f4";
                    color = (WPImager.layer[WPImager.current].slide == 0) ? "#008000" : color;
                    this.iphotodraw_guide(0.92, color, WPImager.current);
                }
            } else if (WPImager.multiselect.indexOf(findex) !== -1) {
                var color = (WPImager.layer[findex].locked) ? "#aa1111" : "#ffffff";
                this.iphotodraw_guide(0.92, color, findex);
            } else if (UI.hitLayer > 0) {
                if (findex !== parseInt(WPImager.current) || (findex === parseInt(WPImager.current) && WPImager.canvas.picktool == 0))
                {
                    var hitimage = parseInt(UI.hitLayer);
                    if (hitimage == findex) {
                        this.iphotodraw_guide(0.92, "white", hitimage);
                    }
                }
            }
            this.ctx.restore();
        },
        // generate thumbnail for dashboard
        resize_thumb: function (thumbCtx, ratio) {

            var cvtemp = document.getElementById('cvtemp');
            var cvtempCtx = cvtemp.getContext('2d');
            this.cW /= 2;
            this.cH /= 2;

            if (this.cW < 200) {
                this.cW = 200;
                this.cH = this.cW / ratio;
            }

            this.cW = parseInt(this.cW); // IE11
            this.cH = parseInt(this.cH);

            cvtemp.width = this.cW;
            cvtemp.height = this.cH;

            cvtempCtx.save();
            cvtempCtx.drawImage(thumbnail, 0, 0, this.cW, this.cH);

            if (this.cW <= 200) {

                var x = 0, y = 0, width = this.cW, height = this.cH;

                thumbnail.width = this.cW;
                thumbnail.height = this.cH;
                thumbCtx.drawImage(cvtemp, 0, 0, this.cW, this.cH, 0, 0, this.cW, this.cH);
                cvtempCtx.restore();

                return;
            }
            thumbnail.width = this.cW;
            thumbnail.height = this.cH;
            thumbCtx.drawImage(cvtemp, 0, 0, this.cW, this.cH, 0, 0, this.cW, this.cH);
            cvtempCtx.restore();
            this.resize_thumb(thumbCtx, ratio);

        },
        resize_image: function (i) {
            if (i == 0) {
                this.draw();
                return;
            }
            if (WPImager.layer[i].code != UI.LAYER.IMAGE)
                return;

            if (typeof this.img_loaded[i] === "undefined")
                return;

            // check if image is hosted on local server
            var src = WPImager.layer[i].src;
            var parser = document.createElement('a');
            parser.href = src;
            if (window.location.hostname !== parser.hostname) {
                // image is hotlinked
                if (typeof this.imgsm[i] !== "undefined")
                    this.imgsm[i] = null;
                this.draw();
                return;
            }

            // initialize imgtemp, imgsm and imgcanvas once
            if (typeof this.imgtemp[i] === "undefined")
                this.imgtemp[i] = new Image();
            if (typeof this.imgsm[i] === "undefined") {
                this.imgsm[i] = new Image();
                this.imgcanvas[i] = document.createElement('canvas');
            }
            if (src === "") {
                // layer is empty, awaiting upload or media selection
                this.draw();
                return;
            }

            // starting to resize
            var imgdraw = WPImager.layer[i];
            type = 'image/png';
            quality = 0.95;
            this.cW = imgdraw.imgwidth_ori;
            this.cH = imgdraw.imgheight_ori;

            if (this.cW == 0 || this.cH == 0)
                return;

            var imgcontext = this.imgcanvas[i].getContext('2d');
            if (UI.isResizeDrag && WPImager.current == i
                    && (imgdraw.imgshape == UI.SHAPE.PARALLELOGRAM
                            || imgdraw.imgshape == UI.SHAPE.TRAPEZOID)) {
                //   
            } else {
                this.imgcanvas[i].width = this.cW;
                this.imgcanvas[i].height = this.cH;
            }
            if (imgdraw.imgshape == UI.SHAPE.PARALLELOGRAM
                    || imgdraw.imgshape == UI.SHAPE.TRAPEZOID) {
                var px = 0;
                var py = 0;
                // 12345
                var skewA = imgdraw.imgskewA;// * (imgdraw.imgheight / imgdraw.imgheight_ori);
                var skewB = imgdraw.imgskewB;
                var skewP = imgdraw.imgskewP;

                if (UI.isResizeDrag && WPImager.current == i) {

                } else if ((imgdraw.imgshape == UI.SHAPE.TRAPEZOID && skewA == 0 && skewB == 0)
                        || (imgdraw.imgshape == UI.SHAPE.PARALLELOGRAM && skewP == 0)) {
                    if (imgdraw.imgcrop_h == 0 || imgdraw.imgcrop_w == 0) {
                        imgcontext.drawImage(this.img[i], 0, 0, (this.cW), (this.cH));
                    } else {
                        this.cW = imgdraw.imgcrop_w;
                        this.cH = imgdraw.imgcrop_h;
                        this.imgcanvas[i].width = this.cW;
                        this.imgcanvas[i].height = this.cH;
                        imgcontext.drawImage(this.img[i], imgdraw.imgcrop_x, imgdraw.imgcrop_y, this.cW, this.cH, 0, 0, this.cW, this.cH);
                    }
                } else {
                    var p;
                    if (imgdraw.imgcrop_h == 0 || imgdraw.imgcrop_w == 0) {
                        this.imgcanvas[i].height = this.cH;
                        p = new Perspective(imgcontext, this.img[i], 0, 0, this.cW, this.cH, 0);
                    } else {
                        // image cropped
                        this.cW = imgdraw.imgcrop_w;
                        this.cH = imgdraw.imgcrop_h;
                        this.imgcanvas[i].width = this.cW;
                        this.imgcanvas[i].height = this.cH;
                        p = new Perspective(imgcontext, this.img[i], imgdraw.imgcrop_x, imgdraw.imgcrop_y, this.cW, this.cH, 0);
                    }

                    if (imgdraw.imgshape == UI.SHAPE.PARALLELOGRAM) {
                        if (imgdraw.imgskewDir == 1) {
                            if (skewP > 0) {
                                p.draw([[0, 0], [this.cW, skewP], [this.cW, this.cH], [0, this.cH - skewP]], px, py, 0);
                            } else if (skewP < 0) {
                                p.draw([[0, -skewP], [this.cW, 0], [this.cW, this.cH + skewP], [0, this.cH]], px, py, 0);
                            }
                        } else {
                            if (skewP > 0) {
                                p.draw([[skewP, 0], [this.cW, 0], [this.cW - skewP, this.cH], [0, this.cH]], px, py, 0);
                            } else if (skewP < 0) {
                                p.draw([[0, 0], [this.cW + skewP, 0], [this.cW, this.cH], [0 - skewP, this.cH]], px, py, 0);
                            }

                        }
                    } else if (imgdraw.imgshape == UI.SHAPE.TRAPEZOID) {
                        var overlap = 0;

                        if (imgdraw.imgskewDir == 1) {
                            skewA = (skewA > this.cH ? this.cH : skewA);
                            skewA = (skewA < -this.cH ? -this.cH : skewA);
                            skewB = (skewB > this.cH ? this.cH : skewB);
                            skewB = (skewB < -this.cH ? -this.cH : skewB);
                            // vertical skew
                            if (skewA >= 0 && skewB >= 0) {
                                overlap = (this.cH - (skewA + skewB)) / 2;
                                if (overlap < 0) {
                                    skewA += overlap;
                                    skewB += overlap;
                                }
                                p.draw([[0, 0], [this.cW, skewA], [this.cW, this.cH - skewB], [0, this.cH]], px, py, 0);
                            } else if (skewA >= 0 && skewB <= 0) {
                                p.draw([[0, 0], [this.cW, skewA], [this.cW, this.cH], [0, this.cH + skewB]], px, py, 0);
                            } else if (skewA <= 0 && skewB >= 0) {
                                p.draw([[0, -skewA], [this.cW, 0], [this.cW, this.cH - skewB], [0, this.cH]], px, py, 0);
                            } else if (skewA <= 0 && skewB <= 0) {
                                overlap = (this.cH + (skewA + skewB)) / 2;
                                if (overlap < 0) {
                                    skewA += -overlap;
                                    skewB += -overlap;
                                }
                                p.draw([[0, -skewA], [this.cW, 0], [this.cW, this.cH], [0, this.cH + skewB]], px, py, 0);
                            }
                        } else {
                            skewA = (skewA > this.cW ? this.cW : skewA);
                            skewA = (skewA < -this.cW ? -this.cW : skewA);
                            skewB = (skewB > this.cW ? this.cW : skewB);
                            skewB = (skewB < -this.cW ? -this.cW : skewB);
                            // horizontal skew
                            if (skewA >= 0 && skewB >= 0) {
                                overlap = (this.cW - (skewA + skewB)) / 2;
                                if (overlap < 0) {
                                    skewA += overlap;
                                    skewB += overlap;
                                }
                                p.draw([[skewA, 0], [this.cW - skewB, 0], [this.cW, this.cH], [0, this.cH]], px, py, 0);
                            } else if (skewA >= 0 && skewB <= 0) {
                                p.draw([[skewA, 0], [this.cW, 0], [this.cW + skewB, this.cH], [0, this.cH]], px, py, 0);
                            } else if (skewA <= 0 && skewB >= 0) {
                                p.draw([[0, 0], [this.cW - skewB, 0], [this.cW, this.cH], [-skewA, this.cH]], px, py, 0);
                            } else if (skewA <= 0 && skewB <= 0) {
                                overlap = (this.cW + (skewA + skewB)) / 2;
                                if (overlap < 0) {
                                    skewA += -overlap;
                                    skewB += -overlap;
                                }
                                p.draw([[0, 0], [this.cW, 0], [this.cW + skewB, this.cH], [-skewA, this.cH]], px, py, 0);
                            }
                        }
                    }
                    //   context.drawImage(this.imgcanvas[i], 0, 0, (this.cW), (this.cH));
                }
            } else {
                if (UI.isCropping && i == WPImager.current) {
                    var scaleX = imgdraw.imgwidth_ori / imgdraw.imgwidth;
                    var scaleY = imgdraw.imgheight_ori / imgdraw.imgheight;
                    this.cW = UI.cropBox.width * scaleX;
                    this.cH = UI.cropBox.height * scaleY;
                    this.imgcanvas[i].width = this.cW;
                    this.imgcanvas[i].height = this.cH;
                    imgcontext.drawImage(this.img[i], UI.cropBox.x * scaleX, UI.cropBox.y * scaleY, this.cW, this.cH, 0, 0, this.cW, this.cH);
                } else if (imgdraw.imgcrop_h == 0 || imgdraw.imgcrop_w == 0) {
                    imgcontext.drawImage(this.img[i], 0, 0, this.cW, this.cH, 0, 0, this.cW, this.cH);
                } else {
                    // image cropped
                    this.cW = imgdraw.imgcrop_w;
                    this.cH = imgdraw.imgcrop_h;
                    this.imgcanvas[i].width = this.cW;
                    this.imgcanvas[i].height = this.cH;
                    imgcontext.drawImage(this.img[i], imgdraw.imgcrop_x, imgdraw.imgcrop_y, this.cW, this.cH, 0, 0, this.cW, this.cH);
                }
            }

            var quickresize = false;
            if (UI.isPrinting && UI.isCropping) {

            } else if (UI.isCropping || UI.isRecropDrag || UI.isResizeDrag) {
                // do quick resize to avoid non responsive canvas 
                quickresize = true;
            } else if (this.cW < imgdraw.imgwidth || this.cH < imgdraw.imgheight) {
                if (imgdraw.imgcrop_h == 0 || imgdraw.imgcrop_w == 0) {
                    // target size is larger than original size
                    quickresize = true;
                }
            }

            if (quickresize) {
                this.quick_resize(i);
                this.draw();
                this.imgsm_loaded[i] = 1;
            } else {
                this.doresize_image(i);
            }

        },
        // quickly resize the image without anti-aliasing
        quick_resize: function (i) {
            var imgdraw = WPImager.layer[i];
            var radius = (imgdraw.imgshape == UI.SHAPE.CIRCLE) ? imgdraw.imgwidth / 2 + 1 : imgdraw.imgradius;

            // use temp canvas for mask
            var cvtemp = document.getElementById('cvtemp');
            var ctxtemp = cvtemp.getContext('2d');


            var scaleX = imgdraw.imgwidth / imgdraw.imgwidth_ori;
            var scaleY = imgdraw.imgheight / imgdraw.imgheight_ori;
            if (imgdraw.imgcrop_h == 0 || imgdraw.imgcrop_w == 0) {
                this.cW = imgdraw.imgwidth;
                this.cH = imgdraw.imgheight;
            } else {
                this.cW = imgdraw.imgcrop_w * scaleX;
                this.cH = imgdraw.imgcrop_h * scaleY;
            }

            cvtemp.width = this.cW;
            cvtemp.height = this.cH;
            var imgcontext = this.imgcanvas[i].getContext('2d');
            ctxtemp.drawImage(this.imgcanvas[i], 0, 0, this.cW, this.cH);

            // background shape
            if (imgdraw.imgshape == UI.SHAPE.PARALLELOGRAM
                    || imgdraw.imgshape == UI.SHAPE.TRAPEZOID) {
                // no corner radius for trapezoid & parallelogram
            } else if (radius > 0 || (imgdraw.imgcrop_w > 0 && imgdraw.imgcrop_h > 0)) {
                // handle image with corner radius 
                ctxtemp.globalCompositeOperation = 'destination-in';

                ctxtemp.beginPath();

                var x = 0, y = 0, width = this.cW, height = this.cH;

                // if is cropping use cropbox dimension
                if (UI.isCropping) {
                    width = UI.cropBox.width;
                    height = UI.cropBox.height;
                } else if (imgdraw.imgcrop_w > 0 && imgdraw.imgcrop_h > 0) {
                    // image is cropped, calculate actual width, height, coordinates
                    width = imgdraw.imgcrop_w * scaleX;
                    height = imgdraw.imgcrop_h * scaleY;
                }

                // limit radius to half the height or width
                if (radius > width / 2 || radius > height / 2) {
                    radius = (width > height) ? (height / 2) : (width / 2);
                }

                if (imgdraw.imgshape == UI.SHAPE.ELLIPSE) {
                    // ctxtemp.ellipse(x + width/2, y + height/2, width/2, height/2, 0, 0, 2 * Math.PI );   
                    this.emulateEllipse(ctxtemp, x, y, width, height);
                } else {
                    // draw top and top right corner
                    ctxtemp.moveTo(x + radius, y);
                    ctxtemp.arcTo(x + width, y, x + width, y + radius, radius);

                    // draw right side and bottom right corner
                    ctxtemp.arcTo(x + width, y + height, x + width - radius, y + height, radius);

                    // draw bottom and bottom left corner
                    ctxtemp.arcTo(x, y + height, x, y + height - radius, radius);

                    // draw left and top left corner
                    ctxtemp.arcTo(x, y, x + radius, y, radius);
                }
                ctxtemp.fill();
            } else if (imgdraw.imgshape == UI.SHAPE.ELLIPSE) {
                var x = 0, y = 0, width = this.cW, height = this.cH;
                ctxtemp.globalCompositeOperation = 'destination-in';
                ctxtemp.beginPath();
                this.emulateEllipse(ctxtemp, x, y, width, height);
                ctxtemp.fill();
            }

            this.cW = parseInt(this.cW); // IE11
            this.cH = parseInt(this.cH);

            this.imgcanvas[i].width = this.cW;
            this.imgcanvas[i].height = this.cH;
            // transfer temp canvas to image canvas
            imgcontext.drawImage(cvtemp, 0, 0, (this.cW), (this.cH), 0, 0, (this.cW), (this.cH));
            this.imgsm_loaded[i] = 1;
        },
        // resize image using step down for anti-aliasing 
        doresize_image: function (id) {
            var context;
            var _isDrawing = UI.isDrawing;
            UI.isDrawing = false;

            var imgdraw = WPImager.layer[id];
            var radius = (imgdraw.imgshape == UI.SHAPE.CIRCLE) ? imgdraw.imgwidth / 2 + 1 : imgdraw.imgradius;


            // use temp canvas to step down image size
            var canvas = document.getElementById('cvtemp');
            var context = canvas.getContext('2d');
            // step down half the size at a time
            this.cW /= 2;
            this.cH /= 2;

            var resize_end = false;
            var scaleX = imgdraw.imgwidth / imgdraw.imgwidth_ori;
            var scaleY = imgdraw.imgheight / imgdraw.imgheight_ori;

            // if desired size reached
            if (UI.isCropping && i == WPImager.canvas.current) {
                var scaleX = imgdraw.imgwidth_ori / imgdraw.imgwidth;
                var scaleY = imgdraw.imgheight_ori / imgdraw.imgheight;
                if (this.cW < UI.cropBox.width || this.cH < UI.cropBox.height) {
                    this.cW = UI.cropBox.width;
                    this.cH = UI.cropBox.height;
                    resize_end = true;
                }

            } else if (imgdraw.imgcrop_h == 0 || imgdraw.imgcrop_w == 0) {
                if (this.cW < imgdraw.imgwidth || this.cH < imgdraw.imgheight) {
                    this.cW = imgdraw.imgwidth;
                    this.cH = imgdraw.imgheight;
                    resize_end = true;
                }
            } else {
                if (this.cW < imgdraw.imgcrop_w * scaleX
                        || this.cH < imgdraw.imgcrop_h * scaleY) {
                    this.cW = imgdraw.imgcrop_w * scaleX;
                    this.cH = imgdraw.imgcrop_h * scaleY;
                    resize_end = true;
                }
            }
            var i = id;
            this.cW = parseInt(this.cW); // IE11
            this.cH = parseInt(this.cH);

            canvas.width = this.cW;
            canvas.height = this.cH;
            var imgcontext = this.imgcanvas[i].getContext('2d');

            context.save();
            // draw canvas layer back on temp canvas
            context.drawImage(this.imgcanvas[i], 0, 0, (this.cW), (this.cH));


            // if desired size reached
            if (resize_end) {

                if (imgdraw.imgblur > 0) {
                    stackBlurCanvasRGB("cvtemp", 0, 0, parseInt(this.cW), parseInt(this.cH), imgdraw.imgblur);
                }
                var x = 0, y = 0, width = this.cW, height = this.cH;

                // calc actual size
                if (UI.isCropping) {
                    width = UI.cropBox.width;
                    height = UI.cropBox.height;
                } else if (imgdraw.imgcrop_w > 0 && imgdraw.imgcrop_h > 0) {
                    var scaleX = imgdraw.imgwidth / imgdraw.imgwidth_ori;
                    var scaleY = imgdraw.imgheight / imgdraw.imgheight_ori;
                    width = (imgdraw.imgcrop_w * scaleX);
                    height = (imgdraw.imgcrop_h * scaleY);
                }

                if (imgdraw.imgshape == UI.SHAPE.PARALLELOGRAM
                        || imgdraw.imgshape == UI.SHAPE.TRAPEZOID) {
                    // no corner radius for trapezoid & parallelogram
                } else if (radius > 0) {
                    // handle image with corner radius 
                    context.globalCompositeOperation = 'destination-in';

                    context.beginPath();

                    // limit radius to half the height or width
                    if (radius > width / 2 || radius > height / 2) {
                        radius = (width > height) ? (height / 2) : (width / 2);
                    }
                    if (imgdraw.imgshape == UI.SHAPE.ELLIPSE) {
                        // context.ellipse(x + width/2, y + height/2, width/2, height/2, 0, 0, 2 * Math.PI );   
                        this.emulateEllipse(context, x, y, width, height);
                    } else {
                        // draw top and top right corner
                        context.moveTo(x + radius, y);
                        context.arcTo(x + width, y, x + width, y + radius, radius);

                        // draw right side and bottom right corner
                        context.arcTo(x + width, y + height, x + width - radius, y + height, radius);

                        // draw bottom and bottom left corner
                        context.arcTo(x, y + height, x, y + height - radius, radius);

                        // draw left and top left corner
                        context.arcTo(x, y, x + radius, y, radius);
                    }
                    context.fill();

                } else {
                    if (imgdraw.imgshape == UI.SHAPE.ELLIPSE) {
                        context.globalCompositeOperation = 'destination-in';
                        context.beginPath();
                        //context.ellipse(x + width/2, y + height/2, width/2, height/2, 0, 0, 2 * Math.PI );   
                        this.emulateEllipse(context, x, y, width, height);
                        context.fill();
                    }
                }



                this.imgcanvas[i].width = this.cW;
                this.imgcanvas[i].height = this.cH;
                // transfer temp canvas to image canvas 
                imgcontext.drawImage(canvas, 0, 0, this.cW, this.cH, 0, 0, (this.cW), (this.cH));

                var imgcvs = document.getElementById('imgcanvas');
                var imgcvsctx = imgcvs.getContext('2d');
                imgcvs.width = this.imgcanvas[i].width;
                imgcvs.height = this.imgcanvas[i].height;
                imgcvsctx.drawImage(this.imgcanvas[i], 0, 0, this.cW, this.cH);

                this.imgsm_loaded[i] = 1;
//                this.draw();
                WPImagerUI.imagedraw(i);
                UI.isDrawing = _isDrawing;
                context.restore();
                //  end of resize
                return;
            }

            this.imgcanvas[i].width = this.cW;
            this.imgcanvas[i].height = this.cH;
            imgcontext.drawImage(canvas, 0, 0, this.cW, this.cH);

            context.restore();
            // keep resizing until desired size
            this.doresize_image(i);

        },
        iphotodraw_guide: function (alpha, color, i) {
            if (UI.isPrinting || UI.isCropping)
                return;
            var imgdraw = WPImager.layer[i];
            var thisimg = this.img[i];

            var scaleX = imgdraw.imgwidth / imgdraw.imgwidth_ori;
            var scaleY = imgdraw.imgheight / imgdraw.imgheight_ori;
            var dw = imgdraw.imgcrop_w * scaleX;
            var dh = imgdraw.imgcrop_h * scaleY;
            if (imgdraw.imgcrop_h == 0 || imgdraw.imgcrop_w == 0) {
                var x = imgdraw.imgx;
                var y = imgdraw.imgy;
                var h = imgdraw.imgheight;
                var w = imgdraw.imgwidth;
                var moveX = 0;
                var moveY = 0;
                var shiftX = w / 2;
                var shiftY = h / 2;
                dw = w;
                dh = h;
                var borderGap = imgdraw.borderPlusGap();
                var borderGap2 = borderGap * 2;

                if (i == WPImager.current && WPImager.canvas.picktool == 1) {
                    if (WPImager.multiselect.length == 0) {
                        var deg = imgdraw.imgrotation;
                        this.draw_current_guide(color, x - borderGap, y - borderGap, w + borderGap2, h + borderGap2, moveX, moveY, shiftX, shiftY, dw + borderGap2, dh + borderGap2, deg, this.degMax, UI.isRotating, imgdraw.locked);
                    } else if (!UI.isPrinting && UI.expectPoint == -1) {
                        var deg = imgdraw.imgrotation;
                        this.draw_expect_guide(1, color, x - borderGap, y - borderGap, w + borderGap2, h + borderGap2, moveX, moveY, shiftX, shiftY, dw + borderGap2, dh + borderGap2, deg, false);
                    }
                } else if (!UI.isPrinting && UI.expectPoint == -1) {
                    this.draw_expect_guide(1, color, x - borderGap, y - borderGap, w + borderGap2, h + borderGap2, moveX, moveY, shiftX, shiftY, dw + borderGap2, dh + borderGap2, imgdraw.imgrotation, false);
                }


            } else {

                var x = imgdraw.imgx;
                var y = imgdraw.imgy;
                var h = imgdraw.imgheight; // thisimg.height;
                var w = imgdraw.imgwidth; // thisimg.width;
                var moveX = imgdraw.imgcrop_x * scaleX;
                var moveY = imgdraw.imgcrop_y * scaleY;
                var borderGap = imgdraw.borderPlusGap();
                var borderGap2 = borderGap * 2;

                shiftX = imgdraw.imgcrop_w * scaleX / 2;
                shiftY = imgdraw.imgcrop_h * scaleY / 2;
                if (i == WPImager.current && WPImager.canvas.picktool == 1) {
                    if (WPImager.multiselect.length == 0) {
                        var deg = imgdraw.imgrotation;
                        this.draw_current_guide(color, x - borderGap, y - borderGap, w + borderGap2, h + borderGap2, moveX, moveY, shiftX, shiftY, dw + borderGap2, dh + borderGap2, deg, this.degMax, UI.isRotating, imgdraw.locked);
                    } else if (!UI.isPrinting) {
                        this.draw_expect_guide(1, color, x - borderGap, y - borderGap, w + borderGap2, h + borderGap2, moveX, moveY, shiftX, shiftY, dw + borderGap2, dh + borderGap2, imgdraw.imgrotation, false);
                    }

                } else if (!UI.isPrinting && UI.expectPoint == -1) {
                    this.draw_expect_guide(1, color, x - borderGap, y - borderGap, w + borderGap2, h + borderGap2, moveX, moveY, shiftX, shiftY, dw + borderGap2, dh + borderGap2, imgdraw.imgrotation, false);
                }
            }
        },
        icropdraw_guide: function (alpha, color, i) {
            if (UI.isPrinting)
                return;
            var imgdraw = WPImager.layer[i];
            var scaleX = imgdraw.imgwidth / imgdraw.imgwidth_ori;
            var scaleY = imgdraw.imgheight / imgdraw.imgheight_ori;
            moveX = imgdraw.imgcrop_x * scaleX;
            moveY = imgdraw.imgcrop_y * scaleY;
            shiftX = imgdraw.imgcrop_w * scaleX / 2;
            shiftY = imgdraw.imgcrop_h * scaleY / 2;
            var deg = imgdraw.imgrotation;
            var x = imgdraw.imgx, y = imgdraw.imgy;
            this.draw_crop_guide(color, x, y, moveX, moveY, shiftX, shiftY, deg, this.degMax);
        },
        draw: function () {
            if (WPImager.boot === 0)
                return;
            if (UI.isDrawing) {
                return;
            }
            if (UI.skipDrawing) {
                return;
            }
            UI.isDrawing = true;
            this.ctx.save();
            //if (typeof clearBackground !== "undefined" && clearBackground) 
            if (UI.isPrinting)
            {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
            this.ctx.textAlign = "start";
            this.ctx.textBaseline = "alphabetic";
            // clear canvas background
            var height = WPImager.canvas.height;
            if (height != this.canvas.height) {
                this.canvas.height = height;
            }
            var width = WPImager.canvas.width;
            if (width != this.canvas.width) {
                this.canvas.width = width;
            }
            if (UI.isCropping && UI.isPrinting) {
                // no background when cropping to new layer
//            } else if (WPImager.canvas.background != "#0000ffff") {
//                // paint canvas background
//                this.ctx.fillStyle = WPImager.canvas.background;
//                this.ctx.fillRect(0, 0, width, height);
            } else if (!UI.isPrinting) {
                // draw checked pattern for transparent background
                if (WPImager.slides[WPImager.slide].bgpattern == 0) {
                    this.ctx.fillStyle = this.checkeredDark;
                } else {
                    this.ctx.fillStyle = this.checkeredLight;
                }
                this.ctx.fillRect(0, 0, width, height);
                // skip checked pattern if printing canvas
            }

            this.draw_slide(WPImager.slide);

            if (UI.resizeCVS) {
                var cW = WPImager.slides[WPImager.slide].canvas_width;
                var cH = WPImager.slides[WPImager.slide].canvas_height;
                WPImagerUI.ctx.beginPath();

                WPImagerUI.ctx.lineCap = "square";
                WPImagerUI.ctx.lineWidth = 10;
                WPImagerUI.ctx.moveTo(cW, cH);
                WPImagerUI.ctx.lineTo(cW - 20, cH);
                WPImagerUI.ctx.moveTo(cW, cH);
                WPImagerUI.ctx.lineTo(cW, cH - 20);
                WPImagerUI.ctx.strokeStyle = '#eaeaea';
                WPImagerUI.ctx.shadowColor = "#000000";
                WPImagerUI.ctx.shadowBlur = 4;
                WPImagerUI.ctx.stroke();

                WPImagerUI.ctx.shadowColor = "#111111";
                WPImagerUI.ctx.fillStyle = "#eaeaea";
                WPImagerUI.ctx.fillRect(cW / 2 - 15, cH - 5, 30, 5);
                WPImagerUI.ctx.fillRect(cW - 5, cH / 2 - 15, 5, 30);
                WPImagerUI.ctx.translate(cW - 16, cH - 16);
                WPImagerUI.ctx.font = "16px Fontawesome";
                WPImagerUI.ctx.fillStyle = "#ffffff";
                WPImagerUI.ctx.textAlign = "center";
                WPImagerUI.ctx.textBaseline = 'middle';
                var txtDimension = WPImager.canvas.width.toString() + 'x' + WPImager.canvas.height.toString();
                var outChars = {};
                if (UI.expectResizeCVS == 7) {
                    outChars = {rotateChar: 135, Charcode: 0xf062, CharcodeX: 0, CharcodeY: 0,
                        textAlign: "end", dimensionX: -10, dimensionY: -10};
                } else if (UI.expectResizeCVS == 6) {
                    outChars = {rotateChar: 180, Charcode: 0xf062, CharcodeX: cW / 2 - 16, CharcodeY: -1,
                        textAlign: "center", dimensionX: -(cW / 2 - 16), dimensionY: -16};
                } else if (UI.expectResizeCVS == 4) {
                    outChars = {rotateChar: 90, Charcode: 0xf062, CharcodeX: -cH / 2 + 16, CharcodeY: -1,
                        textAlign: "end", dimensionX: -16, dimensionY: -(cH / 2 - 16)};
                }

                if (UI.expectResizeCVS == 7 || UI.expectResizeCVS == 6 || UI.expectResizeCVS == 4) {
                    WPImagerUI.ctx.rotate(outChars.rotateChar * Math.PI / 180);
                    WPImagerUI.ctx.fillText(String.fromCharCode(outChars.Charcode), outChars.CharcodeX, outChars.CharcodeY);
                    WPImagerUI.ctx.rotate(-outChars.rotateChar * Math.PI / 180);
                    WPImagerUI.ctx.textAlign = outChars.textAlign;
                    if (WPImager.slides[WPImager.slide].bgpattern == 1)
                    {
                        WPImagerUI.ctx.shadowColor = "#ffffff";
                        WPImagerUI.ctx.fillStyle = "#111111";
                    }
                    WPImagerUI.ctx.fillText(txtDimension, outChars.dimensionX, outChars.dimensionY);
                    $("#cvs").css("cursor", 'none');
                } else {
                    $("#cvs").css("cursor", 'default');
                }
                WPImagerUI.ctx.translate(-cW + 16, -cH + 16);
                WPImagerUI.ctx.shadowBlur = 0;
                WPImagerUI.ctx.shadowColor = "transparent";
                this.ctx.restore();
                UI.isDrawing = false;
            }
            // if drawing new shape
            if (UI.console == UI.CNSL.SHAPETOOLBAR
                    && (UI.console_shape == UI.CNSL.SHAPETOOLNEW || UI.console_shape == UI.CNSL.SHAPETOOLNEWLINE)
                    && UI.pathPointNew.length > 0) {

                var coords = UI.pathPointNew.split(' ');
                var x = UI.parseFloat(coords[0]), y = UI.parseFloat(coords[1]);
                WPImagerUI.ctx.beginPath();
                WPImagerUI.ctx.fillStyle = "#eaeaea";
                WPImagerUI.ctx.fillRect(x - 4, y - 4, 8, 8);
                WPImagerUI.ctx.fillStyle = 'red';
                WPImagerUI.ctx.fillRect(coords[0] - 3, coords[1] - 3, 6, 6);

                // draw dotted line to mouse position
                WPImagerUI.ctx.beginPath();
                WPImagerUI.ctx.strokeStyle = 'red';
                WPImagerUI.ctx.lineWidth = 1;
                WPImagerUI.ctx.globalAlpha = 1;
                WPImagerUI.ctx.moveTo(x, y);
                if (UI.shift_pressed) {
                    var dx = UI.hoverX - x;
                    var dy = UI.hoverY - y;
                    if (Math.abs(dx) > Math.abs(dy)) {
                        WPImagerUI.ctx.lineTo(UI.hoverX, y);
                    } else {
                        WPImagerUI.ctx.lineTo(x, UI.hoverY);
                    }
                } else {
                    WPImagerUI.ctx.lineTo(UI.hoverX, UI.hoverY);
                }
                WPImagerUI.ctx.stroke();

            }


            // bring the layer to be cropped to the front
            if (UI.isCropping && WPImager.layer[WPImager.current].code == UI.LAYER.IMAGE) {
                WPImagerUI.imagedraw(WPImager.current);
            }

            this.ctx.restore();

            UI.isDrawing = false;

        },
        draw_slide: function (slide) {
            var maxOrder = SlideAction.getSlideMaxOrder();

            // draw all visible layers on canvas by order
            for (var order = 1; order <= maxOrder; order++)
            {
                var arrIndex = WPImager.canvas.arrIndex;
                for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                    var k = arrIndex[ix];
                    if (WPImager.layer[k].disposed === 1) {
                        // skip draw
                    } else if (WPImager.layer[k].slide === slide // ss0 || WPImager.layer[k].slide === 0)
                            && WPImager.layer[k].order === order) {
                        if (WPImager.slides[slide].mode == "kit" && slide > 0) {
                            // layer of kit slide
                            if (WPImager.layer[k].slide > 0 && WPImager.layer[k].code == UI.LAYER.TEXT &&
                                    (!UI.isCropping || !UI.isPrinting || (UI.isPrinting && WPImager.current == k))) {
                                WPImagerUI.drawText(k, WPImager.layer[k]);
                            } else if (WPImager.layer[k].slide > 0 && WPImager.layer[k].code == UI.LAYER.COM &&
                                    (!UI.isCropping || !UI.isPrinting || (UI.isPrinting && WPImager.current == k))) {
                                WPImager.layer[k].drawCOM(WPImager.slides[WPImager.slide].canvas_width, WPImager.slides[WPImager.slide].canvas_height);
                            }
                        } else if (WPImager.layer[k].code == UI.LAYER.TEXT) {
                            if (!UI.isCropping || !UI.isPrinting || (UI.isPrinting && WPImager.current == k)) {
                                WPImagerUI.drawText(k, WPImager.layer[k]);
                            }
                        } else if (WPImager.layer[k].code == UI.LAYER.IMAGE) {
                            if (WPImager.layer[k].flagresize) {
                                WPImager.layer[k].flagresize = false; // !important
                                WPImagerUI.resize_image(k); // will call draw again.
                            }
                            if (!UI.isCropping || !UI.isPrinting || (UI.isPrinting && WPImager.current == k)) {
                                WPImagerUI.imagedraw(k);
                            }
                        } else if (WPImager.layer[k].code == UI.LAYER.COM) {
                            if (!UI.isCropping || !UI.isPrinting || (UI.isPrinting && WPImager.current == k)) {
                                WPImager.layer[k].drawCOM(WPImager.slides[WPImager.slide].canvas_width, WPImager.slides[WPImager.slide].canvas_height);
                            }
                        } else if (typeof UI.addOnLayer[WPImager.layer[k].code] !== "undefined") {
                            // is not unknown layer
                            if (!UI.isCropping || !UI.isPrinting || (UI.isPrinting && WPImager.current == k)) {
                                WPImager.layer[k].draw();
                            }
                        }

                    }

                }
            }

        },
        draw_expect_guide: function (alpha, color, x, y, w, h, moveX, moveY, shiftX, shiftY, dw, dh, deg, midlines, isPrinting) {
            if (UI.comSlideRenderCanvas)
                return;
            if (UI.console_shape == UI.CNSL.SHAPETOOLDRAW)
                return;
            if (UI.isPrinting)
                return;
            if (UI.isCropping)
                return;
            if (UI.expectResize !== -1)
                return;
            if (typeof midlines === "undefined")
                midlines = true;
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.shadowColor = "#111111";
            this.ctx.shadowBlur = 3;
            var gl = dw / 20;
            gl = (gl < 20) ? 20 : gl;
            gl = (dw < 100 || dh < 100) ? 14 : gl;
            gl = (dw < 40 || dh < 40) ? 10 : gl;
            var lw = (dw < 100 || dh < 100) ? 4 : 6;
            var lw_half = (lw / 2);
            this.ctx.lineWidth = lw;
            this.ctx.beginPath();
            if (typeof color === "undefined")
                color = "white";
            this.ctx.strokeStyle = color;
            this.ctx.translate(x + moveX + shiftX, y + moveY + shiftY);
            this.ctx.rotate(deg * Math.PI / 180);
            this.ctx.translate(-shiftX, -shiftY);
            // top left corner
            this.ctx.moveTo(0, lw_half);
            this.ctx.lineTo(+gl, lw_half);
            this.ctx.moveTo(lw_half, lw_half);
            this.ctx.lineTo(lw_half, +gl);
            // top right corner
            this.ctx.moveTo(+dw, lw_half);
            this.ctx.lineTo(+dw - gl, lw_half);
            this.ctx.moveTo(+dw - lw_half, 0);
            this.ctx.lineTo(+dw - lw_half, +gl);
            if (midlines) {
                // top mid corner
                this.ctx.moveTo(dw / 2 - gl, lw_half);
                this.ctx.lineTo(dw / 2 + gl, lw_half);
                // bottom mid corner
                this.ctx.moveTo(dw / 2 - gl, dh - lw_half);
                this.ctx.lineTo(dw / 2 + gl, dh - lw_half);
                // left mid corner
                this.ctx.moveTo(lw_half, dh / 2 - gl);
                this.ctx.lineTo(lw_half, dh / 2 + gl);
                // right mid corner
                this.ctx.moveTo(dw - lw_half, dh / 2 - gl);
                this.ctx.lineTo(dw - lw_half, dh / 2 + gl);
            }
            // bottom left corner
            this.ctx.moveTo(0, +dh - lw_half);
            this.ctx.lineTo(+gl, +dh - lw_half);
            this.ctx.moveTo(lw_half, +dh);
            this.ctx.lineTo(lw_half, +dh - gl);
            // bottom right corner
            this.ctx.moveTo(+dw - lw_half, +dh - lw_half);
            this.ctx.lineTo(+dw - gl - lw_half, +dh - lw_half);
            this.ctx.moveTo(+dw - lw_half, +dh);
            this.ctx.lineTo(+dw - lw_half, +dh - gl);
            this.ctx.stroke();
            this.ctx.translate(shiftX, shiftY);
            this.ctx.rotate(-deg * Math.PI / 180);
            this.ctx.translate(-(x + moveX + shiftX), -(y + moveY + shiftY));
            this.ctx.closePath();
            this.ctx.shadowBlur = 0;
            this.ctx.shadowColor = "transparent";
            this.ctx.restore();
        },
        draw_current_guide: function (color, x, y, w, h, moveX, moveY, shiftX, shiftY, dw, dh, deg, degMax, isRotating, locked) {
            if (UI.resizeCVS)
                return;
            if (UI.comSlideRenderCanvas)
                return;
            if (UI.isPrinting)
                return;

            this.ctx.save();
            this.ctx.globalAlpha = 1;
            var gl = w / 20;
            gl = (gl < 20) ? 20 : gl;
            gl = (w < 100) ? 14 : gl;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            if (typeof color === "undefined")
                color = "white";
            if (UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN) {
                color = "blue";
            }
            this.ctx.translate(x + moveX + shiftX, y + moveY + shiftY);

            this.ctx.strokeStyle = color;
            this.ctx.rotate(deg * Math.PI / 180);
            this.ctx.translate(-shiftX, -shiftY);
            this.ctx.strokeRect(0, 0, dw, dh);
            // if (deg % 360 <= degMax && deg % 360 >= -degMax) 
            {
                var sq = 6;
                var sqhalf = 3;
                this.ctx.fillStyle = color;

                if (UI.console !== UI.CNSL.TXTEDIT && UI.console !== UI.CNSL.TXTEDITRETURN) {
                    var hBW = 10; // halfBarWWidth
                    var hBWC = 14; // halfBarWWidth Corners
                    var coords = [[0, 0, 0, hBWC, hBWC, 0, -45], // corner
                        [dw / 2, 0, -hBW, 0, hBW, 0, 0],
                        [dw, 0, -hBWC, 0, 0, hBWC, 45], // corner
                        [0, dh / 2, 0, -hBW, 0, hBW, -90],
                        [dw, dh / 2, 0, -hBW, 0, hBW, 90],
                        [0, dh, 0, -hBWC, hBWC, 0, -135], // corner
                        [dw / 2, dh, -hBW, 0, hBW, 0, 180],
                        [dw, dh, -hBWC, 0, 0, -hBWC, 135]] // corner;
                    // draw tiny circles on the corners
                    for (var i = 0; i < coords.length; i++) {
                        this.ctx.beginPath();
                        if (i !== UI.expectResize) {
                            this.ctx.arc(coords[i][0], coords[i][1], sqhalf, 0, Math.PI * 2, true);
                            this.ctx.fill();
                        }
                        this.ctx.lineWidth = 1;
                        this.ctx.strokeStyle = '#888888';
                        this.ctx.stroke();
                        if (i == 1 && !locked) { // && !is_frontend) {
                            this.ctx.beginPath();
                            this.ctx.moveTo(dw / 2, 0);
                            this.ctx.lineTo(dw / 2, -15);
                            this.ctx.strokeStyle = color;
                            this.ctx.stroke();
                        }
                    }

                    if (UI.expectResize >= 0 && UI.expectResize !== 8) {

                        this.ctx.translate(coords[UI.expectResize][0], coords[UI.expectResize][1]);
                        this.ctx.beginPath();
                        this.ctx.lineCap = "square";
                        this.ctx.lineWidth = 3;
                        this.ctx.moveTo(0, 0);
                        this.ctx.lineTo(coords[UI.expectResize][2], coords[UI.expectResize][3]);
                        this.ctx.moveTo(0, 0);
                        this.ctx.lineTo(coords[UI.expectResize][4], coords[UI.expectResize][5]);
                        this.ctx.strokeStyle = '#ffffff';
                        this.ctx.shadowColor = "#000000";
                        this.ctx.shadowBlur = 4;
                        this.ctx.stroke();
                        this.ctx.font = "16px Fontawesome";
                        this.ctx.fillStyle = "#ffffff";
                        this.ctx.textAlign = "center";
                        this.ctx.textBaseline = 'alphabetic';
                        this.ctx.rotate(coords[UI.expectResize][6] * Math.PI / 180);
                        var _yOffset = (UI.expectResize == 1 || UI.expectResize == 3 || UI.expectResize == 4 || UI.expectResize == 6) ? 17 : 20;
                        this.ctx.fillText(String.fromCharCode(0xf062), 0, _yOffset);
                        this.ctx.rotate(-coords[UI.expectResize][6] * Math.PI / 180);
                        this.ctx.translate(-coords[UI.expectResize][0], -coords[UI.expectResize][1]);
                    }

                }
            }

            // draw rotating icon if rotating layer
            if (!locked) // && !is_frontend)
            {
                var rx = dw / 2 - 7;
                var ry = -20 - 7;
                this.ctx.beginPath();
                this.ctx.arc(rx + 7, ry + 6, 9, 0, 2 * Math.PI, false);
                this.ctx.fillStyle = (UI.expectResize == 8) ? '#119711' : '#4285f4';
                this.ctx.fill();
                this.ctx.lineWidth = 5;
                this.ctx.font = "13px Fontawesome";
                this.ctx.fillStyle = "#ffffff";
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = 'alphabetic';
                this.ctx.fillText(String.fromCharCode(0xf01e), rx + 7, ry + 11);
            }
            this.ctx.translate(shiftX, shiftY);
            this.ctx.rotate(-deg * Math.PI / 180);
            this.ctx.translate(-(x + moveX + shiftX), -(y + moveY + shiftY));
            this.ctx.closePath();
            this.ctx.restore();

        },
        draw_crop_guide: function (color, x, y, moveX, moveY, shiftX, shiftY, deg, degMax) {
            this.ctx.beginPath();
            this.ctx.translate(x + moveX + shiftX, y + moveY + shiftY);

            this.ctx.translate(-moveX - shiftX + UI.cropBox.x, -moveY - shiftY + UI.cropBox.y);
            this.ctx.strokeStyle = color;
            this.ctx.strokeRect(0, 0, UI.cropBox.width, UI.cropBox.height);

            if (deg == 0) {
                var sq = 6;
                var sqhalf = 3;
                var dw = UI.cropBox.width;
                var dh = UI.cropBox.height;

                var hBW = 10; // halfBarWWidth
                var hBWC = 14; // halfBarWWidth Corners
                var coords = [[0, 0, 0, hBWC, hBWC, 0, -45], // corner
                    [dw / 2, 0, -hBW, 0, hBW, 0, 0],
                    [dw, 0, -hBWC, 0, 0, hBWC, 45], // corner
                    [0, dh / 2, 0, -hBW, 0, hBW, -90],
                    [dw, dh / 2, 0, -hBW, 0, hBW, 90],
                    [0, dh, 0, -hBWC, hBWC, 0, -135], // corner
                    [dw / 2, dh, -hBW, 0, hBW, 0, 180],
                    [dw, dh, -hBWC, 0, 0, -hBWC, 135]] // corner;

                // draw tiny circles on the corners
                this.ctx.fillStyle = color;
                for (var i = 0; i < coords.length; i++) {
                    this.ctx.beginPath();
                    if (i !== UI.expectRecrop) {
//                            this.ctx.arc(coords[i][0], coords[i][1], sqhalf, 0, Math.PI * 2, true);
//                            this.ctx.fill();
                        this.ctx.fillRect(coords[i][0] - sqhalf, coords[i][1] - sqhalf, sq, sq);
                    }
                }

                if (UI.expectRecrop >= 0 && UI.expectRecrop < 8) {
                    this.ctx.translate(coords[UI.expectRecrop][0], coords[UI.expectRecrop][1]);
                    this.ctx.beginPath();
                    this.ctx.lineCap = "square";
                    this.ctx.lineWidth = 3;
                    this.ctx.moveTo(0, 0);
                    this.ctx.lineTo(coords[UI.expectRecrop][2], coords[UI.expectRecrop][3]);
                    this.ctx.moveTo(0, 0);
                    this.ctx.lineTo(coords[UI.expectRecrop][4], coords[UI.expectRecrop][5]);
                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.shadowColor = "#000000";
                    this.ctx.shadowBlur = 4;
                    this.ctx.stroke();
                    this.ctx.font = "16px Fontawesome";
                    this.ctx.fillStyle = "#ffffff";
                    this.ctx.textAlign = "center";
                    this.ctx.textBaseline = 'alphabetic';
                    this.ctx.rotate(coords[UI.expectRecrop][6] * Math.PI / 180);
                    var _yOffset = (UI.expectRecrop == 1 || UI.expectRecrop == 3 || UI.expectRecrop == 4 || UI.expectRecrop == 6) ? 17 : 20;
                    this.ctx.fillText(String.fromCharCode(0xf062), 0, _yOffset);
                    this.ctx.rotate(-coords[UI.expectRecrop][6] * Math.PI / 180);
                    this.ctx.translate(-coords[UI.expectRecrop][0], -coords[UI.expectRecrop][1]);
                }

                // draw adjust cursor in crop middle
                this.ctx.font = "20px Fontawesome";
                if (UI.isCropping && UI.expectRecrop == 9) {
                    this.ctx.shadowColor = "#ffffff";
                    this.ctx.fillStyle = "green";
                    this.ctx.strokeStyle = "#999999";
                    this.ctx.strokeRect(dw / 2 - 14, dh / 2 - 14, 28, 28);
                } else {
                    this.ctx.shadowColor = "#000000";
                    this.ctx.fillStyle = "#ffffff";
                }
                this.ctx.shadowBlur = 4;
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(String.fromCharCode(0xf047), dw / 2, dh / 2);
            }

            this.ctx.translate(moveX + shiftX - UI.cropBox.x, moveY + shiftY - UI.cropBox.y);
            this.ctx.translate(-(x + moveX + shiftX), -(y + moveY + shiftY));
            this.ctx.closePath();
        },
        draw_point_guide: function (textdraw, x, y, moveX, moveY, shiftX, shiftY, deg) {
            var _t = textdraw.pathPoints.split(',');
            var nodeslength = _t.length;
            if (UI.console == UI.CNSL.SHAPETOOLBAR && UI.console_shape == UI.CNSL.SHAPETOOLDRAW) {
                UI.activePoint = nodeslength - 1;
            }
            this.ctx.translate(x + moveX + shiftX, y + moveY + shiftY);
            this.ctx.rotate(deg * Math.PI / 180);
            $.each(_t, function (i, el) {
                var coords = el.split(' ');
                var x = UI.parseFloat(coords[0]), y = UI.parseFloat(coords[1]);
                WPImagerUI.ctx.beginPath();
                WPImagerUI.ctx.fillStyle = "#eaeaea";
                WPImagerUI.ctx.fillRect(x - 4 - shiftX, y - 4 - shiftY, 8, 8);
                WPImagerUI.ctx.fillStyle = (i == UI.activePoint ? 'red' : 'black');
                if (i == UI.expectPoint) {
                    WPImagerUI.ctx.fillStyle = "orange";
                }
                WPImagerUI.ctx.fillRect(coords[0] - 3 - shiftX, coords[1] - 3 - shiftY, 6, 6);

                var pointcode = parseInt(coords[2]);
                if (pointcode > 0) {
                    var xB = UI.parseFloat(coords[3]), yB = UI.parseFloat(coords[4]);
                    var xA = UI.parseFloat(coords[5]), yA = UI.parseFloat(coords[6]);
                    // draw dots
                    if (textdraw.shape == UI.SHAPE.CUSTOM
                            || (textdraw.shape == UI.SHAPE.CURVEDTEXT && i == 1)) {
                        // draw line joining control point to node
                        WPImagerUI.ctx.beginPath();
                        WPImagerUI.ctx.strokeStyle = '#555555';
                        WPImagerUI.ctx.lineWidth = 1;
                        WPImagerUI.ctx.setLineDash([5, 5]);
                        WPImagerUI.ctx.moveTo(x - shiftX, y - shiftY);
                        WPImagerUI.ctx.lineTo(xB - shiftX, yB - shiftY);
                        WPImagerUI.ctx.stroke();

                        WPImagerUI.ctx.beginPath();
                        WPImagerUI.ctx.fillStyle = "white";
                        WPImagerUI.ctx.arc(xB - shiftX, yB - shiftY, 5, 0, Math.PI * 2, true);
                        WPImagerUI.ctx.fill();
                        WPImagerUI.ctx.beginPath();
                        WPImagerUI.ctx.fillStyle = (i == UI.activePoint || i == UI.expectCPointB) ? "blue" : "gray";
                        WPImagerUI.ctx.arc(xB - shiftX, yB - shiftY, 4, 0, Math.PI * 2, true);
                        WPImagerUI.ctx.fill();
                    }
                    if (textdraw.shape == UI.SHAPE.CUSTOM
                            || (textdraw.shape == UI.SHAPE.CURVEDTEXT && i == 0)) {
                        // draw line joining control point to node                        
                        WPImagerUI.ctx.beginPath();
                        WPImagerUI.ctx.strokeStyle = '#555555';
                        WPImagerUI.ctx.lineWidth = 1;
                        WPImagerUI.ctx.setLineDash([5, 5]);
                        WPImagerUI.ctx.moveTo(x - shiftX, y - shiftY);
                        WPImagerUI.ctx.lineTo(xA - shiftX, yA - shiftY);
                        WPImagerUI.ctx.stroke();

                        WPImagerUI.ctx.beginPath();
                        WPImagerUI.ctx.fillStyle = "white";
                        WPImagerUI.ctx.arc(xA - shiftX, yA - shiftY, 5, 0, Math.PI * 2, true);
                        WPImagerUI.ctx.fill();
                        WPImagerUI.ctx.beginPath();
                        WPImagerUI.ctx.fillStyle = (i == UI.activePoint || i == UI.expectCPointA) ? "green" : "gray";
                        WPImagerUI.ctx.arc(xA - shiftX, yA - shiftY, 4, 0, Math.PI * 2, true);
                        WPImagerUI.ctx.fill();
                    }
                    WPImagerUI.ctx.setLineDash([]);
                }
                if (UI.console == UI.CNSL.SHAPETOOLBAR && UI.console_shape == UI.CNSL.SHAPETOOLDRAW) {
                    if (i == nodeslength - 1) { // last node
                        WPImagerUI.ctx.beginPath();
                        WPImagerUI.ctx.strokeStyle = 'red';
                        WPImagerUI.ctx.lineWidth = 1;
                        WPImagerUI.ctx.globalAlpha = 1;
                        WPImagerUI.ctx.moveTo(x - shiftX, y - shiftY);
                        if (UI.shift_pressed) {
                            var dx = UI.hoverX - textdraw.xOffset - x;
                            var dy = UI.hoverY - textdraw.yOffset - y;
                            if (Math.abs(dx) > Math.abs(dy)) {
                                WPImagerUI.ctx.lineTo(UI.hoverX - textdraw.xOffset - shiftX, y - shiftY);
                            } else {
                                WPImagerUI.ctx.lineTo(x - shiftX, UI.hoverY - textdraw.yOffset - shiftY);
                            }
                        } else {
                            WPImagerUI.ctx.lineTo(UI.hoverX - textdraw.xOffset - shiftX, UI.hoverY - textdraw.yOffset - shiftY);
                        }
                        WPImagerUI.ctx.stroke();
                    }

                }

                // hidghlight next point
                if (UI.activePoint >= 0) {
                    var nextpoint = UI.expectCPointNew;
                    var i_active_next = (UI.activePoint + nextpoint) % _t.length;
                    i_active_next = (i_active_next >= 0) ? i_active_next : _t.length - 1;
                    if (i == i_active_next
                            && (UI.expectCPointNew == 1 || UI.expectCPointNew == -1)
                            && textdraw.shape == UI.SHAPE.CUSTOM) {
                        var coor1 = _t[i_active_next].split(' ');
                        var x = UI.parseFloat(coor1[0]), y = UI.parseFloat(coor1[1]);
                        WPImagerUI.ctx.beginPath();
                        WPImagerUI.ctx.fillStyle = "#eaeaea";
                        WPImagerUI.ctx.fillRect(x - 5 - shiftX, y - 5 - shiftY, 10, 10);
                        WPImagerUI.ctx.fillStyle = "orange"
                        WPImagerUI.ctx.fillRect(x - 4 - shiftX, y - 4 - shiftY, 8, 8);

                    }
                }


                // draw expected new point
                if (i == UI.activePoint
                        && (UI.expectCPointNew == 1 || UI.expectCPointNew == -1)
                        && textdraw.shape == UI.SHAPE.CUSTOM) {
                    var nextpoint = UI.expectCPointNew;
                    var i_next = (i + nextpoint) % _t.length;
                    i_next = (i_next >= 0) ? i_next : _t.length - 1;
                    var coor1 = _t[i].split(' ');
                    var coor2 = _t[i_next].split(' ');
                    var x1 = UI.parseFloat(coor1[0]), y1 = UI.parseFloat(coor1[1]);
                    var x2 = UI.parseFloat(coor2[0]), y2 = UI.parseFloat(coor2[1]);
                    var x = (x1 + x2) / 2, y = (y1 + y2) / 2;

                    WPImagerUI.ctx.beginPath();
                    WPImagerUI.ctx.fillStyle = "#eaeaea";
                    WPImagerUI.ctx.fillRect(x - 5 - shiftX, y - 5 - shiftY, 10, 10);
                    WPImagerUI.ctx.fillStyle = (nextpoint == 1) ? "green" : "green";
                    WPImagerUI.ctx.fillRect(x - 4 - shiftX, y - 4 - shiftY, 8, 8);
                }


            });
            this.ctx.rotate(-deg * Math.PI / 180);
            this.ctx.translate(-(x + moveX + shiftX), -(y + moveY + shiftY));

        },
        draw_line_guide: function (textdraw, x, y, moveX, moveY, shiftX, shiftY, deg, fillStyle) {
            if (UI.isPrinting)
                return;
            var _t = textdraw.pathPoints.split(',');
            var nodeslength = _t.length;
            if (UI.console == UI.CNSL.SHAPETOOLBAR && UI.console_shape == UI.CNSL.SHAPETOOLDRAW) {
                UI.activePoint = nodeslength - 1;
            }
            this.ctx.translate(x + moveX + shiftX, y + moveY + shiftY);
            this.ctx.rotate(deg * Math.PI / 180);
            $.each(_t, function (i, el) {
                var coords = el.split(' ');
                var x = UI.parseFloat(coords[0]), y = UI.parseFloat(coords[1]);
                WPImagerUI.ctx.beginPath();
                WPImagerUI.ctx.fillStyle = "#eaeaea";
                WPImagerUI.ctx.fillRect(x - 4 - shiftX, y - 4 - shiftY, 8, 8);
                WPImagerUI.ctx.fillStyle = (i == UI.expectPoint ? 'red' : 'black');
                if (typeof fillStyle !== "undefined")
                    WPImagerUI.ctx.fillStyle = fillStyle;
                WPImagerUI.ctx.fillRect(coords[0] - 3 - shiftX, coords[1] - 3 - shiftY, 6, 6);

            });
            this.ctx.rotate(-deg * Math.PI / 180);
            this.ctx.translate(-(x + moveX + shiftX), -(y + moveY + shiftY));

        },
        ellipseRect: function (ctx, x, y, width, height, fill, stroke)
        {
            ctx.save();
            if (fill) {
                ctx.beginPath();
                this.emulateEllipse(ctx, x - width / 2, y - height / 2, width, height);
                ctx.fill();
            }
            if (stroke && ctx.lineWidth > 0) {
                ctx.beginPath();
                this.emulateEllipse(ctx, x - width / 2, y - height / 2, width, height);
                ctx.stroke();
            }
            ctx.restore();	// restore context to what it was on entry        
        },
        emulateEllipse: function (ctx, aX, aY, aWidth, aHeight) {
            // Andrea Giammarchi - Mit Style License
            var hB = (aWidth / 2) * .5522848,
                    vB = (aHeight / 2) * .5522848,
                    eX = aX + aWidth,
                    eY = aY + aHeight,
                    mX = aX + aWidth / 2,
                    mY = aY + aHeight / 2;
            ctx.moveTo(aX, mY);
            ctx.bezierCurveTo(aX, mY - vB, mX - hB, aY, mX, aY);
            ctx.bezierCurveTo(mX + hB, aY, eX, mY - vB, eX, mY);
            ctx.bezierCurveTo(eX, mY + vB, mX + hB, eY, mX, eY);
            ctx.bezierCurveTo(mX - hB, eY, aX, mY + vB, aX, mY);
//        this.closePath();
        },
        roundedRect: function (ctx, x, y, width, height, radius, fill, stroke)
        {
            if (radius > width / 2 || radius > height / 2) {
                radius = (width > height) ? (height / 2) : (width / 2);
            }

            ctx.save();

            if (fill) {
                ctx.beginPath();
                if (radius > 0) {
                    // draw top and top right corner
                    ctx.moveTo(x + radius, y);
                    ctx.arcTo(x + width, y, x + width, y + radius, radius);

                    // draw right side and bottom right corner
                    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);

                    // draw bottom and bottom left corner
                    ctx.arcTo(x, y + height, x, y + height - radius, radius);

                    // draw left and top left corner
                    ctx.arcTo(x, y, x + radius, y, radius);

                    ctx.fill();
                } else {
                    ctx.fillRect(x, y, width, height);
                }
            }
            if (stroke && ctx.lineWidth > 0) {

                var border = 0;//ctx.lineWidth / 2;
                // ctx.lineWidth += 1;

                ctx.beginPath();
                if (radius > 0) {
                    radius += border;
//                ctx.moveTo(x + radius - border, y - border);
                    ctx.moveTo(x + width - radius - border, y + height - border);
                } else {
                    //              ctx.moveTo(x - ctx.lineWidth / 2 , y);
                    ctx.moveTo(x + width + ctx.lineWidth / 2, y + height);
                }

                // draw bottom and bottom left corner
                ctx.arcTo(x - border, y + height + border, x - border, y + height - radius + border, radius);

                // draw left and top left corner
                ctx.arcTo(x - border, y - border, x + radius - border, y - border, radius);
                // draw top and top right corner
                ctx.arcTo(x + width + border, y - border, x + width + border, y + radius - border, radius);

                // draw right side and bottom right corner
                ctx.arcTo(x + width + border, y + height + border, x + width - radius + border, y + height + border, radius);

                ctx.stroke();
            }

            ctx.restore();	// restore context to what it was on entry
        },
        roundedPolygonFill: function (ctx, polyradius, sides, radius, spokeratio, polyspoke)
        {
            var scaleX = UI.comScale.active ? UI.comScale.scaleX : 1;
            var scaleY = UI.comScale.active ? UI.comScale.scaleY : 1;
            var polyradiusX = polyradius * scaleX;
            var polyradiusY = polyradius * scaleY;

            ctx.save();
            ctx.beginPath();
            ctx.translate(-polyradiusX, -polyradiusY);
            var radOffset = -Math.PI / 2;
            var a = (Math.PI * 2) / sides;
            var startX = (polyradiusX + polyradiusX * Math.cos(radOffset) + polyradiusX + polyradiusX * Math.cos(a + radOffset)) / 2;
            var startY = (polyradiusY + polyradiusY * Math.sin(radOffset) + polyradiusY + polyradiusY * Math.sin(a + radOffset)) / 2;

            if (spokeratio <= 1 && polyspoke) {
                startX = polyradiusX + spokeratio * polyradiusX * Math.cos(a * 0.5 + radOffset);
                startY = polyradiusY + spokeratio * polyradiusY * Math.sin(a * 0.5 + radOffset);
            }
            ctx.moveTo(startX, startY);
            for (var i = 1; i <= sides; i++) {
                if (spokeratio <= 1 && polyspoke) {
                    ctx.arcTo(polyradiusX + polyradiusX * Math.cos(a * i + radOffset), polyradiusY + polyradiusY * Math.sin(a * i + radOffset),
                            polyradiusX + spokeratio * polyradiusX * Math.cos(a * (i + 0.5) + radOffset), polyradiusY + spokeratio * polyradiusY * Math.sin(a * (i + 0.5) + radOffset), radius);
                    ctx.arcTo(polyradiusX + spokeratio * polyradiusX * Math.cos(a * (i + 0.5) + radOffset), polyradiusY + spokeratio * polyradiusY * Math.sin(a * (i + 0.5) + radOffset),
                            polyradiusX + polyradiusX * Math.cos(a * (i + 1) + radOffset), polyradiusY + polyradiusY * Math.sin(a * (i + 1) + radOffset), radius);
                } else {
                    ctx.arcTo(polyradiusX + polyradiusX * Math.cos(a * i + radOffset), polyradiusY + polyradiusY * Math.sin(a * i + radOffset),
                            polyradiusX + polyradiusX * Math.cos(a * (i + 1) + radOffset), polyradiusY + polyradiusY * Math.sin(a * (i + 1) + radOffset), radius);
                }
            }
            ctx.translate(polyradiusX, polyradiusY);
            ctx.closePath();
            ctx.fill();
            ctx.restore();	// restore context to what it was on entry
        },

        roundedPolygonStroke: function (ctx, polyradius, sides, radius, spokeratio, polyspoke)
        {
            ctx.save();

            if (ctx.lineWidth > 0) {
                var scaleX = UI.comScale.active ? UI.comScale.scaleX : 1;
                var scaleY = UI.comScale.active ? UI.comScale.scaleY : 1;
                var polyradiusX = polyradius * scaleX;
                var polyradiusY = polyradius * scaleY;

                //x = polyradius, y = polyradius;
                ctx.beginPath();
                ctx.translate(-polyradiusX, -polyradiusY);
                var radOffset = -Math.PI / 2;
                var a = (Math.PI * 2) / sides;
                var startX = (polyradiusX + polyradiusX * Math.cos(radOffset) + polyradiusX + polyradiusX * Math.cos(a + radOffset)) / 2;
                var startY = (polyradiusY + polyradiusY * Math.sin(radOffset) + polyradiusY + polyradiusY * Math.sin(a + radOffset)) / 2;

                if (spokeratio <= 1 && polyspoke) {
                    startX = polyradiusX + spokeratio * polyradiusX * Math.cos(a * 0.5 + radOffset);
                    startY = polyradiusY + spokeratio * polyradiusY * Math.sin(a * 0.5 + radOffset);
                }

                ctx.moveTo(startX, startY);

                for (var i = 1; i <= sides; i++) {
                    if (spokeratio <= 1 && polyspoke) {
                        ctx.arcTo(polyradiusX + polyradiusX * Math.cos(a * i + radOffset), polyradiusY + polyradiusY * Math.sin(a * i + radOffset),
                                polyradiusX + spokeratio * polyradiusX * Math.cos(a * (i + 0.5) + radOffset), polyradiusY + spokeratio * polyradiusY * Math.sin(a * (i + 0.5) + radOffset), radius);
                        ctx.arcTo(polyradiusX + spokeratio * polyradiusX * Math.cos(a * (i + 0.5) + radOffset), polyradiusY + spokeratio * polyradiusY * Math.sin(a * (i + 0.5) + radOffset),
                                polyradiusX + polyradiusX * Math.cos(a * (i + 1) + radOffset), polyradiusY + polyradiusY * Math.sin(a * (i + 1) + radOffset), radius);
                    } else {
                        ctx.arcTo(polyradiusX + polyradiusX * Math.cos(a * i + radOffset), polyradiusY + polyradiusY * Math.sin(a * i + radOffset),
                                polyradiusX + polyradiusX * Math.cos(a * (i + 1) + radOffset), polyradiusY + polyradiusY * Math.sin(a * (i + 1) + radOffset), radius);
                    }
                }
                ctx.translate(polyradiusX, polyradiusY);
                ctx.closePath();
                ctx.stroke();
            }
            ctx.restore();	// restore context to what it was on entry
        },

        skewedRect: function (ctx, x, y, width, height, border, skewA, skewB, skewDir, fill, stroke)
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

                var overlap = 0;

                if (skewDir == 1) {
                    skewA = (skewA > height ? height : skewA);
                    skewA = (skewA < -height ? -height : skewA);
                    skewB = (skewB > height ? height : skewB);
                    skewB = (skewB < -height ? -height : skewB);
                    // vertical skew
                    if (skewA >= 0 && skewB >= 0) {
                        overlap = (height - (skewA + skewB)) / 2;
                        if (overlap < 0) {
                            skewA += overlap;
                            skewB += overlap;
                        }
                        // draw top and top right corner
                        ctx.moveTo(x, y);
                        ctx.lineTo(x + width, y + skewA);
                        // draw right side and bottom right corner
                        ctx.lineTo(x + width, y + height - skewB);
                        // draw bottom and bottom left corner
                        ctx.lineTo(x, y + height);
                        // draw left and top left corner
                        ctx.lineTo(x, y);
                    } else if (skewA >= 0 && skewB <= 0) {
                        ctx.moveTo(x, y);
                        ctx.lineTo(x + width, y + skewA);
                        ctx.lineTo(x + width, y + height);
                        ctx.lineTo(x, y + height + skewB);
                        ctx.lineTo(x, y);
                    } else if (skewA <= 0 && skewB >= 0) {
                        ctx.moveTo(x, y - skewA);
                        ctx.lineTo(x + width, y);
                        ctx.lineTo(x + width, y + height - skewB);
                        ctx.lineTo(x, y + height);
                        ctx.lineTo(x, y - skewA);
                    } else if (skewA <= 0 && skewB <= 0) {
                        overlap = (height + (skewA + skewB)) / 2;
                        if (overlap < 0) {
                            skewA += -overlap;
                            skewB += -overlap;
                        }
                        ctx.moveTo(x, y - skewA);
                        ctx.lineTo(x + width, y);
                        ctx.lineTo(x + width, y + height);
                        ctx.lineTo(x, y + height + skewB);
                        ctx.lineTo(x, y - skewA);
                    }
                } else {
                    skewA = (skewA > width ? width : skewA);
                    skewA = (skewA < -width ? -width : skewA);
                    skewB = (skewB > width ? width : skewB);
                    skewB = (skewB < -width ? -width : skewB);
                    // horizontal skew
                    if (skewA >= 0 && skewB >= 0) {
                        overlap = (width - (skewA + skewB)) / 2;
                        if (overlap < 0) {
                            skewA += overlap;
                            skewB += overlap;
                        }
                        ctx.moveTo(x + skewA, y);
                        ctx.lineTo(x + width - skewB, y);
                        ctx.lineTo(x + width, y + height);
                        ctx.lineTo(x, y + height);
                        ctx.lineTo(x + skewA, y);
                    } else if (skewA >= 0 && skewB <= 0) {
                        ctx.moveTo(x + skewA, y);
                        ctx.lineTo(x + width, y);
                        ctx.lineTo(x + width + skewB, y + height);
                        ctx.lineTo(x, y + height);
                        ctx.lineTo(x + skewA, y);
                    } else if (skewA <= 0 && skewB >= 0) {
                        ctx.moveTo(x, y);
                        ctx.lineTo(x + width - skewB, y);
                        ctx.lineTo(x + width, y + height);
                        ctx.lineTo(x - skewA, y + height);
                        ctx.lineTo(x, y);
                    } else if (skewA <= 0 && skewB <= 0) {
                        overlap = (width + (skewA + skewB)) / 2;
                        if (overlap < 0) {
                            skewA += -overlap;
                            skewB += -overlap;
                        }
                        ctx.moveTo(x, y);
                        ctx.lineTo(x + width, y);
                        ctx.lineTo(x + width + skewB, y + height);
                        ctx.lineTo(x - skewA, y + height);
                        ctx.lineTo(x, y);
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
        },
        convertToSlug: function (Text) {
            Text = Text.trim();
            // filter text for valid filename usage
            return Text
                    //    .toLowerCase()
                    .replace(/[^\w ]+/g, '')
                    .replace(/ +/g, '-')
                    ;
        },
        dockToolLayers: function () {
            $("#toolViewConsole button").removeClass("btn-darkslate").addClass("btn-slate");
            this.dockToolBox();
            if (WPImager.canvas.tvSlides == 'min') {
                $("#canvas_slides").addClass("mini").removeClass("maxi hide");
                $("#canvas_slides").find(".editSlideTitle,.btn-action-play,.tool-slide-info,.tl").hide();
                $(".tool-slide-number").show();
                $('#toolViewSlides_Max2,#cmdAddSlide2').show();
            } else if (WPImager.canvas.tvSlides == 'hide') {
                $("#canvas_slides").addClass("hide").removeClass("mini maxi");
            } else {
                $("#canvas_slides").addClass("maxi").removeClass("mini hide");
                $("#canvas_slides .editSlideTitle, .tool-slide-info, #canvas_slides .tl").show();
                $("#canvas_slides").css("margin", "0px");
                $(".tool-slide-number").hide();
                $('#toolViewSlides_Max2,#cmdAddSlide2').hide();
            }

            if (UI.app == UI.APP.CANVAS) {
                if (WPImager.canvas.tvSlides == "hide") {
                    $("#canvas_slides").hide();
                } else {
                    $("#canvas_slides").show();
                }
            } else {
                $("#toolBox,#canvas_slides").hide();
            }


            if (WPImager.canvas.tvSlides == 'min') {
                $("#toolViewSlides_Min").addClass("btn-darkslate");
            } else if (WPImager.canvas.tvSlides == 'hide') {
                $("#toolViewSlides_Hide").addClass("btn-darkslate");
            } else {
                $("#toolViewSlides_Max").addClass("btn-darkslate");
            }

            this.arrangeCanvaslayout();
            this.dockToolSlides();
        },
        dockToolBox: function () {
            WPImager.canvas.tlPosition = WPImager.canvas.tlPosition % 4;
            var tlPosition = WPImager.canvas.tlPosition;
            tlPosition = (UI.app === UI.APP.CANVAS) ? tlPosition : 3;
            if (tlPosition == 0) {
                // dock right
                $("#toolBox").css("display", "block").css("top", "0px").css("right", "0").css("left", "auto");
                $("#toolBox").css("margin", "0 0 0 0px");
                $("#toolBox").draggable('disable');
                if (WPImager.canvas.tvSlides == 'min' || WPImager.canvas.tvSlides == 'max') {
                    $("#canvas_slides").css("display", "block").css("left", "0").css("right", "auto");
                }

                if (WPImager.canvas.tvSlides == 'min') {
                    $("#canvas_slides").css("margin", "0 0 0 0px");
                }
                $("#toolBoxPosition_Right2").addClass("btn-darkslate").removeClass("btn-slate");

            } else if (tlPosition == 1) {
                // dock left
                $("#toolBox").css("display", "block").css("top", "0px").css("left", "0").css("right", "auto");
                $("#toolBox").css("margin", "0 0px 0 0");
                $("#toolBox").draggable('disable');
                if (WPImager.canvas.tvSlides == 'min' || WPImager.canvas.tvSlides == 'max') {
                    $("#canvas_slides").css("display", "block").css("right", "0").css("left", "auto");
                    $("#canvas_slides").css("margin", "0 0px 0 0px");
                }
                $("#toolBoxPosition_Left2").addClass("btn-darkslate").removeClass("btn-slate");
            } else if (tlPosition == 2) {
                // float
                $("#toolBox").css("display", "block").css("float", "none");
                $("#toolBox").draggable('enable');
                if (WPImager.canvas.tvSlides == 'min' || WPImager.canvas.tvSlides == 'max') {
                    $("#canvas_slides").css("display", "block").css("left", "0").css("right", "auto");
                }
                if (WPImager.canvas.tvSlides == 'min') {
                    $("#canvas_slides").css("margin", "0 0 0 0px");
                }
                $("#toolBoxPosition_Float2").addClass("btn-darkslate").removeClass("btn-slate");
            } else if (tlPosition == 3) {
                // hide
                $("#toolBox").css("display", "none");
                $("#toolBoxPosition_Hide").addClass("btn-darkslate").removeClass("btn-slate");
                if (WPImager.canvas.tvSlides == 'min' || WPImager.canvas.tvSlides == 'max') {
                    $("#canvas_slides").css("display", "block").css("left", "0").css("right", "auto");
                }
                if (WPImager.canvas.tvSlides == 'min') {
                    $("#canvas_slides").css("margin", "0 0 0 0px");
                }
            }

        },
        arrangeCanvaslayout: function () {
            var height = parseInt($("#toolBox").height()) - parseInt($("#cvswrap").css("margin-top")) - parseInt($("#cvswrap").css("padding-bottom"));
            var tlPosition = WPImager.canvas.tlPosition;
            tlPosition = (UI.app === UI.APP.CANVAS) ? tlPosition : 3;

            if (tlPosition == 0) {
                // dock right
                $("#cvswrap,#cvsbox_menu").css("margin-left", "0px");
                $("#cvsbox_menu,#cvswrap").width($("#cvsbox").width() - $("#toolBox").width() - 2);
            } else if (tlPosition == 3) {
                // hide
                $("#cvsbox_menu,#cvswrap").css("margin-left", "0").css("width", "100%");
            } else if (tlPosition == 1) {
                // dock left
                $("#cvsbox_menu,#cvswrap").css("margin-left", parseInt($("#toolBox").width()).toString() + "px");
                $("#cvsbox_menu,#cvswrap").width($("#cvsbox").width() - $("#toolBox").width());
            } else if (tlPosition == 2) {
                // float
                $("#cvsbox_menu,#cvswrap").css("margin-left", "0").css("width", "100%");
            }
            $("#cvsfooter,#canvasinfo").css("margin-left", $("#cvsbox_menu").css("margin-left"));

            if (WPImager.canvas.zoom == 1) {
                // 100%
                $("#cvsOutput,#cvs").css("max-width", "none");
                $("#cvswrap").height((height + 2));
                $("#cvsfooter").css("position", "absolute");
                $("#cvsfooter").css("top", $("#toolBox").height().toString() + "px").width($("#cvswrap").width() - 10);
                $("#canvas_bottom").removeClass("freeze");

                // check for min height
                var minheight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) * 0.75 - 100;
                minheight = Math.max(minheight, 250);
                if ($("#canvas_bottom").height() < minheight) {
                    //   $("#cvswrap").height(minheight);
                    if ($("#cvswrap").outerHeight(true) < minheight) {
                        $("#cvswrap").css("min-height", "200px");
                    }
                    $("#canvas_bottom").height($("#cvswrap").outerHeight(true));
                }
            } else {
                // full cover
                $("#cvsOutput,#cvs").css("max-width", "100%");
                var _minheight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                var minheight = _minheight - 148 - 40;
                minheight -= $("#pagetitle").outerHeight(true);
                if ($("#cvs").height() < minheight) {
                    $("#cvswrap").height(minheight);
                    $("#canvas_bottom").height(_minheight - $("#pagetitle").outerHeight(true));
                } else {
                    $("#cvswrap").height($("#cvs").height());
                }
                $("#canvas_bottom").height($("#cvswrap").outerHeight(true));
                $("#cvsfooter").css("position", "relative").css("top", "auto").width($("#cvswrap").width() - 10);
                $("#canvas_bottom").addClass("freeze");
            }
            $("#cvszoom-text").text(WPImager.canvas.zoom == 0 ? "Auto" : "1:1");


            // vertically center canvas
            if ($("#cvs").height() > 0) {
//                var mHeight = Math.max($("#cvswrap").height(), $("#canvas_bottom").height());
                var extraHeight = $("#cvswrap").height() - $("#cvs").height();
                //var extraHeight = $("#canvas_bottom").height() - $("#cvs").height();
                if (extraHeight > 0) {
                    $("#cvsOutput").css("margin-top", parseInt(extraHeight / 2).toString() + "px");
                } else {
                    $("#cvsOutput").css("margin-top", "0");
                }
                if ($("#canvas_bottom").height() > 160) {
                    // adjust height only when canvas is ready  
//                    $("#toolBox").height($("#canvas_bottom").height() - 2);
                }
            }

            if (WPImager.canvas.zoom == 1)
            {
                $("#cvsOutput").width($("#cvs").width());
            } else {
                $("#canvas_bottom,#cvsOutput").css("width", "100%"); //($("#cvs").width());                
            }
            this.resizetoolboxLayersMenu();
        },
        dockToolSlides: function () {
            setTimeout(function () {
                if (WPImager.canvas.zoom == 1) {
                    // 100% - position absolute
                    var maxheight = $("#cvswrap").height();
                    var height;
                    if (maxheight < $("#canvas_slides").height()) {
                        if ($("#canvas_slides").hasClass("maxi")) {
                            var handle_menu = $("#toolSlidesHandle").outerHeight(true) + $("#toolSlidesMainMenu").outerHeight(true) + $("#toolComHandle").outerHeight(true) + $("#toolComMainMenu").outerHeight(true);
                            var singleToolheight = parseInt(maxheight / 2 - handle_menu / 2);
                        } else {
                            var handle_menu = $("#toolViewSlides_Max2").outerHeight(true) + $("#cmdAddSlide2").outerHeight(true);
                            var singleToolheight = parseInt(maxheight / 2 - handle_menu / 2);
                        }
                        
                        // calculate max-height
                        if ($("#toolSlidesSortableWrap").outerHeight(true) > singleToolheight
                                && $("#toolComSortableWrap").outerHeight(true) > singleToolheight) {
                            // split into halves
                            $("#toolSlidesSortableWrap").css("max-height", parseInt(maxheight / 2 - handle_menu / 2).toString() + "px");
                            $("#toolComSortableWrap").css("max-height", parseInt(maxheight / 2 - handle_menu / 2).toString() + "px");
                        } else if ($("#toolSlidesSortableWrap").outerHeight(true) > singleToolheight) {
                            // slide takes remainder, com unchanged
                            $("#toolSlidesSortableWrap").css("max-height", parseInt(maxheight - handle_menu - $("#toolComSortableWrap").outerHeight(true)).toString() + "px");
                            $("#toolComSortableWrap").css("max-height", 'none');
                        } else {
                            $("#toolComSortableWrap").css("max-height", parseInt(maxheight - handle_menu - $("#toolSlidesSortableWrap").outerHeight(true)).toString() + "px");
                            $("#toolSlidesSortableWrap").css("max-height", 'none');
                        }
//                            $("#toolSlidesSortableWrap").css("max-height", (maxheight / 2 - $("#toolSlidesHandle").outerHeight(true) - $("#toolSlidesMainMenu").outerHeight(true) - $("#toolComMainMenu").outerHeight(true)).toString() + "px");
//                            height = maxheight - $("#toolSlidesHandle").outerHeight(true) - $("#toolSlidesMainMenu").outerHeight(true) - $("#toolComMainMenu").outerHeight(true) - $("#toolSlidesSortableWrap").outerHeight(true) - $("#toolComHandle").outerHeight(true);
                    } 
                } else {
                    $("#toolSlidesSortableWrap,#toolComSortableWrap").css("max-height", 'none');
                    // auto - position fixed
                    var maxheight = Math.min(document.documentElement.clientHeight, window.innerHeight || 0);
                    maxheight -= $("#canvas_slides").position().top;
                    var distanceFromBottom = Math.floor($(document).height() - $(document).scrollTop() - $(window).height());
                    maxheight -= distanceFromBottom < 36 ? 36 - distanceFromBottom : 0; // footer
                    maxheight -= 4;
                    var height;
                    if (maxheight < $("#canvas_slides").height()) {
                        if ($("#canvas_slides").hasClass("maxi")) {
                            var handle_menu = $("#toolSlidesHandle").outerHeight(true) + $("#toolSlidesMainMenu").outerHeight(true) + $("#toolComHandle").outerHeight(true) + $("#toolComMainMenu").outerHeight(true);
                            var singleToolheight = parseInt(maxheight / 2 - handle_menu / 2);
                        } else {
                            var handle_menu = $("#toolViewSlides_Max2").outerHeight(true) + $("#cmdAddSlide2").outerHeight(true);
                            var singleToolheight = parseInt(maxheight / 2 - handle_menu / 2);
                        }
                        // calculate max-height
                        if ($("#toolSlidesSortableWrap").outerHeight(true) > singleToolheight
                                && $("#toolComSortableWrap").outerHeight(true) > singleToolheight) {
                            // split into halves
                            $("#toolSlidesSortableWrap").css("max-height", singleToolheight.toString() + "px");
                            $("#toolComSortableWrap").css("max-height", singleToolheight.toString() + "px");
                        } else if ($("#toolSlidesSortableWrap").outerHeight(true) > singleToolheight) {
                            // slide takes remainder, com unchanged
                            $("#toolSlidesSortableWrap").css("max-height", parseInt(maxheight - handle_menu - $("#toolComSortableWrap").outerHeight(true)).toString() + "px");
                            $("#toolComSortableWrap").css("max-height", 'none');
                        } else {
                            $("#toolComSortableWrap").css("max-height", parseInt(maxheight - handle_menu - $("#toolSlidesSortableWrap").outerHeight(true)).toString() + "px");
                            $("#toolSlidesSortableWrap").css("max-height", 'none');
                        }
                    } else if (maxheight > $("#canvas_slides").height()) {
                        //
                    }
                }
            }, 100);

        },
        resizetoolLayersMenu: function () {
            if ($("#toolLayers").length == 0)
                return;
            $("#toolLayerSortableWrap").width($("#toolLayers").width() - 12);
            $("#toolLayerSortableWrap").height($("#toolLayers").height() - $("#toolLayersMenu").height() - $("#toolLayersHandle").height() - $("#toolLayersMainBtn").height() - 40);
            $("#toolBrowseBackground")
                    .height($("#toolBox").height() - $("#toolLayersHandle").height() - $("#toolLayersMainBtn").height() - 40);
            $("#contentBrowseBackground,#toolBrowsePolygon,#toolBrowseShape,#toolLayerAddText,#toolLayerFontawesome,#toolCanvas").height($("#toolBrowseBackground").height() - 12);

        },
        resizetoolboxLayersMenu: function () {
            $("#toolboxLayerSortableWrap").width($("#toolBox").width() - 12);
            $("#toolboxLayerSortableWrap").height($("#toolBox").height() - $("#toolboxLayersMenu").height() - $("#toolboxHandle").height() - $("#toolboxMainButtons").height() - 50);
            $("#toolBrowseBackground")
                    .height($("#toolBox").height() - $("#toolboxHandle").height() - $("#toolboxMainButtons").height() - 40);
            $("#contentBrowseBackground,#toolBrowsePolygon,#toolBrowseShape,#toolboxLayerAddText,#toolboxLayerFontawesome,#toolboxAddedCOM,#toolCanvas").height($("#toolBrowseBackground").height() - 12);
            $("#toolboxAddedCOM").height($("#toolBrowseBackground").height() + 10);
            $("#toolSlidesSortableWrap").width($("#canvas_slides").width());

            $("#toolboxLayersSortableWrap").width($("#toolboxLayerSortableWrap").width());
            $("#toolboxLayersSortableWrap").height($("#toolboxLayerSortableWrap").height());

        },
        showToolViewSlides: function () {
            if (WPImager.canvas.tvSlides == 'max' || WPImager.canvas.tvSlides == 'min') {
                $('#canvas_slides').show();
            } else {
                $('#canvas_slides').hide();
            }
        },
        firstDraw: function () {
            setTimeout(function () {
                if (!UI.startedDraw) {
                    WPImagerUI.draw();
                }
            }, 2000);
        },
        clearCanvas: function () {
            var canvas = document.getElementById('cvs');
            var ctx = canvas.getContext("2d");
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        },
        zoomCanvas: function (zoom) {
            // 
//            var scaleFactor = zoom / 100;
//            scaleFactor = scaleFactor > 1 ? 1 : scaleFactor;
//            $("#cvs").width(WPImager.canvas.width * scaleFactor);
//            $("#cvs").height(WPImager.canvas.height * scaleFactor);
            this.draw();
        },
        scaleCanvasLayers: function (scaleX, scaleY) {
            for (var k in WPImager.layer) {
                if (WPImager.layer.hasOwnProperty(k) && k > 0) {
                    if (WPImager.layer[k].disposed == 0
                            && (WPImager.layer[k].slide === WPImager.slide || WPImager.layer[k].slide === 0)) {
                        if (WPImager.layer[k].code == UI.LAYER.TEXT) {
                            WPImager.layer[k].xOffset *= scaleX;
                            WPImager.layer[k].yOffset *= scaleY;
                            WPImager.layer[k].fontsize *= scaleX;
                            WPImager.layer[k].fontsize = (WPImager.layer[k].fontsize * 10) / 10;
                            WPImager.layer[k].sizeWidthHeight(WPImager.layer[k].width * scaleX,
                                    WPImager.layer[k].height * scaleY);
                            if (WPImager.layer[k].shape == UI.SHAPE.CURVEDTEXT || WPImager.layer[k].shape == UI.SHAPE.CUSTOM || WPImager.layer[k].shape == UI.SHAPE.LINE) {
                                WPImager.layer[k].recalculateShapeContainer();
                            }
                        } else if (WPImager.layer[k].code == UI.LAYER.COM) {
                            WPImager.layer[k].x *= scaleX;
                            WPImager.layer[k].y *= scaleY;
                            WPImager.layer[k].width *= scaleX;
                            WPImager.layer[k].height *= scaleY;
                        } else if (WPImager.layer[k].code == UI.LAYER.IMAGE) {
                            WPImager.layer[k].imgx *= scaleX;
                            WPImager.layer[k].imgy *= scaleY;
                            WPImager.layer[k].sizeWidthHeight(WPImager.layer[k].imgwidth * scaleX,
                                    WPImager.layer[k].imgheight * scaleY);
                            WPImagerUI.resize_image(k);
                        }
                    }
                }
            }
            WPImager.selectLayer(WPImager.current);

        },
        returnToTextEdit: function () {
            if (UI.console == UI.CNSL.TXTEDIT) {
                $("#input").focus();
                UI.console = UI.CNSL.TXTEDITRETURN;
            }
        },
        resetConsoleImage: function () {
            $(".cvsconsole").hide();
            $("#imgconsole_task,#mainimageconsole").show();
            $("[id^='show']").removeClass("active");
            $("#showMainImageConsole").addClass("active");
        },
        flagCanvasSave: function () {
            if (WPImager.boot === 0)
                return;
            if (UI.isUndoRedoing)
                return;
            if (UI.saveTimeoutOn) {
                return;
            }

            // wait 100ms before saving, avoid multiple saves
            setTimeout(function () {
                if (UndoRedo.save()) {
                    WPImagerUI.flagCanvasDirty();
                }
                UI.saveTimeoutOn = false;
            }, 100);

            UI.saveTimeoutOn = true;

        },
        flagCanvasDirty: function ()
        {
            UI.flagDirty = !(UI.saved_layers === JSON.stringify(WPImager.layer));
            var parsed_canvas = JSON.parse(UI.saved_canvas);
            parsed_canvas.current = WPImager.canvas.current;
            parsed_canvas.picktool = WPImager.canvas.picktool;
            UI.flagDirty = UI.flagDirty || !(JSON.stringify(parsed_canvas) === JSON.stringify(WPImager.canvas));
            if (UI.flagDirty) {
                $("#savecanvas").addClass("btn-danger").removeClass("btn-default");
            } else {
                $("#savecanvas").addClass("btn-default").removeClass("btn-danger");
            }
            if (typeof UndoRedo !== "undefined") {
                WPImager.refreshUndoRedoButton();
            }
        },
        blinkCursor: function () {
            clearInterval(UI.cursorInterval);
            UI.cursorInterval = setTimeout(function () {
                if (UI.console === UI.CNSL.TXTEDIT || UI.console === UI.CNSL.TXTEDITRETURN) {
                    if (UI.input.selection[1] == UI.input.selection[0]) {
                        var padding = 2, width = 2 * padding + 1;
                        var xOffset = parseInt(UI.blink.xOffset);
                        var yOffset = parseInt(UI.blink.yOffset);
                        switch (UI.blink.state) {
                            case UI.blink.INIT:
                            case UI.blink.BLINKON:
                                UI.input.cursor = true;
                                WPImagerUI.draw();
                                var blinkOn = document.getElementById("blinkOn");
                                var ctxBlinkOn = blinkOn.getContext("2d");
                                var cursorImage = WPImagerUI.ctx.getImageData(
                                        xOffset - padding, yOffset - padding, width, UI.blink.height + 2 * padding);
                                blinkOn.width = width;
                                blinkOn.height = UI.blink.height + 2 * padding;
                                ctxBlinkOn.putImageData(cursorImage, 0, 0);
                                UI.blink.state = UI.blink.BLINKOFF;
                                break;
                            case UI.blink.BLINKOFF:
                                UI.input.cursor = false;
                                WPImagerUI.draw();
                                var blinkOff = document.getElementById("blinkOff");
                                var ctxBlinkOff = blinkOff.getContext("2d");
                                var cursorImage = WPImagerUI.ctx.getImageData(
                                        xOffset - padding, yOffset - padding, width, UI.blink.height + 2 * padding);
                                blinkOff.width = width;
                                blinkOff.height = UI.blink.height + 2 * padding;
                                ctxBlinkOff.putImageData(cursorImage, 0, 0);
                                UI.blink.state = UI.blink.BLINKING;
                                break;
                            case UI.blink.BLINKING:
                                UI.input.cursor = !UI.input.cursor;
                                if (UI.input.cursor) {
                                    var blinkOn = document.getElementById("blinkOn");
                                    WPImagerUI.ctx.drawImage(blinkOn, 0, 0, blinkOn.width, blinkOn.height, xOffset - padding, yOffset - padding, blinkOn.width, blinkOn.height);
                                } else {
                                    var blinkOff = document.getElementById("blinkOff");
                                    WPImagerUI.ctx.drawImage(blinkOff, 0, 0, blinkOff.width, blinkOff.height, xOffset - padding, yOffset - padding, blinkOff.width, blinkOff.height);
                                }
                                if (!$("#input").is(":focus")) {
                                    $("#input").focus();
                                }
                                break;
                        }

                    }
                    WPImagerUI.blinkCursor();
                } else {
                    if (UI.input.cursor) {
                        UI.input.cursor = false;
                        WPImagerUI.draw();
                    }
                }
            }, 500);
        },
        footer: function () {
            var html = '';
            if (WPImager.layer[WPImager.current].code == -1) {

            } else if (WPImager.current > 0) {
                html = '<span class="fa fa-location-arrow"></span> ';
                html += WPImager.posX().toString();
                html += "," + WPImager.posY().toString() + "&nbsp;";
                html += ' <span class="fa fa-cube"></span> ';
                html += "" + parseInt(WPImager.layerWidth(WPImager.current).toString());
                html += "x" + parseInt(WPImager.layerHeight(WPImager.current).toString()) + "";
                html += ' <span class="fa fa-crosshairs"></span> ';
                html += UI.hoverX.toString() + "&nbsp;";
                html += "," + UI.hoverY.toString() + "&nbsp;";
            }
            $('#cvsinfo_footer').html(html);
        }
    };

})(jQuery);
