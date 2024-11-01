/*!
 WPImager 1.0.0    
 WPImager Init Object
 https://wpimager.com/
 2018 WPImager  
 */

var WPImagerCtrls;

(function ($) {

    WPImagerCtrls = {
        initCanvasControls: function () {

            $("#cvs").dblclick(function (e) {
                if (UI.resizeCVS) {
                    UI.resizeCVS = false;
                    UI.expectResizeCVS = -1;
                    UI.console = -1;
                    WPImager.updateLayerTab();
                    draw();
                    e.preventDefault();
                    return false;
                }

                if (UI.isCropping && WPImager.layer[WPImager.current].code == UI.LAYER.IMAGE) {
                    $("#cancelCropImage").click();
                } else if (UI.console == UI.CNSL.TXTCURVED && UI.console_shape == UI.CNSL.SHAPETOOLEDIT
                        && (WPImager.layer[WPImager.current].shape == UI.SHAPE.CURVEDTEXT)) {
                    UI.console_shape = UI.CNSL.SHAPETOOLMOVE;
                    $('[id^="curve_mode"]').removeClass("active");
                    $('#curve_mode_move').addClass("active");
                    WPImager.layer[WPImager.current].recalculateShapeContainer();
                    draw();
                } else if (UI.console == UI.CNSL.SHAPETOOLBAR && UI.console_shape == UI.CNSL.SHAPETOOLEDIT
                        && (WPImager.layer[WPImager.current].shape == UI.SHAPE.CUSTOM || WPImager.layer[WPImager.current].shape == UI.SHAPE.LINE)) {
                    $('#shape_mode_drawstop').click();
                } else if (WPImager.layer[WPImager.current].code == UI.LAYER.COM) {
                    if (e.originalEvent === undefined) {
                        // skip if programatically triggered
                    } else {
                        WPImager.layer[WPImager.current].showTextEdit();
                    }
                } else if (WPImager.layer[WPImager.current].code == UI.LAYER.TEXT
                        && WPImager.layer[WPImager.current].shape != UI.SHAPE.LINE) {

                    if (UI.console == UI.CNSL.TXTEDIT) {
                        // double click to select all text
                        $("#input").select();
                        UI.input.selection = [input.selectionStart, input.selectionEnd];
                        WPImagerUI.draw();
                        UI.input.selectionStart = -1;
                    } else {
                        $('#modeTextEdit').click();
                        UI.input.cursorPos = UI.input.CURSORPUT_MOUSECLICK; // indicate to UI to calculate cursor position from mouse x, y.
                        draw();
                        WPImager.startCursor();
                    }
                    UI.draggingMouse = false;
                }
                e.preventDefault();
                return false;
            });

            $("#cvsOutput").dblclick(function (e) {
                $("#cvs").dblclick();
            });
            /*
             $('#cvs').mousedown(function () {
             if (UI.console == UI.CNSL.SHAPETOOLBAR && UI.console_shape == UI.CNSL.SHAPETOOLDRAW) {
             return;
             }
             if (WPImager.layer[WPImager.current].shape != UI.SHAPE.LINE)
             return;
             // short click hold - simulate double click to edit text
             timeoutId = setTimeout(function () {
             if (!UI.draggingMouse) {
             $("#cvs").dblclick();
             }
             }, 700);
             }).bind('mouseup mousemove mouseleave', function () {
             if (typeof timeoutId !== "undefined")
             clearTimeout(timeoutId);
             });
             */
            /* Canvas spinners */
            $("#canvasHeight").spinner({
                min: 10,
                max: 8192,
                step: 1
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    $(this).spinner("value", WPImager.canvas.height);
                    // WPImagerUI.zoomCanvas($("#cvszoom").spinner("value"));
                    WPImagerUI.arrangeCanvaslayout();
                }
                WPImagerUI.flagCanvasSave();
            });

            $("#canvasWidth").spinner({
                min: 10,
                max: 8192,
                step: 1
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    $(this).spinner("value", WPImager.canvas.width);
                    // WPImagerUI.zoomCanvas($("#cvszoom").spinner("value"));
                }
            });

            $("#applyCustomCanvasSize").click(function () {
                WPImager.canvas.width = $("#canvasWidth").spinner("value");
                WPImager.canvas.height = $("#canvasHeight").spinner("value");
                if (WPImager.canvas.width > 800)
                    $("#content-main").css("width", WPImager.canvas.width.toString() + "px");
                else
                    $("#content-main").css("width", "800px");
                $("#canvas_top").css("width", $("#content-main").css("width"));
                WPImager.canvas.sizeLayout = "Custom Size";
                $("#currentSizeLayout").text(WPImager.canvas.width.toString() + 'x' + WPImager.canvas.height.toString());
                if ($("#chkScaleLayers2Canvas").is(':checked')) {
                    var scaleX = $("#canvasWidth").spinner("value") / WPImager.canvas.width;
                    var scaleY = $("#canvasHeight").spinner("value") / WPImager.canvas.height;
                    WPImagerUI.scaleCanvasLayers(scaleX, scaleY);
                }
                // WPImagerUI.zoomCanvas($("#cvszoom").spinner("value"));
                SlideAction.recCanvasSize();
                draw();
                draw();
                if (!UI.resizeCVS) {
                    WPImagerUI.flagCanvasSave();
                }
                WPImagerUI.arrangeCanvaslayout();
            });

            $("#closeCustomCanvasSize,#closeCustomCanvasSize2").click(function () {
//                $("#cvs").dblclick();
                $("#viewLayers").click();
//                WPImager.updateLayerTab();
            });

//            $("#cvszoom").spinner({
//                min: 25,
//                max: 100,
//                step: 1,
//                spin: function (event, ui) {
//                    if ($("#cvszoom").spinner("isValid")) {
//                        WPImagerUI.zoomCanvas($("#cvszoom").spinner("value"));
//                    }
//                },
//                stop: function (event, ui) {
//                    if ($("#cvszoom").spinner("isValid")) {
//                        WPImagerUI.zoomCanvas($("#cvszoom").spinner("value"));
//                    }
//                }
//            }).on('blur', function () {
//                if (!$(this).spinner("isValid")) {
//                    $(this).spinner("value", UI.scaleFactor * 100);
//                }
//            });


            $('#browseCanvasControls').click(function () {
                var height = $("#toolBox").height();
                $(this).parent().addClass("active");
                $(this).parent().siblings().removeClass("active");
                $(".toolboxLayersCom").hide();
                $("#toolCanvas").show(); // trigger mouse resize
                $("#toolBrowseStdBannersBtn,#toolBrowseCustomBtn,#toolBrowseSocialBtn,div.content-media-sizes a").removeClass("active");
                $("#toolBrowseCustomBtn").click();
                $("#warnCustomCanvasSize").toggle(WPImager.slides[WPImager.slide].mode == "kit");
                $("#warnScaleLayers2Canvas").toggle($("#chkScaleLayers2Canvas").is(":checked"));
//                $('#showResizeCanvasConsole').click();
                return false;
            });

            $("#chkScaleLayers2Canvas").change(function () {
                $("#warnScaleLayers2Canvas").slideToggle($("#chkScaleLayers2Canvas").is(":checked"));
            });


            $("#toolCanvas .header-media-sizes a").click(function (e)
            {
//            $(".content-media-sizes").slideUp();
                $(this).parent().next(".content-media-sizes").slideDown();
                e.preventDefault();
            });

            $('#toolBrowseCustomBtn').click(function () {
                $("#toolBrowseStdBannersBtn,#toolBrowseCustomBtn,#toolBrowseSocialBtn").removeClass("active");
                $("#toolBrowseSocial,#toolBrowseStdBanners").hide();
                $("#toolBrowseCustom").show();
                $("#toolBrowseCustom .content-media-sizes").slideDown();
            });


            $('#cancelcanvascolorpicker').click(function (e) {
                WPImager.cancelCanvasColor($("#canvascolorpicker_selector").val());
                $("#canvascolorpicker_selector").val("");
                draw();
            });
            $('#okcanvascolorpicker').click(function (e) {
                $('#canvascolorpickerconsole').hide();
                $("#canvascolorpicker_selector").val("");
                draw();
                WPImagerUI.flagCanvasSave();
            });

            $('#pickoncanvascolorpicker').click(function (e) {
                UI.pickonCanvas = !UI.pickonCanvas;
                $("#pickoncanvascolorpicker").removeClass("active");
                if (UI.pickonCanvas) {
                    $("#pickoncanvascolorpicker").addClass("active");
                }
                return false;
            });

            $('#showNilConsole').click(function () {
                UI.console = UI.CNSL.ZERO;
                $(".cvsconsole").hide();
                $("#nilconsole").show();
            });

            $('#showResizeCanvasConsole').click(function () {
                UI.console = UI.CNSL.RESIZECVS;
                WPImager.updateLayerTab();
            });

            $("#addColorPalette").click(function (e) {
                var text = $("#textColorPalette").val();
                var title = $("#textPaletteTitle").val();
                var _colors = text.split(',');
                var _palette = {title: '', palette: '', order: -1, disposed: 0};
                var colors = [];
                var invalidcolors = [];
                _palette.title = title;
                for (var i = 0; i < _colors.length; i++) {
                    var color1 = tinycolor(_colors[i]);
                    if (color1.isValid()) {
                        colors.push(color1.toHexString());
                    } else {
                        invalidcolors.push(_colors[i]);
                    }
                }
                if (invalidcolors.length > 0) {
                    $("#invalid-input-colors").show();
                    $("#invalid-input-colors").text('Invalid Color(s):' + invalidcolors.join(','));
                } else if (colors.length > 20) {
                    $("#invalid-input-colors").show();
                    $("#invalid-input-colors").text('Maximum 20 colors on a color palette.');
                } else if (colors.length > 0) {
                    _palette.palette = colors.join(',');
                    var index = parseInt($("#editPaletteIndex").val());
                    if (index >= 0) {
                        UI.colorpalette[index] = _palette;
                    } else {
                        UI.colorpalette.push(_palette);
                    }
                    WPImager.reorderColorPalettes();
                    WPImager.saveColorPalettes();
                }
            });


            $("#previewcanvascolorpicker").colorPicker({
                margin: '6px 0 0',
                animationSpeed: 0,
                opacity: false,
                renderCallback: function ($elm, toggled) {
                    if (UI.cpRenderCallback) {
                        var colors = this.color.colors; // the whole color object                    
                        var picked = '#' + colors.HEX; // $elm.attr("value");//
                        // picked = $elm.attr("value");
                        if (UI.validateColorHex(picked)) {
                            WPImager.applySampledColor($("#canvascolorpicker_selector").val(), picked);
                            UI.generateSelectedColorShades(picked);
                        }
                    } else {
                        UI.cpRenderCallback = true;
                    }
                },
                buildCallback: function (_colorPicker, _$UI) {

                    setTimeout(function () {
                        UI.builtTinyCP = true;
                    }, 200);
                    if (WPImager.canvas.cpPosition.left < 0) {
                        WPImager.canvas.cpPosition = $("#previewcanvascolorpicker").offset();
                        WPImager.canvas.cpPosition.top += 16;
                    }
                    $(".cp-color-picker").append('<div class="cp-color-picker-handle"><span class="fa fa-arrows"></span></div>');
                    $(".cp-color-picker").draggable({
                        handle: ".cp-color-picker-handle",
                        start: function () {
                            UI.cpDragging = true;
                        },
                        stop: function () {
                            WPImager.canvas.cpPosition = $(".cp-color-picker").offset();
                            UI.cpDragging = false;
                        }
                    });
                },
                positionCallback: function ($elm) {
                    var $UI = this.$UI, // this is the instance; this.$UI is the colorPicker DOMElement
                            position = WPImager.canvas.cpPosition, //$UI.offset(), //$elm.offset(), // $elm is the current trigger that opened the UI
                            gap = this.color.options.gap, // this.color.options stores all options
                            top = position.top,
                            left = position.left; // - 166 + 16;

                    // $UI.appendTo('#somwhereElse');
                    // do here your calculations with top and left and then...
                    return {// the object will be used as in $('.something').css({...});
                        left: left,
                        top: top
                    }
                }
            });


            $("#managecolorpalettes").click(function (e) {
                $("#color-palette-box").empty();
                var html = '<div class="palette-block-wrap unsortable" data-order="-2" data-index="-1"><a href="#" class="palette-block" data-index="-1">';
                for (var c = 0; c < UI.matcolors.length; c++) {
                    if (c == 0) {
                        html += '<span class="palette-title">Material Design</span>';
                    } else {
                        html += '<span class="palette-square" style="background-color:' + UI.matcolors[c] + '"></span>';
                    }
                }
                html += '</a></div>';

                for (var i = 0; i < UI.colorpalette.length; i++) {
                    if (UI.colorpalette[i].disposed !== 0) {
                        continue;
                    }
                    var palette = UI.colorpalette[i].palette;
                    var colors = palette.split(',');
                    var palettename = UI.colorpalette[i].title;
                    var order = UI.colorpalette[i].order;
                    html += '<div class="palette-block-wrap" data-order="' + order.toString() + '" data-index="' + i.toString() + '"><a href="#" class="palette-edit btn btn-xs btn-darkslate" data-index="' + i.toString() + '">Edit<a>';
                    html += '<a href="#" class="palette-block" data-index="' + i.toString() + '">';
                    for (var c = 0; c < colors.length; c++) {
                        if (c == 0) {
                            palettename = (palettename.trim().length == 0) ? '' : palettename;
                            html += '<span class="palette-title">' + palettename + '</span>';
                            html += '<span class="palette-action"></span>';
                        }
                        html += '<span class="palette-square" style="background-color:' + colors[c] + '"></span>';

                    }
                    html += '</a></div>';
                }
                $("#color-palette-box").html(html);
                $("#color-palette-box").sortable({
                    items: "div:not(.unsortable)",
                    update: function (event, ui) {
                        WPImager.reorderColorPalettes();
                        WPImager.saveColorPalettes();
                    }
                });
                var divList = $("#color-palette-box .palette-block-wrap");
                divList.sort(function (a, b) {
                    return parseInt($(a).data("order")) - parseInt($(b).data("order"));
                });
                $("#color-palette-box").html(divList);


                $("#dialog-color-palette .palette-list").show();
                $("#dialog-color-palette .palette-add").hide();
                $('#dialog-color-palette').modal('show');
                return false;
            });

            $("#color-palette-box").on("click", ".palette-block", function () {
                var index = $(this).data("index");
                UI.currentpalette = index;
                $('#dialog-color-palette').modal('hide');
                UI.canvasColorPicker();
            }).on("click", ".palette-edit", function () {
                var index = $(this).data("index");
                $("#editPaletteIndex").val(index);
                $("#textPaletteTitle").val(UI.colorpalette[index].title);
                $("#textColorPalette").val(UI.colorpalette[index].palette);
                $("#dialog-color-palette .palette-list,#invalid-input-colors,#cmdPaletteDeleteConfirm").hide();
                $("#dialog-color-palette .palette-add,#cmdPaletteDelete").show();
                return false;

            });

            $("#addNewColorPalette").click(function () {
                $("#textColorPalette").val('');
                $("#textPaletteTitle").val('');
                $("#editPaletteIndex").val("-1");
                $("#dialog-color-palette .palette-list,#invalid-input-colors,#cmdPaletteDelete,#cmdPaletteDelete,#cmdPaletteDeleteConfirm").hide();
                $("#dialog-color-palette .palette-add").show();
                return false;
            });

            $("#addColorPalette_cancel").click(function () {
                $("#dialog-color-palette .palette-add").hide();
                $("#dialog-color-palette .palette-list").show();
                return false;
            });

            $("#cmdPaletteDeleteConfirm").click(function () {
                var index = parseInt($("#editPaletteIndex").val());
                if (index >= 0) {
                    UI.colorpalette[index].disposed = 1;
                    if (UI.currentpalette == index) {
                        UI.currentpalette = -1;
                        UI.canvasColorPicker();
                    }
                    WPImager.reorderColorPalettes();
                    WPImager.saveColorPalettes();
                }
                $("#managecolorpalettes").click();
                return false;
            });

            $("#cmdPaletteDelete").click(function () {
                $("#cmdPaletteDelete").hide();
                $("#cmdPaletteDeleteConfirm").show();
                return false;
            });

        },
        initTextControls: function () {
            /*** text input events ***/
            input.onkeyup = function (e) { // keyup because we need to know what the entered text is.


                if (input.value.length !== WPImager.layer[WPImager.current].content.length) {
                    input.selectionEnd = input.selectionStart;
                    UI.input.selection[0] = input.selectionStart;
                    UI.input.selection[1] = input.selectionStart;
                    UI.input.cursorPos = input.selectionStart;
                } else {
                    if (UI.ctrl_pressed)
                    {
                        UI.input.selection[0] = input.selectionStart;
                        UI.input.selection[1] = input.selectionEnd;
                        UI.input.cursorPos = input.selectionStart;
                    } else {

                        input.selectionStart = UI.input.selection[0];
                        input.selectionEnd = UI.input.selection[1];
                    }

                }

                WPImager.saveCurrLayerContent();
                $("#txt" + WPImager.current.toString() + " .tlcontent").html(input.value);
                draw();
            };


            $('#input').on('blur', function (e) {
                setTimeout(function () {
                    if (UI.console == UI.CNSL.TXTEDIT) {
                        UI.console = UI.CNSL.TXTTOOLBAR;
                        $("#modeTextEdit,#modeTextEdit2").removeClass("active");
                    } else if (UI.console == UI.CNSL.TXTEDITRETURN) {
                        UI.console = UI.CNSL.TXTEDIT;
                    }
                    draw();
                }, 100);
                if (WPImager.current > 0) {
                    WPImagerUI.flagCanvasSave();
                }
                draw();
            });

            $('#input').bind('focusin focus', function (e) {
                // prevent scrolling when textarea is focused
                e.preventDefault();
            });

            $('#iconpicker').on('change', function (e) {
                if (e.icon == null) {
                    return;
                }
                if (UI.iconpicker_insertchar == 0) // prevent false event
                    return;
                var character = window.getComputedStyle(
                        document.querySelector('.popover-content .table-icons .' + e.icon), ':before'
                        ).getPropertyValue('content');
                if (UI.FaReplaceText) {
                    if (character.length === 3) {
                        input.value = character[1];
                    } else {
                        input.value = character;
                    }
                    $("#txt" + WPImager.current.toString() + " .tlcontent").html(input.value);

                } else {
                    if (character.length === 3)
                        WPImager.insertAtCaret('input', character[1]);
                    else
                        WPImager.insertAtCaret('input', character);
                }
                WPImager.saveCurrLayerContent();
                draw();
                WPImagerUI.flagCanvasSave();
            });

            $('#addFontawesome').on('change', function (e) {
                if (e.icon == null) {
                    return;
                }
                if (UI.iconpicker_insertchar == 0) // prevent false event
                    return;
                var character = window.getComputedStyle(
                        document.querySelector('.table-icons .' + e.icon), ':before'
                        ).getPropertyValue('content');
                if (character.length === 3)
                    WPImager.insertAtCaret('input', character[1]);
                else
                    WPImager.insertAtCaret('input', character);
                WPImager.saveCurrLayerContent();
                draw();
                WPImagerUI.flagCanvasSave();
            });

            $("#addFontawesome").click(function (e) {
                var height = $("#toolBox").height();
                $(this).parent().addClass("active");
                $(this).parent().siblings().removeClass("active");
                $(".toolboxLayersCom").hide();
                $("#toolboxLayerFontawesome").show();
                // $("#toolBox").height(height);
                //    return false;
            });

            $('#iconpicker2').on('change', function (e) {
                if (e.icon == null) {
                    return;
                }
                if (UI.iconpicker_insertchar == 0) // prevent false event
                    return;
                var content = $("#input2").val();
                var fontfamily = $("#fontfamily2").val();
                $("#input2").val(".");
                $("#fontfamily2").val("FontAwesome");
                WPImager.addTextLayer(UI.lastfontselected);
                $("#input2").val(content);
                $("#fontfamily2").val(fontfamily);
                $("#input").val(""); // clear content
                var character = window.getComputedStyle(
                        document.querySelector('#iconpicker2 .table-icons .' + e.icon), ':before'
                        ).getPropertyValue('content');
                if (character.length === 3)
                    WPImager.insertAtCaret('input', character[1]);
                else
                    WPImager.insertAtCaret('input', character);
                content = $("#input").val();
                WPImager.layer[WPImager.current].fontfamily = "FontAwesome";
                WPImager.layer[WPImager.current].fontsrctype = 0;
                WPImager.layer[WPImager.current].fontsize = 32;
                WPImager.layer[WPImager.current].content = content;
                WPImager.layer[WPImager.current].width = WPImager.layer[WPImager.current].fontsize * 2;
                WPImager.layer[WPImager.current].height = WPImager.layer[WPImager.current].fontsize * 2;
                WPImager.layerCenterView(WPImager.current)
                WPImager.selectLayer(WPImager.current);
                draw();
                WPImagerUI.flagCanvasSave();
                $("#toolboxLayersMenu,#toolboxLayerSortableWrap,#iconpicker").show();
                $("#toolboxLayerFontawesome").hide();
                $("#toolboxLayerSortable").scrollTop(0);
            });

            // add line layer
            $("#addLineLayer").click(function (e) {
                var height = $("#toolBox").height();
                UI.isCropping = false;
                UI.pathPointNew = "";
                UI.console = UI.CNSL.SHAPETOOLBAR;
                UI.console_shape = UI.CNSL.SHAPETOOLNEWLINE;

                $(this).parent().addClass("active");
                $(this).parent().siblings().removeClass("active");
                $(".toolboxLayersCom").hide();
                $("#toolboxLayerDrawLine").show();
                // $("#toolBox").height(height);
                draw();
                return false; // important

            });

            // call off draw line or custom draw 
            $("body").click(function (e) {
                var target = e.target || e.srcElement;

                if (["toolBrowseCustomBtn", "toolBrowseStdBannersBtn", "toolBrowseSocialBtn"].indexOf(target.id) > -1) {
                    // skip
                    if (UI.console == UI.CNSL.SHAPETOOLBAR
                            && (UI.console_shape == UI.CNSL.SHAPETOOLNEW || UI.console_shape == UI.CNSL.SHAPETOOLNEWLINE)) {
                        UI.pathPointNew = "";
                        WPImager.selectLayer(WPImager.current); // cancel new line/shape
                        $("#showCanvasControls").click();
                    }
                    return true;
                }
                if (UI.console == UI.CNSL.SHAPETOOLBAR
                        && (UI.console_shape == UI.CNSL.SHAPETOOLNEW || UI.console_shape == UI.CNSL.SHAPETOOLNEWLINE)) {
                    if ($("#toolBox").has(target).length) {
                        UI.pathPointNew = "";
                        WPImager.selectLayer(WPImager.current);  // cancel new line/shape
                        return false;
                    }
                } else if ($("#toolBox").has(target).length) {
                    if ($("#toolboxMainButtons").has(target).length) {
                        if (UI.console == UI.CNSL.SHAPETOOLBAR
                                && (UI.console_shape == UI.CNSL.SHAPETOOLNEW || UI.console_shape == UI.CNSL.SHAPETOOLNEWLINE)) {
                            UI.pathPointNew = "";
                            WPImager.selectLayer(WPImager.current);  // cancel new line/shape
                            draw();
                        }
                        return false;
                    } else if (["span", "label", "a"].indexOf(target.tagName.toLowerCase()) > -1) {
                        // accept polygon label buttons, hyperlinks
                    } else if (["submit_search", "filter_photos", "filter_cliparts", "filter_horizontal", "filter_vertical"].indexOf(target.id) == -1) {
                        return false;
                    }
                }

                if (target.tagName.toLowerCase() !== "canvas") {
                    if (UI.console == UI.CNSL.SHAPETOOLBAR
                            && (UI.console_shape == UI.CNSL.SHAPETOOLNEW || UI.console_shape == UI.CNSL.SHAPETOOLNEWLINE)) {
                        UI.pathPointNew = "";
                        WPImager.selectLayer(WPImager.current);
                        draw();
                        $("#viewLayers").click();
                    }
                }
            });

            $("#viewLayers").click(function (e) {
                $(".toolboxLayersCom").hide();
                $(this).parent().addClass("active");
                $(this).parent().siblings().removeClass("active");
                $("#toolboxLayersMenu,#toolboxLayersSortableWrap").hide();
                $("#toolboxLayersMenu,#toolboxLayerSortableWrap").show();
                return false;
            });


            $('#iconpicker2').iconpicker({
                cols: 5,
                icon: 'fa-keyboard-o',
                iconset: 'fontawesome',
                labelHeader: '{0} of {1} pages',
                labelFooter: '{0} - {1} of {2} icons',
                placement: 'bottom', // Only in button tag
                rows: 6,
                search: true,
                searchText: 'Search',
                selectedClass: 'btn-success',
                arrowNextIconClass: 'fa fa-arrow-right',
                arrowPrevIconClass: 'fa fa-arrow-left',
                unselectedClass: ''
            });

            $('#txt_align_left, #txt_align_right, #txt_align_center').click(function () {
                var id = $(this).attr("id");
                var align = id.replace(/txt_align_/gi, "");

                WPImager.setMultiLayerText("align", align, true);
                WPImagerUI.flagCanvasSave();
                draw();
            });

            $('#txt_valign_top, #txt_valign_middle, #txt_valign_bottom').click(function () {
                var id = $(this).attr("id");
                var valign = id.replace(/txt_valign_/gi, "");

                WPImager.setMultiLayerText("valign", valign, true);
                WPImagerUI.flagCanvasSave();
                draw();
            });

            $("#bold").click(function (e) {
                WPImager.toggCurrLayerBold();
                WPImager.setMultiLayerText("bold", WPImager.layer[WPImager.current].bold);
                draw();
                WPImagerUI.flagCanvasSave();
                $("#txtFontWeight").text(WPImager.layer[WPImager.current].bold ? '700' : '400');
                var _variants = $("#fontweight-list").data("variants");
                WPImager.addFontLinkTag(WPImager.current, _variants);
            });
            $("#italic").click(function (e) {
                WPImager.toggCurrLayerItalic();
                WPImager.setMultiLayerText("italic", WPImager.layer[WPImager.current].italic);
                draw();
                WPImagerUI.flagCanvasSave();
            });

            $("#fontweight-list").on("click", ".fontweight-menu", function () {
                var weight = $(this).data("value");
                var _variants = $("#fontweight-list").data("variants");

                WPImager.layer[WPImager.current].fontweight = parseInt(weight);
                WPImager.addFontLinkTag(WPImager.current, _variants);
                $("#txtFontWeight").text(weight.toString());
                // bold button
                if (WPImager.layer[WPImager.current].fontweight == 700) {
                    $("#bold").addClass("active");
                } else {
                    $("#bold").removeClass("active");
                }
                $("#fontweight-wrapper").removeClass("open");
                draw();
                WPImagerUI.flagCanvasSave();
                return false;
            });

            $("#fontfamily").change(function (e, font, srctype) {
                if (srctype == 10) {
                    $("#fontfamily").val(WPImager.layer[WPImager.current].fontfamily);
                    setTimeout(function () {
                        WPImagerCtrls.editor_addGoogleFonts();
                    }, 100);
                    return false;
                }
                $("#input").css("font-size", "1em");
                UI.iconpicker_insertchar = 0;
                $('.iconpickers').hide();
                if ($("#fontfamily").val() == "FontAwesome") {
                    $("#input").css("font-family", "FontAwesome");
                    $("#txt" + WPImager.current.toString() + " .tlcontent").css("font-family", "FontAwesome");
                    var idpicker = WPImagerUI.convertToSlug("icp-" + $("#fontfamily").val());
                    if (!$('#iconpicker').hasClass(idpicker)) {
                        $('#iconpicker').append('<button id="' + idpicker + '" class="btn btn-default btn-sm iconpickers"></button>');
                        $('#' + idpicker).iconpicker({
                            cols: 5,
                            icon: 'fa-keyboard-o',
                            iconset: 'fontawesome',
                            labelHeader: '{0} of {1} pages',
                            labelFooter: '{0} - {1} of {2} icons',
                            placement: 'bottom', // Only in button tag
                            rows: 10,
                            search: true,
                            searchText: 'Search',
                            selectedClass: 'btn-success',
                            arrowNextIconClass: 'fa fa-arrow-right',
                            arrowPrevIconClass: 'fa fa-arrow-left',
                            unselectedClass: ''
                        }).on('shown.bs.popover', function () {
                            $('.popover-content .table-icons > thead').append('<tr style="display: table-row;"><td colspan="5" style="padding-bottom:4px"><input type="checkbox" id="chkFaReplaceText" style=""><label for="chkFaReplaceText" style="margin:0 6px;" class="small">Replace existing icon(s).</label></td></tr>');
                            $("#chkFaReplaceText").prop("checked", UI.FaReplaceText);
                            $('#chkFaReplaceText').change(function () {
                                UI.FaReplaceText = $(this).is(":checked");
                            });
                        });
                        $('#iconpicker').addClass(idpicker);
                    }
                    $('#' + idpicker).show();
                    $('#iconpicker').show();
                    $("#input").css("font-size", "1.5em");
                    if (!UI.isUndoRedoing && WPImager.boot > 0) {
                        WPImager.setMultiLayerText("fontfamily", $('#fontfamily').val(), true);
                        WPImager.setMultiLayerText("fontsrctype", parseInt(srctype), true);
                        WPImagerUI.flagCanvasSave();
                    }
                } else {
                    $('#iconpicker').hide();
                    $("#input").css("font-family", "Arial");
                    $("#txt" + WPImager.current.toString() + " .tlcontent").css("font-family", $("#fontfamily").val());
                    if (!UI.isUndoRedoing && WPImager.boot > 0) {
                        WPImager.setMultiLayerText("fontfamily", $('#fontfamily').val(), true);
                        WPImager.setMultiLayerText("fontsrctype", parseInt(srctype), true);
                    }

                    var variants = [], _variants = '';
                    for (var i = 0; i < ggfonts.length; i++) {
                        if (ggfonts[i].family.replace(/[\+|:]/g, ' ') === font) {
                            _variants = ggfonts[i].variants;
                            variants = ggfonts[i].variants.split(',');
                            $("#fontweight-list").data("variants", ggfonts[i].variants);
                            $("#fontweight-list > li > a").each(function (e) {
                                var weight = $(this).data("value").toString();
                                if (weight == "400") {
                                    weight = "regular";
                                }
                                if (variants.indexOf(weight) > -1) {
                                    $(this).parent().show();
                                } else {
                                    $(this).parent().hide();
                                }
                            });
                            break;
                        }
                    }
                    if (!UI.isUndoRedoing && WPImager.boot > 0) {
                        // new weight                    
                        var weight = WPImager.layer[WPImager.current].fontweight.toString();
                        if (weight == "400") {
                            weight = "regular";
                        }
                        WPImager.layer[WPImager.current].bold = false;
                        if (variants.indexOf(weight) > -1) {
                            // maintain weight value
                            WPImager.layer[WPImager.current].bold = (WPImager.layer[WPImager.current].fontweight == 700);
                        } else if (variants.indexOf("regular") > -1) {
                            WPImager.layer[WPImager.current].fontweight = 400;
                        } else if (variants.indexOf("700") > -1) {
                            WPImager.layer[WPImager.current].fontweight = 700;
                            WPImager.layer[WPImager.current].bold = true;
                        } else {
                            WPImager.layer[WPImager.current].fontweight = parseInt(variants[0]);
                        }
                        WPImager.addFontLinkTag(WPImager.current, _variants);
                    }
                    $("#txtFontWeight").text(WPImager.layer[WPImager.current].fontweight.toString());

                    weight = WPImager.layer[WPImager.current].fontweight;
                    if (WPImager.layer[WPImager.current].fontweight == 700) {
                        $("#bold").addClass("active");
                    } else {
                        $("#bold").removeClass("active");
                    }

                    if (!UI.isUndoRedoing && WPImager.boot > 0) {
                        WPImagerUI.flagCanvasSave();
                    }
                }
                draw();
                UI.iconpicker_insertchar = 1;
                UI.lastfontselected.fontfamily = $("#fontfamily").val();
                UI.lastfontselected.srctype = parseInt(srctype);
                e.preventDefault();
            });

            $("#fontfamily2").change(function (e, font, srctype) {
                $("#input2").css("font-size", "1em");

                e.preventDefault();
            });

            var intervalFontsizeUp, intervalFontsizeDown, intervalRepeat = 0;
            $(".fontsize-plusminus").mousedown(function () {
                var intervalMS = 90;
                if ($(this).attr("id") == "fontsize-minus") {
                    intervalFontsizeDown = setInterval(fontsizeUpDown, intervalMS);
                }
                if ($(this).attr("id") == "fontsize-plus") {
                    intervalFontsizeUp = setInterval(fontsizeUpDown, intervalMS);
                }
            }).mouseup(function () {
                clearInterval(intervalFontsizeDown);
                clearInterval(intervalFontsizeUp);
                intervalFontsizeDown = 0;
                intervalFontsizeUp = 0;
                intervalRepeat = 0;
                WPImagerUI.flagCanvasSave();
            }).mouseout(function () {
                clearInterval(intervalFontsizeDown);
                clearInterval(intervalFontsizeUp);
                intervalFontsizeDown = 0;
                intervalFontsizeUp = 0;
                intervalRepeat = 0;
                WPImagerUI.flagCanvasSave();
            });

            function fontsizeUpDown() {
                intervalRepeat++;
                if (intervalRepeat > 1 && intervalRepeat <= 10)
                    return;
                var textdraw = WPImager.layer[WPImager.current];
                var fontsize;
                if (parseInt(textdraw.fontsize) == textdraw.fontsize) {
                    if (intervalFontsizeUp > 0) {
                        fontsize = textdraw.fontsize + 1;
                    }
                    if (intervalFontsizeDown > 0) {
                        fontsize = textdraw.fontsize - 1;
                    }
                } else {
                    if (intervalFontsizeUp > 0) {
                        fontsize = Math.floor(textdraw.fontsize) + 1;
                    }
                    if (intervalFontsizeDown > 0) {
                        fontsize = Math.floor(textdraw.fontsize);
                    }
                }
                fontsize = (fontsize < 1) ? 1 : fontsize;
                WPImager.setMultiLayerText("fontsize", fontsize, true);
                draw();
                $("#fontsize").spinner("value", textdraw.fontsize);
            }


            $("#fontsize").spinner({
                max: 8000,
                min: 1,
                step: 0.1,
                stop: function (event, ui) {
                    if ($("#fontsize").spinner("isValid")) {
                        var fontsize = $("#fontsize").spinner("value");
                        WPImager.setMultiLayerText("fontsize", fontsize, true);
                        draw();
                    }
                }
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    var textdraw = WPImager.layer[WPImager.current];
                    $(this).spinner("value", textdraw.fontsize);
                }
                WPImagerUI.flagCanvasSave();
            });

            $("#fontsize2").spinner({
                max: 8000,
                min: 1,
                stop: function (event, ui) {
                    if ($("#fontsize2").spinner("isValid")) {

                    }
                }
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    $(this).spinner("value", 36);
                }
            });
            $("#fontsize3").spinner({
                max: 8000,
                min: 1,
                step: 0.1,
                stop: function (event, ui) {
                    if ($("#fontsize3").spinner("isValid")) {
                        var fontsize = $("#fontsize3").spinner("value");
                        $('#fontsize').val(fontsize);
                        WPImager.setMultiLayerText("fontsize", fontsize, true);
                        draw();
                    }
                }
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
//                $(this).spinner("value", 36);
                }
            });
            $('#fontcolor2').colorpicker({
                showOn: 'button',
                customTheme: UI.customTheme,
                customTheme2: UI.customTheme2,
                transparentColor: true}).on('change.color', function (evt, color) {

            });

            $("#fontcolorcanvas").click(function (e) {
                UI.console = UI.CNSL.TXTCOLOR;
                $("#texttoolbar").hide();
                $("#toolText_Fontcolor_controls").show();

                var textdraw = WPImager.layer[WPImager.current];

                $("#toolText_Fontcolor_controls .fontcolor-control").hide();

                $("#fontwrap-gradient").show();

                if (!(textdraw.circOn || textdraw.shape == UI.SHAPE.CURVEDTEXT)) {
                    $("#fontwrap-rotation,#fontwrap-gradline").show();
                }

                var fontgradient = (textdraw.fontgradient.length > 0) ? textdraw.fontgradient : "0% " + textdraw.fontcolor;
                $('.fontgradient').ClassyGradient({
                    id: 'ClassyFontGradient',
                    gradient: fontgradient,
                    colorname: 'fontgradient',
                    discrete: false, // (textdraw.backcoloroption == "stripes-discrete" || textdraw.backcoloroption == "stripes-radial"),
                    onChange: function (stringGradient, cssGradient) {
                        WPImager.layer[WPImager.current].fontgradient = stringGradient;
                        draw(true);
                        WPImager.layer[WPImager.current].refreshFontColorCanvas();

                    }
                });
                $("#fontgradrotation").spinner("value", textdraw.fontgradrotation);
                $("#fontcoloroption-wrap button,#fontgradline").removeClass("blue");
                $("#fontcoloroption-gradient").addClass("blue");
                if (!textdraw.fontgradline) {
                    $("#fontgradline").addClass("blue");
                }
                WPImager.savePickerColor("fontgradient", WPImager.layer[WPImager.current].fontcolor);
                $("#canvascolorpickerconsole").hide();
            });

            $('#fontcolor,#fontcolor3').colorichpicker({showOn: 'button', transparentColor: true}).on('change.color', function (evt, color) {
                if (WPImager.boot > 0) {
                    if (!UI.isUndoRedoing && UI.validateColorHex($(this).val()) !== false) {
                        WPImager.setMultiLayerText("fontcolor", $('#' + $(this).attr("id")).val(), true);
                        $('#fontcolor,#fontcolor3').val($(this).val());
                        $("#fontcolor,#fontcolor3").colorichpicker({color: $(this).val()});

                        WPImagerUI.flagCanvasSave();
                    }
                }
                draw();
            }).on('canvaspick.color', function (evt) {
                UI.console = UI.CNSL.TXTCOLOR;
                $("#texttoolbar").hide();
                $("#toolText_Fontcolor_controls").show();

                var textdraw = WPImager.layer[WPImager.current];

                $("#toolText_Fontcolor_controls .fontcolor-control").hide();

                $("#fontwrap-color").show();
                WPImager.savePickerColor("fontcolor", WPImager.layer[WPImager.current].fontcolor);
                $("#fontcoloroption-wrap button").removeClass("blue");
                $("#fontcoloroption-color").addClass("blue");
            }).on('blur', function () {
                if (UI.validateColorHex($(this).val()) === false) {
                    var color = WPImager.layer[WPImager.current].fontcolor;
                    $(this).val(color);
                    $(this).colorichpicker({color: color});
                }
            });

            $('#lineheight').change(function () {
                if (!UI.isUndoRedoing) {
                    WPImager.setMultiLayerText("lineheight", $('#lineheight').val(), true);
                    WPImagerUI.flagCanvasSave();
                }
                draw();
            });


            $("#textdir").click(function (e) {
                WPImager.toggTextDir();
                WPImager.setTextDirection();
                WPImagerUI.flagCanvasSave();
                draw();
            });

            $("#download_format").click(function (e) {
                WPImager.canvas.ext = (WPImager.canvas.ext === "jpg") ? "png" : "jpg";
                WPImagerUI.flagCanvasSave();
                draw();
                $('#download_format').text(WPImager.canvas.ext.toUpperCase());
            });

            $("#chkStfilename").change(function () {
                WPImager.canvas.stfilename = ($("#chkStfilename").prop("checked")) ? 1 : 0;
                WPImagerUI.flagCanvasSave();
            });

            $('#txt_oalign_left, #txt_oalign_center, #txt_oalign_right').click(function (e) {
                var id = $(this).attr("id");
                var oalign = id.replace(/txt_oalign_/gi, "");
                WPImager.layerEdgeHandlers(WPImager.current);
                WPImager.layerAlignHorizontal(oalign, WPImager.current);

                for (var i = 0; i < WPImager.multiselect.length; i++) {
                    var index = WPImager.multiselect[i];
                    WPImager.layerEdgeHandlers(index);
                    WPImager.layerAlignHorizontal(oalign, index);
                }
                draw();
                WPImagerUI.flagCanvasSave();
                e.preventDefault();
            });
            $('#txt_ovalign_top, #txt_ovalign_middle, #txt_ovalign_bottom').click(function (e) {
                var id = $(this).attr("id");
                var voalign = id.replace(/txt_ovalign_/gi, "");
                WPImager.layerEdgeHandlers(WPImager.current);
                WPImager.layerAlignVertical(voalign, WPImager.current);

                for (var i = 0; i < WPImager.multiselect.length; i++) {
                    var index = WPImager.multiselect[i];
                    WPImager.layerEdgeHandlers(index);
                    WPImager.layerAlignVertical(voalign, index);
                }
                draw();
                WPImagerUI.flagCanvasSave();
                e.preventDefault();
            });

            $('[id^="txtbase_"]').click(function (e) {
                var icon;
                var id = $(this).attr("id");
                if (id == "txtbase_rectangle") {
                    icon = "fa-square-o stretch";
                    WPImager.layer[WPImager.current].shape = UI.SHAPE.RECTANGLE;
                    $("#btnBaseShapeTxt").html('<span class="fa ' + icon + '"></span>');
                } else if (id == "txtbase_square") {
                    WPImager.layer[WPImager.current].shape = UI.SHAPE.SQUARE;
                    WPImager.layer[WPImager.current].width = WPImager.layer[WPImager.current].height;
                    WPImager.layerControlUpdate(WPImager.current);
                    icon = "fa-square-o";
                    $("#btnBaseShapeTxt").html('<span class="fa ' + icon + '"></span>');
                } else if (id == "txtbase_circle") {
                    WPImager.layer[WPImager.current].shape = UI.SHAPE.CIRCLE;
                    WPImager.layer[WPImager.current].width = WPImager.layer[WPImager.current].height;
                    WPImager.layerControlUpdate(WPImager.current);
                    icon = "fa-circle-thin";
                    $("#btnBaseShapeTxt").html('<span class="fa ' + icon + '"></span>');
                } else if (id == "txtbase_ellipse") {
                    WPImager.layer[WPImager.current].shape = UI.SHAPE.ELLIPSE;
                    icon = "fa-circle-thin stretch";
                    $("#btnBaseShapeTxt").html('<span class="fa ' + icon + '"></span>');
                } else if (id == "txtbase_parallelogram") {
                    WPImager.layer[WPImager.current].shape = UI.SHAPE.PARALLELOGRAM;
                    icon = "fa-square-o skewed";
                    $("#btnBaseShapeTxt").html('<span class="fa ' + icon + '"></span>');
                } else if (id == "txtbase_trapezoid") {
                    WPImager.layer[WPImager.current].shape = UI.SHAPE.TRAPEZOID;
                    icon = "fa-square-o trapezoid";
                    $("#btnBaseShapeTxt").html('<span class="fa ' + icon + '"></span>');
                } else if (id == "txtbase_ribbon") {
                    WPImager.layer[WPImager.current].shape = UI.SHAPE.RIBBON;
                    icon = "fa-bookmark-o rotate90";
                    $("#btnBaseShapeTxt").html('<span class="fa ' + icon + '"></span>');
                }

                WPImager.updateLayerTab();
                if (id == "txtbase_trapezoid" || id == "txtbase_parallelogram" || id == "txtbase_ribbon") {
                    $('#showTextSkewConsole').click();
                }
                draw();
                WPImagerUI.flagCanvasSave();
                e.preventDefault();
            });

            $('[id^="linestyle_arrow"]').on('change', function () {
                var style = $('input[name="linestyle_arrow"]:checked').val();
                if (UI.console == UI.CNSL.LINESTYLETOOLBAR
                        && (WPImager.layer[WPImager.current].shape == UI.SHAPE.CURVEDTEXT
                                || WPImager.layer[WPImager.current].shape == UI.SHAPE.CUSTOM || WPImager.layer[WPImager.current].shape == UI.SHAPE.LINE)) {
                    WPImager.layer[WPImager.current].linestyle = WPImager.layer[WPImager.current].linestyle.replace(/\\BOTH/g, '').replace(/\\LEFT/g, '').replace(/\\RIGHT/g, '').replace(/\\NONE/g, '');
                    WPImager.layer[WPImager.current].linestyle += "\\" + style;
                    WPImager.layer[WPImager.current].recalculateShapeContainer();
                    draw();
                }
            });

            $("#lineCap").click(function () {
                var textdraw = WPImager.layer[WPImager.current];
                var style = (textdraw.linestyle.indexOf("\CAPROUND") === -1) ? "\\CAPROUND" : "\\CAPBUTT";
                textdraw.linestyle = textdraw.linestyle.replace(/\\CAPROUND/g, '').replace(/\\CAPBUTT/g, '').replace(/\\CAPSQUARE/g, '');
                textdraw.linestyle += style;
                WPImager.layerControlUpdate(WPImager.current);
                draw(true);
            });

            $("#lineJoin").click(function () {
                var textdraw = WPImager.layer[WPImager.current];
                var _style = (textdraw.linestyle.indexOf("\JOINROUND") !== -1) ? "\\JOINBEVEL" : "\\JOINROUND";
                _style = (textdraw.linestyle.indexOf("\JOINBEVEL") !== -1) ? "\\JOINMITER" : _style;
                _style = (textdraw.linestyle.indexOf("\JOINMITER") !== -1) ? "\\JOINROUND" : _style;
                textdraw.linestyle = textdraw.linestyle.replace(/\\JOINROUND/g, '').replace(/\\JOINMITER/g, '').replace(/\\JOINBEVEL/g, '');
                textdraw.linestyle += _style;
                WPImager.layerControlUpdate(WPImager.current);
                draw(true);
            });

            $("#line_keep_horizontal").click(function () {
                WPImager.layer[WPImager.current].setLineVH(2);
                draw();
                WPImagerUI.flagCanvasSave();
            });
            $("#line_keep_vertical").click(function () {
                WPImager.layer[WPImager.current].setLineVH(1);
                draw();
                WPImagerUI.flagCanvasSave();
            });

            $('#txt_polyspoke_on, #txt_polyspoke_off').click(function () {
                var id = $(this).attr("id");
                var polyspoke = (id == "txt_polyspoke_on");
                WPImager.setMultiLayerText("polyspoke", polyspoke, true);
                WPImagerUI.flagCanvasSave();
                draw();
                var textdraw = WPImager.layer[WPImager.current];
                if (textdraw.polyspoke) {
                    $("#polygonSpokeRatio").removeClass("disabled");
                } else {
                    $("#polygonSpokeRatio").addClass("disabled");
                }
            });

            $('[id^="shape_point"]').on('change', function () {
                var pointcode = $('input[name="pointcode"]:checked').val() % 4;
                if (UI.console == UI.CNSL.SHAPETOOLBAR
                        && (WPImager.layer[WPImager.current].shape == UI.SHAPE.CUSTOM || WPImager.layer[WPImager.current].shape == UI.SHAPE.LINE)) {
                    var curr_pointcode = WPImager.layer[WPImager.current].getActivePointCode();
                    if (pointcode == curr_pointcode) {
                        setTimeout(function () {
                            $('[id^="shape_point"]').removeClass("active");
                        }, 100);
                        pointcode = 0;
                    }
                    $("#point_regular").prop("checked", true);
                    WPImager.layer[WPImager.current].setActivePointCode(pointcode);
                    WPImagerUI.flagCanvasSave();
                    draw();
                }
            });

            $('[id^="curve_mode"]').on('change', function () {
                var mode = parseInt($('input[name="curve_mode"]:checked').val());
                if (UI.console == UI.CNSL.TXTCURVED
                        && WPImager.layer[WPImager.current].shape == UI.SHAPE.CURVEDTEXT) {
                    UI.console_shape = mode;
                    draw();
                }
            });

            $('[id^="shape_mode"]').on('change', function () {
                var mode = parseInt($('input[name="shape_mode"]:checked').val());
                if (UI.console == UI.CNSL.SHAPETOOLBAR
                        && (WPImager.layer[WPImager.current].shape == UI.SHAPE.CURVEDTEXT
                                || WPImager.layer[WPImager.current].shape == UI.SHAPE.CUSTOM || WPImager.layer[WPImager.current].shape == UI.SHAPE.LINE)) {
                    UI.console_shape = mode;
                    if (mode == UI.CNSL.SHAPETOOLEDIT) {
                        UI.activePoint = 0;
                        $("#mode_edit_controls").show();
                        $('#mode_edit_controls button, #mode_edit_controls label').removeClass("disabled");
                    } else {
                        $('#mode_edit_controls button, #mode_edit_controls label').addClass("disabled");
                    }
                    draw();
                }
                $('#shape_mode_draw').show();
                $('#shape_mode_drawstop').hide();
            });

            $('#shape_mode_draw').click(function () {
                if (UI.console == UI.CNSL.SHAPETOOLBAR
                        && (WPImager.layer[WPImager.current].shape == UI.SHAPE.CUSTOM || WPImager.layer[WPImager.current].shape == UI.SHAPE.LINE)) {
                    UI.console_shape = UI.CNSL.SHAPETOOLDRAW;
                    $('[id^="shape_mode"]').removeClass("active");
                    $('.mode_edit_show').show();
                    $('.mode_edit_hide').hide();
                    $("#mode_edit_controls").hide();
                    $('#mode_edit_controls button, #mode_edit_controls label').addClass("disabled");
                    draw();
                }
            });
            $('#shape_mode_drawstop').click(function () {
                if (UI.console == UI.CNSL.SHAPETOOLBAR
                        && (WPImager.layer[WPImager.current].shape == UI.SHAPE.CUSTOM || WPImager.layer[WPImager.current].shape == UI.SHAPE.LINE)) {
                    $('#showShapeEditConsole').click();
                    UI.console_shape = UI.CNSL.SHAPETOOLMOVE;
                    $('[id^="shape_mode"]').removeClass("active");
                    $('#shape_mode_move').addClass("active");
                    $('.mode_move_show').show();
                    $('.mode_move_hide').hide();
                    $("#mode_edit_controls").show();
                    $('#mode_edit_controls button, #mode_edit_controls label').addClass("disabled");
                    WPImager.layer[WPImager.current].recalculateShapeContainer();
                    draw();
                }
                $("#viewLayers").click();
            });

            $('#shape_line_drawstop,#shape_mode_drawstop2').click(function () {
                UI.pathPointNew = "";
                WPImager.selectLayer(WPImager.current);
                draw();
                $("#viewLayers").click();
            });



            $('#add_shape_point_next').click(function () {
                if (UI.console == UI.CNSL.SHAPETOOLBAR
                        && (WPImager.layer[WPImager.current].shape == UI.SHAPE.CUSTOM || WPImager.layer[WPImager.current].shape == UI.SHAPE.LINE)) {
                    WPImager.layer[WPImager.current].addShapePoint(1);
                    WPImagerUI.flagCanvasSave();
                    draw();
                }
            });

            $('#add_shape_point_next').mouseenter(function () {
                $(this).addClass("btn-success").removeClass("btn-slate");
                UI.expectCPointNew = 1;
                draw();
            }).mouseleave(function () {
                $(this).removeClass("btn-success").addClass("btn-slate");
                UI.expectCPointNew = 0;
                draw();
            });

            $('#add_shape_point_prev').click(function () {
                if (UI.console == UI.CNSL.SHAPETOOLBAR
                        && (WPImager.layer[WPImager.current].shape == UI.SHAPE.CUSTOM || WPImager.layer[WPImager.current].shape == UI.SHAPE.LINE)) {
                    WPImager.layer[WPImager.current].addShapePoint(-1);
                    WPImagerUI.flagCanvasSave();
                    draw();
                }
            });

            $('#add_shape_point_prev').mouseenter(function () {
                $(this).addClass("btn-primary").removeClass("btn-slate");
                ;
                UI.expectCPointNew = -1;
                draw();
            }).mouseleave(function () {
                $(this).removeClass("btn-primary").addClass("btn-slate");
                UI.expectCPointNew = 0;
                draw();
            });

            $('#delete_shape_point').mouseenter(function () {
                $(this).addClass("btn-danger").removeClass("btn-slate");
                ;
            }).mouseleave(function () {
                $(this).removeClass("btn-danger").addClass("btn-slate");
            });


            $('#delete_shape_point').click(function () {
                if (UI.console == UI.CNSL.SHAPETOOLBAR && UI.console_shape == UI.CNSL.SHAPETOOLEDIT
                        && (WPImager.layer[WPImager.current].shape == UI.SHAPE.CUSTOM || WPImager.layer[WPImager.current].shape == UI.SHAPE.LINE)) {
                    WPImager.layer[WPImager.current].deleteShapePoint();
                    WPImagerUI.flagCanvasSave();
                    draw();
                }
            });

            $('#flip_shape_horizontal').click(function () {
                if (UI.console == UI.CNSL.SHAPETOOLBAR /* && UI.console_shape == UI.CNSL.SHAPETOOLEDIT */
                        && (WPImager.layer[WPImager.current].shape == UI.SHAPE.CUSTOM || WPImager.layer[WPImager.current].shape == UI.SHAPE.LINE)) {
                    WPImager.layer[WPImager.current].flipShapeH();
                    WPImagerUI.flagCanvasSave();
                    draw();
                }
            });

            $('#flip_shape_vertical').click(function () {
                if (UI.console == UI.CNSL.SHAPETOOLBAR /* && UI.console_shape == UI.CNSL.SHAPETOOLEDIT */
                        && (WPImager.layer[WPImager.current].shape == UI.SHAPE.CUSTOM || WPImager.layer[WPImager.current].shape == UI.SHAPE.LINE)) {
                    WPImager.layer[WPImager.current].flipShapeV();
                    WPImagerUI.flagCanvasSave();
                    draw();
                }
            });


            $('#togglePathClosed').click(function () {
                $('#togglePathClosed .inactive,#togglePathClosed .active').toggle();
                var textdraw = WPImager.layer[WPImager.current];
                textdraw.pathClosed = $('#pathClosedOn').is(':visible');
                WPImagerUI.flagCanvasSave();
                draw();
            });


            $("#resizeTextHeight2Canvas").click(function (e) {
                WPImager.layerApplyCanvasHeight(WPImager.current);
                if (WPImager.layer[WPImager.current].shape == UI.SHAPE.SQUARE || WPImager.layer[WPImager.current].shape == UI.SHAPE.CIRCLE) {
                    $("#txt_oalign_center").click();
                }
                WPImager.layerControlUpdate(WPImager.current);
                draw();

                WPImagerUI.flagCanvasSave();
                setTimeout(function () {
                    $("#resizeHeightImage2Canvas, #resizeTextHeight2Canvas").removeClass("active");
                }, 100);
                if (WPImager.layer[WPImager.current].code == UI.LAYER.COM) {
                    $("#keepOriAspectOff").click();
                }
            });

            $("#resizeTextWidth2Canvas").click(function (e) {
                WPImager.layerApplyCanvasWidth(WPImager.current);
                WPImager.layerControlUpdate(WPImager.current);
                draw();
                WPImagerUI.flagCanvasSave();
                e.preventDefault();
                setTimeout(function () {
                    $("#resizeWidthImage2Canvas, #resizeTextWidth2Canvas").removeClass("active");
                }, 100);
                if (WPImager.layer[WPImager.current].code == UI.LAYER.COM) {
                    $("#keepOriAspectOff").click();
                }
            });

            $("#resizeText2Canvas").click(function (e) {
                if (WPImager.layer[WPImager.current].shape == UI.SHAPE.SQUARE || WPImager.layer[WPImager.current].shape == UI.SHAPE.CIRCLE) {
                    if (WPImager.canvas.width > WPImager.canvas.height) {
                        WPImager.layerApplyCanvasHeight(WPImager.current);
                    } else {
                        WPImager.layerApplyCanvasWidth(WPImager.current);
                    }
                    $("#txt_oalign_center").click();
                } else {
                    WPImager.layerApplyCanvasWidth(WPImager.current);
                    WPImager.layerApplyCanvasHeight(WPImager.current);
                }
                WPImager.layerControlUpdate(WPImager.current);
                draw();
                WPImagerUI.flagCanvasSave();
                setTimeout(function () {
                    $("#resizeText2Canvas").removeClass("active");
                }, 100);

                if (WPImager.layer[WPImager.current].code == UI.LAYER.COM) {
                    $("#keepOriAspectOff").click();
                }

            });


            $("#txtWidth, #txtRadius").spinner({
                min: 20,
                step: 1,
                stop: function (event, ui) {
                    var id = $(this).attr("id");
                    var width = $(this).spinner("value");
                    if (id == "txtRadius")
                        width = width * 2;
                    WPImager.spinWidth(width, WPImager.current, true, true);
                    WPImager.multi_size_sync(WPImager.current);
                    draw();
                },
                spin: function (event, ui) {
                    var id = $(this).attr("id");
                    var width = ui.value;
                    if (id == "txtRadius")
                        width = width * 2;
                    WPImager.spinWidth(width, WPImager.current, true, true);
                    WPImager.multi_size_sync(WPImager.current);
                    draw();
                }
            }).on('blur', function () {

                if (!$(this).spinner("isValid")) {
                    var textdraw = WPImager.layer[WPImager.current];
                    $("txtRadius").spinner("value", textdraw.radius);
                    $(this).spinner("value", textdraw.width);
                }
                WPImagerUI.flagCanvasSave();
            });
            $("#txtRadius").spinner({
                min: 5
            });

            $("#txtHeight").spinner({
                min: 16,
                step: 1,
                stop: function (event, ui) {
                    var height = $(this).spinner("value");
                    WPImager.spinHeight(height, WPImager.current, true, true);
                    WPImager.multi_size_sync(WPImager.current);
                    draw();
                },
                spin: function (event, ui) {
                    var height = ui.value;
                    WPImager.spinHeight(height, WPImager.current, true, true);
                    WPImager.multi_size_sync(WPImager.current);
                    draw();
                }
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    var textdraw = WPImager.layer[WPImager.current];
                    $(this).spinner("value", textdraw.height);
                }
                WPImagerUI.flagCanvasSave();
            });

            $("#imgkeepratio,#txtkeepratio").change(function () {
                var imgkeepratio = $("#imgkeepratio").prop("checked");
                var txtkeepratio = $("#txtkeepratio").prop("checked");
                WPImager.canvas.imgkeepratio = (imgkeepratio) ? 1 : 0;
                WPImager.canvas.txtkeepratio = (txtkeepratio) ? 1 : 0;
                WPImagerUI.flagCanvasSave();
            });


            $("#lineLength").spinner({
                min: 20,
                step: 1,
                stop: function (event, ui) {
                    var length = $(this).spinner("value");
                    WPImager.layer[WPImager.current].resizeLineLength(length);
                    draw();
                },
                spin: function (event, ui) {
                    var length = ui.value;
                    WPImager.layer[WPImager.current].resizeLineLength(length);
                    draw();
                }
            }).on('blur', function () {

                WPImagerUI.flagCanvasSave();
            });


            $("#uploadResizeCanvas,#chkScaleLayers2Canvas").click(function (e) {
                e.stopImmediatePropagation();
            });

            $("#resetText").click(function (e) {
                var textdraw = WPImager.layer[WPImager.current];
                if (textdraw.code == UI.LAYER.TEXT) {
                    textdraw.xOffset = (WPImager.canvas.width - textdraw.width) / 2;
                    textdraw.yOffset = (WPImager.canvas.height - textdraw.height) / 2;
                } else if (textdraw.code == UI.LAYER.COM) {
                    textdraw.x = (WPImager.canvas.width - textdraw.width) / 2;
                    textdraw.y = (WPImager.canvas.height - textdraw.height) / 2;
                }
                textdraw.rotation = 0;
                textdraw.alpha = 100;
                WPImagerUI.flagCanvasSave();
                draw();
                return false;
            });

            $('#backcolor').colorichpicker({showOn: 'button', transparentColor: true}).on('change.color', function (evt, color) {
                if (WPImager.boot > 0)
                    if (!UI.isUndoRedoing && UI.validateColorHex($(this).val()) !== false) {
                        WPImager.setMultiLayerText("backcolor", $('#backcolor').val(), true);
                        WPImagerUI.flagCanvasSave();
                    }
                draw();
            }).on('canvaspick.color', function (evt) {
                WPImager.savePickerColor($(this).attr('id'), WPImager.layer[WPImager.current].backcolor);
            }).on('blur', function () {
                if (UI.validateColorHex($(this).val()) === false) {
                    var color = WPImager.layer[WPImager.current].backcolor;
                    $(this).val(color);
                    $(this).colorichpicker({color: color});
                }
            });

            $("#backinvert").change(function () {
                var backinvert = $("#backinvert").prop("checked");
                WPImager.layer[WPImager.current].backinvert = (backinvert) ? 1 : 0;
                draw();
                WPImagerUI.flagCanvasSave();
            });

            $('#backcoloroption').change(function () {
                if (!UI.isUndoRedoing) {
                    WPImager.layer[WPImager.current].backcoloroption = $('#backcoloroption').val();
                    WPImagerUI.flagCanvasSave();
                    $('#showTextBgControls').click();
                    // WPImager.layer[WPImager.current].refreshToolLayerColorIndicator();
                    $('.gradient').ClassyGradientSetDiscrete($('#backcoloroption').val() == "stripes-discrete" || $('#backcoloroption').val() == "stripes-radial");
                }
                draw();
            });

            $('#fontgradline').click(function () {
                if (!UI.isUndoRedoing) {
                    var textdraw = WPImager.layer[WPImager.current];
                    textdraw.fontgradline = !textdraw.fontgradline;
                    WPImagerUI.flagCanvasSave();
                    $("#fontgradline").removeClass("blue");
                    if (!textdraw.fontgradline) {
                        $("#fontgradline").addClass("blue");
                    }
                }
                draw();
            });

            $('#fontcoloroption-color').click(function () {
                if (!UI.isUndoRedoing) {
                    WPImager.layer[WPImager.current].fontcoloroption = 'color';
                    WPImagerUI.flagCanvasSave();

                    $("#toolText_Fontcolor_controls .fontcolor-control").hide();
                    $("#fontwrap-color").show();
                    $("#fontcoloroption-wrap button").removeClass("blue");
                    $("#fontcoloroption-color").addClass("blue");
                }
                draw();
            });

            $('#fontcoloroption-gradient').click(function () {
                if (!UI.isUndoRedoing) {
                    WPImager.layer[WPImager.current].fontcoloroption = 'linear';
                    WPImagerUI.flagCanvasSave();

                    $("#toolText_Fontcolor_controls .fontcolor-control").hide();
                    var textdraw = WPImager.layer[WPImager.current];
                    var fontgradient = (textdraw.fontgradient.length > 0) ? textdraw.fontgradient : "0% " + textdraw.fontcolor;
                    $('.fontgradient').ClassyGradient({
                        gradient: fontgradient,
                        colorname: 'fontgradient',
                        onChange: function (stringGradient, cssGradient) {
                            if (UI.validateColorHex($("#copicker-fontgradient").val())) {
                                WPImager.layer[WPImager.current].fontgradient = stringGradient;
                                draw(true);
                                WPImager.layer[WPImager.current].refreshFontColorCanvas();
                            }
                        }
                    });

                    $("#fontgradrotation").spinner("value", textdraw.fontgradrotation);
                    $("#fontwrap-gradient").show();
                    if (!(textdraw.circOn || textdraw.shape == UI.SHAPE.CURVEDTEXT)) {
                        $("#fontwrap-rotation,#fontwrap-gradline").show();
                    }
                    $("#fontcoloroption-wrap button,#fontgradline").removeClass("blue");
                    $("#fontcoloroption-gradient").addClass("blue");
                    if (!textdraw.fontgradline) {
                        $("#fontgradline").addClass("blue");
                    }
                }
                draw();
            });


            $('#backradialWidth').change(function () {
                if (!UI.isUndoRedoing) {
                    WPImager.layer[WPImager.current].backradialWidth = parseInt($('#backradialWidth').val());
                    WPImagerUI.flagCanvasSave();
                }
                draw();
            });

            $('#borderTextStyle').change(function () {
                var id = $(this).attr('id');
                if (!UI.isUndoRedoing) {
                    var borderdash = WPImager.layer[WPImager.current].textborderdash.split(" ");
                    WPImager.layer[WPImager.current].textborderdash = ($('#' + id).val() == "solid" ? "0" : "1");
                    if ($('#' + id).val() == "dashedgap") {
                        WPImager.layer[WPImager.current].textborderdash = "2";
                    }
                    if (borderdash.length == 4) {
                        WPImager.layer[WPImager.current].textborderdash += " " + borderdash[1];
                        WPImager.layer[WPImager.current].textborderdash += " " + borderdash[2];
                        WPImager.layer[WPImager.current].textborderdash += " " + borderdash[3];
                    }
                    WPImagerUI.flagCanvasSave();
                    WPImager.layerControlUpdate(WPImager.current);
                }
                draw();
            });


            WPImagerCtrls.initSpinnerText("#alphaText", 1, 100, 1, "alpha", "imgalpha", true);
            WPImagerCtrls.initSpinnerText("#alphaBack", 0, 100, 1, "backalpha", null, true);
            WPImagerCtrls.initSpinnerText("#fontgradrotation", -360, 360, 1, "fontgradrotation", null);
            WPImagerCtrls.initSpinnerText("#backgradrotation", -360, 360, 1, "backgradrotation", null);
            WPImagerCtrls.initSpinnerText("#backradialOx", null, null, 1, "backradialOx", null);
            WPImagerCtrls.initSpinnerText("#backradialOy", null, null, 1, "backradialOy", null);
            WPImagerCtrls.initSpinnerText("#backradialRad", 1, 500, 1, "backradialRad", null);
            WPImagerCtrls.initSpinnerText("#backtilewidth", 2, 500, 1, "backtilewidth", null);
            WPImagerCtrls.initSpinnerText("#backstripeOx", null, null, 1, "backstripeOx", null);
            WPImagerCtrls.initSpinnerText("#textPadding", 0, null, 1, "padding", null);
            WPImagerCtrls.initSpinnerText("#xFine", null, null, 1, "xFine", null, true);
            WPImagerCtrls.initSpinnerText("#yFine", null, null, 1, "yFine", null, true);
            WPImagerCtrls.initSpinnerText("#polygonSides", 3, null, 1, "polysides", null);
            WPImagerCtrls.initSpinnerText("#polygonSides2", 3, null, 1, null, null);
            WPImagerCtrls.initSpinnerText("#polygonSpokeRatio", 0.01, 1, 0.01, "polyspokeratio", null);
            WPImagerCtrls.initSpinnerText("#textAngle", -360, 360, 1, "textangle", null);
            WPImagerCtrls.initSpinnerText("#circAngle", -360, 360, 1, "circangle", null);
            WPImagerCtrls.initSpinnerText("#circRadAdj", null, null, 1, "circradadj", null);
            WPImagerCtrls.initSpinnerText("#spacingText", -32, 64, 0.1, "textspacing", null);
            WPImagerCtrls.initSpinnerText("#spacingText2", -32, 64, 0.1, "textspacing", null);
            WPImagerCtrls.initSpinnerText("#txtGrow", null, null, 1, "textgrow", null);
            WPImagerCtrls.initSpinnerText("#txtAngle1", -360, 360, 1, "textangle1", null);
            WPImagerCtrls.initSpinnerText("#txtAngle2", -360, 360, 1, "textangle2", null);

            $("#polygonSides2").val(5);

            $("#fontgradrotation,#backgradrotation,#textAngle,#circAngle").spinner({
                spin: function (event, ui) {
                    if ($(this).spinner("isValid")) {
                        var rotation = (ui.value + 720) % 360;
                        $(this).spinner("value", rotation);
                        return false;
                    }
                }
            });


        },
        initTextConsoles: function () {

            $('#showTextToolbar').click(function () {
                UI.console = UI.CNSL.TXTTOOLBAR;
                UI.isCropping = false;
                $(".cvsconsole").hide();
                $("#texttoolbar,#txtconsole").show();
                // $("#showTextOutlineConsole,#showTextCircularConsole,#showTextShadowConsole,#showTextPositionConsole").slideDown();
                $("#showTextToolbar").after($("#showCurveTextConsole,#showTextOutlineConsole,#showTextCircularConsole,#showTextShadowConsole,#showTextPositionConsole"));
                var textdraw = WPImager.layer[WPImager.current];
                if (textdraw.fontcoloroption == 'linear') {
                    textdraw.refreshFontColorCanvas();
                    $("#texttoolbar .colorPickerCover").hide();
                    $("#fontcolorcanvas-wrap").show();
                } else {
                    $("#texttoolbar .colorPickerCover").show();
                    $("#fontcolorcanvas-wrap").hide();
                }
            });

            $('#showLineConsole').click(function () {
                UI.console = UI.CNSL.LINETOOLBAR;
                UI.isCropping = false;
                $(".cvsconsole").hide();
                $("#linetoolbar").show();
            });

            $('#showTextLineStyle').click(function () {
                UI.console = UI.CNSL.LINESTYLETOOLBAR;
                UI.isCropping = false;
                $(".cvsconsole").hide();
                $("#linestyletoolbar").show();
            });

            $('#showTextBgControls').click(function (e) {
                UI.console = UI.CNSL.TXTBACKGROUND;
                UI.isCropping = false;
                $(".cvsconsole").hide();
                $("#toolText_Background_controls").show();
                var textdraw = WPImager.layer[WPImager.current];
                if (textdraw.backcoloroption !== "color") {
                    var backgradient = (textdraw.backgradient.length > 0) ? textdraw.backgradient : "0% " + textdraw.backcolor;
                    $('.gradient').ClassyGradient({
                        gradient: backgradient,
                        colorname: 'copicker',
                        discrete: (textdraw.backcoloroption == "stripes-discrete" || textdraw.backcoloroption == "stripes-radial"),
                        onChange: function (stringGradient, cssGradient) {
                            WPImager.layer[WPImager.current].backgradient = stringGradient;
                            // WPImager.layer[WPImager.current].refreshToolLayerColorIndicator();
                            draw(true);
                        }
                    });
                }
                // initialize values for current layer
                $('#backcoloroption').val(textdraw.backcoloroption);
                $("#backgradrotation").spinner("value", textdraw.backgradrotation);
                $("#backradialOx").spinner("value", textdraw.backradialOx);
                $("#backradialOy").spinner("value", textdraw.backradialOy);
                $("#backradialRad").spinner("value", textdraw.backradialRad);
                $("#backtilewidth").spinner("value", textdraw.backtilewidth);
                $("#backstripeOx").spinner("value", textdraw.backstripeOx);
                $('#backradialWidth').val(textdraw.backradialWidth);

                if (textdraw.backcoloroption == "linear") {
                    $("#backwrap-color,#backwrap-offset,#backwrap-radius,#backwrap-width,#backwrap-stripe-offset,#backwrap-radialwidth").hide();
                    $("#backwrap-rotation,#backwrap-gradient").show();
                } else if (textdraw.backcoloroption == "stripes-radial") {
                    $("#backwrap-color,#backwrap-offset,#backwrap-radius,#backwrap-rotation,#backwrap-width").hide();
                    $("#backwrap-gradient,#backwrap-radialwidth,#backwrap-stripe-offset,#backwrap-offset").show();
                } else if (textdraw.backcoloroption == "stripes" || textdraw.backcoloroption == "stripes-discrete") {
                    $("#backwrap-color,#backwrap-offset,#backwrap-radius,#backwrap-radialwidth").hide();
                    $("#backwrap-rotation,#backwrap-gradient,#backwrap-width,#backwrap-stripe-offset").show();
                } else if (textdraw.backcoloroption == "radial") {
                    $("#backwrap-color,#backwrap-rotation,#backwrap-width,#backwrap-stripe-offset,#backwrap-radialwidth").hide();
                    $("#backwrap-offset,#backwrap-radius,#backwrap-gradient").show();
                } else {
                    $("#backwrap-rotation,#backwrap-offset,#backwrap-gradient,#backwrap-width,#backwrap-radius,#backwrap-stripe-offset,#backwrap-radialwidth").hide();
                    if (textdraw.backcoloroption == "color") {
                        $("#backwrap-color").show();
                    } else {
                        $("#backwrap-color").hide();
                    }
                }
            });



            $('#showPolygonConsole').click(function () {
                UI.console = UI.CNSL.POLYGONTOOLBAR;
                UI.isCropping = false;
                $(".cvsconsole").hide();
                $("#polygontoolbar,#txtconsole").show();

            });

            $('#showShapeEditConsole').click(function () {
                UI.console = UI.CNSL.SHAPETOOLBAR;
                UI.console_shape = UI.CNSL.SHAPETOOLMOVE;
                UI.isCropping = false;
                $(".cvsconsole").hide();
                $("#shapetoolbar,#txtconsole,#showShapeEditConsole").show();
                WPImager.layerControlUpdate(WPImager.current);
                $('[id^="shape_mode"]').removeClass("active");
                $('#shape_mode_move').addClass("active");
                $('#shape_mode_draw').show();
                $("#shapetoolbar > div").show();
                $('#shape_mode_drawstop').hide();
                draw();
            });

            $('#showCurveTextConsole').click(function () {
                UI.console = UI.CNSL.TXTCURVED;
                UI.isCropping = false;
                $(".cvsconsole").hide();
                $("#curvedtexttoolbar").show();
                $('[id^="curve_mode"]').removeClass("active");
                $('#curve_mode_move').addClass("active");
                draw();
            });

            $('#modeTextEdit,#modeTextEdit2').click(function () {
                if (UI.resizeCVS) {
                    UI.resizeCVS = false;
                    UI.expectResizeCVS = -1;
                }

                if (WPImager.layer[WPImager.current].code == UI.LAYER.TEXT) {
                    $("#showTextToolbar").click();

                    UI.console = UI.CNSL.TXTEDIT;
                    UI.isCropping = false;

                    WPImager.startCursor();
                    UI.input.cursorPos = input.selectionStart;
                    UI.input.selection = [input.selectionStart, input.selectionEnd];
                    $("#input").css("font-family", WPImager.layer[WPImager.current].fontfamily);
                    $("#input").css("font-size", WPImager.layer[WPImager.current].fontsize.toString() + "px");
                    $("#input").css("padding", WPImager.layer[WPImager.current].padding.toString() + "px");
                    $("#input").show();
                    $(this).addClass("active");
                    var input_top = parseInt($("#cvswrap").css("margin-top")) + WPImager.layer[WPImager.current].yOffset - $("#cvswrap").scrollTop();
                    $("#input").css("top", input_top.toString() + "px");
                    $("#input").width(WPImager.layer[WPImager.current].width);

                    $("#input").focus();
                } else if (WPImager.layer[WPImager.current].code == UI.LAYER.COM) {
                    WPImager.layer[WPImager.current].showTextEdit();
                }
            });


            // show text rotate console link        
            $('#showTextRotateConsole').click(function () {
                UI.console = UI.CNSL.TXTROTATE;
                UI.isCropping = false;
                $("#rotateText_ori").val(WPImager.layer[WPImager.current].rotation);
                $(".cvsconsole").hide();
                $("#rotatetextconsole").show();
                draw();
            });

            // show text position console link        
            $('#showTextPositionConsole').click(function () {
                UI.console = UI.CNSL.TXTPOSITION;
                UI.isCropping = false;
                $(".cvsconsole").hide();
                $("#positiontextconsole").show();
                draw();
            });

            // show text circular console link        
            $('#showTextCircularConsole').click(function () {
                UI.console = UI.CNSL.TXTCIRCULAR;
                UI.isCropping = false;
                $(".cvsconsole").hide();
                $("#circulartextconsole").show();
                $('#circIO').val(WPImager.layer[WPImager.current].circio);
                draw();
            });

            $('#positionTextReset').click(function () {
                WPImager.setMultiLayerText("xFine", 0, true);
                WPImager.setMultiLayerText("yFine", 0, true);
                WPImager.setMultiLayerText("padding", 0, true);
                WPImager.setMultiLayerText("textspacing", 0, true);
                WPImager.setMultiLayerText("lineheight", 1, true);
                $("#xFine").spinner("value", 0);
                $("#yFine").spinner("value", 0);
                $("#textPadding").spinner("value", 0);
                $("#spacingText").spinner("value", 0);
                $("#spacingText2").spinner("value", 0);
                $('#lineheight').val(1);
                draw();
                draw(true);
            });

            // text rotate spinner
            $("#rotateText").spinner({
                min: -360,
                max: 360,
                step: 1,
                suffix: "%",
                stop: function (event, ui) {
                    if ($("#rotateText").spinner("isValid")) {
                        var rotation = $("#rotateText").spinner("value");
                        WPImager.setMultiLayerText("rotation", rotation, true);
                        WPImager.setMultiLayerImage("imgrotation", rotation);

                        var is90deg = (rotation % 90 == 0);
                        if (is90deg)
                            $('#resizeTextWidth2Canvas,#resizeTextHeight2Canvas,#resizeText2Canvas').removeClass('disabled');
                        else
                            $('#resizeTextWidth2Canvas,#resizeTextHeight2Canvas,#resizeText2Canvas').addClass('disabled');
                        draw();
                    }
                }
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    var textdraw = WPImager.layer[WPImager.current];
                    $(this).spinner("value", textdraw.rotation);
                }
                WPImagerUI.flagCanvasSave();
            });

            // text rotate zero reset link
            $('#rotateTextReset').click(function () {
                WPImager.setMultiLayerText("rotation", 0, true);
                WPImager.setMultiLayerImage("imgrotation", 0);
                $("#rotateText").spinner("value", 0);
                $('#resizeTextWidth2Canvas,#resizeTextHeight2Canvas,#resizeText2Canvas').removeClass('disabled');
                draw();
                WPImagerUI.flagCanvasSave();
            });

            // text rotate zero reset link
            $('#rotateTextAngleReset').click(function () {
                WPImager.setMultiLayerText("textangle", 0, true);
                $("#textAngle").spinner("value", 0);
                $('#resizeTextWidth2Canvas,#resizeTextHeight2Canvas,#resizeText2Canvas').removeClass('disabled');
                draw();
                WPImagerUI.flagCanvasSave();
            });

            // text start and end angle zero reset link
            $('#growAngleReset').click(function () {
                WPImager.setMultiLayerText("textangle1", 0, true);
                WPImager.setMultiLayerText("textangle2", 0, true);
                $("#txtAngle1").spinner("value", 0);
                $("#txtAngle2").spinner("value", 0);
                draw();
                WPImagerUI.flagCanvasSave();
            });

            // show text outline console link
            $('#showTextOutlineConsole').click(function () {
                UI.console = UI.CNSL.TXTOUTLINE;
                UI.isCropping = false;
                WPImager.layerControlUpdate(WPImager.current);
                $(".cvsconsole").hide();
                $("#outlinetextconsole").show();
                draw();
            });

            // text outline size spinner
            WPImagerCtrls.initSpinnerText("#outlineText", 0, null, 1, "textoutline", null);

            // text outline color picker 
            $('#outlinecolorText').colorichpicker({showOn: 'button', transparentColor: false}).on('change.color', function (evt, color) {
                if (WPImager.boot > 0)
                    if (!UI.isUndoRedoing && UI.validateColorHex($(this).val()) !== false) {
                        WPImager.setMultiLayerText("textoutlinecolor", $('#outlinecolorText').val(), true);
                        WPImagerUI.flagCanvasSave();
                    }
                draw();
            }).on('canvaspick.color', function (evt) {
                WPImager.savePickerColor($(this).attr('id'), WPImager.layer[WPImager.current].textoutlinecolor);
            }).on('blur', function () {
                if (UI.validateColorHex($(this).val()) === false) {
                    var color = WPImager.layer[WPImager.current].textoutlinecolor;
                    $(this).val(color);
                    $(this).colorichpicker({color: color});
                }
            });

            // text outline zero reset
            $('#outlineTextReset').click(function () {
                WPImager.setMultiLayerText("textoutline", 0, true);
                $("#outlineText").spinner("value", 0);
                draw();
                WPImagerUI.flagCanvasSave();
            });

            // show text border console link
            $('#showTextBorderConsole').click(function () {
                UI.console = UI.CNSL.TXTBORDER;
                UI.isCropping = false;
                WPImager.layerControlUpdate(WPImager.current);
                $(".cvsconsole").hide();
                $("#bordertextconsole").show();
                draw();
            });

            $("[id^='show']").click(function () {
                $("[id^='show'],#modeTextEdit,#modeTextEdit2").removeClass("active");
                $(this).addClass("active");
            });
            // text border size spinner
            WPImagerCtrls.initSpinnerText("#borderText", 0, null, 1, "textborder", "imgborder");
            WPImagerCtrls.initSpinnerText("#borderText2", 1, null, 1, "textborder", "imgborder");
            WPImagerCtrls.initSpinnerText("#borderGap", 0, null, 1, "bordergap");

            $("#borderText").spinner({spin: function (event, ui) {
                    if ($(this).spinner("isValid")) {
                        var enablegap = (parseInt(ui.value) !== 0 && !isNaN(ui.value));
                        $("#borderGap").spinner({"disabled": !enablegap});
                    }
                }
            });


            $('#bordergapcolor').colorichpicker({showOn: 'button', transparentColor: true, canvaspicker: true}).on('change.color', function (evt, color) {
                if (WPImager.boot > 0)
                    if (!UI.isUndoRedoing && UI.validateColorHex($(this).val()) !== false) {
                        WPImager.setMultiLayerText("bordergapcolor", $('#bordergapcolor').val(), true);
                        WPImagerUI.flagCanvasSave();
                    }
                draw();
            }).on('canvaspick.color', function (evt) {
                WPImager.savePickerColor($(this).attr('id'), WPImager.layer[WPImager.current].bordergapcolor);
            }).on('blur', function () {
                if (UI.validateColorHex($(this).val()) === false) {
                    var color = WPImager.layer[WPImager.current].bordergapcolor;
                    $(this).val(color);
                    $(this).colorichpicker({color: color});
                }
            });

            // text border color picker 
            $('#bordercolorText,#bordercolorText2').colorichpicker({showOn: 'button', transparentColor: false}).on('change.color', function (evt, color) {
                if (WPImager.boot > 0)
                    if (!UI.isUndoRedoing && UI.validateColorHex($(this).val()) !== false) {
                        WPImager.setMultiLayerText("textbordercolor", $('#' + $(this).attr('id')).val(), true);
                        WPImager.setMultiLayerImage("imgbordercolor", $('#' + $(this).attr('id')).val(), false);
                        WPImagerUI.flagCanvasSave();
                    }
                draw();
            }).on('canvaspick.color', function (evt) {
                WPImager.savePickerColor($(this).attr('id'), WPImager.layer[WPImager.current].textbordercolor);
            }).on('blur', function () {
                if (UI.validateColorHex($(this).val()) === false) {
                    var color = WPImager.layer[WPImager.current].textbordercolor;
                    $(this).val(color);
                    $(this).colorichpicker({color: color});
                }
            });


            // text corner radius spinner
            $("#radiusText").spinner({
                min: 0,
                step: 1,
                stop: function (event, ui) {
                    if ($("#radiusText").spinner("isValid")) {
                        var textradius = parseInt($("#radiusText").spinner("value"));
                        WPImager.setMultiLayerText("textradius", textradius, true);
                        WPImager.setMultiLayerImage("imgradius", textradius);
                        for (var i = 0; i < WPImager.multiselect.length; i++)
                            WPImagerUI.resize_image(WPImager.multiselect[i]);
                        draw();
                    }
                }
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    var textdraw = WPImager.layer[WPImager.current];
                    $(this).spinner("value", textdraw.textradius);
                }
                WPImagerUI.flagCanvasSave();
            });


            // text dash
            $("#borderTextDash,#borderTextSpace,#borderTextDashset").spinner({
                min: -100,
                step: 1,
                stop: function (event, ui) {
                    var id = $(this).attr("id");
                    var index = (id.slice(-1) == "2") ? "2" : "";
                    if ($("#borderTextDash" + index).spinner("isValid") && $("#borderTextSpace" + index).spinner("isValid") && $("#borderTextDashset" + index).spinner("isValid")) {
                        var borderdash = WPImager.layer[WPImager.current].textborderdash.split(" ");
                        WPImager.layer[WPImager.current].textborderdash = ($('#borderTextStyle' + index).val() == "solid" ? "0" : "1");
                        if ($('#borderTextStyle' + index).val() == "dashedgap") {
                            WPImager.layer[WPImager.current].textborderdash = "2";
                        }
                        if (borderdash.length == 4) {
                            WPImager.layer[WPImager.current].textborderdash += " " + $("#borderTextDash" + index).spinner("value");
                            WPImager.layer[WPImager.current].textborderdash += " " + $("#borderTextSpace" + index).spinner("value");
                            WPImager.layer[WPImager.current].textborderdash += " " + $("#borderTextDashset" + index).spinner("value");
                            WPImager.setMultiLayerText("textborderdash", WPImager.layer[WPImager.current].textborderdash, true);
                        }
                        draw();
                    }
                }
            }).on('blur', function () {
                draw(true);
            });

            $('#borderTextDash,#borderTextSpace,#borderTextDash2').spinner('option', 'min', 1);

            // text border and radius zero reset
            $('#borderTextReset').click(function () {
                WPImager.setMultiLayerText("textradius", 0, true);
                WPImager.setMultiLayerText("textborder", 0, true);
                $("#radiusText").spinner("value", 0);
                $("#borderText").spinner("value", 0);
                draw();
                WPImagerUI.flagCanvasSave();
            });

