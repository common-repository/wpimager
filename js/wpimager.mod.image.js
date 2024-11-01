/*!
 WPImager Image 1.0.0    
 Image Addon - Provide upload and 
 https://wpimager.com/
 2018 WPImager  
 */

jQuery(function ($) {

    window.wpimager_init_mod_image = function () {

        $("#media_selected_insert").click(function (e) {
            var attachment_id = $(this).data("attachment-id");
            var target = $(this).data("target");
            if (target == "layer") {
                WPImager.addAttachmentImageLayer(attachment_id);
            }
            if (target == "slide") {
                WPImager.prepareAttachmentSlide(attachment_id);
            }
        });

        $("#addImageMediaLayer,#cmdImportMedia").click(function (e) {
            e.preventDefault();
            var target = ($(this).attr("id") == "addImageMediaLayer") ? "layer" : "slide";
            start_media_images(target);
        });


        //  called WPImager.prepareAttachmentSlide
        WPImager.slideCreateMedia = function () {
            var w = parseInt($("#imgImportMedia").width());
            var h = parseInt($("#imgImportMedia").height());
            var title = '';
            this.Addslide(w, h, title, 'custom');
            this.addImageLayer();
            var image_url = $("#imgImportMedia").attr("src");
            var layer = this.current;
            if (image_url.match(/\.(jpg|jpeg|png|bmp|gif)$/)) {
                this.layer[layer].disposed = 0;
                this.layer[layer].src = image_url;
                this.createUploadingIndex(layer);
                WPImagerUI.loadImageNew(layer, image_url);
                this.selectLayer(layer);
                $("#lyr" + layer.toString()).show();
                draw();
            }
            WPImagerUI.flagCanvasSave();
        };


        WPImager.createSlideUploadScreen = function () {
            var w = parseInt($("#imgPasteScreen2").width());
            var h = parseInt($("#imgPasteScreen2").height());
            var title = '';

            var base64data = $("#imgPasteScreen2").attr("src");
            var regex = /^data:image\/(png|jpg|jpeg);base64,/;
            var _ext = base64data.match(regex);
            imageData = base64data.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
            var ext = _ext[1];

            $.ajax({
                type: 'POST',
                url: ajaxurl,
                data: {action: 'uploadbase64', imageData: imageData, ext: ext, canvas_id: this.canvas.id, current_layer: WPImager.current, _wpnonce: UI.nonce},
                dataType: 'json',
                cache: false,
                success: function (data) {
                    if (data.success) {
                        $("#pasteProgressDialog").find(".done-show").show();
                        $("#pasteProgressDialog").find(".done-hide").hide();
                        WPImager.Addslide(w, h, title);
                        WPImager.slides[WPImager.slide].mode = 'custom';
                        WPImager.addImageLayer();
                        var image_url = data.src;
                        var layer = WPImager.current;
                        if (image_url.match(/\.(jpg|jpeg|png|bmp|gif)$/)) {
                            WPImager.layer[layer].disposed = 0;
                            WPImager.layer[layer].src = image_url;
                            WPImager.createUploadingIndex(layer);
                            WPImagerUI.loadImageNew(layer, image_url);
                            WPImager.selectLayer(layer);
                            $("#lyr" + layer.toString()).show();
                            draw();
                            WPImagerUI.flagCanvasSave();
                            $("#pasteProgressDialog").hide();
                        }
                    } else {
                        if (typeof data.message !== "undefined") {
                            $('#pasteErrorMsg').text(msg.message);
                        } else {
                            $('#pasteErrorMsg').text("Unexpected response from server.");
                        }
                        $("#pasteProgressDialog").find(".error-show").show();
                        $("#pasteProgressDialog").find(".error-hide").hide();
                        $("#pasteProgressDialog").css("background-color", "#161616");
                    }
                    isuploading = false;
                },
                beforeSend: function () {
                    $("#pasteProgressBar").css("width", "0%");
                    $("#pasteProgressDialog").find(".start-show").show();
                    $("#pasteProgressDialog").find(".start-hide").hide();
                    $("#pasteProgressDialog").modal({
                        backdrop: 'static'
                    });
                    $('#pasteProgressBar').addClass("progress-bar-success");
                    isuploading = true;
                },
                xhr: function () {
                    UI.xhr["paste"] = new window.XMLHttpRequest();
                    //Upload progress
                    UI.xhr["paste"].upload.addEventListener("progress", function (evt) {
                        if (evt.lengthComputable) {
                            var percentComplete = evt.loaded / evt.total * 100;
                            //Do something with upload progress
                            $("#pasteProgressBar").css("width", parseInt(percentComplete) + "%");
                        }
                    }, false);
                    return UI.xhr["paste"];
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
                    $('#pasteErrorMsg').html(errormsg);
                    $("#pasteProgressDialog").find(".error-show").show();
                    $("#pasteProgressDialog").find(".error-hide").hide();
                    $("#pasteProgressDialog").css("background-color", "#161616");
                    isuploading = false;
                }
            });
        };


        WPImager.addAttachmentImageLayer = function (attachment_id) {
            if (parseInt(attachment_id) > 0) {
                for (var id in UI.media_attachment_model) {
                    if (id == attachment_id) {
                        var attachment = UI.media_attachment_model[id];
                        WPImager.addImageLayer();
                        var image_url = wpimager_baseurl + '/' + attachment.file;
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
                        tb_remove();

                        $("#viewLayers").click();
                        $("#mainimageconsole").data('resize-layer', layer.toString());
                        // create selection buttons for different image sizes 
                        $("#spanimagesize").empty();
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

                            for (var size in attachment.sizes) {
                                var w = attachment.sizes[size].width;
                                var h = attachment.sizes[size].height;
                                var basedir = image_url.substring(0, image_url.lastIndexOf('/')) + "/";
                                var url = basedir + attachment.sizes[size].file;
                                var btnStyle = (attachment.width == w && attachment.height == h) ? 'btn-primary' : 'btn-slate';
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
                                                $("#scaleImageWidth2Slide").toggle(image_width > WPImager.canvas.width);
                                                var layer = WPImager.current;
                                                if (image_url.match(/\.(jpg|jpeg|png|bmp|gif)$/)) {
                                                    WPImager.layer[layer].src = image_url;
                                                    WPImager.layer[layer].imgwidth = image_width;
                                                    WPImager.layer[layer].imgwidth_ori = image_width;
                                                    WPImager.layer[layer].imgheight = image_height;
                                                    WPImager.layer[layer].imgheight_ori = image_height;
                                                    WPImager.layer[layer].imgcrop_x = 0;
                                                    WPImager.layer[layer].imgcrop_y = 0;
                                                    WPImager.layer[layer].imgcrop_w = 0;
                                                    WPImager.layer[layer].imgcrop_h = 0;
                                                    UI.isCropping = false;
                                                    WPImagerUI.loadImageShow(layer, image_url);
                                                    WPImagerUI.resize_image(layer);
                                                    $("#img_oalign_center").click();
                                                    $("#img_ovalign_middle").click();
                                                    WPImager.layer[layer].ui_refresh();
                                                }
                                                $(".btn-insert-image").removeClass("btn-primary").addClass("btn-slate");
                                                $(this).addClass("btn-primary").removeClass("btn-slate");
                                                //                          $("#viewLayers").click();
                                            }
                                        });
                                $("#spanimagesize").append($button).append(' ');
                            }

                            $button = $('<button/>',
                                    {
                                        'id': 'resizeSlide2Image',
                                        'text': 'Resize Slide to Image',
                                        'class': 'btn btn-sm btn-slate',
                                        click: function () {
                                            var layer = WPImager.current;
                                            $("#canvasWidth").val(WPImager.layer[layer].imgwidth);
                                            $("#canvasHeight").val(WPImager.layer[layer].imgheight);
                                            $("#applyCustomCanvasSize").click();
                                            $("#img_oalign_left").click();
                                            $("#img_ovalign_top").click();
                                            WPImagerUI.flagCanvasSave();
                                        }
                                    });
                            $("#spanimagesize").append('&bull; ').append($button).append(' ');

                            $button = $('<button/>',
                                    {
                                        'id': 'scaleImageWidth2Slide',
                                        'text': 'Scale Image Width to Slide',
                                        'class': 'btn btn-sm btn-slate',
                                        click: function () {
                                            var layer = WPImager.current;
                                            if (WPImager.layer[layer].imgwidth > WPImager.canvas.width) {
                                                WPImager.spinWidth(WPImager.canvas.width, WPImager.current, true, true);
                                                $("#img_oalign_center").click();
                                                $("#img_ovalign_middle").click();
                                                WPImager.layer[layer].ui_refresh();
                                                draw();
                                                WPImagerUI.flagCanvasSave();
                                            }
                                        }
                                    });
                            $("#spanimagesize").append($button).append(' ');
                            $("#scaleImageWidth2Slide").toggle(attachment.width > WPImager.canvas.width);

                        }



                    }
                }
            }
        }

        WPImager.prepareAttachmentSlide = function (attachment_id) {
            if (parseInt(attachment_id) > 0) {
                for (var id in UI.media_attachment_model) {
                    if (id == attachment_id) {
                        var attachment = UI.media_attachment_model[id];

                        var image_url = wpimager_baseurl + '/' + attachment.file;


                        $("#imgImportMedia").attr("src", image_url);
                        $("#importmedia-sizes-buttons").empty();
                        $('.create-panel').hide();
                        $('#create-panel-importmedia').show();
                        $(".button-main").removeClass("btn-success");
                        $("#cmdImportMedia").addClass("btn-success");

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


                            for (var size in attachment.sizes) {
                                var w = attachment.sizes[size].width;
                                var h = attachment.sizes[size].height;
                                var basedir = image_url.substring(0, image_url.lastIndexOf('/')) + "/";
                                var url = basedir + attachment.sizes[size].file;
                                var btnStyle = (attachment.width == w && attachment.height == h) ? 'btn-danger' : 'btn-slate';
                                $button = $('<button/>',
                                        {
                                            text: w.toString() + ' x ' + h.toString(),
                                            'class': 'btn btn-sm btn-insertmedia-image ' + btnStyle,
                                            'data-width': w.toString(),
                                            'data-height': h.toString(),
                                            'data-url': url,
                                            click: function () {
                                                var image_url = $(this).data("url");
                                                if (image_url.match(/\.(jpg|jpeg|png|bmp|gif)$/)) {
                                                    $("#imgImportMedia").attr("src", image_url);
                                                }
                                                $(".btn-insertmedia-image").removeClass("btn-danger").addClass("btn-slate");
                                                $(this).addClass("btn-danger").removeClass("btn-slate");
                                            }
                                        });
                                $("#importmedia-sizes-buttons").append($button).append(' ');
                            }
                        }

                    }
                }
                tb_remove();
            }
        }
        // trigger pasteCatcher focus
        document.addEventListener('keydown', function (event) {
            // v keycode = 86
            if (event.keyCode == 86) {
                if (UI.ctrl_pressed == true /* && !window.Clipboard */) {
                    var target = event.target || event.srcElement;
                    if (target.tagName.toLowerCase() !== "textarea" &&
                            target.tagName.toLowerCase() !== "input") {
                        var pasteCatcher = document.getElementById("paste_clipboard");
                        pasteCatcher.focus();
                    }
                }
            }

        }, false);

        $('#paste_clipboard').pastableContenteditable();

        $('#paste_clipboard').on('pasteImage', function (ev, data) {
            var base64data = data.dataURL;
            if (UI.app == UI.APP.ADDSLIDE) {
                jQuery("#imgPasteScreen").attr("src", base64data);
                jQuery("#imgPasteScreen2").attr("src", base64data);
                jQuery(".create-panel").hide();
                jQuery("#paste_screen_panel").show();
                setTimeout(function () {
                    var dimension = jQuery("#imgPasteScreen2").width().toString() + ' x ' + jQuery("#imgPasteScreen2").height().toString() + ' px';
                    jQuery("#label_pastescreen-size").text(dimension);
                }, 1000);
                jQuery(".button-main").removeClass("btn-success");
            } else {
                if (WPImager.slides[WPImager.slide].mode == "kit") {
                    // no image in component slide
                    return;
                } else {
                    WPImager.addImageLayer();
                    WPImager.createUploadingIndex(WPImager.current);
                    var regex = /^data:image\/(png|jpg|jpeg);base64,/;
                    var ext = base64data.match(regex);
                    base64data = base64data.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
                    WPImager.uploadBase64Image(base64data, ext[1]);
                }
            }

        }).on('pasteImageError', function (ev, data) {

        }).on('pasteText', function (ev, data) {

        });

        $('#xhr-close-paste').click(function () {
            $('#pasteProgressDialog').hide();
            if (typeof UI.xhr["paste"] !== "undefined")
                UI.xhr["paste"].abort();
        });

    }


    $("#cvs").on("init.addon.console", function (event, layer) {

        var html = '<div id="cardcmd-media" class="col-md-3 addslide_show addtemplate_blank_show">\
                    <div class="wpimager-card">\
                        <div class="thumbnail-wrap">\
                            <div class="canvas-type"><span class="dashicons dashicons-admin-media" style="font-size:14px;height: auto;width:auto"></span> Media</div>\
                            <div class="canvas-subtitle">Select an image from WordPress Media Library.</div>\
                            <div class="canvas-action">\
                                <button id="cmdImportMedia" class="btn btn-sm btn-default button-main">\
                                    Media Library\
                                </button>\
                            </div>\
                        </div>\
                    </div>\
                </div>';
        $("#cardcmd-media").replaceWith(html);

        html = '<div id="create-panel-importmedia" class="create-content text-center create-panel addtemplate_blank_hide addtemplate_convert_hide" style="display:none">\
                        <div id="" class="text-center">\
                            <h3 id="" class="text-center">Media Library Image</h3>\
                            <div id="importmedia-sizes-buttons"></div>\
                            <div class="addslide_show" style="background-color:transparent;padding:16px 0;">\
                                <button type="button" class="button button-primary" onclick="WPImager.slideCreateMedia();">Create Canvas Slide</button>\
                            </div>\
                            <img id="imgImportMedia" src="" style="max-width: 100%">\
                        </div>\
                    </div>';

        $("#wpimager_addslide_custom").before(html);

        wpimager_init_mod_image();

    });


});


var wpimager_mod_image = "1.0.0";