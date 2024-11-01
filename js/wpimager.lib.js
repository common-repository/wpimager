/*!
 WPImager 1.0.0    
 WPImager Library Object
 https://wpimager.com/
 2018 WPImager  
 */

/**
 * WPImager - Manage canvas data, layer data, canvas functions, 
 * Provide function calls to text and image object layers.
 */

var WPImager;

(function ($) {

    WPImager = {
        boot: 0,
        slide: 0,
        current: 0,
        uploading: [],
        multiselect: [],
        canvas: {},
        layer: {},
        image: {},
        slides: {},
        addons: {},
        init: function (canvas_id, data) {
            var cloudcanvas = {}, cloudlayers = {}, cloudslides = {}, cloudaddons = {}, cloudzipimg = {}, CloudGFonts = {}, CloudIFonts = {}, CloudSafeFonts = {};
            if (this.isJSON(data.cloudcanvas))
                cloudcanvas = JSON.parse(data.cloudcanvas);
            if (this.isJSON(data.cloudlayers))
                cloudlayers = JSON.parse(data.cloudlayers);
            if (this.isJSON(data.cloudslides))
                cloudslides = JSON.parse(data.cloudslides);
            if (this.isJSON(data.cloudaddons))
                cloudaddons = JSON.parse(data.cloudaddons);
            if (this.isJSON(data.cloudzipimg))
                cloudzipimg = JSON.parse(data.cloudzipimg);
            if (this.isJSON(data.cloudgfonts))
                CloudGFonts = JSON.parse(data.cloudgfonts);
            if (this.isJSON(data.googlefonts))
                ggfonts = JSON.parse(data.googlefonts);
            if (this.isJSON(data.colorpalettes)) {
                var data_colorpalettes = JSON.parse(data.colorpalettes);
                if ($.isArray(data_colorpalettes)) {
                    var colorpalette = [];
                    for (var i = 0; i < data_colorpalettes.length; i++) {
                        var _palette = data_colorpalettes[i];
                        if (typeof _palette.title !== "undefined" && typeof _palette.palette !== "undefined" && typeof _palette.order !== "undefined") {
                            if (typeof _palette.disposed !== "undefined" && _palette.disposed == 0) {
                                colorpalette.push({title: _palette.title, order: _palette.order, disposed: 0, palette: _palette.palette});
                            }
                        }
                    }
                    UI.colorpalette = colorpalette;
                }
            }
            CloudSafeFonts["FontAwesome"] = 1;

            // initialize canvas data 
            this.canvas = {
                version: "1.0",
                id: parseInt(canvas_id),
                title: "",
                sizeLayout: "",
                background: "#000000",
                forecolor: "#ffffff",
                width: 800,
                height: 500,
                ext: "png",
                stfilename: false,
                imgkeepratio: 1,
                txtkeepratio: 0,
                textdir: "ltr",
                picktool: -1,
                tlWidth: 260,
                tlHeight: 400,
                tlOffsetX: 810,
                tlOffsetY: 0,
                tlPosition: 0,
                tvSlides: 'min',
                cvspos: "",
                cpPosition: {left: -1, top: -1},
                maxIndex: 0,
                arrIndex: [],
                slide: 0,
                zoom: 0,
                disposed: 0
            };

            //  get canvas data from ajax fetched cloudcanvas
            if (Object.keys(cloudcanvas).length > 0 && cloudcanvas.hasOwnProperty("id")) {
                this.startCloudCanvas(cloudcanvas);
            }

            // trigger addon data init
            $('#cvs').trigger('init.addon.data', cloudaddons);

            if (WPImager.isJSON("[" + data.kitIDs + "]")) {
                UI.kitIDs = JSON.parse("[" + data.kitIDs + "]");
            }


            UndoRedo = undoRedo(300, WPImager, canvas_id);
            //        var index = 0;
            var maxOrder = 0;
            UI.slide.slideMaxIndex = 0;
            for (var key in cloudlayers) {
                var index = parseInt(cloudlayers[key].index);
                if (index == 0) // forget dummy zero, coz starting index number is 1 (reindex).
                    continue;

                // get max slideIndex, include disposed layers
                UI.slide.slideMaxIndex = Math.max(cloudlayers[key].slide, UI.slide.slideMaxIndex);

                if (cloudlayers[key].disposed > 0) {
                    if (!UndoRedo.hasUndo() && !UndoRedo.hasRedo()) {
                        // disposed layers not needed when session storage renewed
                        continue;
                    }
                }
                if (cloudlayers[key].order <= 0)
                    cloudlayers[key].order = 1;


                var code = cloudlayers[key].code;
                var disposed = (cloudlayers[key].disposed !== 0);
                if (code == UI.LAYER.TEXT) {
                    this.createLayer("LayerText", 0, index, disposed);
                } else if (code == UI.LAYER.IMAGE) {
                    this.createLayer("LayerImage", 0, index, disposed);
                } else if (code == UI.LAYER.COM) {
                    this.createLayer("LayerCOM", 0, index, disposed);
                } else {
                    if (typeof UI.addOnLayer[code] !== "undefined") {
                        this.createLayer(UI.addOnLayer[code].namelayer, 0, index, disposed);
                    } else {
                        this.createLayer("LayerUnknown", 0, index, disposed);
                    }
                }
                // get layer data from ajax fetched cloudlayers
                this.layer[index].setval(cloudlayers[key]);
                // get the highest order amongst all layers
                if (this.layer[index].order > maxOrder)
                    maxOrder = this.layer[index].order;
            }


            var maxIndexOfArrIndex = 0;
            var arrIndex = WPImager.canvas.arrIndex;
            for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                var _index = arrIndex[ix];
                maxIndexOfArrIndex = Math.max(_index, maxIndexOfArrIndex);
            }

            // get the actual maxIndex
            this.canvas.maxIndex = Math.max(maxIndexOfArrIndex, this.canvas.maxIndex);
            // load images on canvas
            for (var index in this.layer) {
                if (this.layer.hasOwnProperty(index)) {
                    if (this.layer[index].code == UI.LAYER.IMAGE) {
                        if (this.layer[index].src != "" && this.layer[index].disposed == 0) {
                            // remap images after unzip to WP folder 
                            var url = this.layer[index].src;
                            for (var zipimg in cloudzipimg) {
                                var zipimgfile = cloudzipimg[zipimg];
                                if (zipimgfile.length == 2) {
                                    if (url.indexOf(zipimgfile[0]) !== -1) {
                                        this.layer[index].src = zipimgfile[1];
                                        this.layer[index].zplock = true;
                                        break;
                                    }
                                }
                            }
                            // load images to canvas
                            WPImagerUI.loadImageShow(index, this.layer[index].src);
                        }
                    }
                }
            }

            var slidesMaxOrder = 0;
            // prepare slides
            for (var key in cloudslides) {
                if (cloudslides[key].disposed == 0) {
                    slidesMaxOrder = Math.max(parseInt(cloudslides[key].order), slidesMaxOrder);
                }
            }

            for (var order = 0; order <= slidesMaxOrder; order++)
            {
                for (var key in cloudslides) {
                    var disposed = cloudslides[key].disposed;
                    if (disposed == 1) {
                        if (!UndoRedo.hasUndo() && !UndoRedo.hasRedo()) {
                            // k = parseInt(cloudslides[key].index);
                            // disposed slides not needed when session storage renewed
                            continue;
                        }
                    }
                    if (order == cloudslides[key].order) {
                        k = parseInt(cloudslides[key].index);
                        if (!isNaN(k)) {
                            this.createSlide("CanvasSlide", k);
                            this.slides[k].order = order;
                            this.slides[k].setval(cloudslides[key]);
                            if (k > 0 && disposed == 0) {
                                this.slides[k].createtoolbox(k);
                            }
                            UI.slide.slideMaxIndex = Math.max(k, UI.slide.slideMaxIndex);
                        }
                    }
                }
            }

            // verify comslide for all layers.
//            var arrIndex = WPImager.canvas.arrIndex;
//            for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
//                var _index = arrIndex[ix];
//                if (WPImager.layer[_index].code == UI.LAYER.COM) {
//                    var comslide = WPImager.layer[_index].comslide;
//                    if (WPImager.slides[comslide] === "undefined") {
//                        WPImager.layer[_index].comslide = 0;
//                    }
//                }
//            }


            if (typeof this.slides[0] === "undefined") {
                this.createSlide("CanvasSlide", 0);
                this.slides[0].order = 0;
                this.slides[0].canvas_width = 0;
                this.slides[0].canvas_height = 0;
            }

            if (typeof this.layer[0] === "undefined") {
                this.createLayer("LayerText", 1, 0, false);
            }


            // copy stringified canvas & layers data for undo comparison purpose.
            UI.saved_canvas = JSON.stringify(this.canvas);
            UI.saved_layers = JSON.stringify(this.layer);
            WPImagerUI.bootup();
            // add a text layer if none are found
            if (this.canvas.maxIndex === 0)
            {
                this.slide = 1; // start with slide 1
                this.addTextLayer();
                this.layer[this.current].content = "NewTextLayer123";
                this.layer[this.current].fontsize = Math.min(this.canvas.height * 0.85, 20);
                this.layer[this.current].fontcolor = "#000000";
                this.layer[this.current].autoSize(WPImagerUI.canvas, WPImagerUI.ctx);
                this.layer[this.current].content = "Add Text";
                this.selectLayer(this.current);
                this.layerAlignHorizontal("center", this.current);
                this.layerAlignVertical("middle", this.current);
            }

            // define canvas area
            $("#cvswrap").css("height", "100%");
            // init canvas controls 
            $("#canvasWidth").val(this.canvas.width);
            $("#canvasHeight").val(this.canvas.height);

            // if (!$.isEmptyObject(CloudGFonts)) 
            {
                // build dropdown font select
                $('#fontfamily,#fontfamily2').fontselect({
                    style: 'font-select',
                    placeholder: 'Select a font',
                    lookahead: 2,
                    gfonts: this.sortObject(CloudGFonts),
                    ifonts: this.sortObject(CloudIFonts),
                    safefonts: CloudSafeFonts,
                    localcssdir: '',
                    api: data.googlefontsapi
                });
                ggfontsurl = data.googlefontsapi;
            }
            // restore toollayer position
            $("#toolBox").css({
                top: this.canvas.tlOffsetY,
                left: this.canvas.tlOffsetX
            });
            // restore toollayer size 
            $("#toolBox").css({
                width: this.canvas.tlWidth,
                height: this.canvas.tlHeight
            });
            // init ratio checkboxes
            $('#imgkeepratio').prop("checked", (this.canvas.imgkeepratio == 1));
            $('#txtkeepratio').prop("checked", (this.canvas.txtkeepratio == 1));

            // get ready canvas
            $("#savecanvas").addClass("btn-default").removeClass("btn-danger");
            if (this.canvas.width > 800)
                $("#content-main").css("width", this.canvas.width.toString() + "px");
            $("#basecolor,#fontcolor,#fontcolor2,#fontcolor3,#backcolor,#bordercolorImage,#outlinecolorText,#bordercolorText, #bordercolorText2, #shadowcolorText,#shadowcolorImage,#shadowcolorTextFill").parent().css('width', '100px');
            $("#download_format").text(this.canvas.ext.toUpperCase());
            $('#chkStfilename').prop("checked", (this.canvas.stfilename == 1));

            this.restoreCurrLayer();
            this.makeSlideDroppable();


            //    var firstSlide = $('#toolSlidesSortable > div.toolslide').first().data("var-index");
            //    SlideAction.startupSlide(firstSlide);
        },
        startCloudCanvas: function (cloudcanvas) {
            this.canvas.version = this.getval(cloudcanvas.version, "0");
            this.canvas.picktool = this.getval(cloudcanvas.picktool, 0);
            this.canvas.width = this.getval(cloudcanvas.width, 800);
            this.canvas.height = this.getval(cloudcanvas.height, 600);
            this.canvas.background = "#0000ffff";//this.getval(cloudcanvas.background, "#000000");
            this.canvas.forecolor = "#000000";  // this.getval(cloudcanvas.forecolor, "#ffffff");
            this.canvas.ext = this.getval(cloudcanvas.ext, "png");
            this.canvas.stfilename = this.getval(cloudcanvas.stfilename, 0);
            this.canvas.tlWidth = this.getval(cloudcanvas.tlWidth, 260);
            this.canvas.tlHeight = this.getval(cloudcanvas.tlHeight, $(window).height() - 100);
            this.canvas.tlOffsetX = this.getval(cloudcanvas.tlOffsetX, 810);
            this.canvas.tlOffsetY = this.getval(cloudcanvas.tlOffsetY, 0);
            this.canvas.tlPosition = this.getval(cloudcanvas.tlPosition, 0);
            this.canvas.tvSlides = this.getval(cloudcanvas.tvSlides, 'min');
            this.canvas.imgkeepratio = this.getval(cloudcanvas.imgkeepratio, 0);
            this.canvas.txtkeepratio = this.getval(cloudcanvas.txtkeepratio, 0);
            this.canvas.textdir = this.getval(cloudcanvas.textdir, "ltr");
            this.canvas.cvspos = this.getval(cloudcanvas.cvspos, "");
            this.canvas.cpPosition = this.getval(cloudcanvas.cpPosition, {});
            this.canvas.action = this.getval(cloudcanvas.action, {});
            this.canvas.maxIndex = this.getval(cloudcanvas.maxIndex, 0);
            this.canvas.slide = this.getval(cloudcanvas.slide, 0);
            this.canvas.zoom = this.getval(cloudcanvas.zoom, 0);
            this.setTextDirection();

            // allow overide using variable
            if (typeof UI_zoom !== "undefined") {
                this.canvas.zoom = (parseInt(UI_zoom) == 0) ? 0 : 1;
            }
            this.canvas.zoom = (parseInt(this.canvas.zoom) == 0) ? 0 : 1; // normalize
            this.canvas.cpPosition = {
                left: this.getval(this.canvas.cpPosition.left, -1),
                top: this.getval(this.canvas.cpPosition.top, -1)
            }

        },
        saveColorPalettes: function () {
            // fetch user Google Fonts
            $.ajax({
                type: 'POST',
                url: ajaxurl,
                data: {action: 'savecolors', colorpalettes: JSON.stringify(UI.colorpalette), _wpnonce: UI.nonce},
                dataType: 'json',
                cache: false,
                success: function (data) {
                    // preliminary check on canvas and layers data
                    if (data.success) {
                        $("#managecolorpalettes").click();
                    }
                }
            });

        },
        reorderColorPalettes: function () {
            var allocate_order = 0;
            $("#color-palette-box .palette-block-wrap").each(function (e) {
                var index = parseInt($(this).data("index"));
                if (index !== -1) {
                    if (UI.colorpalette[index].disposed == 0) {
                        $(this).data("order", allocate_order);
                        UI.colorpalette[index].order = allocate_order++;
                    }
                }
            });
        },
        reloadUserFonts: function () {
            // fetch user Google Fonts
            $.ajax({
                type: 'POST',
                url: ajaxurl,
                data: {action: 'user_fetch_fonts', canvas_id: WPImager.canvas.id, _wpnonce: UI.nonce},
                dataType: 'json',
                cache: false,
                success: function (data) {
                    // preliminary check on canvas and layers data
                    if (WPImager.isJSON(data.cloudgfonts)) {

                        var CloudGFonts = {}, CloudIFonts = {}, CloudSafeFonts = {};
                        if (WPImager.isJSON(data.cloudgfonts))
                            CloudGFonts = JSON.parse(data.cloudgfonts);

                        CloudSafeFonts["FontAwesome"] = 1;

                        $('.font-select').remove();
                        // 
                        // build dropdown font select
                        $('#fontfamily,#fontfamily2').fontselect({
                            style: 'font-select',
                            placeholder: 'Select a font',
                            lookahead: 2,
                            gfonts: WPImager.sortObject(CloudGFonts),
                            ifonts: WPImager.sortObject(CloudIFonts),
                            safefonts: CloudSafeFonts,
                            localcssdir: '',
                            api: data.googlefontsapi
                        });
                        ggfontsurl = data.googlefontsapi;
                        WPImager.loadGoogleFonts();
                    }
                }
            });

        },
        loadGoogleFonts: function () {
            // load Google fonts using api call
            $("#fontfamily > option").each(function () {
                UI.GFonts[this.value] = ($(this).hasClass("loaded")) ? 1 : 0;
            });

            var arrIndex = WPImager.canvas.arrIndex;
            for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                var layer = arrIndex[ix];
                if (this.layer[layer].code == UI.LAYER.TEXT) {
                    var fontFamily = this.layer[layer].fontfamily;
                    var fontsrctype = parseInt(this.layer[layer].fontsrctype);
                    switch (fontsrctype) {
                        case 0:
                            break;
                        case 2:
                            var link = $('#fontfamily').fontselect.getLOCALCSSDIR() + fontFamily + ".css";

                            if ($("link[href*='" + fontFamily + "']").length === 0) {
                                $('link:last').after('<link href="' + link + '" rel="stylesheet" type="text/css">');
                            }
                            break;
                        case 3:
                            var _variants = '';
                            for (var i = 0; i < ggfonts.length; i++) {
                                if (ggfonts[i].family.replace(/[\+|:]/g, ' ') === fontFamily) {
                                    _variants = ggfonts[i].variants;
                                    break;
                                }
                            }
                            this.addFontLinkTag(layer, _variants);
                            break;
                    }
                }
            }
        },
        addFontLinkTag: function (layer, _variants) {
            var fontFamily = this.layer[layer].fontfamily;
            var fontFamilyWeight = this.layer[layer].fontfamily + '-' + this.layer[layer].fontweight.toString();
            var fontWeight = this.layer[layer].fontweight.toString();
            if (typeof UI.GFonts[fontFamilyWeight] === "undefined" || UI.GFonts[fontFamilyWeight] === 0) {
                for (var i = 0; i < ggfonts.length; i++) {
                    if (ggfonts[i].family.replace(/[\+|:]/g, ' ') === fontFamily)
                    {
                        var variants = _variants.split(',');

                        var weight = fontWeight;
                        if (weight == "400") {
                            weight = "regular";
                        }

                        if (variants.indexOf(weight) > -1) {
                            var link = document.createElement("link");
                            link.setAttribute("rel", "stylesheet");
                            link.setAttribute("type", "text/css");
                            var apiurl = ggfontsurl;
                            // link.setAttribute("href", apiurl + ggfonts[i].family + ":400,700,400italic,700italic");
                            var ggfontfamily = ggfonts[i].family.split(' ').join('+');
                            var _href = apiurl + ggfontfamily + ':' + fontWeight;
                            if (fontWeight == "400") {
                                if (variants.indexOf("italic") > -1) {
                                    _href += ',' + fontWeight + 'italic';
                                }
                            } else if (variants.indexOf(weight.toString() + "italic") > -1) {
                                _href += ',' + fontWeight + 'italic';
                            }
                            link.setAttribute("href", _href);
                            document.getElementsByTagName("head")[0].appendChild(link);
                            UI.GFonts[fontFamilyWeight] = 1;
                        }
                        break;
                    }
                }
            }

        },
        clearSlideDroppable: function () {
            try {
                $("#toolSlidesSortable .toolslide").droppable("destroy");
            } catch (err) {

            }
        },
        makeSlideDroppable: function () {
            $("#toolSlidesSortable .toolslide").droppable({
                hoverClass: "activehover",
                tolerance: "pointer",
                accept: function (el) {
                    if (el.hasClass('toolboxLayer')) {
                        var target_slide = parseInt($(this).data("var-index"));
                        var id = parseInt(el.data("var-index"));
                        var source_slide = WPImager.layer[id].slide;
                        if (target_slide == source_slide || source_slide == 0) {
                            return false;
                        }
                        return true;
                    }
                    return false;
                },
                drop: function (event, ui) {
                    var slide = parseInt($(this).data("var-index"));
                    $("#toolBox .ui-sortable-placeholder").fadeOut();
                    var item = ui.draggable;
                    var id = parseInt(item.data("var-index"));
                    var source_slide = WPImager.layer[id].slide;
                    if (slide == 0) {
                        return;
                    }
                    WPImager.layer[id].slide = slide;
                    $("#toolboxLayerSortable").sortable({revert: false});
                    SlideAction.loadSlide(WPImager.slide);  // force early create layer in slide
                    WPImagerUI.flagCanvasSave();

                    setTimeout(function () {
                        WPImager.rebuildToolLayers();
                        WPImager.recalculateLayersOrder();
                        WPImager.refreshIconLock(); // refresh shared-icon                 
                        WPImager.selectLayerTop();
                    }, 10);

                }
            });

            $("#toolComSortable .toolslide").droppable({
                hoverClass: "activehover",
                tolerance: "pointer",
                accept: function (el) {
                    if (el.hasClass('toolboxLayer')) {
                        var target_slide = parseInt($(this).data("var-index"));
                        var id = parseInt(el.data("var-index"));
                        if (WPImager.layer[id].code == UI.LAYER.TEXT
                                || WPImager.layer[id].code === UI.LAYER.COM) {
                            if (WPImager.layer[id].code === UI.LAYER.COM) {
                                var comslide = WPImager.layer[id].comslide;
                                if (target_slide == comslide) {
                                    return false;
                                }

                                if (WPImager.slides[target_slide].upstreamCom() >= 2) {
                                    // target slide is at max 3 tier
                                    return false;
                                }

                                if (WPImager.slides[target_slide].upstreamCom() == 1) {
                                    if (WPImager.slides[comslide].downstreamCom() > 0) {
                                        // target slide will exceed max 3 tier
                                        return false;
                                    } else if (UI.upstreamCom.indexOf(comslide) !== -1) {
                                        // avoid self referencing
                                        return false;
                                    }
                                } else { // no upstream components
                                    if (WPImager.slides[comslide].downstreamCom() > 1) {
                                        // target slide will exceed max 3 tier
                                        return false;
                                    } else if (UI.downstreamCom.indexOf(target_slide) !== -1) {
                                        // avoid self referencing
                                        return false;
                                    }
                                }
                            }

                            return true;
                        }
                    }
                    return false;
                },
                drop: function (event, ui) {
                    var slide = parseInt($(this).data("var-index"));
                    var target_slide = slide;
                    $("#toolBox .ui-sortable-placeholder").fadeOut();
                    var item = ui.draggable;
                    var id = parseInt(item.data("var-index"));
                    var source_slide = WPImager.layer[id].slide;
                    if (WPImager.layer[id].code === UI.LAYER.COM) {
                        var comslide = WPImager.layer[id].comslide;

                        if (target_slide == comslide) {
                            alert("Self referencing components is not allowed.");
                            return false;
                        }

                        if (WPImager.slides[target_slide].upstreamCom() >= 2) {
                            // target slide is at max 3 tier
                            alert("More than 3-tier components is not allowed.");
                            return false;
                        }

                        if (WPImager.slides[target_slide].upstreamCom() == 1) {
                            if (WPImager.slides[comslide].downstreamCom() > 0) {
                                // target slide will exceed max 3 tier
                                alert("More than 3-tier components is not allowed.");
                                return false;
                            } else if (UI.upstreamCom.indexOf(comslide) !== -1) {
                                // avoid self referencing
                                alert("Self referencing components is not allowed.");
                                return false;
                            }
                        } else { // no upstream components
                            if (WPImager.slides[comslide].downstreamCom() > 1) {
                                // target slide will exceed max 3 tier
                                alert("More than 3-tier components is not allowed.");
                                return false;
                            } else if (UI.downstreamCom.indexOf(target_slide) !== -1) {
                                // avoid self referencing
                                alert("Self referencing components is not allowed.");
                                return false;
                            }
                        }
                    } else if (WPImager.layer[id].code !== UI.LAYER.TEXT) {
                        return;
                    }
                    if (slide == 0) {
                        return;
                    }
                    WPImager.layer[id].slide = slide;
                    $("#toolboxLayerSortable").sortable({revert: false});
                    SlideAction.loadSlide(WPImager.slide);  // force early create layer in slide
                    WPImagerUI.flagCanvasSave();
                    setTimeout(function () {
                        WPImager.rebuildToolLayers();
                        WPImager.recalculateLayersOrder();
                        WPImager.refreshIconLock(); // refresh shared-icon                 
                        WPImager.selectLayerTop();
                    }, 10);

                }
            });

        },
        createSlide: function (layer_name, index) {
            this.slides[index] = new window[layer_name](index); // CanvasSlide
        },
        createLayer: function (layer_name, slide, index, disposed) {
            this.layer[index] = new window[layer_name](slide, index); // LayerText, LayerImage
            if (index > 0 && !disposed) {
                this.canvas.arrIndex.push(index);
            }
        },
        codeCurrent: function () {
            return this.layer[this.current].code;
        },
        isTemplateLayer: function (index) {
            return (this.layer[index].slide == 0);
        },
        layerCount: function () {
            var i, count = 0;
            for (i in this.layer) {
                if (this.layer.hasOwnProperty(i)) {
                    count++;
                }
            }
            if (typeof this.layer[0] === "undefined")
                return count;
            else
                return count - 1; // minus dummy zero index
        },
        layerMaxIndex: function () {
            var maxIndex = 0;
            for (var i in this.layer) {
                maxIndex = (this.layer[i].index > maxIndex) ? this.layer[i].index : maxIndex;
            }
            return maxIndex;
        },
        maxOrder: function () {
            var maxOrder = 0;
            var arrIndex = WPImager.canvas.arrIndex;
            for (var i = 0, len = arrIndex.length; i < len; i++) {
                var index = arrIndex[i];
                maxOrder = (this.layer[index].order > maxOrder) ? this.layer[index].order : maxOrder;
            }
            return maxOrder;
        },
        rebuildToolLayers: function () {
            // remove existing layers 
            $("#editLayerNote").insertAfter("#toolBox"); // avoid removal
            $("#toolboxLayerSortable .toolboxLayer").remove();

            // prepare toolBox 
            var layerIndex = this.layerMaxIndex();
            var maxOrder = this.maxOrder();
            var arrIndex = this.canvas.arrIndex;
            for (var order = maxOrder; order >= 0; order--)
            {
                for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                    var k = arrIndex[ix];
                    if (k > 0) {
                        if (this.layer[k].order == order && this.layer[k].slide === WPImager.slide) {
                            if (WPImager.slides[WPImager.slide].mode == "kit" && this.layer[k].slide === 0) {
                                // skip createToolLayer for component slides
                            } else {
                                this.layer[k].createToolLayer(layerIndex, false);
                            }
                            layerIndex--;
//ss2                            this.layer[k].order = virt_order;
                        }
                    }
                }
            }
        },
        moveLayerUp: function () {
            var curr_id = parseInt(WPImager.current);
            var currlayer = "#lyr" + curr_id.toString();
            var curr = $(currlayer);

            // moving layer
            var gotoLayer = 0;

            $($('#toolboxLayerSortable > div.toolboxLayer').get().reverse()).each(function (e) {
                var iid = parseInt($(this).data("var-index"));
                if (gotoLayer > 0) {
                    var prev = $(this);
                    if ($(this).is(":first-child")) {
                        curr.insertBefore("#" + $(this).attr("id"));
                        return false;
                    } else if (typeof prev !== "undefined" && prev.length > 0) {
                        // swap layers
                        curr.insertBefore("#" + $(this).attr("id"));
                        return false;
                    }
                } else if (iid == curr_id) {
                    gotoLayer = curr_id;
                }
            });

        },
        moveLayerDown: function () {
            var curr_id = parseInt(WPImager.current);
            var currlayer = "#lyr" + curr_id.toString();
            var curr = $(currlayer);

            // moving layer
            var gotoLayer = 0;
            $('#toolboxLayerSortable > div.toolboxLayer').each(function (e) {
                var iid = parseInt($(this).data("var-index"));
                if (gotoLayer > 0) {
                    var next = $(this);
                    if (iid == 0) {
                        // do not exceed background slide
                    } else if ($(this).is(":last-child")) {
                        curr.insertAfter("#" + $(this).attr("id"));
                        return false;
                    } else if (typeof next !== "undefined" && next.length > 0) {
                        // Swap layers
                        curr.insertAfter("#" + $(this).attr("id"));
                        return false;
                    }
                } else if (iid == curr_id) {
                    gotoLayer = curr_id;
                }
            });
        },
        recalculateLayersOrder: function () {
            var order = WPImager.layerCount();
            $('#toolboxLayerSortable > div.toolboxLayer').each(function (e) {
                var iid = parseInt($(this).data("var-index"));
                if (WPImager.layer[iid].slide > 0) {
                    WPImager.layer[iid].order = order--;
                } else if (WPImager.layer[iid].slide == 0) {
                    WPImager.layer[iid].order = order--;
                }
            });

        },
        posX: function () {
            return parseInt(this.layer[this.current].posX());
        },
        posY: function () {
            return parseInt(this.layer[this.current].posY());
        },
        restoreCurrLayer: function () {
            if (this.boot === 0) // required at boot
                return;
            if (typeof this.layer[this.current] === "undefined")
                return;
            this.layer[this.current].restoreLayer();
        },
        toggTextDir: function () {
            if (this.boot === 0)
                return;
            if (this.canvas.textdir === "rtl") {
                this.canvas.textdir = "ltr";
                $('#textdir').html("LTR");
            } else {
                this.canvas.textdir = "rtl";
                $('#textdir').html("RTL");
            }
        },
        toggleLayerVisible: function (layer) {
            if (this.boot === 0)
                return;
            if (layer == 0) {
                return;
            } else {
                this.layer[layer].visible = !this.layer[layer].visible;
            }
        },
        toggCurrLayerVisible: function () {
            if (this.boot === 0)
                return;
            this.layer[this.current].visible = !this.layer[this.current].visible;
        },
        toggCurrLayerLock: function () {
            if (this.boot === 0)
                return;
            this.layer[this.current].locked = !this.layer[this.current].locked;
            if (this.layer[this.current].locked) {
                $('#txtlock > span').addClass("fa-lock").removeClass("fa-unlock");
            } else {
                $('#txtlock > span').addClass("fa-unlock").removeClass("fa-lock");
            }
        },
        toggCurrLayerBold: function () {
            if (this.boot === 0)
                return;
            this.layer[this.current].bold = !this.layer[this.current].bold;
            if (this.layer[this.current].bold) {
                this.layer[this.current].fontweight = 700;
            } else {
                this.layer[this.current].fontweight = 400;
            }
        },
        toggCurrLayerItalic: function () {
            if (this.boot === 0)
                return;
            this.layer[this.current].italic = !this.layer[this.current].italic;
        },
        saveCurrLayerContent: function () {
            if (this.boot === 0)
                return;
            this.layer[this.current].content = input.value;
            if (this.layer[this.current].shape == UI.SHAPE.CUSTOM && this.layer[this.current].content.length > 0) {
                $("#showTextShadowConsole,#showTextOutlineConsole,#showTextPositionConsole").show();
            }

        },
        saveCurrLayerOffset: function (x, y) {
            if (this.boot === 0)
                return;
            this.layer[this.current].xOffset = x;
            this.layer[this.current].yOffset = y;
        },
        saveCurrLayerToolText: function () {
            if (this.boot === 0)
                return;
            var align = $("input[name=align]:checked").val();
            var valign = $("input[name=valign]:checked").val();
            this.layer[this.current].fontsize = $('#fontsize').val();
            this.layer[this.current].fontfamily = $('#fontfamily').val();
            this.layer[this.current].lineheight = $('#lineheight').val();
            this.layer[this.current].padding = parseInt($('#textPadding').val());
            this.layer[this.current].align = align;
            this.layer[this.current].valign = valign;
        },
        addTextLayer: function (lastfontselected) {
            var k = ++this.canvas.maxIndex;
            this.createLayer("LayerText", this.slide, this.canvas.maxIndex, false);
            this.layer[k].order = k;
            this.layer[k].createToolLayer(k, true);
            var fontsize = parseInt(this.layer[k].height * 0.9);
            fontsize = (fontsize == 0) ? 20 : fontsize; // min font size;
            fontsize = (fontsize > 10) ? fontsize : 10; // min font size;
            this.layer[k].fontsize = (fontsize <= 36) ? fontsize : 36; // limit font size to 36
            this.layer[k].fontcolor = this.canvas.forecolor;
            if (typeof lastfontselected !== "undefined" && lastfontselected.fontfamily.length > 0) {
                this.layer[k].fontfamily = lastfontselected.fontfamily;
                this.layer[k].fontsrctype = lastfontselected.srctype;
            }
            this.current = this.canvas.maxIndex;
            this.canvas.picktool = this.layer[this.current].code;
            this.selectLayer(this.current);

        },
        dupTextLayer: function (index) {
            index = (typeof index == "undefined") ? this.current : index;
            if (index == 0)
                return;
            var srcLayer = index;
            this.addTextLayer();
            for (var attr in this.layer[srcLayer]) {
                if (attr !== "this.current" && attr !== "order" && attr !== "layernote" && this.layer[this.current].hasOwnProperty(attr)) {
                    this.layer[this.current][attr] = this.layer[srcLayer][attr];
                }
            }
            this.layer[this.current].index = this.current;
            this.layer[this.current].slide = this.slide;
            this.layer[this.current].content = this.layer[srcLayer].content;
            this.layer[this.current].fontfamily = this.layer[srcLayer].fontfamily;
            this.layer[this.current].fontsrctype = this.layer[srcLayer].fontsrctype;
            this.layer[this.current].fontcolor = this.layer[srcLayer].fontcolor;
            this.layer[this.current].backcolor = this.layer[srcLayer].backcolor;
            if (this.layer[srcLayer].layernote.length > 0) {
                this.layer[this.current].layernote = UI.affixCopyLabel(this.layer[srcLayer].layernote);
            }

            this.layer[this.current].xOffset += 5;
            this.layer[this.current].yOffset += 5;
            this.layer[this.current].visible = true;
            if (this.layer[this.current].shape == UI.SHAPE.POLYGON) {
                $("#txt" + this.current.toString() + ".square").addClass("polysquare");
            } else if (this.layer[this.current].shape == UI.SHAPE.CUSTOM) {
                $("#txt" + this.current.toString() + ".square").addClass("customsquare");
            } else if (this.layer[this.current].shape == UI.SHAPE.LINE) {
                $("#txt" + this.current.toString() + ".square").addClass("linesquare");
            }
            this.layer[this.current].restoreLayer();
        },
        addImageLayer: function () {
            var k = ++this.canvas.maxIndex;
            this.createLayer("LayerImage", this.slide, this.canvas.maxIndex, false);
            this.layer[k].order = k;
            this.layer[k].createToolLayer(k, true);
            this.current = this.canvas.maxIndex;
            this.canvas.picktool = this.layer[this.current].code;
            this.selectLayer(this.current);
        },
        dupImageLayer: function (index) {
            index = (typeof index == "undefined") ? this.current : index;
            if (index == 0)
                return;
            var srcLayer = index;
            this.addImageLayer();
            for (var attr in this.layer[srcLayer]) {
                if (attr !== "this.current" && attr !== "order" && attr !== "layernote" && this.layer[this.current].hasOwnProperty(attr)) {
                    this.layer[this.current][attr] = this.layer[srcLayer][attr];
                }
            }
            this.layer[this.current].index = this.current;
            this.layer[this.current].slide = this.slide;
            this.layer[this.current].imgx += 5;
            this.layer[this.current].imgy += 5;
            if (this.layer[srcLayer].layernote.length > 0) {
                this.layer[this.current].layernote = UI.affixCopyLabel(this.layer[srcLayer].layernote);
            }
            this.layer[this.current].visible = true;
            WPImagerUI.loadImageShow(this.current, this.layer[this.current].src);
            this.selectLayer(this.current);
            var imgdraw = this.layer[this.current];
            if (imgdraw.src !== "") {
                $("#img" + this.current.toString())
                        .css("background-image", "url('" + imgdraw.src + "')");
            }
        },
        copyPasteLayer: function (index) {
            if (this.layer[index].disposed !== 0)
                return;
            if (this.layer[index].code == UI.LAYER.TEXT) {
                this.dupTextLayer(index);
            } else if (this.layer[index].code == UI.LAYER.IMAGE) {
                this.dupImageLayer(index);
            }
            this.rebuildToolLayers();
            this.selectLayer(this.current);
        },
        Addslide: function (w, h, title, mode) {
            this.clearSlideDroppable();
            var k = ++UI.slide.slideMaxIndex;
            this.createSlide("CanvasSlide", k);
            this.slides[k].canvas_width = w;
            this.slides[k].canvas_height = h;
            this.slides[k].slidetitle = title;
            this.slides[k].mode = mode;
            this.slides[k].order = k;
            this.slides[k].createtoolbox(k);
            this.slide = k;

            var slidesCount = 0;
            for (var key in this.slides) {
                if (this.slides[key].disposed == 0) {
                    if (parseInt(key) > 0) {
                        slidesCount++;
                    }
                }
            }


            this.makeSlideDroppable();
            SlideAction.clickSlide(this.slide);
            $("#appCanvas").click();
            return false;
        },
        dupSlide: function () {
            var slide = this.slide;
            var w = this.slides[this.slide].canvas_width;
            var h = this.slides[this.slide].canvas_height;
            var mode = this.slides[this.slide].mode;
            var title = '';
            if (this.slides[this.slide].slidetitle.length > 0) {
                title = UI.affixCopyLabel(this.slides[this.slide].slidetitle);
            }
            this.Addslide(w, h, title, mode);
            $("#act" + slide.toString()).after($("#act" + WPImager.slide.toString()));
            SlideAction.loadSlide(slide);

            var arrIndex = this.canvas.arrIndex;
            var _arrIndex = []; // prepare static arrIndex;
            for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                var i = arrIndex[ix];
                _arrIndex.push(i);
            }

            UI.skipDrawing = true;
            for (var ix = 0, len = _arrIndex.length; ix < len; ix++) {
                var i = _arrIndex[ix];
                if (this.layer[i].slide == slide) {
                    if (this.layer[i].code == UI.LAYER.TEXT) {
                        this.dupTextLayer(i);
                        this.layer[this.current].xOffset -= 5;
                        this.layer[this.current].yOffset -= 5;
                        this.layer[this.current].order = this.layer[i].order;
                        this.layer[this.current].visible = this.layer[i].visible;
                    } else if (this.layer[i].code == UI.LAYER.IMAGE) {
                        this.dupImageLayer(i);
                        this.layer[this.current].imgx -= 5;
                        this.layer[this.current].imgy -= 5;
                        this.layer[this.current].order = this.layer[i].order;
                        this.layer[this.current].visible = this.layer[i].visible;
                    } else if (this.layer[i].code == UI.LAYER.COM) {
                        this.layer[i].duplicate();
                        this.layer[this.current].x -= 5;
                        this.layer[this.current].y -= 5;
                        this.layer[this.current].order = this.layer[i].order;
                        this.layer[this.current].visible = this.layer[i].visible;
                    } else {
                        this.layer[i].duplicate();
                    }
                }
            }
            UI.skipDrawing = false;
        },
        addCanvasSlide: function () {
            var k = ++UI.slide.slideMaxIndex;
            this.createSlide("CanvasSlide", k);
            this.slides[k].order = k;
            this.slides[k].createtoolbox(k);
            this.slides[k].canvas_width = this.canvas.width;
            this.slides[k].canvas_height = this.canvas.height;
            WPImager.slide = k;
        },
        slideCreateCustom: function () {
            var w = parseInt(jQuery("#custom_canvas_width").val());
            var h = parseInt(jQuery("#custom_canvas_height").val());
            var title = 'Custom Size';
            this.Addslide(w, h, title, 'custom');
            WPImagerUI.flagCanvasSave();
        },
        slideCreateComponent: function () {
            var w = parseInt(jQuery("#component_canvas_width").val());
            var h = parseInt(jQuery("#component_canvas_height").val());
            var title = 'Component';
            this.Addslide(w, h, title, 'kit');
            WPImagerUI.flagCanvasSave();
            $("#dialog-add-component").modal("hide");
        },
        slideCreateCover: function () {
            var w = parseInt($("#dimenso").width());
            var h = parseInt($("#dimenso").height());
            var title = $("#dimension_name").text();
            this.Addslide(w, h, title, 'cover');
            this.slides[this.slide].submode = $("#dimenso").data("submode");
            WPImagerUI.flagCanvasSave();
        },
        addSlideCoverPreview: function (_this, w, h, name) {
            canvas_w = w;
            canvas_h = h;
            canvas_title = name;
            $(".selbanner").removeClass("active");
            $("#dimenso").css("width", w.toString() + "px").css("height", h.toString() + "px");
            $("#dimenso").css("line-height", h.toString() + "px");
            $("#dimenso").text(w.toString() + " x " + h.toString() + "");
            $("#dimenso,#label_previewsize").text(w.toString() + " x " + h.toString() + "");
            $("#dimension_name").html(name);

            $("#addslide_previewsize").show();
            $(_this).find(".selbanner").addClass("active");
            return false;
        },
        deleteLayer: function (index) {
            this.layer[index].disposed = 1;
            var delete_index = this.canvas.arrIndex.indexOf(index);
            if (delete_index > -1) {
                if (this.layer[index].comslide > 0
                        && typeof this.slides[this.layer[index].comslide] !== "undefined"
                        && this.slides[this.layer[index].comslide].mode == "kit"
                        ) {
                    this.slides[this.layer[index].comslide].updateComponentUsedIn();
                    this.slides[this.slide].highlightUsedInSlides();
                }
                this.canvas.arrIndex.splice(delete_index, 1);
            }
        },
        setcurrent: function (layer) {
            this.current = layer;
            if (typeof WPImager.slides[this.slide] !== "undefined") {
                WPImager.slides[this.slide].curlayer = layer;
            }
        },
        refreshIconVisible: function () {

            // reset to indicate all layers visible
            $('.btn-layer-visible span').attr("class", "fa fa-eye");
            // refresh layer status icon on Layers Toolbox
            var arrIndex = WPImager.canvas.arrIndex;
            for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                var i = arrIndex[ix];
                var code = this.layer[i].code;
                if (code == UI.LAYER.IMAGE || code == UI.LAYER.TEXT
                        || code == UI.LAYER.COM || typeof UI.addOnLayer[code] !== "undefined") {
                    if (!this.layer[i].visible) {
                        // indicate layer is hidden
                        $('#lyr' + i.toString() + ' > .btn-layer-visible > span').attr("class", "fa fa-eye-slash");
                        $('#a-lyr' + i.toString() + ' > .btn-layer-visible > span').attr("class", "fa fa-eye-slash");
                    }
                }
            }

        },
        refreshIconLock: function () {
            // fa-lock and shared
            $('.square .table-cell .fa-lock').addClass("icon-hidehide");
            var arrIndex = WPImager.canvas.arrIndex;
            for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                var i = arrIndex[ix];
                var code = this.layer[i].code;
                if (code == UI.LAYER.IMAGE || code == UI.LAYER.TEXT
                        || code == UI.LAYER.COM || typeof UI.addOnLayer[code] !== "undefined") {
                    if (this.layer[i].locked) {
                        $('#lyr' + i.toString() + ' .table-cell .fa-lock').removeClass("icon-hidehide");
                    }
                }
            }

        },
        layerControlUpdate: function (i) {
            this.layer[i].controlUpdate();
        },
        layerEdgeHandlers: function (i) {
            this.layer[i].refreshEdgeHandlers(i);
        },
        setTextDirection: function () {
            // set text direction on text area and canvas
            if (this.canvas.textdir == "rtl") {
                $('#input').css("direction", "rtl");
                $('#cvs').css("direction", "rtl");
            } else {
                $('#input').css("direction", "ltr");
                $('#cvs').css("direction", "ltr");
            }
            $('#textdir').html(this.canvas.textdir === "rtl" ? "RTL" : "LTR");
        },
        setMultiLayerImage: function (varname, value, setcurrent) {
            if (this.boot === 0)
                return;
            setcurrent = (typeof setcurrent === "undefined") ? false : setcurrent;
            if (setcurrent)
                this.layer[this.current][varname] = value;
            for (var i = 0; i < this.multiselect.length; i++)
                this.layer[this.multiselect[i]][varname] = value;
        },
        setMultiLayerText: function (varname, value, setcurrent) {
            if (this.boot === 0)
                return;
            setcurrent = (typeof setcurrent === "undefined") ? false : setcurrent;
            if (setcurrent) {
                this.layer[this.current].setLayerTextParm(varname, value);
            }
            for (var i = 0; i < this.multiselect.length; i++) {
                var index = this.multiselect[i];
                if (this.layer[index].code == UI.LAYER.TEXT) {
                    this.layer[index].setLayerTextParm(varname, value);
                    if (varname == "bold") {
                        if (this.layer[index].bold) {
                            this.layer[index].fontweight = 700;
                        } else {
                            this.layer[index].fontweight = 400;
                        }
                    }

                }
            }
        },
        clearMultiLayers: function () {
            // clear all secondary selections
            this.multiselect = [];
        },
        isMultiSelectOn: function () {
            // check if more than one layer is selected
            return (this.multiselect.length > 0);
        },
        layerWidth: function (index) {
            // get layer width
            return this.layer[index].layerWidth();
        },
        layerHeight: function (index) {
            // get layer height
            return this.layer[index].layerHeight();
        },
        layerApplyCanvasWidth: function (index) {
            // apply canvas width to layer
            this.layer[index].applyCanvasWidth(this.canvas);
        },
        layerApplyCanvasHeight: function (index) {
            // apply canvas height to layer
            this.layer[index].applyCanvasHeight(this.canvas);
        },
        layerAlignHorizontal: function (align, index) {
            // align left, right, center
            this.layer[index].alignHorizontal(align, this.slides[this.slide].canvas_width);
        },
        layerAlignVertical: function (valign, index) {
            // align top, bottom, middle
            this.layer[index].alignVertical(valign, this.slides[this.slide].canvas_height);
        },
        layerCenterView: function (index) {
            // center in viewport
            var scaleY = 1;
            var slide = this.layer[index].slide;
            if ($("#cvs").height() !== this.slides[slide].canvas_height) {
                scaleY = $("#cvs").height() / this.slides[slide].canvas_height;
            }

            var marginTop = $("#pagetitle").outerHeight() + parseInt($("#cvswrap").css("margin-top")) + parseInt($("#cvsOutput").css("margin-top"));

            var visibleHeight = this.slides[slide].canvas_height * scaleY;
            if (marginTop - $(window).scrollTop() > 0) {
                marginTop -= $(window).scrollTop();
                // top of canvas is visible
                var portViewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                var canvasCutOffBottom = marginTop + (this.slides[slide].canvas_height * scaleY) - portViewHeight;
                if (canvasCutOffBottom > 0) {
                    visibleHeight -= canvasCutOffBottom;
                }
                if ($(window).scrollTop() > $("#pagetitle").outerHeight() + 20) {
                    var cutOffByScroll = Math.min($(window).scrollTop() - $("#pagetitle").outerHeight() + 20, 140);
                    visibleHeight -= cutOffByScroll;
                    this.layer[index].alignVertical("middle", visibleHeight / scaleY);
                    this.layer[index].setY(this.layer[index].Y() + (cutOffByScroll) / scaleY);
                } else {
                    this.layer[index].alignVertical("middle", visibleHeight / scaleY);
                }

                draw();
                this.layer[index].setY(this.layer[index].Y() + $("#cvswrap").scrollTop() / scaleY);
                draw();
            } else {
//                marginTop -= $(window).scrollTop();
                // top of canvas is cut-off
                var portViewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                var canvasCutOffTop = $(window).scrollTop() - marginTop;
                var canvasCutOffBottom = (this.slides[slide].canvas_height * scaleY - canvasCutOffTop) - portViewHeight;
                if (canvasCutOffBottom > 0) {
                    visibleHeight -= canvasCutOffBottom;
                }
                if (canvasCutOffBottom < 0) {
//                    visibleHeight += canvasCutOffBottom;
                }
                if (canvasCutOffTop > 0) {
                    visibleHeight -= canvasCutOffTop;
                }

                if ($(window).scrollTop() > $("#pagetitle").outerHeight() + 20) {
                    var cutOffByScroll = Math.min($(window).scrollTop() - $("#pagetitle").outerHeight() + 20, 140);
                    visibleHeight -= cutOffByScroll;
                    this.layer[index].alignVertical("middle", visibleHeight / scaleY);
//                    this.layer[index].yOffset += (cutOffByScroll) / scaleY ;
                    this.layer[index].setY(this.layer[index].Y() + (cutOffByScroll) / scaleY);
                } else {
                    this.layer[index].alignVertical("middle", visibleHeight / scaleY);
                }
                draw();
//                this.layer[index].yOffset += $("#cvswrap").scrollTop() / scaleY;
                this.layer[index].setY(this.layer[index].Y() + $("#cvswrap").scrollTop() / scaleY);
                draw();
//                this.layer[index].yOffset += canvasCutOffTop / scaleY;
                this.layer[index].setY(this.layer[index].Y() + canvasCutOffTop / scaleY);

            }
            this.layer[index].alignHorizontal("center", this.slides[slide].canvas_width);

//            this.layer[index].layerCenterView();

        },
        spinWidth: function (width, index, doratio, uirefresh)
        {
            if (this.layer[index].shape == UI.SHAPE.POLYGON) {
                this.layer[index].height = this.layer[index].width;
                $("#txtHeight").spinner("value", this.layer[index].width);
            }
            //  set layer width to match spinner 
            this.layer[index].spinWidth(width, doratio, uirefresh);

            if (this.layer[index].shape == UI.SHAPE.POLYGON) {
                this.layer[index].radius = this.layer[index].width / 2;
                $("#txtWidth").spinner("value", this.layer[index].width);
            }
        },
        spinHeight: function (height, index, doratio, uirefresh)
        {
            if (this.layer[index].shape == UI.SHAPE.POLYGON) {
                this.layer[index].width = this.layer[index].height;
                $("#txtWidth").spinner("value", this.layer[index].height);
            }
            //  set layer width to match spinner 
            this.layer[index].spinHeight(height, doratio, uirefresh);

            if (this.layer[index].shape == UI.SHAPE.POLYGON) {
                this.layer[index].radius = this.layer[index].height / 2;
            }
        },
        updateSkewP: function () {
            var skew = parseInt($("#skewAImage").spinner("value"));
            var skewP;
            if (this.layer[this.current].imgskewDir == 1) {
                var scaleY = this.layer[this.current].imgheight_ori / this.layer[this.current].imgheight;
                skewP = skew * scaleY;
            } else {
                var scaleX = this.layer[this.current].imgwidth_ori / this.layer[this.current].imgwidth;
                skewP = skew * scaleX;
            }
            this.layer[this.current].imgskewP = skewP;
            return skewP;
        },
        updateSkewA: function () {
            var skew = parseInt($("#skewAImage").spinner("value"));
            var skewA;
            if (this.layer[this.current].imgskewDir == 1) {
                var scaleY = this.layer[this.current].imgheight_ori / this.layer[this.current].imgheight;
                skewA = skew * scaleY;
            } else {
                var scaleX = this.layer[this.current].imgwidth_ori / this.layer[this.current].imgwidth;
                skewA = skew * scaleX;
            }
            this.layer[this.current].imgskewA = skewA;
            return skewA;
        },
        updateSkewB: function () {
            var skew = parseInt($("#skewBImage").spinner("value"));
            var skewB;
            if (this.layer[this.current].imgskewDir == 1) {
                var scaleY = this.layer[this.current].imgheight_ori / this.layer[this.current].imgheight;
                skewB = skew * scaleY;
            } else {
                var scaleX = this.layer[this.current].imgwidth_ori / this.layer[this.current].imgwidth;
                skewB = skew * scaleX;
            }
            this.layer[this.current].imgskewB = skewB;
            return skewB;
        },
        ui_refresh: function (index)
        {
            this.layer[index].ui_refresh();
        },
        selectLayer: function (index) {
            if (index == 0)
                return;

            UI.input.cursor = false;
            if (UI.cursorInterval) {
                // clear cursor interval
                clearInterval(UI.cursorInterval);
            }

            if (UI.isCropping && !UI.isPrinting) {
                // cancel crop image
                UI.isCropping = false;
                $("#imgconsole").show();
                $("#cropimageconsole").hide();
                WPImagerUI.resize_image(this.current);
            }
            $("#txtconsole,#imgconsole,#editLayerNote,#editActionNote,.cvsconsole").hide();
            this.canvas.picktool = this.layer[index].code;
            this.setcurrent(index);
            this.layer[index].selectLayer();
            this.scrollActiveLayer();
            var comslide = this.layer[index].comslide;
            $("#toolSlidesSortable").find(".tlnote").removeClass("active");
            if (this.layer[index].comslide > 0) {
                $("#act" + comslide.toString()).find(".tlnote").addClass("active");
            }

            UI.isCropping = false;
            $("#cropimageconsole,#rotateimageconsole,#_rotatetextconsole,#borderimageconsole,#canvascolorpickerconsole").hide();

            WPImagerUI.draw();
            this.updateLayerTab();
        },
        updateLayerTab: function () {
//        if (WPImager.slide > 0) return;

            if (WPImager.current == 0) {
                var notitle = (WPImager.slides[WPImager.slide].mode == "kit") ? "Component #" : "Slide #";
                var slidetitle = (WPImager.slides[WPImager.slide].slidetitle > 0) ? WPImager.slides[WPImager.slide].slidetitle : notitle + WPImager.slide.toString();
                if (WPImager.slide == 0) {
                    slidetitle = "Background slide";
                }

                $("#txtconsole_task,#imgconsole_task,#resizeconsoleconsole_task,#editLayerNote,#editActionNote").hide();
                $("#txtconsole,#imgconsole,.cvsconsole").hide();
                $("#showNilConsole").text(slidetitle);
                $("#nilconsole_task").show();
                $('#showNilConsole').click();
                $("#nilconsole").text("Slide is empty");
            } else if (UI.console == UI.CNSL.RESIZECVS) {
                $(".cvsconsole,.taskconsole").hide();
                $("#txtconsole_task,#imgconsole_task,#editLayerNote,#editActionNote").hide();
                $("#txtconsole,#imgconsole,.cvsconsole").hide();
                $("#resizeconsoleconsole_task,#resizecvsconsole").show();
                setTimeout(function () {
                    $("#showResizeCanvasConsole").addClass("active");
                }, 100);
            } else if (WPImager.canvas.picktool === UI.LAYER.COM) {
                $("#txtconsole_task").show();
                $("#imgconsole_task,#nilconsole_task,#resizeconsoleconsole_task").hide();
                $("#showCOMConsole").click();
            } else if (WPImager.canvas.picktool === UI.LAYER.TEXT) {
                $("#txtconsole_task").show();
                $("#imgconsole_task,#nilconsole_task,#resizeconsoleconsole_task").hide();
                if (this.layer[this.current].shape == UI.SHAPE.LINE) {
                    switch (UI.console) {
                        case UI.CNSL.LINETOOLBAR:
                            $("#showLineConsole").click();
                            break;
                        case UI.CNSL.LINESTYLETOOLBAR:
                            $('#showTextLineStyle').click();
                            break;
                        case UI.CNSL.TXTSHADOWFILL:
                            $('#showTextShadowFillConsole').click();
                            break;
                        default:
                            UI.console = UI.CNSL.LINETOOLBAR;
                            $("#showLineConsole").click();
                            break;
                    }
                    $("#txtconsole").hide();
                } else if (this.layer[this.current].shape == UI.SHAPE.BACKGROUND) {
                    $("#showTextBgControls").click();
                } else if (this.layer[this.current].shape == UI.SHAPE.CUSTOM) {
                    switch (UI.console) {
                        case UI.CNSL.SHAPETOOLBAR:
                            $("#showShapeEditConsole").click();
                            break;
                        case UI.CNSL.TXTTOOLBAR:
                            $("#showTextToolbar").click();
                            break;
                        case UI.CNSL.TXTCOLOR:
                            $("#fontcolorcanvas").click();
                            if (this.layer[this.current].fontcoloroption == "color") {
                                $("#fontcoloroption-color").click();
                            } else {
                                $("#fontcoloroption-gradient").click();
                            }
                            $("#canvascolorpickerconsole").hide();
                            break;
                        case UI.CNSL.TXTBACKGROUND:
                            $("#showTextBgControls").click();
                            break;
                        case UI.CNSL.TXTBORDER:
                            $("#showTextBorderConsole").click();
                            break;
                        case UI.CNSL.LINESTYLETOOLBAR:
                            $('#showTextLineStyle').click();
                            break;
                        case UI.CNSL.TXTSHADOWFILL:
                            $("#showTextShadowFillConsole").click();
                            break;
                        case UI.CNSL.TXTROTATE:
                            $("#showTextRotateConsole").click();
                            break;
                        default:
                            UI.console = UI.CNSL.SHAPETOOLBAR;
                            $("#showShapeEditConsole").click();
                            break;
                    }
                } else if (this.layer[this.current].shape == UI.SHAPE.POLYGON) {
                    switch (UI.console) {
                        case UI.CNSL.POLYGONTOOLBAR:
                            $("#showPolygonConsole").click();
                            break;
                        case UI.CNSL.TXTTOOLBAR:
                            $("#showTextToolbar").click();
                            break;
                        case UI.CNSL.TXTCOLOR:
                            $("#fontcolorcanvas").click();
                            if (this.layer[this.current].fontcoloroption == "color") {
                                $("#fontcoloroption-color").click();
                            } else {
                                $("#fontcoloroption-gradient").click();
                            }
                            $("#canvascolorpickerconsole").hide();
                            break;
                        case UI.CNSL.TXTOUTLINE:
                            $("#showTextOutlineConsole").click();
                            break;
                        case UI.CNSL.TXTCIRCULAR:
                            $("#showTextCircularConsole").click();
                            break;
                        case UI.CNSL.TXTSHADOW:
                            $("#showTextShadowConsole").click();
                            break;
                        case UI.CNSL.TXTPOSITION:
                            $("#showTextPositionConsole").click();
                            break;
                        case UI.CNSL.TXTBACKGROUND:
                            $("#showTextBgControls").click();
                            break;
                        case UI.CNSL.TXTBORDER:
                            $("#showTextBorderConsole").click();
                            break;
                        case UI.CNSL.TXTSHADOWFILL:
                            $("#showTextShadowFillConsole").click();
                            break;
                        case UI.CNSL.TXTROTATE:
                            $("#showTextRotateConsole").click();
                            break;
                        default:
                            UI.console = UI.CNSL.POLYGONTOOLBAR;
                            $("#showPolygonConsole").click();
                            break;
                    }
                    $("#txtconsole").show();

                } else {
                    switch (UI.console) {
                        case UI.CNSL.TXTTOOLBAR:
                            $("#showTextToolbar").click();
                            break;
                        case UI.CNSL.TXTCOLOR:
                            $("#fontcolorcanvas").click();
                            if (this.layer[this.current].fontcoloroption == "color") {
                                $("#fontcoloroption-color").click();
                            } else {
                                $("#fontcoloroption-gradient").click();
                            }
                            $("#canvascolorpickerconsole").hide();
                            break;
                        case UI.CNSL.TXTCURVED:
                            $("#showCurveTextConsole").click();
                            break;
                        case UI.CNSL.TXTBACKGROUND:
                            $("#showTextBgControls").click();
                            break;
                        case UI.CNSL.BACKGROUNDTOOLBAR:
                            $("#showTextBgControls").click();
                            break;
                        case UI.CNSL.TXTOUTLINE:
                            $("#showTextOutlineConsole").click();
                            break;
                        case UI.CNSL.TXTBORDER:
                            $("#showTextBorderConsole").click();
                            break;
                        case UI.CNSL.LINESTYLETOOLBAR:
                            $('#showTextLineStyle').click();
                            break;
                        case UI.CNSL.TXTSHADOW:
                            $("#showTextShadowConsole").click();
                            break;
                        case UI.CNSL.TXTSHADOWFILL:
                            $("#showTextShadowFillConsole").click();
                            break;
                        case UI.CNSL.TXTPOSITION:
                            $("#showTextPositionConsole").click();
                            break;
                        case UI.CNSL.TXTCIRCULAR:
                            $("#showTextCircularConsole").click();
                            break;
                        case UI.CNSL.TXTROTATE:
                            $("#showTextRotateConsole").click();
                            break;
                        case UI.CNSL.TXTSKEW:
                            if (this.layer[this.current].shape == UI.SHAPE.PARALLELOGRAM
                                    || this.layer[this.current].shape == UI.SHAPE.TRAPEZOID
                                    || this.layer[this.current].shape == UI.SHAPE.RIBBON) {
                                $('#showTextSkewConsole').click();
                            } else {
                                $("#showTextToolbar").click();
                            }
                            break;
                        default :
//                            if (this.layer[this.current].shape == UI.SHAPE.POLYGON) {
//                                $(".console").removeClass("active");
//                                $("#showPolygonConsole").click();
//                            } else if (this.layer[this.current].shape == UI.SHAPE.LINE) {
//                                $("#showLineConsole").click();
//                            } else {
                            UI.console = UI.CNSL.TXTTOOLBAR;
                            $("#showTextToolbar").click();
//                            }
                    }
                }

                $("#showTextSkewConsole").toggle(
                        this.layer[this.current].shape == UI.SHAPE.PARALLELOGRAM
                        || this.layer[this.current].shape == UI.SHAPE.TRAPEZOID
                        || this.layer[this.current].shape == UI.SHAPE.RIBBON);

//                if ((UI.console == UI.CNSL.LINETOOLBAR || UI.console == UI.CNSL.SHAPETOOLBAR)
//                    && (!(this.shape == UI.SHAPE.BACKGROUND || this.shape == UI.SHAPE.LINE || this.shape == UI.SHAPE.CUSTOM))) {
//                UI.console = UI.CNSL.TXTTOOLBAR;
//            }
            } else if (WPImager.canvas.picktool === UI.LAYER.IMAGE) {
                $("#txtconsole_task,#nilconsole_task,#resizeconsoleconsole_task").hide();
                $("#imgconsole_task").show();
                switch (UI.console) {
                    case UI.CNSL.IMGBORDER:
                        $('#showImageBorderConsole').click();
                        break;
                    case UI.CNSL.IMGROTATE:
                        UI.console = UI.CNSL.IMGMAIN;
                        $('#showMainImageConsole').click();
                        break;
                    case UI.CNSL.IMGCROP:
                        UI.isCropping = false;
                        UI.console = UI.CNSL.IMGMAIN;
                        $('#showMainImageConsole').click();
                        break;
                    case UI.CNSL.IMGBLUR:
                        $('#showImageBlurConsole').click();
                        break;
                    case UI.CNSL.IMGSHADOW:
                        $('#showImageShadowConsole').click();
                        break;
                    case UI.CNSL.IMGSKEW:
                        if (this.layer[this.current].imgshape == UI.SHAPE.PARALLELOGRAM
                                || this.layer[this.current].imgshape == UI.SHAPE.TRAPEZOID) {
                            $('#showSkewImageConsole').click();
                        } else {
                            $('#showMainImageConsole').click();
                        }
                        break;
                    default:
                        UI.console = UI.CNSL.IMGMAIN;
                        $('#showMainImageConsole').click();
                        break;

                }
                $("#showSkewImageConsole").toggle(
                        this.layer[this.current].imgshape == UI.SHAPE.PARALLELOGRAM
                        || this.layer[this.current].imgshape == UI.SHAPE.TRAPEZOID);

            }
        },
        selectLayerTop: function (curlayer) {
            // select curlayer if exist
            if (curlayer > 0 && typeof this.layer[curlayer] !== "undefined"
                    && this.layer[curlayer].slide == WPImager.slide
                    && this.layer[curlayer].disposed == 0) {
                this.selectLayer(curlayer);
                return;
            }

            // select highest visible layer
            var maxOrder = 0;
            var findex = 0;
            var arrIndex = this.canvas.arrIndex;

            for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                var k = arrIndex[ix];

                if (this.layer[k].disposed == 0 && this.layer[k].visible
                        && k > 0 && (this.layer[k].slide == 0 || this.layer[k].slide == this.slide)) {
                    if ($("#lyr" + k.toString()).length == 0) {
                        // skip - layer may be template slide layer and slide may be component slide
                    } else if (parseInt(this.layer[k].order) > maxOrder) {
                        maxOrder = parseInt(this.layer[k].order);
                        findex = k;
                    }
                }
            }

            if (findex > 0) {
                this.selectLayer(findex);
            } else {
                this.current = 0;
                this.updateLayerTab();
            }

        },
        selectLayerAdjacent: function (index) {
            // look for next layer to click on
            var order = this.layer[index].order;
            var layer_upper = -1, layer_lower = -1;
            $('#toolboxLayerSortable > div.toolboxLayer').each(function (e) {
                var var_index = parseInt($(this).data("var-index"));
                if (WPImager.layer[var_index].disposed == 0) {
                    if (WPImager.layer[var_index].order < order) {
                        if (layer_lower === -1)
                            layer_lower = var_index;
                    } else if (WPImager.layer[var_index].order > order) {
                        layer_upper = var_index;
                    }
                }
            });
            // select upper or lower of current layer
            if (layer_lower !== -1) {
                this.selectLayer(layer_lower);
            } else if (layer_upper !== -1) {
                this.selectLayer(layer_upper);
            } else {
                this.current = 0;
                this.updateLayerTab();
            }
        },
        moveLayerToBackground: function () {

            var insertBefore = -1;
            $('#toolboxLayerSortable > div.toolboxLayer').each(function (e) {
                var iid = parseInt($(this).data("var-index"));
                var x, y, w, h;
                if (!WPImager.layer[iid].visible || WPImager.layer[iid].disposed > 0)
                    return true;
                if (WPImager.layer[iid].code == UI.LAYER.IMAGE) {
                    x = WPImager.layer[iid].imgx;
                    y = WPImager.layer[iid].imgy;
                    w = WPImager.layer[iid].imgwidth;
                    h = WPImager.layer[iid].imgheight;
                } else {
                    x = WPImager.layer[iid].xOffset;
                    y = WPImager.layer[iid].yOffset;
                    w = WPImager.layer[iid].width;
                    h = WPImager.layer[iid].height;
                }
                if (iid != WPImager.current &&
                        x < 5 && y < 5 && w >= WPImager.canvas.width && h >= WPImager.canvas.height)
                {
                    if (x + w >= WPImager.canvas.width - 5 && x + h >= WPImager.canvas.height - 5) {
                        insertBefore = iid;
                        return false;
                    }
                }
            });

            var currlayer = "#lyr" + WPImager.current.toString();
            if (insertBefore == -1) {
                var lastlayer = $("#toolboxLayerSortable > div").last();
                $(currlayer).insertAfter(lastlayer);
            } else {
                var beforelayer = "#lyr" + insertBefore.toString();
                $(currlayer).insertBefore(beforelayer);
            }

            this.recalculateLayersOrder();
        },
        scrollActiveLayer: function () {
            var index = this.current;
            var lg = "#lyr";
            if ($(lg + index.toString()).length > 0) {
                if ($(lg + index.toString()).position().top < 0) {
                    $("#toolboxLayerSortable").scrollTop($(lg + index.toString()).offset().top - $("#toolboxLayerSortable").children(":first").offset().top);
                }
                if ($(lg + index.toString()).position().top > $("#toolboxLayerSortable").height() - $(lg + index.toString()).height()) {
                    $("#toolboxLayerSortable").scrollTop($(lg + index.toString()).offset().top - $("#toolboxLayerSortable").children(":first").offset().top);
                }
            }
        },
        mouseClickLayer: function (index) {
            if (UI.isCropping) {
                // skip if cropping layer
            } else if (UI.ctrl_pressed) {
                this.addMultiLayerSelect(index);
            } else {
                if (index > 0 && this.layer[index].visible && this.layer[index].disposed == 0) {
                    if (this.multiselect.indexOf(index) === -1
                            && (this.canvas.picktool !== this.layer[index].code || (this.canvas.picktool === this.layer[index].code && index != this.current))) {
                        this.layer[index].mouseClick();
                        this.setcurrent(index);
                        if (this.layer[index].code == UI.LAYER.TEXT) {
                            // new layer selected
                            this.restoreCurrLayer();
                        } else if (this.layer[index].code == UI.LAYER.IMAGE) {

                        }
                        this.clearMultiLayers();
                        $(".toolboxLayer").removeClass("multi selected"); // called before selectLayer
//                        this.selectToolbar(index);
                        this.layerControlUpdate(this.current);
                        this.selectLayer(this.current);
                        this.canvas.picktool = this.layer[index].code;
                    } else {
                        UI.draggingMouse = true;
                    }
                }
            }
        },
        mouseHitLayerTest: function (x, y) {
            var hitLayer = -1;
            var maxOrder = this.maxOrder();
            var arrIndex = this.canvas.arrIndex;
            for (var order = maxOrder; order > 0; order--)
            {
                for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                    var k = arrIndex[ix];
//                    var virt_order = this.layer[k].order;
//                    if (this.layer[k].slide == 0) {
//                        virt_order = SlideAction.getLayerOrder(k, virt_order);
//                    }

//                    if (virt_order === order && k > 0
                    if (this.layer[k].order === order && k > 0 && this.layer[k].slide === WPImager.slide) {
//                            && (this.layer[k].slide === WPImager.slide || this.layer[k].slide === 0)) {
                        if (this.layer[k].slide == 0 && WPImager.slides[WPImager.slide].mode == "kit") {
                            // skip template layers for component slides
                        } else if (this.layer[k].hitTest(x, y)) {
                            // check for text hit
                            hitLayer = parseInt(k);
                            break;
                        }
                    }
                }
                if (hitLayer !== -1)
                    break;
            }
            return hitLayer;
        },
        moveLayer: function (dx, dy, index) {
            if (this.boot === 0)
                return;
            if (typeof index === "undefined")
                index = this.current;
            this.layer[index].moveLayer(dx, dy);
        },
        mouseHoverCVS: function (_x, _y) {
            var x = -_x, y = -_y;
            var cW = WPImager.slides[WPImager.slide].canvas_width;
            var cH = WPImager.slides[WPImager.slide].canvas_height;
            var _resizeCornerArea = 25;
            var _resizeBoxArea = 15;
            if (x > cW - _resizeCornerArea && x <= cW &&
                    y > cH - _resizeCornerArea && y <= cH) {
                UI.expectResizeCVS = 7;
            } else if (x > cW / 2 - _resizeBoxArea && x <= cW / 2 + _resizeBoxArea &&
                    y > cH - 20 && y <= cH) {
                UI.expectResizeCVS = 6;
            } else if (y > cH / 2 - _resizeBoxArea && y <= cH / 2 + _resizeBoxArea &&
                    x > cW - 20 && x <= cW) {
                UI.expectResizeCVS = 4;
            } else {
                UI.expectResizeCVS = -1;
            }
        },
        mouseHovering: function (x, y) {
            if (this.boot === 0)
                return;
            if (UI.console == UI.CNSL.SHAPETOOLBAR
                    && (UI.console_shape == UI.CNSL.SHAPETOOLNEW || UI.console_shape == UI.CNSL.SHAPETOOLNEWLINE)) {
                WPImagerUI.draw();
            } else if (UI.console == UI.CNSL.TXTCURVED
                    && UI.console_shape == UI.CNSL.SHAPETOOLEDIT) {
                this.layer[this.current].mouseHoveringEditPoints(x, y);
            } else if (UI.console == UI.CNSL.SHAPETOOLBAR && UI.console_shape == UI.CNSL.SHAPETOOLEDIT
                    && (this.layer[this.current].shape == UI.SHAPE.CURVEDTEXT
                            || this.layer[this.current].shape == UI.SHAPE.CUSTOM || this.layer[this.current].shape == UI.SHAPE.LINE)) {
                this.layer[this.current].mouseHoveringEditPoints(x, y);
            } else if (UI.console == UI.CNSL.SHAPETOOLBAR && UI.console_shape == UI.CNSL.SHAPETOOLDRAW
                    && (this.layer[this.current].shape == UI.SHAPE.CUSTOM || this.layer[this.current].shape == UI.SHAPE.LINE)) {
                this.layer[this.current].mouseHoveringDrawPoints(x, y);
            } else {
                this.layer[this.current].mouseHovering(x, y);
            }
        },
        mouseResizeCanvas: function () {
            var dx = UI.touchedDX;
            var dy = UI.touchedDY;
            var width = UI.activeLayerWidth + dx;
            var height = UI.activeLayerHeight + dy;
            if (UI.expectResizeCVS == 7) {
                if (UI.shift_pressed) {
                    var ratio = UI.activeLayerWidth / UI.activeLayerHeight;
                    if (width > height) {
                        height = width / ratio;
                    } else {
                        width = height * ratio;
                    }
                }
                $("#canvasWidth").spinner("value", width);
                $("#canvasHeight").spinner("value", height);
                $("#applyCustomCanvasSize").click();
            } else if (UI.expectResizeCVS == 4) {
                $("#canvasWidth").spinner("value", width);
                $("#applyCustomCanvasSize").click();
            } else if (UI.expectResizeCVS == 6) {
                $("#canvasHeight").spinner("value", height);
                $("#applyCustomCanvasSize").click();
            }
        },
        mouseDragging: function (dx, dy) {
            if (UI.resizeCVS) {
                this.mouseResizeCanvas();
                return;
            }
            this.layer[this.current].mouseDragging(dx, dy);
            for (var i = 0; i < this.multiselect.length; i++) {
                var index = this.multiselect[i];
                this.layer[index].mouseDragging(dx, dy);
            }
        },
        mouseRecropImage: function (dx, dy) {
            this.layer[this.current].mouseRecropImage(dx, dy);
        },
        mouseDragCropImage: function (dx, dy) {
            this.layer[this.current].mouseDragCropImage(dx, dy);
        },
        cropImage: function () {
            this.layer[this.current].cropImage();
        },
        readyCropBox: function () {
            this.layer[this.current].readyCropBox(this.canvas);
        },
        readyTransformBox: function () {
            this.layer[this.current].readyTransformBox(this.canvas);
        },
        setActiveLayer: function () {
            this.layer[this.current].setActiveLayer();
        },
        addMultiLayerSelect: function (findex) {

            if (this.canvas.picktool !== this.layer[findex].code) {
                if (this.multiselect.indexOf(findex) === -1) {
                    this.multiselect.push(findex);
                    this.layer[findex].multiSelect();
                } else {
                    for (var i = this.multiselect.length - 1; i >= 0; i--) {
                        if (this.multiselect[i] == findex)
                            this.multiselect.splice(i, 1);
                    }
                    this.layer[findex].multiDeSelect();
                }
            } else if (!(this.canvas.picktool === this.layer[findex].code && findex == this.current)) {
                if (this.multiselect.indexOf(findex) === -1) {
                    this.multiselect.push(findex);
                    this.layer[findex].multiSelect();
                } else {
                    for (var i = this.multiselect.length - 1; i >= 0; i--) {
                        if (this.multiselect[i] == findex)
                            this.multiselect.splice(i, 1);
                    }
                    this.layer[findex].multiDeSelect();
                }
            }

            $(".txtconsole_litebar").hide();

        },
        multi_size_sync: function (layer) {
            var width = this.layerWidth(layer);
            var height = this.layerHeight(layer);
            for (var i = 0; i < this.multiselect.length; i++) {
                var index = this.multiselect[i];
                this.spinWidth(width, index, false, false);
                this.spinHeight(height, index, false, false);
                if (this.layer[index].code == UI.LAYER.IMAGE) {
                    WPImagerUI.resize_image(index);
                }
            }
        },
        refreshUndoRedoButton: function () {
            if (this.boot === 0)
                return;
            if (this.hasUploading()) {
                // disallow undo redo while uploading in progress
                $("#undo,#redo").addClass("disabled btn-default").addClass("btn-grayed");
                return;
            }
            $("#undo,#redo").removeClass("disabled btn-grayed").addClass("btn-default");
            if (!UndoRedo.hasUndo())
                $("#undo").addClass("disabled");
            if (!UndoRedo.hasRedo())
                $("#redo").addClass("disabled");
        },
        createUploadingIndex: function (index) {
            index = parseInt(index);
            if (this.uploading.indexOf(index) === -1) {
                this.uploading.push(index);
            }
            $("#undo,#redo").addClass("disabled btn-default").addClass("btn-grayed");
        },
        removeUploadingIndex: function (index) {
            index = parseInt(index);
            for (var i = this.uploading.length - 1; i >= 0; i--) {
                if (this.uploading[i] == index)
                    this.uploading.splice(i, 1);
            }
            if (!this.hasUploading()) {
                this.refreshUndoRedoButton();
            }
        },
        hasUploading: function () {
            return (this.uploading.length > 0);
        },
        clearUploadingFlags: function () {
            this.uploading = [];
        },
        isUploading: function (index) {
            index = parseInt(index);
            return (this.uploading.indexOf(index) !== -1);
        },
        postthumbnail: function () {
            var canvas = document.getElementById('cvs');
            var thumbnail = document.getElementById("thumbnail");
            var thumbpreview = document.getElementById("thumbpreview");
            var thumbCtx = thumbnail.getContext('2d');
            var previewCtx = thumbpreview.getContext('2d');
            var ratio = canvas.width / canvas.height;

            UI.hitLayer = -1;
            // get generated image
            UI.isPrinting = true;
            WPImagerUI.draw();
            var current_slide = WPImager.slide;

            // draw other slides
            var slidesCount = 0, componentCount = 0, hasComponents = false;
            $('#toolSlidesSortable > div.toolslide').each(function (e) {
                var slideIndex = parseInt($(this).data("var-index"));
                if (slideIndex > 0 // && !WPImager.slides[slideIndex].isComponent() 
                        && WPImager.slides[slideIndex].disposed == 0)
                {
                    slidesCount++;
                }
            });
            $('#toolComSortable > div.toolslide').each(function (e) {
                var slideIndex = parseInt($(this).data("var-index"));
                if (slideIndex > 0 // && !WPImager.slides[slideIndex].isComponent() 
                        && WPImager.slides[slideIndex].disposed == 0)
                {
                    slidesCount++;
                    componentCount++;
                    if (WPImager.slides[slideIndex].isComponent()) {
                        hasComponents = true;
                    }
                }
            });

            var thumbsquare = 100, row = 0, col = 0, border = 2;
            thumbpreview.width = thumbsquare * slidesCount + (border * (slidesCount + 1)) + (hasComponents ? 6 : 0);
            thumbpreview.height = thumbsquare + border * 2;

            var arrSlides = [];
            $('#toolSlidesSortable > div.toolslide').each(function (e) {
                var slideIndex = parseInt($(this).data("var-index"));
                if (slideIndex > 0 && WPImager.slides[slideIndex].disposed == 0) {
                    arrSlides.push(slideIndex);
                }
            });
            $('#toolComSortable > div.toolslide').each(function (e) {
                var slideIndex = parseInt($(this).data("var-index"));
                if (slideIndex > 0 && WPImager.slides[slideIndex].disposed == 0) {
                    arrSlides.push(slideIndex);
                }
            });
            var slidesOnly = slidesCount - componentCount;
            var slideNow = 0;
            for (var _slideIndex in arrSlides) {
                slideNow++;
                WPImager.slide = arrSlides[_slideIndex];
                SlideAction.loadSlide(WPImager.slide);
                var componentOffset = (slideNow > slidesOnly) ? 6 : 0;
                previewCtx.fillStyle = "#000000";
                previewCtx.fillRect(componentOffset + border * (col + 1) + col * thumbsquare, border * (row + 1) + row * thumbsquare, thumbsquare, thumbsquare);
                var woh = Math.min(canvas.width, canvas.height); // min width or height
                if (canvas.width > thumbsquare && canvas.height > thumbsquare) {
                    // clip canvas
                    previewCtx.drawImage(canvas,
                            parseInt((canvas.width - woh) / 2), parseInt((canvas.height - woh) / 2), woh, woh,
                            componentOffset + border * (col + 1) + col * thumbsquare, border * (row + 1) + row * thumbsquare, thumbsquare, thumbsquare);
                } else if (canvas.width > thumbsquare) {
                    previewCtx.drawImage(canvas,
                            parseInt((canvas.width - thumbsquare) / 2), 0, thumbsquare, canvas.height,
                            componentOffset + border * (col + 1) + col * thumbsquare + 0, border * (row + 1) + row * thumbsquare + parseInt((thumbsquare - canvas.height) / 2), thumbsquare, canvas.height);
                } else if (canvas.height > thumbsquare) {
                    previewCtx.drawImage(canvas,
                            0, parseInt((canvas.height - thumbsquare) / 2), canvas.width, thumbsquare,
                            componentOffset + border * (col + 1) + col * thumbsquare + parseInt((thumbsquare - canvas.width) / 2), border * (row + 1) + row * thumbsquare + 0, canvas.width, thumbsquare);
                } else {
                    // show full canvas
                    previewCtx.drawImage(canvas,
                            0, 0, canvas.width, canvas.height,
                            componentOffset + border * (col + 1) + col * thumbsquare + parseInt((thumbsquare - canvas.width) / 2), border * (row + 1) + row * thumbsquare + parseInt((thumbsquare - canvas.height) / 2), canvas.width, canvas.height);
                }
                col++;
            }

            UI.isPrinting = false;
            SlideAction.clickSlide(current_slide);

            var imgBase64 = thumbpreview.toDataURL("image/png", 1);
            imgBase64 = imgBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

            $.ajax({
                type: 'POST',
                url: ajaxurl,
                data: {action: 'postthumbnail', canvas_id: this.canvas.id, imageCanvas: imgBase64, _wpnonce: UI.nonce
                },
                dataType: 'json',
                cache: false,
                success: function (msg) {

                }
            });
        },
        postdownload: function (imgBase64, ext) {
            $.ajax({
                type: 'POST',
                url: ajaxurl,
                data: {action: 'postdownload', canvas_id: this.canvas.id, imageCanvas: imgBase64, _wpnonce: UI.nonce,
                    canvas: JSON.stringify(WPImager.canvas), layers: JSON.stringify(WPImager.layer), ext: ext
                },
                dataType: 'json',
                cache: false,
                success: function (msg) {
                    if (msg.success) {
                        UI.saved_canvas = JSON.stringify(WPImager.canvas);
                        UI.saved_layers = JSON.stringify(WPImager.layer);
                        UI.flagDirty = false;
                        $("#downloadProgressWrap").css("background-color", "#4cae4c");
                        $("#downloadProgressWrap").show(0).delay(3000).fadeOut(500);
                        $("#savecanvas").addClass("btn-default").removeClass("btn-danger");
                        $("#downloadProgressWrap").find(".done-show").show();
                        $("#downloadProgressWrap").find(".done-hide").hide();
                        // proceed to download file via iframe
                        var fname = WPImagerUI.convertToSlug($("#pagetitle").text());
                        url = adminurl + "?page=wpimager_download&amp;canvas_id=" + msg.canvas_id + "&amp;tick=" + msg.tick + "&amp;fname=" + fname + "&amp;ext=" + ext + "&amp;guest=0";
                        $("body").append("<iframe src='" + url + "' style='display: none;' ></iframe>");
                    } else {
                        if (typeof msg.message !== "undefined") {
                            $('#downloadErrorMsg').text(msg.message);
                        } else {
                            $('#downloadErrorMsg').text("Unexpected response from server while downloading.");
                        }
                        $("#downloadProgressWrap").find(".error-show").show();
                        $("#downloadProgressWrap").find(".error-hide").hide();
                        $("#downloadProgressWrap").css("background-color", "#161616");
                    }


                    setTimeout(function () {
                        $("#downloadcanvas").removeClass("disabled");
                    }, 4000);

                },
                beforeSend: function () {
                    $("#downloadProgressWrap").css("background-color", "#434343");
                    $("#downloadProgressBar").css("width", "0%");
                    $("#downloadProgressWrap").find(".start-show").show();
                    $("#downloadProgressWrap").find(".start-hide").hide();
                    $("#downloadProgressWrap").fadeIn();
                    $('#downloadProgressBar').addClass("progress-bar-success");
                    $("#downloadcanvas").addClass("disabled");
                },
                xhr: function () {
                    UI.xhr["download"] = new window.XMLHttpRequest();
                    //Upload progress
                    UI.xhr["download"].upload.addEventListener("progress", function (evt) {
                        if (evt.lengthComputable) {
                            var percentComplete = evt.loaded / evt.total * 100;
                            //Do something with upload progress
                            $("#downloadProgressBar").css("width", parseInt(percentComplete) + "%");
                        }
                    }, false);
                    return UI.xhr["download"];
                },
                error: function (xhr, errorType, exception) {
                    var responseText;
                    var errormsg = "Unexpected ajax error while downloading.";
                    try {
                        responseText = parseJSON(xhr.responseText);
                        errormsg = "<b>" + errorType + " " + exception + "</b><br>";
                        errormsg += "Exception: " + responseText.ExceptionType + "<br>";
                        errormsg += "Message: " + responseText.Message;
                    } catch (e) {
                        errormsg += xhr.responseText;
                    }
                    $('#downloadErrorMsg').html(errormsg);
                    $("#downloadProgressWrap").find(".error-show").show();
                    $("#downloadProgressWrap").find(".error-hide").hide();
                    $("#downloadProgressWrap").css("background-color", "#161616");
                }
            });

        },
        printcanvas: function (_ext) {
            var canvas = document.getElementById('cvs');
            UI.hitLayer = -1;
            // get generated image
            UI.isPrinting = true;
            WPImagerUI.draw();
            var ext = (_ext == "jpg") ? "jpeg" : _ext;
            var imgBase64 = canvas.toDataURL("image/" + ext, 1);
            imgBase64 = imgBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
            UI.isPrinting = false;
            WPImagerUI.draw();
            $.ajax({
                type: 'POST',
                url: ajaxurl,
                data: {action: 'printcanvas', canvas_id: this.canvas.id, imageCanvas: imgBase64, _wpnonce: UI.nonce,
                    canvas: JSON.stringify(WPImager.canvas), layers: JSON.stringify(WPImager.layer), slides: JSON.stringify(WPImager.slides), addons: JSON.stringify(WPImager.addons), ext: _ext
                },
                dataType: 'json',
                cache: false,
                success: function (msg) {
                    if (msg.success) {
                        UI.saved_canvas = JSON.stringify(WPImager.canvas);
                        UI.saved_layers = JSON.stringify(WPImager.layer);
                        UI.flagDirty = false;
                        $("#printProgressWrap").css("background-color", "#4cae4c");
                        $("#printProgressWrap").show(0).delay(4500).fadeOut(1000);
                        $("#printProgressWrap").find(".done-show").show();
                        $("#printProgressWrap").find(".done-hide").hide();
                        $("#savecanvas").addClass("btn-default").removeClass("btn-danger");
                        var attachment = msg.attach_data;
                        UI.media_attachment_model[attachment.attach_id] = attachment;
                        var imgsrc = wpimager_baseurl + '/' + attachment.file;
                        var basedir = imgsrc.substring(0, imgsrc.lastIndexOf('/')) + "/";
                        if (typeof attachment.sizes !== "undefined" && typeof attachment.sizes.thumbnail !== "undefined") {
                            imgsrc = basedir + attachment.sizes.thumbnail.file;
                        }
                        var item = '<div class="item upload" data-attachment-id="' + attachment.attach_id + '" data-url="' + imgsrc + '" data-w="' + attachment.width + '" data-h="' + attachment.height + '"><img src="' + imgsrc + '"></div>';
                        $('#media_results').prepend(item);

                    } else {
                        if (typeof msg.message !== "undefined") {
                            $('#printErrorMsg').text(msg.message);
                        } else {
                            $('#printErrorMsg').text("Unexpected response from server.");
                        }
                        $("#printProgressWrap").find(".error-show").show();
                        $("#printProgressWrap").find(".error-hide").hide();
                        $("#printProgressWrap").css("background-color", "#161616");
                    }
                    setTimeout(function () {
                        $("#promptprintcanvas").removeClass("disabled");
                    }, 200);
                },
                beforeSend: function () {
                    $("#printProgressWrap").css("background-color", "#434343");
                    $("#printProgressBar").css("width", "0%");
                    $("#printProgressWrap").find(".start-show").show();
                    $("#printProgressWrap").find(".start-hide").hide();
                    $("#printProgressWrap").fadeIn();
                    $('#printProgressBar').addClass("progress-bar-success");
                    $("#promptprintcanvas").addClass("disabled");
                },
                xhr: function () {
                    UI.xhr["print"] = new window.XMLHttpRequest();
                    //Upload progress
                    UI.xhr["print"].upload.addEventListener("progress", function (evt) {
                        if (evt.lengthComputable) {
                            var percentComplete = evt.loaded / evt.total * 100;
                            //Do something with upload progress
                            $("#printProgressBar").css("width", parseInt(percentComplete) + "%");
                        }
                    }, false);
                    return UI.xhr["print"];
                },
                error: function (xhr, errorType, exception) {
                    var responseText;
                    var errormsg = "Unexpected ajax error.";
                    try {
                        responseText = parseJSON(xhr.responseText);
                        errormsg = "<b>" + errorType + " " + exception + "</b><br>";
                        errormsg += "Exception: " + responseText.ExceptionType + "<br>";
                        errormsg += "Message: " + responseText.Message;
                    } catch (e) {
                        errormsg += xhr.responseText;
                    }
                    $('#printErrorMsg').html(errormsg);
                    $("#printProgressWrap").find(".error-show").show();
                    $("#printProgressWrap").find(".error-hide").hide();
                    $("#printProgressWrap").css("background-color", "#161616");

                    $("#promptprintcanvas").removeClass("disabled");
                }
            });
        },
        savecanvas: function () {
            if ($("#savecanvas").hasClass("disabled") || $("#promptprintcanvas").hasClass("disabled")) {
                return;
            }
            WPImager.canvas.slide = WPImager.slide;
            var _canvas = JSON.stringify(WPImager.canvas);
            var _layer = JSON.stringify(WPImager.layer);
            var _slides = JSON.stringify(WPImager.slides);
            var _addons = JSON.stringify(WPImager.addons);
            $("#savecanvas").addClass("disabled");
            $.ajax({
                type: 'POST',
                url: ajaxurl,
                data: {action: 'savecanvas', canvas_id: this.canvas.id, _wpnonce: UI.nonce,
                    canvas: _canvas, canvas_len: _canvas.length, layers: _layer, layers_len: _layer.length, slides: _slides, slides_len: _slides.length, addons: _addons, addons_len: _addons.length
                },
                dataType: 'json',
                cache: false,
                success: function (data) {
                    if (data.success) {
                        UI.saved_canvas = JSON.stringify(WPImager.canvas);
                        UI.saved_layers = JSON.stringify(WPImager.layer);
                        UI.flagDirty = false;
                        $("#savecanvas").addClass("btn-success").removeClass("btn-danger btn-default");
                        setTimeout(function () {
                            $("#savecanvas").addClass("btn-default").removeClass("btn-success");
                        }, 1000);
                    } else {
                        $('#dialog-error-message-data').text(data.message);
                        $('#dialog-error-message').modal('show');
                    }
                    setTimeout(function () {
                        $("#savecanvas").removeClass("disabled");
                    }, 200);
                },
                error: function () {
                    var message = "Error saving canvas";
                    $('#dialog-error-message-data').text(message);
                    $('#dialog-error-message').modal('show');
                    $("#savecanvas").removeClass("disabled");
                }
            });
        },
        savePickerColor: function (selector, color) {
            $("#previewcanvascolorpicker").css("background-color", color);
            if (selector == 'copicker') {
                color = WPImager.layer[WPImager.current].backgradient;
            }
            if (selector == 'fontgradient') {
                color = WPImager.layer[WPImager.current].fontgradient;
            }
            $("#canvascolorpicker_selector").val(selector);
            $("#canvascolorpicker_ori").val(color);
            $("#canvascolorpickerconsole").show();
            $("#previewcanvascolorpicker").css("background-color", color);
            $("#pickoncanvascolorpicker").removeClass("active");
            if (UI.pickonCanvas) {
                $("#pickoncanvascolorpicker").addClass("active");
            }
            UI.canvasColorPicker();

        },
        savePickerColorPoint: function (index) {
            $("#canvascolorpicker_point").val(index);
        },
        applySampledColor: function (selector, pixelColor) {

            if (selector == "fontcolor") {
                this.layer[this.current].fontcolor = pixelColor;
            } else if (selector == "backcolor") {
                this.layer[this.current].backcolor = pixelColor;
            } else if (selector == "outlinecolorText") {
                this.layer[this.current].textoutlinecolor = pixelColor;
            } else if (selector == "bordercolorText" || selector == "bordercolorText2") {
                this.layer[this.current].textbordercolor = pixelColor;
            } else if (selector == "bordergapcolor") {
                this.layer[this.current].bordergapcolor = pixelColor;
            } else if (selector == "fontgradient") {
                var fontgradient = this.getSampledFontGradient(pixelColor);

                this.layer[this.current].fontgradient = fontgradient;
                $('.fontgradient').ClassyGradient({
                    gradient: fontgradient
                });
            } else if (selector == "copicker") {
                var backgradient = this.getSampledBackGradient(pixelColor);

                this.layer[this.current].backgradient = backgradient;
                $('.gradient').ClassyGradient({
                    gradient: backgradient
                });
            } else if (selector == "shadowcolorTextFill") {
                this.layer[this.current].textshadowfillcolor = pixelColor;
            } else if (selector == "shadowcolorText") {
                this.layer[this.current].textshadowcolor = pixelColor;
            } else if (selector == "bordercolorImage") {
                this.layer[this.current].imgbordercolor = pixelColor;
            } else if (selector == "shadowcolorImage") {
                this.layer[this.current].imgshadowcolor = pixelColor;
            }
            if ($("#previewcanvascolorpicker").css("background-color") != pixelColor) {
                WPImagerUI.draw();
            }
            $("#previewcanvascolorpicker").css("background-color", pixelColor);
            // $("#previewcanvascolorpicker").colorPicker.render(pixelColor);
            if ($(".cp-color-picker").is(":visible")) {
                UI.cpRenderCallback = false;
                $("#previewcanvascolorpicker").click();
            }
        },
        sampleCanvasColor: function (selector, mouseX, mouseY, canvasId) {
            if (!$("#canvascolorpickerconsole").is(":visible"))
                return;
            if (selector.length > 0) {
                if (typeof canvasId === "undefined") {
                    canvasId = "cvs";
                }
                var canvas = document.getElementById(canvasId);
                var ctx = canvas.getContext('2d');

                var x = $("#" + canvasId).offset().left - mouseX;
                var y = $("#" + canvasId).offset().top - mouseY;

                if (canvasId == "cvs") {
                    // added in case canvas is css sized
                    if (WPImager.canvas.width != $("#cvs").width()) {
                        x = parseInt(x * (WPImager.canvas.width / $("#cvs").width()));
                    }
                    if (WPImager.canvas.height != $("#cvs").height()) {
                        y = parseInt(y * (WPImager.canvas.height / $("#cvs").height()));
                    }
                }

                var imageData = ctx.getImageData(-x, -y, 1, 1);
                var pixel = imageData.data;
                var pixelColor = "#" + this.componentToHex(pixel[0]) + this.componentToHex(pixel[1]) + this.componentToHex(pixel[2]);

                if (canvasId == "canvas-color-picker") {
                    // extra check for transparent color hit
                    var color_width = parseInt($("#canvascolorpickerconsole").width() / UI.matcolors.length);
                    var _x = mouseX - parseInt($("#" + canvasId).offset().left);
                    var _y = mouseY - parseInt($("#" + canvasId).offset().top);
                    if (UI.currentpalette == -1
                            && _x > (UI.matcolors.length - 1) * color_width && _y > 28) {
                        pixelColor = "#0000ffff";
                    }
                }

                this.applySampledColor(selector, pixelColor);

                if (canvasId == "canvas-color-picker") {
                    if (UI.currentpalette == -1) {
                        if ((pixelColor == "#ffffff" || UI.matcolors.indexOf(pixelColor) !== -1)
                                && typeof UI.matcolorScheme[pixelColor] !== "undefined") {
                            UI.pickerScheme = pixelColor;
                            var colors = UI.matcolorScheme[pixelColor].split(',');
                            UI.canvasColorPickerScheme(colors);
                        }
                    } else {
                        if (_y < 27) {
                            UI.generateColorShades(pixelColor);
                        }
                    }
                } else if (canvasId == "cvs") {
                    UI.generateSelectedColorShades(pixelColor);
                }

                if (pixelColor.toLowerCase() == "#0000ffff") {
                    $("#previewcanvascolorpicker").addClass("evo-transparent");
                } else {
                    $("#previewcanvascolorpicker").removeClass("evo-transparent");
                }

            }
        },
        getSampledFontGradient: function (pixelColor) {
            var textdraw = WPImager.layer[WPImager.current];
            var fontgradient = (textdraw.fontgradient.length > 0) ? textdraw.fontgradient : "0% " + textdraw.fontcolor;

            var points = new Array();
            points = WPImagerUI.getGradientFromString(fontgradient);
            fontgradient = "";
            $.each(points, function (i, el) {
                if (!isNaN(parseInt(el[0]))) {
                    var color = el[1];
                    if (color.toLowerCase() == "#0000ffff")
                        color = "transparent";
                    var colorpoint = parseInt($("#canvascolorpicker_point").val());
                    if (i == colorpoint) {
                        fontgradient += (fontgradient == "" ? "" : ",") + parseInt(el[0]) + "% " + pixelColor;
                    } else {
                        fontgradient += (fontgradient == "" ? "" : ",") + parseInt(el[0]) + "% " + color;
                    }
                }
            });
            return fontgradient;
        },
        getSampledBackGradient: function (pixelColor) {
            var textdraw = WPImager.layer[WPImager.current];
            var backgradient = (textdraw.backgradient.length > 0) ? textdraw.backgradient : "0% " + textdraw.backcolor;

            var points = new Array();
            points = WPImagerUI.getGradientFromString(backgradient);
            backgradient = "";
            $.each(points, function (i, el) {
                if (!isNaN(parseInt(el[0]))) {
                    var color = el[1];
//                    if (color.toLowerCase() == "#0000ffff")
//                        color = "transparent";
//                    if (pixelColor.toLowerCase() == "#0000ffff")
//                        pixelColor = "transparent";
                    var colorpoint = parseInt($("#canvascolorpicker_point").val());
                    if (i == colorpoint) {
                        backgradient += (backgradient == "" ? "" : ",") + parseInt(el[0]) + "% " + pixelColor;
                    } else {
                        backgradient += (backgradient == "" ? "" : ",") + parseInt(el[0]) + "% " + color;
                    }
                }
            });
            return backgradient;
        },
        pickCanvasColor: function (selector) {
            if (selector.length == 0)
                return;
            var pixelColor = "";
            if (selector == "fontcolor") {
                pixelColor = this.layer[this.current].fontcolor;
            } else if (selector == "backcolor") {
                pixelColor = this.layer[this.current].backcolor;
            } else if (selector == "outlinecolorText") {
                pixelColor = this.layer[this.current].textoutlinecolor;
            } else if (selector == "bordercolorText" || selector == "bordercolorText2") {
                pixelColor = this.layer[this.current].textbordercolor;
            } else if (selector == "bordergapcolor") {
                pixelColor = this.layer[this.current].bordergapcolor;
            } else if (selector == "fontgradient") {
                var fontgradient = this.layer[this.current].fontgradient;
                $('.fontgradient').ClassyGradient({
                    gradient: fontgradient
                });
            } else if (selector == "copicker") {
                var backgradient = this.layer[this.current].backgradient;
                $('.gradient').ClassyGradient({
                    gradient: backgradient
                });
            } else if (selector == "shadowcolorTextFill") {
                pixelColor = this.layer[this.current].textshadowfillcolor;
            } else if (selector == "shadowcolorText") {
                pixelColor = this.layer[this.current].textshadowcolor;
            } else if (selector == "bordercolorImage") {
                pixelColor = this.layer[this.current].imgbordercolor;
            } else if (selector == "shadowcolorImage") {
                pixelColor = this.layer[this.current].imgshadowcolor;
            }
            if (pixelColor !== "") {
                $("#" + selector).colorichpicker({color: pixelColor});
                if (selector == "fontcolor") {
                    $("#fontcolor3").colorichpicker({color: pixelColor});
                }
            }

        },
        cancelCanvasColor: function (selector) {
            if (selector == "fontcolor") {
                this.layer[this.current].fontcolor = $("#canvascolorpicker_ori").val();
                $("#txtconsole").show();
            } else if (selector == "backcolor") {
                this.layer[this.current].backcolor = $("#canvascolorpicker_ori").val();
                $("#txtconsole").show();
            } else if (selector == "outlinecolorText") {
                this.layer[this.current].textoutlinecolor = $("#canvascolorpicker_ori").val();
            } else if (selector == "bordercolorText" || selector == "bordercolorText2") {
                this.layer[this.current].textbordercolor = $("#canvascolorpicker_ori").val();
            } else if (selector == "bordergapcolor") {
                this.layer[this.current].bordergapcolor = $("#canvascolorpicker_ori").val();
            } else if (selector == "fontgradient") {
                this.layer[this.current].fontgradient = $("#canvascolorpicker_ori").val();
                $('.fontgradient').ClassyGradient({
                    gradient: this.layer[this.current].fontgradient
                });
            } else if (selector == "copicker") {
                this.layer[this.current].backgradient = $("#canvascolorpicker_ori").val();
                $('.gradient').ClassyGradient({
                    gradient: this.layer[this.current].backgradient
                });
            } else if (selector == "shadowcolorTextFill") {
                this.layer[this.current].textshadowfillcolor = $("#canvascolorpicker_ori").val();
            } else if (selector == "shadowcolorText") {
                this.layer[this.current].textshadowcolor = $("#canvascolorpicker_ori").val();
            } else if (selector == "bordercolorImage") {
                this.layer[this.current].imgbordercolor = $("#canvascolorpicker_ori").val();
            } else if (selector == "shadowcolorImage") {
                this.layer[this.current].imgshadowcolor = $("#canvascolorpicker_ori").val();
            }
            $('#canvascolorpickerconsole').hide();
            $("#" + selector).colorichpicker({color: $("#canvascolorpicker_ori").val()});

        },
        selectToolbar: function (index)
        {
            this.layer[index].selectToolbar();
        },
        countLayers: function (code)
        {
            var total = 0;
            code = (typeof code === "undefined" ? "" : code);

            var arrIndex = WPImager.canvas.arrIndex;
            for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                var layer = arrIndex[ix];
                if (this.layer[layer].disposed == 0) {
                    if (code.length == 0) {
                        total++;
                    } else if (this.layer[layer].code == code) {
                        total++;
                    }
                }
            }
            return total;
        },
        insertAtCaret: function (areaId, text) {
            var txtarea = document.getElementById(areaId);
            var scrollPos = txtarea.scrollTop;
            var strPos = 0;
            var br = ((txtarea.selectionStart || txtarea.selectionStart === '0') ?
                    "ff" : (document.selection ? "ie" : false));

            if (br === "ie") {
                txtarea.focus();
                var range = document.selection.createRange();
                range.moveStart('character', -txtarea.value.length);
                strPos = range.text.length;
            } else if (br === "ff")
                strPos = txtarea.selectionStart;

            var front = (txtarea.value).substring(0, strPos);
            var back = (txtarea.value).substring(strPos, txtarea.value.length);
            txtarea.value = front + text + back;
            strPos = strPos + text.length;

            if (br === "ie") {
                txtarea.focus();
                var range = document.selection.createRange();
                range.moveStart('character', -txtarea.value.length);
                range.moveStart('character', strPos);
                range.moveEnd('character', 0);
                range.select();
            } else if (br === "ff") {
                txtarea.selectionStart = strPos;
                txtarea.selectionEnd = strPos;
                txtarea.focus();
            }

            txtarea.scrollTop = scrollPos;
            $("#txt" + this.current.toString() + " .tlcontent").html(input.value);
            txtarea.focus();
        },
        versionCompare: function (left, right) {
            if (typeof left + typeof right != 'stringstring')
                return -1;

            var a = left.split('.')
                    , b = right.split('.')
                    , i = 0, len = Math.max(a.length, b.length);

            for (; i < len; i++) {
                if ((a[i] && !b[i] && parseInt(a[i]) > 0) || (parseInt(a[i]) > parseInt(b[i]))) {
                    return 1;
                } else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || (parseInt(a[i]) < parseInt(b[i]))) {
                    return -1;
                }
            }

            return 0;
        },
        startCursor: function () {
            UI.blink.state = UI.blink.INIT;
            WPImagerUI.blinkCursor();
        },
        getstr: function (strval, defaultval) {
            if (typeof strval === "undefined" || strval == null) {
                return defaultval;
            }
            return strval;
        },
        getval: function (val, defaultval) {
            if (typeof val === "undefined" || val == null) {
                return defaultval;
            }
            return val;
        },
        componentToHex: function (c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        },
        isJSON: function (str) {
            try {
                var obj = JSON.parse(str);
                return !!obj && typeof obj === 'object';
            } catch (e) {
            }
            return false;
        },
        sortObject: function (o) {
            try {
                var sorted = {},
                        key, a = [];

                for (key in o) {
                    if (o.hasOwnProperty(key)) {
                        a.push(key);
                    }
                }

                a.sort(function (a, b) {
                    return a.toLowerCase().localeCompare(b.toLowerCase());
                });

                for (key = 0; key < a.length; key++) {
                    sorted[a[key]] = o[a[key]];
                }
                return sorted;
            } catch (e) {
                return {};
            }
        }
    };


})(jQuery);