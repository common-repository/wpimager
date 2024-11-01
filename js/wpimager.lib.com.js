/*!
 WPImager 1.0.0    
 https://wpimager.com/
 2018 WPImager  
 */

/**
 * LayerCOM Object
 * Contains methods and properties to draw QR Code on canvas
 */


function LayerCOM(slide, index) {
    this.slide = slide;
    this.index = index;
    this.code = UI.LAYER.COM;
    this.name = "Component";
    this.setval(0); // set default values  
}

jQuery(function ($) {
    LayerCOM.prototype = {
        setval: function (cloudlayer) {

            this.slide = this.getval(cloudlayer.slide, WPImager.slide);
            this.comslide = this.getval(cloudlayer.comslide, 0);
            this.order = this.getval(cloudlayer.order, 1);
            this.layernote = this.getval(cloudlayer.layernote, "");
            this.content = this.getval(cloudlayer.content, "");
            this.padding = this.getval(cloudlayer.padding, 0);
            this.textradius = this.getval(cloudlayer.textradius, 0);
            this.x = this.getval(cloudlayer.x, 0);
            this.y = this.getval(cloudlayer.y, 0);
            this.width = this.getval(cloudlayer.width, 120);
            this.height = this.getval(cloudlayer.height, 120);
            this.rotation = this.getval(cloudlayer.rotation, 0);
            this.alpha = this.getval(cloudlayer.alpha, 100);
            this.absLeft = this.getval(cloudlayer.absLeft, 0);
            this.absRight = this.getval(cloudlayer.absRight, 0);
            this.absTop = this.getval(cloudlayer.absTop, 0);
            this.absBottom = this.getval(cloudlayer.absBottom, 0);
            this.textborder = this.getval(cloudlayer.textborder, 0);
            this.textborderdash = this.getval(cloudlayer.textborderdash, "0 10 10 0");
            this.textbordercolor = this.getval(cloudlayer.textbordercolor, "#ffffff");
            this.textshadowfillOn = this.getval(cloudlayer.textshadowfillOn, false);
            this.textshadowfill = this.getval(cloudlayer.textshadowfill, 0);
            this.textshadowfillcolor = this.getval(cloudlayer.textshadowfillcolor, "#000000");
            this.textshadowfillOx = this.getval(cloudlayer.textshadowfillOx, 0);
            this.textshadowfillOy = this.getval(cloudlayer.textshadowfillOy, 0);
            this.render = this.getval(cloudlayer.render, 0);  // 0 - redraw, 1 - scale
            this.oaspect = this.getval(cloudlayer.oaspect, true);
            this.flipH = this.getval(cloudlayer.flipH, false);
            this.flipV = this.getval(cloudlayer.flipV, false);
            this.skewA = this.getval(cloudlayer.skewA, 0);
            this.skewB = this.getval(cloudlayer.skewB, 0);
            this.skewDir = this.getval(cloudlayer.skewDir, 1);
            this.texted = this.getval(cloudlayer.texted, {});
            this.locked = this.getval(cloudlayer.locked, false);
            this.visible = this.getval(cloudlayer.visible, true);
            this.disposed = this.getval(cloudlayer.disposed, 0);

            for (var _i in this.texted) {
                for (var _i2 in this.texted[_i]) {
                    if (isNaN(parseInt(_i2))) {
                        delete this.texted[_i];
                    } else {
                        this.texted[_i][_i2].active = this.getval(this.texted[_i][_i2].active, false);
                        this.texted[_i][_i2].content = this.getval(this.texted[_i][_i2].content, "");
                        this.texted[_i][_i2].x = this.getval(this.texted[_i][_i2].x, "");
                        this.texted[_i][_i2].y = this.getval(this.texted[_i][_i2].y, "");
                    }
                }
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
            var html = '<div class="toolboxLayer toolboxLayerCOM" id="lyr' + k.toString() + '" data-order="' + layerIndex.toString() + '" data-var-index="' + k.toString() + '"><button id="btn-layer-visible-' + k.toString() + '" class="btn-layer-visible"><span class="fa fa-eye"></span></button><div class="sorthandle"><span class="fa fa-sort"></span></div><div class="square bg" id="txt' + k.toString() + '"><div class="label-template"><i class="fa fa-paw"></i></div><div class="content"><div class="table"><div class="table-cell"><span class="fa fa-eye-slash icon-hidehide"></span><span class="fa fa-lock icon-hidehide"></span></div></div></div><div class="tl"><div class="tleditnote"></div><div class="tlnote"></div><div class="tlcontent">' + content + '</div></div></div><div class="ttl" id="ttl' + k.toString() + '"><button class="btn btn-xs btn-link editLayerNote"><span class="fa fa-pencil"></span></button></div></div>';
            // remove layer if exists
            $("#lyr" + k.toString()).remove();
            if (prepend)
                $("#toolboxLayerSortable").prepend(html);
            else
                $("#toolboxLayerSortable").append(html);
            $("#lyr" + k.toString() + " .tlnote").text(tlnote);
            if (typeof WPImager.slides[this.comslide] !== "undefined") {
                $("#lyr" + k.toString() + " .tlcontent").text(WPImager.slides[this.comslide].slidetitle);
            }

            // set font & color indicator of new layer
            $("#toolboxLayerSortable").scrollTop($("#lyr" + this.index.toString()).position().top);
            if (this.disposed > 0) {
                $("#lyr" + k.toString()).hide();
            }
        },
        selectLayer: function () {
            $(".ttl,.itl,.gtl,.taskconsole").hide();
            $("#ttl" + this.index.toString()).show();
            WPImager.refreshIconVisible();
            WPImager.refreshIconLock();
            $(".toolboxLayer,.toolboxLayer,.toolboxLayerMix,.toolFormLayer").removeClass("active multi");
            $("#lyr" + this.index.toString()).addClass("active selected");
            $("#a-lyr" + this.index.toString()).addClass("active selected");
            $("#am-lyr" + this.index.toString()).addClass("active selected");
            $("#txtconsole_task,#imgconsole_task,#editLayerNote,#editActionNote").hide();
            $(".taskconsole").hide();
            $("#txtconsole_task .btn-tab").hide();
            $("#txtconsole_task,#txtconsole,#txtconsole_task .taskconsole_COM").show();
            this.selectToolbar();
            this.controlUpdate();
        },
        showTextEdit: function () {
            $("#com-textedit-box").empty();
            UI.textEditBoxCount = 0;
            var maxOrder = SlideAction.getSlideMaxOrder();
            // first pass - parent component
            for (var order = 1; order <= maxOrder; order++)
            {
                var arrIndex = WPImager.canvas.arrIndex;
                for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                    var k = arrIndex[ix];
                    if (WPImager.layer[k].disposed === 1) {
                        // skip draw
                    } else if ((WPImager.layer[k].slide === this.comslide)
                            && WPImager.layer[k].order === order) {
                        if (WPImager.layer[k].code == UI.LAYER.TEXT) {
                            var content = WPImager.layer[k].content;
                            if (typeof this.texted[k] !== "undefined" && typeof this.texted[k][k] !== "undefined") {
                                // var replaceWith = (this.texted[k][k].active) ? this.texted[k][k].content : content;
                                var replaceWith = this.texted[k][k].content;
                                var x = this.texted[k][k].x;
                                var y = this.texted[k][k].y;
                                if (content.length > 0) {
                                    this.prepareTextEditBox(this.comslide, k, k, 0, content, this.texted[k][k].active, replaceWith, x, y);
                                    UI.textEditBoxCount++;
                                }
                            } else if (content.length > 0) {
                                this.prepareTextEditBox(this.comslide, k, k, 0, content, false, "", 0, 0);
                                UI.textEditBoxCount++;
                            }
                        } else if (WPImager.layer[k].code == UI.LAYER.COM) {
                            // leave to second pass

                        }
                    }
                }
            }


            // second pass - child component
            for (var order = 1; order <= maxOrder; order++)
            {
                var arrIndex = WPImager.canvas.arrIndex;
                for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                    var k = arrIndex[ix];
                    if (WPImager.layer[k].disposed === 1) {
                        // skip draw
                    } else if ((WPImager.layer[k].slide === this.comslide)
                            && WPImager.layer[k].order === order) {
                        // layers beloning to component slide(comslide) found
                        if (WPImager.layer[k].code == UI.LAYER.TEXT) {
                            // covered in first pass
                        } else if (WPImager.layer[k].code == UI.LAYER.COM) {
                            this.showTextEditCom(k, true, this.texted);
                        }
                    }
                }
            }
            if (WPImager.layer[WPImager.current].code == UI.LAYER.COM) {
                var comslide = WPImager.layer[WPImager.current].comslide;
                var comdraw = WPImager.layer[WPImager.current];
                var export_code = WPImager.slides[comslide].comExportCode(comdraw.x, comdraw.y, comdraw.width, comdraw.height);
                $("#exportSlideCode2").val(export_code);
            }
            $("#com-textedit-none").toggle(UI.textEditBoxCount == 0);
            var dialogheight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) * 0.9;
            $('#dialog-com-textedit .modal-body').css('overflow-y', 'auto');
            $('#dialog-com-textedit .modal-body').css('height', (dialogheight - 200).toString() + 'px');

            $('#dialog-com-textedit .modal-dialog').draggable();
            $("#dialog-com-textedit").modal({backdrop: 'static'});
        },
        showTextEditCom: function (k, processCOM, grandtexted, index) {
            // now go for child component
            var _comslide = WPImager.layer[k].comslide;
            if (typeof WPImager.slides[_comslide] === "undefined")
                return;

            var maxOrder = SlideAction.getSlideMaxOrder();
            for (var _order = 1; _order <= maxOrder; _order++)
            {
                var arrIndex = WPImager.canvas.arrIndex;
                for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                    var _k = arrIndex[ix];
                    if (WPImager.layer[_k].disposed === 1) {
                        // skip draw
                    } else if ((WPImager.layer[_k].slide === _comslide)
                            && WPImager.layer[_k].order === _order) {
                        // layers beloning to component slide(_comslide) found
                        if (WPImager.layer[_k].code == UI.LAYER.TEXT) {
                            if (processCOM) {
                                this.addTextEditBox(_comslide, k, _k);
                            } else {
                                this.addTextEditBox(_comslide, k, _k, grandtexted, index);
                            }
                        } else if (processCOM && WPImager.layer[_k].code == UI.LAYER.COM) {
                            this.showTextEditCom(_k, false, WPImager.layer[this.index].texted, k);
                        }
                    }
                }
            }
        },
        addTextEditBox: function (comslide, k, _k, grandtexted, index) {
            var content_child = WPImager.layer[_k].content; // bottom
            var content_parent = content_child;
//            var hasPreparedTextBox = false;
            var _texted = WPImager.layer[k].texted;
            var xFine = 0, yFine = 0;
            var replaceWith = "";
            var active = false;
            if (typeof _texted[_k] !== "undefined" && typeof _texted[_k][_k] !== "undefined") {
                if (_texted[_k][_k].active)
                {
                    content_parent = _texted[_k][_k].content; // middle                                                    
                }
                xFine = _texted[_k][_k].x;
                yFine = _texted[_k][_k].y;
            }

            if (typeof grandtexted !== "undefined") {
                _texted = grandtexted;
                if (typeof _texted[index] !== "undefined"
                        && typeof _texted[index][k] !== "undefined"
                        && typeof _texted[index][k][_k] !== "undefined") {
                    if (_texted[index][k][_k].active) {
                        // content_parent = _texted[k][_k].content; // layer[60..64].texted
                        replaceWith = _texted[index][k][_k].content;
                        active = true;
                    }
                    xFine = _texted[index][k][_k].x;
                    yFine = _texted[index][k][_k].y;
                }
            }


            if (typeof this.texted[k] !== "undefined"
                    && typeof this.texted[k][_k] !== "undefined") {
                if (this.texted[k][_k].active)
                {
                    active = true;
                }
                xFine = this.texted[k][_k].x;
                yFine = this.texted[k][_k].y;
                replaceWith = this.texted[k][_k].content;
            }

            if (content_parent.length > 0) {
                var _index = (typeof grandtexted !== "undefined") ? index : 0;
                this.prepareTextEditBox(comslide, k, _k, _index, content_parent, active, replaceWith, xFine, yFine);
                UI.textEditBoxCount++;
            }

        },
        prepareTextEditBox: function (comslide, k, _k, index, content, active, replaceWith, x, y) {
            var com_title = WPImager.slides[comslide].slidetitle;
            var layer_title = WPImager.layer[k].layernote;
            var id = 'com-textedit-layer-' + k.toString() + '-' + _k.toString();
            if (index > 0) {
                id = 'com-textedit-layer-' + index.toString() + '-' + k.toString() + '-' + _k.toString();
            }
            var $div = $('<div/>', {
                'id': id,
                'class': 'com-textedit-layer' + (active ? ' overwrite' : ''),
                'data-index': index.toString(),
                'data-layer-k': _k.toString(),
                'data-layerk': k.toString()
            })
            $div.appendTo('#com-textedit-box');

            var $ori = $('<div/>', {
                'class': 'com-textedit-ori'
            }).appendTo($div);

            var $ori_content = $('<div/>', {
                'class': 'com-textedit-ori-content',
                'style': 'padding:0 3px',
                'text': content
            }).appendTo($ori);

            var $overwrite = $('<div/>', {
                'class': 'com-textedit-overwrite'
            }).appendTo($div);


            var $ori_footer = $('<div/>', {
                'class': 'com-textedit-ori-footer'
            }).appendTo($ori);

            var $ori_footer_xy = $('<div/>', {
                'class': 'com-textedit-ori-footer-xy'
            }).appendTo($ori_footer);


            $ori_footer_xy.append("x: ");
            var $x = $('<input/>', {
                'class': 'com-textedit-x',
                'type': 'textbox',
                'value': 0
            }).appendTo($ori_footer_xy);

            $ori_footer_xy.append(" y: ");
            var $y = $('<input/>', {
                'class': 'com-textedit-y',
                'type': 'textbox',
                'value': 0
            }).appendTo($ori_footer_xy);

            $('<button class="btn btn-slate btn-xs cmd-textedit-overwrite" data-index="' + index.toString() + '" data-layer-k="' + _k.toString() + '" data-layerk="' + k.toString() + '">Overwrite</button>').appendTo($ori_footer);
            var $component_title = $('<div/>', {
                'text': ' ● ' + com_title + ' [' + layer_title + ']',
                'style': 'display:inline-block;padding:4px 6px;font-size:0.9em',
            }).appendTo($ori_footer);

            $y.spinner({step: 1}).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    $(this).spinner("value", 0);
                }
            });

            $x.spinner({step: 1}).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    $(this).spinner("value", 0);
                }
            });

            $x.spinner("value", parseInt(x));
            $y.spinner("value", parseInt(y));

            var $textarea = $('<textarea rows="2" class="form-control" style="width:100%">');
            $textarea.val(replaceWith);
            $overwrite.append($textarea);
        },
        addLayerOffset: function (dx, dy) {
            if (this.locked)
                return;
            this.x += dx;
            this.y += dy;
        },
        setActiveLayer: function () {
            // record layer info for resize
            var activeLayerWidth = this.layerWidth();
            var activeLayerHeight = this.layerHeight();
            var activeLayerX = this.x;
            var activeLayerY = this.y;
            this.temp = activeLayerX.toString() + ' ' + activeLayerY.toString() + ' ' + activeLayerWidth.toString() + ' ' + activeLayerHeight.toString();
        },
        moveLayer: function (dx, dy) {
            this.addLayerOffset(dx, dy);
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

        },
        mouseHovering: function (x, y) {
            var resizeBoxArea = 12;
            if (!this.locked) {

                var w = this.width;
                var h = this.height;
                var mx = this.x + w / 2;
                var my = this.y + h / 2;
                var unrotate = this.rotate(-x, -y, mx, my, -this.rotation);
                var x_unrotated = -unrotate[0];
                var y_unrotated = -unrotate[1];

                this.refreshEdgeHandlers(WPImager.current);
                // check for resize corner hit
                for (var i = 0; i <= 8; i++) {
                    var cur = UI.edgeHandles[i];
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
        mouseDragging: function (dx, dy) {
            if (UI.isResizeDrag) {
                if (UI.expectResize >= 0 && UI.expectResize <= 8) {
                    this.mouseResizeLayer(dx, dy);
                }
            } else {
                this.addLayerOffset(dx, dy);
            }
        },
        mouseResizeLayer: function (dx, dy) {
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
                this.x = activeLayerX;
                this.y = activeLayerY;
                this.width = activeLayerWidth;
                this.height = activeLayerHeight;
//                dx = UI.touchedDX;
//                dy = UI.touchedDY;
                // record anchor points
                switch (UI.expectResize) {
                    case 0: // corner
                        _rotate = this.rotate(this.x + this.width, this.y + this.height, this.posX(), this.posY(), this.rotation);
                        break;
                    case 1:
                        _rotate = this.rotate(this.x + this.width / 2, this.y + this.height, this.posX(), this.posY(), this.rotation);
                        break;
                    case 2: // corner
                        _rotate = this.rotate(this.x, this.y + this.height, this.posX(), this.posY(), this.rotation);
                        break;
                    case 3:
                        _rotate = this.rotate(this.x + this.width, this.y + this.height / 2, this.posX(), this.posY(), this.rotation);
                        break;
                    case 4:
                        _rotate = this.rotate(this.x, this.y + this.height / 2, this.posX(), this.posY(), this.rotation);
                        break;
                    case 5: // corner
                        _rotate = this.rotate(this.x + this.width, this.y, this.posX(), this.posY(), this.rotation);
                        break;
                    case 6:
                        _rotate = this.rotate(this.x + this.width / 2, this.y, this.posX(), this.posY(), this.rotation);
                        break;
                    case 7:
                        _rotate = this.rotate(this.x, this.y, this.posX(), this.posY(), this.rotation);
                        break;

                }
                x_corner_rotated = _rotate[0];
                y_corner_rotated = _rotate[1];

                var corner_unrotate = this.rotate(UI.touchedX, UI.touchedY, this.posX(), this.posY(), -this.rotation);
                var hover_unrotate = this.rotate(UI.hoverX, UI.hoverY, this.posX(), this.posY(), -this.rotation);
                dx = hover_unrotate[0] - corner_unrotate[0];
                dy = hover_unrotate[1] - corner_unrotate[1];
            }

            switch (UI.expectResize) {
                case 0:
                    if (this.height - dy >= resizeMinHeight && this.width - dx >= resizeMinWidth
                            || dx < 0 && dy < 0) {

                        // resize NW 
                        this.x += dx;
                        this.y += dy;
                        this.width += -dx;
                        this.height += -dy;
                    }
                    break;
                case 1:
                    if (this.height - dy >= resizeMinHeight || dy < 0) {
                        // resize N
                        this.y += dy;
                        this.height += -dy;
                    }
                    break;
                case 2:
                    if (this.height - dy >= resizeMinHeight && this.width + dx >= resizeMinWidth
                            || dx > 0 && dy > 0) {

                        // resize NE
                        this.y += dy;
                        this.width += dx;
                        this.height += -dy;
                    }
                    break;
                case 3:
                    if (this.width - dx >= resizeMinWidth || dx < 0) {
                        // resize W
                        this.x += dx;
                        this.width += -dx;
                    }
                    break;
                case 4:
                    if (this.width + dx >= resizeMinWidth || dx > 0) {
                        // resize E
                        this.width += dx;
                    }
                    break;
                case 5:
                    if (this.height + dy >= resizeMinHeight && this.width - dx >= resizeMinWidth
                            || dx < 0 && dy > 0) {
                        // resize SW
                        this.x += dx;
                        this.width += -dx;
                        this.height += dy;
                    }
                    break;
                case 6:
                    if (this.height + dy >= resizeMinHeight || dy > 0) {
                        // resize S
                        this.height += dy;
                    }
                    break;
                case 7:
                    if (this.height + dy >= resizeMinHeight && this.width + dx >= resizeMinWidth
                            || dx > 0 && dy > 0) {
                        // resize SE
                        this.width += dx;
                        this.height += dy;
                    }
                    break;
                case 8:
                    // rotate
                    //this.rotation += dx;
                    var p2 = {x: UI.hoverX, y: UI.hoverY};
                    var p1 = {x: this.x + this.width / 2, y: this.y + this.height / 2};
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


            if (this.oaspect) {
                if (typeof WPImager.slides[this.comslide] === "undefined") {
                    this.oaspect = false;
                    $('#keepOriAspectOn').css('display', (this.oaspect ? "inline-block" : "none"));
                    $('#keepOriAspectOff').css('display', (!this.oaspect ? "inline-block" : "none"));
                } else {
                    var com_canvas_width = WPImager.slides[this.comslide].canvas_width;
                    var com_canvas_height = WPImager.slides[this.comslide].canvas_height;

                    if (UI.expectResize == 1 || UI.expectResize == 6) {
                        this.width = this.height * (com_canvas_width / com_canvas_height);
                    } else if (UI.expectResize == 3 || UI.expectResize == 4) {
                        this.height = this.width * (com_canvas_height / com_canvas_width);
                    } else if ((this.width / this.height) > (com_canvas_width / com_canvas_height)) {
                        this.height = this.width * (com_canvas_height / com_canvas_width);
                    } else {
                        this.width = this.height * (com_canvas_width / com_canvas_height);
                    }
                }
            } else if (UI.shift_pressed || this.shape == UI.SHAPE.POLYGON) {
                var ratio = activeLayerWidth / activeLayerHeight;
                if (UI.expectResize == 1 || UI.expectResize == 6) {
                    this.width = this.height * ratio;
                } else if (UI.expectResize == 3 || UI.expectResize == 4) {
                    this.height = this.width / ratio;
                } else if (this.width / this.height > ratio) {
                    this.height = this.width / ratio;
                } else {
                    this.width = this.height * ratio;
                }
            }

            if (UI.expectResize !== 8) {
                switch (UI.expectResize) {
                    case 0: // corner
                        _rotate = this.rotate(this.x + this.width, this.y + this.height, this.posX(), this.posY(), this.rotation);
                        break;
                    case 1:
                        _rotate = this.rotate(this.x + this.width / 2, this.y + this.height, this.posX(), this.posY(), this.rotation);
                        break;
                    case 2: // corner
                        _rotate = this.rotate(this.x, this.y + this.height, this.posX(), this.posY(), this.rotation);
                        break;
                    case 3:
                        _rotate = this.rotate(this.x + this.width, this.y + this.height / 2, this.posX(), this.posY(), this.rotation);
                        break;
                    case 4:
                        _rotate = this.rotate(this.x, this.y + this.height / 2, this.posX(), this.posY(), this.rotation);
                        break;
                    case 5: // corner
                        _rotate = this.rotate(this.x + this.width, this.y, this.posX(), this.posY(), this.rotation);
                        break;
                    case 6:
                        _rotate = this.rotate(this.x + this.width / 2, this.y, this.posX(), this.posY(), this.rotation);
                        break;
                    case 7: // corner
                        _rotate = this.rotate(this.x, this.y, this.posX(), this.posY(), this.rotation);
                        break;

                }

                this.x += x_corner_rotated - _rotate[0];
                this.y += y_corner_rotated - _rotate[1];
            }
            this.controlUpdate();
            this.renderComCanvas();
        },
        hitTest: function (x, y) {
            var hit = false;
            if (this.visible && this.disposed == 0) {
                hit = this.hit(-x, -y, this.absLeft, this.absTop, this.absRight, this.absBottom, this.rotation);
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
        multiSelect: function () {
            // select layer on Layers toolbox
            $("#lyr" + this.index.toString()).addClass("multi selected");
        },
        multiDeSelect: function () {
            // deselect layer on Layers toolbox
            $("#lyr" + this.index.toString()).removeClass("multi selected");
        },
        X: function () {
            return this.x;
        },
        Y: function () {
            return this.y;
        },
        setX: function (x) {
            this.x = x;
        },
        setY: function (y) {
            this.y = y;
        },
        posX: function () {
            // get object's center x-coordinate
            return this.x + this.width / 2;
        },
        posY: function () {
            // get object's center y-coordinate
            return this.y + this.height / 2;
        },
        calXYFromCenter: function (cx, cy) {
            this.x = cx - (this.width / 2);
            this.y = cy - (this.height / 2);
        },
        rotated: function () {
            return this.rotation;
        },
        layerWidth: function () {
            return this.width;
        },
        layerHeight: function () {
            return this.height;
        },
        applyCanvasWidth: function (canvas) {
            var deg = (this.rotation + 360) % 360;
            var makeEqualWH = true;
            makeEqualWH = false;
            if (deg % 90 !== 0)
                return;


            if (deg % 180 == 0) {
                this.width = canvas.width;
                if (makeEqualWH)
                    this.height = this.width;
            } else if (deg % 90 == 0) {
                var old_height = this.height;
                this.height = canvas.width;
                this.y = this.y - (canvas.width - old_height) / 2;
                if (makeEqualWH)
                    this.width = this.height;
            }
            this.refreshEdgeHandlers();
            this.alignHorizontal("left", WPImager.slides[this.slide].canvas_width);
            this.renderComCanvas();
        },
        applyCanvasHeight: function (canvas) {
            var deg = (this.rotation + 360) % 360;
            var makeEqualWH = true;
            makeEqualWH = false;
            if (deg % 90 !== 0)
                return;

            if (deg % 180 == 0) {
                this.height = canvas.height;
                if (makeEqualWH)
                    this.width = this.height;
            } else if (deg % 90 == 0) {
                var old_width = this.width;
                this.width = canvas.height;
                this.x = this.x - (canvas.height - old_width) / 2;
                if (makeEqualWH)
                    this.height = this.width;
            }
            this.refreshEdgeHandlers();
            this.alignVertical("top", WPImager.slides[this.slide].canvas_height);
            this.renderComCanvas();
        },
        spinHeight: function (height, doratio, uirefresh)
        {
            if ($("#txtHeight").spinner("isValid")) {
                var moveY = (this.height - height) / 2;
                this.y += moveY; // keep Y centered      
                // keep ratio 
//                var txtkeepratio = doratio && $("#txtkeepratio").prop("checked");
//                if (txtkeepratio) {
//                    var width = (this.width / this.height) * height;
//                    this.x += (this.width - width) / 2;
//                    this.width = width;                    
//                }
                if (this.oaspect) {
                    if (typeof WPImager.slides[this.comslide] === "undefined") {
                        this.oaspect = false;
                        $('#keepOriAspectOn').css('display', (this.oaspect ? "inline-block" : "none"));
                        $('#keepOriAspectOff').css('display', (!this.oaspect ? "inline-block" : "none"));
                    } else {
                        var com_canvas_width = WPImager.slides[this.comslide].canvas_width;
                        var com_canvas_height = WPImager.slides[this.comslide].canvas_height;
                        var width = height * (com_canvas_width / com_canvas_height);
                        this.x += (this.width - width) / 2;
                        this.width = width;
                    }
                }

                this.height = height; // new height
                $("#txtWidth").spinner("value", this.width);
                this.renderComCanvas();
            }
        },
        spinWidth: function (width, doratio, uirefresh)
        {
            if ($("#txtWidth").spinner("isValid")) {
                var moveX = (this.width - width) / 2;
                this.x += moveX; // keep X centered                   
                // keep ratio 
//                var txtkeepratio = doratio && $("#txtkeepratio").prop("checked");
//                if (txtkeepratio) {
//                    var height = (this.height / this.width) * width;
//                    this.y += (this.height - height) / 2;
//                    this.height = height;
//                    
//                }
                if (this.oaspect) {
                    if (typeof WPImager.slides[this.comslide] === "undefined") {
                        this.oaspect = false;
                        $('#keepOriAspectOn').css('display', (this.oaspect ? "inline-block" : "none"));
                        $('#keepOriAspectOff').css('display', (!this.oaspect ? "inline-block" : "none"));
                    } else {
                        var com_canvas_width = WPImager.slides[this.comslide].canvas_width;
                        var com_canvas_height = WPImager.slides[this.comslide].canvas_height;
                        var height = width * (com_canvas_height / com_canvas_width);
                        this.y += (this.height - height) / 2;
                        this.height = height;
                    }
                }
                this.width = width;
                // refresh height spinner
                $("#txtHeight").spinner("value", this.height);
                this.renderComCanvas();
            }
        },
        alignHorizontal: function (oalign, canvas_width) {
            // align layer horizontally, rotation considered
            var w = this.width;
            var origin_x = UI.edgeHandles[0]._x + (UI.edgeHandles[7]._x - UI.edgeHandles[0]._x) / 2;
            var origin_y = UI.edgeHandles[0]._y + (UI.edgeHandles[7]._y - UI.edgeHandles[0]._y) / 2;
            var rotated;
            rotated = this.rotate(UI.edgeHandles[0]._x, UI.edgeHandles[0]._y, origin_x, origin_y, this.rotation);
            var x1 = this.x - rotated[0];
            rotated = this.rotate(UI.edgeHandles[2]._x, UI.edgeHandles[2]._y, origin_x, origin_y, this.rotation);
            var x2 = this.x - rotated[0];
            rotated = this.rotate(UI.edgeHandles[5]._x, UI.edgeHandles[5]._y, origin_x, origin_y, this.rotation);
            var x3 = this.x - rotated[0];
            rotated = this.rotate(UI.edgeHandles[7]._x, UI.edgeHandles[7]._y, origin_x, origin_y, this.rotation);
            var x4 = this.x - rotated[0];
            if (oalign === "left") {
                this.x = Math.max(x1, x2, x3, x4);
            } else if (oalign === "right")
                this.x = canvas_width + Math.min(x1, x2, x3, x4);
            else {
                this.x = (canvas_width - w) / 2;
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
            var y1 = this.y - rotated[1];
            rotated = this.rotate(UI.edgeHandles[2]._x, UI.edgeHandles[2]._y, origin_x, origin_y, this.rotation);
            var y2 = this.y - rotated[1];
            rotated = this.rotate(UI.edgeHandles[5]._x, UI.edgeHandles[5]._y, origin_x, origin_y, this.rotation);
            var y3 = this.y - rotated[1];
            rotated = this.rotate(UI.edgeHandles[7]._x, UI.edgeHandles[7]._y, origin_x, origin_y, this.rotation);
            var y4 = this.y - rotated[1];
            if (voalign === "top") {
                this.y = Math.max(y1, y2, y3, y4);
            } else if (voalign === "bottom") {
                this.y = canvas_height + Math.min(y1, y2, y3, y4);
            } else {
                this.y = (canvas_height - h) / 2;
            }
            setTimeout(function () {
                $("#txt_ovalign_top, #txt_ovalign_middle, #txt_ovalign_bottom").removeClass("active");
            }, 100);
        },
        duplicate: function () {
            if (this.index == 0)
                return;
            var srcLayer = this.index;
            WPImager.addCOMLayer(WPImager.layer[srcLayer].comslide);
            for (var attr in WPImager.layer[srcLayer]) {
                if (attr !== "WPImager.current" && attr !== "order" && attr !== "layernote" && WPImager.layer[WPImager.current].hasOwnProperty(attr)) {
                    WPImager.layer[WPImager.current][attr] = WPImager.layer[srcLayer][attr];
                }
            }
            WPImager.layer[WPImager.current].index = WPImager.current;
            WPImager.layer[WPImager.current].slide = WPImager.slide;
            WPImager.layer[WPImager.current].content = WPImager.layer[srcLayer].content;
            if (WPImager.layer[srcLayer].layernote.length > 0) {
                WPImager.layer[WPImager.current].layernote = UI.affixCopyLabel(WPImager.layer[srcLayer].layernote);
            }

            WPImager.layer[WPImager.current].visible = true;
            WPImager.layer[WPImager.current].x += 5;
            WPImager.layer[WPImager.current].y += 5;
            WPImager.layer[WPImager.current].renderComCanvas();
            WPImager.layer[WPImager.current].renderComCanvas();
            WPImager.layer[WPImager.current].controlUpdate();
        },
        drawCOM: function (canvas_width, canvas_height) {
            var findex = this.index;
            var visible = this.visible;
            if (findex === 0 || !visible)
                return;
            if (this.disposed > 0)
                return;
            if (typeof WPImager.slides[this.comslide] === "undefined")
                return;
            this.absLeft = this.x;
            this.absTop = this.y;
            this.absRight = this.absLeft + this.width;
            this.absBottom = this.absTop + this.height;

            var ComCanvasID = 'comcanvas_' + this.index.toString() + '_' + this.comslide.toString();
            if ($('#' + ComCanvasID).length == 0) {
                var attrCanvas = {
                    id: ComCanvasID,
                    'class': ''
                };
                $('<canvas/>', attrCanvas).appendTo('#ComCanvasEstate');
            }

            if (UI.comSlideRenderCanvas)
            {
                this.renderComCanvas(ComCanvasID);
            }
            var ComCanvas = document.getElementById(ComCanvasID);
            var scaleX = 1, scaleY = 1;
            if (this.render == 0) {
                var com_canvas_width = WPImager.slides[this.comslide].canvas_width;
                var com_canvas_height = WPImager.slides[this.comslide].canvas_height;
                scaleX = this.width / com_canvas_width;
                scaleY = this.height / com_canvas_height;
            }
            var skewA = this.skewA * scaleX;
            var skewB = this.skewB * scaleY;
            // only skew tranform for layers in normal slides - exclude components
            var skewRender = (WPImager.slides[this.comslide].mode !== "kit" && (skewA > 0 || skewB > 0));

            if (skewRender) {
                var ComPerspective = document.getElementById("comperspective");
                var QtxPerspective = ComPerspective.getContext('2d');
                var overlap = 0;

                ComPerspective.width = ComCanvas.width;
                ComPerspective.height = ComCanvas.height;
                var p = new Perspective(QtxPerspective, ComCanvas, 0, 0, ComCanvas.width, ComCanvas.height, 0);
                var cpH = ComPerspective.height;
                var cpW = ComPerspective.width;
                if (this.skewDir == 1) {
                    skewA = (skewA > cpH ? cpH : skewA);
                    skewA = (skewA < -cpH ? -cpH : skewA);
                    skewB = (skewB > cpH ? cpH : skewB);
                    skewB = (skewB < -cpH ? -cpH : skewB);
                    // vertical skew
                    if (skewA >= 0 && skewB >= 0) {
                        overlap = (cpH - (skewA + skewB)) / 2;
                        if (overlap < 0) {
                            skewA += overlap;
                            skewB += overlap;
                        }
                        p.draw([[0, 0], [cpW, skewA], [cpW, cpH - skewB], [0, cpH]], 0, 0, 0);
                    } else if (skewA >= 0 && skewB <= 0) {
                        p.draw([[0, 0], [cpW, skewA], [cpW, cpH], [0, cpH + skewB]], 0, 0, 0);
                    } else if (skewA <= 0 && skewB >= 0) {
                        p.draw([[0, -skewA], [cpW, 0], [cpW, cpH - skewB], [0, cpH]], 0, 0, 0);
                    } else if (skewA <= 0 && skewB <= 0) {
                        overlap = (cpH + (skewA + skewB)) / 2;
                        if (overlap < 0) {
                            skewA += -overlap;
                            skewB += -overlap;
                        }
                        p.draw([[0, -skewA], [cpW, 0], [cpW, cpH], [0, cpH + skewB]], 0, 0, 0);
                    }
                } else {
                    skewA = (skewA > cpW ? cpW : skewA);
                    skewA = (skewA < -cpW ? -cpW : skewA);
                    skewB = (skewB > cpW ? cpW : skewB);
                    skewB = (skewB < -cpW ? -cpW : skewB);
                    // horizontal skew
                    if (skewA >= 0 && skewB >= 0) {
                        overlap = (cpW - (skewA + skewB)) / 2;
                        if (overlap < 0) {
                            skewA += overlap;
                            skewB += overlap;
                        }
                        p.draw([[skewA, 0], [cpW - skewB, 0], [cpW, cpH], [0, cpH]], 0, 0, 0);
                    } else if (skewA >= 0 && skewB <= 0) {
                        p.draw([[skewA, 0], [cpW, 0], [cpW + skewB, cpH], [0, cpH]], 0, 0, 0);
                    } else if (skewA <= 0 && skewB >= 0) {
                        p.draw([[0, 0], [cpW - skewB, 0], [cpW, cpH], [-skewA, cpH]], 0, 0, 0);
                    } else if (skewA <= 0 && skewB <= 0) {
                        overlap = (cpW + (skewA + skewB)) / 2;
                        if (overlap < 0) {
                            skewA += -overlap;
                            skewB += -overlap;
                        }
                        p.draw([[0, 0], [cpW, 0], [cpW + skewB, cpH], [-skewA, cpH]], 0, 0, 0);
                    }
                }
//                WPImagerUI.ctx.drawImage(ComPerspective, 0, 0);
            }

            var _ComCanvas = document.getElementById("comcanvas");  // current canvas size     
            _ComCanvas.width = canvas_width;
            _ComCanvas.height = canvas_height;
            var _ComQtx = _ComCanvas.getContext('2d');

            _ComQtx.translate(parseInt(this.x + this.width / 2), parseInt(this.y + this.height / 2));
            _ComQtx.rotate(this.rotation * Math.PI / 180);
            _ComQtx.translate(parseInt(-this.width / 2), parseInt(-this.height / 2));

            _ComQtx.globalCompositeOperation = "source-over";
            _ComQtx.shadowColor = "transparent";

            _ComQtx.save();
            var scaleH = this.flipH ? -1 : 1, // if flip horizontal -1
                    scaleV = this.flipV ? -1 : 1, // if flip vertical -1
                    posX = this.flipH ? this.width * -1 : 0, // flip horizontal -width
                    posY = this.flipV ? this.height * -1 : 0; // flip vertical -height
            _ComQtx.scale(scaleH, scaleV);            // draw component - copy from comcanvas to _comcanvas
            if (skewRender) {
                _ComQtx.drawImage(ComPerspective, posX, posY, this.width, this.height);
            } else {
                _ComQtx.drawImage(ComCanvas, posX, posY, this.width, this.height);
            }
            _ComQtx.restore();

            var alpha = this.alpha;
            alpha = (alpha > 0 && alpha < 100) ? alpha / 100 : 1;
            WPImagerUI.ctx.globalAlpha = alpha;
            WPImagerUI.ctx.drawImage(_ComCanvas, 0, 0);
            _ComQtx.translate(parseInt(this.width / 2), parseInt(this.height / 2));
            _ComQtx.rotate(-this.rotation * Math.PI / 180);
            _ComQtx.translate(-parseInt(this.x + this.width / 2), -parseInt(this.y + this.height / 2));


            var color = (this.locked) ? "#aa1111" : "#ffffff";
            var w = this.width, h = this.height;
            var layer = this.index;
            if (UI.resizeCVS) {
                // skip drawing guide
            } else {
                if (UI.hitLayer >= 0 && UI.expectPoint == -1)
                {
                    var hitlayer = parseInt(UI.hitLayer);
                    if (layer === hitlayer && layer !== parseInt(WPImager.current)
                            || (WPImager.canvas.picktool === 1 && layer === hitlayer)) {
                        WPImagerUI.draw_expect_guide(1, color, this.x, this.y, w, h, 0, 0, w / 2, h / 2, w, h, this.rotation, false);
                    }
                }

                if ((layer === parseInt(WPImager.current) && WPImager.canvas.picktool === UI.LAYER.COM) ||
                        WPImager.multiselect.indexOf(layer) !== -1)
                {
                    if (!UI.isPrinting) {
                        var color = (this.locked) ? "#aa1111" : "#4285f4";
                        WPImagerUI.draw_current_guide(color, this.x, this.y, this.width, this.height, 0, 0, this.width / 2, this.height / 2, this.width, this.height, this.rotation, WPImagerUI.degMax, UI.isRotating, this.locked);
                    }
                }
            }
        },
        renderComCanvas: function () {
            var ComCanvasID = 'comcanvas_' + this.index.toString() + '_' + this.comslide.toString();
            if ($('#' + ComCanvasID).length == 0) {
                var attrCanvas = {
                    id: ComCanvasID,
                    'class': ''
                };
                $('<canvas/>', attrCanvas).appendTo('#ComCanvasEstate');
            }
            var ComCanvas = document.getElementById(ComCanvasID);
            var ComQtx = ComCanvas.getContext('2d');

            if (typeof WPImager.slides[this.comslide] == "undefined"
                    || WPImager.slides[this.comslide].disposed > 0)
            {
                ComCanvas.width = this.width;
                ComCanvas.height = this.height;
                ComQtx.clearRect(0, 0, ComCanvas.width, ComCanvas.height);
                ComQtx.globalAlpha = 0.2;
                ComQtx.fillRect(0, 0, ComCanvas.width, ComCanvas.height);
                ComQtx.globalAlpha = 0.7;
                ComQtx.font = 'normal 17px Lato';
                ComQtx.textAlign = 'center';
                ComQtx.textBaseline = 'middle';
                ComQtx.fillStyle = "#ffffff";
                ComQtx.shadowColor = "#333333";
                ComQtx.shadowBlur = 10;
                ComQtx.fillText("Component", ComCanvas.width / 2, ComCanvas.height / 2);
                ComQtx.fillText("Not Found", ComCanvas.width / 2, ComCanvas.height / 2 + 20);
                ComQtx.font = "20px Fontawesome";
                ComQtx.fillStyle = "#ffffff";
                ComQtx.fillText(String.fromCharCode(0xf1b2), ComCanvas.width / 2, ComCanvas.height / 2 - 20);

                ComQtx.fillStyle = "#000";

                WPImagerUI.setTargetCanvas(); // reset canvas
                WPImager.canvas.width = WPImager.slides[WPImager.slide].canvas_width;
                WPImager.canvas.height = WPImager.slides[WPImager.slide].canvas_height;

                return;
            }

            var com_canvas_width = WPImager.slides[this.comslide].canvas_width;
            var com_canvas_height = WPImager.slides[this.comslide].canvas_height;

            ComCanvas.width = (this.render == 0) ? this.width : com_canvas_width;
            ComCanvas.height = (this.render == 0) ? this.height : com_canvas_height;

            // clear canvas

            ComQtx.globalAlpha = 1;
            ComQtx.clearRect(0, 0, ComCanvas.width, ComCanvas.height);

            WPImagerUI.setTargetCanvas(ComCanvasID);
            WPImager.canvas.width = WPImager.slides[this.comslide].canvas_width;
            WPImager.canvas.height = WPImager.slides[this.comslide].canvas_height;
            var scaleX = 1, scaleY = 1;
            if (this.render == 0) {
                scaleX = this.width / com_canvas_width;
                scaleY = this.height / com_canvas_height;

                UI.comScale.active = true;
                UI.comScale.scaleX = scaleX;
                UI.comScale.scaleY = scaleY;
                UI.comScale.scaledWidth = this.width;
                UI.comScale.scaledHeight = this.height;
                UI.comScale.bgrCanvasWidth = com_canvas_width;
                UI.comScale.bgrCanvasHeight = com_canvas_height;
                var oriW = this.width;
                var oriH = this.height;
                this.width = com_canvas_width;
                this.height = com_canvas_height;
            }
            var maxOrder = SlideAction.getSlideMaxOrder();

            // draw all visible layers on canvas by order
            for (var order = 1; order <= maxOrder; order++)
            {
                var arrIndex = WPImager.canvas.arrIndex;
                for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                    var k = arrIndex[ix];
                    if (WPImager.layer[k].disposed === 1 || !WPImager.layer[k].visible) {
                        // skip draw
                    } else if ((WPImager.layer[k].slide === this.comslide)
                            && WPImager.layer[k].order === order) {
                        if (WPImager.layer[k].code == UI.LAYER.TEXT) {
                            // draw component
                            WPImagerUI.setTargetCanvas(ComCanvasID);
                            if (typeof this.texted[k] !== "undefined"
                                    && typeof this.texted[k][k] !== "undefined") {
//                                    && this.texted[k][k].active) {

                                var content_child = WPImager.layer[k].content; // bottom
                                var content_parent = content_child;
                                var xFine = 0, yFine = 0;
                                if (content_child !== "" && this.texted[k][k].active) {
                                    content_parent = this.texted[k][k].content; // middle
                                    xFine = this.texted[k][k].x;
                                    yFine = this.texted[k][k].y;
                                }
                                WPImager.layer[k].content = content_parent;
                                WPImager.layer[k].xFine += xFine;
                                WPImager.layer[k].yFine += yFine;
                                WPImagerUI.drawText(k, WPImager.layer[k]);
                                WPImager.layer[k].content = content_child;
                                WPImager.layer[k].xFine -= xFine;
                                WPImager.layer[k].yFine -= yFine;
                            } else {
                                WPImagerUI.drawText(k, WPImager.layer[k]);
                            }
                        } else if (WPImager.layer[k].code == UI.LAYER.COM) {
                            // draw child component
                            this.renderComChild(ComCanvasID, k, scaleX, scaleY, WPImager.layer[k].render, this.texted, false);
                        }
                    }
                }
            }

            if (this.render == 0) {
                ComQtx.scale(1, 1);
                this.width = oriW;
                this.height = oriH;
                UI.comScale.active = false;
            }

            WPImagerUI.setTargetCanvas(); // reset canvas
            WPImager.canvas.width = WPImager.slides[WPImager.slide].canvas_width;
            WPImager.canvas.height = WPImager.slides[WPImager.slide].canvas_height;
        },
        renderComChild: function (ComCanvasID, k, parent_scaleX, parent_scaleY, child_render, texted, renderingGrand, index) {
            var comslide = WPImager.layer[k].comslide;
            if (typeof WPImager.slides[comslide] === "undefined")
                return;

            var ComChildCanvasID = 'comchildcanvas_' + k.toString() + '_' + comslide.toString();
            if (renderingGrand) {
                ComChildCanvasID = 'comgrandcanvas_' + k.toString() + '_' + comslide.toString();
            }
            if ($('#' + ComChildCanvasID).length == 0) {
                var attrCanvas = {
                    id: ComChildCanvasID,
                    'class': ''
                };
                $('<canvas/>', attrCanvas).appendTo('#ComCanvasEstate');
            }

            var ComCanvasChild = document.getElementById(ComChildCanvasID);
            var child_canvas_width = WPImager.slides[comslide].canvas_width;
            var child_canvas_height = WPImager.slides[comslide].canvas_height;


            var _x = WPImager.layer[k].x * parent_scaleX,
                    _y = WPImager.layer[k].y * parent_scaleY,
                    _width = WPImager.layer[k].width * parent_scaleX,
                    _height = WPImager.layer[k].height * parent_scaleY,
                    _rotation = WPImager.layer[k].rotation,
                    _alpha = WPImager.layer[k].alpha;

            if (child_render == 0) {
                ComCanvasChild.width = _width;
                ComCanvasChild.height = _height;
            } else {
                ComCanvasChild.width = WPImager.slides[comslide].canvas_width;
                ComCanvasChild.height = WPImager.slides[comslide].canvas_height;
            }

            // clear canvas
            var ChildQtx = ComCanvasChild.getContext('2d');


            // in case component deleted - not found
            if (typeof WPImager.slides[comslide] == "undefined"
                    || WPImager.slides[comslide].disposed > 0)
            {
                WPImagerUI.setTargetCanvas(ComChildCanvasID);
                ComCanvasChild.width = _width;
                ComCanvasChild.height = _height;
                ChildQtx.clearRect(0, 0, ComCanvasChild.width, ComCanvasChild.height);
                ChildQtx.globalAlpha = 0.2;
                ChildQtx.fillRect(0, 0, ComCanvasChild.width, ComCanvasChild.height);
                ChildQtx.globalAlpha = 0.7;
                ChildQtx.font = 'normal 17px Lato';
                ChildQtx.textAlign = 'center';
                ChildQtx.textBaseline = 'middle';
                ChildQtx.fillStyle = "#ffffff";
                ChildQtx.shadowColor = "#333333";
                ChildQtx.shadowBlur = 10;
                ChildQtx.fillText("Component", ComCanvasChild.width / 2, ComCanvasChild.height / 2);
                ChildQtx.fillText("Not Found", ComCanvasChild.width / 2, ComCanvasChild.height / 2 + 20);
                ChildQtx.font = "20px Fontawesome";
                ChildQtx.fillStyle = "#ffffff";
                ChildQtx.fillText(String.fromCharCode(0xf1b2), ComCanvasChild.width / 2, ComCanvasChild.height / 2 - 20);

                ChildQtx.fillStyle = "#000";

                var _ComCanvas = document.getElementById(ComCanvasID);  // current canvas size     
                var _ComQtx = _ComCanvas.getContext('2d');
                _ComQtx.globalCompositeOperation = "source-over";
                _ComQtx.shadowColor = "transparent";
                _ComQtx.globalAlpha = 1;

                _ComQtx.translate(parseInt(_x + _width / 2), parseInt(_y + _height / 2));
                _ComQtx.rotate(_rotation * Math.PI / 180);
                _ComQtx.translate(parseInt(-_width / 2), parseInt(-_height / 2));

                _ComQtx.save();
                _ComQtx.drawImage(ComCanvasChild, 0, 0, ComCanvasChild.width, ComCanvasChild.height, 0, 0, _width, _height);//, _width, _height, 0, 0, 100, 100);                
                _ComQtx.restore();

                _ComQtx.translate(parseInt(_width / 2), parseInt(_height / 2));
                _ComQtx.rotate(-_rotation * Math.PI / 180);
                _ComQtx.translate(-parseInt(_x + _width / 2), -parseInt(_y + _height / 2));
                return;
            }

            ChildQtx.globalAlpha = 1;
            ChildQtx.clearRect(0, 0, ComCanvasChild.width, ComCanvasChild.height);

            WPImagerUI.setTargetCanvas(ComChildCanvasID);
            WPImager.canvas.width = WPImager.slides[comslide].canvas_width;
            WPImager.canvas.height = WPImager.slides[comslide].canvas_height;
            var saveUIcomScale = JSON.stringify(UI.comScale);


            // draw comcanvas_child as comcanvas size
            if (child_render == 0)
            {
                // draw comcanvas_child original size - scale to comcanvas size
                var scaleX = _width / child_canvas_width,
                        scaleY = _height / child_canvas_height;
                UI.comScale.active = true;
                UI.comScale.scaleX = scaleX;
                UI.comScale.scaleY = scaleY;
                UI.comScale.scaledWidth = _width;
                UI.comScale.scaledHeight = _height;
                UI.comScale.bgrCanvasWidth = child_canvas_width;
                UI.comScale.bgrCanvasHeight = child_canvas_height;
            } else {
                // draw comcanvas_child as comcanvas size
                UI.comScale.active = false;
            }


            var maxOrder = SlideAction.getSlideMaxOrder();
            // draw all visible layers on canvas by order
            for (var order = 1; order <= maxOrder; order++)
            {
                var arrIndex = WPImager.canvas.arrIndex;
                for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                    var _k = arrIndex[ix];
                    if (WPImager.layer[_k].disposed === 1 || !WPImager.layer[_k].visible) {
                        // skip draw
                    } else if (WPImager.layer[_k].slide === comslide
                            && WPImager.layer[_k].order === order) {
                        if (WPImager.layer[_k].code == UI.LAYER.TEXT) {
                            var _texted = WPImager.layer[k].texted;
                            var content_child = WPImager.layer[_k].content; // bottom [65]
                            var content_parent = content_child;
                            var xFine = 0, yFine = 0;

                            if (renderingGrand) {
                                if (content_child !== "") {
                                    _texted = WPImager.layer[k].texted;  // fallback level
                                    if (typeof _texted[_k] !== "undefined"
                                            && typeof _texted[_k][_k] !== "undefined") {
                                        if (_texted[_k][_k].active) {
                                            content_parent = _texted[_k][_k].content; // layer[60..64].texted
                                            xFine = _texted[_k][_k].x;
                                            yFine = _texted[_k][_k].y;
                                        }
                                    }
                                    _texted = this.texted;
                                    if (typeof _texted[index] !== "undefined"
                                            && typeof _texted[index][k] !== "undefined"
                                            && typeof _texted[index][k][_k] !== "undefined") {
                                        if (_texted[index][k][_k].active) {
                                            content_parent = _texted[index][k][_k].content; // layer[60..64].texted
                                            xFine = _texted[index][k][_k].x;
                                            yFine = _texted[index][k][_k].y;
                                        }
                                    }
                                }
                            } else {
                                if (content_child !== "") {
                                    if (typeof _texted[_k] !== "undefined"
                                            && typeof _texted[_k][_k] !== "undefined") {
                                        if (_texted[_k][_k].active) {
                                            content_parent = _texted[_k][_k].content; // layer[60..64].texted
                                            xFine = _texted[_k][_k].x;
                                            yFine = _texted[_k][_k].y;
                                        }
                                    }

                                    if (typeof this.texted[k] !== "undefined"
                                            && typeof this.texted[k][_k] !== "undefined"
                                            && this.texted[k][_k].active) {
                                        content_parent = this.texted[k][_k].content; // layer[60..64].texted
                                        xFine = this.texted[k][_k].x;
                                        yFine = this.texted[k][_k].y;
                                    }
                                }
                            }
                            var _content = WPImager.layer[_k].content;
                            WPImager.layer[_k].content = content_parent;
                            WPImager.layer[_k].xFine += xFine;
                            WPImager.layer[_k].yFine += yFine;
                            WPImagerUI.drawText(_k, WPImager.layer[_k]);
                            WPImager.layer[_k].content = _content;
                            WPImager.layer[_k].xFine -= xFine;
                            WPImager.layer[_k].yFine -= yFine;
                        } else if (WPImager.layer[_k].code == UI.LAYER.COM) {

                            var _texted = WPImager.layer[k].texted;

                            if (renderingGrand) {
                                // stop further level component rendering
                            } else {
                                var saveUIcomScale2 = JSON.stringify(UI.comScale);

                                // draw grand child component                                                        
                                var scaleX = 1, scaleY = 1;

                                //WPImager.layer[k].render = 0;
                                if (WPImager.layer[k].render == 0) {
                                    var comslide = WPImager.layer[k].comslide;
                                    var com_canvas_width = WPImager.slides[comslide].canvas_width;
                                    var com_canvas_height = WPImager.slides[comslide].canvas_height;

                                    scaleX = WPImager.layer[k].width / com_canvas_width * parent_scaleX;
                                    scaleY = WPImager.layer[k].height / com_canvas_height * parent_scaleY;
                                }
                                this.renderComChild(ComChildCanvasID, _k, scaleX, scaleY, WPImager.layer[k].render, WPImager.layer[_k].texted, true, k);
                                UI.comScale = JSON.parse(saveUIcomScale2);
                            }
                        }
                    }
                }
            }

            // now draw comcanvas_child to comcanvas_SLIDE_LAYER

            UI.comScale = JSON.parse(saveUIcomScale);


            var _ComCanvas = document.getElementById(ComCanvasID);  // current canvas size     
            var _ComQtx = _ComCanvas.getContext('2d');
            _ComQtx.globalCompositeOperation = "source-over";
            _ComQtx.shadowColor = "transparent";
            var alpha = _alpha;
            alpha = (alpha > 0 && alpha < 100) ? alpha / 100 : 1;
            _ComQtx.globalAlpha = alpha;

            _ComQtx.translate(parseInt(_x + _width / 2), parseInt(_y + _height / 2));
            _ComQtx.rotate(_rotation * Math.PI / 180);
            _ComQtx.translate(parseInt(-_width / 2), parseInt(-_height / 2));

            _ComQtx.save();
            var flipH = WPImager.layer[k].flipH;
            var flipV = WPImager.layer[k].flipV;
            var scaleH = flipH ? -1 : 1, // if flip horizontal -1
                    scaleV = flipV ? -1 : 1; // if flip vertical -1
            _ComQtx.scale(scaleH, scaleV);            // draw component - copy from comcanvas to _comcanvas


            if (child_render == 0) {
                var posX = flipH ? ComCanvasChild.width * -1 : 0, // flip horizontal -width
                        posY = flipV ? ComCanvasChild.height * -1 : 0; // flip vertical -height
                _ComQtx.drawImage(ComCanvasChild, posX, posY, ComCanvasChild.width, ComCanvasChild.height);
            } else {
                // scale
                var posX = flipH ? _width * -1 : 0, // flip horizontal -width
                        posY = flipV ? _height * -1 : 0; // flip vertical -height
                _ComQtx.drawImage(ComCanvasChild, 0, 0, ComCanvasChild.width, ComCanvasChild.height, posX, posY, _width, _height);//, _width, _height, 0, 0, 100, 100);                
            }
            _ComQtx.restore();

            _ComQtx.translate(parseInt(_width / 2), parseInt(_height / 2));
            _ComQtx.rotate(-_rotation * Math.PI / 180);
            _ComQtx.translate(-parseInt(_x + _width / 2), -parseInt(_y + _height / 2));


        },
        refreshEdgeHandlers: function () {
            // borders and Gap is not implemented in components
            var borderGap = 0; // this.borderPlusGap();
            var borderGap2 = borderGap * 2;
            // calculate edge handles position for resize mouse hover hit test 
            UI.populateEdgeHandlers(this.x - borderGap, this.y - borderGap, this.width + borderGap2, this.height + borderGap2);
        },
        borderPlusGap: function () {
            if (this.textborder > 0 && this.textbordercolor.toLowerCase() !== "#0000ffff") {
                return this.textborder;
            }
            return 0;
        },        
        selectToolbar: function () {
            $("#editKitComponent,#spanRadiusText").show();
            $("#browseKitComponent,#spantxtRadius,.txtconsole_litebar,#btnBaseShapeTxt,#spantxtKeepratio").hide();
            if (UI.console == UI.CNSL.TXTROTATE) {
                $("#showTextRotateConsole").click();
            } else {
                $("#showCOMConsole").click();

            }
            if (WPImager.layer[this.index].comslide == 0
                    || typeof WPImager.slides[this.comslide] === "undefined") {
                $("#editKitComponent").hide();
            }
            $("#spanTextAngle").hide();
            $("#txtconsole_litebar_edit").show(); // show modeTextEdit
//            $("#showTextSkewConsole").toggle(WPImager.slides[this.comslide].mode !== "kit");
            $("#showTextSkewConsole").hide();
        },
        controlUpdate: function () {
            // update controls to reflect layer values
            $("#txtWidth").spinner("value", this.width);
            $("#txtHeight").spinner("value", this.height);
            $("#alphaText").spinner("value", this.alpha);
            $("#rotateText").spinner("value", this.rotation);
            $("#borderText").spinner("value", this.textborder);
            $("#borderTextDash").spinner("value", 10);
            $("#borderTextSpace").spinner("value", 10);
            var borderdash = this.textborderdash.split(" ");
            $('#borderTextStyle').val("solid");
            if (borderdash.length == 4) {
                $('#borderTextStyle').val(borderdash[0] == 0 ? "solid" : "dashed");
                $("#borderTextDash").spinner("value", borderdash[1]);
                $("#borderTextSpace").spinner("value", borderdash[2]);
                $("#borderTextDashset").spinner("value", borderdash[3]);
            }
            $('#bordercolorText').colorichpicker({color: this.textbordercolor});
            $("#shadowTextFill").spinner("value", this.textshadowfill);
            $("#shadowOxTextFill").spinner("value", this.textshadowfillOx);
            $("#shadowOyTextFill").spinner("value", this.textshadowfillOy);
            $('#shadowcolorTextFill').colorichpicker({color: this.textshadowfillcolor});
            $("#radiusText").spinner("value", this.textradius);

            $('#shadowTextFillOn').css('display', (this.textshadowfillOn ? "inline-block" : "none"));
            $('#shadowTextFillOff').css('display', (!this.textshadowfillOn ? "inline-block" : "none"));
            if (this.textshadowfillOn) {
                $("#shadowTextFill,#shadowcolorTextFill,#shadowOxTextFill,#shadowOyTextFill").removeClass("disabled");
            } else {
                $("#shadowTextFill,#shadowcolorTextFill,#shadowOxTextFill,#shadowOyTextFill").addClass("disabled");
            }
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
        setLayerTextParm: function (varname, value) {
            this[varname] = value;
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




    $(function () {
        WPImager.addCOMLayer = function (comslide) {
            var k = ++this.canvas.maxIndex;
            this.createLayer("LayerCOM", this.slide, this.canvas.maxIndex, false);
            this.layer[k].order = k;
            this.layer[k].createToolLayer(k, true);
            this.layer[k].comslide = comslide;
            this.current = this.canvas.maxIndex;
            this.canvas.picktool = this.layer[this.current].code;
            this.selectLayer(this.current);

        };

    });

    $("#com-textedit-box").on("click", ".cmd-textedit-overwrite", function () {
        var index = $(this).data("index");
        var layerk = $(this).data("layerk");
        var layer_k = $(this).data("layer-k");
        if (parseInt(index) > 0) {
            $("#com-textedit-layer-" + index.toString() + '-' + layerk.toString() + '-' + layer_k.toString()).toggleClass("overwrite");
        } else {
            $("#com-textedit-layer-" + layerk.toString() + '-' + layer_k.toString()).toggleClass("overwrite");
        }
    });

    $("#cmdExportComShow").click(function () {
        $("#com-textedit-export").slideToggle();
    });

    $("#com-textedit-apply, #com-textedit-ok").click(function () {

        if (WPImager.layer[WPImager.current].code == UI.LAYER.COM) {
            var texted = {};
            $('#com-textedit-box .com-textedit-layer').each(function (e) {
                var _index = parseInt($(this).data("index"));
                var _layerk = parseInt($(this).data("layerk"));
                var _layer_k = parseInt($(this).data("layer-k"));
                var _content = $(this).find('textarea');
                var _active = $(this).hasClass("overwrite");
                var xFine = parseInt($(this).find('.com-textedit-x').val());
                var yFine = parseInt($(this).find('.com-textedit-y').val());
                xFine = !isNaN(xFine) ? xFine : 0;
                yFine = !isNaN(yFine) ? yFine : 0;
//                layer_k = (typeof layer_k === "undefined") ? _layer : layer_k;
                if (_index > 0) {
                    if (typeof texted[_index] === "undefined") {
                        texted[_index] = {};
                    }
                    if (typeof texted[_index][_layerk] === "undefined") {
                        texted[_index][_layerk] = {};
                    }
                    texted[_index][_layerk][_layer_k] = {active: _active, layer: WPImager.current, content: _content.val(), x: xFine, y: yFine};
                } else {
                    if (typeof texted[_layerk] === "undefined") {
                        texted[_layerk] = {};
                    }
                    texted[_layerk][_layer_k] = {active: _active, layer: WPImager.current, content: _content.val(), x: xFine, y: yFine};
                }
            });
            WPImager.layer[WPImager.current].texted = texted;
            WPImager.layer[WPImager.current].renderComCanvas();
            WPImager.layer[WPImager.current].renderComCanvas();
            draw();
            if ($(this).attr("id") == "com-textedit-ok") {
                $("#dialog-com-textedit").modal("hide");
            }
        }

    });

    $('#showCOMConsole').click(function () {
        UI.console = UI.CNSL.COMTOOLBAR;
        UI.isCropping = false;
        WPImager.layerControlUpdate(WPImager.current);
        $(".cvsconsole").hide();
        $("#comconsole").show();
        var render = (WPImager.layer[WPImager.current].render == 0);
        $("#render_mode_redraw").toggleClass("activ", render);
        $("#render_mode_scale").toggleClass("activ", !render);
        $("#flip_com_horizontal").toggleClass("activ", WPImager.layer[WPImager.current].flipH);
        $("#flip_com_vertical").toggleClass("activ", WPImager.layer[WPImager.current].flipV);
        var textdraw = WPImager.layer[WPImager.current];
        $('#keepOriAspectOn').css('display', (textdraw.oaspect ? "inline-block" : "none"));
        $('#keepOriAspectOff').css('display', (!textdraw.oaspect ? "inline-block" : "none"));
        draw();
    });

    $("#flip_com_horizontal").click(function () {
        WPImager.layer[WPImager.current].flipH = !WPImager.layer[WPImager.current].flipH;
        $("#flip_com_horizontal").toggleClass("activ", WPImager.layer[WPImager.current].flipH);
        draw(true);
    });
    $("#flip_com_vertical").click(function () {
        WPImager.layer[WPImager.current].flipV = !WPImager.layer[WPImager.current].flipV;
        $("#flip_com_vertical").toggleClass("activ", WPImager.layer[WPImager.current].flipV);
        draw(true);
    });
    $('#keepOriAspectOn,#keepOriAspectOff').click(function () {
        $('#keepOriAspectOn,#keepOriAspectOff').toggle();
        var textdraw = WPImager.layer[WPImager.current];
        textdraw.oaspect = !textdraw.oaspect;
        if (textdraw.oaspect) {
            if (typeof WPImager.slides[textdraw.comslide] === "undefined") {
                textdraw.oaspect = false;
            } else {
                var com_canvas_width = WPImager.slides[textdraw.comslide].canvas_width;
                var com_canvas_height = WPImager.slides[textdraw.comslide].canvas_height;
                var height = textdraw.width * (com_canvas_height / com_canvas_width);
                if ((textdraw.width / textdraw.height) > (com_canvas_width / com_canvas_height)) {
                    var width = textdraw.height * (com_canvas_width / com_canvas_height);
                    textdraw.x += (textdraw.width - width) / 2;
                    textdraw.width = width;
                } else {
                    var height = textdraw.width * (com_canvas_height / com_canvas_width);
                    textdraw.y += (textdraw.height - height) / 2;
                    textdraw.height = height;
                }
            }
        }
        $('#keepOriAspectOn').css('display', (textdraw.oaspect ? "inline-block" : "none"));
        $('#keepOriAspectOff').css('display', (!textdraw.oaspect ? "inline-block" : "none"));
        draw(true);
    });


    $("#editKitComponent").click(function () {
        var comslide = WPImager.layer[WPImager.current].comslide;
        WPImager.slide = comslide;
        SlideAction.clickSlide(WPImager.slide);
        return false;
    });

    $("#componentSizeReset").click(function () {
        var comslide = WPImager.layer[WPImager.current].comslide;
        WPImager.layer[WPImager.current].width = WPImager.slides[comslide].canvas_width;
        WPImager.layer[WPImager.current].height = WPImager.slides[comslide].canvas_height;
        draw();
        WPImagerUI.flagCanvasSave();
        $("#txtWidth").spinner("value", WPImager.layer[WPImager.current].width);
        $("#txtHeight").spinner("value", WPImager.layer[WPImager.current].height);
        return false;

    });



    $("#showAddedCOM").click(function () {
        $(this).parent().addClass("active");
        $(this).parent().siblings().removeClass("active");
        UI.isCropping = false;
        $(".toolboxLayersCom").hide();
        $("#toolboxAddedCOM").show();
        $("#listAddedCOM,#listInvalidCOM").empty();
        var curComUpstream = WPImager.slides[WPImager.slide].upstreamCom();
//        var curCOMinfo = 'Upstream:' + WPImager.slides[WPImager.slide].upstreamCom().toString();
//        curCOMinfo += ' Downstream:' + WPImager.slides[WPImager.slide].downstreamCom().toString();
//        $("#curCOMinfo").text(curCOMinfo);
        var COMFound = 0;
        // render com slides
        $('#toolComSortable > div.toolslide').each(function (e) {
            var slideIndex = parseInt($(this).data("var-index"));
            if (WPImager.slides[slideIndex].mode !== "kit") {
                // only list components
            } else if (slideIndex == 0 || WPImager.slides[slideIndex].disposed !== 0
                    || WPImager.slide == slideIndex) {
                // exclude self                
            } else if (WPImager.slides[slideIndex].mode == "kit") {
                var ComCanvas = document.getElementById("comcanvas");

                WPImagerUI.setTargetCanvas("comcanvas");
                var order = 0, maxOrder = 0;
                for (var layer in WPImager.layer) {
                    if (WPImager.layer.hasOwnProperty(layer)
                            && parseInt(WPImager.layer[layer].slide) == slideIndex)
                    {
                        order = parseInt(WPImager.layer[layer].order) || 0;
                        maxOrder = Math.max(order, maxOrder);
                    }
                }

                // draw all visible layer on canvas by order
                ComCanvas.width = WPImager.slides[slideIndex].canvas_width;
                ComCanvas.height = WPImager.slides[slideIndex].canvas_height;
                WPImager.canvas.width = ComCanvas.width;
                WPImager.canvas.height = ComCanvas.height;


                for (var order = 1; order <= maxOrder; order++)
                {
                    for (var layer in WPImager.layer) {
                        if (WPImager.layer.hasOwnProperty(layer)) {
                            var k = layer;
                            if (WPImager.layer[layer].disposed === 1 || !WPImager.layer[layer].visible) {
                                // skip draw
                            } else if (WPImager.layer[layer].slide === slideIndex
                                    && WPImager.layer[layer].order === order) {
                                if (WPImager.layer[layer].code == UI.LAYER.TEXT) {
                                    WPImagerUI.drawText(layer, WPImager.layer[layer]);
                                }
                                if (WPImager.layer[k].code == UI.LAYER.TEXT) {
                                    WPImagerUI.setTargetCanvas("comcanvas");
                                    WPImagerUI.drawText(k, WPImager.layer[k]);
                                } else if (WPImager.layer[k].code == UI.LAYER.COM) {
                                    var scaleY = 1, scaleX = 1, render = WPImager.layer[k].render, texted = WPImager.layer[k].texted;
                                    WPImager.layer[k].render = 1; // force render - scale 
                                    WPImager.layer[k].renderComChild("comcanvas", k, scaleX, scaleY, 1, texted, false);
                                    WPImager.layer[k].render = render;
                                }

                            }
                        }
                    }
                }

                var maxTierExceed = false;
                var selfReferencing = false;
                if (curComUpstream >= 2
                        && WPImager.slides[WPImager.slide].mode === "kit") {
                    // max 3 tier component
                    maxTierExceed = true;
                } else {
                    if (curComUpstream == 1 && WPImager.slides[WPImager.slide].mode === "kit") {
                        if (WPImager.slides[slideIndex].downstreamCom() > 0) {
                            maxTierExceed = true;
                        } else if (UI.upstreamCom.indexOf(slideIndex) !== -1) {
                            selfReferencing = true;
                        }
                        // avoid component self-referencing
                    } else if (curComUpstream == 0 && WPImager.slides[WPImager.slide].mode === "kit") {
                        // avoid component self-referencing
                        if (WPImager.slides[slideIndex].downstreamCom() > 1) {
                            maxTierExceed = true;
                        } else if (UI.upstreamCom.indexOf(slideIndex) !== -1) {
                            selfReferencing = true;
                        }
                    }
                }

                if (!selfReferencing) {
                    var targetList = maxTierExceed ? "#listInvalidCOM" : "#listAddedCOM";
                    var imageData = ComCanvas.toDataURL("image/png", 1);
                    // add kit component for selection
                    var $kitdiv = $('<div/>', {
                        style: 'max-width:50%;float:left;padding:0 2px'
                    }).appendTo(targetList);
                    $kitdiv.addClass('pull-left');
                    if (targetList == "#listAddedCOM") {
                        var $a = $('<a/>', {
                            href: "#",
                            'class': 'add_component_slide',
                            'data-kit-slide': slideIndex,
                            'data-kit-layer': layer
                        }).appendTo($kitdiv);
                        $('<img/>', {
                            src: imageData,
                            style: 'max-width:100%;border:2px solid #434343; margin:2px 4px',
                            title: WPImager.slides[slideIndex].slidetitle
                        }).appendTo($a);
                    } else {
                        $('<img/>', {
                            src: imageData,
                            style: 'max-width:100%;border:2px solid #000;opacity:0.6; margin:2px 4px',
                            title: WPImager.slides[slideIndex].slidetitle
                        }).appendTo($kitdiv);
                    }
                }

                WPImagerUI.setTargetCanvas(); // reset canvas
                WPImager.canvas.width = WPImager.slides[WPImager.slide].canvas_width;
                WPImager.canvas.height = WPImager.slides[WPImager.slide].canvas_height;
                COMFound++;
            }
        });
        if (COMFound > 0) {
            $("#toolboxAddedCOM .hasCOMshow").show();
            $("#toolboxAddedCOM .hasCOMhide").hide();
        } else {
            $("#toolboxAddedCOM .hasNoCOMshow").show();
            $("#toolboxAddedCOM .hasNoCOMhide").hide();
        }
        $("#listInvalidComWarn").toggle(WPImager.slides[WPImager.slide].mode === "kit" && $("#listInvalidCOM").contents().length > 0);
        return false;
    });

    $("#toolboxAddedCOM").on("click", '.add_component_slide', function () {
        var comslide = $(this).data("kit-slide");
        WPImager.addCOMLayer(comslide);
        WPImager.layer[WPImager.current].width = WPImager.slides[comslide].canvas_width;
        WPImager.layer[WPImager.current].height = WPImager.slides[comslide].canvas_height;
        WPImager.layer[WPImager.current].renderComCanvas();
        WPImager.layer[WPImager.current].controlUpdate();
        WPImager.layerCenterView(WPImager.current)
        WPImager.slides[comslide].updateComponentUsedIn();
        WPImager.slides[WPImager.slide].highlightUsedInSlides();

        $("#viewLayers").click();
        WPImager.scrollActiveLayer();
        draw();
        WPImagerUI.flagCanvasSave();
    });

    $('[id^="render_mode"]').on('change', function () {
        var mode = parseInt($('input[name="render_mode"]:checked').val());
        if (WPImager.layer[WPImager.current].code == UI.LAYER.COM) {
            WPImager.layer[WPImager.current].render = (mode == 0) ? 0 : 1;
            WPImager.layer[WPImager.current].renderComCanvas();
            draw(true);
            var render = (WPImager.layer[WPImager.current].render == 0);
            $("#render_mode_redraw").toggleClass("activ", render);
            $("#render_mode_scale").toggleClass("activ", !render);
        }
    });


});