//            $('#borderTextReset2').click(function () {
//                // WPImager.setMultiLayerText("textborder", 1, true);
//                $("#borderText2").spinner("value", 1);
//                draw();
//                WPImagerUI.flagCanvasSave();
//            });


            // show image crop console
            $('#showTextSkewConsole').click(function () {
                UI.console = UI.CNSL.TXTSKEW;
                $(".cvsconsole").hide();
                $("#skewtextconsole").show();
                if (WPImager.layer[WPImager.current].code == UI.LAYER.COM ||
                        WPImager.layer[WPImager.current].shape == UI.SHAPE.TRAPEZOID ||
                        WPImager.layer[WPImager.current].shape == UI.SHAPE.RIBBON) {
                    var skewB, skewA;
                    skewA = WPImager.layer[WPImager.current].skewA;
                    skewB = WPImager.layer[WPImager.current].skewB;

                    $("#txtskewsym").prop("checked", parseInt(skewA) == parseInt(skewB));
                    $("#skewAText").spinner("value", skewA);
                    $("#skewBText").spinner("value", skewB);
                    $(".shape_trapezoid_hide").hide();
                    $(".shape_trapezoid_show").show();

                } else if (WPImager.layer[WPImager.current].shape == UI.SHAPE.PARALLELOGRAM) {
                    var skewP = WPImager.layer[WPImager.current].skewP;
                    $("#skewAText").spinner("value", skewP);
                    $(".shape_parallel_hide").hide();
                    $(".shape_parallel_show").show();
                }

                if (WPImager.layer[WPImager.current].skewDir == 1) {
                    $("#skewVText").click();
                } else {
                    $("#skewHText").click();
                }

                draw();
            });

            $("#skewVText").click(function () {
                WPImager.layer[WPImager.current].skewDir = 1;
                draw();
                $("#skewHText span").removeClass("text-primary");
                $("#skewVText span").addClass("text-primary");
                $("#labelSkewAText").text("Top");
                $("#labelSkewBText").text("Bottom");
            });

            $("#skewHText").click(function () {
                WPImager.layer[WPImager.current].skewDir = 0;
                draw();
                $("#skewVText span").removeClass("text-primary");
                $("#skewHText span").addClass("text-primary");
                $("#labelSkewAText").text("Left");
                $("#labelSkewBText").text("Right");
            });

            $("#skewFlipText").click(function () {
                if (WPImager.layer[WPImager.current].shape == UI.SHAPE.TRAPEZOID
                        || WPImager.layer[WPImager.current].shape == UI.SHAPE.RIBBON) {
                    WPImager.layer[WPImager.current].skewA *= -1;
                    WPImager.layer[WPImager.current].skewB *= -1;
                    $("#skewBText").spinner("value", -$("#skewBText").spinner("value"));
                    $("#skewAText").spinner("value", -$("#skewAText").spinner("value"));
                } else {
                    WPImager.layer[WPImager.current].skewP *= -1;
                    $("#skewAText").spinner("value", -$("#skewAText").spinner("value"));
                }
                draw();
            });

            // image skew width spinner
            $("#skewAText").spinner({
                min: -2000,
                step: 1,
                stop: function (event, ui) {
                    if ($("#skewAText").spinner("isValid")) {
                        if (WPImager.layer[WPImager.current].code == UI.LAYER.COM
                                || WPImager.layer[WPImager.current].shape == UI.SHAPE.TRAPEZOID
                                || WPImager.layer[WPImager.current].shape == UI.SHAPE.RIBBON) {
                            var skewA = parseInt($(this).spinner("value"));
                            WPImager.layer[WPImager.current].skewA = skewA;
                            if ($("#txtskewsym").prop("checked")) {
                                WPImager.layer[WPImager.current].skewB = skewA;
                                $("#skewBText").spinner("value", parseInt($(this).spinner("value")));
                            }
                        } else {
                            var skewP = parseInt($(this).spinner("value"));
                            WPImager.layer[WPImager.current].skewP = skewP;
                        }
                        draw(true);
                    }
                    event.preventDefault();
                }
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    var skew;
                    if (WPImager.layer[WPImager.current].code == UI.LAYER.COM
                            || WPImager.layer[WPImager.current].shape == UI.SHAPE.TRAPEZOID
                            || WPImager.layer[WPImager.current].shape == UI.SHAPE.RIBBON) {
                        skew = WPImager.layer[WPImager.current].skewA;
                    } else {
                        skew = WPImager.layer[WPImager.current].skewP;
                    }
                    $(this).spinner("value", skew);
                }
            });

            // image skew width spinner
            $("#skewBText").spinner({
                min: -2000,
                step: 1,
                stop: function (event, ui) {
                    if ($("#skewBText").spinner("isValid")) {
                        var skewB = parseInt($(this).spinner("value"));
                        WPImager.layer[WPImager.current].skewB = skewB;
                        if ($("#txtskewsym").prop("checked")) {
                            WPImager.layer[WPImager.current].skewA = skewB;
                            $("#skewAText").spinner("value", parseInt($(this).spinner("value")));
                        }
                        draw(true);
                    }
                    event.preventDefault();
                }
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    var skew = WPImager.layer[WPImager.current].skewB;
                    $(this).spinner("value", skew);
                }
            });


            // show text crop console
            $('#showTextCropConsole').click(function () {
                UI.console = UI.CNSL.TXTCROP;
                UI.isCropping = true;
                var textdraw = WPImager.layer[WPImager.current];
                $("#cropTextWidth").spinner("value", textdraw.width);
                $("#cropTextHeight").spinner("value", textdraw.height);
                $(".cvsconsole").hide();
                $("#croptextconsole").show();
                draw();
            });


            $('#shadowtextconsole .toggle').click(function () {
                $('#shadowtextconsole .inactive,#shadowtextconsole .active').toggle();
                var textdraw = WPImager.layer[WPImager.current];
                textdraw.textshadowOn = $('#shadowTextOn').is(':visible');
                WPImager.setMultiLayerText("textshadowOn", textdraw.textshadowOn, true);
                WPImager.layerControlUpdate(WPImager.current);
                draw(true);
            });
            $('#shadowfilltextconsole .toggle').click(function () {
                $('#shadowfilltextconsole .inactive,#shadowfilltextconsole .active').toggle();
                var textdraw = WPImager.layer[WPImager.current];
                textdraw.textshadowfillOn = $('#shadowTextFillOn').is(':visible');
                WPImager.setMultiLayerText("textshadowfillOn", textdraw.textshadowfillOn, true);
                WPImager.layerControlUpdate(WPImager.current);
                draw(true);
            });
            $('#circulartextconsole .toggle').click(function () {
                $('#circulartextconsole .inactive,#circulartextconsole .active').toggle();
                var textdraw = WPImager.layer[WPImager.current];
                textdraw.circOn = $('#circTextOn').is(':visible');
                WPImager.setMultiLayerText("circOn", textdraw.circOn, true);
                WPImager.layerControlUpdate(WPImager.current);
                draw(true);
            });
            $('#curvedtexttoolbar .uprightText').click(function () {
                $('#curvedtexttoolbar .uprightText.inactive,#curvedtexttoolbar .uprightText.active').toggle();
                var textdraw = WPImager.layer[WPImager.current];
                textdraw.textupright = $('#uprightTextOn').is(':visible');
                WPImager.setMultiLayerText("textupright", textdraw.textupright, true);
                WPImager.layerControlUpdate(WPImager.current);
                draw(true);
            });

            $("#curvedtexttoolbar .txtGrowDir").click(function () {
                var dir = parseInt($(this).data("dir"));
                WPImager.layer[WPImager.current].growdir = dir;
                WPImager.setMultiLayerText("growdir", dir, true);
                WPImager.layerControlUpdate(WPImager.current);
                draw(true);
            });

            $('#circIO').change(function () {
                if (!UI.isUndoRedoing) {
                    WPImager.layer[WPImager.current].circio = $('#circIO').val();
                    WPImagerUI.flagCanvasSave();
                }
                draw();
            });


            // show text shadow console
            $('#showTextShadowConsole').click(function () {
                UI.console = UI.CNSL.TXTSHADOW;
                $(".cvsconsole").hide();
                $("#shadowtextconsole").show();
                draw();
            });

            // text shadow color picker
            $('#shadowcolorText').colorichpicker({showOn: 'button', transparentColor: false, canvaspicker: false}).on('change.color', function (evt, color) {
                if (WPImager.boot > 0)
                    if (!UI.isUndoRedoing && UI.validateColorHex($(this).val()) !== false) {
                        WPImager.setMultiLayerText("textshadowcolor", $('#shadowcolorText').val(), true);
                        WPImagerUI.flagCanvasSave();
                    }
                draw();
            }).on('canvaspick.color', function (evt) {
                WPImager.savePickerColor($(this).attr('id'), WPImager.layer[WPImager.current].textshadowcolor);
            }).on('blur', function () {
                if (UI.validateColorHex($(this).val()) === false) {
                    var color = WPImager.layer[WPImager.current].textshadowcolor;
                    $(this).val(color);
                    $(this).colorichpicker({color: color});
                }
            });

            // show text shadow console
            $('#showTextShadowFillConsole').click(function () {
                UI.console = UI.CNSL.TXTSHADOWFILL;
                $(".cvsconsole").hide();
                $("#shadowfilltextconsole").show();
                draw();
            });

            // text background shadow color picker
            $('#shadowcolorTextFill').colorichpicker({showOn: 'button', transparentColor: false, canvaspicker: false}).on('change.color', function (evt, color) {
                if (WPImager.boot > 0)
                    if (!UI.isUndoRedoing && UI.validateColorHex($(this).val()) !== false) {
                        WPImager.setMultiLayerText("textshadowfillcolor", $('#shadowcolorTextFill').val(), true);
                        WPImagerUI.flagCanvasSave();
                    }
                draw();
            }).on('canvaspick.color', function (evt) {
                WPImager.savePickerColor($(this).attr('id'), WPImager.layer[WPImager.current].textshadowfillcolor);
            }).on('blur', function () {
                if (UI.validateColorHex($(this).val()) === false) {
                    var color = WPImager.layer[WPImager.current].textshadowfillcolor;
                    $(this).val(color);
                    $(this).colorichpicker({color: color});
                }
            });


            // text shadow spinners
            WPImagerCtrls.initSpinnerText("#shadowText", 0, 999, 1, "textshadow", null);
            WPImagerCtrls.initSpinnerText("#shadowOxText", -999, 999, 1, "textshadowOx", null);
            WPImagerCtrls.initSpinnerText("#shadowOyText", -999, 999, 1, "textshadowOy", null);
            WPImagerCtrls.initSpinnerText("#shadowTextFill", 0, 999, 1, "textshadowfill", null);
            WPImagerCtrls.initSpinnerText("#shadowOxTextFill", -999, 999, 1, "textshadowfillOx", null);
            WPImagerCtrls.initSpinnerText("#shadowOyTextFill", -999, 999, 1, "textshadowfillOy", null);

            // text shadow zero reset
            $('#resetShadowText').click(function () {
                WPImager.setMultiLayerText("textshadow", 0, true);
                WPImager.setMultiLayerText("textshadowfill", 0, true);
                WPImager.setMultiLayerText("textshadowOx", 0, true);
                WPImager.setMultiLayerText("textshadowOy", 0, true);
                WPImager.setMultiLayerText("textshadowfillOx", 0, true);
                WPImager.setMultiLayerText("textshadowfillOy", 0, true);
                $("#shadowText").spinner("value", 0);
                $("#shadowOxText").spinner("value", 0);
                $("#shadowOyText").spinner("value", 0);
                $("#shadowTextFill").spinner("value", 0);
                $("#shadowOxTextFill").spinner("value", 0);
                $("#shadowOyTextFill").spinner("value", 0);
                draw(true);
            });

            // hide console when OK button clicked
            $('#hideTextRadiusConsole, #hideTextShadowConsole, #cancelTextCrop').click(function () {
                $(".cvsconsole").hide();
                $("#txtconsole_task,#texttoolbar").show();
                $("[id^='show']").removeClass("active");
                $("#showTextToolbar").addClass("active");
                UI.isCropping = false;
                UI.console = UI.CNSL.TXTTOOLBAR;
                draw();
            });

            $(".btn-tab").click(function (e) {
                var tabID = $(this).attr("id");
                if (tabID == "showShapeEditConsole") {
                    // skip
                } else if (UI.console_shape == UI.CNSL.SHAPETOOLEDIT || UI.console_shape == UI.CNSL.SHAPETOOLDRAW) {
                    UI.console_shape = UI.CNSL.SHAPETOOLMOVE;
                    draw();
                }

            });
        },
        initImageControls: function () {
            /*** image input events ***/
            $('#img_oalign_left, #img_oalign_center, #img_oalign_right').click(function (e) {
                var id = $(this).attr("id");
                var oalign = id.replace(/img_oalign_/gi, "");
                WPImager.layerEdgeHandlers(WPImager.current);
                WPImager.layerAlignHorizontal(oalign, WPImager.current);
                for (var i = 0; i < WPImager.multiselect.length; i++) {
                    var index = WPImager.multiselect[i];
                    WPImager.layerEdgeHandlers(index);
                    WPImager.layerAlignHorizontal(oalign, index);
                }
                draw();
                WPImagerUI.flagCanvasSave();
                e.preventDefault();
            });
            $('#img_ovalign_top, #img_ovalign_middle, #img_ovalign_bottom').click(function (e) {
                var id = $(this).attr("id");
                var voalign = id.replace(/img_ovalign_/gi, "");
                WPImager.layerEdgeHandlers(WPImager.current);
                WPImager.layerAlignVertical(voalign, WPImager.current);
                for (var i = 0; i < WPImager.multiselect.length; i++) {
                    var index = WPImager.multiselect[i];
                    WPImager.layerEdgeHandlers(index);
                    WPImager.layerAlignVertical(voalign, index);
                }
                draw();
                WPImagerUI.flagCanvasSave();
                e.preventDefault();
            });

            $('[id^="imgbase_"]').click(function (e) {
                var icon = "fa-square-o";
                var id = $(this).attr("id");
                if (id == "imgbase_rectangle") {
                    WPImager.layer[WPImager.current].imgshape = UI.SHAPE.RECTANGLE;
                    icon = "fa-square-o stretch";
                } else if (id == "imgbase_square") {
                    WPImager.layer[WPImager.current].imgshape = UI.SHAPE.SQUARE;
                    icon = "fa-square-o";
                } else if (id == "imgbase_circle") {
                    WPImager.layer[WPImager.current].imgshape = UI.SHAPE.CIRCLE;
                    icon = "fa-circle-thin";
                } else if (id == "imgbase_ellipse") {
                    WPImager.layer[WPImager.current].imgshape = UI.SHAPE.ELLIPSE;
                    icon = "fa-circle-thin stretch";
                } else if (id == "imgbase_parallelogram") {
                    WPImager.layer[WPImager.current].imgshape = UI.SHAPE.PARALLELOGRAM;
                    icon = "fa-square-o skewed";
                } else if (id == "imgbase_trapezoid") {
                    WPImager.layer[WPImager.current].imgshape = UI.SHAPE.TRAPEZOID;
                    icon = "fa-square-o trapezoid";
                }
                $("#btnBaseShapeImg").html('<span class="fa ' + icon + '"></span>');
                if (id == "imgbase_square" || id == "imgbase_circle") {
                    var imgdraw = WPImager.layer[WPImager.current];
                    if (imgdraw.imgcrop_h == 0 || imgdraw.imgcrop_w == 0 ||
                            imgdraw.layerWidth() != imgdraw.layerHeight()) {
                        var layerWidth = Math.min(imgdraw.layerWidth(), imgdraw.layerHeight());
                        var imgcrop_w = imgdraw.imgcrop_w;
                        var imgcrop_h = imgdraw.imgcrop_h;

                        imgdraw.imgcrop_w = imgdraw.calCropWidth(layerWidth);
                        imgdraw.imgcrop_h = imgdraw.calCropHeight(layerWidth);
                        if (imgcrop_h == 0 || imgcrop_w == 0) {
                            imgdraw.imgcrop_x += ((imgdraw.imgwidth_ori - imgdraw.imgcrop_w) / 2);
                            imgdraw.imgcrop_y += ((imgdraw.imgheight_ori - imgdraw.imgcrop_h) / 2);
                        } else {
                            imgdraw.imgcrop_x += ((imgcrop_w - imgdraw.imgcrop_w) / 2);
                            imgdraw.imgcrop_y += ((imgcrop_h - imgdraw.imgcrop_h) / 2);
                        }
                        draw();
                    }
                }
                WPImagerUI.resize_image(WPImager.current);
                draw();
                WPImagerUI.flagCanvasSave();
                WPImagerUI.resetConsoleImage();
                WPImager.layerControlUpdate(WPImager.current);
                WPImager.updateLayerTab();
                if (id == "imgbase_trapezoid" || id == "imgbase_parallelogram") {
                    $('#showSkewImageConsole').click();
                }
                e.preventDefault();
            });

            $("#resetImageSize").click(function (e) {
                var i = WPImager.current;
                var imgdraw = WPImager.layer[i];
                imgdraw.imgshape = UI.SHAPE.RECTANGLE;
                if (imgdraw.imgwidth_ori > 0 && imgdraw.imgheight_ori > 0)
                {
                    var x = imgdraw.posX();
                    var y = imgdraw.posY();
                    imgdraw.imgwidth = imgdraw.imgwidth_ori; // thisimg.width;
                    imgdraw.imgheight = imgdraw.imgheight_ori;
                    imgdraw.imgx = (x - imgdraw.imgwidth / 2);
                    imgdraw.imgy = (y - imgdraw.imgheight / 2);
                    imgdraw.imgcrop_x = 0;
                    imgdraw.imgcrop_y = 0;
                    imgdraw.imgcrop_w = 0;
                    imgdraw.imgcrop_h = 0;
                    WPImagerUI.loadImageShow(WPImager.current, WPImager.layer[i].src);
                    WPImagerUI.resize_image(WPImager.current);
                }
                WPImagerUI.flagCanvasSave();
                WPImager.layerControlUpdate(WPImager.current);
                $(".cvsconsole").hide();

            });

            $("#resetImage").click(function (e) {
                var imgdraw = WPImager.layer[WPImager.current];
                var i = WPImager.current;

                if (imgdraw.imgwidth_ori > 0 && imgdraw.imgheight_ori > 0)
                {
                    imgdraw.imgrotation = 0;
                    imgdraw.imgshape = UI.SHAPE.RECTANGLE;
                    imgdraw.imgalpha = 100;
                    imgdraw.imgwidth = imgdraw.imgwidth_ori; // thisimg.width;
                    imgdraw.imgheight = imgdraw.imgheight_ori;
                    imgdraw.imgx = (WPImager.canvas.width - imgdraw.imgwidth_ori) / 2;
                    imgdraw.imgy = (WPImager.canvas.height - imgdraw.imgheight_ori) / 2;
                    imgdraw.imgcrop_x = 0;
                    imgdraw.imgcrop_y = 0;
                    imgdraw.imgcrop_w = 0;
                    imgdraw.imgcrop_h = 0;
                    WPImagerUI.loadImageShow(WPImager.current, WPImager.layer[i].src);
                    WPImagerUI.resize_image(WPImager.current);
                    UI.isCropping = false;
                    $("#cropimageconsole").hide(); // in case reset while cropping image
                }
                $("#btnBaseShapeImg").html('<span class="fa fa-square-o stretch"></span>');
                WPImagerUI.flagCanvasSave();
                WPImager.layerControlUpdate(WPImager.current);
                return false;
            });



            $("#resizeImage2Canvas").click(function (e) {
                if (WPImager.layer[WPImager.current].imgshape == UI.SHAPE.SQUARE || WPImager.layer[WPImager.current].imgshape == UI.SHAPE.CIRCLE) {
                    if (WPImager.canvas.width > WPImager.canvas.height) {
                        WPImager.layerApplyCanvasHeight(WPImager.current);
                        WPImager.layerEdgeHandlers(WPImager.current);
                        WPImager.layerAlignVertical("top", WPImager.current);
                    } else {
                        WPImager.layerApplyCanvasWidth(WPImager.current);
                        WPImager.layerEdgeHandlers(WPImager.current);
                        WPImager.layerAlignHorizontal("left", WPImager.current);
                    }
                    $("#img_oalign_center").click();
                } else {
                    WPImager.layerApplyCanvasWidth(WPImager.current);
                    WPImager.layerEdgeHandlers(WPImager.current);
                    WPImager.layerAlignHorizontal("left", WPImager.current);
                    WPImager.layerApplyCanvasHeight(WPImager.current);
                    WPImager.layerAlignVertical("top", WPImager.current);
                }
                WPImagerUI.resize_image(WPImager.current);
                WPImager.layerControlUpdate(WPImager.current);
                draw();
                WPImagerUI.flagCanvasSave();
                setTimeout(function () {
                    $("#resizeImage2Canvas").removeClass("active");
                }, 100);
            });
            $("#resizeWidthImage2Canvas").click(function (e) {
                WPImager.layerApplyCanvasWidth(WPImager.current);
                WPImager.layerEdgeHandlers(WPImager.current);
                WPImager.layerAlignHorizontal("left", WPImager.current);
                WPImagerUI.resize_image(WPImager.current);
                WPImager.layerControlUpdate(WPImager.current);
                draw();
                WPImagerUI.flagCanvasSave();
                e.preventDefault();
                setTimeout(function () {
                    $("#resizeWidthImage2Canvas").removeClass("active");
                }, 100);
            });
            $("#resizeHeightImage2Canvas").click(function (e) {
                WPImager.layerApplyCanvasHeight(WPImager.current);
                WPImager.layerEdgeHandlers(WPImager.current);
                WPImager.layerAlignVertical("top", WPImager.current);
                WPImagerUI.resize_image(WPImager.current);
                if (WPImager.layer[WPImager.current].imgshape == UI.SHAPE.SQUARE || WPImager.layer[WPImager.current].imgshape == UI.SHAPE.CIRCLE) {
                    $("#img_oalign_center").click();
                }
                WPImager.layerControlUpdate(WPImager.current);
                draw();
                WPImagerUI.flagCanvasSave();
                setTimeout(function () {
                    $("#resizeHeightImage2Canvas").removeClass("active");
                }, 100);
            });



            $('#resetCropImage').click(function () {
                UI.isCropping = false;
                var layer = WPImager.current;
                WPImager.layer[layer].imgcrop_x = 0;
                WPImager.layer[layer].imgcrop_y = 0;
                WPImager.layer[layer].imgcrop_w = 0;
                WPImager.layer[layer].imgcrop_h = 0;
                WPImagerUI.resize_image(WPImager.current);
                WPImager.layerControlUpdate(WPImager.current);
                WPImagerUI.resetConsoleImage();
                draw();
            });
            $('#cancelCropImage').click(function () {
                UI.isCropping = false;
                WPImagerUI.resize_image(WPImager.current);
                WPImagerUI.resetConsoleImage();
                draw();
            });
            $('#cropImage').click(function () {
                UI.isCropping = false;
                WPImager.cropImage();
                WPImagerUI.resize_image(WPImager.current);
                WPImager.layerControlUpdate(WPImager.current);
                draw();
                WPImagerUI.flagCanvasSave();
                WPImagerUI.resetConsoleImage();
            });
            $('#cropImageDownload').click(function () {
                var imgdraw = WPImager.layer[WPImager.current];
                var fname = WPImagerUI.convertToSlug($("#pagetitle").text());
                UI.isPrinting = true;
                WPImagerUI.resize_image(WPImager.current);
                draw();

                var cropped = document.createElement('canvas');
                var cropctx = cropped.getContext('2d');
                var border = imgdraw.imgborder;
                var x = 0, //UI.cropBox.x,
                        y = 0, //UI.cropBox.y,
                        w = Math.round(UI.cropBox.width),
                        h = Math.round(UI.cropBox.height);

                cropped.width = w + border * 2;
                cropped.height = h + border * 2;

                var imgalpha = imgdraw.imgalpha;
                imgalpha = (imgalpha >= 10 && imgalpha <= 100) ? (imgalpha / 100) : 1;
                cropctx.globalAlpha = imgalpha;
                cropctx.drawImage(WPImagerUI.imgcanvas[WPImager.current], x, y, w, h, border, border, w, h);
                cropctx.lineWidth = border;
                cropctx.strokeStyle = imgdraw.imgbordercolor;
                if (parseInt(border) > 0) {
                    // draw border
                    WPImagerUI.roundedRect(cropctx, border, border, w, h, imgdraw.imgradius, false, true);
                }
                var ext = WPImager.canvas.ext;
                if (cropped.msToBlob) { //for IE
                    var blob = cropped.msToBlob();
                    window.navigator.msSaveBlob(blob, fname + "." + ext);
                } else if (UI.support_download) {
                    // download attribute supported by browser
                    Canvas2Image.saveAsImage(cropped, 0, 0, cropped.width, cropped.height, ext, fname + "." + ext);
                } else {
                    // download attribute not supported, upload then download image
                    var imgBase64 = Canvas2Image.convertToImage(cropped, 0, 0, cropped.width, cropped.height, ext);
                    imgBase64 = imgBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
                    WPImager.postdownload(imgBase64, ext);
                }
                UI.isPrinting = false;
                WPImagerUI.resize_image(WPImager.current);
            });

            /* Image Layers spinners */
            $("#alphaImage").spinner({
                min: 1,
                max: 100,
                step: 1,
                stop: function (event, ui) {
                    if ($("#alphaImage").spinner("isValid")) {
                        var imgdraw = WPImager.layer[WPImager.current];
                        imgalpha = parseInt($("#alphaImage").spinner("value"));
                        WPImager.setMultiLayerImage("imgalpha", imgalpha, true);
                        WPImager.setMultiLayerText("alpha", imgalpha);
                        draw();
                        WPImager.layerControlUpdate(WPImager.current);
                    }
                }
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    var imgdraw = WPImager.layer[WPImager.current];
                    $(this).spinner("value", imgdraw.imgalpha);
                    draw();
                }
                WPImagerUI.flagCanvasSave();
            });



            $("#imageHeight").spinner({
                min: 20,
                step: 1,
                stop: function (event, ui) {
                    if ($("#imageHeight").spinner("isValid")) {
                        var height = $(this).spinner("value");
                        WPImager.spinHeight(height, WPImager.current, true, true);
                        WPImagerUI.resize_image(WPImager.current);
                        WPImager.multi_size_sync(WPImager.current);
                        draw();
                    }
                },
                spin: function (event, ui) {
                    if ($("#imageHeight").spinner("isValid")) {
                        var height = ui.value;
                        WPImager.spinHeight(height, WPImager.current, true, true);
                        WPImagerUI.resize_image(WPImager.current);
                        WPImager.multi_size_sync(WPImager.current);
                        draw();
                    }
                }
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    var imgdraw = WPImager.layer[WPImager.current];
                    if (imgdraw.imgcrop_h == 0 || imgdraw.imgcrop_w == 0) {
                        $(this).spinner("value", imgdraw.imgheight);
                    } else {
                        var scaleY = imgdraw.imgheight / imgdraw.imgheight_ori;
                        $(this).spinner("value", imgdraw.imgcrop_h * scaleY);
                    }
                    draw();
                }
                WPImagerUI.flagCanvasSave();
            });



            $("#imageWidth").spinner({
                min: 20,
                step: 1,
                stop: function (event, ui) {
                    if ($("#imageWidth").spinner("isValid")) {
                        var width = $(this).spinner("value");
                        WPImager.spinWidth(width, WPImager.current, true, true);
                        WPImagerUI.resize_image(WPImager.current);
                        WPImager.multi_size_sync(WPImager.current);
                        draw();
                    }
                },
                spin: function (event, ui) {
                    if ($("#imageWidth").spinner("isValid")) {
                        var width = ui.value;
                        WPImager.spinWidth(width, WPImager.current, true, true);
                        WPImagerUI.resize_image(WPImager.current);
                        WPImager.multi_size_sync(WPImager.current);
                        draw();
                    }
                }
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    var imgdraw = WPImager.layer[WPImager.current];
                    if (imgdraw.imgcrop_h == 0 || imgdraw.imgcrop_w == 0) {
                        $(this).spinner("value", imgdraw.imgwidth);
                    } else {
                        var scaleX = imgdraw.imgwidth / imgdraw.imgwidth_ori;
                        $(this).spinner("value", imgdraw.imgcrop_w * scaleX);
                    }
                }
                WPImager.layer[WPImager.current].ui_refresh();
//                UI.isResizeDrag = false;
                WPImagerUI.resize_image(WPImager.current);
                draw();
                WPImagerUI.flagCanvasSave();
            });


        },
        initImageConsoles: function () {
            var canvas_id = parseInt($("#canvas_id").val());

            $('#showMainImageConsole').click(function () {
                UI.console = UI.CNSL.IMGMAIN;
                UI.isCropping = false;
                $(".cvsconsole").hide();
                $("#mainimageconsole").show();

            });

            // show rotate image console
            $('#showRotateImageConsole').click(function () {
                UI.console = UI.CNSL.IMGROTATE;
                UI.isCropping = false;
                $("#rotateImage_ori").val(WPImager.layer[WPImager.current].imgrotation);
                $(".cvsconsole").hide();
                $("#imgconsole").show();
                $("#rotateimageconsole").show();
                WPImagerUI.resize_image(WPImager.current);
                draw();
            });

            //  image rotate spinner
            $("#rotateImage").spinner({
                min: -360,
                max: 360,
                step: 1,
                stop: function (event, ui) {
                    if ($("#rotateImage").spinner("isValid")) {
                        var imgdraw = WPImager.layer[WPImager.current];
                        imgrotation = parseInt($("#rotateImage").spinner("value"));
                        WPImager.setMultiLayerImage("imgrotation", imgrotation, true);
                        WPImager.setMultiLayerText("rotation", imgrotation);

                        var is90deg = (imgdraw.imgrotation % 90 == 0);
                        if (is90deg) {
                            $('#resizeWidthImage2Canvas,#resizeHeightImage2Canvas,#resizeImage2Canvas').removeClass('disabled');
                        } else {
                            $('#resizeWidthImage2Canvas,#resizeHeightImage2Canvas,#resizeImage2Canvas').addClass('disabled');
                        }
                        draw();
                        //   WPImager.layerControlUpdate(WPImager.current);
                        WPImager.layerEdgeHandlers(WPImager.current);
                        WPImagerUI.flagCanvasDirty();
                    }
                }
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    var imgdraw = WPImager.layer[WPImager.current];
                    $(this).spinner("value", imgdraw.imgrotation);
                    draw();
                }
                WPImagerUI.flagCanvasSave();
            });

            //  image rotate zero reset
            $('#resetRotateImage').click(function () {
                WPImager.setMultiLayerImage("imgrotation", 0, true);
                WPImager.setMultiLayerText("rotation", 0);
                $("#rotateImage").spinner("value", 0);
                $('#resizeWidthImage2Canvas,#resizeHeightImage2Canvas,#resizeImage2Canvas').removeClass('disabled');
                draw(true);
            });

            // show image border console
            $('#showImageBorderConsole').click(function () {
                UI.console = UI.CNSL.IMGBORDER;
                UI.isCropping = false;
                WPImager.layerControlUpdate(WPImager.current);
                $('#bordercolorImage').colorichpicker({color: WPImager.layer[WPImager.current].imgbordercolor});
                $("#radiusImage_ori").val(WPImager.layer[WPImager.current].imgradius);
                $("#borderImage_ori").val(WPImager.layer[WPImager.current].imgborder);
                $("#bordercolorImage_ori").val(WPImager.layer[WPImager.current].imgbordercolor);
                $(".cvsconsole").hide();
                $("#imgconsole").show();
                $("#borderimageconsole").show();
                $("#spanRadiusImage").toggle(
                        !(WPImager.layer[WPImager.current].imgshape == UI.SHAPE.TRAPEZOID
                                || WPImager.layer[WPImager.current].imgshape == UI.SHAPE.PARALLELOGRAM)
                        );

                WPImagerUI.resize_image(WPImager.current);
                draw();
            });

            // image border size spinner
            WPImagerCtrls.initSpinnerImage("#borderImage", 0, null, 1, "imgborder", "textborder", false);

            // image border color picker
            $('#bordercolorImage').colorichpicker({showOn: 'button', transparentColor: false}).on('change.color', function (evt, color) {
                if (WPImager.boot > 0)
                    if (!UI.isUndoRedoing && UI.validateColorHex($(this).val()) !== false) {
                        WPImager.setMultiLayerImage("imgbordercolor", $('#bordercolorImage').val(), true);
                        WPImager.setMultiLayerText("textbordercolor", $('#bordercolorImage').val(), false);
                        WPImagerUI.flagCanvasSave();
                    }
                draw();
            }).on('canvaspick.color', function (evt) {
                WPImager.savePickerColor($(this).attr('id'), WPImager.layer[WPImager.current].imgbordercolor);
            }).on('blur', function () {
                if (UI.validateColorHex($(this).val()) === false) {
                    var color = WPImager.layer[WPImager.current].imgbordercolor;
                    $(this).val(color);
                    $(this).colorichpicker({color: color});
                }
            });

            // image corner radius spinner
            WPImagerCtrls.initSpinnerImage("#radiusImage", 0, null, 1, "imgradius", "textradius", true);

            // image border and corner radius zero reset
            $('#resetBorderImage').click(function () {
                WPImager.setMultiLayerText("textradius", 0);
                WPImager.setMultiLayerImage("imgradius", 0, true);
                WPImager.setMultiLayerText("textborder", 0);
                WPImager.setMultiLayerImage("imgborder", 0, true);
                $("#radiusImage").spinner("value", 0);
                $("#borderImage").spinner("value", 0);
                WPImagerUI.resize_image(WPImager.current);
                for (var i = 0; i < WPImager.multiselect.length; i++)
                    WPImagerUI.resize_image(WPImager.multiselect[i]);
                draw(true);
            });

            // show image crop console
            $('#showCropImageConsole').click(function () {
                UI.console = UI.CNSL.IMGCROP;
                UI.isCropping = true;
                WPImager.readyCropBox();
                $("#cropImageWidth").spinner("value", UI.cropBox.width);
                $("#cropImageHeight").spinner("value", UI.cropBox.height);
                $(".cvsconsole").hide();
                $("#cropimageconsole").show();
                WPImagerUI.resize_image(WPImager.current);
            });

            // show image crop console
            $('#showSkewImageConsole').click(function () {
                UI.console = UI.CNSL.IMGSKEW;
                $(".cvsconsole").hide();
                $("#skewimageconsole").show();
                if (WPImager.layer[WPImager.current].imgshape == UI.SHAPE.TRAPEZOID) {
                    var skewB, skewA;
                    if (WPImager.layer[WPImager.current].imgskewDir == 1) {
                        skewA = WPImager.layer[WPImager.current].imgskewA * (WPImager.layer[WPImager.current].imgheight / WPImager.layer[WPImager.current].imgheight_ori);
                        skewB = WPImager.layer[WPImager.current].imgskewB * (WPImager.layer[WPImager.current].imgheight / WPImager.layer[WPImager.current].imgheight_ori);
                    } else {
                        skewA = WPImager.layer[WPImager.current].imgskewA * (WPImager.layer[WPImager.current].imgwidth / WPImager.layer[WPImager.current].imgwidth_ori);
                        skewB = WPImager.layer[WPImager.current].imgskewB * (WPImager.layer[WPImager.current].imgwidth / WPImager.layer[WPImager.current].imgwidth_ori);
                    }
                    $("#imgskewsym").prop("checked", parseInt(skewA) == parseInt(skewB));
                    $("#skewAImage").spinner("value", skewA);
                    $("#skewBImage").spinner("value", skewB);
                    $(".shape_trapezoid_hide").hide();
                    $(".shape_trapezoid_show").show();


                } else if (WPImager.layer[WPImager.current].imgshape == UI.SHAPE.PARALLELOGRAM) {
                    var skewP;
                    if (WPImager.layer[WPImager.current].imgskewDir == 1) {
                        skewP = WPImager.layer[WPImager.current].imgskewP * (WPImager.layer[WPImager.current].imgheight / WPImager.layer[WPImager.current].imgheight_ori);
                    } else {
                        skewP = WPImager.layer[WPImager.current].imgskewP * (WPImager.layer[WPImager.current].imgwidth / WPImager.layer[WPImager.current].imgwidth_ori);
                    }
                    $("#skewAImage").spinner("value", skewP);
                    $(".shape_parallel_hide").hide();
                    $(".shape_parallel_show").show();
                }

                if (WPImager.layer[WPImager.current].imgskewDir == 1) {
                    $("#skewVImage").click();
                } else {
                    $("#skewHImage").click();
                }
                draw();
            });

            $("#skewVImage").click(function () {
                WPImager.layer[WPImager.current].imgskewDir = 1;
                if (WPImager.layer[WPImager.current].imgshape == UI.SHAPE.TRAPEZOID) {
                    WPImager.updateSkewA();
                    WPImager.updateSkewB();
                } else if (WPImager.layer[WPImager.current].imgshape == UI.SHAPE.PARALLELOGRAM) {
                    WPImager.updateSkewP();
                }
                WPImagerUI.resize_image(WPImager.current);
                draw(true);
                $("#skewHImage span").removeClass("text-primary");
                $("#skewVImage span").addClass("text-primary");
                $("#labelSkewAImage").text("Top");
                $("#labelSkewBImage").text("Bottom");
            });

            $("#skewHImage").click(function () {
                WPImager.layer[WPImager.current].imgskewDir = 0;
                if (WPImager.layer[WPImager.current].imgshape == UI.SHAPE.TRAPEZOID) {
                    WPImager.updateSkewA();
                    WPImager.updateSkewB();
                } else if (WPImager.layer[WPImager.current].imgshape == UI.SHAPE.PARALLELOGRAM) {
                    WPImager.updateSkewP();
                }
                WPImagerUI.resize_image(WPImager.current);
                draw(true);
                $("#skewVImage span").removeClass("text-primary");
                $("#skewHImage span").addClass("text-primary");
                $("#labelSkewAImage").text("Left");
                $("#labelSkewBImage").text("Right");
            });

            $("#skewFlipImage").click(function () {
                if (WPImager.layer[WPImager.current].imgshape == UI.SHAPE.TRAPEZOID) {
                    WPImager.layer[WPImager.current].imgskewA *= -1;
                    WPImager.layer[WPImager.current].imgskewB *= -1;
                    $("#skewBImage").spinner("value", -$("#skewBImage").spinner("value"));
                    $("#skewAImage").spinner("value", -$("#skewAImage").spinner("value"));
                } else {
                    WPImager.layer[WPImager.current].imgskewP *= -1;
                    $("#skewAImage").spinner("value", -$("#skewAImage").spinner("value"));
                }
                WPImagerUI.resize_image(WPImager.current);
                draw(true);
            });

            // image skew width spinner
            $("#skewAImage").spinner({
                min: -2000,
                step: 1,
                stop: function (event, ui) {
                    if ($("#skewAImage").spinner("isValid")) {
                        if (WPImager.layer[WPImager.current].imgshape == UI.SHAPE.TRAPEZOID) {
                            var skewA = WPImager.updateSkewA();
                            if ($("#imgskewsym").prop("checked")) {
                                WPImager.layer[WPImager.current].imgskewB = skewA;
                                $("#skewBImage").spinner("value", parseInt($(this).spinner("value")));
                            }
                        } else {
                            WPImager.updateSkewP();
                        }
                        WPImagerUI.resize_image(WPImager.current);
                        draw(true);
                    }
                    event.preventDefault();
                }
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    var skew;
                    if (WPImager.layer[WPImager.current].imgshape == UI.SHAPE.TRAPEZOID) {
                        skew = WPImager.layer[WPImager.current].imgskewA * (WPImager.layer[WPImager.current].imgheight / WPImager.layer[WPImager.current].imgheight_ori);
                    } else {
                        skew = WPImager.layer[WPImager.current].imgskewP * (WPImager.layer[WPImager.current].imgheight / WPImager.layer[WPImager.current].imgheight_ori);
                    }
                    $(this).spinner("value", skew);
                }
            });

            // image skew width spinner
            $("#skewBImage").spinner({
                min: -2000,
                step: 1,
                stop: function (event, ui) {
                    if ($("#skewBImage").spinner("isValid")) {
                        var skewB = WPImager.updateSkewB();
                        if ($("#imgskewsym").prop("checked")) {
                            WPImager.layer[WPImager.current].imgskewA = skewB;
                            $("#skewAImage").spinner("value", parseInt($(this).spinner("value")));
                        }
                        WPImagerUI.resize_image(WPImager.current);
                        draw(true);
                    }
                    event.preventDefault();
                }
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    var skew = WPImager.layer[WPImager.current].imgskewB * (WPImager.layer[WPImager.current].imgheight / WPImager.layer[WPImager.current].imgheight_ori);
                    $(this).spinner("value", skew);
                }
            });


            // image crop width spinner
            $("#cropImageWidth").spinner({
                min: 0,
                step: 1,
                stop: function (event, ui) {
                    if ($("#cropImageWidth").spinner("isValid")) {
                        var moveX = UI.cropBox.width - parseInt($("#cropImageWidth").spinner("value"));
                        UI.cropBox.width = parseInt($("#cropImageWidth").spinner("value"));
                        UI.cropBox.x += moveX / 2;
                        if (WPImager.layer[WPImager.current].imgshape == UI.SHAPE.SQUARE || WPImager.layer[WPImager.current].imgshape == UI.SHAPE.CIRCLE) {
                            UI.cropBox.height = UI.cropBox.width;
                            $("#cropImageHeight").val(UI.cropBox.width);
                        }
                        WPImagerUI.resize_image(WPImager.current);
                        draw(true);
                    }
                    event.preventDefault();
                }
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    $(this).spinner("value", UI.cropBox.width);
                }
            });

            // image crop height spinner
            $("#cropImageHeight").spinner({
                min: 0,
                step: 1,
                stop: function (event, ui) {
                    if ($("#cropImageHeight").spinner("isValid")) {
                        var moveY = UI.cropBox.height - parseInt($("#cropImageHeight").spinner("value"));
                        UI.cropBox.height = parseInt($("#cropImageHeight").spinner("value"));
                        UI.cropBox.y += moveY / 2;
                        if (WPImager.layer[WPImager.current].imgshape == UI.SHAPE.SQUARE || WPImager.layer[WPImager.current].imgshape == UI.SHAPE.CIRCLE) {
                            UI.cropBox.width = UI.cropBox.height;
                            $("#cropImageWidth").val(UI.cropBox.height);
                        }
                        WPImagerUI.resize_image(WPImager.current);
                        draw(true);
                    }
                    event.preventDefault();
                }
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    $(this).spinner("value", UI.cropBox.height);
                }
            });

            // show image blur console
            $('#showImageBlurConsole').click(function () {
                UI.console = UI.CNSL.IMGBLUR;
                UI.isCropping = false;
                WPImager.layerControlUpdate(WPImager.current);
                $('#bordercolorImage').colorichpicker({color: WPImager.layer[WPImager.current].imgbordercolor});
                $(".cvsconsole").hide();
                $("#imgconsole").show();
                $("#blurimageconsole").show();
                WPImagerUI.resize_image(WPImager.current);
                draw();
            });

            // image blur spinner
            WPImagerCtrls.initSpinnerImage("#blurImage", 0, null, 1, "imgblur", null, true);

            // image blur zero reset
            $('#resetBlurImage').click(function () {
                WPImager.setMultiLayerImage("imgblur", 0, true);
                $("#blurImage").spinner("value", 0);
                WPImagerUI.resize_image(WPImager.current);
                draw();
                WPImagerUI.flagCanvasSave();
            });

            // show image shadow console
            $('#showImageShadowConsole').click(function () {
                UI.console = UI.CNSL.IMGSHADOW;
                UI.isCropping = false;
                WPImager.layerControlUpdate(WPImager.current);
                $('#shadowcolorImage').colorichpicker({color: WPImager.layer[WPImager.current].imgshadowcolor});
                $(".cvsconsole").hide();
                $("#shadowimageconsole").show();
                WPImagerUI.resize_image(WPImager.current);
                draw();
            });

            $('#shadowimageconsole .toggle').click(function () {
                $('#shadowimageconsole .inactive,#shadowimageconsole .active').toggle();
                var imgdraw = WPImager.layer[WPImager.current];
                imgdraw.imgshadowOn = $('#shadowImageOn').is(':visible');
                WPImager.setMultiLayerImage("imgshadowOn", imgdraw.imgshadowOn, true);
                WPImager.layerControlUpdate(WPImager.current);
                draw();
            });

            // image shadow spinners
            WPImagerCtrls.initSpinnerImage("#shadowImage", 0, 999, 1, "imgshadow", null, true);
            WPImagerCtrls.initSpinnerImage("#shadowOxImage", -999, 999, 1, "imgshadowOx", null, true);
            WPImagerCtrls.initSpinnerImage("#shadowOyImage", -999, 999, 1, "imgshadowOy", null, true);

            // image shadow color picker
            $('#shadowcolorImage').colorichpicker({showOn: 'button', transparentColor: false, canvaspicker: false}).on('change.color', function (evt, color) {
                if (WPImager.boot > 0)
                    if (!UI.isUndoRedoing && UI.validateColorHex($(this).val()) !== false) {
                        WPImager.setMultiLayerImage("imgshadowcolor", $('#shadowcolorImage').val(), true);
                        WPImagerUI.flagCanvasSave();
                    }
                draw();
            }).on('canvaspick.color', function (evt) {
                WPImager.savePickerColor($(this).attr('id'), WPImager.layer[WPImager.current].imgshadowcolor);
            }).on('blur', function () {
                if (UI.validateColorHex($(this).val()) === false) {
                    var color = WPImager.layer[WPImager.current].imgshadowcolor;
                    $(this).val(color);
                    $(this).colorichpicker({color: color});
                }
            });


            // image shadow zero reset
            $('#resetShadowImage').click(function () {
                WPImager.setMultiLayerImage("imgshadow", 0, true);
                WPImager.setMultiLayerImage("imgshadowOx", 0, true);
                WPImager.setMultiLayerImage("imgshadowOy", 0, true);
                $("#shadowImage").spinner("value", 0);
                $("#shadowOxImage").spinner("value", 0);
                $("#shadowOyImage").spinner("value", 0);
                WPImagerUI.resize_image(WPImager.current);
            });

            // hide console when OK button clicked
            $('#hideBorderImageConsole, #hideBlurImageConsole, #hideImageShadowConsole, #hidepostuploadconsole').click(function () {
                WPImagerUI.resetConsoleImage();
                UI.console = UI.CNSL.ZERO;
                draw();
            });



            $('#media_image').click(function () {
                if (cap_upload_files) {
                    tb_show('Select Image From Media', 'media-upload.php?page=wpimager_editor&type=image&tab=library&canvas_id=' + canvas_id.toString() + '&TB_iframe=true', false);
                }
                return false;
            });

            // receive user selected Media image 
            window.send_to_editor = function (html) {

                WPImager.addImageLayer();

                var image_url = $(html).attr('src');
                var layer = WPImager.current;
                if (image_url.match(/\.(jpg|jpeg|png|bmp|gif)$/)) {
                    WPImager.layer[layer].disposed = 0;
                    WPImager.layer[layer].src = image_url;
                    WPImager.createUploadingIndex(layer);
                    WPImagerUI.loadImageNew(layer, image_url);
                    WPImager.selectLayer(layer);
                    $("#lyr" + layer.toString()).show();
                    draw();
                }
                tb_remove(); // calls the tb_remove() of the Thickbox plugin
            };
        },
        initToolLayerControls: function () {

            // ToolLayer - update tool position when dragged
            $("#toolBox").draggable({
                handle: "#toolboxHandle",
                stop: function () {
                    WPImager.canvas.tlOffsetY = ($("#toolBox").position().top);
                    WPImager.canvas.tlOffsetX = ($("#toolBox").position().left);
                }
            });
            $("#toolBox").css("position", "absolute");

            // ToolLayer - docked right, left, not visible or floating
            $('#toolBoxPosition_Hide,#toolBoxPosition_Left,#toolBoxPosition_Left2,#toolBoxPosition_Right,#toolBoxPosition_Right2,#toolBoxPosition_Float,#toolBoxPosition_Float2').click(function (e) {
                var id = $(this).attr("id");
                if (id == "toolBoxPosition_Right" || id == "toolBoxPosition_Right2")
                    WPImager.canvas.tlPosition = 0;
                else if (id == "toolBoxPosition_Hide") {
                    WPImager.canvas.tlPosition = 3;
                } else if (id == "toolBoxPosition_Left" || id == "toolBoxPosition_Left2")
                    WPImager.canvas.tlPosition = 1;
                else if (WPImager.canvas.tlPosition == 2) {
                    WPImager.canvas.tlPosition = 0;
                } else {
                    WPImager.canvas.tlPosition = 2;
                }
                WPImagerUI.dockToolLayers();
            });
            $('#toolViewSlides_Max,#toolViewSlides_Max2').click(function () {
                WPImager.canvas.tvSlides = 'max';
                WPImagerUI.showToolViewSlides();
                WPImagerUI.dockToolLayers();
                WPImager.clearSlideDroppable();
                WPImager.makeSlideDroppable();
            });

            $('#toolViewSlides_Min, #toolViewSlides_Min2').click(function () {
                WPImager.canvas.tvSlides = 'min';
                WPImagerUI.showToolViewSlides();
                WPImagerUI.dockToolLayers();
                WPImager.clearSlideDroppable();
                WPImager.makeSlideDroppable();
            });

            $('#toolViewSlides_Hide').click(function () {
                WPImager.canvas.tvSlides = 'hide';
                WPImagerUI.showToolViewSlides();
                WPImagerUI.dockToolLayers();
            });


            $("#toolBox").resizable({
                maxWidth: 500,
                minHeight: 350,
                minWidth: 160,
                handles: "e, se, w, sw",
                stop: function () {
                    WPImager.canvas.tlWidth = ($("#toolBox").width());
                    WPImager.canvas.tlHeight = ($("#toolBox").height());
                },
                resize: function () {
                    if (WPImager.canvas.tlPosition == 0) {
                        $("#toolBox").css("display", "block").css("top", "0px").css("right", "0").css("left", "auto");
                    }
                    WPImagerUI.arrangeCanvaslayout();
                }
            });


            $("#canvas_bottom").resizable({
                minHeight: 350,
                handles: "s",
                stop: function () {
                    WPImager.canvas.tlWidth = ($("#toolBox").width());
                    WPImager.canvas.tlHeight = ($("#toolBox").height());
                },
                resize: function () {
                    $("#cvswrap").height($("#canvas_bottom").height() - parseInt($("#cvswrap").css("margin-top")));
                    if (WPImager.canvas.zoom == 1)
                    {
                        $("#cvsfooter").css("top", $("#canvas_bottom").height().toString() + "px");
                        $("#toolBox").height($("#canvas_bottom").height());
                    }
                    if (WPImager.canvas.tlPosition == 0 || WPImager.canvas.tlPosition == 1) {
                        $("#toolLayers").height($("#canvas_bottom").height() + 40 - 2);
                        WPImagerUI.resizetoolLayersMenu();
                    }
                    if (WPImager.canvas.tvVisible) {
                        $("#canvas_slides").height($("#canvas_bottom").height() + 40 - 2);
                    }
                    //           WPImagerUI.arrangeCanvaslayout();
                }
            });

            var sort_allow_drop = false;
            $("#toolboxLayerSortable").sortable({
                // revert: 'invalid',
                // allow layers to be sortable
                helper: function (e, item) {
                    $('.selected').removeClass('selected');

                    if (!item.hasClass('selected'))
                        item.addClass('selected');

                    var elements = $('.selected').not('.ui-sortable-placeholder').clone();
                    $('#toolBox').append('<ul id="toolboxLayerSortableHelper"></ul>');
                    var helper = $('#toolboxLayerSortableHelper');
                    item.siblings('.selected').addClass('hidden');
                    return helper.append(elements);
                },
                start: function (event, ui) {
                    var id = ui.item.index() + 1;
                    $(".toolboxLayer.active").addClass("startsort");

                    var elements = ui.item.siblings('.selected.hidden').not('.ui-sortable-placeholder');
                    ui.item.data('items', elements);

                },
                receive: function (event, ui) {
                },
                beforeStop: function (ev, ui) {
                    ui.item.siblings('.selected').removeClass('hidden');
                    $('.selected').removeClass('selected');
                },
                change: function (event, ui) {
                    // moving layer
                    ui.placeholder.removeClass('invalid-position');
                    sort_allow_drop = true;
                },
                update: function (event, ui) {
                    ui.item.after(ui.item.data('items'));
                    ui.item.siblings('.selected').removeClass('hidden');
                    $('.selected').removeClass('selected');
                    WPImager.recalculateLayersOrder();
                    draw();
                    WPImagerUI.flagCanvasSave();
                    $(".toolboxLayer.active").removeClass("startsort");
                },
                stop: function (e, ui) {
                    if (!sort_allow_drop) {
                        $(this).sortable('cancel');
                    }
                },
                placeholder: "ui-sortable-placeholder",
                handle: ".sorthandle"
            }).on("click", '.toolboxLayer .square', function () {
                if ($(this).parent().find("#editLayerNote").length > 0 && $(this).parent().find("#editLayerNote").is(":visible")) {
                    // prevent #editLayerNote closing
                } else {
                    // save canvas in case objects move via key arrows
                    WPImagerUI.flagCanvasSave();
                    // select or multi select layers on click
                    var id = parseInt($(this).parent().data("var-index"));
                    if (WPImager.layer[id].disposed == 0) { // avoid removed layers                
                        if (UI.ctrl_pressed) {
                            WPImager.addMultiLayerSelect(id);
                            draw();
                        } else {
                            WPImager.selectLayer(parseInt(id));
                            WPImager.clearMultiLayers();
                            draw();
                        }
                    }
                }
            }).on("click", ".btn-layer-visible", function (e) {
                var id = parseInt($(this).parent().data("var-index"));
                WPImager.toggleLayerVisible(id);
                WPImagerUI.flagCanvasSave();
                WPImager.refreshIconVisible();
                UI.comSlideRenderCanvas = true;
                draw();
                UI.comSlideRenderCanvas = false;
            }).on("click", ".editLayerNote", function (e) {
                $("#editLayerNote").appendTo("#lyr" + WPImager.current.toString());
                $("#txtEditLayerNote").val(WPImager.layer[WPImager.current].layernote);
                $("#editLayerNote").show();
                $("#txtEditLayerNote").focus();
                $("#editLayerNote").data("type", "layer");
                e.stopPropagation();
            }).on("click", ".cmd-edit-background", function () {
                if (WPImager.slides[0].canvas_width == 0) {
                    if (WPImager.slide > 0) {
                        WPImager.slides[0].canvas_width = WPImager.slides[WPImager.slide].canvas_width;
                        WPImager.slides[0].canvas_height = WPImager.slides[WPImager.slide].canvas_height;
                        SlideAction.clickSlide(0);
                        WPImagerUI.dockToolLayers();
                        $("#btn-slide-layout-0").text(WPImager.canvas_width.toString() + "x" + WPImager.canvas_height.toString());
                        $("#act0").removeClass("hidden");
                    }
                } else {
                    SlideAction.clickSlide(0);
                    WPImagerUI.dockToolLayers();
                }
            });

            $("#cmdEditLayerNote").click(function (e) {
                WPImager.layer[WPImager.current].layernote = $("#txtEditLayerNote").val();
                WPImagerUI.flagCanvasSave();
                $("#lyr" + WPImager.current.toString() + " .tlnote").text($("#txtEditLayerNote").val());
                $("#editLayerNote").hide();
            });
            $("#cancelEditLayerNote").click(function (e) {
                $("#editLayerNote").hide();
            });

            $("#cmdTrashLayer").click(function (e) {
                $("#cvs").dblclick(); // in case is in editing mode
                // remove layer when [x] clicked
                var layer = "#lyr" + WPImager.current.toString();
                if (WPImager.layer[WPImager.current].code == UI.LAYER.IMAGE && WPImager.isUploading(WPImager.current)) {
                    e.preventDefault();
                    return;
                }
                WPImager.removeUploadingIndex(WPImager.current);
                WPImager.deleteLayer(WPImager.current);
                $(layer).slideUp();
                WPImager.selectLayerAdjacent(WPImager.current);

                WPImager.updateLayerTab();
                WPImagerUI.flagCanvasSave();
                draw();
                e.preventDefault();
            });


            // lock layer       
            $("#cmdLockLayer").click(function (e) {
                WPImager.toggCurrLayerLock();
                WPImagerUI.flagCanvasSave();
                WPImager.refreshIconLock();
                draw();
            });

            $("#addSetTextLayer").click(function (e) {
                $(this).parent().addClass("active");
                $(this).parent().siblings().removeClass("active");
                $(".toolboxLayersCom").hide();
                $("#toolboxLayerAddText").show();
                $('#fontfamily2').val("Lato");
                $("#fontfamily2").trigger("change", "Lato", 3);
                $("#input2").focus();
                //   return false;
            });

            $("#addCurveText").click(function (e) {
                $(this).parent().addClass("active");
                $(this).parent().siblings().removeClass("active");
                $(".toolboxLayersCom").hide();
                $("#toolboxCurvedText").show();
                $("#curvedText").focus();
            });

            $("#toolboxLayerAddText .addtext-border-select").click(function () {
                var border = $(this).data("border");
                UI.lastfontselected.border = border;
                $("#toolboxLayerAddText .addtext-border-select").removeClass("btn-warning").addClass("btn-slate");
                $(this).addClass("btn-warning").removeClass("btn-slate");
            });

            $("#addCurvedTextLayer").click(function () {
                var fontsize = $("#fontsize2").spinner("value");
                var fontfamily = $("#fontfamily2").val();
                if (fontfamily.length == 0) {
                    fontfamily = "Lato";
                }
                var curvedText = $("#curvedText").val();
                if ($("#curvedText").val().length == 0) {
                    curvedText = 'Curved Text';
                }
                UI.lastfontselected.fontfamily = fontfamily;
                UI.lastfontselected.srctype = 3;
                WPImager.addTextLayer(UI.lastfontselected);
                WPImager.layer[WPImager.current].content = curvedText;
                WPImager.layer[WPImager.current].fontsize = fontsize;
                WPImager.layer[WPImager.current].fontcolor = $('#fontcolor2').val();
                WPImager.layer[WPImager.current].fontsrctype = 3;
                WPImager.layer[WPImager.current].autoSize(WPImagerUI.canvas, WPImagerUI.ctx);
                WPImager.layer[WPImager.current].shape = UI.SHAPE.CURVEDTEXT;
                WPImager.layer[WPImager.current].textborder = 0;
                WPImager.layer[WPImager.current].textbordercolor = "#000000";
                WPImager.layer[WPImager.current].textoutline = 2;
                WPImager.layer[WPImager.current].textoutlinecolor = "#000000";
                WPImager.layer[WPImager.current].xOffset = 0;
                WPImager.layer[WPImager.current].yOffset = 0;
                var curveWidth = WPImager.layer[WPImager.current].width * 2.2;
                var strCurveWidth = curveWidth.toString();
                var quadCurve = (curveWidth / 4).toString();
                var eightCurve = (curveWidth / 5).toString();
                var eightCurve2 = (4 * curveWidth / 5).toString();
                WPImager.layer[WPImager.current].pathPoints = '0 0 1 0 0 ' + eightCurve + ' -' + quadCurve + ',' + strCurveWidth + ' 0 1 ' + eightCurve2 + ' -' + quadCurve + ' ' + strCurveWidth + ' 0';
                WPImager.layer[WPImager.current].recalculateShapeContainer();
                WPImager.layerCenterView(WPImager.current)
                WPImager.layer[WPImager.current].recalculateShapeContainer();
                WPImager.rebuildToolLayers();
                WPImager.selectLayer(WPImager.current);
                UI.console = UI.CNSL.TXTCURVED;
                UI.console_shape = UI.CNSL.SHAPETOOLMOVE;
                $("#txt" + WPImager.current.toString()).addClass("curvedtext");
                WPImagerUI.flagCanvasSave();
                $("#viewLayers,#showCurveTextConsole").click();
                setTimeout(function () {
                    draw();
                    $("#curve_mode_edit").click();
                }, 100);
                WPImager.scrollActiveLayer();
                return false;

            });

            // add text layer
            $("#addTextLayer").click(function (e) {
                var fontsize = $("#fontsize2").spinner("value");
                var fontfamily = $("#fontfamily2").val();
                if (fontfamily.length == 0) {
                    alert("Please Select a Font.");
                    return false;
                }
                UI.lastfontselected.fontfamily = fontfamily;
                UI.lastfontselected.srctype = 3;
                WPImager.addTextLayer(UI.lastfontselected);
                WPImager.layer[WPImager.current].content = "WPImager";
                WPImager.layer[WPImager.current].fontsize = fontsize;
                WPImager.layer[WPImager.current].fontcolor = $('#fontcolor2').val();
                WPImager.layer[WPImager.current].fontsrctype = 3;
                WPImager.layer[WPImager.current].autoSize(WPImagerUI.canvas, WPImagerUI.ctx);
                WPImager.layer[WPImager.current].content = "";
                if (['square', 'rectangle', 'circle', 'ellipse'].indexOf(UI.lastfontselected.border) > -1) {
                    WPImager.layer[WPImager.current].textborder = 1;
                    WPImager.layer[WPImager.current].textbordercolor = $('#fontcolor2').val();
                    switch (UI.lastfontselected.border) {
                        case "square":
                            WPImager.layer[WPImager.current].shape = UI.SHAPE.SQUARE;
                            WPImager.layer[WPImager.current].height = WPImager.layer[WPImager.current].width;
                            break;
                        case "rectangle":
                            WPImager.layer[WPImager.current].shape = UI.SHAPE.RECTANGLE;
                            WPImager.layer[WPImager.current].height *= 2;
                            WPImager.layer[WPImager.current].width *= 2;
                            break;
                        case "circle":
                            WPImager.layer[WPImager.current].shape = UI.SHAPE.CIRCLE;
                            WPImager.layer[WPImager.current].height = WPImager.layer[WPImager.current].width;
                            break;
                        case "ellipse":
                            WPImager.layer[WPImager.current].shape = UI.SHAPE.ELLIPSE;
                            WPImager.layer[WPImager.current].height *= 2;
                            WPImager.layer[WPImager.current].width *= 2;
                            break;
                        default:
                            WPImager.layer[WPImager.current].height *= 2;
                            WPImager.layer[WPImager.current].width *= 2;
                            break;
                    }
                }
                WPImager.rebuildToolLayers();
                WPImager.selectLayer(WPImager.current);
                WPImager.layerCenterView(WPImager.current)
                draw();
                WPImagerUI.flagCanvasSave();
                $("#viewLayers").click();
                $("#modeTextEdit").click();
                WPImager.scrollActiveLayer();
                return false;
            });

            $("#showAddBackground").click(function (e) {
                var height = $("#toolBox").height();
                $(this).parent().addClass("active");
                $(this).parent().siblings().removeClass("active");
                $(".toolboxLayersCom").hide();
                $("#toolboxLayerAddBackground").show();
                $("#cmd-canvas-pattern-light").toggleClass("btn-darkslate", WPImager.slides[WPImager.slide].bgpattern == 1);
                $("#cmd-canvas-pattern-light").toggleClass("btn-slate", WPImager.slides[WPImager.slide].bgpattern !== 1);
                $("#cmd-canvas-pattern-dark").toggleClass("btn-darkslate", WPImager.slides[WPImager.slide].bgpattern == 0);
                $("#cmd-canvas-pattern-dark").toggleClass("btn-slate", WPImager.slides[WPImager.slide].bgpattern !== 0);
                // $("#toolBox").height(height);
                //   return false;
            });

            $("#cmd-canvas-pattern-light").click(function () {
                WPImager.slides[WPImager.slide].bgpattern = 1;
                draw(true);
                $("#showAddBackground").click();
            });

            $("#cmd-canvas-pattern-dark").click(function () {
                WPImager.slides[WPImager.slide].bgpattern = 0;
                draw(true);
                $("#showAddBackground").click();
            });

            // add text layer
            $("#addBackground").click(function (e) {
                WPImager.addTextLayer();
                WPImager.layer[WPImager.current].width = WPImager.canvas.width;
                WPImager.layer[WPImager.current].height = WPImager.canvas.height;
                WPImager.layer[WPImager.current].backcolor = $('#basecolor').val();
                WPImager.layer[WPImager.current].shape = UI.SHAPE.BACKGROUND;
                WPImager.layer[WPImager.current].locked = true;
                WPImager.moveLayerToBackground();
                WPImager.rebuildToolLayers();
                WPImager.selectLayer(WPImager.current);
                draw();
                WPImagerUI.flagCanvasSave();
                $("#viewLayers").click();
                WPImager.scrollActiveLayer();
                $("#showTextBgControls").click();
                return false;
            });
            $('#basecolor').colorpicker({
                showOn: 'button',
                customTheme: UI.customTheme,
                customTheme2: UI.customTheme2,
                transparentColor: true}).on('change.color', function (evt, color) {

            });

            // add polygon layer
            $("#addPolygonLayer").click(function (e) {
                $(".toolboxLayersCom").hide();
                $("#toolboxLayersMenu,#toolboxLayerSortableWrap").show();
                WPImager.addTextLayer(UI.lastfontselected);
                WPImager.layer[WPImager.current].height = Math.min(100, WPImager.canvas.height * 0.9);
                WPImager.layer[WPImager.current].polyspoke = $("#txt_polyspoke_on2").hasClass("active");
                WPImager.layer[WPImager.current].polysides = parseInt($("#polygonSides2").val());
                WPImager.layer[WPImager.current].shape = UI.SHAPE.POLYGON;
                WPImager.layer[WPImager.current].radius = WPImager.layer[WPImager.current].height / 2;
                WPImager.layer[WPImager.current].width = WPImager.layer[WPImager.current].height;
                WPImager.layer[WPImager.current].textborder = 3;
                WPImager.layer[WPImager.current].textbordercolor = WPImager.canvas.forecolor;
                WPImager.layer[WPImager.current].backcolor = WPImager.canvas.background;
                WPImager.layer[WPImager.current].polyspokeratio = 0.5;
                WPImager.selectLayer(WPImager.current);
                $("#txt" + WPImager.current.toString()).addClass("polysquare");
                WPImager.layerCenterView(WPImager.current);
                draw();
                WPImagerUI.flagCanvasSave();
                $("#viewLayers").click();
                $("#showPolygonConsole").click();

                return false;
            });

            // add shape layer
            $("#browseShapeLayer").click(function (e) { // #drawShapeLayer
                var height = $("#toolBox").height();
                $(this).parent().addClass("active");
                $(this).parent().siblings().removeClass("active");
                UI.isCropping = false;
                UI.pathPointNew = "";
                UI.console = UI.CNSL.SHAPETOOLBAR;
                UI.console_shape = UI.CNSL.SHAPETOOLNEW;
                $(".toolboxLayersCom,#contentBrowseShape,#contentBrowseDrawShape").hide();
                $("#toolBrowseShape,#contentDrawShape").show();
//        $("#toolBox").height(height);
                draw();
                return false; // important

            });


            $("#browsePolygonLayer").click(function (e) {
                $(this).parent().addClass("active");
                $(this).parent().siblings().removeClass("active");
                UI.isCropping = false;
                $(".toolboxLayersCom,#contentBrowseShape,#contentBrowseDrawShape").hide();
                $("#toolBrowsePolygon,#contentDrawPolygon").show();
                return false;

            });

            $("#showAddImage").click(function (e) {
                $(this).parent().addClass("active");
                $(this).parent().siblings().removeClass("active");
                UI.isCropping = false;
                $("#uploadResizeCanvas").prop("checked", false);
                UI.upload_to_editor_layer = -1; // important flag reset
                $(".toolboxLayersCom,#contentBrowseShape,#contentBrowseDrawShape").hide();
                $("#toolboxLayerUpload").show();
                $("#toolBox").height(height);
                // return false; // important

            });


            $("#view_image").click(function (e) {
                var url = WPImager.layer[WPImager.current].src;
                window.open(url, '_blank');
            });

            // duplicate selected layer
            $("#cmdDuplicateObject").click(function (e) {
                $("#cvs").dblclick(); // in case is in editing mode
                var current = WPImager.current;
                if (WPImager.layer[WPImager.current].code === UI.LAYER.IMAGE) {
                    WPImager.dupImageLayer();
                } else if (WPImager.layer[WPImager.current].code === UI.LAYER.TEXT) {
                    WPImager.dupTextLayer();
                } else {
                    WPImager.layer[WPImager.current].duplicate();
                }
                // place duplicate layer just below current layer
                $("#lyr" + current.toString()).after($("#lyr" + WPImager.current.toString()));

                WPImager.recalculateLayersOrder();
                WPImager.rebuildToolLayers();
                WPImager.selectLayer(WPImager.current);

                draw();
                WPImagerUI.flagCanvasSave();
                e.stopImmediatePropagation();
            });

            // move active layer up
            $("#cmdMoveUpLayer").click(function (e) {
                WPImager.moveLayerUp();
                WPImager.recalculateLayersOrder();
                WPImager.scrollActiveLayer();
                draw();
            });

            $("#cmdMoveDownLayer").click(function (e) {
                WPImager.moveLayerDown();
                WPImager.recalculateLayersOrder();
                WPImager.scrollActiveLayer();
                draw();
            });

        },
        editor_addGoogleFonts: function () {

            iframe_open = true;
            var frameSrc = adminurl + "?page=wpimager_gfonts";
            $('#wpimager_iframe').height($("#canvas_bottom").height());
            $('#wpimager_iframe').attr("src", frameSrc);
            $(".cvsconsole,.taskconsole, .outputconsole_task").hide();
            $("#canvas_slides,#toolBox,#undoredo-box,#cvsfooter_wrap").hide();
            $("#cvsbox_menu").hide();
            //  $("#cvswrap").css("margin-left", "0").css("width", "100%");
            $("#imgconsole,#txtconsole").hide();
            $("#cvswrap").hide();
            $("#promptprintcanvas,#downloadPNG").addClass("inactive");
            $("#showViewTools").addClass("disabled");

            $('#wpimager_iframe').load(function () {
                $('#wpimager_iframe').contents().find("head")
                        .append($("<style type='text/css'>  #wpwrap {background-color:#222222;}  </style>"));

                $('#wpimager_iframe,#backtocanvas-wrap').show();
                $("#wpimager_iframe").css("font-family", "Arial");
                $("#wpimager_iframe #wpwrap").css("background-color", "#222222");
                if (WPImager.layer[WPImager.current].content.length > 0) {
                    $("#wpimager_iframe").contents().find("#txtphrase").val(WPImager.layer[WPImager.current].content);
                    $("#wpimager_iframe").contents().find("#txtphrase").keyup();
                }
            });
            return false;
        },
        initSideMenu: function () {
            var canvas = document.getElementById('cvs');

            $("#appSettings").click(function (e) {
                UI.prepareApp(UI.APP.SETTINGS);
                $("#exportimagespreviewpanel").html("");
                $(this).parent().siblings().removeClass("active");
                $(this).parent().addClass("active");
                return false;
            });



            // save canvas to server and post canvas thumbnail
            $("#savecanvas").click(function (e) {
                WPImager.savecanvas();
                WPImager.postthumbnail();
                return false;
            });
            // generate canvas image and send to Media and WPImager libraries
            $("#promptprintcanvas").click(function () {
                if ($("#savecanvas").hasClass("disabled") || $("#promptprintcanvas").hasClass("disabled") || $("#promptprintcanvas").hasClass("inactive")) {
                    return;
                }

                $("#printProgressWrap").css("background-color", "#282828");
                $("#printProgressBar").css("width", "0%");
                if (UI.app !== UI.APP.CANVAS) {
                    setTimeout(function () {
                        $("#printProgressWrap").show();
                    }, 400);
                } else {
                    $("#printProgressWrap").show();
                }
                $("#printProgressWrap").find(".ask-show").show();
                $("#printProgressWrap").find(".ask-hide").hide();
                $(this).parent().siblings().removeClass("active");
                $("#appCanvas").parent().addClass("active");
                if (UI.app !== UI.APP.CANVAS) {
                    $("#appCanvas").click();
                }
                return false;
            });

            $("#showViewTools").click(function () {
                $('#toolViewConsole').toggle();
            });

            $("#printcanvas_png").click(function () {
                WPImager.printcanvas("png");
                return false;
            });
            $("#printcanvas_jpeg").click(function () {
                WPImager.printcanvas("jpg");
                return false;
            });

            /*** other input events ***/
            $("#exportcanvas").click(function () {
                zip = new JSZip();
                var imgLinks = [];
                var arrIndex = WPImager.canvas.arrIndex;
                for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                    var i = arrIndex[ix];
                    if (WPImager.layer[i].code == UI.LAYER.IMAGE && WPImager.layer[i].disposed == 0) {
                        imgLinks.push(WPImager.layer[i].src);
                    }
                }
                var deferreds = [];

                for (var i = 0; i < imgLinks.length; i++)
                {
                    deferreds.push(WPImagerCtrls.addToZip(zip, imgLinks[i]));
                }
                $.when.apply(window, deferreds).done(WPImagerCtrls.generateZipCanvas);

                return false;

            });

            $("#exportimagepreview").click(function () {
                var imagecount = 0;
                // preview export zip images
                $("#exportimagespreviewpanel").html("");
                var arrIndex = WPImager.canvas.arrIndex;
                var strImages = "";
                for (var ix = 0, len = arrIndex.length; ix < len; ix++) {
                    var i = arrIndex[ix];
                    if (WPImager.layer[i].code == UI.LAYER.IMAGE && WPImager.layer[i].disposed == 0) {
                        if (strImages.indexOf(WPImager.layer[i].src) === -1)
                        {
                            $("#exportimagespreviewpanel").append('<div style="width:15%;float:left;margin:10px 10px 0 0"><a href="' + WPImager.layer[i].src + '" target="_blank"><img src="' + WPImager.layer[i].src + '" style="max-width:100%"></a></div>');
                            strImages += WPImager.layer[i].src + ';';
                            imagecount++;
                        }
                    }
                }
                $("#exportimagespreviewpanel").append('<div style="clear:both;"></div>');
                if (imagecount > 0) {
                    $("#exportimagespreviewpanel").append('<div style="padding:8px 4px;color:#999">Click on image to enlarge. Opens in new tab.</div>');
                } else {
                    $("#exportimagespreviewpanel").append("&nbsp;No images to export");
                }
            });

            // convert canvas to png image and trigger image download
            $("#downloadcanvas,#downloadJPG,#downloadPNG").click(function () {
                if ($(this).hasClass("inactive")) {
                    return false;
                }

                UI.hitLayer = -1;
                // get generated image
                UI.isPrinting = true;
                WPImagerUI.draw();
                var ext = WPImager.canvas.ext;
                // ext = ($(this).attr("id") == "downloadPNG" ? "png" : ext);
                // ext = ($(this).attr("id") == "downloadJPG" ? "jpg" : ext);
                var title = $("#pagetitle").text() + (WPImager.canvas.stfilename == 1 ? ' ' + WPImager.slides[WPImager.slide].slidetitle : "");
                var fname = WPImagerUI.convertToSlug(title);
                if (canvas.msToBlob) { //for IE
                    var blob = canvas.msToBlob();
                    window.navigator.msSaveBlob(blob, fname + "." + ext);
                } else if (UI.support_download) {
                    // download attribute supported by browser
                    var w = canvas.width,
                            h = canvas.height;
                    Canvas2Image.saveAsImage(canvas, 0, 0, w, h, ext, fname + "." + ext);
                } else {
                    // download attribute not supported, upload then download image
                    var imgBase64 = canvas.toDataURL("image/" + ext, 1);
                    imgBase64 = imgBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
                    WPImager.postdownload(imgBase64, ext);
                }
                UI.isPrinting = false;
                WPImagerUI.draw();
                if (UI.app !== UI.APP.CANVAS) {
                    $("#appCanvas").click();
                }
                $("#printProgressWrap").fadeOut();
                return false;
            });

            $(".canvas_extension").click(function (e) {
                WPImager.canvas.ext = $.trim($(this).text().toLowerCase());
                $("#btnFileFormat").html(WPImager.canvas.ext.toUpperCase());
                e.preventDefault();
            });

            $(".canvas_zoom").click(function (e) {
                if (e.originalEvent !== undefined) {
                    WPImager.canvas.zoom = parseInt($(this).data("zoom")) == 1 ? 1 : 0;
                }
                if (WPImager.canvas.zoom == 1) {
                    // 100%
                    if (UI.canvas_bottom_height > 0) {
                        // recall previous height in 100%
                        $("#toolBox").height(UI.canvas_bottom_height);
                        $("#canvas_bottom").height(UI.canvas_bottom_height);
                    } else {
                        // save height in 100% first time
                        WPImagerUI.dockToolLayers();
                        UI.canvas_bottom_height = $("#toolBox").height();
                        $("#canvas_bottom").height(UI.canvas_bottom_height);
                    }
                    $("#cvszoom-text").text("100%");
                    $('#cvsbox_menu,#toolBox,#canvas_slides').removeClass('fixed');
                    $('#canvas_slides').css("top", "147px");
                    $('canvas_slides').removeClass('fixed');
                } else {
                    // full cover 
                    UI.canvas_bottom_height = $("#toolBox").height(); // remember height in 100%
                    var maxheight = Math.min(document.documentElement.clientHeight, window.innerHeight || 0);
                    if ($(window).scrollTop() > $("#pagetitle").height()) {
                        maxheight = maxheight - ($("#pagetitle").outerHeight(true));
                    } else {
                        maxheight = maxheight - ($("#pagetitle").outerHeight(true) - $(window).scrollTop()) - 4;
                    }
                    //if ($("#toolBox").height() > maxheight) 
                    {
                        $("#toolBox").height(maxheight);
                    }
                    $('#canvas_slides').addClass('fixed');
                    var title_height = $("#pagetitle").outerHeight(true);
                    if ($(window).scrollTop() > 147 + title_height) {
                        $('#canvas_slides').css("top", "0px");
                    } else {
                        $('#canvas_slides').css("top", (147 + title_height - $(window).scrollTop()).toString() + "px");
                    }

                    $("#cvszoom-text").text("Auto");

                }
                WPImagerUI.dockToolLayers();
                WPImagerUI.dockToolBox();
                e.preventDefault();
            });

        },
