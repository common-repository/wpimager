/*!
 WPImager 1.0.0    
 UI Object
 https://wpimager.com/
 2018 WPImager  
 */


jQuery(function ($) {
    var input = document.getElementById('input');

// mouse event listeners
    $("#cvs").on("mousedown", function (e) {
        if (UI.isPrinting)
            return;
        handleMouseDown(e);
    });
    $("#cvs").on("mouseup", function (e) {
        if (UI.isPrinting)
            return;
        handleMouseUp(e);
    });
    $("#cvs").on("mouseout", function (e) {
        if (UI.isPrinting)
            return;
        if (UI.draggingMouse)
            return;
        handleMouseUp(e);
    });
    $("#cvs").on("mousemove", function (e) {
        if (UI.isPrinting)
            return;
        handleMouseMove(e);
    });
    $(document).on("mousemove", function (e) {
        if (UI.isPrinting)
            return;
        if (UI.draggingMouse) {
            handleMouseMove(e);
        }
    });
    $(document).on("mouseup", function (e) {
        if (UI.isPrinting)
            return;
        if (UI.draggingMouse) {
            handleMouseUp(e);
        }
    });

    $("#canvas-color-picker").on("mouseup mousedown", function (e) {
        if (UI.isPrinting)
            return;

        var mouseX, mouseY;
        if (e.pageX || e.pageY) {
            mouseX = parseInt(e.pageX);
            mouseY = parseInt(e.pageY);
        } else {
            mouseX = parseInt((e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft));
            mouseY = parseInt((e.clientY + document.body.scrollTop + document.documentElement.scrollTop));
        }

        WPImager.sampleCanvasColor($("#canvascolorpicker_selector").val(), mouseX, mouseY, 'canvas-color-picker');
        WPImager.pickCanvasColor($("#canvascolorpicker_selector").val());

    });

    $(document).mouseup(function (e)
    {
        var container = $("#printProgressWrap");
        if (UI.cpDragging) {
            return;
        }

        if (!container.is(e.target) // if the target of the click isn't the container...
                && container.has(e.target).length === 0) // ... nor a descendant of the container
        {
            container.hide();
        }
        if (e.target.id === "toolViewSlides_Min2_fa" || e.target.id == "toolViewSlides_Max2_fa") {
            // skip           
        } else if (!(e.target.id === "pickoncanvascolorpicker" || e.target.id === "canvas-color-picker"
                || e.target.id === "canvas-color-picker-sample" || e.target.id === "managecolorpalettes"
                || e.target.id === "previewcanvascolorpicker")
                && !$("#dialog-color-palette").is(":visible")
                && $("#canvascolorpickerconsole").is(":visible")
                && $("#canvascolorpicker_selector").val().length > 0) {
            if ($(".cp-color-picker").is(":visible")) {
                if (!(e.target.id === "cvs" && UI.pickonCanvas)) {
                    $("#previewcanvascolorpicker").colorPicker.toggle();
                }
                return;
            }
            if (e.target.id === "cvs" && UI.pickonCanvas && $("#canvascolorpickerconsole").is(":visible")) {
                // sampling color from canvas
            } else {
                // short delay in case cancel button clicked
                setTimeout(function () {
                    // pick color from canvas is active
                    if ($("#canvascolorpickerconsole").is(":visible")) {
                        WPImagerUI.flagCanvasSave();
                    }
                    $("#canvascolorpicker_selector").val("");
                    $('#canvascolorpickerconsole').hide();
                }, 100);
            }
            return;
        }
    });


    var startX, startY; // pointer position 

    function handleMouseDown(e) {


        if (e.pageX || e.pageY) {
            startX = parseInt(e.pageX);
            startY = parseInt(e.pageY);
        } else {
            startX = parseInt(e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft);
            startY = parseInt(e.clientY + document.body.scrollTop + document.documentElement.scrollTop);
        }

        var x = parseInt($("#cvs").offset().left) - startX;
        var y = parseInt($("#cvs").offset().top) - startY;

        if (UI.pickonCanvas && $("#canvascolorpickerconsole").is(":visible") && $("#canvascolorpicker_selector").val().length > 0) {
            // pick color from canvas is active
            WPImager.sampleCanvasColor($("#canvascolorpicker_selector").val(), startX, startY, 'cvs');
            WPImager.pickCanvasColor($("#canvascolorpicker_selector").val());
//            $("#canvascolorpicker_selector").val("");
//            $('#canvascolorpickerconsole').hide();
//
            WPImagerUI.flagCanvasSave();
            draw();
            return;
        }

        // save canvas in case objects move via key arrows
        WPImagerUI.flagCanvasSave();

        // added in case canvas is css sized
        if (WPImager.canvas.width != $("#cvs").width()) {
            x = parseInt(x * (WPImager.canvas.width / $("#cvs").width()));
        }
        if (WPImager.canvas.height != $("#cvs").height()) {
            y = parseInt(y * (WPImager.canvas.height / $("#cvs").height()));
        }

//        UI.touchedX = startX;
//        UI.touchedY = startY;
        UI.touchedX = -x;
        UI.touchedY = -y;
        UI.touchedPathPoints = (WPImager.layer[WPImager.current].shape == UI.SHAPE.CUSTOM || WPImager.layer[WPImager.current].shape == UI.SHAPE.CURVEDTEXT ? WPImager.layer[WPImager.current].pathPoints : "");

        if (UI.resizeCVS) {
            UI.activeLayerWidth = WPImager.slides[WPImager.slide].canvas_width;
            UI.activeLayerHeight = WPImager.slides[WPImager.slide].canvas_height;
            UI.draggingMouse = true;
            return;
        } else if (UI.console == UI.CNSL.SHAPETOOLBAR
                && (UI.console_shape == UI.CNSL.SHAPETOOLNEW || UI.console_shape == UI.CNSL.SHAPETOOLNEWLINE)) {

            if (UI.pathPointNew.length == 0) {
                var x = UI.hoverX, y = UI.hoverY;
                UI.pathPointNew = x.toString() + ' ' + y.toString() + ' 0';
            } else {

                var last = WPImager.current;
                var console_shape = UI.console_shape;
                WPImager.addTextLayer(UI.lastfontselected);
                WPImager.layer[WPImager.current].pathPoints = UI.pathPointNew;
                WPImager.layer[WPImager.current].textborder = 2;
                WPImager.layer[WPImager.current].textbordercolor = "#000000";
                WPImager.layer[WPImager.current].xOffset = 0;
                WPImager.layer[WPImager.current].yOffset = 0;
                WPImager.layer[WPImager.current].appendShapePoint();
                WPImager.layer[WPImager.current].recalculateShapeContainer();
                UI.expectCPointX = UI.activePoint;
                // need starX, startY values
                UI.draggingMouse = true;

                if (console_shape == UI.CNSL.SHAPETOOLNEWLINE) {
                    WPImager.layer[WPImager.current].shape = UI.SHAPE.LINE;
                    UI.console = UI.CNSL.LINETOOLBAR;
                    UI.console_shape = UI.CNSL.SHAPETOOLMOVE;
                    $("#txt" + WPImager.current.toString()).addClass("linesquare");
                    $("#viewLayers").click();
                    WPImager.selectLayer(WPImager.current);
                } else {
                    WPImager.layer[WPImager.current].shape = UI.SHAPE.CUSTOM;
                    UI.console = UI.CNSL.SHAPETOOLBAR;
                    UI.console_shape = UI.CNSL.SHAPETOOLDRAW;
                    $("#txt" + WPImager.current.toString()).addClass("customsquare");
                    $('#shape_mode_draw').click();
                    $("#viewLayers").click();
                    WPImager.layer[WPImager.current].selectToolbar();
                    // show only text tab
                    $("#showTextOutlineConsole,#showTextCircularConsole,#showTextShadowConsole,#showTextPositionConsole,#showTextSkewConsole").hide();
                    $("#showTextLineStyle").css("display", "inline-block");
                    $(".cvsconsole").hide();
                    $("#shapetoolbar,#txtconsole,#showShapeEditConsole,#showTextBorderConsole").show();
                    $(".btn-tab").removeClass("active");
                    $("#showShapeEditConsole").addClass("active");

                }

                draw();
                WPImagerUI.flagCanvasSave(last);
                return;

            }
        } else if (UI.console == UI.CNSL.SHAPETOOLBAR && UI.console_shape == UI.CNSL.SHAPETOOLDRAW) {
            WPImager.layer[WPImager.current].appendShapePoint();
            WPImager.layer[WPImager.current].recalculateShapeContainer();
            UI.expectCPointX = UI.activePoint;
            // need starX, startY values
            UI.draggingMouse = true;
            draw();
            return;
        }

        if (WPImager.canvas.picktool === UI.LAYER.IMAGE) {
            //we are over a selection box
            if (UI.expectRecrop !== -1) {
                UI.isRecropDrag = true;
                UI.draggingMouse = true;
                WPImager.setActiveLayer();
                return;
            }
        }

        if (UI.expectResize !== -1) {
            UI.isResizeDrag = true;
            UI.draggingMouse = true;
            WPImager.setActiveLayer();
            return;
        }

        if (UI.isCropping)
        {
            UI.draggingMouse = true;
        }

        var hitLayer = WPImager.mouseHitLayerTest(x, y);

        if (UI.isCropping) {
            // don't allow user to select another layer while cropping
            if (hitLayer == 0 || hitLayer != WPImager.current) {
                // shake the cancel button
                $("#cancelCropImage,#cancelTextCrop").removeClass("btn-default").addClass("shakeme btn-warning");
                setTimeout(function () {
                    $("#cancelCropImage,#cancelTextCrop").removeClass("shakeme btn-warning").addClass("btn-default");
                }, 2000);
            }
        } else if (WPImager.layer[WPImager.current].shape == UI.SHAPE.LINE && UI.expectPoint >= 0) {
            UI.draggingMouse = true;
            draw();

        } else if ((UI.console == UI.CNSL.TXTCURVED && WPImager.layer[WPImager.current].shape == UI.SHAPE.CURVEDTEXT && UI.console_shape == UI.CNSL.SHAPETOOLEDIT)
                || (UI.console == UI.CNSL.SHAPETOOLBAR && UI.console_shape == UI.CNSL.SHAPETOOLEDIT
                        && (WPImager.layer[WPImager.current].shape == UI.SHAPE.CUSTOM || WPImager.layer[WPImager.current].shape == UI.SHAPE.LINE))) {
            if (UI.expectPoint >= 0 || UI.expectCPointB >= 0 || UI.expectCPointA >= 0 || UI.expectCPointX >= 0) {
                // don't select another layer while editing points
                if (UI.expectPoint >= 0) {
                    WPImager.layer[WPImager.current].setActivePoint(UI.expectPoint);
                    var pointcode = WPImager.layer[WPImager.current].getActivePointCode();
                    $('[id^="shape_point"]').removeClass("active");
                    if (pointcode == 1) {
                        $('#shape_point_corner').addClass("active");
                    } else if (pointcode == 2) {
                        $('#shape_point_smooth').addClass("active");
                    } else if (pointcode == 3) {
                        $('#shape_point_symmetric').addClass("active");
                    }
                }
                UI.draggingMouse = true;
                draw();
            } else {
                $("#shape_mode_drawstop").click();
            }

        } else if (hitLayer > 0) {
            if (hitLayer == WPImager.current && UI.console == UI.CNSL.TXTEDIT &&
                    WPImager.layer[WPImager.current].code == UI.LAYER.TEXT) {
                UI.input.cursorPos = UI.input.CURSORPUT_MOUSECLICK; // indicate to UI to calculate cursor position from mouse x, y.
                draw();
                UI.input.selectionStart = UI.input.cursorPos;
                WPImager.startCursor();
                WPImagerUI.returnToTextEdit();
            } else {
                WPImager.mouseClickLayer(hitLayer);
                draw();
            }
        } else {
            WPImager.clearMultiLayers();
            if (UI.console == UI.CNSL.TXTEDIT) {
                $('#showTextToolbar').click();
            }
        }
        // show x,y layer cordinates
        WPImagerUI.footer();

    }



    function handleMouseMove(e) {
        var mouseX, mouseY;
        if (e.pageX || e.pageY) {
            mouseX = parseInt(e.pageX);
            mouseY = parseInt(e.pageY);
        } else {
            mouseX = parseInt(e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft);
            mouseY = parseInt(e.clientY + document.body.scrollTop + document.documentElement.scrollTop);
        }

        var x = parseInt($("#cvs").offset().left) - mouseX;
        var y = parseInt($("#cvs").offset().top) - mouseY;

        // added in case canvas is css sized
        if (WPImager.canvas.width != $("#cvs").width()) {
            x = parseInt(x * (WPImager.canvas.width / $("#cvs").width()));
        }
        if (WPImager.canvas.height != $("#cvs").height()) {
            y = parseInt(y * (WPImager.canvas.height / $("#cvs").height()));
        }

        UI.touchedDX = -x - UI.touchedX;
        UI.touchedDY = -y - UI.touchedY;
        UI.hoverX = -x;
        UI.hoverY = -y;

        if (UI.pickonCanvas && $("#canvascolorpickerconsole").is(":visible")) {
//            $("#cvs").css("cursor", 'pointer');
            $("#cvs").css("cursor", "url(" + cursor_picker_file + "), auto");
            return;
        }

        if (UI.draggingMouse) {
            // mouse in dragging mode
            UI.hitLayer = -1;

            // adjust the image or text size by the amount of the latest drag
            var dx = mouseX - startX;
            var dy = mouseY - startY;

            // added in case canvas is css sized
            if (WPImager.canvas.width != $("#cvs").width()) {
                dx = parseInt(dx * (WPImager.canvas.width / $("#cvs").width()));
            }
            if (WPImager.canvas.height != $("#cvs").height()) {
                dy = parseInt(dy * (WPImager.canvas.height / $("#cvs").height()));
            }

            WPImager.mouseDragging(dx, dy);

            // reset the startXY for next time
            startX = mouseX;
            startY = mouseY;

            // redraw the image with border            
            // remove jerky rendering especially in Firefox
            setTimeout(function () {
                draw();
            }, 20);
            e.preventDefault();
        } else if (UI.input.selectionStart >= 0) {
            UI.input.cursorPos = UI.input.CURSORCALC_MOUSECLICK; // indicate to UI to calculate cursor position from mouse x, y. without placing cursor
            draw();
            var curPos = UI.input.cursorPos;
            var start = Math.min(UI.input.selectionStart, curPos);
            var end = Math.max(UI.input.selectionStart, curPos);

            if (UI.input.selection[0] !== start || UI.input.selection[1] !== end) {
                UI.input.selection = [start, end];
                draw();
            }

        } else {
            // mouse in hovering
            UI.isResizeDrag = false;
            UI.expectResize = -1;
            UI.expectRecrop = -1;
            UI.expectResizeCVS = -1;

            WPImager.mouseHovering(x, y);

            //   WPImager.sampleCanvasColor($("#canvascolorpicker_selector").val(), mouseX, mouseY);
            //   removed

            if (UI.console == UI.CNSL.SHAPETOOLBAR
                    && (UI.console_shape == UI.CNSL.SHAPETOOLNEW || UI.console_shape == UI.CNSL.SHAPETOOLNEWLINE)) {

            } else if (UI.console == UI.CNSL.SHAPETOOLBAR && UI.console_shape == UI.CNSL.SHAPETOOLEDIT
                    && (WPImager.layer[WPImager.current].shape == UI.SHAPE.CUSTOM || WPImager.layer[WPImager.current].shape == UI.SHAPE.LINE)) {
                // don't select another layer while editing points

            } else if (UI.console == UI.CNSL.TXTCURVED && UI.console_shape == UI.CNSL.SHAPETOOLEDIT
                    && WPImager.layer[WPImager.current].shape == UI.SHAPE.CURVEDTEXT) {
            } else if (UI.resizeCVS) {
                WPImager.mouseHoverCVS(x, y);
                WPImagerUI.draw();
            } else if (UI.expectResize == 8) {
                draw();
            } else if (UI.expectResize == -1 && UI.expectRecrop == -1) {
                //   if (!UI.isCropping) // if not cropping check for cursor hit on image and text
                var lastHitLayer = UI.hitLayer;
                UI.hitLayer = WPImager.mouseHitLayerTest(x, y);
                if (UI.hitLayer == -1) {
                    $("#cvs").css("cursor", 'auto');
                    if (UI.hitLayer != lastHitLayer)
                        draw();
                } else {
                    $("#cvs").css("cursor", '');
                    $("#cvs").attr("class", 'grabbable');
                    draw();
                }
            }
        }
        // show x,y layer cordinates
        WPImagerUI.footer();

    }

    function handleMouseUp(e) {
        if (UI.console == UI.CNSL.SHAPETOOLBAR && UI.console_shape == UI.CNSL.SHAPETOOLDRAW
                && (WPImager.layer[WPImager.current].shape == UI.SHAPE.CURVEDTEXT
                        || WPImager.layer[WPImager.current].shape == UI.SHAPE.CUSTOM || WPImager.layer[WPImager.current].shape == UI.SHAPE.LINE)) {
            UI.draggingMouse = false;
            return; // continue drawing path
        }

        if (UI.isRecropDrag || UI.isResizeDrag) {
            UI.isResizeDrag = false;
            UI.isRecropDrag = false;
            if (WPImager.layer[WPImager.current].code == UI.LAYER.IMAGE) {
                WPImagerUI.resize_image(WPImager.current);
                WPImager.layer[WPImager.current].ui_skew_refresh();
            }
        }
        if (UI.isCropping) {
            if (WPImager.layer[WPImager.current].code == UI.LAYER.IMAGE)
                WPImagerUI.resize_image(WPImager.current);
        }

        if (UI.draggingMouse) {
            WPImagerUI.flagCanvasSave();
            UI.draggingMouse = false;
        }

        if (UI.expectResizeCVS !== -1) {
            UI.expectResizeCVS = -1;
        }

        if (UI.expectResize !== -1) {
            if (WPImager.canvas.picktool === UI.LAYER.IMAGE) {
                WPImager.layerControlUpdate(WPImager.current);
            }
            UI.expectResize = -1;
        }
        UI.expectRecrop = -1;
        UI.hitLayer = -1;
        UI.input.selectionStart = -1;

        var hasSelection = (UI.input.selection[0] > 0 || UI.input.selection[1] > 0);
        if (hasSelection) {
            input.selectionStart = UI.input.selection[0];
            input.selectionEnd = UI.input.selection[1];
        }
        if (UI.console == UI.CNSL.TXTEDIT) {
            $("#input").focus();
        }
        if (!UI.pickonCanvas) {
            $("#cvs").css("cursor", '');
        }
        draw();
    }


    document.addEventListener("keydown", function (e) {
        var target = e.target || e.srcElement;
        UI.input.keypressed = (e.keyCode == 16 || e.keyCode == 17) ? 0 : e.keyCode;
        // skip textarea and text box
//        if (target.tagName.toLowerCase() === "textarea" ||
        if (target.tagName.toLowerCase() === "input") {
            if (e.keyCode == 17) {
                // CTRL
                UI.ctrl_pressed = true;
            } else if (UI.ctrl_pressed && e.keyCode == 83) {
                // CTRL-S
                WPImager.savecanvas();
                WPImager.postthumbnail();
                e.preventDefault();
            }
            return;
        }


        if (UI.console == UI.CNSL.TXTEDIT || UI.console == UI.CNSL.TXTEDITRETURN) {
            if (e.keyCode == 16) {
                // SHIFT
                UI.shift_pressed = true;
            }
            if (e.keyCode == 17) {
                // CTRL
                UI.ctrl_pressed = true;
            }


            if (!UI.ctrl_pressed) {
                if ([37, 39, 38, 40, 36, 35].indexOf(UI.input.keypressed) > -1) {
                    if (!UI.shift_pressed) {
                        input.selectionStart = UI.input.selection[0];
                        input.selectionEnd = UI.input.selection[1];
                    }
                    if (UI.input.keypressed === 37) // left arrow
                        UI.input.cursormove = UI.input.CURSORMOVE_LEFT;
                    if (UI.input.keypressed === 39) // right arrow
                        UI.input.cursormove = UI.input.CURSORMOVE_RIGHT;
                    if (UI.input.keypressed === 38) // up arrow
                        UI.input.cursormove = UI.input.CURSORMOVE_LINEUP;
                    if (UI.input.keypressed === 40) // down arrow
                        UI.input.cursormove = UI.input.CURSORMOVE_LINEDOWN;
                    if (UI.input.keypressed === 36) // home
                        UI.input.cursormove = UI.input.CURSORMOVE_LINE_HOME;
                    if (UI.input.keypressed === 35) // end
                        UI.input.cursormove = UI.input.CURSORMOVE_LINE_END;

                    UI.input.cursor = true;
                    draw();
                    WPImager.startCursor();
                    UI.input.keypressed = 0;
                    return;
                }
            }
            draw();
            WPImager.startCursor();


            return;
        }
        // arrow keys and delete key
        if ([37, 38, 39, 40, 46].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }

        var moveX = 0, moveY = 0;
        var x10 = e.shiftKey ? 10 : 1;
        if (e.keyCode === 37) {
            moveX = -1 * x10;
        } else if (e.keyCode === 39) {
            moveX = 1 * x10;
        } else if (e.keyCode === 38) {
            moveY = -1 * x10;
        } else if (e.keyCode === 40) {
            moveY = 1 * x10;
        } else if (e.keyCode === 46 && UI.delete_ready) {
            if ($("#cvs").is(":focus")) {
                // DELETE key pressed
                UI.delete_ready = false;
                WPImager.deleteLayer(WPImager.current);
                var layer = "#lyr" + WPImager.current.toString();
                $(layer).slideUp();
                WPImagerUI.flagCanvasSave();
                WPImager.selectLayerAdjacent(WPImager.current);
                draw();
            }
            return;
        } else if (UI.ctrl_pressed) {
            if (e.keyCode == 90) {
                // CTRL-Z pressed
                if (target.tagName.toLowerCase() !== "textarea" &&
                        target.tagName.toLowerCase() !== "input") {
                    $('#undo').trigger('click');
                    e.preventDefault();
                }
            } else if (e.keyCode == 89) {
                // CTRL-Y pressed
                if (target.tagName.toLowerCase() !== "textarea" &&
                        target.tagName.toLowerCase() !== "input") {
                    $('#redo').trigger('click');
                    e.preventDefault();
                }
            } else if (e.keyCode == 82) {
                var ccode = WPImager.layer[WPImager.current].code == UI.LAYER.TEXT;
                if (ccode == UI.LAYER.TEXT) {
                    $("#showTextRotateConsole").click();
                    $("#rotateText").focus();
                } else if (ccode == UI.LAYER.COM) {
                    $("#showTextRotateConsole").click();
                    $("#rotateText").focus();
                } else if (ccode == UI.LAYER.IMAGE) {
                    $("#showRotateImageConsole").click();
                    $("#rotateImage").focus();
                }
                e.preventDefault();
            } else if (e.keyCode == 83) {
                // CTRL-S
                WPImager.savecanvas();
                WPImager.postthumbnail();
                e.preventDefault();
            }
        } else if (e.keyCode == 17) {
            // CTRL
            UI.ctrl_pressed = true;
        } else if (e.keyCode == 16) {
            // SHIFT
            UI.shift_pressed = true;
        }
        if (moveX !== 0 || moveY !== 0) {
            if (UI.isCropping) {
                if (WPImager.canvas.picktool === UI.LAYER.IMAGE) {
                    UI.cropBox.x += moveX;
                    UI.cropBox.y += moveY;
                    WPImagerUI.resize_image(WPImager.current);
                }
            } else {
                WPImager.moveLayer(moveX, moveY);
                // move additionally selected objects
                for (var i = 0; i < WPImager.multiselect.length; i++) {
                    var index = WPImager.multiselect[i];
                    WPImager.moveLayer(moveX, moveY, index);
                }
                WPImagerUI.footer();
            }
        }
        draw();
    }, false);

    document.addEventListener('keyup', function (e) {
        // ctrl key released
        if (e.keyCode == 17) {
            UI.ctrl_pressed = false;
            draw();
        }
        // shift key released
        if (e.keyCode == 16) {
            UI.shift_pressed = false;
            draw();
        }
        UI.delete_ready = true;

    }, false);

});

