/*!
 WPImager 1.0.0    
 https://wpimager.com/
 2018 WPImager  
 */


var xhr_upload;
var isuploading = false;

var setCanvasSize;
var postCreateCustom;
var postCreateMedia;
var postCreateScreen;
var sizeCanvas;
var UI_media_attachment_page = 0;
var UI_media_attachment_model = {};
var cvs = {
    start: 0,
    title: "",
    mode: "custom",
    submode: "",
    BLANK: 0,
    MEDIA: 1,
    SCREEN: 2,
    imgx: 0,
    imgy: 0,
    imgwidth: 0,
    imgwidth_ori: 0,
    imgheight: 0,
    imgheight_ori: 0,
    imgsrc: "",
    cvstitle: "",
    cvswidth: 800,
    cvsheight: 500,
    touchedX: 0,
    touchedY: 0,
    draggingMouse: false,
    keepratio: true,
    hasInsertedOnce: false,
    scaleFactor: 1
};


jQuery(function ($) {

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
                action: 'uploadmediaimage', canvas_id: canvas_id, _wpnonce: UI_nonce, _source: 'wpimager_create'
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
                UI_media_attachment_model[attachment.attach_id] = response.attach_data;
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
            isuploading = false;
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
            // preventing the unwanted behaviours
            e.preventDefault();
            e.stopPropagation();
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
        if (parseInt(attachment_id) > 0) {
            for (var id in UI_media_attachment_model) {
                if (id == attachment_id) {
                    var attachment = UI_media_attachment_model[id];
                    var image_url = wpimager_baseurl + '/' + attachment.file;

                    cvs.start = cvs.MEDIA;
                    $("#importmedia-sizes-buttons").empty();

                    cvs.imgsrc = image_url;
                    cvs.cvswidth = attachment.width;
                    cvs.cvsheight = attachment.height;
                    var dimension = cvs.cvswidth.toString() + ' x ' + cvs.cvsheight.toString() + ' px';
                    $("#imgImportMedia").attr("src", cvs.imgsrc);
                    $("#label_importmedia-size").text(dimension);
                    $('.create-panel').hide();
                    if (!cvs.hasInsertedOnce) {
                        $("#section-image").find(".selbanner").addClass("active");
                        $("#btn-media-select-image-size").click();
                        preview_dimenso(cvs.cvswidth, cvs.cvsheight, 'Image Size');
                        $("#create_options_previewsize").show();
                        $("#section-image").find(".selbanner").addClass("active");
                        setcustomdimension(cvs.cvswidth, cvs.cvsheight);
                        $("#create_options_previewsize").show();
                        cvs.hasInsertedOnce = true;
                    }

                    $('#create-panel-importmedia,#canvas_sizes_panel,#btn-media-select-image-size').show();
                    createImageSizesButtons(attachment, image_url);
                    $("#create-panel-menu li a").removeClass("active");
                    $("#cmdWPMedia").addClass("active");
                    tb_remove();
                    draw();


                }
            }
        }


    });

    $("#media_results").on("click", ".item", function (e) {
        var attachment_id = $(this).data("attachment-id");
        $("#media_results .item").removeClass("active");
        $(this).addClass("active");
        $("#media_selected_insert").data("attachment-id", attachment_id).removeClass("disabled");
        for (var id in UI_media_attachment_model) {
            if (id == attachment_id) {
                var attachment = UI_media_attachment_model[id];
                var image_url = wpimager_baseurl + '/' + attachment.file;
                var img = '<div style="border:1px solid #ccc;display:inline-block;"><img src="' + image_url + '" style="max-width:140px;border:3px solid #fff"/></div>';
                var filename = '<div style="font-weight:bold;color:#333;">' + attachment.file.substring(attachment.file.lastIndexOf("/") + 1) + '</div>';
                var size = '<div>' + attachment.width.toString() + 'x' + attachment.width.toString() + '</div>';
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
                    data: {action: 'deletemediaimage', attachment_id: attachment_id, canvas_id: canvas_id, _wpnonce: UI_nonce
                    },
                    dataType: 'json',
                    cache: false,
                    success: function (data) {
                        if (data.success) {
                            for (var id in UI_media_attachment_model) {
                                if (id == attachment_id) {
                                    delete UI_media_attachment_model[id];
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
            if (typeof UI_media_attachment_model[k] === "undefined") {
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
                UI_media_attachment_page++;
                load_media_images();
            } else {
                $("#TB_container").scroll(function () {
                    if ($("#TB_container").scrollTop() + $("#TB_container").height() > $("#media_results").height() - 100) {
                        $("#TB_container").off('scroll');
                        UI_media_attachment_page++;
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
            data: {action: 'loadmediaimages', paged: UI_media_attachment_page, canvas_id: canvas_id, _wpnonce: UI_nonce
            },
            dataType: 'json',
            cache: false,
            success: function (data) {
                if (data.success) {
                    render_mediaimages(data.images, data.paged);
                    $.extend(UI_media_attachment_model, data.images);
                    return;
                }
            }
        }); // end of .ajax

    }

    $("#cmdWPMedia").click(function (e) {
        e.preventDefault();
        tb_show('Media Image', '#TB_inline?inlineId=wpimager-media&amp;modal=false', null);

        $("#TB_window").on('dragenter', function (e) {
            $("#tabUploadFile").click();
        });

        window.dispatchEvent(new Event('resize'));

        if (UI_media_attachment_page == 0) {
            UI_media_attachment_page = 1;
            load_media_images();
        } else {
            if ($("#TB_container").height() > $("#media_results").height()) {
                UI_media_attachment_page++;
                load_media_images();
            } else {
                $("#TB_container").scroll(function () {
                    if ($("#TB_container").scrollTop() + $("#TB_container").height() > $("#media_results").height() - 100) {
                        $("#TB_container").off('scroll');
                        UI_media_attachment_page++;
                        load_media_images();
                    }
                });
            }
        }


    });



    if ($("#cmdImportCanvas").length > 0) {
        var uploadZipBtn = document.getElementById('upload_zip');
        zipUploader = new ss.SimpleUpload({
            button: uploadZipBtn,
            url: ajaxurl,
            name: 'uploadzip',
            hoverClass: 'hover',
            focusClass: 'focus',
            responseType: 'json',
            allowedExtensions: ['zip'],
            multiple: false,
            maxUploads: 1,
            startXHR: function () {
                $("#printProgressBar").css("width", "0%");
                $("#progressDialog").find(".start-show").show();
                $("#progressDialog").find(".start-hide").hide();
                $("#progressDialog").modal({
                    backdrop: 'static'
                });
                $('#printProgressBar').addClass("progress-bar-success");
                isuploading = true;
            },
            onSubmit: function () {
                var self = this;
                self.setData({
                    action: 'importzip', _wpnonce: nonce
                });
                //                    msgBox.innerHTML = ''; // empty the message box
                //                    WPImager.createUploadingIndex(layer);
                //                    $("#lyr" + layer.toString()).show();
            },
            onProgress: function (pct) {
                //Do something with upload progress
                $("#printProgressBar").css("width", parseInt(pct) + "%");
            },
            onComplete: function (filename, response, uploadBtn, size, layer) {
                // hide progress bar when upload is completed
                if (!response) {
                    $("#progressDialog").modal('hide');
                    return;
                }

                if (response.success === true) {
                    window.location = admin_url + "?page=wpimager_editor&id=" + response.id.toString() + '&_wpnonce=' + response.nonce;
                    $("#progressDialog").modal('hide');

                } else {
                    if (typeof response.message !== "undefined") {
                        $('#printErrorMsg').text(response.message);
                    } else {
                        $('#printErrorMsg').text("Unexpected response from server.");
                    }
                    $("#progressDialog").find(".error-show").show();
                    $("#progressDialog").find(".error-hide").hide();
                }
            },
            onAbort: function (filename, uploadBtn, size, layer) {
                $("#progressDialog").modal('hide');
            },
            onError: function (filename, type, status, statusText, response, uploadBtn, size, layer) {
                if (typeof response.message !== "undefined") {
                    $('#printErrorMsg').text(response.message);
                } else {
                    $('#printErrorMsg').text("Unexpected response from server.");
                }
                $("#progressDialog").find(".error-show").show();
                $("#progressDialog").find(".error-hide").hide();
            }
        });
    }

    $('#xhr-abort-print, #xhr-close-print').click(function () {
        $("#progressDialog").modal('hide');
        if (typeof xhr_upload !== "undefined")
            xhr_upload.abort();
        isuploading = false;
    });

    $("#cmdImportCanvas").click(function () {
        $('.create-panel').hide();
        $("#create-panel-import").show();
        $("#create-panel-menu li a").removeClass("active");
        $(this).addClass("active");
//        setTimeout(function () {
//            $("input[name='uploadzip']").click();
//        }, 1000);
        return false;
    });

    $("#naImportCanvas").click(function () {
        $('.create-panel').hide();
        $("#create-panel-import").show();
        return false;
    });

    var add_image_media;

    // Upload or Select Photo
    $("#_cmdWPMedia").click(function (e) {
        e.preventDefault();

        // If the media frame already exists, reopen it.
        if (add_image_media) {
            if (wp.media.frame.content.get() !== null) {
                wp.media.frame.content.get().collection.props.set({ignore: (+new Date())});
                wp.media.frame.content.get().options.selection.reset();
            } else {
                wp.media.frame.library.props.set({ignore: (+new Date())});
            }
            add_image_media.open();
            return;
        }
        // Create the media frame.
        add_image_media = wp.media.frames.file_frame = wp.media({
            multiple: false,
            frame: 'post',
            library: {type: 'image'}
        });

        // When an image is selected, run a callback.
        add_image_media.on('insert', function () {
            cvs.start = cvs.MEDIA;

            $("#importmedia-sizes-buttons").empty();
            var attachment = add_image_media.state().get('selection').first().toJSON();

            cvs.imgsrc = attachment.url;
            cvs.cvswidth = attachment.width;
            cvs.cvsheight = attachment.height;
            var dimension = cvs.cvswidth.toString() + ' x ' + cvs.cvsheight.toString() + ' px';
            $("#imgImportMedia").attr("src", cvs.imgsrc);
            $("#label_importmedia-size").text(dimension);
            $('.create-panel').hide();
            if (!cvs.hasInsertedOnce) {
                $("#section-image").find(".selbanner").addClass("active");
                $("#btn-media-select-image-size").click();
                preview_dimenso(cvs.cvswidth, cvs.cvsheight, 'Image Size');
                $("#create_options_previewsize").show();
                $("#section-image").find(".selbanner").addClass("active");
                setcustomdimension(cvs.cvswidth, cvs.cvsheight);
                $("#create_options_previewsize").show();
                cvs.hasInsertedOnce = true;
            }

            $('#create-panel-importmedia,#canvas_sizes_panel,#btn-media-select-image-size').show();
            createImageSizesButtons(attachment);
            $("#create-panel-menu li a").removeClass("active");
            $("#cmdWPMedia").addClass("active");

            draw();

        });


        add_image_media.open();

        // Remove the Media Library tab (media_upload_tabs filter is broken in 3.6)
        jQuery(".media-menu a:contains('Media Library')").remove();
    });

    function createImageSizesButtons(attachment, image_url) {
        $("#dimenso").attr("class", 'grabbable');
        $("#importmedia-sizes-buttons").empty();
        var listOfButtons = [];
        if (typeof attachment.sizes !== "undefined") {
            for (var size in attachment.sizes) {
                var w = attachment.sizes[size].width;
                var h = attachment.sizes[size].height;
                var basedir = image_url.substring(0, image_url.lastIndexOf('/')) + "/";
                var url = basedir + attachment.sizes[size].file;
                var btn_text = w.toString() + ' x ' + h.toString();
                if (listOfButtons.indexOf(btn_text) == -1) {
                    listOfButtons.push(btn_text);
//                    if (typeof attachment.sizes[size].url !== "undefined") {
//                        url = attachment.sizes[size].url;
//                    } else if (typeof attachment.sizes[size].file !== "undefined") {
//                        var filename = attachment.src;
//                        var splitFilename = filename.split("/");
//                        url = splitFilename.slice(0, splitFilename.length - 1).join("/") + '/' + attachment.sizes[size].file;
//                    }

                    var btnStyle = (attachment.width == w && attachment.height == h) ? 'btn-danger' : 'btn-default';
                    $button = $('<button/>',
                            {
                                text: btn_text,
                                class: 'btn btn-xs btn-insertmedia-image ' + btnStyle,
                                'data-width': w.toString(),
                                'data-height': h.toString(),
                                'data-url': url,
                                click: function () {
                                    var image_url = $(this).data("url");
                                    var image_width = $(this).data("width");
                                    var image_height = $(this).data("height");
                                    if (image_url.match(/\.(jpg|jpeg|png|bmp|gif)$/)) {
                                        $("#imgImportMedia").attr("src", image_url);
                                        cvs.imgsrc = image_url;
                                        cvs.imgwidth = image_width;
                                        cvs.imgwidth_ori = image_width;
                                        cvs.imgheight = image_height;
                                        cvs.imgheight_ori = image_height;
                                        $("#section-image-thesize").text(cvs.imgwidth_ori.toString() + " x " + cvs.imgheight_ori.toString());
                                        if ($("#section-image").find(".selbanner").hasClass("active")) {
                                            var w = cvs.imgwidth_ori;
                                            var h = cvs.imgheight_ori;
                                            preview_dimenso(w, h, 'Image Size');
                                            $("#create_options_previewsize").show();
                                            $("#section-image").find(".selbanner").addClass("active");

                                            setcustomdimension(w, h);

                                        }
                                    }
                                    $(".btn-insertmedia-image").removeClass("btn-danger").addClass("btn-default");
                                    $(this).addClass("btn-danger").removeClass("btn-default");
                                }
                            });
                    $("#importmedia-sizes-buttons").append($button).append(' ');
                }
            }
        }
        $("#importmedia-sizes-buttons").prepend('Image Size: ');
        if ($("#importmedia-sizes-buttons").find("button").length > 1) {
            var width = parseInt($("#importmedia-sizes-buttons button:last-child").data("width"));
            if (width > $("#create_options_previewsize").width()) {
                $("#importmedia-sizes-buttons button:nth-last-child(2)").click();
            } else {
                $("#importmedia-sizes-buttons button:last-child").click();
            }
        }
    }

    $("#cmdPrintScreen").click(function () {
        cvs.start = cvs.SCREEN;
        $('.create-panel').hide();
        $("#print_screen_panel").show();
        $("#create-panel-menu li a").removeClass("active");
        $(this).addClass("active");
        return false;
    });

    $("#cmdBlankCanvas").click(function () {
        cvs.start = cvs.BLANK;
        $('.create-panel,#btn-media-select-image-size,#section-image').hide();
        $('#canvas_sizes_panel').show();
        $("#create-panel-menu li a").removeClass("active");
        $(this).addClass("active");

        if (cvs.submode == "image") {
            $("#btn-media-custom").click();
        }
        draw();
        return false;
    });

    $(".btn-media-select").on("click", function () {
        //	$("#create_options_previewsize").hide();
        cvs.submode = $(this).data("media");
        if (cvs.submode == "custom") {
            cvs.mode = "custom";
            $(".section-all").hide();
            $("#section-custom").html($("#create-panel-custom"));
            $("#section-custom,#create-panel-custom").show();
            $("#create_options_presetsizes_col .section").css("width", "100%").css("float", "none");
            setcustomdimension(cvs.cvswidth, cvs.cvsheight);
            cvs.cvswidth = $("#custom_canvas_width").spinner("value");
            cvs.cvsheight = $("#custom_canvas_height").spinner("value");
            var canvas = document.getElementById("dimenso");
            canvas.width = cvs.cvswidth;
            canvas.height = cvs.cvsheight;
            $("#dimenso").css("width", cvs.cvswidth.toString() + "px").css("height", cvs.cvsheight.toString() + "px");

            $("#create_options_previewsize").show();
            $(".btn-media-select").removeClass("btn-primary");
            $(this).addClass("btn-primary");
            draw();

            return false;
        } else if (cvs.submode == "image") {
            cvs.mode = "image";
            $(".section-all").hide();
            $("#section-image").show();
            $("#create_options_presetsizes_col .section").css("width", "100%").css("float", "none");
            $("#section-image-thesize").text(cvs.imgwidth_ori.toString() + " x " + cvs.imgheight_ori.toString());
            $("#create_options_previewsize").show();
            $(".btn-media-select").removeClass("btn-primary");
            $(this).addClass("btn-primary");
            draw();

            return false;
        }

        $(".section-all").hide();
        $(".content-media-sizes,#section-" + cvs.submode.toString()).show();
        $("#create_options_presetsizes_col .section").css("width", "100%").css("float", "none");
        $("#section-custom-size").css("clear", "both");

        $(".btn-media-select").removeClass("btn-primary");
        $(this).addClass("btn-primary");
        return false;
    });


    setCanvasSize = function (w, h) {
        $("#custom_canvas_width").val(w);
        $("#custom_canvas_height").val(h);
        return false;
    }

    postCreateCanvas = function ()
    {
        if (isuploading)
            return;
        if($.trim($('#canvas_title').val()).length) {
            cvs.title = $.trim($('#canvas_title').val());
        }
        jQuery.ajax({
            'dataType': 'json',
            'success': function (data) {
                if (data.success) {
                    window.location = admin_url + "?page=wpimager_editor&id=" + data.id.toString() + '&_wpnonce=' + data.nonce;
                } else {
                    if (typeof data.message !== "undefined") {
                        $('#printErrorMsg').text(data.message);
                    } else {
                        $('#printErrorMsg').text("Unexpected response from server.");
                    }
                    $("#progressDialog").modal('show');
                    $("#progressDialog").find(".error-show").show();
                    $("#progressDialog").find(".error-hide").hide();
                }
            },
            'type': 'POST',
            'url': ajaxurl,
            'cache': false,
            'data': {action: 'newcanvas', canvas_id: canvas_id, cvs: JSON.stringify(cvs), _wpnonce: nonce},
        });
    }


    postCreateScreen = function () {
        var base64data = $("#imgPasteScreen2").attr("src");
        var regex = /^data:image\/(png|jpg|jpeg);base64,/;
        var ext = base64data.match(regex);
        base64data = base64data.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
        uploadScreenImage(base64data, ext[1]);
    }
    /**
     * Select Preset Size
     */
    sizeCanvas = function (_this, w, h, name) {
        if (w == 0 || h == 0) {
            w = cvs.imgwidth_ori;
            h = cvs.imgheight_ori;
        }
        cvs.title = name;
        $(".selbanner").removeClass("active");
        preview_dimenso(w, h, name);
        $("#create_options_previewsize").show();
        $(_this).find(".selbanner").addClass("active");

        setcustomdimension(w, h);
        return false;
    }
    setcustomdimension = function (w, h) {
        if (!$("#custom_canvas_width").hasClass("ui-spinner-input")) {
            $("#custom_canvas_width,#custom_canvas_height").spinner({
                min: 10,
                max: 8192,
                step: 1,
                spin: function (event, ui) {
                    if ($("#custom_canvas_width").spinner("isValid")) {
                        if ($("#custom_canvas_height").spinner("isValid")) {
                            preview_dimenso($("#custom_canvas_width").spinner("value"), $("#custom_canvas_height").spinner("value"), 'Custom Size');
                        }
                    }
                },
                stop: function (event, ui) {
                    if ($("#custom_canvas_width").spinner("isValid")) {
                        if ($("#custom_canvas_height").spinner("isValid")) {
                            preview_dimenso($("#custom_canvas_width").spinner("value"), $("#custom_canvas_height").spinner("value"), 'Custom Size');
                        }
                    }
                }
            }).on('blur', function () {
                if (!$(this).spinner("isValid")) {
                    $(this).spinner("value", 100);
                }
                preview_dimenso($("#custom_canvas_width").spinner("value"), $("#custom_canvas_height").spinner("value"), 'Custom Size');
            });

            $("#custom_canvas_width").spinner("value", sizes_largest_width);
            $("#custom_canvas_height").spinner("value", sizes_largest_height);

            if ($("#custom_canvas_width_init").length > 0 && $("#custom_canvas_height_init").length > 0) {
                $("#custom_canvas_width").spinner("value", $("#custom_canvas_width_init").val());
                $("#custom_canvas_height").spinner("value", $("#custom_canvas_height_init").val());
            }

        }
        // set custom width, height spinner
        $("#custom_canvas_width").spinner("value", w);
        $("#custom_canvas_height").spinner("value", h);
    }
    function preview_dimenso(w, h, name) {
        $("#dimenso").css("width", w.toString() + "px").css("height", h.toString() + "px");
        //					$("#dimenso").css("line-height", h.toString() + "px");
        $("#dimenso").text(w.toString() + " x " + h.toString() + "");
        $("#dimenso,#label_previewsize").text(w.toString() + " x " + h.toString() + "");
        $("#dimension_name").html(name);
        var canvas = document.getElementById("dimenso");
        cvs.imgx = 0;
        cvs.imgy = 0;
        cvs.cvswidth = w;
        cvs.cvsheight = h;
        canvas.width = w;
        canvas.height = h;
        draw();

        return false;
    }

    function draw() {
        var canvas = document.getElementById("dimenso");
        var ctx = canvas.getContext("2d");
        var imgsrc = $("#imgImportMedia").attr("src");

        var pattern = document.createElement('canvas');
        pattern.width = 20;
        pattern.height = 20;
        var pctx = pattern.getContext('2d');
        pctx.fillStyle = "#ffffff";
        pctx.fillRect(0, 0, 20, 20);
        pctx.fillStyle = "#cccccc";
        pctx.fillRect(0, 0, 10, 10);
        pctx.fillRect(10, 10, 10, 10);
        ctx.fillStyle = ctx.createPattern(pattern, "repeat");
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        $("#wpimager-editor").hide();
        if (cvs.start == cvs.BLANK) {
            $("#download_bar").hide();
            // BLANK
        } else if (imgsrc.length > 0) {
            resize_image();
            ctx.drawImage(imgcanvas, 0, 0, imgcanvas.width, imgcanvas.height, cvs.imgx, cvs.imgy, cvs.imgwidth, cvs.imgheight);
            $("#wpimager-editor").show();
            $("#download_bar").show();
        }
    }

    var imgImportMedia = document.getElementById('imgImportMedia');
    imgImportMedia.onload = function () {
        cvs.imgwidth_ori = $("#imgImportMedia").width();
        cvs.imgheight_ori = $("#imgImportMedia").height();
        cvs.imgwidth = cvs.imgwidth_ori;
        cvs.imgheight = cvs.imgheight_ori;
        $("#section-image-thesize").text(cvs.imgwidth_ori.toString() + " x " + cvs.imgheight_ori.toString());
        updateImgSpinners();
        draw();
    };

    function uploadScreenImage(imageData, ext) {

        $.ajax({
            type: 'POST',
            url: ajaxurl,
            data: {action: 'createcanvas_printscreen', canvas_id: canvas_id, imageData: imageData, ext: ext, mode: 'custom', _wpnonce: nonce},
            dataType: 'json',
            cache: false,
            success: function (data) {
                if (data.success) {
                    $("#progressDialog").find(".done-show").show();
                    $("#progressDialog").find(".done-hide").hide();

                    $("#importmedia-sizes-buttons").empty();
                    var attachment = data.attachment;
                    var image_url = wpimager_baseurl + '/' + attachment.file;
                    cvs.imgsrc = image_url;
                    cvs.cvswidth = attachment.width;
                    cvs.cvsheight = attachment.height;
                    var dimension = cvs.cvswidth.toString() + ' x ' + cvs.cvsheight.toString() + ' px';
                    $("#imgImportMedia").attr("src", cvs.imgsrc);
                    $("#label_importmedia-size").text(dimension);
                    $('.create-panel').hide();
                    if (!cvs.hasInsertedOnce) {
                        $("#section-image").find(".selbanner").addClass("active");
                        $("#btn-media-select-image-size").click();
                        preview_dimenso(cvs.cvswidth, cvs.cvsheight, 'Image Size');
                        $("#create_options_previewsize").show();
                        $("#section-image").find(".selbanner").addClass("active");
                        setcustomdimension(cvs.cvswidth, cvs.cvsheight);
                        $("#create_options_previewsize").show();
                        cvs.hasInsertedOnce = true;
                    }
                    $('#create-panel-importmedia,#canvas_sizes_panel,#btn-media-select-image-size').show();
                    createImageSizesButtons(attachment, image_url);
                    cvs.start = cvs.MEDIA;
                    draw();
                    UI_media_attachment_model[attachment.attach_id] = attachment;
                    var imgsrc = wpimager_baseurl + '/' + attachment.file;
                    var basedir = imgsrc.substring(0, imgsrc.lastIndexOf('/')) + "/";
                    if (typeof attachment.sizes !== "undefined" && typeof attachment.sizes.thumbnail !== "undefined") {
                        imgsrc = basedir + attachment.sizes.thumbnail.file;
                    }
                    var item = '<div class="item upload" data-attachment-id="' + attachment.attach_id + '" data-url="' + imgsrc + '" data-w="' + attachment.width + '" data-h="' + attachment.height + '"><img src="' + imgsrc + '"></div>';
                    $('#media_results').prepend(item);

                } else {
                    if (typeof data.message !== "undefined") {
                        $('#printErrorMsg').text(data.message);
                    } else {
                        $('#printErrorMsg').text("Unexpected response from server.");
                    }
                    $("#progressDialog").find(".error-show").show();
                    $("#progressDialog").find(".error-hide").hide();
                }
                isuploading = false;
            },
            beforeSend: function () {
                $("#printProgressBar").css("width", "0%");
                $("#progressDialog").find(".start-show").show();
                $("#progressDialog").find(".start-hide").hide();
                $("#progressDialog").modal({
                    backdrop: 'static'
                });
                $('#printProgressBar').addClass("progress-bar-success");
                isuploading = true;
            },
            xhr: function () {
                xhr_upload = new window.XMLHttpRequest();
                //Upload progress
                xhr_upload.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = evt.loaded / evt.total * 100;
                        //Do something with upload progress
                        $("#printProgressBar").css("width", parseInt(percentComplete) + "%");
                    }
                }, false);
                return xhr_upload;
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
                $("#progressDialog").find(".error-show").show();
                $("#progressDialog").find(".error-hide").hide();
                isuploading = false;
            }
        });
    }


    $('#paste_clipboard').pastableContenteditable();
    // initialize clipboard - pasting image from clipboard
    //    new CLIPBOARD_CLASS();
    $('#paste_clipboard').on('pasteImage', function (ev, data) {
        if (cvs.start == cvs.SCREEN) {
            var base64data = data.dataURL;
            $("#imgPasteScreen").attr("src", base64data);
            $("#imgPasteScreen2").attr("src", base64data);
            $(".create-panel").hide();
            $("#paste_screen_panel").show();
            setTimeout(function () {
                var dimension = $("#imgPasteScreen2").width().toString() + ' x ' + $("#imgPasteScreen2").height().toString() + ' px';
                $("#label_pastescreen-size").text(dimension);
            }, 1000);
        }
    }).on('pasteImageError', function (ev, data) {
        alert('Oops: ' + data.message);
    }).on('pasteText', function (ev, data) {

    });

    $("#dimenso").on("mousedown", function (e) {
        if (cvs.isPrinting)
            return;
        handleMouseDown(e);
    });
    $("#dimenso").on("mouseup", function (e) {
        if (cvs.isPrinting)
            return;
        handleMouseUp(e);
    });
    $("#dimenso").on("mouseout", function (e) {
        if (cvs.isPrinting)
            return;
        handleMouseUp(e);
    });
    $("#dimenso").on("mousemove", function (e) {
        if (cvs.isPrinting)
            return;
        handleMouseMove(e);
    });

    function handleMouseDown(e) {

        if (e.pageX || e.pageY) {
            startX = parseInt(e.pageX / cvs.scaleFactor);
            startY = parseInt(e.pageY / cvs.scaleFactor);
        } else {
            startX = parseInt((e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft) / cvs.scaleFactor);
            startY = parseInt((e.clientY + document.body.scrollTop + document.documentElement.scrollTop) / cvs.scaleFactor);
        }
        cvs.touchedX = startX;
        cvs.touchedY = startY;
        cvs.draggingMouse = true;

    }

    var startX, startY; // pointer position 

    function handleMouseMove(e) {
        var mouseX, mouseY;
        if (e.pageX || e.pageY) {
            mouseX = parseInt(e.pageX / cvs.scaleFactor);
            mouseY = parseInt(e.pageY / cvs.scaleFactor);
        } else {
            mouseX = parseInt((e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft) / cvs.scaleFactor);
            mouseY = parseInt((e.clientY + document.body.scrollTop + document.documentElement.scrollTop) / cvs.scaleFactor);
        }

        cvs.touchedDX = mouseX - cvs.touchedX;
        cvs.touchedDY = mouseY - cvs.touchedY;


        if (cvs.draggingMouse) {

            // adjust the image or text size by the amount of the latest drag
            var dx = mouseX - startX;
            var dy = mouseY - startY;

            cvs.imgx += dx;
            cvs.imgy += dy;

            // reset the startXY for next time
            startX = mouseX;
            startY = mouseY;

            // redraw the image with border            
            // remove jerky rendering especially in Firefox
            setTimeout(function () {
                draw();
            }, 20);
            e.preventDefault();

        } else {
            // mouse in hovering
        }


    }
    function handleMouseUp(e) {
        cvs.draggingMouse = false;
    }
    $("#resizeImage2Canvas").click(function () {
        cvs.imgx = 0;
        cvs.imgy = 0;
        cvs.imgwidth = cvs.cvswidth;
        cvs.imgheight = cvs.cvsheight;
        updateImgSpinners();
        draw();
    });
    $("#resizeWidthImage2Canvas").click(function () {
        cvs.imgx = 0;
        cvs.imgwidth = cvs.cvswidth;
        var imgkeepratio = $("#imgkeepratio").prop("checked");
        if (imgkeepratio) {
            cvs.imgheight = parseInt((cvs.imgwidth * cvs.imgheight_ori) / cvs.imgwidth_ori);
        }
        updateImgSpinners();
        draw();
    });
    $("#resizeHeightImage2Canvas").click(function () {
        cvs.imgy = 0;
        cvs.imgheight = cvs.cvsheight;
        var imgkeepratio = $("#imgkeepratio").prop("checked");
        if (imgkeepratio) {
            cvs.imgwidth = parseInt((cvs.imgheight * cvs.imgwidth_ori) / cvs.imgheight_ori);
        }
        updateImgSpinners();
        draw();
    });

    $("#imageHeight").spinner({
        min: 20,
        step: 1,
        stop: function (event, ui) {
            if ($("#imageHeight").spinner("isValid")) {
                cvs.imgheight = $(this).spinner("value");
                var imgkeepratio = $("#imgkeepratio").prop("checked");
                if (imgkeepratio) {
                    cvs.imgwidth = parseInt((cvs.imgheight * cvs.imgwidth_ori) / cvs.imgheight_ori);
                    $("#imageWidth").spinner("value", cvs.imgwidth);
                }
                draw();
            }
        },
        spin: function (event, ui) {
            if ($("#imageHeight").spinner("isValid")) {
                cvs.imgheight = ui.value;
                var imgkeepratio = $("#imgkeepratio").prop("checked");
                if (imgkeepratio) {
                    cvs.imgwidth = parseInt((cvs.imgheight * cvs.imgwidth_ori) / cvs.imgheight_ori);
                    $("#imageWidth").spinner("value", cvs.imgwidth);
                }
            }
        }
    }).on('blur', function () {
        if (!$(this).spinner("isValid")) {
            $(this).spinner("value", cvs.imgheight);
            draw();
        }
        draw();
    });



    $("#imageWidth").spinner({
        min: 20,
        step: 1,
        stop: function (event, ui) {
            if ($("#imageWidth").spinner("isValid")) {
                cvs.imgwidth = $(this).spinner("value");
                var imgkeepratio = $("#imgkeepratio").prop("checked");
                if (imgkeepratio) {
                    cvs.imgheight = parseInt((cvs.imgwidth * cvs.imgheight_ori) / cvs.imgwidth_ori);
                    $("#imageHeight").spinner("value", cvs.imgheight);
                }
                draw();
            }
        },
        spin: function (event, ui) {
            if ($("#imageWidth").spinner("isValid")) {
                cvs.imgwidth = ui.value;
                var imgkeepratio = $("#imgkeepratio").prop("checked");
                if (imgkeepratio) {
                    cvs.imgheight = parseInt((cvs.imgwidth * cvs.imgheight_ori) / cvs.imgwidth_ori);
                    $("#imageHeight").spinner("value", cvs.imgheight);
                }
            }
        }
    }).on('blur', function () {
        if (!$(this).spinner("isValid")) {
            $(this).spinner("value", cvs.imgwidth);
            draw();
        }
    });

    $('#img_oalign_left, #img_oalign_center, #img_oalign_right').click(function (e) {
        var id = $(this).attr("id");
        var oalign = id.replace(/img_oalign_/gi, "");
        if (oalign === "left") {
            cvs.imgx = 0;
        } else if (oalign === "right") {
            cvs.imgx = cvs.cvswidth - cvs.imgwidth;
        } else {
            cvs.imgx = (cvs.cvswidth - cvs.imgwidth) / 2;
        }
        draw();
    });
    $('#img_align_center').click(function (e) {
        cvs.imgx = (cvs.cvswidth - cvs.imgwidth) / 2;
        cvs.imgy = (cvs.cvsheight - cvs.imgheight) / 2;
        draw();
    });

    $('#img_ovalign_top, #img_ovalign_middle, #img_ovalign_bottom').click(function (e) {
        var id = $(this).attr("id");
        var voalign = id.replace(/img_ovalign_/gi, "");
        if (voalign === "top") {
            cvs.imgy = 0;
        } else if (voalign === "bottom") {
            cvs.imgy = cvs.cvsheight - cvs.imgheight;
        } else {
            cvs.imgy = (cvs.cvsheight - cvs.imgheight) / 2;
        }
        draw();
    });


    $("#resetImage").click(function () {
        cvs.imgx = 0;
        cvs.imgy = 0;
        cvs.imgwidth = cvs.imgwidth_ori;
        cvs.imgheight = cvs.imgheight_ori;
        updateImgSpinners();
        draw();
    });

    function updateImgSpinners() {
        $("#imageHeight").spinner("value", cvs.imgheight);
        $("#imageWidth").spinner("value", cvs.imgwidth);
    }
    function checkSupportsAttribute(element, attribute) {
        var test = document.createElement(element);
        if (attribute in test) {
            return true;
        } else {
            return false;
        }
    }

    $("#downloadcanvas").click(function () {
        var canvas = document.getElementById("dimenso");
        var fname = "WPImager";
        var ext = "png";
        var support_download = checkSupportsAttribute('a', 'download');
        if (canvas.msToBlob) { //for IE
            var blob = canvas.msToBlob();
            window.navigator.msSaveBlob(blob, fname + "." + ext);
        } else if (support_download) {
            // download attribute supported by browser
            var w = canvas.width,
                    h = canvas.height;
            Canvas2Image.saveAsImage(canvas, 0, 0, w, h, ext, fname + "." + ext);
        } else if (!isuploading) {
            // download attribute not supported, upload then download image
            var imgBase64 = canvas.toDataURL("image/" + ext, 1);
            imgBase64 = imgBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
            quickdownload(imgBase64, ext);
        }
        return false;
    });


    function quickdownload(imgBase64, ext) {
        var nonce = $("#nonce").val();
        $.ajax({
            type: 'POST',
            url: ajaxurl,
            data: {action: 'quickdownload', canvas_id: 0, imageCanvas: imgBase64, _wpnonce: nonce},
            dataType: 'json',
            cache: false,
            success: function (msg) {
                if (msg.success) {
                    $("#progressDialog").find(".done-show").show();
                    $("#progressDialog").find(".done-hide").hide();

                    $("#downloadProgressWrap").find(".done-show").show();
                    $("#downloadProgressWrap").find(".done-hide").hide();

                    setTimeout(function () {
                        $("#progressDialog").fadeOut();
                    }, 3500);
                    // proceed to download file via iframe
                    var fname = convertToSlug("WPImager");
                    url = download_action + "?canvas_id=" + msg.canvas_id + "&amp;tick=" + msg.tick + "&amp;fname=" + fname + "&amp;ext=" + ext + "&amp;guest=0";
                    $("body").append("<iframe src='" + url + "' style='display: none;' ></iframe>");
                } else {
                    if (typeof msg.message !== "undefined") {
                        $('#printErrorMsg').text(msg.message);
                    } else {
                        $('#printErrorMsg').text("Unexpected response from server.");
                    }
                    $("#progressDialog").find(".error-show").show();
                    $("#progressDialog").find(".error-hide").hide();
                }

                isuploading = false;

                setTimeout(function () {
                    $("#downloadcanvas").removeClass("disabled");
                }, 4000);

            },
            beforeSend: function () {
                $("#printProgressBar").css("width", "0%");
                $("#progressDialog").find(".start-show").show();
                $("#progressDialog").find(".start-hide").hide();
                $("#progressDialog").modal({
                    backdrop: 'static'
                });
                $('#printProgressBar').addClass("progress-bar-success");
                isuploading = true;
                $("#downloadcanvas").addClass("disabled");
            },
            xhr: function () {
                xhr_upload = new window.XMLHttpRequest();
                //Upload progress
                xhr_upload.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = evt.loaded / evt.total * 100;
                        //Do something with upload progress
                        $("#printProgressBar").css("width", parseInt(percentComplete) + "%");
                    }
                }, false);
                return xhr_upload;
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
                $("#progressDialog").find(".error-show").show();
                $("#progressDialog").find(".error-hide").hide();
                isuploading = false;
            }
        });

    }

    function convertToSlug(Text) {
        Text = Text.trim();
        // filter text for valid filename usage
        return Text
                //    .toLowerCase()
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '-')
                ;
    }
    var imgcanvas = null;
    function resize_image() {

        // check if image is hosted on local server
        var src = cvs.imgsrc;

        if (imgcanvas == null) {
            // imgcanvas = document.createElement('canvas');
            imgcanvas = document.getElementById('imgcanvas');
        }

        // starting to resize
        var imgdraw = cvs;
        type = 'image/png';
        quality = 0.95;
        cvs.cW = imgdraw.imgwidth_ori;
        cvs.cH = imgdraw.imgheight_ori;

        if (cvs.cW == 0 || cvs.cH == 0)
            return;

        var imgcontext = imgcanvas.getContext('2d');
        imgcanvas.width = cvs.cW;
        imgcanvas.height = cvs.cH;


        imgcontext.drawImage(imgImportMedia, 0, 0, cvs.cW, cvs.cH, 0, 0, cvs.cW, cvs.cH);


        doresize_image();

    }


    // resize image using step down for anti-aliasing 
    function doresize_image() {
        var context;

        var imgdraw = cvs;


        // use temp canvas to step down image size
        var cvtemp = document.getElementById('cvtemp');
        var context = cvtemp.getContext('2d');
        // step down half the size at a time
        cvs.cW /= 2;
        cvs.cH /= 2;

        var resize_end = false;
        var scaleX = imgdraw.imgwidth / imgdraw.imgwidth_ori;
        var scaleY = imgdraw.imgheight / imgdraw.imgheight_ori;

        // if desired size reached
        if (cvs.cW < imgdraw.imgwidth || cvs.cH < imgdraw.imgheight) {
            cvs.cW = imgdraw.imgwidth;
            cvs.cH = imgdraw.imgheight;
            resize_end = true;
        }
        cvs.cW = parseInt(cvs.cW); // IE11
        cvs.cH = parseInt(cvs.cH);

        cvtemp.width = cvs.cW;
        cvtemp.height = cvs.cH;
        var imgcontext = imgcanvas.getContext('2d');

        context.save();
        // draw canvas layer back on temp canvas
        context.drawImage(imgcanvas, 0, 0, (cvs.cW), (cvs.cH));


        // if desired size reached
        if (resize_end) {

            imgcanvas.width = cvs.cW;
            imgcanvas.height = cvs.cH;
            // transfer temp canvas to image canvas 
            imgcontext.drawImage(cvtemp, 0, 0, cvs.cW, cvs.cH, 0, 0, (cvs.cW), (cvs.cH));

            context.restore();
            //  end of resize
            return;
        }
        imgcanvas.width = cvs.cW;
        imgcanvas.height = cvs.cH;
        imgcontext.drawImage(cvtemp, 0, 0, cvs.cW, cvs.cH);

        context.restore();
        // keep resizing until desired size
        doresize_image();

    }

    window.onresize = function (event) {
        var TB_WIDTH = $(window).width() - 60,
                TB_HEIGHT = $(window).height() - 60; // set the new width and height dimensions here..
        $("#TB_window").css({
            marginLeft: '-' + parseInt((TB_WIDTH / 2), 10) + 'px',
            width: TB_WIDTH + 'px',
            height: TB_HEIGHT + 'px',
            marginTop: '-' + parseInt((TB_HEIGHT / 2), 10) + 'px'
        });
        $("#TB_ajaxContent").css({width: '100%', padding: 0});
        $("#TB_container,#TB_ajaxContent,#TB_uploader").height(TB_HEIGHT - 130);
        $("#TB_container").width(TB_WIDTH - 240);
        $("#media_selected_panel").css({top: $("#TB_title").css("height")});
        $("#media_selected_panel").height($("#TB_container").height());
    };

    var dropzone = document.getElementById("TB_uploader");
    new Dragster(dropzone);

    document.addEventListener("dragster:enter", function (e) {
        e.target.classList.add("dropactive");

    }, false);

    document.addEventListener("dragster:leave", function (e) {
        e.target.classList.remove("dropactive");
    }, false);



});  // jQuery


var ctrl_pressed = false;

// trigger pasteCatcher focus
document.addEventListener('keydown', function (event) {
    // ctrl key pressed
    if (event.keyCode == 17 || event.metaKey || event.ctrlKey) {
        if (ctrl_pressed == false)
            ctrl_pressed = true;
    }
    // v keycode = 86
    if (event.keyCode == 86) {
        if (ctrl_pressed == true /* && !window.Clipboard */) {
            var target = event.target || event.srcElement;
            if (target.tagName.toLowerCase() !== "textarea" &&
                    target.tagName.toLowerCase() !== "input") {
                var pasteCatcher = document.getElementById("paste_clipboard");
                pasteCatcher.focus();
            }
        }
    }

}, false);

