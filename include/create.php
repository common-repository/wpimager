<?php

if (!defined('ABSPATH'))
    exit; // Exit if accessed directly

$WPImagerEditor->WPImagerAccess();
$canvas_id = $WPImagerEditor->newcanvas_ID();

if (!(isset($_GET['id']) && $_GET['id'] == $canvas_id)) {
    $attempt = (int) $_GET['a'];
    if ($attempt < 5) {
        $_clickq = (!empty($_REQUEST['clickq'])) ? '&clickq=' . $_REQUEST['clickq'] : '';
        wp_safe_redirect(admin_url("admin.php?page=wpimager_create&id=" . $canvas_id . '&a=' . ++$attempt . $_clickq));
    }
    exit;
}

if (!function_exists('wpimager_create_headscript')) {

    function wpimager_create_headscript() {
        global $_wp_additional_image_sizes;
        global $admin_url, $WPImagerEditor;

        $canvas_id = $WPImagerEditor->newcanvas_ID();
        if (!(isset($_GET['id']) && $_GET['id'] == $canvas_id)) {
            exit;
        }

        // retrieve the "per_page" option
        $user_ID = get_current_user_id();
        // save maxcanvaswidth for next time
        $_options = get_user_option('wpimager_options', $user_ID);
        $options = unserialize($_options);

        $sizes_largest_width = 100;
        $sizes_largest_height = 100;
        $sizes_largest_multiply = 10000;
        $sizes = array();
        foreach (get_intermediate_image_sizes() as $_size) {
            if (in_array($_size, array('thumbnail', 'medium', 'medium_large', 'large'))) {
                $sizes[$_size]['width'] = get_option("{$_size}_size_w");
                $sizes[$_size]['height'] = get_option("{$_size}_size_h");
                $multiply = $sizes[$_size]['width'] * $sizes[$_size]['height'];
                if ($_size !== 'large' && $multiply > $sizes_largest_multiply) {
                    $sizes_largest_width = $sizes[$_size]['width'];
                    $sizes_largest_height = $sizes[$_size]['height'];
                    $sizes_largest_multiply = $multiply;
                }
            }
        }

        $wp_upload_dir = wp_upload_dir();

        $max_upload = (int) (ini_get('upload_max_filesize'));
        $max_post = (int) (ini_get('post_max_size'));
        $memory_limit = (int) (ini_get('memory_limit'));
        $upload_mb = min($max_upload, $max_post, $memory_limit);
        ?>
        <style>
            body {
                background-color:transparent;
            }
            #canvas_sizes_panel a:focus, #create-panel-menu a:focus {
                outline: none;
                box-shadow: none;
            }

            .page-title {
                margin: 0 -15px;
                padding:16px 22px;
                color:#333;
                font-size:1.6em;
                font-weight: 300;
            }
            .title {
                margin: 0 -15px;
                padding:4px 32px 4px 16px;
                color:#333;
                font-size:1.6em;
                font-weight: 300;
                display:inline-block;
            }

            #create-panel-menu {
                background-color: #fff;
                height:40px;
            }

            #create-panel-menu li {
                float:left;				
                padding:0;
                margin:0;
            }

            #create-panel-menu li a {
                display: block;
                padding:10px 16px;
                color:#777;
            }
            #create-panel-menu li a.active {
                color:#e53935 !important;					
            }

            #create-panel-menu li a:hover, #create-panel-menu li a:active, #create-panel-menu li a:focus {
                text-decoration: none;
                color:#222;
                outline: none;
            }

            .create-panel.disabled {
                cursor: not-allowed;
                filter: alpha(opacity=65);
                -webkit-box-shadow: none;
                box-shadow: none;
                opacity: .65;
            }

            .panel-title {
                margin: 0 -15px;
                padding:4px 32px 16px 0px;
                color:#333;
                font-size:1.6em;
                font-weight: 300;
                display:inline-block;
            }
            #create-panel-covers {
                background-color:#fafafa;
                margin: 0px;
                padding:10px 20px 0;
            }

            .card-slider .thumbnail.rounded {
                -webkit-border-radius: 100%;
                -moz-border-radius: 100%;
                border-radius: 100%;				
            }
            .card-banners .thumbnail .fa {
                color: #fff;
            }
            .card-banners .title {
                background: #e53935;
            }
            .col-md-3 {
                padding:0 10px 0 0;
            }


            .Uploadbtn {
                position: relative;

                overflow: hidden;
                padding:10px 20px;
                text-transform: uppercase;
                color:#fff;
                background: slategray;
                -webkit-border-radius: 4px;
                -moz-border-radius: 4px;
                -ms-border-radius: 4px;
                -o-border-radius: 4px;
                border-radius: 4px;
                width:124px;
                text-align:center;
            }
            .Uploadbtn .input-upload {
                position: absolute;
                top: 0;
                right: 0;
                margin: 0;
                padding: 0;
                opacity: 0;
                height:100%;
                width:100%;
            }

            #canvas_sizes_panel {				
                display:none;
                clear:both;
                /*    position:absolute;*/
                min-width: 640px;
                -webkit-border-radius: 4px;
                -moz-border-radius: 4px;
                -ms-border-radius: 4px;
                -o-border-radius: 4px;
                border-radius: 4px;
                padding:0px 10px;

            }

            #canvas_sizes_panel .content-media-sizes {
                display: none;
            }
            #create_options {
                height:190px;
            }

            #create_options_forms {
                position: relative;
                padding:20px;   
                z-index: 100;
            }

            #create_options_forms input {
                padding:2px 4px;
                margin:0px !important;
            }

            #create_options_presetsizes {
                position: relative;
                width:100%;
            }
            #create_options_previewsize {
                background-color: #565656;
                color:#eaeaea;
                border:1px solid #eaeaea;
                text-align: center;
                display: none;
                margin:8px 0;
                clear: both;
                position: relative;
            }
            #create_options_presetsizes_col .section {
                width:25%;
                float:left;
            }
            .header-media-sizes {
                font-size: 1em;
                font-weight: bold;
                text-decoration: none;
                line-height: 1.6em;
                color: #eaeaea;
                background-color: #2c4c7e;
                padding:4px 6px;
                margin: 0 4px;
                display: none;
            }
            #dimenso {
                text-align: center;vertical-align: middle;width:800px; height:500px;background:#434343; color:#fafafa;
                line-height: 500px;
                margin: 20px auto;
                -webkit-box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.4);
                -moz-box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.4);
                box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.4);

            }
            #dimension_name {
                line-height: 32px;
                margin: 0 10px 0 0;   
                font-size:20px;
                display: inline-block;
            }
            #custom_canvas_width, #custom_canvas_height {
                width:50px;
                padding: 0px 4px !important;
                height: 22px;
                text-align: center;
                font-size: 16px;
            }


            #canvas_sizes_panel .selbanner {
                background: #f5f5f5;
                margin:3px;
                padding:8px 10px;
                font-size:0.95em;
                color:#565656;
                border:1px solid #ddd;
                display: inline-block;
            }

            #canvas_sizes_panel .selbanner.active, #canvas_sizes_panel .content-media-sizes a:hover .selbanner.active  {
                /*				background-color:#4caf50;*/
                border-bottom: 3px solid #337ab7;
                /*				color:#fff;*/
            }

            #canvas_sizes_panel .selbanner > div {
                display: inline-block;
            }
            #canvas_sizes_panel .content-media-sizes a:hover {
                text-decoration: none;
            }
            #canvas_sizes_panel .content-media-sizes a:hover .selbanner {
                background-color:#eaeaea;
                color:#000;
            }
            #canvas_sizes_panel .section {
                padding:0;
                margin-top: 8px;
            }
            #canvas_sizes_panel .evo-pop {
                left:auto !important;
            }
            #panel_selected_sizes {
                background-color:#fafafa;
                border:1px solid #ddd;
                padding:10px 16px;
            }

            a.edit-attachment, .attachment-display-settings {
                display: none;
            }

            #progressDialog .modal-dialog {
                margin-top:20%;
                text-align: center;
            }


            label[id^="img_oalign"], label[id^="img_ovalign"] {
                padding: 6px 8px 0px !important;
            }			

            #dimenso.grabbable {
                cursor: move; /* fallback if grab cursor is unsupported */
                cursor: grab;
                cursor: -moz-grab;
                cursor: -webkit-grab;
            }

            #dimenso.grabbable:active { 
                cursor: grabbing;
                cursor: -moz-grabbing;
                cursor: -webkit-grabbing;
            }

        </style>
        <script>
            var download_action = '<?php echo WPIMAGER_PLUGIN_URL ?>include/download.php';
            var canvas_id = <?php echo $canvas_id ?>;
            var nonce = '<?php echo wp_create_nonce('wpimager_create') ?>';
            var UI_nonce = '<?php echo wp_create_nonce('wpimager' . $canvas_id) ?>';
            var sizes_largest_width = <?php echo $sizes_largest_width; ?>;
            var sizes_largest_height = <?php echo $sizes_largest_height; ?>;
            var wpimager_baseurl = '<?php echo $wp_upload_dir['baseurl']; ?>';
            var admin_url = '<?php echo esc_url($admin_url) ?>';
            var max_upload_size = <?php echo $upload_mb ?>;
            jQuery(function ($) {
                setTimeout(function () {
        <?php
        if (!empty($_REQUEST['clickq'])) {
            switch ($_REQUEST['clickq']) {
                case "media":
                    echo '$("#cmdWPMedia").click();';
                    break;
                case "blank":
                    echo '$("#cmdBlankCanvas").click();';
                    break;
                case "print":
                    echo '$("#cmdPrintScreen").click();';
                    break;
                case "import":
                    echo '$("#cmdImportCanvas,#naImportCanvas").click();';
                    break;
                default:
            }
        } else {
            echo '$("#cmdBlankCanvas").click();';
        }
        ?>
                }, 600);
            });

        </script>
        <?php
    }

}

