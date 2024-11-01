/*!
 WPImager 1.0.0
 https://wpimager.com/
 2018 WPImager  
 */


jQuery(function ($) {
    var canvas_id = parseInt($("#canvas_id").val());
    $('body').on('click', function () {
        closeFontsMore();
    });


    // cancel download by user
    $('#xhr-abort-download, #xhr-close-download').click(function () {
        $('#downloadProgressWrap').hide();
        if (typeof UI.xhr["print"] !== "undefined")
            UI.xhr["download"].abort();
        $("#downloadcanvas").removeClass("disabled");
    });



    // cancel print canvas by user
    $('#xhr-abort-print, #xhr-close-print').click(function () {
        $('#printProgressWrap').hide();
        if (typeof UI.xhr["print"] !== "undefined")
            UI.xhr["print"].abort();
    });



    $('.clearoffset').change(function () {
        WPImager.saveCurrLayerOffset(0, 0);
        WPImager.saveCurrLayerToolText();
        draw();
    });


    $("#toolImage > .btn-group > .btn").click(function (e) {
        e.stopImmediatePropagation();
        $("#toolImage > .btn-group > .btn").removeClass("active");
        $("#toolImage > .btn-group > .btn").removeClass("focus");
    });


    // undo redo last recorded action on canvas
    $("#undo, #redo").click(function (e) {
        var cW_old = WPImager.slides[WPImager.slide].canvas_width;
        var cH_old = WPImager.slides[WPImager.slide].canvas_height;
        var imglayer = {};
        UI.isUndoRedoing = true;
        WPImager.clearMultiLayers();
        if (WPImager.hasUploading()) {
            WPImager.clearUploadingFlags();
        }

        // store old image layers sizes before undo / redo
        var arrIndex = WPImager.canvas.arrIndex;
        for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
            var i = arrIndex[ix];
            if (WPImager.layer[i].code == UI.LAYER.IMAGE) {
                imglayer[i] = {};
                imglayer[i].imgwidth = WPImager.layer[i].imgwidth;
                imglayer[i].imgheight = WPImager.layer[i].imgheight;
                imglayer[i].src = WPImager.layer[i].src;
                imglayer[i].imgradius = WPImager.layer[i].imgradius;
                imglayer[i].imgblur = WPImager.layer[i].imgblur;
            }
        }


        if (this.id == "undo") {
            UndoRedo.undo();
        } else if (this.id == "redo") {
            UndoRedo.redo();
        }

        if (typeof WPImager.layer[WPImager.current] === "undefined")
            WPImager.selectLayerTop();
        else if (WPImager.layer[WPImager.current].disposed > 0)
            WPImager.selectLayerAdjacent(WPImager.current);

        // rebuild canvas.arrIndex
        WPImager.canvas.arrIndex.length = 0;
        for (var k in WPImager.layer) {
            var index = parseInt(k);
            if (WPImager.layer.hasOwnProperty(k) && index > 0) {
                if (WPImager.layer[index].disposed == 0) {
                    WPImager.canvas.arrIndex.push(index);
                }
            }
        }


        var UI_console_shape = UI.console_shape; // 
        UI.isPrinting = true;
        WPImager.clearUploadingFlags();  // clear upload flag after redo undo
        SlideAction.loadSlide(WPImager.slide);
        WPImager.slides[WPImager.slide].highlightUsedInSlides();
        setTimeout(function () {
            WPImager.rebuildToolLayers();
            //            WPImager.recalculateLayersOrder();
            if (UI.console == UI.CNSL.SHAPETOOLBAR) {
                if (UI_console_shape == UI.CNSL.SHAPETOOLEDIT) {
                    WPImager.selectLayer(WPImager.current);
                    setTimeout(function () {
                        $("#shape_mode_edit").click();
                    }, 50);
                } else {
                    WPImager.selectLayer(WPImager.current);
                    $("#shape_mode_move").click();
                }
                WPImager.layer[WPImager.current].controlUpdate();
            } else if (UI.console == UI.CNSL.TXTCURVED) {
                if (UI_console_shape == UI.CNSL.SHAPETOOLEDIT) {
                    UI.console_shape = UI_console_shape;
                    WPImager.layer[WPImager.current].refreshEdgeHandlers();
                }
                WPImager.layer[WPImager.current].controlUpdate();
//                } else {
//                    WPImager.selectLayer(WPImager.current);
            }
            WPImager.refreshIconVisible();
            WPImager.refreshIconLock();
            UI.isPrinting = false;
            WPImager.selectLayer(WPImager.current);
            draw();
        }, 10);

        $(".toolslide").removeClass("active");
        $("#act" + WPImager.slide.toString()).addClass("active selected");
        $("#toolboxLayerSortable").scrollTop(0);

        // Resize image only if size is different before undo redo.
        var arrIndex = WPImager.canvas.arrIndex;
        for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
            var i = arrIndex[ix];
            if (WPImager.layer[i].slide == WPImager.slide
                    && WPImager.layer[i].code == UI.LAYER.IMAGE) {
                if (typeof imglayer[i] === "undefined") {
                    // image not loaded yet
                    WPImagerUI.loadImageShow(i, WPImager.layer[i].src);
                } else if (imglayer[i].src != WPImager.layer[i].src) {
                    WPImagerUI.loadImageShow(i, WPImager.layer[i].src);
                } else {
                    var boolResize = (typeof imglayer[i] !== "undefined");
                    if (boolResize) {
                        if (imglayer[i].imgwidth == WPImager.layer[i].imgwidth &&
                                imglayer[i].imgheight == WPImager.layer[i].imgheight &&
                                imglayer[i].imgradius == WPImager.layer[i].imgradius &&
                                imglayer[i].imgblur == WPImager.layer[i].imgblur &&
                                imglayer[i].src == WPImager.layer[i].src) {
                            boolResize = false;
                        }
                    }
                    if (boolResize)
                    {
                        WPImager.layer[k].flagresize = true;
                        //                        WPImagerUI.resize_image(i);
                    }
                }
            }
        }
        UI.isDrawing = false;
        WPImagerUI.flagCanvasDirty();
        UI.isUndoRedoing = false;
        if (!UndoRedo.hasUndo())
            $("#undo").addClass("disabled");
        if (WPImager.layer[WPImager.current].code == UI.LAYER.IMAGE) {
            WPImagerUI.resize_image(WPImager.current);
        }
        draw();

        // check if there is a canvas size change
        if (cW_old !== WPImager.slides[WPImager.slide].canvas_width
                || cH_old !== WPImager.slides[WPImager.slide].canvas_height) {
//            UI.resizeCVS = true;
//            UI.expectResizeCVS = -1;
//            UI.console = UI.CNSL.RESIZECVS;
        } else if (cW_old == WPImager.slides[WPImager.slide].canvas_width
                && cH_old == WPImager.slides[WPImager.slide].canvas_height
                ) {
            UI.resizeCVS = false;
            UI.expectResizeCVS = -1;
            if (UI.console == UI.CNSL.RESIZECVS) {
                UI.console = -1;
            }
        }
        WPImager.updateLayerTab();
        WPImagerUI.dockToolLayers();
        //       WPImagerUI.zoomCanvas(100);
    });





    /****** void main() *****/
    // initialize controls 
    WPImagerCtrls.initCanvasControls();
    WPImagerCtrls.initTextControls();
    WPImagerCtrls.initTextConsoles();
    WPImagerCtrls.initImageControls();
    WPImagerCtrls.initImageConsoles();
    WPImagerCtrls.initToolLayerControls();
    WPImagerCtrls.initSideMenu();

    if (screen.width < 860) {
        $("#loader_wrapper").hide();
        $("#wpimager_err_screen_width").show();
    }

    window.onresize = function (event) {
        WPImagerUI.dockToolLayers();
        var TB_WIDTH = $(window).width() - 60,
                TB_HEIGHT = $(window).height() - 60; // set the new width and height dimensions here..
        $("#TB_window").css({
            marginLeft: '-' + parseInt((TB_WIDTH / 2), 10) + 'px',
            width: TB_WIDTH + 'px',
            height: TB_HEIGHT + 'px',
            marginTop: '-' + parseInt((TB_HEIGHT / 2), 10) + 'px'
        });
        $("#TB_ajaxContent").css({width: '100%', padding: '0'});
        $("#TB_container,#TB_ajaxContent,#TB_uploader").height(TB_HEIGHT - 130);
        $("#TB_container").width(TB_WIDTH - 240);
        $("#media_selected_panel").css({top: $("#TB_title").css("height")});
        $("#media_selected_panel").height($("#TB_container").height());
        if (iframe_open) {
            $("#toolBox").hide();
        }
        WPImagerUI.dockToolLayers();
        UI.canvasColorPicker();
    };
    if (!is_frontend) {
        $("#header,#footer-wrap").css("min-width", "860px");
    }


    $(function () {
        $('#cvs').trigger('init.addon.console');
        // fetch canvas 
        $.ajax({
            type: 'POST',
            url: ajaxurl,
            data: {action: 'loadcanvas', canvas_id: canvas_id, _wpnonce: $("#nonce").val()
            },
            dataType: 'json',
            cache: false,
            success: function (data) {
                if (!data.success) {
                    $('#dialog-error-message-data').text(data.message);
                    $('#dialog-error-message').modal('show');
                    $("#loader_wrapper,#workarea_top,#workarea_bottom,.loader").hide();
                    return;
                }
                // preliminary check on canvas and layers data
                if (!WPImager.isJSON(data.cloudcanvas) || !WPImager.isJSON(data.cloudlayers)) {
                    $("#workarea_top,#workarea_bottom,.loader").hide();
                    $("#onloadError_CanvasData").show();
                    $("#txt_debug").val(data.cloudcanvas + "\n" + data.cloudlayers);
                    $("#txt_debug").css("width", "50%").height(200);
                    return;
                }
                WPImager.init(canvas_id, data);

                if (WPImager.versionCompare(wpimager_version, WPImager.canvas.version) < 0)
                {
                    $("#loader_wrapper,#workarea_top,#workarea_bottom,.loader").hide();
                    $(".version").text(wpimager_version);
                    $(".version_required").text(WPImager.canvas.version);
                    $("#onloadError").show();
                    $("#wpimager-editor").css("min-width", "100%");
                    return;
                } else {
                    // plugin version is equal or later than canvas
                    WPImager.canvas.version = wpimager_version; // update version number
                }
                WPImager_Startup();
            }
        }); // end of .ajax
    });

    $("#cmdProceedAnyway").click(function () {
        if (autosave)
        {
            $('#dialog-error-message-data').text("Proceed loading canvas with autosave disabled.");
            $('#dialog-error-message').modal('show');
        }
        $("#onloadError").hide();
        WPImager.canvas.version = wpimager_version; // update version number
        WPImager_Startup();
    });

    function WPImager_Startup() {
        WPImager.loadGoogleFonts();
        WPImager.refreshIconVisible();
        WPImager.refreshIconLock();
        UI.boot();

        // required early - Undo savestate
        var firstSlide = $('#toolSlidesSortable > div.toolslide').first().data("var-index");
        SlideAction.startupSlide(WPImager.canvas.slide, firstSlide);

        setTimeout(function () {

            UI.iconpicker_insertchar = 1;
            UI.flagDirty = false;

            if (UndoRedo.hasLastSav() && UndoRedo.countUndo() > 0) {

            } else {
                UndoRedo.save();
            }

            $("#undo,#redo").removeClass("disabled btn-grayed").addClass("btn-default");
            if (!UndoRedo.hasUndo())
                $("#undo").addClass("disabled");
            if (!UndoRedo.hasRedo())
                $("#redo").addClass("disabled");

            if (autosave) {
                WPImagerCtrls.autosave_canvas();
            }
            WPImager.canvas.tlPosition = WPImager.canvas.tlPosition % 3;

            setTimeout(function () {
                $(".onloadShow").show();
                $(".onloadHide").hide();
                UI.comSlideRenderCanvas = true;
                draw(); // !requred
                UI.comSlideRenderCanvas = false;
                WPImagerUI.dockToolLayers(); // !requred twice
                WPImagerUI.dockToolLayers();
            }, 100);

            WPImagerUI.firstDraw();

            var drawTimeOutHandle;
            // redraw canvas when fonts in layers loads
            var arrIndex = WPImager.canvas.arrIndex;
            for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                var i = arrIndex[ix];
                if (WPImager.layer[i].code == UI.LAYER.TEXT && WPImager.layer[i].disposed == 0) {
                    if (typeof SF === "undefined")
                        SF = {};
                    var font = WPImager.layer[i].fontfamily;
                    if (font.length == 0) {
                        WPImager.layer[i].fontfamily = 'Lato';
                    } else if (font === "FontAwesome") {
                        // skip
                    } else if (typeof SF[font] === "undefined") {
                        SF[font] = 1;
                        fontSpy(font, {
                            timeOut: 15000,
                            delay: 400,
                            success: function () {
                                clearTimeout(drawTimeOutHandle);
                                drawTimeOutHandle = setTimeout(function () {
                                    draw();
                                }, 50);
                            },
                            retry: function () {
                                clearTimeout(drawTimeOutHandle);
                                drawTimeOutHandle = setTimeout(function () {
                                    draw();
                                }, 50);
                            }
                        });
                    }
                }
            }

            $.get(wpimager_upload_url + '/IMG' + WPImager.canvas.id.toString() + '_thumb.png')
                    .done(function () {
                        // thumbnail found
                    }).fail(function () {
                // Image doesn't exist - do something else.
                WPImager.postthumbnail();
            });

            var firstSlide = $('#toolSlidesSortable > div.toolslide').first().data("var-index");
            WPImager.boot = 1;
            SlideAction.startupSlide(WPImager.canvas.slide, firstSlide);
            $('#cvs').trigger('wpimager.boot');


            if (UI.slide.slideMaxIndex > 0) {
                $("#viewActions").click();
            }
        }, 100);
    }


    // check if canvas is saved before quiting canvas
    $(window).bind('beforeunload', function () {
        if ($("#justunload").length == 0) {
            if (UI.flagDirty) {
                return "You have not saved your Canvas yet.";
            }
        }
    });

    // clear ctrl_pressed in case use ctrl-tab to switch windows
    $(window).on("blur focus", function (e) {
        UI.ctrl_pressed = false;
        UI.shift_pressed = false;
        draw();

    });

    $(window).bind('scroll', function () {
        if (WPImager.boot == 0)
            return;
        if ($("#wpimager_iframe").is(":visible"))
            return;
        var title_height = $("#pagetitle").outerHeight(true);
        if (WPImager.canvas.zoom == 0) {
            if ($(window).scrollTop() > title_height) {
                var tlPosition = WPImager.canvas.tlPosition;
                tlPosition = (UI.app === UI.APP.CANVAS) ? tlPosition : 3;
                $('#cvsbox_menu').addClass('fixed');
                if (tlPosition == 0 || tlPosition == 1) {
                    if (!$('#toolBox').hasClass('fixed')) {
                        $('#toolBox').addClass('fixed');
                    }
                    var maxheight = Math.min(document.documentElement.clientHeight, window.innerHeight || 0);
                    maxheight = maxheight - (title_height);
                    $("#toolBox").height(maxheight);
                    WPImagerUI.dockToolLayers();
                }
            } else {
                var maxheight = Math.min(document.documentElement.clientHeight, window.innerHeight || 0);
                // if ($("#toolBox").height() > maxheight) 
                maxheight = maxheight - (title_height - $(window).scrollTop()) - 4;
                {
                    $("#toolBox").height(maxheight);
                    WPImagerUI.dockToolLayers();

                }
                $('#cvsbox_menu,#toolBox').removeClass('fixed');
            }

            $('#canvas_slides').addClass('fixed');
            if ($(window).scrollTop() > 147 + title_height) {
                $('#canvas_slides').css("top", "0px");
            } else {
                $('#canvas_slides').css("top", (147 + title_height - $(window).scrollTop()).toString() + "px");
            }
            WPImagerUI.dockToolSlides();
        }
    });

});