// spinner initialization for text spinners
        initSpinnerText: function (spin_id, spin_min, spin_max, spin_step, txtvarname, imgvarname, recLayer) {
            $(spin_id).spinner({
                min: spin_min,
                max: spin_max,
                step: spin_step,
                stop: function (event, ui) {
                    if ($(spin_id).spinner("isValid")) {
                        var spinner_value;
                        if (spin_id == "#polygonSpokeRatio" || spin_id == "#spacingText" || spin_id == "#spacingText2") {
                            spinner_value = UI.parseFloat($(spin_id).spinner("value"));
                        } else {
                            spinner_value = parseInt($(spin_id).spinner("value"));
                        }
                        if (txtvarname !== null)
                            WPImager.setMultiLayerText(txtvarname, spinner_value, true);
                        if (imgvarname !== null)
                            WPImager.setMultiLayerImage(imgvarname, spinner_value);

                        draw();
                    }
                }
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    var textdraw = WPImager.layer[WPImager.current];
                    $(this).spinner("value", textdraw[txtvarname]);
                }
                WPImagerUI.flagCanvasSave();
            });
        },
        initSpinnerImage: function (spin_id, spin_min, spin_max, spin_step, imgvarname, txtvarname, resize_multi) {
            $(spin_id).spinner({
                min: spin_min,
                max: spin_max,
                step: spin_step,
                stop: function (event, ui) {
                    if ($(spin_id).spinner("isValid")) {
                        spin_value = parseInt($(spin_id).spinner("value"));
                        WPImager.setMultiLayerImage(imgvarname, spin_value, true);
                        if (txtvarname !== null)
                            WPImager.setMultiLayerText(txtvarname, spin_value);
                        WPImagerUI.resize_image(WPImager.current);
                        if (resize_multi) {
                            for (var i = 0; i < WPImager.multiselect.length; i++)
                                WPImagerUI.resize_image(WPImager.multiselect[i]);
                        }
                        draw();
                        WPImager.layerEdgeHandlers(WPImager.current);
                        WPImagerUI.flagCanvasDirty();
                    }
                }
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    var imgdraw = WPImager.layer[WPImager.current];
                    $(this).spinner("value", imgdraw[imgvarname]);
                    WPImagerUI.resize_image(WPImager.current);
                }
                WPImagerUI.flagCanvasSave();
            });
        },
        autosave_canvas: function () {
            setTimeout(function () {
                if (UI.flagDirty) {
                    WPImager.savecanvas();
                    WPImager.postthumbnail();
                }
                WPImagerCtrls.autosave_canvas();
            }, 60000);
        },
        generateZipCanvas: function ()
        {
            WPImager.canvas.title = $("#pagetitle").text().trim();
            var _canvas = JSON.stringify(WPImager.canvas);
            var __layer_string = JSON.stringify(WPImager.layer);
            var __slides_string = JSON.stringify(WPImager.slides);
            var __layer = JSON.parse(__layer_string);
            var __slides = JSON.parse(__slides_string);
            var _addons = JSON.stringify(WPImager.addons);

            for (var k in __layer) {
                var index = parseInt(k);
                if (__layer.hasOwnProperty(k) && index > 0) {
                    if (__layer[index].disposed > 0) {
                        delete __layer[index];
                    }
                }
            }

            for (var s in __slides) {
                var index = parseInt(s);
                if (__slides.hasOwnProperty(s) && index > 0) {
                    if (__slides[index].disposed > 0) {
                        delete __slides[index];
                    }
                }
            }
            var _layer = JSON.stringify(__layer);
            var _slides = JSON.stringify(__slides);
            zip.file("wpimager.txt", _canvas + "\n" + _layer + "\n" + _slides + "\n" + _addons);
            var content = zip.generate({type: "blob"});
            var fname = WPImagerUI.convertToSlug($("#pagetitle").text());
            // see FileSaver.js
            saveAs(content, fname + ".zip");
        },
        addToZip: function (zip, imgLink, folder) {
            var deferred = $.Deferred();
            JSZipUtils.getBinaryContent(imgLink, function (err, data) {
                if (err) {
//                    alert("Problem happened when download img: " + imgLink);
//                    console.erro("Problem happened when download img: " + imgLink);
                    deferred.resolve(zip); // ignore this error: just logging
                    // deferred.reject(zip); // or we may fail the download
                } else {
                    var filename = imgLink.substring(imgLink.lastIndexOf('/') + 1);
                    if (typeof folder === "undefined") {
                        zip.file(filename, data, {binary: true});
                    } else {
                        zip.folder(folder).file(filename, data, {binary: true});
                    }
                    deferred.resolve(zip);
                }
            });
            return deferred;
        }

    };


})(jQuery);


