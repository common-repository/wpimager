/*!
 WPImager 1.0.0   
 Slide Object
 https://wpimager.com/
 2018 WPImager  
 */

/**
 * Slide Object
 * Contains methods and properties to create, define and handle slides on the canvas
 */

function CanvasSlide(index) {
    this.index = index;
//    this.data = {}; // layer data
    this.setval(0); // set default values  
}


(function ($) {

    CanvasSlide.prototype = {
        setval: function (cloudslides) {
            this.mode = this.getval(cloudslides.mode, "cover");
            this.submode = this.getval(cloudslides.submode, "");
            this.kitno = this.getval(cloudslides.kitno, 0);
            this.codeID = this.getval(cloudslides.codeID, 0);
            this.order = this.getval(cloudslides.order, 1);
//            this.layer = this.getval(cloudslides.layer, {});
            this.slidetitle = this.getval(cloudslides.slidetitle, "");
            this.curlayer = this.getval(cloudslides.curlayer, 0);
            this.canvas_width = this.getval(cloudslides.canvas_width, WPImager.canvas.width);
            this.canvas_height = this.getval(cloudslides.canvas_height, WPImager.canvas.height);
            this.sliderOn = this.getval(cloudslides.sliderOn, 1);
            this.slideUrl = this.getval(cloudslides.slideUrl, "");
            this.slideAlt = this.getval(cloudslides.slideAlt, "");
            this.slideUrlNewTab = this.getval(cloudslides.slideUrlNewTab, 1);
            this.source = this.getval(cloudslides.source, "");
            this.bgpattern = this.getval(cloudslides.bgpattern, 1); // default light - 1
            this.disposed = this.getval(cloudslides.disposed, 0);

            if (cloudslides !== 0) {
                for (var key in cloudslides) {
                    if (cloudslides.hasOwnProperty(key)) {
                        if (typeof this[key] == "undefined") {
                            this[key] = cloudslides[key];
                        }
                    }
                }
            }

        },
        createtoolbox: function (actionIndex) {
            var k = this.index;
            this.temp = actionIndex;

            var notitle = (this.mode == "kit") ? "Component #" : "Slide #";
            var tlnote = (this.slidetitle.length > 0) ? this.slidetitle : notitle + k.toString();
            if (this.slidetitle.length == 0) {
                this.slidetitle = tlnote;
            }
            var titleIcon = (this.mode == "kit") ? 'fa-cube' : 'fa-square-o stretch-slide';
            var html = '<div class="toolslide toolslideItem ' + (this.mode == "kit" ? "toolslideKit " : "") + 'toolslideNum" id="act' + k.toString() + '" data-order="' + actionIndex.toString() + '" data-var-index="' + k.toString() + '"><button class="editSlideTitle"><span class="fa fa-cog"></span></button><button id="btn-action-play-' + k.toString() + '" data-index="' + k.toString() + '" class="btn-action-play"><span class="fa fa-play"></span></button><div class="sorthandle"><span class="fa fa-sort"></span></div><div class="square bg"><div class="tool-slide-number"></div><div class="tool-slide-info"><span id="btn-slide-layout-' + k.toString() + '" class="btn-slide-layout"></span></div><div class="tl"><span style="color:#888" class="ic-toolslide fa ' + titleIcon + '"></span> <div class="tlnote"></div></div></div></div></div>';
            // add to the top or bottom of Layers Toolbox

            $("#act" + k.toString()).remove();
            if (this.mode == "kit") {
                $("#toolComSortable").append(html);
                $("#toolComSortable").scrollTop($("#act" + this.index.toString()).position().top);
            } else {
                if ($("#act0").length == 0)
                    $("#toolSlidesSortable").append(html);
                else
                    $("#act0").before(html);
                $("#toolSlidesSortable").scrollTop($("#act" + this.index.toString()).position().top);
            }
            $("#act" + k.toString() + " .tlnote").text(tlnote);
            if (this.disposed > 0) {
                $("#act" + k.toString()).hide();
            }
            $("#btn-slide-layout-" + k.toString()).text(this.canvas_width.toString() + "x" + this.canvas_height.toString());

            if (this.mode == "kit") {
                this.updateComponentUsedIn();
            }
            var _slidenumber = 1;
            $('#toolSlidesSortable > div.toolslide').each(function (e) {
                if ($(this).hasClass("toolslideNum")) {
                    $(this).find(".tool-slide-number").text(_slidenumber.toString());
                    _slidenumber++;
                }
            });
            _slidenumber = 1;
            $('#toolComSortable > div.toolslide').each(function (e) {
                if ($(this).hasClass("toolslideNum")) {
                    $(this).find(".tool-slide-number").text(_slidenumber.toString());
                    _slidenumber++;
                }
            });

        },
        updateComponentUsedIn: function () {
//            if (this.mode !== "kit") {
//                return;
//            }
            var usedIn = 0;
            var inSlides = [];
            var k = this.index;
            if (this.disposed == 0) {
                var arrIndex = WPImager.canvas.arrIndex;
                for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                    var layer = arrIndex[ix];
                    if (WPImager.layer[layer].disposed == 0
                            && WPImager.layer[layer].code == UI.LAYER.COM
                            && WPImager.layer[layer].comslide == k) {
                        var inslide = WPImager.layer[layer].slide;
                        if (inSlides.indexOf(inslide) == -1) {
                            inSlides.push(inslide);
                            usedIn++;
                        }
                    }
                }
            }
            var usedInLabel = (usedIn > 0) ? 'In ' + usedIn.toString() + ' slides' : 'Not Used';
            usedInLabel = (usedIn == 1) ? 'In ' + usedIn.toString() + ' slide' : usedInLabel;
            var usageCount = $("#act" + this.index.toString()).find('.usage-count');
            if (usageCount.length > 0) {
                usageCount.text(usedInLabel);
            } else {
                $("#btn-slide-layout-" + k.toString()).parent().append(' <div class="label usage-count">' + usedInLabel + '</div>');
            }
        },
        highlightUsedInSlides: function () {
            $("#toolSlidesSortable .toolslide,#toolComSortable .toolslide").removeClass("comInUse useInCom");
            if (this.index == 0 || this.disposed !== 0) {
                return;
            }
            var inSlides = [];
            var k = this.index;
            var arrIndex = WPImager.canvas.arrIndex;

            // hightlight which component used by slide (blue)
            for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                var layer = arrIndex[ix];
                if (WPImager.layer[layer].disposed == 0
                        && WPImager.layer[layer].code == UI.LAYER.COM
                        && WPImager.layer[layer].slide == k
                        && WPImager.layer[layer].comslide > 0) {
                    var inslide = WPImager.layer[layer].comslide;
                    if (inSlides.indexOf(inslide) == -1) {
                        inSlides.push(inslide);
                        if (!$("#act" + inslide.toString()).hasClass("useInCom")) {
                            $("#act" + inslide.toString()).addClass("useInCom");
                        }

                    }
                }
            }
            // hightlight which slides component used in (green)
            for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                var layer = arrIndex[ix];
                if (WPImager.layer[layer].disposed == 0
                        && WPImager.layer[layer].code == UI.LAYER.COM
                        && WPImager.layer[layer].comslide == k) {
                    var inslide = WPImager.layer[layer].slide;
                    if (inSlides.indexOf(inslide) == -1) {
                        inSlides.push(inslide);
                        if (!$("#act" + inslide.toString()).hasClass("comInUse")) {
                            $("#act" + inslide.toString()).addClass("comInUse");
                        }

                    }
                }
            }
        },
        isComponent: function () {
            return (this.mode == "kit");
        },
        comExportCode: function (x, y, w, h) {
            if (this.index > 0 && this.isComponent()) {
                var slide = this.index;
                var _layer_string = JSON.stringify(WPImager.layer);
                var _slides_string = JSON.stringify(WPImager.slides);
                var _layer = JSON.parse(_layer_string);
                var _slides = JSON.parse(_slides_string);

                var childSlides = [];
                if (this.isParentCom()) {
                    childSlides = this.getChildComponents();
                    for (var s = 0; s < childSlides.length; s++) {
                        var _childSlides = this.getChildComponents(childSlides[s]);
                        childSlides = childSlides.concat(_childSlides);
                    }
                }

                for (var k in _layer) {
                    var index = parseInt(k);
                    if (_layer.hasOwnProperty(k) && index >= 0) {
                        if (_layer[index].disposed > 0 || index == 0) {
                            delete _layer[index];
                        } else if (_layer[index].slide == slide) {
                            // keep layers of slide
                        } else if (childSlides.indexOf(_layer[index].slide) !== -1) {
                            // keep layers of child component slides
                        } else {
                            delete _layer[index];
                        }
                    }
                }

                for (var k in _slides) {
                    var index = parseInt(k);
                    if (_slides.hasOwnProperty(k) && index >= 0) {
                        if (_slides[index].disposed > 0 || index == 0) {
                            delete _slides[index];
                        } else if (index == slide) {
                            // keep current slide
                            _slides[index].ox = x;
                            _slides[index].oy = y;
                            _slides[index].ow = w;
                            _slides[index].oh = h;
                        } else if (childSlides.indexOf(index) !== -1) {
                            // keep child component slides
                        } else {
                            delete _slides[index];
                        }
                    }
                }
                var _export = {layers: _layer, slides: _slides};
                var export_code = window.btoa(unescape(encodeURIComponent(JSON.stringify(_export))));
                return export_code;
            }
            return '';
        },
        upstreamCom: function () {
            var upstreamComSlides = [];
            var slideIndex = this.index;
            if (this.mode !== "kit") {
                return false;
            }
            var upstream = 0;
            var arrIndex = WPImager.canvas.arrIndex;
            for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                var layer = arrIndex[ix];
                if (WPImager.layer[layer].disposed == 0
                        && WPImager.layer[layer].comslide == slideIndex  // layers inside slideIndex
                        && WPImager.layer[layer].code == UI.LAYER.COM
                        ) {
                    var slide = WPImager.layer[layer].slide;
                    if (WPImager.slides[slide].mode == "kit") {
                        upstream = Math.max(upstream, 1);
                        if (upstreamComSlides.indexOf(slide) == -1) {
                            upstreamComSlides.push(slide);
                        }

                        for (var _ix = 0, _len = arrIndex.length; _ix < _len; _ix++) {
                            var _layer = arrIndex[_ix];
                            if (WPImager.layer[_layer].disposed == 0
                                    && WPImager.layer[_layer].comslide == slide
                                    && WPImager.layer[_layer].code == UI.LAYER.COM
                                    ) {
                                var _slide = WPImager.layer[_layer].slide;
                                if (typeof WPImager.slides[_slide] !== "undefined" 
                                    && WPImager.slides[_slide].mode == "kit") {
                                    upstream = Math.max(upstream, 2);
                                    if (upstreamComSlides.indexOf(_slide) == -1) {
                                        upstreamComSlides.push(_slide);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            UI.upstreamCom = upstreamComSlides;
            return upstream;
        },
        downstreamCom: function () {
            var downstreamComSlides = [];
            var slideIndex = this.index;
            if (this.mode !== "kit") {
                return false;
            }
            var downstream = 0;
            var arrIndex = WPImager.canvas.arrIndex;
            for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                var layer = arrIndex[ix];
                if (WPImager.layer[layer].disposed == 0
                        && WPImager.layer[layer].slide == slideIndex  // layers inside slideIndex
                        && WPImager.layer[layer].code == UI.LAYER.COM
                        ) {
                    var comslide = WPImager.layer[layer].comslide;
                    
                    if (typeof WPImager.slides[comslide] !== "undefined" 
                            && WPImager.slides[comslide].mode == "kit") {
                        downstream = Math.max(downstream, 1);
                        if (downstreamComSlides.indexOf(comslide) == -1) {
                            downstreamComSlides.push(comslide);
                        }
                        for (var _ix = 0, _len = arrIndex.length; _ix < _len; _ix++) {
                            var _layer = arrIndex[_ix];
                            if (WPImager.layer[_layer].disposed == 0
                                    && WPImager.layer[_layer].slide == comslide
                                    && WPImager.layer[_layer].code == UI.LAYER.COM
                                    ) {
                                var _comslide = WPImager.layer[layer].comslide;
                                if (WPImager.slides[_comslide].mode == "kit") {
                                    downstream = Math.max(downstream, 2);
                                    if (downstreamComSlides.indexOf(_comslide) == -1) {
                                        downstreamComSlides.push(_comslide);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            UI.downstreamCom = downstreamComSlides;
            return downstream;
        },
        isChildCom: function () {
            var slideIndex = this.index;
            if (this.mode !== "kit") {
                return false;
            }
            var isChild = false;
            var arrIndex = WPImager.canvas.arrIndex;
            for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                var layer = arrIndex[ix];
                if (WPImager.layer[layer].disposed == 0
                        && WPImager.layer[layer].slide !== slideIndex  // layers outside slideIndex
                        && WPImager.layer[layer].code == UI.LAYER.COM
                        && WPImager.layer[layer].comslide == slideIndex // layer of a component includes slideIndex slide
                        ) {
                    if (typeof WPImager.slides[WPImager.layer[layer].slide] !== "undefined" && WPImager.slides[WPImager.layer[layer].slide].mode == "kit") {
                        isChild = true; // component inside another component
                    }
                }
            }
            return isChild;
        },
        isGrandChildCom: function () {
            var slideIndex = this.index;
            if (this.mode !== "kit") {
                return false;
            }
            var isGrandChild = false;
            var arrIndex = WPImager.canvas.arrIndex;
            for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                var layer = arrIndex[ix];
                if (WPImager.layer[layer].disposed == 0
                        && WPImager.layer[layer].slide !== slideIndex  // layers outside slideIndex
                        && WPImager.layer[layer].code == UI.LAYER.COM
                        && WPImager.layer[layer].comslide == slideIndex // layer of a component includes slideIndex slide
                        ) {
                    if (typeof WPImager.slides[WPImager.layer[layer].slide] !== "undefined" && WPImager.slides[WPImager.layer[layer].slide].mode == "kit") {
                        if (WPImager.slides[WPImager.layer[layer].slide].isChildCom()) {
                            isGrandChild = true; // component inside another component
                        }
                    }
                }
            }
            return isGrandChild;
        },
        isGrandParentCom: function () {
            var slideIndex = this.index;
            if (WPImager.slides[slideIndex].mode !== "kit") {
                return false;
            }
            var isParent = false;
            var arrIndex = WPImager.canvas.arrIndex;
            for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                var layer = arrIndex[ix];
                if (WPImager.layer[layer].disposed == 0
                        && WPImager.layer[layer].slide == slideIndex // layers inside slideIndex
                        && WPImager.layer[layer].code == UI.LAYER.COM
                        && WPImager.layer[layer].comslide !== slideIndex // should not be self referencing
                        ) {
                    var comslide = WPImager.layer[layer].comslide;
                    if (comslide > 0 && WPImager.slides[comslide].isParentCom()) {
                        isParent = true;
                    }
                }
            }
            return isParent;
        },
        isParentCom: function () {
            var slideIndex = this.index;
            if (WPImager.slides[slideIndex].mode !== "kit") {
                return false;
            }
            var isParent = false;
            var arrIndex = WPImager.canvas.arrIndex;
            for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                var layer = arrIndex[ix];
                if (WPImager.layer[layer].disposed == 0
                        && WPImager.layer[layer].slide == slideIndex // layers inside slideIndex
                        && WPImager.layer[layer].code == UI.LAYER.COM
                        && WPImager.layer[layer].comslide !== slideIndex // should not be self referencing
                        ) {
                    isParent = true;
                }
            }
            return isParent;
        },
        getChildComponents: function (_slideIndex) {
            var slideIndex = (typeof _slideIndex === "undefined") ? this.index : _slideIndex;
            var childSlides = [];
            if (WPImager.slides[slideIndex].mode !== "kit") {
                return childSlides;
            }
            var arrIndex = WPImager.canvas.arrIndex;
            for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                var layer = arrIndex[ix];
                if (WPImager.layer[layer].disposed == 0
                        && WPImager.layer[layer].slide == slideIndex // layers inside slideIndex
                        && WPImager.layer[layer].code == UI.LAYER.COM
                        && WPImager.layer[layer].comslide !== slideIndex // should not be self referencing
                        ) {
                    if (childSlides.indexOf(WPImager.layer[layer].comslide) == -1
                            && typeof WPImager.slides[WPImager.layer[layer].comslide] !== "undefined") {
                        childSlides.push(WPImager.layer[layer].comslide);
                    }
                }
            }
            return childSlides;
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


    SlideAction = {
        startupSlide: function (index, firstSlide) {
            index = parseInt(index);
            if (index == 0 || typeof WPImager.slides[index] === "undefined") {
                index = parseInt(firstSlide);
            }
            WPImager.slide = parseInt(index);
            this.loadSlide(index);
            WPImager.rebuildToolLayers();
            WPImager.recalculateLayersOrder();
            WPImager.selectLayerTop(WPImager.slides[WPImager.slide].curlayer);
//            WPImager.selectLayerTop();
            WPImager.refreshIconVisible();
            WPImager.refreshIconLock();
            $(".toolslide").removeClass("active");
            $("#act" + index.toString()).addClass("active selected");
            $("#viewLayers").click();
            WPImager.slides[index].highlightUsedInSlides();

        },
        clickSlide: function (slideIndex) {
            if (typeof WPImager.slide !== "undefined") {
                WPImager.slides[WPImager.slide].curlayer = WPImager.current;
            }
            WPImager.slide = slideIndex;
            SlideAction.loadSlide(slideIndex);
            $(".toolslide").removeClass("active");
            $("#act" + slideIndex.toString()).addClass("active selected");
            if (!UI.isPrinting) {
                // Slide selected - WPImager.slide may have changed.
                WPImager.rebuildToolLayers();
                WPImager.recalculateLayersOrder();
                WPImager.selectLayerTop(WPImager.slides[WPImager.slide].curlayer);
                WPImager.refreshIconVisible();
                WPImager.refreshIconLock();
                $("#toolboxLayerSortable").scrollTop(0);
                $("#viewLayers").click();
                WPImager.slides[slideIndex].highlightUsedInSlides();
            }

        },
        loadSlide: function (slideIndex) {
            if (typeof WPImager.slides[slideIndex] === "undefined")
                return;

            if (WPImager.slides[slideIndex].canvas_width > 0) {
                WPImager.canvas.width = WPImager.slides[slideIndex].canvas_width;
                WPImager.canvas.height = WPImager.slides[slideIndex].canvas_height;
                // WPImagerUI.zoomCanvas($("#cvszoom").spinner("value"));
                $("#currentSizeLayout").text(WPImager.canvas.width.toString() + 'x' + WPImager.canvas.height.toString());
                var linkText = "Component#" + WPImager.slides[slideIndex].codeID.toString();
                $("#checkout_component").text(linkText);
                $("#checkout_component").data("code-id", WPImager.slides[slideIndex].codeID);
                $("#checkout_component").toggle(WPImager.slides[slideIndex].codeID > 0);
                if (WPImager.slides[slideIndex].codeID > 0) {
                    $("#checkout_component").attr("target", "component" + WPImager.slides[slideIndex].codeID.toString())
                            .attr("href", '/component/' + WPImager.slides[slideIndex].codeID.toString() + '/');
                }
            }
            UI.comSlideRenderCanvas = true;
            WPImagerUI.draw();
            UI.comSlideRenderCanvas = false;
            var titleIcon = (WPImager.slides[slideIndex].mode == "kit") ? '<span class="fa fa-cube"></span> ' : '';
            titleIcon = (slideIndex == 0) ? '' : titleIcon;
            var title = (slideIndex == 0) ? "Background Slide" : WPImager.slides[slideIndex].slidetitle;
            $("#toolboxTitle").text(title);
            $("#toolboxTitle").prepend(titleIcon);
            $("#canvasWidth").val(WPImager.canvas.width);
            $("#canvasHeight").val(WPImager.canvas.height);
            var isComSlide = (WPImager.slides[slideIndex].isComponent());
            $("#addImageMediaLayer,#addQRCode").parent().toggle(!isComSlide);
            $('#cvs').trigger('slide_loaded', slideIndex);

            $("#undo,#redo").removeClass("disabled btn-grayed").addClass("btn-default");
            if (!UndoRedo.hasUndo())
                $("#undo").addClass("disabled");
            if (!UndoRedo.hasRedo())
                $("#redo").addClass("disabled");
            // count layers in slide 
            var layersOfSlide = 0;
            var arrIndex = WPImager.canvas.arrIndex;
            for (var i = 0, len = arrIndex.length; i < len; i++) {
                var layer = arrIndex[i];
                if (layer.slide == slideIndex) {
                    layersOfSlide++;
                }
            }
            if (layersOfSlide > 0) {
                UndoRedo.prepareCurSlide();
            }
            $("#cmdDupSlide,#cmdPopupRestoreSlides,#cmdTrashSlide").toggleClass("disabled", (WPImager.slides[slideIndex].mode == "kit"));
            $("#cmdDupComponent,#cmdPopupRestoreComponents,#cmdTrashComponent").toggleClass("disabled", (WPImager.slides[slideIndex].mode !== "kit"));

        },
        recCanvasSize: function () {
            WPImager.slides[WPImager.slide].canvas_width = WPImager.canvas.width;
            WPImager.slides[WPImager.slide].canvas_height = WPImager.canvas.height;
            $("#btn-slide-layout-" + WPImager.slide.toString()).text(WPImager.canvas.width.toString() + "x" + WPImager.canvas.height.toString());
        },
        getSlideMaxOrder: function () {
            var order = 0, maxOrder = 0;
            var arrIndex = WPImager.canvas.arrIndex;
            for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                var layer = arrIndex[ix];
                if (WPImager.layer[layer].disposed == 0) {
                    order = parseInt(WPImager.layer[layer].order) || 0;
                    maxOrder = Math.max(order, maxOrder);
                }
            }

            return maxOrder;
        },
        rebuildtoolboxLayers: function () {
            // mark existing layers as old
            $(".toolboxLayer").remove();
//        $(".toolboxLayer").addClass("toolboxLayerOld");
            // prepare toolBox 
            var layerIndex = WPImager.layerCount();
            var maxOrder = WPImager.maxOrder();
            for (var order = maxOrder; order > 0; order--)
            {
                var arrIndex = WPImager.canvas.arrIndex;
                for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                    var k = arrIndex[ix];
                    if (k > 0) {
                        if (WPImager.layer[k].order === order) {
                            WPImager.layer[k].createtoolboxLayer(layerIndex, WPImager.layer[k].uid, false);
                            layerIndex--;
                        }
                    }
                }
            }
//        this.refreshCheckbox();
//        $(".toolboxLayer.toolboxLayerOld").remove();
        },
        selectLayer: function (index) {
            if (index == 0)
                return;
            UI.input.cursor = false;
            if (UI.cursorInterval) {
                // clear cursor interval
                clearInterval(UI.cursorInterval);
            }

            WPImager.setcurrent(index);
            WPImager.layer[index].selectLayer();
//        WPImager.scrollActiveLayer();
            UI.isCropping = false;
//        $("#cropimageconsole,#rotateimageconsole,#rotatetextconsole,#borderimageconsole,#canvascolorpickerconsole").hide();

            WPImagerUI.draw();
        },
        htmlEncode: function (value) {
            //create a in-memory div, set it's inner text(which jQuery automatically encodes)
            //then grab the encoded contents back out.  The div never exists on the page.
            return $('<div/>').text(value).html();
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

    var clipboard = new Clipboard('.btn-clipboard');
    clipboard.on('success', function (e) {
        $(".code-copy-msg").show();
        setTimeout(function () {
            $(".code-copy-msg").fadeOut();
        }, 4000);
    });

    $("#viewActions,#viewActions2").click(function (e) {
        $(".toolboxLayersCom").hide();
        $(this).parent().addClass("active");
        $(this).parent().siblings().removeClass("active");
        $("#toolboxLayersMenu,#toolboxLayerSortableWrap,#toolboxLayersActionBtn").hide();
        $("#toolSlidesMainMenu,#toolSlidesSortableWrap,#toolboxMainButtons,#canvasmenu").show();
        return false;
    });
    $("#viewActions2").click(function (e) {
        $("#cvsdownload-box,#spanFontsize3,#recmaster_disabled").hide();
        $("#undoredo-box, #btnBaseShapeImg, #btnBaseShapeTxt").show();
        WPImager.selectLayer(WPImager.current);
        return false;
    });
    var cancelRequired = false;
    $("#toolSlidesSortable,#toolComSortable").sortable({
        placeholder: "ui-sortable-placeholder",
        handle: ".sorthandle,.tool-slide-number",
        cancel: "#act0",
        axis: 'y',
        start: function (e, ui) {
            ui.placeholder.height(ui.item.height());
        },
        update: function (event, ui) {
            var order = 1, _slidenumber = 1;
            $('#' + $(this).attr("id") + ' > div.toolslide').each(function (e) {
                var id = parseInt($(this).data("var-index"));
                WPImager.slides[id].order = order++;
                if ($(this).hasClass("toolslideNum")) {
                    $(this).find(".tool-slide-number").text(_slidenumber.toString());
                    _slidenumber++;
                }
            });
        },
        beforeStop: function (event, ui) {
//            cancelRequired = (ui.placeholder.index() >= $('#' + $(this).attr("id") + ' > div.toolslide').not('.ui-sortable-placeholder').length);
        },
        stop: function () {
//            if (cancelRequired) {
//                $(this).sortable('cancel');
//            }
        }
    }).on("click", '.toolslide .square,.btn-action-play', function () {
        // if (WPImager.slide != index) 
        if ($(this).parent().attr("data-var-index"))
        {
            var isTemplate = (WPImager.layer[WPImager.current].slide == 0);
            var current = WPImager.current;
            var index = parseInt($(this).parent().data("var-index"));
            SlideAction.clickSlide(index);
            if (isTemplate && WPImager.slides[WPImager.slide].mode !== "kit") {
                WPImager.selectLayer(current);
            }
            WPImagerUI.dockToolLayers();
        }
    }).on("click", ".editSlideTitle", function (e) {
        var id = parseInt($(this).parent().data("var-index"));
        if (id == 0) {
            // no slide zero
        } else {
            $("#editActionNote").appendTo("#act" + id.toString());
            $("#txtEditActionNote").val(WPImager.slides[id].slidetitle);
            $("#editActionNote").show();
            $("#txtEditActionNote").focus();
            $("#editActionNote").data("type", "action");
            $("#editActionNote").data("id", id.toString());
        }
        e.stopPropagation();
    });


    $("#toolboxLayersSortable").on("click", ".btn-layer-visible", function (e) {
        var id = parseInt($(this).parent().data("var-index"));
        WPImager.toggleLayerVisible(id);
        WPImagerUI.flagCanvasSave();
        WPImager.refreshIconVisible();
        WPImagerUI.draw();
    }).on("click", '.toolboxLayer .square', function () {
        // save canvas in case objects move via key arrows
        WPImagerUI.flagCanvasSave();
        // select or multi select layers on click
        var id = parseInt($(this).parent().data("var-index"));
        if (WPImager.layer[id].disposed == 0) { // avoid removed layers                
            if (UI.ctrl_pressed) {
                WPImager.addMultiLayerSelect(id);
                WPImagerUI.draw();
            } else {
                SlideAction.selectLayer(parseInt(id));
//                    WPImager.clearMultiLayers();
                WPImagerUI.draw();
            }
        }
    });
    $("#viewActionLayers").click(function (e) {
        $(".toolboxLayersCom").hide();
        $(this).parent().addClass("active");
        $(this).parent().siblings().removeClass("active");
        $("#toolboxLayersSortableWrap").show();
        return false;
    });
    $("#cmdTrashSlide,#cmdTrashComponent").click(function (e) {
        if (WPImager.slide > 0) {
            WPImager.slides[WPImager.slide].disposed = 1;
            var prevSlide = $("#act" + WPImager.slide.toString()).prev();
            var nextSlide = $("#act" + WPImager.slide.toString()).next();

            $("#act" + WPImager.slide.toString()).appendTo($("#restore-slides-box"));
            var slideIndex = 0;
            if (nextSlide.length > 0) {
                slideIndex = nextSlide.data("var-index");
            }

            if (parseInt(slideIndex) == 0 && prevSlide.length > 0) {
                slideIndex = prevSlide.data("var-index");
            }

            SlideAction.clickSlide(slideIndex);
            WPImagerUI.dockToolLayers();
            var _slidenumber = 1;
            $('#toolSlidesSortable > div.toolslide').each(function (e) {
                if ($(this).hasClass("toolslideNum")) {
                    $(this).find(".tool-slide-number").text(_slidenumber.toString());
                    _slidenumber++;
                }
            });

        }
        e.preventDefault();
    });

    $("#io-slides-select").on("click", ".io-select-toggle", function () {
        var slideIndex = $(this).parent().data("slide-index");
        $("#io-slides-select li").removeClass("active");
        $(this).parent().addClass("active");
        SlideAction.clickSlide(slideIndex);
        WPImager.selectLayerTop();
        WPImagerUI.dockToolLayers();
        $("#io-insert-com").removeClass("disabled");
        return false;
    });


    $("#cmdPopupSlideIO").click(function (e) {
        $("#cvsCodeImport_InsertSlide").hide();
        $("#cvsCodeImport,#cvsCodeExport,#cvsCodeImportFooter").show();

        $("#io-slides-select").empty();
        $("#exportSlideCode").val("");
        $("#io-insert-com").addClass("disabled");
        var slideNo = 1;
        $('#toolSlidesSortable > div.toolslide').each(function (e) {
            var slideIndex = parseInt($(this).data("var-index"));
            if (slideIndex > 0)
            {
                if (WPImager.slides[slideIndex].mode !== "kit") {
                    var cls = (slideIndex == WPImager.slide) ? "active" : "";
                    $("#io-slides-select").append('<li class="' + cls + '" data-slide-index="' + slideIndex.toString() + '"><a href="#" class="io-select-toggle">' + slideNo.toString() + '</a></li>');
                    slideNo++;
                    if (slideIndex == WPImager.slide) {
                        $("#io-insert-com").removeClass("disabled");
                    }
                }
            }
        });

        var isComSlide = (WPImager.slides[WPImager.slide].isComponent());
        $("#code-paste-error").hide();
        $("#cvsCodeExport").toggle(isComSlide);
        if (isComSlide) {
            var comslide = WPImager.slide;
            var export_code = WPImager.slides[comslide].comExportCode(0, 0, WPImager.slides[comslide].canvas_width, WPImager.slides[comslide].canvas_height);
            $("#exportSlideCode").val(export_code);
        }
        $('#dialog-IO-slides').modal('show');
        $("#dialog-IO-slides .modal-dialog").draggable();
    });

    $('#dialog-IO-slides').on('shown.bs.modal', function (e) {
        $("#importSlideCode").focus();

    });

    $("#cmdImportCode").click(function (e) {
        try {
            var _import = $("#importSlideCode").val();
            var import_code = JSON.parse(decodeURIComponent(escape(window.atob(_import))));
            if (typeof import_code.code !== "undefined" && import_code.code == UI.LAYER.TEXT) {
                var title = import_code.layernote;
                var k = ++WPImager.canvas.maxIndex;
                WPImager.createLayer("LayerText", WPImager.slide, k, false);
                WPImager.layer[k].setval(import_code);
                WPImager.layer[k].slide = WPImager.slide;
                WPImager.layer[k].layernote = import_code.layernote;
                WPImager.layer[k].order = k;
                WPImager.layer[k].createToolLayer(k, true);
                WPImager.current = k;
                WPImager.canvas.picktool = WPImager.layer[k].code;
                if ($("#chkCenterOnImport").prop("checked")) {
                    WPImager.layerAlignHorizontal("center", WPImager.current);
                    WPImager.layerAlignVertical("middle", WPImager.current);
                } else {
                    WPImager.layerCenterView(WPImager.current)
                }
                SlideAction.clickSlide(WPImager.slide);
                WPImager.selectLayerTop();
                WPImagerUI.flagCanvasSave();
                draw();
                $('#dialog-IO-slides').modal('hide');
                $("#importSlideCode").val("");
            } else if (typeof import_code.layers !== "undefined" && typeof import_code.slides !== "undefined") {
                var current_slide = WPImager.slide;
                var isComSlide = (WPImager.slides[current_slide].isComponent());
                var addParentComSlide = 0, addChildComSlide = 0;
                var maxOrder = 0;
                for (var layer in import_code.layers) {
                    if (import_code.layers.hasOwnProperty(layer))
                    {
                        order = parseInt(import_code.layers[layer].order) || 0;
                        maxOrder = Math.max(order, maxOrder);
                    }
                }
                var addedSlideIndex = {};
                var addedLayerIndex = {};
                var startMaxIndex = WPImager.canvas.maxIndex;
                var primarySlide = 0, ps_x = 0, ps_y = 0, ps_w = 0, ps_h = 0, s_w = 0, s_h = 0;
                for (var slide in import_code.slides) {
                    var prevSlideIndex = import_code.slides[slide].index;
                    var title = import_code.slides[slide].slidetitle,
                            w = import_code.slides[slide].canvas_width,
                            h = import_code.slides[slide].canvas_height;
                    ps_x = UI.getval(import_code.slides[slide].ox, 0);
                    ps_y = UI.getval(import_code.slides[slide].oy, 0);
                    ps_w = UI.getval(import_code.slides[slide].ow, 0);
                    ps_h = UI.getval(import_code.slides[slide].oh, 0);
                    s_w = w;
                    s_h = h; // original width and height
                    var isPrimarySlide = (ps_w > 0 && ps_h > 0);
                    WPImager.Addslide(w, h, title, 'kit');
                    var comslide = WPImager.slide;
                    primarySlide = (isPrimarySlide) ? comslide : 0;
                    addedSlideIndex[prevSlideIndex] = WPImager.slide;
                    // add kit layers to kit slide
                    var order = 0;

                    for (var order = 1; order <= maxOrder; order++)
                    {
                        for (var layer in import_code.layers) {
                            if (import_code.layers.hasOwnProperty(layer))
                                var k = layer;
                            if (import_code.layers[layer].disposed === 1) {
                                // skip draw
                            } else if (import_code.layers[layer].slide == prevSlideIndex
                                    && import_code.layers[layer].order === order) {
                                if (import_code.layers[layer].code == UI.LAYER.TEXT) {
                                    // import layers belonging to slides
                                    var index = ++WPImager.canvas.maxIndex;
                                    WPImager.createLayer("LayerText", comslide, index, false);
                                    WPImager.layer[index].setval(import_code.layers[layer]);
                                    WPImager.layer[index].slide = comslide;
                                    WPImager.layer[index].order = import_code.layers[layer].order;
                                    addChildComSlide = (addChildComSlide == 0) ? comslide : addChildComSlide;
                                    addedLayerIndex[layer] = index;
                                } else if (import_code.layers[layer].code == UI.LAYER.COM) {
                                    // import components layers belonging to slides
                                    var index = ++WPImager.canvas.maxIndex;
                                    WPImager.createLayer("LayerCOM", comslide, index, false);
                                    WPImager.layer[index].setval(import_code.layers[layer]);
                                    WPImager.layer[index].slide = comslide;
                                    WPImager.layer[index].comslide = -import_code.layers[layer].comslide; // temp negative value
                                    WPImager.layer[index].order = import_code.layers[layer].order;
                                    addParentComSlide = (addParentComSlide == 0) ? comslide : addParentComSlide;
                                    addedLayerIndex[layer] = index;
                                }

                            }
                        }
                    }
                }

                var arrIndex = WPImager.canvas.arrIndex;
                for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                    var i = arrIndex[ix];
                    if (i >= startMaxIndex && WPImager.layer[i].code == UI.LAYER.COM
                            && WPImager.layer[i].comslide < 0) {
                        WPImager.layer[i].comslide = addedSlideIndex[WPImager.layer[i].comslide.toString().replace('-', '')];
                        var texted = {};
                        for (var lyr in WPImager.layer[i].texted) {
                            if (!isNaN(parseInt(lyr))) {
                                for (var _lyr in WPImager.layer[i].texted[lyr]) {
                                    if (!isNaN(parseInt(_lyr))) {
                                        if (typeof WPImager.layer[i].texted[lyr][_lyr].active === "undefined") {
                                            for (var __lyr in WPImager.layer[i].texted[lyr][_lyr]) {
                                                if (!isNaN(parseInt(_lyr))) {
                                                    if (typeof WPImager.layer[i].texted[lyr][_lyr][__lyr].active !== "undefined"
                                                            && typeof addedLayerIndex[lyr] !== "undefined"
                                                            && typeof addedLayerIndex[_lyr] !== "undefined"
                                                            && typeof addedLayerIndex[__lyr] !== "undefined"
                                                            ) {
                                                        var alyr = addedLayerIndex[lyr];
                                                        var _alyr = addedLayerIndex[_lyr];
                                                        var __alyr = addedLayerIndex[__lyr];
                                                        texted[alyr] = {};
                                                        texted[alyr][_alyr] = {};
                                                        texted[alyr][_alyr][__alyr] = {};
                                                        texted[alyr][_alyr][__alyr].active = UI.getval(WPImager.layer[i].texted[lyr][_lyr][__lyr].active, false);
                                                        texted[alyr][_alyr][__alyr].content = UI.getval(WPImager.layer[i].texted[lyr][_lyr][__lyr].content, "");
                                                        texted[alyr][_alyr][__alyr].x = UI.getval(WPImager.layer[i].texted[lyr][_lyr][__lyr].x, 0);
                                                        texted[alyr][_alyr][__alyr].y = UI.getval(WPImager.layer[i].texted[lyr][_lyr][__lyr].y, 0);
                                                    }
                                                }

                                            }

                                        } else if (typeof WPImager.layer[i].texted[lyr][_lyr].active !== "undefined"
                                                && typeof addedLayerIndex[lyr] !== "undefined"
                                                && typeof addedLayerIndex[_lyr] !== "undefined") {
                                            var alyr = addedLayerIndex[lyr];
                                            var _alyr = addedLayerIndex[_lyr];
                                            texted[alyr] = {};
                                            texted[alyr][_alyr] = {};
                                            texted[alyr][_alyr].active = UI.getval(WPImager.layer[i].texted[lyr][_lyr].active, false);
                                            texted[alyr][_alyr].content = UI.getval(WPImager.layer[i].texted[lyr][_lyr].content, "");
                                            texted[alyr][_alyr].x = UI.getval(WPImager.layer[i].texted[lyr][_lyr].x, 0);
                                            texted[alyr][_alyr].y = UI.getval(WPImager.layer[i].texted[lyr][_lyr].y, 0);
                                        }
                                    }

                                }
                            }
                        }
                        if (typeof WPImager.layer[i] !== "undefined" && WPImager.layer[i].code == UI.LAYER.COM) {
                            WPImager.layer[i].texted = texted;
                        }
                    }
                }
                if (primarySlide == 0) {
                    var downstream = -1;
                    for (var index in addedSlideIndex) {
                        if (WPImager.slides[addedSlideIndex[index]].mode == "kit") {
                            if (WPImager.slides[addedSlideIndex[index]].downstreamCom() > downstream) {
                                primarySlide = addedSlideIndex[index];
                                downstream = WPImager.slides[addedSlideIndex[index]].downstreamCom();
                            }
                        }
                    }
                }

                if (primarySlide > 0) {
                    SlideAction.clickSlide(primarySlide);
                    WPImager.selectLayerTop();
                }

                $("#io-insert-dimension").empty();
                // show insert to canvas section
                if (primarySlide > 0) {
                    // click on primarySlide
                    SlideAction.clickSlide(primarySlide);

                    $("#io-insert-com").data("comslide", comslide);
                    $("#io-insert-com").data("comslide-px", ps_x);
                    $("#io-insert-com").data("comslide-py", ps_y);
                    $("#io-insert-com").data("comslide-pw", ps_w);
                    $("#io-insert-com").data("comslide-ph", ps_h);
                    $("#io-insert-dimension").text(s_w.toString() + "x" + s_h.toString());
                    if (ps_w !== s_w || ps_h !== s_h) {
                        $("#io-insert-dimension").append('px &bull; ' + ps_w.toString() + "x" + ps_h.toString() + 'px');
                    }
                } else {
                    var canvas_width, canvas_height;
                    if (addParentComSlide > 0) {
                        SlideAction.clickSlide(addParentComSlide);
                        $("#io-insert-com").data("comslide", addParentComSlide);
                        canvas_width = WPImager.slides[addParentComSlide].canvas_width;
                        canvas_height = WPImager.slides[addParentComSlide].canvas_height;
                    } else if (addChildComSlide > 0) {
                        SlideAction.clickSlide(addChildComSlide);
                        $("#io-insert-com").data("comslide", addChildComSlide);
                        canvas_width = WPImager.slides[addChildComSlide].canvas_width;
                        canvas_height = WPImager.slides[addChildComSlide].canvas_height;
                    } else {
                        SlideAction.clickSlide(WPImager.slide);
                        $("#io-insert-com").data("comslide", WPImager.slide);
                        canvas_width = WPImager.slides[WPImager.slide].canvas_width;
                        canvas_height = WPImager.slides[WPImager.slide].canvas_height;
                    }
                    $("#io-insert-com").data("comslide-pw", canvas_width);
                    $("#io-insert-com").data("comslide-ph", canvas_height);
                }


                for (var index in addedSlideIndex) {
                    if (WPImager.slides[addedSlideIndex[index]].mode == "kit") {
                        WPImager.slides[addedSlideIndex[index]].updateComponentUsedIn();
                    }
                }


                WPImagerUI.flagCanvasSave();
                draw();
                $("#importSlideCode").val("");
                if (addChildComSlide > 0 || addParentComSlide > 0) {
                    UI.isPrinting = true;
                    draw();
                    var canvas = document.getElementById('cvs');
                    var canvasData = canvas.toDataURL("image/png", 1);
                    UI.isPrinting = false;
                    draw();
                    $("#io-insert-preview").attr("src", canvasData);
                    $("#cvsCodeImport,#cvsCodeExport,#cvsCodeImportFooter").hide();
                    $("#cvsCodeImport_InsertSlide").show();
                }

                // select active non component slide before import
                if ($("#io-slides-select li.active").length > 0) {
                    var slideIndex = $("#io-slides-select li.active").first().data("slide-index");
                    SlideAction.clickSlide(slideIndex);
                }
                WPImagerUI.dockToolLayers();
            }
        } catch (err) {
            $("#code-paste-error").show();
        }
    });

    $("#io-insert-com").click(function () {
        var comslide = $(this).data("comslide");
        if (parseInt(comslide) > 0) {
            WPImager.addCOMLayer(comslide);
            WPImager.layer[WPImager.current].width = WPImager.slides[comslide].canvas_width;
            WPImager.layer[WPImager.current].height = WPImager.slides[comslide].canvas_height;
            var ps_w = parseInt($(this).data("comslide-pw"));
            var ps_h = parseInt($(this).data("comslide-ph"));
            WPImager.layer[WPImager.current].width = ps_w;
            WPImager.layer[WPImager.current].height = ps_h;
            WPImager.layer[WPImager.current].renderComCanvas();
            WPImager.layer[WPImager.current].controlUpdate();
        }
        $("#viewLayers").click();
        WPImager.scrollActiveLayer();
        if ($("#chkCenterOnImport").prop("checked")) {
            WPImager.layerAlignHorizontal("center", WPImager.current);
            WPImager.layerAlignVertical("middle", WPImager.current);
        } else {
            WPImager.layerCenterView(WPImager.current)
        }
        WPImager.slides[WPImager.slide].highlightUsedInSlides();
        $("#io-insert-later").click();
        draw();
    });

    $("#io-insert-later").click(function () {
        if ($("#chkImportCodeClose").prop("checked")) {
            $('#dialog-IO-slides').modal('hide');
        } else {
            $("#cmdPopupSlideIO").click();
        }
    });

    $("#cmdPopupRestoreSlides").click(function (e) {
        var itemCount = 0;
        $('#restore-slides-box > div.toolslide').each(function (e) {
            if (!$(this).hasClass("toolslideKit")) {
                itemCount++;
                $(this).show();
            } else {
                $(this).hide();
            }
        });
        $("#restore-slides-none").toggle(itemCount == 0);
        $("#restore-slides-prompt").toggle(itemCount > 0);
        $('#dialog-restore-slides').modal('show');
    });
    $("#cmdPopupRestoreComponents").click(function (e) {
        var itemCount = 0;
        $('#restore-slides-box > div.toolslide').each(function (e) {
            if ($(this).hasClass("toolslideKit")) {
                itemCount++;
                $(this).show();
            } else {
                $(this).hide();
            }
        });

        $("#restore-slides-none").toggle(itemCount == 0);
        $("#restore-slides-prompt").toggle(itemCount > 0);
        $('#dialog-restore-slides').modal('show');
    });
    $('#dialog-restore-slides').on("click", '.toolslide .square', function () {
        if ($(this).parent().attr("data-var-index"))
        {
            var index = parseInt($(this).parent().data("var-index"));
            if (typeof WPImager.slides[index] !== "undefined") {
                WPImager.slides[index].disposed = 0;
                var order = $('#toolSlidesSortable > div.toolslide').length;
                var restored = false;

                if (WPImager.slides[index].mode !== "kit") {
                    $($('#toolSlidesSortable > div.toolslide').get().reverse()).each(function (e) {
                        if (WPImager.slides[index].order > order) {
                            if ($(this).attr("id") == "act0") {
                                restored = true;
                                $("#act0").before($("#act" + index.toString()));
                                return false;
                            } else {
                                restored = true;
                                $(this).after($("#act" + index.toString()));
                                return false;
                            }
                        }
                        order--;
                    });
                    if (!restored) {
                        $("#act0").before($("#act" + index.toString()));
                    }
                } else {
                    var order = $('#toolComSortable > div.toolslide').length;
                    $($('#toolComSortable > div.toolslide').get().reverse()).each(function (e) {
                        if (WPImager.slides[index].order > order) {
                            restored = true;
                            $(this).after($("#act" + index.toString()));
                            return false;
                        }
                        order--;
                    });

                    if (!restored) {
                        $("#toolComSortable").append($("#act" + index.toString()));
                    }
                }
                SlideAction.clickSlide(index);
            }
        }
        if ($('#restore-slides-box > div.toolslide').length == 0) {
            $('#dialog-restore-slides').modal('hide');
        }
    });



    $("#appCanvas,.hideOutputConsole,#backtocanvas").click(function (e) {
        $("#promptprintcanvas,#downloadPNG").removeClass("inactive");
        $("#showViewTools").removeClass("disabled");

        if ($(this).attr("id") == "backtocanvas" && $("#wpimager_iframe").is(":visible")) {
            closeFontsMore();
            return false;
        }
        UI.isPrinting = false;
        UI.prepareApp(UI.APP.CANVAS);
        WPImager.selectLayer(WPImager.current);
        WPImagerUI.dockToolLayers();
        WPImagerUI.flagCanvasSave();
        $(this).parent().siblings().removeClass("active");
        $(this).parent().addClass("active");
        return false;
    });
    $("#cmdEditActionNote").click(function (e) {
        var id = parseInt($("#editActionNote").data("id"));
        WPImager.slides[id].slidetitle = $("#txtEditActionNote").val();
        WPImagerUI.flagCanvasSave();
        $("#act" + id.toString() + " .tlnote").text($("#txtEditActionNote").val());
        $("#editActionNote").hide();
    });
    $("#cancelEditActionNote").click(function (e) {
        $("#editActionNote").hide();
    });

    $("#cmdAddComponent").click(function (e) {
        $("#dialog-add-component").modal("show");
        return false;
    });

    $("#cmdAddSlide,#cmdAddSlide2").click(function (e) {
        UI.prepareApp(UI.APP.ADDSLIDE);

        if (WPImager.slides[WPImager.slide].mode == 'cover') {
            $("#cmdCover").click();
        } else {
            $("#cmdCustom").click();
        }
        return false;
    });
    $("#cmdDupSlide,#cmdDupComponent").click(function (e) {
        WPImager.dupSlide();        
        var order = 1, _slidenumber = 1;
        $('#' + ($(this).attr("id") == "cmdDupSlide" ? "toolSlidesSortable":"toolComSortable") + ' > div.toolslide').each(function (e) {
            var id = parseInt($(this).data("var-index"));
            WPImager.slides[id].order = order++;
            if ($(this).hasClass("toolslideNum")) {
                $(this).find(".tool-slide-number").text(_slidenumber.toString());
                _slidenumber++;
            }
        });

        SlideAction.clickSlide(WPImager.slide);
        WPImagerUI.flagCanvasSave();
        return false;
    });

    $("#cmdCover").click(function (e) {
        $(".button-main").removeClass("btn-success");
        $(".create-panel").hide();
        $('#wpimager_addslide_social').show();
        $("#btn-media-" + WPImager.slides[WPImager.slide].submode).click();
        $("#section-" + WPImager.slides[WPImager.slide].submode).find('.selbanner').each(function (e) {
            var w = parseInt($(this).data("width"));
            var h = parseInt($(this).data("height"));
            if (w == parseInt(WPImager.slides[WPImager.slide].canvas_width)
                    && h == parseInt(WPImager.slides[WPImager.slide].canvas_height)) {
                $(this).parent().click();
            }
        });
        $(this).addClass("btn-success");
    });

    $("#cmdCComponent").click(function () {
        $(".create-panel").hide();
        $(".button-main").removeClass("btn-success");
        $('#wpimager_addslide_component').show();
        var w = $("#component_canvas_width").val();
        var h = $("#component_canvas_height").val();
        if (w > parseInt(WPImager.slides[WPImager.slide].canvas_width)
                || h > parseInt(WPImager.slides[WPImager.slide].canvas_height)) {
            w = WPImager.slides[WPImager.slide].canvas_width;
            h = WPImager.slides[WPImager.slide].canvas_height;
            $("#component_canvas_width").val(w);
            $("#component_canvas_height").val(h);
        }

        $("#component_dimenso").css("width", w.toString() + "px").css("height", h.toString() + "px");
        $("#component_dimenso").css("line-height", h.toString() + "px");

        $(this).addClass("btn-success");
        return false;
    });

    $("#cmdCustom").click(function (e) {
        $(".create-panel").hide();
        $(".button-main").removeClass("btn-success");
        $('#wpimager_addslide_custom').show();
        var w = WPImager.slides[WPImager.slide].canvas_width;
        var h = WPImager.slides[WPImager.slide].canvas_height;
        $("#custom_canvas_width").val(w);
        $("#custom_canvas_height").val(h);

        var htmlSlide = "";
        var slideNumber = 1;
        $('#toolSlidesSortable > div.toolslide').each(function (e) {
            var slideIndex = parseInt($(this).data("var-index"));
            if (slideIndex > 0) {
                var _title = WPImager.slides[slideIndex].canvas_width.toString() + 'x' + WPImager.slides[slideIndex].canvas_height.toString();
                var strSlideIndex = slideIndex.toString();
                htmlSlide += '<li class="' + (slideIndex == WPImager.slide ? "active" : "") + '"><a href="#" data-slide="' + strSlideIndex + '" title="' + _title + '">' + slideNumber.toString() + '</a></li>';
                slideNumber++;
            }
        });
        $("ul#toolCustomSlideSelector").html(htmlSlide);
        $("#custom_dimenso").css("width", w.toString() + "px").css("height", h.toString() + "px");
        $("#custom_dimenso").css("line-height", h.toString() + "px");

        $(this).addClass("btn-success");
    });


    $("ul#toolCustomSlideSelector").on("click", 'li > a', function (e) {
        e.preventDefault();
        var slideIndex = parseInt($(this).data("slide"));
        var w = WPImager.slides[slideIndex].canvas_width;
        var h = WPImager.slides[slideIndex].canvas_height;
        $("#custom_canvas_width").val(w);
        $("#custom_canvas_height").val(h);
        $("#custom_dimenso").css("width", w.toString() + "px").css("height", h.toString() + "px");
        $("#custom_dimenso").css("line-height", h.toString() + "px");
        $("ul#toolCustomSlideSelector li").removeClass("active");
        $(this).parent().addClass("active");
    });

    $("#wpimager_addslide .btn-media-select").click(function () {
        var canvas_submode = $(this).data("media");
        $("#dimenso").data("submode", canvas_submode);
        $(".section-all").hide();
        $("#addslide_submode_select,#section-" + canvas_submode.toString()).show();
        $("#create_options_presetsizes_col .section").css("width", "100%").css("float", "none");
        $("#section-custom-size").css("clear", "both");

        $(".btn-media-select").removeClass("btn-primary");
        $(this).addClass("btn-primary");
        return false;
    });

    $("#custom_canvas_width,#custom_canvas_height").spinner({
        min: 10,
        max: 8192,
        step: 1,
        spin: function (event, ui) {
            if ($("#custom_canvas_width").spinner("isValid")) {
                if ($("#custom_canvas_height").spinner("isValid")) {
//                    preview_dimenso($("#custom_canvas_width").spinner("value"), $("#custom_canvas_height").spinner("value"), 'Custom Size');
                }
            }
        },
        stop: function (event, ui) {
            if ($("#custom_canvas_width").spinner("isValid")) {
                if ($("#custom_canvas_height").spinner("isValid")) {
                    var w = $("#custom_canvas_width").val();
                    var h = $("#custom_canvas_height").val();
                    $("#custom_dimenso").css("width", w.toString() + "px").css("height", h.toString() + "px");
                    $("#custom_dimenso").css("line-height", h.toString() + "px");
                }
            }
        }
    }).on('blur', function () {
        if (!$(this).spinner("isValid")) {
            $(this).spinner("value", 100);
        }
        //     preview_dimenso($("#custom_canvas_width").spinner("value"), $("#custom_canvas_height").spinner("value"), 'Custom Size');
    });

    $("#custom_canvas_width").spinner("value", 100);
    $("#custom_canvas_height").spinner("value", 100);


    $("#component_canvas_width,#component_canvas_height").spinner({
        min: 10,
        max: 8192,
        step: 10,
        stop: function (event, ui) {
            if ($("#component_canvas_width").spinner("isValid")) {
                if ($("#component_canvas_height").spinner("isValid")) {
                    var w = $("#component_canvas_width").val();
                    var h = $("#component_canvas_height").val();
                    $("#component_dimenso").css("width", w.toString() + "px").css("height", h.toString() + "px");
                    $("#component_dimenso").css("line-height", h.toString() + "px");
                }
            }
        }
    }).on('blur', function () {
        if (!$(this).spinner("isValid")) {
            $(this).spinner("value", 100);
        }
    });

    $("#component_canvas_width").spinner("value", 200);
    $("#component_canvas_height").spinner("value", 200);

});