(function ($) {
    /**
     * UI Object
     * Contains methods and properties to define canvas UI states
     */
    UI = {
        slide: {
            current: 0,
            selected: 0,
            slideMaxIndex: 0
        },
        app: 0,
        APP: {CANVAS: 0, SLIDER: 1, STITCH: 2, ADDSLIDE: 3, PRINT: 4, enabletemplate: 5, /* GIF:6,*/ SETTINGS: 99},
        console: 0,
        console_shape: 203,
        kitIDs: [],
        addOnLayer: {},
        CNSL: {// console types
            ZERO: 0,
            IMGMAIN: 7,
            IMGROTATE: 10,
            IMGBORDER: 20,
            IMGCROP: 30,
            IMGBLUR: 40,
            IMGSHADOW: 50,
            IMGSKEW: 60,
            TXTTOOLBAR: 100,
            TXTCOLOR: 101,
            TXTBACKGROUND: 102,
            TXTEDIT: 105,
            TXTEDITRETURN: 104,
            TXTROTATE: 110,
            TXTPOSITION: 115,
            TXTBORDER: 120,
            TXTOUTLINE: 125,
            TXTCROP: 130,
            TXTSHADOW: 140,
            TXTSHADOWFILL: 145,
            TXTCIRCULAR: 150,
            TXTSKEW: 160,
            TXTCURVED: 170,
            SHAPETOOLBAR: 200,
            SHAPETOOLDRAW: 201,
            SHAPETOOLEDIT: 202,
            SHAPETOOLMOVE: 203,
            SHAPETOOLNEW: 204,
            SHAPETOOLNEWLINE: 220,
            LINETOOLBAR: 270,
            LINESTYLETOOLBAR: 280,
            POLYGONTOOLBAR: 290,
            BACKGROUNDTOOLBAR: 300,
            QRTOOLBAR: 350,
            COMTOOLBAR: 360,
            RESIZECVS: 900,
        },
        LAYER: {
            TEXT: 0,
            IMAGE: 1,
            GROUP: 2,
            QR: 3,
            COM: 4
        },
        SHAPE: {
            RECTANGLE: 0,
            POLYGON: 1,
            SQUARE: 2,
            ELLIPSE: 3,
            CIRCLE: 4,
            CURVEDTEXT: 7,
            LINE: 8,
            CUSTOM: 10,
            BACKGROUND: 12,
            PARALLELOGRAM: 14,
            TRAPEZOID: 16,
            RIBBON: 18
        },
        MEDIAREPLACE: {
            NORESIZE: 0,
            RESIZE: 1,
            CROP: 2
        },
        UPLOAD: {
            RESIZETOCANVAS: 1
        },
        GFonts: {},
        cropBox: {x: 0, y: 0, width: 0, height: 0},
        xhr: {},
        xhr2: {},
        edgeHandles: [],
        pointHandles: [],
        skipDrawing: false,
        isDrawing: false,
        isPrinting: false,
        isUndoRedoing: false,
        saveTimeoutOn: false,
        draggingMouse: false,
        resizeCVS: false,
        expectResizeCVS: -1,
        expectResize: -1,
        expectRecrop: -1,
        expectPoint: -1,
        expectCPointB: -1,
        expectCPointA: -1,
        expectCPointX: -1,
        expectCPointNew: 0,
        activePoint: -1,
        pathPointNew: "",
        isResizeDrag: false,
        isRecropDrag: false,
        isCropping: false,
        isRotating: false,
        FaReplaceText: true,
        hitLayer: -1,
        comScale: {active: false, scaleOn: false, scaleX: 1, scaleY: 1},
        comSlideRenderCanvas: false,
        hoverX: 0,
        hoverY: 0,
        touchedX: 0,
        touchedY: 0,
        touchedDX: 0,
        touchedDY: 0,
        touchedPathPoints: "",
        activeLayerWidth: 0,
        activeLayerHeight: 0,
        activeLayerX: 0,
        activeLayerY: 0,
        calibratedY: 0,
        input: {cursorInterval: 0, cursorPos: 0, cursor: false, cursorLineUpDown: [], cursorLine: 0, cursorChar: 0, selection: [0, 0], selectionStart: -1, keypressed: -1, CURSORPUT_MOUSECLICK: -1, cursormove: 0, CURSORCALC_MOUSECLICK: -2, CURSORMOVE_LINEUP: 1, CURSORMOVE_LINEDOWN: 2, CURSORMOVE_LEFT: 3, CURSORMOVE_RIGHT: 4, CURSORMOVE_LINE_HOME: 5, CURSORMOVE_LINE_END: 6},
        blink: {state: 0, xOffset: 0, yOffset: 0, height: 0, OFF: 0, INIT: 1, BLINKOFF: 2, BLINKON: 3, BLINKING: 4},
        playInterval: 0,
        resizeCVSInterval: 0,
        saved_canvas: "",
        saved_layers: "",
        flagDirty: false,
        ctrl_pressed: false,
        shift_pressed: false,
        delete_ready: true,
        iconpicker_insertchar: 0,
        support_download: false,
        lastfontselected: {fontfamily: "", srctype: -1, border: ""},
        colorpalette: [{title: "Color #1", order: 1, disposed: 0, palette: "#0066FF,#ffcdd2,#ef9a9a,#288DC0,#ef5350"}, {title: "C2", order: 2, palette: "#f44336,#e53935,#d32f2f", disposed: 0}],
        currentpalette: -1,
        pickerScheme: "",
        pickonCanvas: false,
        builtTinyCP: false,
        cpRenderCallback: true,
        cpDragging: false,
        customTheme: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#ffffff'],
        customTheme2: ['#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b', '#000000'],
        matcolors: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39',
            '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b'],
        matcolorScheme: {"#f44336": "#ffebee,#ffcdd2,#ef9a9a,#e57373,#ef5350,#f44336,#e53935,#d32f2f,#c62828,#b71c1c,#ff8a80,#ff5252,#ff1744,#d50000",
            "#e91e63": "#fce4ec,#f8bbd0,#f48fb1,#f06292,#ec407a,#e91e63,#d81b60,#c2185b,#ad1457,#880e4f,#ff80ab,#ff4081,#f50057,#c51162",
            "#9c27b0": "#f3e5f5,#e1bee7,#ce93d8,#ba68c8,#ab47bc,#9c27b0,#8e24aa,#7b1fa2,#6a1b9a,#4a148c,#ea80fc,#e040fb,#d500f9,#aa00ff",
            "#673ab7": "#ede7f6,#d1c4e9,#b39ddb,#9575cd,#7e57c2,#673ab7,#5e35b1,#512da8,#4527a0,#311b92,#b388ff,#7c4dff,#651fff,#6200ea",
            "#3f51b5": "#e8eaf6,#c5cae9,#9fa8da,#7986cb,#5c6bc0,#3f51b5,#3949ab,#303f9f,#283593,#1a237e,#8c9eff,#536dfe,#3d5afe,#304ffe",
            "#2196f3": "#e3f2fd,#bbdefb,#90caf9,#64b5f6,#42a5f5,#2196f3,#1e88e5,#1976d2,#1565c0,#0d47a1,#82b1ff,#448aff,#2979ff,#2962ff",
            "#03a9f4": "#e1f5fe,#b3e5fc,#81d4fa,#4fc3f7,#29b6f6,#03a9f4,#039be5,#0288d1,#0277bd,#01579b,#80d8ff,#40c4ff,#00b0ff,#0091ea",
            "#00bcd4": "#e0f7fa,#b2ebf2,#80deea,#4dd0e1,#26c6da,#00bcd4,#00acc1,#0097a7,#00838f,#006064,#84ffff,#18ffff,#00e5ff,#00b8d4",
            "#009688": "#e0f2f1,#b2dfdb,#80cbc4,#4db6ac,#26a69a,#009688,#00897b,#00796b,#00695c,#004d40,#a7ffeb,#64ffda,#1de9b6,#00bfa5",
            "#4caf50": "#e8f5e9,#c8e6c9,#a5d6a7,#81c784,#66bb6a,#4caf50,#43a047,#388e3c,#2e7d32,#1b5e20,#b9f6ca,#69f0ae,#00e676,#00c853",
            "#8bc34a": "#f1f8e9,#dcedc8,#c5e1a5,#aed581,#9ccc65,#8bc34a,#7cb342,#689f38,#558b2f,#33691e,#ccff90,#b2ff59,#76ff03,#64dd17",
            "#cddc39": "#f9fbe7,#f0f4c3,#e6ee9c,#dce775,#d4e157,#cddc39,#c0ca33,#afb42b,#9e9d24,#827717,#f4ff81,#eeff41,#c6ff00,#aeea00",
            "#ffeb3b": "#fffde7,#fff9c4,#fff59d,#fff176,#ffee58,#ffeb3b,#fdd835,#fbc02d,#f9a825,#f57f17,#ffff8d,#ffff00,#ffea00,#ffd600",
            "#ffc107": "#fff8e1,#ffecb3,#ffe082,#ffd54f,#ffca28,#ffc107,#ffb300,#ffa000,#ff8f00,#ff6f00,#ffe57f,#ffd740,#ffc400,#ffab00",
            "#ff9800": "#fff3e0,#ffe0b2,#ffcc80,#ffb74d,#ffa726,#ff9800,#fb8c00,#f57c00,#ef6c00,#e65100,#ffd180,#ffab40,#ff9100,#ff6d00",
            "#ff5722": "#fbe9e7,#ffccbc,#ffab91,#ff8a65,#ff7043,#ff5722,#f4511e,#e64a19,#d84315,#bf360c,#ff9e80,#ff6e40,#ff3d00,#dd2c00",
            "#795548": "#efebe9,#d7ccc8,#bcaaa4,#a1887f,#8d6e63,#795548,#6d4c41,#5d4037,#4e342e,#3e2723",
            "#9e9e9e": "#fafafa,#f5f5f5,#eeeeee,#e0e0e0,#bdbdbd,#9e9e9e,#757575,#616161,#424242,#212121",
            "#607d8b": "#eceff1,#cfd8dc,#b0bec5,#90a4ae,#78909c,#607d8b,#546e7a,#455a64,#37474f,#263238",
            "#ffffff": "#eeeeee,#dddddd,#cccccc,#bbbbbb,#aaaaaa,#999999,#888888,#777777,#666666,#555555,#444444,#333333,#222222,#111111"},
        upload_to_editor_layer: -1,
        send_to_editor_layer: -1,
        nonce: "",
        startedDraw: false,
        media_attachment_model: {},
        media_attachment_page: 0,
        media_replace_options: {resize_option: 0},
        zoom: -1, // 0 - full width or 1 - 100%
        canvas_bottom_height: 0, // remember 100% zoom height
        cloudKit: {slides: {}, layers: {}},
        upstreamCom: [],
        downstreamCom: [],
        boot: function () {
            this.support_download = this.checkSupportsAttribute('a', 'download');
            WPImagerUI.showToolViewSlides();
        },
        checkSupportsAttribute: function (element, attribute) {
            var test = document.createElement(element);
            if (attribute in test) {
                return true;
            } else {
                return false;
            }
        },
        canvasColorPicker: function () {
            var picker = document.getElementById('canvas-color-picker');
            // $("#canvas-color-picker").width($("#canvascolorpickerconsole").width());
            picker.width = $("#canvascolorpickerconsole").width();
            if (UI.currentpalette == -1) {
                var color_width = parseInt($("#canvascolorpickerconsole").width() / UI.matcolors.length);
                picker.height = 55;
                var pctx = picker.getContext('2d');
                pctx.clearRect(0, 0, picker.width, picker.height);

                for (var i = 0; i < UI.matcolors.length; i++) {
                    pctx.fillStyle = UI.matcolors[i];
                    pctx.fillRect(i * color_width, 0, color_width - 1, 27);
                    pctx.fillRect(i * color_width, 28, color_width - 1, 27);
                }
                var grd1 = pctx.createLinearGradient(0, 0, (UI.matcolors.length - 3) * color_width, 0);
                grd1.addColorStop(0, '#ff0000');
                grd1.addColorStop(0.17, '#ffff00');
                grd1.addColorStop(0.34, '#00ff00');
                grd1.addColorStop(0.51, '#0000ff');
                grd1.addColorStop(0.68, '#0000ff');
                grd1.addColorStop(0.85, '#ff00ff');
                grd1.addColorStop(1, '#ff0000');
                pctx.fillStyle = grd1;
                pctx.fillRect(0, 28, (UI.matcolors.length - 3) * color_width - 1, 27);
                this.canvasColorPickerBWT();
            } else {
                var colors = UI.colorpalette[UI.currentpalette].palette.split(',');
                var color_width = parseInt($("#canvascolorpickerconsole").width() / (colors.length));
                picker.height = 55;
                var pctx = picker.getContext('2d');
                pctx.clearRect(0, 0, picker.width, picker.height);

                for (var i = 0; i < colors.length; i++) {
                    pctx.fillStyle = colors[i];
                    pctx.fillRect((i) * color_width, 0, color_width - 1, 27);
                }

                var default_color = colors[1];
                this.generateColorShades(default_color);

            }
            $("#canvas-color-picker").show();

        },
        generateSelectedColorShades: function (color) {
//            this.generateColorShades(color);
            var picker = document.getElementById('canvas-color-picker');
            var pctx = picker.getContext('2d');
            var palettecolors_width = parseInt($("#canvascolorpickerconsole").width() / (UI.matcolors.length)) * (UI.matcolors.length);
            var color_width = parseInt($("#canvascolorpickerconsole").width() / UI.matcolors.length);
            var excess_width = 0; //palettecolors_width - colors_width;

            var xPlot = 0;

            pctx.clearRect(0, 28, $("#canvascolorpickerconsole").width(), 27);
            var iStart = 10, iDone = -10;
            var excess_width = 0;
            if (UI.currentpalette == -1) {
                iStart = 8;
                iDone = -8;
            } else {
                var palettecolors = UI.colorpalette[UI.currentpalette].palette.split(',');
                var palettecolors_width = parseInt($("#canvascolorpickerconsole").width() / (palettecolors.length)) * (palettecolors.length);
                var color_width = parseInt($("#canvascolorpickerconsole").width() / 20);
                var colors_width = color_width * 20;
                excess_width = palettecolors_width - colors_width;

            }

            for (var i = iStart; i > iDone; i--) {
                var _color_width = (--excess_width >= 0) ? color_width + 1 : color_width;
                var _shade = tinycolor(color).lighten(i * 3).toHexString();
                pctx.fillStyle = _shade;
                pctx.fillRect(xPlot, 28, _color_width - 1, 27);
                xPlot += _color_width;
            }
            if (UI.currentpalette == -1) {
                this.canvasColorPickerBWT();
            }

        },
        generateColorShades: function (default_color) {
            var picker = document.getElementById('canvas-color-picker');
            var pctx = picker.getContext('2d');
            var color_width = parseInt($("#canvascolorpickerconsole").width() / 20);
            var palettecolors = UI.colorpalette[UI.currentpalette].palette.split(',');
            var palettecolors_width = parseInt($("#canvascolorpickerconsole").width() / (palettecolors.length)) * (palettecolors.length);
            var colors_width = color_width * 20;
            var excess_width = palettecolors_width - colors_width;

            var color = default_color;
            var tiny = tinycolor(color);
            var colors, i = 0, last_i = 0;

            colors = tiny.analogous(11, 30);
            var _colors = colors.map(function (t) {
                return t.toHexString();
            });
            var xPlot = 0;
            for (i = 1; i < _colors.length + last_i; i++) {
                var _color_width = (--excess_width >= 0) ? color_width + 1 : color_width;
                pctx.fillStyle = _colors[i];
                pctx.fillRect(xPlot, 28, _color_width - 1, 27);
                xPlot += _color_width;
            }
            last_i = i;
            colors = tiny.monochromatic(10);
            colors.sort(function (a, b) {
                return a.toHsv().v > b.toHsv().v ? 1 : -1;
            });
            var _colors = colors.map(function (t) {
                return t.toHexString();
            });
            for (; i < _colors.length + last_i; i++) {
                var _color_width = (--excess_width >= 0) ? color_width + 1 : color_width;
                pctx.fillStyle = _colors[i - last_i];
                pctx.fillRect(xPlot, 28, _color_width - 1, 27);
                xPlot += _color_width;
            }
        },
        canvasColorPickerScheme: function (colors) {
            var picker = document.getElementById('canvas-color-picker');
            // $("#canvas-color-picker").width($("#canvascolorpickerconsole").width());
            // picker.width = $("#canvascolorpickerconsole").width();
            var total_color_width = parseInt($("#canvascolorpickerconsole").width() / UI.matcolors.length) * UI.matcolors.length;
//        var color_width = parseInt(total_color_width / colors.length);
            var color_width = parseInt($("#canvascolorpickerconsole").width() / UI.matcolors.length);
//        picker.height = 40;
            var pctx = picker.getContext('2d');
//           pctx.fillStyle = "#000000";
            pctx.clearRect(0, 28, picker.width, picker.height);
            var iZero = UI.matcolors.length - colors.length - 3;
            for (var i = 0; i < colors.length; i++) {
                pctx.fillStyle = colors[i];
                pctx.fillRect((i + iZero) * color_width, 28, color_width - 1, 27);
            }

            // var grd1 = pctx.createLinearGradient(0, 0, (UI.matcolors.length - i - 1)*color_width, 0);
            var grd1 = pctx.createLinearGradient(0, 0, (iZero) * color_width, 0);
            grd1.addColorStop(0, '#ff0000');
            grd1.addColorStop(0.17, '#ffff00');
            grd1.addColorStop(0.34, '#00ff00');
            grd1.addColorStop(0.51, '#0000ff');
            grd1.addColorStop(0.68, '#0000ff');
            grd1.addColorStop(0.85, '#ff00ff');
            grd1.addColorStop(1, '#ff0000');
            pctx.fillStyle = grd1;
            pctx.fillRect(0, 28, (iZero) * color_width - 1, 27);

            this.canvasColorPickerBWT();
        },
        canvasColorPickerBWT: function () {
            var picker = document.getElementById('canvas-color-picker');
            var pctx = picker.getContext('2d');
            var color_width = parseInt($("#canvascolorpickerconsole").width() / UI.matcolors.length);

            pctx.fillStyle = "#000000";
            pctx.fillRect((UI.matcolors.length - 3) * color_width, 28, color_width - 1, 27);
            pctx.fillStyle = "#ffffff";
            pctx.fillRect((UI.matcolors.length - 2) * color_width, 28, color_width - 1, 27);
            pctx.fillStyle = "#fafafa";
            pctx.fillRect((UI.matcolors.length - 1) * color_width, 28, color_width - 1, 27);
            pctx.beginPath();
            pctx.strokeStyle = "#ff0000";
            pctx.moveTo((UI.matcolors.length - 1) * color_width - 1, 28);
            pctx.lineTo((UI.matcolors.length) * color_width, 28 + 27);
            pctx.stroke();

            pctx.moveTo((UI.matcolors.length - 1) * color_width - 1, 28 + 27);
            pctx.lineTo((UI.matcolors.length) * color_width, 28);
            pctx.stroke();
        },
        populatePointHandlers: function (x, y, w, h, pathPoints) {
            UI.pointHandles.length = 0;
            var _t = pathPoints.split(',');
            $.each(_t, function (i, el) {
                var coor = el.split(' ');
                var mx = UI.parseFloat(coor[0]);
                var my = UI.parseFloat(coor[1]);
                var pointcode = parseInt(coor[2]) % 4;
                var xB = 0, yB = 0, xA = 0, yA = 0;
                if (pointcode > 0) {
                    xB = UI.parseFloat(coor[3]), yB = UI.parseFloat(coor[4]);
                    xA = UI.parseFloat(coor[5]), yA = UI.parseFloat(coor[6]);
                }

                var rect = {x: x + mx, y: y + my, code: pointcode, xB: x + xB, yB: y + yB, xA: x + xA, yA: y + yA};
                UI.pointHandles.push(rect);
            });
        },
        populateEdgeHandlers: function (x, y, w, h) {
            var resizeBoxArea = 8;
            // set up the selection handle boxes
            if (this.edgeHandles.length === 0) {
                for (var corner = 0; corner <= 8; corner++) {
                    var rect = {x: 0, y: 0, _x: 0, _y: 0, w: 1, h: 1};
                    this.edgeHandles.push(rect);
                }
            }
            var half = resizeBoxArea; // / 2;
            //    8
            // 0  1  2
            // 3  9  4
            // 5  6  7
            // 
            // top left, middle, right
            this.edgeHandles[0] = {x: x, y: y, _x: x, _y: y};
            this.edgeHandles[1] = {x: x + w / 2 - half / 2, y: y, _x: x + w / 2, _y: y};
            this.edgeHandles[2] = {x: x + w - half, y: y, _x: x + w, _y: y};
            //middle left, right
            this.edgeHandles[3] = {x: x, y: y + h / 2 - half / 2, _x: x, _y: y + h / 2};
            this.edgeHandles[4] = {x: x + w - half, y: y + h / 2 - half / 2, _x: x + w, _y: y + h / 2};
            //bottom left, middle, right
            this.edgeHandles[5] = {x: x, y: y + h - half, _x: x, _y: y + h};
            this.edgeHandles[6] = {x: x + w / 2 - half / 2, y: y + h - half, _x: x + w / 2, _y: y + h};
            this.edgeHandles[7] = {x: x + w - half, y: y + h - half, _x: x + w, _y: y + h};
            // center
            this.edgeHandles[9] = {x: x + w / 2 - half * 2, y: y + h / 2 - half * 2, _x: x + w / 2 + half * 2, _y: y + h / 2 + half * 2};
            this.edgeHandles[8] = {x: x + w / 2 - half, y: y - 30, _x: x + w / 2, _y: y - 30};
        },
        showResizeCursor: function (i) {
            if (i == 8) {
                $("#cvs").css("cursor", '');
                $("#cvs").attr("class", 'grabbable');
            } else {
                $("#cvs").css("cursor", 'none');
            }
            return;

            switch (i) {
                case 0:
                    $("#cvs").css("cursor", 'nw-resize');
                    break;
                case 1:
                    if (!UI.shift_pressed)
                        $("#cvs").css("cursor", 'n-resize');
                    break;
                case 2:
                    $("#cvs").css("cursor", 'ne-resize');
                    break;
                case 3:
                    if (!UI.shift_pressed)
                        $("#cvs").css("cursor", 'w-resize');
                    break;
                case 4:
                    if (!UI.shift_pressed)
                        $("#cvs").css("cursor", 'e-resize');
                    break;
                case 5:
                    $("#cvs").css("cursor", 'sw-resize');
                    break;
                case 6:
                    if (!UI.shift_pressed)
                        $("#cvs").css("cursor", 's-resize');
                    break;
                case 7:
                    $("#cvs").css("cursor", 'se-resize');
                    break;
                case 8:
                    $("#cvs").css("cursor", '');
                    $("#cvs").attr("class", 'grabbable');
                    break;
            }
        },
        validateColorHex: function (hex) {
            var isOk = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hex);
            if (isOk || hex.toLowerCase() == "#0000ffff") {
                return hex;
            } else {
                return false;
            }
        },
        parseFloat: function (value) {
            var precision = 4;
            var power = Math.pow(10, precision || 0);
            return (Math.round(value * power) / power);
        },
        affixCopyLabel: function (note) {
            var affixcopy = " (copy)";
            if (note.length > 8) {
                var lastchars = note.substr(note.length - 6).trim();
                if (/\(copy\)/.test(lastchars)) {
                    affixcopy = ""; // already marked (copy)
                }
            }
            return note + affixcopy;
        },
        getval: function (val, defaultval) {
            if (typeof val === "undefined" || val == null) {
                return defaultval;
            }
            return val;
        },
        prepareApp: function (appcode) {
            UI.app = appcode;
            switch (appcode) {
                case UI.APP.SETTINGS:
                    $('#wpimager_settings,#backtocanvas-wrap').show();
                    $("#backtowp,.cvsconsole,.taskconsole, .outputconsole_task").hide();
                    $("#wpimager_addslide,#canvas_slides,#toolBox,#undoredo-box,#cvsfooter_wrap,#wpimager_iframe,#wpimager_kitframe").hide();
                    $("#cvsbox_menu").hide();
                    $("#imgconsole,#txtconsole,#canvas_bottom").hide();
                    $("#cvswrap").hide();
                    $("#promptprintcanvas,#downloadPNG").addClass("inactive");
                    $("#showViewTools").addClass("disabled");
                    break;
                case UI.APP.ADDSLIDE:
                    $("#backtowp,.cvsconsole,.taskconsole, .outputconsole_task").hide();
                    $("#wpimager_settings,#canvas_slides,#toolBox,#undoredo-box,#cvsfooter_wrap,#wpimager_iframe,#wpimager_kitframe").hide();
                    $("#cvsbox_menu").hide();
                    $("#imgconsole,#txtconsole").hide();
                    $("#cvswrap,#canvas_bottom").hide();
                    $("#wpimager_addslide").show();
                    $(".addslide_hide").hide();
                    $(".addslide_show,#backtocanvas-wrap").show();
                    $("#wpimager_addslide_mainmenu button").removeClass("btn-success");
                    $("#promptprintcanvas,#downloadPNG").addClass("inactive");
                    $("#showViewTools").addClass("disabled");
                    break;
                case UI.APP.CANVAS:
                case UI.APP.PRINT:
                default:
                    $("#wpimager_addslide,.outputconsole_task,#wpimager_addslide,#wpimager_settings,#wpimager_iframe,#wpimager_kitframe,#backtocanvas-wrap").hide();
                    $("#backtowp,#cvswrap,#cvs,#cvsbox_menu,#canvas_bottom").show();
                    $("#canvas_slides,#toolBox,#undoredo-box,#cvsfooter_wrap,#toolSlidesMainMenu").show();
                    $("#act0").slideDown();
                    UI.app = UI.APP.CANVAS;
                    break;

            }
            WPImagerUI.dockToolLayers();
        }

    };

    var $_fn_hide = $.fn.hide;
    $.fn.hide = function (speed, callback) {
        $(this).trigger('hide');
        if (WPImager.boot !== 0) {
            var stopResizeCVS = false;
            if ($(this).length == 1) {
                stopResizeCVS = ($(this).attr("id") == "toolCanvas");
            } else if ($(this).length > 1) {
                $(this).each(function (index, value) {
                    if ($(this).attr("id") == "toolCanvas") {
                        stopResizeCVS = true;
                    }
                });
            }
            if (stopResizeCVS && UI.resizeCVS) {
                UI.resizeCVS = false;
                UI.expectResizeCVS = -1;
                UI.console = -1;
                WPImager.updateLayerTab();
                draw();
            }
        }
        return $_fn_hide.apply(this, arguments);
    }
    var $_fn_show = $.fn.show;
    $.fn.show = function (speed, callback) {
        $(this).trigger('show');
        if (WPImager.boot !== 0) {
            var resizeCVS = false;
            if ($(this).length == 1) {
                resizeCVS = ($(this).attr("id") == "toolCanvas");
            } else if ($(this).length > 1) {
                $(this).each(function (index, value) {
                    if ($(this).attr("id") == "toolCanvas") {
                        resizeCVS = true;
                    }
                });
            }
            /* disable - mouse resize CVS
             if (resizeCVS) {
             UI.resizeCVS = true;
             draw();
             $("#cvs").css("cursor", 'auto');
             }*/
        }
        return $_fn_show.apply(this, arguments);
    }

})(jQuery);