function draw(flagCanvasSave) {
    WPImagerUI.draw();
    if (typeof flagCanvasSave !== "undefined"
            && flagCanvasSave && !UI.isUndoRedoing) {
        WPImagerUI.flagCanvasSave();
    }
}
function closeFontsMore(font) {
    if (iframe_open) {
        iframe_open = false;
        WPImager.reloadUserFonts();
        if (typeof font !== "undefined") {
            jQuery("#fontfamily").val(font);
            WPImager.setMultiLayerText("fontfamily", jQuery('#fontfamily').val(), true);
            WPImager.setMultiLayerText("fontsrctype", 3, true);
            WPImagerUI.flagCanvasSave();
        }
        jQuery('#wpimager_iframe').hide();
        jQuery(".hideOutputConsole").click();
        jQuery("#appCanvas").click();
    }
}

// Array.prototype.indexOf - MIT License © Sep 8, 2017 Anonymous
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
// Production steps of ECMA-262, Edition 5, 15.4.4.14
// Reference: http://es5.github.io/#x15.4.4.14
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {

        var k;

        // 1. Let o be the result of calling ToObject passing
        //    the this value as the argument.
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }

        var o = Object(this);

        // 2. Let lenValue be the result of calling the Get
        //    internal method of o with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = o.length >>> 0;

        // 4. If len is 0, return -1.
        if (len === 0) {
            return -1;
        }

        // 5. If argument fromIndex was passed let n be
        //    ToInteger(fromIndex); else let n be 0.
        var n = fromIndex | 0;

        // 6. If n >= len, return -1.
        if (n >= len) {
            return -1;
        }

        // 7. If n >= 0, then Let k be n.
        // 8. Else, n<0, Let k be len - abs(n).
        //    If k is less than 0, then let k be 0.
        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

        // 9. Repeat, while k < len
        while (k < len) {
            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the
            //    HasProperty internal method of o with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            //    i.  Let elementK be the result of calling the Get
            //        internal method of o with the argument ToString(k).
            //   ii.  Let same be the result of applying the
            //        Strict Equality Comparison Algorithm to
            //        searchElement and elementK.
            //  iii.  If same is true, return k.
            if (k in o && o[k] === searchElement) {
                return k;
            }
            k++;
        }
        return -1;
    };
}