if (!function_exists('wpimager_create')) {


    function wpimager_create() {
        global $wpdb;
        $user_ID = get_current_user_id();
        // retrieve the "per_page" option
        $screen = get_current_screen();
        $screen_option = $screen->get_option('per_page', 'option');

        $table_name = $wpdb->wpimager_db;
        $history_limit = 10;
        $result = $wpdb->get_results($wpdb->prepare('SELECT c.* FROM ' . $table_name . ' c '
                        . 'WHERE c.user_id = %d AND  c.disposed = 0 ORDER BY c.created DESC LIMIT %d', $user_ID, $history_limit));

        include 'coversizes.php';

        foreach (array('Social_Media', 'Banners') as $media) {
            $cover_sizes[$media] = $wpimager_sizes[$media];
        }
        ?>


        <div class="wrap">
            <?php require_once WPIMAGER_PLUGIN_PATH . 'include/header.php'; ?>
            <div>
                <div id="create-panel-importmedia" class="create-content text-center create-panel alignright" style="display:none;">
                    <div id="" class="text-center">
                        <section id="importmedia-sizes-buttons" style="padding:4px 10px"></section>
                        <!--					<div id="" style="background-color:transparent;padding:16px 0;">
                                                                        <button type="button" class="button button-primary" onclick="postCreateMedia();">Create Canvas</button>
                                                                </div>				-->
                    </div>
                </div>
                <ul id="create-panel-menu">
                    <li><a id="cmdWPMedia" href="#"><span class="dashicons dashicons-admin-media" style="font-size:16px;"></span> Upload or Select Photo</a></li>
                    <li><a id="cmdBlankCanvas" href="#"><span class="fa fa-square-o"></span>&nbsp; Blank</a></li>
                    <li><a id="cmdPrintScreen" href="#"><span class="fa fa-desktop"></span>&nbsp; Print Screen</a></li>
                    <?php if (class_exists('ZipArchive')): ?>
                        <li><a id="cmdImportCanvas" href="#"><span class="fa fa-file-zip-o"></span>&nbsp; Import Canvas</a></li>
                    <?php endif; ?>
                </ul>
            </div>





            <div id="canvas_sizes_panel" class="create-panel">
                <div id="preset_sizes_panel" class="text-center">
                    <h3 id="" class="text-center">Select a Canvas Size</h3>
                    <button id="btn-media-select-image-size" class="btn-media-select btn btn-sm btn-default button-main" data-media="image">
                        Image Size
                    </button>									
                    <?php foreach ($cover_sizes as $cover_media => $cover_media_sizes): ?>
                        <?php $cover_media = str_replace('+', '', $cover_media); ?>
                        <button class="btn-media-select btn btn-sm btn-default button-main" data-media="<?php echo $cover_media ?>">
                            <?php echo str_replace('_', ' ', $cover_media) ?>
                        </button>									
                    <?php endforeach; ?>
                    <button id="btn-media-custom" class="btn-media-select btn btn-sm btn-default button-main" data-media="custom">
                        Custom
                    </button>									

                    <div id="create_options_presetsizes">
                        <div id="create_options_presetsizes_col">
                            <?php foreach ($cover_sizes as $cover_media => $cover_media_sizes): ?>
                                <?php $cover_media = str_replace('+', '', $cover_media); ?>
                                <div id="section-<?php echo $cover_media ?>" class="section section-covers section-all">
                                    <div class="header-media-sizes"><?php echo $cover_media ?></div>
                                    <div class="content-media-sizes clearfix">
                                        <?php foreach ($cover_media_sizes as $cover_group => $cover_size): ?>
                                            <a href="#" onclick="return sizeCanvas(this, <?php echo $cover_size['w'] ?>, <?php echo $cover_size['h'] ?>, '<?php // echo $cover_media  ?><?php echo $cover_group ?>');">                
                                                <div class="selbanner" data-width="<?php echo $cover_size['w'] ?>" data-height="<?php echo $cover_size['h'] ?>" data-title="<?php // echo $cover_media  ?><?php echo $cover_group ?>">
                                                    <div><?php echo $cover_group ?></div>
                                                    <br>
                                                    <div><strong><?php echo $cover_size['w'] ?> x <?php echo $cover_size['h'] ?></strong></div>
                                                </div>
                                            </a>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                            <div id="section-custom" class="section section-covers section-all"></div>
                            <div id="section-image" class="section section-covers section-all" style="display:none">								
                                <div>
                                    <a href="#" onclick="return sizeCanvas(this, 0, 0, 'Image Size');">                
                                        <div class="selbanner" data-width="0" data-height="0" data-title="">
                                            <div>Set Canvas Size to Image Size</div>
                                            <div id="section-image-thesize" style="font-weight:bold"></div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                            <div style="clear:both"></div>
                        </div>
                        <div id="create_options_previewsize" class="text-center">
                            <div id="wpimager-editor" style="min-width:0">
                                <div id="cvsbox_menu" style="padding: 4px 0;background-color:#222;color:#aaa;position: relative;height: auto">
                                    <div>
                                        <div class="btn-group" data-toggle="buttons">
                                            <label id="img_oalign_left" class="btn btn-sm btn-default" title="Image Align Left">
                                                <span class="fa fi-object-align-left"></span></label>
                                            <label id="img_oalign_center" class="btn btn-default" title="Image Align Center">
                                                <span class="fa fi-object-align-horizontal"></span></label>
                                            <label id="img_oalign_right" class="btn btn-default" title="Image Align Right">
                                                <span class="fa fi-object-align-right"></span></label>
                                        </div>
        <!--                                        <button class="btn btn-default" id="img_align_center" title="Center Image"><span class="fa fa-dot-circle-o"></span></button>-->
                                        <div class="btn-group" data-toggle="buttons">
                                            <label id="img_ovalign_top" class="btn btn-default" title="Image Align Top">
                                                <span class="fa fi-object-align-top"></span></label>
                                            <label id="img_ovalign_middle" class="btn btn-default" title="Image Align Middle">
                                                <span class="fa fi-object-align-vertical"></span></label>
                                            <label id="img_ovalign_bottom" class="btn btn-default" title="Image Align Bottom">
                                                <span class="fa fi-object-align-bottom"></span></label>
                                        </div>
                                        <div class="btn-group" data-toggle="buttons">
                                            <button class="btn btn-default" id="resizeWidthImage2Canvas"><span class="fa fa-arrows-h"></span></button>
                                            <button class="btn btn-default" id="resizeHeightImage2Canvas"><span class="fa fa-arrows-v"></span></button>
                                            <button class="btn btn-default" id="resizeImage2Canvas"><span class="fa fa-arrows-alt"></span></button>
                <!--                                <button class="btn btn-default" id="groupObjects2"><span class="fa fa-object-group"></span></button>-->
                                        </div>
                                        <span>Width:<input id="imageWidth"></span>
                                        <span>Height:<input id="imageHeight"></span>
                                        <span id="spanimgKeepratio"><input id="imgkeepratio" type="checkbox" name="imgkeepratio" title="Keep Ratio" value="1" checked/> <label for="imgkeepratio">original ratio</label></span>
                                        &nbsp; <button class="btn btn-link btn-xs btn-reset" id="resetImage" title="Reset Image to Original Size & Position"><span class="fa fa-refresh"></span> Reset to Original Size</button>
                                    </div>
                                </div>
                            </div>
                            <div id="download_bar" style="padding:4px;position: absolute; right:0px;top:-1px;"><button id="downloadcanvas" type="button" class="btn btn-sm btn-success"><span class="fa fa-image"></span> Download</button></div>
                            <div style="margin:8px 0 0;vertical-align: middle">
                                <div id="" style="display:inline-block;background-color:transparent;padding:6px 0 0;">
                                    <h3 id="dimension_name" class="text-center">Default</h3>
                                    &bull; <span id="label_previewsize"></span>px
                                    <div class="input-group" style="width:400px;margin:0 auto">
                                        <input id="canvas_title" type="text" class="form-control" value="" placeholder="Canvas Title"/>
                                        <span class="input-group-btn">
                                            <button type="button" class="btn btn-primary" onclick="postCreateCanvas();">Create Canvas</button>
                                        </span>
                                    </div>
                                </div>				
                            </div>
                            <canvas id="dimenso">800x500</canvas>
                        </div>
                    </div>
                </div>
            </div>

            <div id="create-panel-import" class="create-content text-center create-panel" style="display:none">										
                <div style="padding:60px 0" class="row">
                    <div class="col-md-4 col-md-offset-4">
                        <div class="wpimager-card card-slider" style="background-color: #00acc1">
                            <div class="thumbnail-wrap">
                                &nbsp;
                                <div class="" style="margin:30px auto;font-size:36px;width:40px;height:40px;color:#fff;background: none">
                                    <div class="fa fa-upload"></div>
                                </div>
                                <div class="" style="color:#fafafa">(Exported canvas from WPImager)</div>
                            </div>
                            <?php if (class_exists('ZipArchive')): ?>
                                <div id="" class="panel-content">
                                    <div class="sub-title" style="background-color: #fff;padding:10px;">
                                        Upload WPImager zip file 
                                    </div>
                                    <div style="padding:10px 4px">
                                        <a href="#" id="upload_zip" class="btn btn-danger btn-sm" onclick="return false;"><span class="fa fa-cloud-upload"></span> Upload Zip File</a>                    
                                    </div>
                                </div>
                            <?php else: ?>
                                <div id="" class="panel-content">
                                    <div class="sub-title" style="background-color: #fff;padding:10px;">
                                        Unable to Import Canvas
                                    </div>
                                    <div class="" style="padding:16px 4px;">
                                        <div class="label label-danger" style="padding:10px 10px;font-size:0.9em">
                                            PHP ZipArchive not installed.                                    
                                        </div>
                                    </div>
                                </div>
                            <?php endif; ?>
                        </div>
                        <div style="margin:10px;">
                            Try out the sample canvas available for download 
                            <div><a target="_samplecanvas" href="https://wpimager.com/sample-canvas/">https://wpimager.com/sample-canvas/</a>
                                </div>
                        </div>
                    </div>

                </div>
            </div>

            <div id="create-panel-custom" style="display:none;" class="text-center create-panel">
                <div style="padding:10px 0" class="row">
                    <div class="text-center">
                        <div class="wpimager-card card-slider" style="">
                            <div id="" class="panel-content" style="position:relative">
                                <div class="sub-title" style="background-color: #fff">
                                    <div id="customsize" class="" style="padding:5px;margin: 0 4px 0px">
                                        Custom Canvas Size: <input id="custom_canvas_width" value=""/> x <input id="custom_canvas_height" value=""/> px
                                    </div>
                                </div>
                                <!--								<div style="padding:8px 4px 6px">
                                                                                                        <button type="button" class="btn btn-danger" onclick="postCreateCustom();">Create Canvas</button>
                                                                                                </div>-->
                                <div style="text-align:center;">
                                    <?php if (false && !empty($result)): ?>
                                        Previous Sizes:
                                        <?php $previousSizes = array(); ?>
                                        <?php $previousSizesOut = 0; ?>
                                        <?php foreach ($result as $cvs): ?>									
                                            <?php $settings = unserialize(base64_decode($cvs->settings)); ?>
                                            <?php $par['canvas'] = json_decode($settings['canvas'], true); ?>								
                                            <?php if ($previousSizesOut < 3 && !isset($previousSizes[$par['canvas']['width'] . 'x' . $par['canvas']['height']])): ?>
                                                <?php $previousSizes[$par['canvas']['width'] . 'x' . $par['canvas']['height']] = 1; ?>
                                                &bull;&nbsp;<a href="#" onclick="return setCanvasSize(<?php echo $par['canvas']['width']; ?>, <?php echo $par['canvas']['height']; ?>);" class=""><?php echo $par['canvas']['width']; ?>x<?php echo $par['canvas']['height']; ?></a>
                                                <?php $previousSizesOut++; ?>
                                                <?php if ($previousSizesOut == 1): ?>
                                                    <input type="hidden" id="custom_canvas_width_init" value="<?php echo $par['canvas']['width'] ?>"/>
                                                    <input type="hidden" id="custom_canvas_height_init" value="<?php echo $par['canvas']['height'] ?>"/>
                                                <?php endif; ?>
                                            <?php endif; ?>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <div id="print_screen_panel" style="display: none" class="create-panel">										
                <div style="padding:60px 0" class="row">
                    <div class="col-md-8 col-md-offset-2">
                        <div class="wpimager-card card-slider" style="background-color: #007cc1">
                            <div class="thumbnail-wrap">
                                &nbsp;
                                <div class="" style="margin:50px auto;color:#fff;font-size:2em;text-align: center">
                                    <span class="fa fa-desktop"></span> Print Screen
                                </div>
                            </div>
                            <div id="" class="panel-content">
                                <div class="text-center" style="font-size: 14px;background-color: #fafafa;line-height:1.6em;padding:16px 30px 40px">
                                    <h3>Instructions</h3>
                                    <div>Press the "Print Screen" key on your keyboard.
                                        <br>Press "Ctrl-V" or the equivalent to paste the screen on this page. 
                                        <br>Click "Upload Screen" just above the screenshot.
                                    </div>

                                    *<i>Works on supported OS & browsers only.</i>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>            

            <div id="paste_screen_panel" style="display: none" class="create-panel">										
                <div id="" class="text-center">
                    <h3 id="" class="text-center">Print Screen</h3>
                    <span id="label_pastescreen-size"></span>
                    <div id="" style="background-color:transparent;padding:16px 0;">
                        <button type="button" class="button button-primary" onclick="postCreateScreen()
                                        ;">Upload Screen</button>
                    </div>				
                    <img id="imgPasteScreen" src="" style="max-width:100%;">
                    <img id="imgPasteScreen2" src="" style="display:none">
                </div>
            </div>            						

            <div class="modal" id="progressDialog" tabindex="-1" role="dialog" aria-labelledby="progressDialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">          
                        <div class="modal-body">
                            <!-- Paste Image upload progress bar -->
                            <div id="" class="progress-uploading">
                                <div id="printProgressStart" class="start-show error-hide done-hide">
                                    <span class='fa fa-cog spin-custom'></span> Uploading in progress ...
                                </div>
                                <div id="printProgressNG" class="start-hide error-show done-hide">
                                    <span class='fa fa-exclamation-triangle'></span> <span id="printErrorMsg">Error Message.</span>
                                </div>
                                <div id="printProgressOK" class="start-hide error-hide done-show">
                                    <span class='fa fa-info-circle'></span> Image upload is complete.
                                </div>
                                <div id="printProgressOuter" class="progress progress-striped active start-show error-hide done-show">
                                    <div id="printProgressBar" class="progress-bar progress-bar-success" style="width: 0%"></div>                         
                                </div>       
                                <button class="btn btn- sm btn-danger start-show error-hide done-hide" id="xhr-abort-print">Cancel</button>
                                <button class="btn btn-sm btn-danger start-hide error-show done-show" id="xhr-close-print">OK</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>

        <div id="paste_clipboard" contenteditable=""></div>            
        <img id="imgImportMedia" src="" style="display: none">
        <canvas id="cvtemp" style="display:none"></canvas>
        <canvas id="imgcanvas" style="display:none"></canvas>

        <div id="wpimager-media" style="display: none">
            <div id="TB_container_menu">
                <ul class="clearfix">
                    <li><a id="tabUploadFile" href="#">Upload File</a></li>
                    <li class="active"><a id="tabMediaLibrary" href="#">Media Library</a></li>
                </ul>
            </div>
            <div id="TB_uploader" class="">
                <div style="width:98%;text-align: center" class="">
                    <div id="uploadDropSelect" class="">
                        <h3>Drop files here to upload</h3>
                        <div style="margin:10px;">or</div>
                        <a href="#" id="upload_file" class="btn btn-default" onclick="return false;"><span class="fa fa-cloud-upload"></span> Select File</a>                    
                        <div style="margin:10px;">Maximum upload file size: <span id="text_upload_mb"></span>MB</div>
                    </div>
                    <div id="uploadProgressWrap" class="progress-uploading">
                        <button onclick="jQuery('#uploadProgressWrap').hide();" class="close ask-show start-hide error-show done-hide pull-right"><span class="fa fa-times" style="color:#aaa"></span></button>
                        <div id="uploadProgressStart" style="padding:10px;" class="ask-hide start-show error-hide done-hide">
                            <span class='fa fa-cog spin-custom'></span> Uploading File to Media Library.
                        </div>
                        <div id="uploadProgressNG" class="ask-hide start-hide error-show done-hide">
                            <span class='fa fa-exclamation-triangle'></span> <span id="uploadErrorMsg">Error Message.</span>
                        </div>
                        <div id="uploadProgressOK" class="ask-hide start-hide error-hide done-show">
                            <span class='fa fa-check'></span> File Uploaded to Media Library. 
                        </div>
                        <div id="uploadProgressOuter" class="progress progress-striped active ask-hide start-show error-hide done-hide">
                            <div id="uploadProgressBar" class="progress-bar progress-bar-success" style="width: 0%"></div>                         
                        </div>       
                        <button class="btn btn-sm btn-danger ask-hide start-show error-hide done-hide" id="xhr-abort-upload">Cancel</button>
                        <button class="btn btn-sm btn-danger ask-hide start-hide error-show done-hide" id="xhr-close-upload">Close</button>
                    </div>

                </div>
                <div style="height:100%" class="">&nbsp;</div>
            </div>
            <div id="TB_container">
                <div id="media_results" class="flex-images"></div>
            </div>
            <div id="media_selected_panel" class=""><div style="padding:16px 10px">Select an Image</div></div>
            <div style="position:absolute;bottom:10px;right:10px;"><button class="btn btn-sm btn-primary disabled" id="media_selected_insert" data-target="layer" data-attachment-id="0">Insert to Canvas</button></div>
        </div>

        <input type="hidden" id="nonce" value="<?php echo wp_create_nonce('wpimager_quick'); ?>"/>
        <?php
    }

} 