jQuery(function ($) {
    UI.nonce = $("#nonce").val();

    $.fn.selectRange = function (start, end) {
        if (end === undefined) {
            end = start;
        }
        return this.each(function () {
            if ('selectionStart' in this) {
                this.selectionStart = start;
                this.selectionEnd = end;
            } else if (this.setSelectionRange) {
                this.setSelectionRange(start, end);
            } else if (this.createTextRange) {
                var range = this.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
        });
    };

});



/**
 * CanvasRenderingContext2D.renderFillText extension
 */
if (CanvasRenderingContext2D && !CanvasRenderingContext2D.renderFillText) {
    // @param  letterSpacing  {float}  CSS letter-spacing property
    CanvasRenderingContext2D.prototype.renderFillText = function (text, x, y, fx, fy, angle, letterSpacing) {
        if (!text || typeof text !== 'string' || text.length === 0) {
            return;
        }

        if (typeof letterSpacing === 'undefined') {
            letterSpacing = 0;
        }

        // letterSpacing of 0 means normal letter-spacing

        var characters = String.prototype.split.call(text, ''),
                index = 0,
                current,
                currentPosition = x,
                align = 1;

        this.translate(fx, fy);
        this.rotate(angle * Math.PI / 180);
        var textalign = this.textAlign;
        if (this.textAlign === 'end') {
            characters = characters.reverse();
            align = -1;
        } else if (this.textAlign === 'center') {
            var totalWidth = 0;
            for (var i = 0; i < characters.length; i++) {
                if (i == characters.length - 1) {
                    totalWidth += this.measureText(characters[i]).width;
                } else {
                    totalWidth += (this.measureText(characters[i]).width + letterSpacing);
                }
            }
            currentPosition = x - (totalWidth / 2);
            this.textAlign = 'left';
        }

        while (index < text.length) {
            current = characters[index++];
            this.fillText(current, currentPosition, y);
            currentPosition += (align * (this.measureText(current).width + letterSpacing));
        }
        this.textAlign = textalign;
        this.rotate(-angle * Math.PI / 180);
        this.translate(-fx, -fy);
    };
}
;



/**
 * CanvasRenderingContext2D.renderFillText extension
 */
if (CanvasRenderingContext2D && !CanvasRenderingContext2D.renderStrokeText) {
    // @param  letterSpacing  {float}  CSS letter-spacing property
    CanvasRenderingContext2D.prototype.renderStrokeText = function (text, x, y, fx, fy, angle, letterSpacing) {
        if (!text || typeof text !== 'string' || text.length === 0) {
            return;
        }

        if (typeof letterSpacing === 'undefined') {
            letterSpacing = 0;
        }

        // letterSpacing of 0 means normal letter-spacing

        var characters = String.prototype.split.call(text, ''),
                index = 0,
                current,
                currentPosition = x,
                align = 1;
        this.translate(fx, fy);
        this.rotate(angle * Math.PI / 180);
        var textalign = this.textAlign;
        if (this.textAlign === 'end') {
            characters = characters.reverse();
            align = -1;
        } else if (this.textAlign === 'center') {
            var totalWidth = 0;
            for (var i = 0; i < characters.length; i++) {
                if (i == characters.length - 1) {
                    totalWidth += this.measureText(characters[i]).width;
                } else {
                    totalWidth += (this.measureText(characters[i]).width + letterSpacing);
                }
            }
            currentPosition = x - (totalWidth / 2);
            this.textAlign = 'left';
        }

        while (index < text.length) {
            current = characters[index++];
            this.strokeText(current, currentPosition, y);
            currentPosition += (align * (this.measureText(current).width + letterSpacing));
        }
        this.textAlign = textalign;
        this.rotate(-angle * Math.PI / 180);
        this.translate(-fx, -fy);
    };
}

