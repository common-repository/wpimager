<?php
/* !
  WPImager 1.0.0
  https://wpimager.com/
  2018 WPImager
 */


if (!defined('ABSPATH'))
    exit; // Exit if accessed directly


if (!function_exists('wpimager_editor_headscript')) {

    function wpimager_editor_headscript() {
        global $wpdb, $WPImagerEditor;

        $id = intval($_REQUEST['id']);

        $wp_upload_dir = wp_upload_dir();
        $wpimager_upload_url = $wp_upload_dir['baseurl'] . '/wpimager/canvas-' . $id;
        $wpimager_baseurl = $wp_upload_dir['baseurl'];

        $max_upload = (int) (ini_get('upload_max_filesize'));
        $max_post = (int) (ini_get('post_max_size'));
        $memory_limit = (int) (ini_get('memory_limit'));
        $upload_mb = min($max_upload, $max_post, $memory_limit);
        ?>
        <style>
            #adminmenuback, #adminmenuwrap, #wpadminbar {
                display: none;
            }
            #wpcontent, #wpbody-content { 
                margin:0 !important;
                padding:0 !important;
            }
            body {
                background-color:#333 !important;
            }
            .error {
                display:none;
            }
            html.wp-toolbar { padding-top: 0 }
            #wpwrap { background-color:#333 }
        </style>
        <script type="text/javascript">
            var wpimager_version = "<?php echo WPIMAGER_VERSION ?>";
            var ajaxurl = "<?php echo admin_url('admin-ajax.php') ?>";
            var adminurl = "<?php echo admin_url('admin.php') ?>";
            var autosave = false;
            var cap_upload_files = <?php echo ($WPImagerEditor->cap_upload_files() ? "true" : "false") ?>;
            var download_action = '<?php echo WPIMAGER_PLUGIN_URL ?>include/download.php';
            var is_frontend = <?php echo (defined('WPIMAGER_FRONTEND') ? "true" : "false") ?>;
            var ggfonts = {};
            var ggfontsurl = '<?php echo WPIMAGER_GOOGLEFONT_API ?>';
            var iframe_open = false;
            var zip;
            var file_loading_inv_gif = "<?php echo plugins_url('../images/loading-inv.gif', __FILE__) ?>";
            var wpimager_upload_url = "<?php echo $wpimager_upload_url ?>";
            var wpimager_baseurl = "<?php echo $wpimager_baseurl ?>";
            var max_upload_size = <?php echo $upload_mb ?>;
            var cursor_picker_file = "<?php echo plugins_url('../images/cursor-picker.png', __FILE__) ?>";

            /**
             * Prompt new title
             */
            function popEditTitle()
            {
                jQuery("#txtPagetitle").val(jQuery("#pagetitle").text().trim());
                jQuery("#dialog-edit-title").modal('show');
            }

            /**
             * Post title to server
             */
            function postEditTitle()
            {
                jQuery.ajax({
                    'dataType': 'json',
                    'success': function (data) {
                        if (data.success) {
                            jQuery("#pagetitle").html(data.title);
                        } else {
                            jQuery('#dialog-error-message-data').text(data.message);
                            jQuery('#dialog-error-message').modal('show');
                        }
                        jQuery('#dialog-edit-title').modal('hide');
                    },
                    'type': 'POST',
                    'url': ajaxurl,
                    'cache': false,
                    'data': {action: 'update_title', canvas_id: <?php echo $id; ?>, title: jQuery("#txtPagetitle").val(), _wpnonce: '<?php echo wp_create_nonce('wpimager_updatetitle' . $id) ?>'},
                });

            }


        </script>
        <?php
    }

}

if (!function_exists('wpimager_editor')) {

    /**
     * WPImager view
     */
    function wpimager_editor() {
        global $wpdb, $WPImagerEditor;
        $id = intval($_REQUEST['id']);
        $table_name = $wpdb->wpimager_db;
        $canvas = $wpdb->get_row($wpdb->prepare('SELECT * FROM ' . $table_name . ' WHERE id=%d', $id));
        $title = $canvas->title;
        $par = unserialize(base64_decode($canvas->settings));
        $nonce_log = wp_create_nonce('wpimager_log' . $id);
        $nonce = wp_create_nonce('wpimager' . $id);

        require_once 'coversizes.php';
        foreach (array('Social_Media', 'Banners') as $media) {
            $cover_sizes[$media] = $wpimager_sizes[$media];
        }
        ?>
        <div id="wpimager_debugger" style="position:fixed;top:0;left:0;color:orange;z-index: 12121212;display: none"></div>
        <div id="wpimager_err_screen_width" style="padding:8px 14px;margin:0;border-radius: 0;display: none;min-width: 860px" class="alert alert-danger">
            This image editor is best viewed on Desktop with screen width of least 860px.
        </div>
        <div id="wpimager_err_screen_rotate" style="padding:0px 0;display:none" class="">
            Screen width must be at least 860px. Rotate your screen and reload canvas.
            <div>
                <br>
                <button class="btn btn-danger" onclick="window.location.reload()">Reload Canvas</button>
            </div>
        </div>
        <div id="wpimager-editor" class="wrap" data-position-top="0">
            <?php if (defined('WPIMAGER_DEMO_USER')): ?>
                <div class="alertbar" id="demobar" style="width:310px;z-index:1000;top:0px;background: #337ab7">Demo mode. Some functions have been disabled.</div>                            
            <?php elseif (!defined('WPIMAGER_FRONTEND') && !$WPImagerEditor->cap_upload_files()): ?>
                <div class="alertbar" id="demobar" style="z-index:1000;top:0px;background: #d54e21">You have no permission to upload files. Cannot "Send Image to Media Library".</div>                            
            <?php endif; ?>

            <div id="showViewTools_wrap" class="pull-right onloadShow" style="padding:12px 10px 0 4px">
                <button class="btn btn-slate btn-sm" id="showViewTools"><span class="fa fa-chevron-down"></span></button>
            </div>
            <div id="canvas-side-menu" class="onloadShow pull-right">
                <div class="left_col scroll-view">
                    <!-- sidebar menu -->
                    <div id="sidebar-menu" class="main_menu_side hidden-print main_menu">
                        <div class="menu_section active">
                            <ul class="side-nav side-menu" style="">
                                <li class="active"><a id="appCanvas" href="#"><i class="fa fa-edit"></i> Canvas</a>
                                </li>
                                <li><a id="savecanvas" href="#" title="Save Canvas"><i class="fa fa-floppy-o"></i> Save</a>
                                </li>
        <!--								<li><a id="printimage" href="#" title="Generate Canvas Image"><i class="fa fa-image"></i> Image</a>
                                </li>-->
                                <li><a id="promptprintcanvas" href="#" title="Send Image to Media Library"><i class="fa fa-send"></i> Media</a>
                                </li>
                                <li><a id="downloadPNG" title="Download canvas image" href="#"><i class="fa fa-image"></i> Download</a>
                                </li>																								
        <!--								<li><a id="downloadJPG" title="Download image as JPEG" href="#"><i class="fa fa-image"></i> JPEG</a>
                                                                </li>-->
                                <li><a id="appSettings" href="#"><i class="fa fa-cog"></i>Settings</a>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
            <a id="backtowp" href="<?php echo esc_url(admin_url('admin.php')) ?>?page=wpimager_dashboard"><span id="arrBacktoWP" class="fa fa-arrow-left"></span> <span id="txtBacktoWP" class="fa fa-wordpress"></span></a>
            <div id="pagetitle" class="title onloadShow"><?php echo esc_html($title) ?>
            </div>
            <div id="backtocanvas-wrap"><button id="backtocanvas" class="btn btn-slate btn-xs"><i class="fa fa-chevron-up"></i>  Back to Canvas</button></div>
            <div id="toolViewConsole" class="cvssegment clearfix">
                <div class="pull-right" style="padding-right:20px">
                    <button type="button" class="close" onclick="jQuery('#toolViewConsole').slideUp();
                            return false;"><span>&times;</span></button>                            
                </div>
                <div class="col text-right" style="margin:0 48px;">
                    <div id="toolViewSlides_Section" style="display: inline-block">
                        Slidebox &bull; 
                        <button id="toolViewSlides_Max" class="btn btn-slate btn-xs">
                            Maximize
                        </button>
                        <button id="toolViewSlides_Min" class="btn btn-slate btn-xs">
                            Minimize
                        </button>
                        <button id="toolViewSlides_Hide" class="btn btn-slate btn-xs">
                            Hide
                        </button>
                    </div>
                    &nbsp;&nbsp;&nbsp; Toolbox &bull; <button id="toolBoxPosition_Right2" class="btn btn-slate btn-xs">
                        Dock
                    </button>
                    <button id="toolBoxPosition_Left2" class="btn btn-slate btn-xs hidden">
                        Dock Left
                    </button>
                    <button id="toolBoxPosition_Float2" class="btn btn-slate btn-xs">
                        Float
                    </button>
                    <button id="toolBoxPosition_Hide" class="btn btn-slate btn-xs">
                        Hide
                    </button>
                </div>
            </div>
            <div id="loader_wrapper" style="padding:200px 0" class="text-center onloadHide">
                <div class="loader onloadHide"></div>
            </div>

            <div id="cvsbox" class="onloadShow">               

                <div id="progressWrap">
                    <!-- send to Media Library progress bar -->
                    <div id="printProgressWrap" class="progress-uploading">
                        <button onclick="jQuery('#printProgressWrap').hide();" class="close ask-show start-hide error-show done-hide pull-right"><span class="fa fa-times" style="color:#aaa"></span></button>
                        <div id="printProgressPrompt" class="ask-show start-hide error-hide done-hide" style="padding:10px 0">
                            <span class='fa fa-send'></span>  Send image to WordPress Media Library.
                        </div>
                        <div class="ask-show start-hide error-hide done-hide" style="padding:0 0 6px">
                            <button id="printcanvas_jpeg" class="btn btn-sm btn-default" style="margin:4px 0;width:86px">JPEG</button>
                            <button id="printcanvas_png" class="btn btn-sm btn-primary" style="margin:4px 0;width:86px">PNG</button>
                        </div>
                        <div id="printProgressStart" class="ask-hide start-show error-hide done-hide">
                            <span class='fa fa-cog spin-custom'></span> Sending Canvas to Media Library.
                        </div>
                        <div id="printProgressNG" class="ask-hide start-hide error-show done-hide">
                            <span class='fa fa-exclamation-triangle'></span> <span id="printErrorMsg">Error Message.</span>
                        </div>
                        <div id="printProgressOK" class="ask-hide start-hide error-hide done-show">
                            <span class='fa fa-check'></span> Canvas Sent to Media Library. <button class="btn btn-sm btn-default" onclick="jQuery('#addImageMediaLayer').click();">View Media Library</button>
                        </div>
                        <div id="printProgressOuter" class="progress progress-striped active ask-hide start-show error-hide done-hide">
                            <div id="printProgressBar" class="progress-bar progress-bar-success" style="width: 0%"></div>                         
                        </div>       
                        <button class="btn btn-xs btn-danger ask-hide start-show error-hide done-hide" id="xhr-abort-print">Cancel</button>
                        <button class="btn btn-xs btn-danger ask-hide start-hide error-show done-hide" id="xhr-close-print">Close</button>
                    </div>
                    <!-- download progress bar -->
                    <div id="downloadProgressWrap" class="progress-uploading">
                        <div id="downloadProgressStart" class="start-show error-hide done-hide">
                            <span class='fa fa-cog spin-custom'></span> Preparing to Download Image.
                        </div>
                        <div id="downloadProgressNG" class="start-hide error-show done-hide">
                            <span class='fa fa-exclamation-triangle'></span> <span id="downloadErrorMsg">Error Message.</span>
                        </div>
                        <div id="downloadProgressOK" class="start-hide error-hide done-show">
                            <span class='fa fa-download'></span> Downloading Image...
                        </div>
                        <div id="downloadProgressOuter" class="progress progress-striped active start-show error-hide done-hide">
                            <div id="downloadProgressBar" class="progress-bar progress-bar-success" style="width: 0%"></div>                         
                        </div>       
                        <button class="btn btn-xs btn-danger start-show error-hide done-hide" id="xhr-abort-download">Cancel</button>
                        <button class="btn btn-xs btn-danger start-hide error-show done-hide" id="xhr-close-download">Close</button>
                    </div>
                </div><!-- #progressWrap -->
                <div class="console_task_box" id="alertbar"></div>                

                <div id="wpimager_addslide" class="addslide_show outputconsole_task">			
                    <div id="wpimager_addslide_mainmenu" class="addslide_show addtemplate_blank_show">
                        <div id="cardcmd-cover" class="col-md-4 addslide_show addtemplate_blank_show">
                            <div class="wpimager-card">
                                <div class="thumbnail-wrap">												
                                    <div class="canvas-type"><span class="fa fa-square-o stretch"></span> &nbsp;Covers</div>
                                    <div class="canvas-subtitle">Facebook, Twitter, Google+, Banners, etc.</div>
                                    <div class="canvas-action">
                                        <button id="cmdCover" class="btn btn-sm btn-default button-main">
                                            Covers
                                        </button>									
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="cardcmd-custom" class="col-md-4 addslide_show addtemplate_blank_show">
                            <div class="wpimager-card">
                                <div class="thumbnail-wrap">
                                    <div class="canvas-type"><span class="fa fa-cog"></span> Custom</div>
                                    <div class="canvas-subtitle">Create slide with custom slide dimension.</div>
                                    <div class="canvas-action">
                                        <button id="cmdCustom" class="btn btn-sm btn-default button-main">
                                            Custom
                                        </button>									
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="cardcmd-media" class="col-md-4 addslide_show addtemplate_blank_show">
                            <div class="wpimager-card">
                                <div class="thumbnail-wrap">
                                    <div class="canvas-type"><span class="dashicons dashicons-admin-media" style="font-size:14px;height: auto;width:auto"></span> Media</div>
                                    <div class="canvas-subtitle">Select an image from WordPress Media Library.</div>
                                </div>
                            </div>
                        </div>
                        <div style="clear:both"></div>
                    </div><!-- #wpimager_addslide_mainmenu -->
                    <div id="wpimager_addslide_social" class="wpimager_addslide create-panel">
                        <?php foreach ($cover_sizes as $cover_media => $cover_media_sizes): ?>
                            <?php $cover_media = str_replace('+', '', $cover_media); ?>
                            <button id="btn-media-<?php echo $cover_media ?>" class="btn-media-select btn btn-sm btn-default button-main" data-media="<?php echo $cover_media ?>">
                                <?php echo str_replace('_', ' ', $cover_media) ?>
                            </button>									
                        <?php endforeach; ?>

                        <div id="addslide_submode_select" style="display:none">
                            <?php foreach ($cover_sizes as $cover_media => $cover_media_sizes): ?>
                                <?php $cover_media = str_replace('+', '', $cover_media); ?>
                                <div id="section-<?php echo $cover_media ?>" class="section section-covers section-all">
                                    <div style="margin:20px 0 16px">
                                        <?php foreach ($cover_media_sizes as $cover_group => $cover_size): ?>
                                            <a href="#" onclick="return WPImager.addSlideCoverPreview(this, <?php echo $cover_size['w'] ?>, <?php echo $cover_size['h'] ?>, '<?php // echo $cover_media ?><?php echo $cover_group ?>');">                
                                                <div class="selbanner" data-width="<?php echo $cover_size['w'] ?>" data-height="<?php echo $cover_size['h'] ?>" data-title="<?php // echo $cover_media ?><?php echo $cover_group ?>">
                                                    <div><?php echo $cover_group ?></div>
                                                    <div><strong><?php echo $cover_size['w'] ?> x <?php echo $cover_size['h'] ?></strong></div>
                                                </div>
                                            </a>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                            <?php endforeach; ?>

                            <div id="addslide_previewsize" class="text-center" style="display:none">
                                <h3 id="dimension_name" class="text-center">Default</h3>
                                Preview &bull; <span id="label_previewsize"></span> px
                                <div class="addslide_show" style="background-color:transparent;padding:16px 0 0;">
                                    <button type="button" class="button button-primary" onclick="WPImager.slideCreateCover();">Create Canvas Slide</button>
                                </div>				
                                <div id="dimenso">800x500</div>
                            </div>
                        </div>	
                        <div style="clear:both"></div>
                    </div><!-- #wpimager_addslide_social -->
                    <div id="wpimager_addslide_custom" class="wpimager_addslide create-panel">
                        <div class="sub-title"	>
                            <div class="selbanner" style="padding:0px 0px 10px;margin: 20px 4px 20px">
                                <div style="margin: 20px 0 20px;padding: 0 180px">
                                    <span style="font-size:40px;" class="fa fa-cog"></span>
                                </div>
                                Custom Size
                                <div style="background-color:#434343;padding:10px;margin:10px 0;">
                                    <input id="custom_canvas_width" value=""/> x <input id="custom_canvas_height" value=""/> px
                                </div>
                                <div class="addslide_show" style="padding:0">
                                    <button type="button" class="button button-primary" onclick="WPImager.slideCreateCustom();">Create Canvas Slide</button>
                                </div>
                            </div>
                        </div>
                        <ul id="toolCustomSlideSelector" class="nav-slide hidden">
                        </ul>                        
                        <div id="custom_dimenso">Preview</div>

                    </div><!-- #wpimager_addslide_component -->
                    <div id="paste_screen_panel" style="display: none" class="create-panel">										
                        <div id="" class="text-center">
                            <h3 id="" class="text-center">Print Screen</h3>
                            <span id="label_pastescreen-size"></span>
                            <div id="" style="background-color:transparent;padding:16px 0;">
                                <button type="button" class="button button-primary" onclick="WPImager.createSlideUploadScreen();">Create Canvas</button>
                            </div>				
                            <img id="imgPasteScreen" src="" style="max-width:100%;">
                            <img id="imgPasteScreen2" src="" style="display:none">
                        </div>
                    </div><!-- #paste_screen_panel -->
                    <div class="modal" id="pasteProgressDialog" tabindex="-1" role="dialog" aria-labelledby="pasteProgressDialog">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">          
                                <div class="modal-body">
                                    <!-- Paste Image upload progress bar -->
                                    <div id="" class="progress-uploading">
                                        <div id="pasteProgressStart" class="start-show error-hide done-hide">
                                            <span class='fa fa-cog spin-custom'></span> Uploading Screen ...
                                        </div>
                                        <div id="pasteProgressNG" class="start-hide error-show done-hide">
                                            <span class='fa fa-exclamation-triangle'></span> <span id="pasteErrorMsg">Error Message.</span>
                                        </div>
                                        <div id="pasteProgressOK" class="start-hide error-hide done-show">
                                            <span class='fa fa-check'></span> Creating canvas with uploaded image.
                                        </div>
                                        <div id="pasteProgressOuter" class="progress progress-striped active start-show error-hide done-show">
                                            <div id="pasteProgressBar" class="progress-bar progress-bar-success" style="width: 0%"></div>                         
                                        </div>       
                                        <button class="btn btn-sm btn-danger start-show error-hide done-hide" id="xhr-abort-paste">Cancel</button>	
                                        <button class="btn btn-sm btn-danger start-hide error-show done-show" id="xhr-close-paste">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div><!-- #pasteProgressDialog -->
                </div><!-- #wpimager_addslide -->

                <div id="addOnConsole"></div>				
                <div id="wpimager_settings">
                    <div style="padding:10px 20px">
                        Canvas Title
                        <div style="padding:10px 0"><a href="#" id="btnEditTitle" class="btn btn-primary btn-sm" onclick="popEditTitle();
                                return false;">Edit Title</a>
                        </div>

                    </div>
                    <div style="padding:10px 20px">
                        Canvas Text Direction (LTR/RTL)
                        <br><span class="text-warning">Eg. English - (Left to Right), Arabic - (Right to Left)</span>
                        <div style="padding:10px 0">
                            <a id="textdir" class="btn btn-warning btn-sm" title="Text Direction" href="#">LTR</a>
                        </div>

                    </div>
                    <div style="padding:10px 20px">
                        Download Format
                        <br><span class="text-warning">PNG (recommended format) or JPEG</span>
                        <div style="padding:10px 0">
                            <a id="download_format" class="btn btn-default btn-sm" href="#"></a>
                        </div>
                        <div style="margin:6px 0 10px">
                            <input id="chkStfilename" style="vertical-align: top" type="checkbox" class="" value="1" name="chkStfilename"/> <label for="chkStfilename">Append slide title to file name</label>
                        </div>

                    </div>

                    <div id="zipCanvasConsole" class=" clearfix">
                        <!--				<div class="clearfix">
                                                                <button type="button" class="close" onclick="jQuery('#zipCanvasConsole').slideUp();
                                                                                return false;"><span>&times;</span></button>                            
                                                        </div>-->
                        <div class="col-md-12">
                            Export Canvas data to a zip file
                            <br><span class="text-warning">Import Canvas on other PC running WPImager</span>
                            <div style="padding:8px 0 32px">
                                <a href="#" class="btn btn-primary btn-sm" id="exportcanvas" onclick="return false;"><span class="fa fa-cloud-download"></span> Download as Zip&nbsp;&nbsp;&nbsp;</a>
                            </div>
                            Preview Export Images
                            <div class="text-warning">Any cropped or resized images will be exported in full size. Please check for any sensitive information on the images.</div>
                            &raquo; <a id="exportimagepreview" class="btn btn-xs btn-link">Preview export images</a>
                            <div id="exportimagespreviewpanel"></div>

                        </div>
                    </div>

                </div><!-- #wpimager_settings -->

                <div id="canvas_bottom" class="clearfix">
                    <iframe id="wpimager_iframe" src="" style="" scrolling="no" frameborder="0"></iframe>
                    <div id="toolBox" class="ui-widget-content onloadShow">
                        <div id="toolboxHandle">
                            <a href="#" id="toolBoxPosition_Float" onclick="return false;"><i class="fa fa-external-link-square" aria-hidden="true"></i></a>
                            <a href="#" id="toolBoxPosition_Left" onclick="return false;"><i class="fa fa-caret-square-o-left" aria-hidden="true"></i></a>
                            <a href="#" id="toolBoxPosition_Right" onclick="return false;"><i class="fa fa-caret-square-o-right" aria-hidden="true"></i></a>
                            <span id="toolboxTitle">Toolbox</span>
                        </div>
                        <div id="toolboxMainMenu">						
                            <ul id="toolboxMainButtons" class="nav nav-pills">
                                <li><a id="addSetTextLayer" href="#">Text</a></li>
                                <li><a id="addImageMediaLayer" href="#">Image</a></li>
                                <li><a id="showAddBackground" href="#">Background</a></li>
                                <li><a href="#" id="showAddedCOM"><span class="fa fa-cube"></span></a></li>
                                <li><a id="addFontawesome" href="#"><span class="fa fa-font-awesome"></span></a></li>
                                <li><a id="addCurveText" href="#">Curved Text</a></li>								
                                <li><a id="browseShapeLayer" href="#">Draw Shape</a></li>
                                <li><a id="addLineLayer" href="#">Straight  Line</a></li>
                                <li><a id="browsePolygonLayer" href="#">Polygon</a></li>
                                <!--                            <li><a id="browseBackgroundLayer" href="#">Background</a></li>-->
                                <!--								<li><a id="showAddImage" href="#">Upload</a></li>-->
                                <li>
                                    <a href="#" id="browseCanvasControls">Slide Size</a>
                                </li>
                                <li class="active"><a id="viewLayers" href="#">Layers</a></li>
                            </ul>                    
                        </div>                    
                        <div id="toolboxLayersSortableWrap" class="toolboxLayersCom">
                            <div id="toolboxLayersSortable">
                            </div>
                        </div>                               
                        <div id="toolboxLayersMenu" class="toolboxLayersCom">
                            <button class="btn btn-default btn-xs pull-right" title="Trash Layer" id="cmdTrashLayer"><span class="fa fa-trash"></span></button>
                            <button class="btn btn-default btn-xs" title="Lock Layer" id="cmdLockLayer"><span class="fa fa-lock"></span></button>
                            <button class="btn btn-default btn-xs" title="Duplicate Layer" id="cmdDuplicateObject"><span class="fa fa-copy"></span></button>
                            <button class="btn btn-default btn-xs" title="Move Layer Up" id="cmdMoveUpLayer"><span class="fa fa-chevron-up"></span></button>
                            <button class="btn btn-default btn-xs" title="Move Layer Down" id="cmdMoveDownLayer"><span class="fa fa-chevron-down"></span></button>
                        </div>
                        <div id="toolboxLayerSortableWrap" class="toolboxLayersCom">
                            <div id="toolboxLayerSortable">
                            </div>
                        </div>                               
                        <div id="toolboxLayerAddText" class="toolboxLayersCom">
                            <p>
                            <input id="fontfamily2" type="text" />
                            </p>
                            <p>
                            <nobr>
                                Size: <input value="36" id="fontsize2">
                                <input id="fontcolor2" value="#ffffff"/>
                            </nobr>
                            </p>
                            <p>
                                <button class="addtext-border-select btn btn-warning btn-xs" data-border="none">No border</button>
                                <button class="addtext-border-select btn btn-xs btn-slate" title="Add rectangle border" data-border="rectangle"><span class="fa fa-square-o stretch"></span></button>
                                <button class="addtext-border-select btn btn-xs btn-slate" title="Add square border" data-border="square"><span class="fa fa-square-o"></span></button>
                                <button class="addtext-border-select btn btn-xs btn-slate" title="Add circle border" data-border="circle"><span class="fa fa-circle-thin"></span></button>
                                <button class="addtext-border-select btn btn-xs btn-slate" title="Add ellipse border" data-border="ellipse"><span class="fa fa-circle-thin stretch"></span></button>
        <!--								<textarea type="text" id="input2" placeholder="Write your message here"></textarea>-->
                            </p>            
                            <a class="btn btn-danger btn-sm" id="addTextLayer" href="#">Add Text</a>
                        </div>
                        <div id="toolboxLayerAddBackground" class="toolboxLayersCom">
                            <div id="" style="background:#222;padding:6px 0;margin-bottom:10px">Add Background Layer</div>
                            <nobr>
                                Base Color: <input id="basecolor" value="#000000"/>
                            </nobr>
                            <div style="margin:14px">
                            <a class="btn btn-danger btn-sm" id="addBackground" href="#">Add Background</a>
                            </div>
                            <div style="background:#222;padding:6px 0;margin:10px 0">Checkered Canvas Background</div>
                            <button id="cmd-canvas-pattern-light" class="canvas-pattern-select btn btn-darkslate" data-pattern="light">Light</button>
                            &nbsp;<button id="cmd-canvas-pattern-dark" class="canvas-pattern-select btn btn-slate" data-pattern="dark">Dark</button>
                        </div>
                        <div id="toolboxLayerFontawesome" class="toolboxLayersCom">
                            <span id="iconpicker2"></span>
                        </div>
                        <div id="toolBrowseBackground" class="toolboxLayersCom">
                            <div id="contentBrowseBackground" class="clearfix">                                
                            </div>
                        </div>
                        <div id="toolBrowseShape" class="toolboxLayersCom">
                            <div id="contentBrowseDrawShape" class="clearfix">                                
                                <a class="btn btn-primary btn-sm btn-block" id="drawShapeLayer" href="#">Draw Custom Shape</a>
                                <p class="text-info">Or select a shape below:</p>
                                <div id="contentBrowseShape" class="clearfix">                                
                                </div>
                            </div>
                            <div id="contentDrawShape" class="clearfix">                                
                                <p>Start Drawing on the Canvas
                                </p>
                                <button class="btn btn-danger btn-sm" title="Cancel Drawing Shape" id="shape_mode_drawstop2">Cancel</button>    
                            </div>
                        </div>
                        <div id="toolboxLayerDrawLine" class="toolboxLayersCom">
                            <div id="" class="clearfix">                                
                                <div style="background:#222;padding:20px 0">
                                    <p>Start Drawing Line on the Canvas</p>
                                    <button class="btn btn-danger btn-sm" title="Cancel Drawing Line" id="shape_line_drawstop">Cancel</button>   
                                </div>
                            </div>
                        </div>
                        <div id="toolboxCurvedText" class="toolboxLayersCom">
                            <div id="" class="clearfix">                                
                                <div style="background:#222;padding:8px 0">
                                    <div>Text</div>
                                    <input id="curvedText" value="" placeholder="" class="" style="width:80%;margin: 10px 0 16px">
                                    <button class="btn btn-danger btn-sm" title="" id="addCurvedTextLayer">Add Curved Text</button>    
                                </div>
                            </div>
                        </div>
                        <div id="toolboxAddedCOM" class="toolboxLayersCom" style="overflow-y:auto;overflow-x: hidden;padding-top:0">
                            <div id="" class="clearfix">                                
                                <div style="background:#222;padding:4px 10px 4px">
                                    <div id="curCOMinfo">

                                    </div>
                                    <div class="hasCOMshow hasNoCOMhide">
                                        <div>Click component to add to slide
                                        </div>
                                    </div>
                                    <div class="hasNoCOMshow hasCOMhide">
                                        <p>No component slides created</p>										
                                    </div>
                                </div>
                                <div id="listAddedCOM" style="padding:4px 0;height: auto">
                                </div>
                                <div id="listInvalidComWarn" style="padding:4px 0;clear:both">
                                    <i class="small">(Max of 3 tiers permitted)</i>
                                </div>
                                <div id="listInvalidCOM" style="padding:4px 0;height: auto">
                                </div>
                            </div>
                        </div>
                        <div id="toolBrowsePolygon" class="toolboxLayersCom">
        <!--                            <p class="text-info">Select a polygon below:</p>-->
                            <div id="contentBrowsePolygon" class="clearfix">                                
                            </div>
                            <div id="contentDrawPolygon" class="clearfix">                                
                                <p>
                                <div class="btn-group" data-toggle="buttons">
                                    <label id="txt_polyspoke_off2" class="btn btn-sm btn-default" title="Regular Polygon">
                                        <input id="polyspoke_off2" class="" type="radio" name="polyspoke" value="0"> <span class="fa fi-poly5-yellow"></span>&nbsp;</label>
                                    <label id="txt_polyspoke_on2" class="btn btn-sm btn-default active" title="Star">
                                        <input id="polyspoke_on2" class="" type="radio" name="polyspoke" value="1" checked><span class="fa fi-poly5-star-yellow"></span>&nbsp;</label>
                                </div> &nbsp;
                                <span>Sides:<input id="polygonSides2"></span>
                                </p>
                                <button class="btn btn-danger btn-sm" title="Add Polygon" id="addPolygonLayer">Add Polygon</button>    
                            </div>
                        </div>     

                        <div id="toolCanvas" class="toolboxLayersCom">
                            <div id="" style="background:#222;padding:6px 0;margin-bottom:10px">Set Slide Size
                            </div>
        <!--							<p>
                            <div class="btn-group" data-toggle="buttons"> 
                                    <button class="btn btn-default btn-xs" id="toolBrowseSocialBtn">Social</button>
                                    <button class="btn btn-default btn-xs" id="toolBrowseStdBannersBtn">Banners</button>
                                    <button class="btn btn-default btn-xs" id="toolBrowseCustomBtn">Custom</button>
                            </div>
                            </p>-->
                            <div id="toolBrowseCustom">
                                <div style="height:36px">
                                    <span> &nbsp;Width: <input value="800" id="canvasWidth"></span>
                                </div>
                                <div style="height:36px">
                                    <span>Height: <input value="500" id="canvasHeight"></span>
                                </div>
                                <div>
                                    <div style="margin:6px 0 16px" class="hidden">
                                        <input id="chkScaleLayers2Canvas" style="vertical-align: top" type="checkbox" class="" value="1" name="chkScaleLayers2Canvas"/> <label for="chkScaleLayers2Canvas">Resize Objects on Canvas</label>
                                    </div>
                                    <div id="warnScaleLayers2Canvas" style="color:#999;margin:0 16px 20px" class="text-left">Objects with square, circle or polygon shape will resize with equal width and height. (not according to canvas resize)</div>
                                    <button id="applyCustomCanvasSize" class="btn btn-danger btn-sm">Apply</button>
                                    <button id="closeCustomCanvasSize" class="btn btn-default btn-sm">Done</button>
                                    <div id="warnCustomCanvasSize" class="text-left" style="color:#777;margin:16px 16px">Note: Changing canvas size of a component can affect the appearance of slides it is used in.</div>
                                </div>
                                <div class="hidden">
                                    &nbsp;&nbsp;Default Font-Color: <input id="canvasforecolor" value="#ffffff"/>
                                </div>
                                <div class="hidden">
                                    Background: <input id="canvascolor" value="#000000"/>
                                </div>
                            </div>                               							                          
                        </div>        
                    </div>  
                    <div id="editLayerNote">
                        <input type="text" id="txtEditLayerNote" class="form-control" value=""/>
                        <button id="cmdEditLayerNote" class="btn btn-primary btn-xs" title="">
                            OK
                        </button>
                        <button id="cancelEditLayerNote" class="btn btn-default btn-xs" title="">
                            Cancel
                        </button>
                    </div>
                    <div id="editActionNote" class="text-left">
                        <input type="text" id="txtEditActionNote" class="form-control" value=""/>
                        <div class="text-center">
                            <button id="cmdEditActionNote" class="btn btn-primary btn-xs" style="padding:0 4px;width:48px;font-size:0.8em;line-height: 14px">
                                OK
                            </button>
                            <button id="cancelEditActionNote" class="btn btn-default btn-xs" style="padding:0 4px;font-size:0.8em;line-height: 14px">
                                Cancel
                            </button>
                        </div>
                    </div>

                    <div id="cvswrap">                                 
                        <div id="canvas_slides">
                            <div id="toolSlidesHandle">
                                <a href="#" id="toolViewSlides_Min2" onclick="return false;"><i id="toolViewSlides_Min2_fa" class="fa fa-window-minimize" aria-hidden="true"></i></a>
                                <span>Slides</span>
                            </div>
                            <div id="toolSlidesMainMenu" class="">
                                <button class="btn btn-default btn-xs pull-right" title="Delete" id="cmdTrashSlide"><span class="fa fa-trash"></span></button>

                                <button class="btn btn-success btn-xs" title="Add Slide" id="cmdAddSlide"><span class="fa fa-plus"></span></button>
                                <button class="btn btn-default btn-xs" title="Duplicate" id="cmdDupSlide"><span class="fa fa-copy"></span></button>
                                <button class="btn btn-default btn-xs pull-right" title="Restore" id="cmdPopupRestoreSlides"><span class="fa fa-undo"></span></button>
        <!--                                <button class="btn btn-danger btn-xs" title="Record Overview" id="cmdActionRecord"><span class="fa fa-circle"></span> Overview</button>-->
        <!--                                <button class="btn btn-default btn-xs onloadShow" title="" id="showOutputVideo"><span class="fa fa-play-circle"></span> Output</button>-->
        <!--                            <button class="btn btn-default btn-xs" title="Duplicate Layer" id="cmdDuplicateAction"><span class="fa fa-copy"></span></button>
                                <button class="btn btn-default btn-xs" title="Move Layer Up" id="cmdMoveUpAction"><span class="fa fa-chevron-up"></span></button>
                                <button class="btn btn-default btn-xs" title="Move Layer Down" id="cmdMoveDownAction"><span class="fa fa-chevron-down"></span></button>-->
                            </div>
                            <div class="toolslideItem" id="toolViewSlides_Max2"><div class="square bg"><div class="tool-slide-number" title="Maximize"><span id="toolViewSlides_Max2_fa" class="fa fa-window-maximize"></span></div></div></div>						
                            <div class="toolslideItem" id="cmdAddSlide2"><div class="square bg"><div class="tool-slide-number" title="Add Slide"><span class="fa fa-plus"></span></div></div></div>
                            <!--                            <div id="toolSlideAndCom" style="max-height:150px;overflow-y: auto;overflow-x: hidden">-->
                            <div id="toolSlidesSortableWrap" class="">
                                <div id="toolSlidesSortable">
                                </div>
                            </div>                               
                            <div id="toolComHandle" class="text-center">
        <!--                                <button class="btn btn-default btn-xs" title="I/O Component Slide" id="cmdPopupSlideIO"><span class="fa fa-code"></span></button>-->
                                <a href="#" id="cmdPopupSlideIO" class="pull-right" style="color:#dddddd;" onclick="return false;"><i class="fa fa-code" aria-hidden="true"></i></a>
                                Components</div>
                            <div id="toolComMainMenu" class="">
                                <button class="btn btn-default btn-xs pull-right" title="Delete" id="cmdTrashComponent"><span class="fa fa-trash"></span></button>

                                <button class="btn btn-success btn-xs" title="Add Component" id="cmdAddComponent"><span class="fa fa-plus"></span></button>
                                <button class="btn btn-default btn-xs" title="Duplicate Component" id="cmdDupComponent"><span class="fa fa-copy"></span></button>
                                <button class="btn btn-default btn-xs pull-right" title="Restore" id="cmdPopupRestoreComponents"><span class="fa fa-undo"></span></button>
                            </div>

                            <div id="toolComSortableWrap" class="">
                                <div id="toolComSortable">
                                </div>
                            </div>                               
                            <!--                            </div>                               -->
                        </div>                    
                        <div id="cvsbox_menu" class="onloadShow">
                            <div id="canvasmenu" class="onloadShow gray">
                                <div id="resizeconsoleconsole_task" class="taskconsole">   
                                    <div class="console_task_box">
                                        <button id="showResizeCanvasConsole" class="btn btn-link btn-xs btn-tab active" title="">
                                            Slide Size
                                        </button>                              
                                    </div>
                                </div>
                                <div id="nilconsole_task" class="taskconsole">   
                                    <div class="console_task_box">
                                        <button id="showNilConsole" class="btn btn-link btn-xs btn-tab active" title="">
                                            Slide#
                                        </button>                              
                                    </div>
                                </div>
                                <div id="txtconsole_task" class="taskconsole">   
                                    <div class="console_task_box">
                                        <button id="showCOMConsole" class="btn btn-link btn-xs btn-tab taskconsole_COM" title="">
                                            <span class="fa fa-cube"></span> Component
                                        </button>                      
                                        <button id="showLineConsole" class="btn btn-link btn-xs btn-tab" title="Edit Line">
                                            Straight Line
                                        </button>                           
                                        <button id="showShapeEditConsole" class="btn btn-link btn-xs btn-tab" title="">
                                            Draw shape
                                        </button>                           
                                        <button id="showPolygonConsole" class="btn btn-link btn-xs btn-tab" title="">
                                            <span class="fa fa-star-o"></span> Polygon
                                        </button>                       
                                        <button id="showTextToolbar" class="btn btn-link btn-xs btn-tab" title="">
                                            <span class="fa fa-text-height"></span> Text
                                        </button>                       
                                        <button id="showCurveTextConsole" class="btn btn-link btn-xs btn-tab" title="">
                                            Curve Text
                                        </button>                           
                                        <button id="showTextOutlineConsole" class="btn btn-link btn-xs btn-tab" title="Text Border">
                                            Stroke
                                        </button>                           
                                        <button id="showTextCircularConsole" class="btn btn-link btn-xs btn-tab" title="">
                                            <span class="fa fa-circle-o-notch"></span> Circular
                                        </button>                       
                                        <button id="showTextShadowConsole" class="btn btn-link btn-xs btn-tab" title="Text Shadow">
                                            <span class="fa fa-font"></span> Shadow
                                        </button>                                                                                                                   
                                        <button id="showTextPositionConsole" class="btn btn-link btn-xs btn-tab" title="">
                                            <span class="fa fa-dot-circle-o"></span> Position
                                        </button>                      
                                        <button id="showTextBgControls" class="btn btn-link btn-xs btn-tab">
                                            <span class="fa fa-font"></span> Fill
                                        </button>                                                                                                                   
                                        <button id="showTextBorderConsole" class="btn btn-link btn-xs btn-tab taskconsole_QR" title="">
                                            <span class="fa fa-square-o"></span> Border
                                        </button>                           
                                        <button id="showTextLineStyle" class="btn btn-link btn-xs btn-tab">
                                            <span class="fa fa-ellipsis-h"></span> Style
                                        </button>                                                                                                                   
                                        <button id="showTextShadowFillConsole" class="btn btn-link btn-xs btn-tab taskconsole_QR" title="Fill Shadow">
                                            <span class="fa fa-square"></span> Shadow
                                        </button>                                                                                                                   
                                        <button id="showTextSkewConsole" class="btn btn-link btn-xs btn-tab" title="Transform Image">
                                            <span class="fa fa-square-o stretch"></span> Transform
                                        </button>                                                                                                                   
                                        <button id="showTextRotateConsole" class="btn btn-link btn-xs btn-tab taskconsole_QR taskconsole_COM" title="">
                                            <span class="fa fa-rotate-right"></span> Rotate
                                        </button>                       
                                        <!--                        <button id="showTextCropConsole" class="btn btn-link btn-xs" title="Crop Text">
                                                                                                <span class="fa fa-crop"></span> Crop
                                                                                        </button>                                                                                                                   -->
                                    </div>
                                </div>
                                <div id="panelToolbar" class="onloadShow">                    
                                    <div id="toolImage">
                                    </div>
                                    <div id="toolText">
                                        <div id="toolText_top">                                                         
                                        </div>
                                    </div>

                                </div>

                                <div id="imgconsole_task" class="taskconsole">                                
                                    <div class="console_task_box">
                                        <button id="showMainImageConsole" class="btn btn-link btn-xs btn-tab" title="Rotate Image">
                                            <span class="fa fa-image"></span> Image
                                        </button>
                                        <button id="showImageBorderConsole" class="btn btn-link btn-xs btn-tab" title="Image Border">
                                            <span class="fa fa-square-o"></span> Border
                                        </button>
                                        <button id="showCropImageConsole" class="btn btn-link btn-xs btn-tab" title="Crop Image">
                                            <span class="fa fa-crop"></span> Crop
                                        </button>                                                                                                                   
                                        <button id="showImageBlurConsole" class="btn btn-link btn-xs btn-tab" title="Blur Image">
                                            <span class="fa fa-tint"></span> Blur
                                        </button>                                                                                                                   
                                        <button id="showImageShadowConsole" class="btn btn-link btn-xs btn-tab" title="Image Shadow">
                                            <span class="fa fa-square"></span> Shadow
                                        </button>                                                                                                                   
                                        <button id="showSkewImageConsole" class="btn btn-link btn-xs btn-tab" title="Transform Image">
                                            <span class="fa fa-square-o stretch"></span> Transform
                                        </button>                                                                                                                   
                                        <button id="showRotateImageConsole" class="btn btn-link btn-xs btn-tab" title="Rotate Image">
                                            <span class="fa fa-rotate-right"></span> Rotate
                                        </button>
                                    </div>                
                                </div>                

                                <div id="postuploadconsole" class="cvsconsole">
                                    <button id="resetImageSize" class="btn btn-link btn-xs" title="Resize Image Size">
                                        <span class="fa fa-arrows-alt"></span> Resize to Original Size (<span id="label_imgsize_ori"></span>px)
                                    </button> &nbsp;
                                    <button id="hidepostuploadconsole" class="btn btn-link btn-xs" title="">
                                        <span class="fa fa-times"></span> Leave it
                                    </button>                    
                                </div>
                                <div id="cropimageconsole" class="cvsconsole">
                                    <div class="">
                                        <span>Crop Width:<input id="cropImageWidth"></span>
                                        <span>Height:<input id="cropImageHeight"></span>                    
                                        <button id="cropImage" class="btn btn-danger btn-sm" title="">
                                            <span class="fa fa-crop"></span> Crop
                                        </button>
                                        <button id="cancelCropImage" class="btn btn-default btn-sm" title="">
                                            Cancel
                                        </button>
                                        <button id="cropImageDownload" class="btn btn-link btn-sm" title="">
                                            <span class="fa fa-download"></span> Download
                                        </button>										
                                        <button class="btn btn-link btn-xs" id="resetCropImage" title="Reset to Zero"><span class="fa fa-refresh"></span> Reset</button>
                                    </div>
                                </div>                           
                                <div id="skewimageconsole" class="cvsconsole">
                                    <div class="">
                                        <span class="shape_parallel_show shape_trapezoid_hide">Direction:</span>
                                        <span class="shape_parallel_hide shape_trapezoid_show"> Skew direction:</span>
                                        <div class="btn-group shape_parallel_show shape_trapezoid_show">
                                            <button id="skewVImage" class="btn btn-slate btn-sm"><span class="fa fa-arrows-v text-primary" style="width:16px"></span></button>
                                            <button id="skewHImage" class="btn btn-slate btn-sm"><span class="fa fa-arrows-h"></span>&nbsp;</button>
                                        </div>
                                        <span id="labelSkewPImage" class="shape_parallel_show shape_trapezoid_hide">Skew</span>
                                        <span id="labelSkewAImage" class="shape_parallel_hide shape_trapezoid_show">Top</span>:<input id="skewAImage">
                                        <span id="labelSkewBImage" class="shape_parallel_hide shape_trapezoid_show">Bottom</span><span class="shape_parallel_hide shape_trapezoid_show">: <input id="skewBImage"></span>
                                        <button id="skewFlipImage" class="btn btn-slate btn-xs">Flip</button>
                                        <span id="spanimgskewsym" class="shape_parallel_hide shape_trapezoid_show"><input id="imgskewsym" type="checkbox" name="imgskewsym" value="1" checked/> <label for="imgskewsym">Symmetrical</label></span>
                                    </div>
                                </div>                           
                                <div id="toolText_Fontcolor_controls" class="cvsconsole">                           
                                    <div id="fontcoloroption-wrap">
                                        <div class="btn-group">
                                            <button id="fontcoloroption-color" class="btn btn-sm btn-darkslate">&nbsp;&nbsp;Color&nbsp;&nbsp;</button>
                                            <button id="fontcoloroption-gradient" class="btn btn-sm btn-darkslate">Gradient</button>
                                        </div>
                                    </div>
                                    <div id="fontwrap-color" class="fontcolor-control">
                                        <input id="fontcolor3" value="#ffffff"/>   
                                    </div>
                                    <div id="fontwrap-gradient" class="fontcolor-control">
                                        <div class="fontgradient"></div>
                                    </div>
                                    <div id="fontwrap-rotation" class="fontcolor-control">
                                        &nbsp;Rotation:<input id="fontgradrotation">
                                    </div>
                                    <div id="fontwrap-gradline" class="fontcolor-control">
                                        &nbsp;&nbsp;&nbsp;<button id="fontgradline" class="btn btn-sm btn-darkslate">Whole Text</button>
                                    </div>
                                </div>								
                                <div id="toolText_Background_controls" class="cvsconsole">                           
                                    <div id="backcoloroption-wrap">
                                        <select id="backcoloroption">
                                            <option value="none">No Fill</option>
                                            <option value="color">Color</option>
                                            <option value="linear">Gradient</option>
                                            <option value="radial">Radial</option>
                                            <option value="stripes">Stripes</option>
                                            <option value="stripes-discrete">Stripes (Discrete)</option>
                                            <option value="stripes-radial">Stripes (Radial)</option>
                                        </select>
                                    </div>
                                    <div id="backwrap-color">
                                        Backcolor:<input id="backcolor" value="#ffffff"/>   
                                    </div>
                                    <div id="backwrap-gradient">
                                        <div class="gradient"></div>
                                    </div>
                                    <div id="backwrap-rotation">
                                        &nbsp;&nbsp;Rotation:<input id="backgradrotation">
                                    </div>
                                    <div id="backwrap-radialwidth"> Repeat 
                                        <select id="backradialWidth">
                                            <option value="10">10&deg;</option>
                                            <option value="20">20&deg;</option>
                                            <option value="30">30&deg;</option>
                                            <option value="40">40&deg;</option>
                                            <option value="60">60&deg;</option>
                                            <option value="90">90&deg;</option>
                                            <option value="120">120&deg;</option>
                                            <option value="180">180&deg;</option>
                                            <option value="360">360&deg;</option>
                                        </select>
                                    </div>
                                    <div id="backwrap-stripe-offset">
                                        &nbsp;&nbsp;Offset:<input id="backstripeOx">
                                    </div>
                                    <div id="backwrap-width">
                                        &nbsp;&nbsp;Width:<input id="backtilewidth">
                                    </div>
                                    <div id="backwrap-offset">
                                        &nbsp;&nbsp;Offset X:<input id="backradialOx">
                                        &nbsp;Y:<input id="backradialOy">
                                    </div>
                                    <div id="backwrap-radius">
                                        &nbsp;Radius:<input id="backradialRad">
                                    </div>
                                    <div id="backwrap-opacity" class="onloadHide">
                                        &nbsp;Opacity:<input id="alphaBack">                            
                                    </div>
                                </div>           
                                <div id="mainimageconsole" class="cvsconsole">
                                    <button id="cmdReplaceImage" class="btn btn-sm btn-darkslate" style="position:absolute;right:4px;">Replace Image</button>
                                    <div id="spanimagesize" style="line-height:32px"></div>
        <!--                    <span id="imageurl">
                                    </span>-->
                                </div>
                                <div id="rotateimageconsole" class="cvsconsole">
                                    <span>Rotate:<input id="rotateImage"></span>
                                    <button class="btn btn-link btn-xs" id="resetRotateImage" title="Reset to Zero"><span class="fa fa-refresh"></span> Reset</button>
                                </div>
                                <div id="borderimageconsole" class="cvsconsole">
                                    <span>Border:<input id="borderImage"></span> <input id="bordercolorImage" value="#ffffff"/>
                                    <span id="spanRadiusImage">Radius:<input id="radiusImage"></span>
                                    <button class="btn btn-link btn-xs" id="resetBorderImage" title="Reset to Zero"><span class="fa fa-refresh"></span> Reset</button>
                                    <!--                    <button id="hideBorderImageConsole" class="btn btn-primary btn-xs" title="">
                                                                                    OK
                                                                            </button>-->
                                    <input type="hidden" id="radiusImage_ori">
                                    <input type="hidden" id="borderImage_ori">                    
                                    <input type="hidden" id="bordercolorImage_ori">                    
                                </div>    
                                <div id="shadowimageconsole" class="cvsconsole">
                                    Shadow <span class="toggle"> 
                                        <i class="fa fa-toggle-on fa-2x active" id="shadowImageOn" style="display:none;"></i>
                                        <i class="fa fa-toggle-on fa-2x fa-rotate-180 inactive" id="shadowImageOff" ></i>
                                    </span> &nbsp;&nbsp;

                                    <span>Blur:<input id="shadowImage"></span> <input id="shadowcolorImage" value="#ffffff"/>
                                    <span>Offset X:<input id="shadowOxImage"></span>
                                    <span>Y:<input id="shadowOyImage"></span>
                                    <button class="btn btn-link btn-xs" id="resetShadowImage" title="Reset to Zero"><span class="fa fa-refresh"></span> Reset</button>
                                    <!--                    <button id="hideImageShadowConsole" class="btn btn-primary btn-xs" title="">
                                                                                    OK
                                                                            </button>-->
                                </div>                           
                                <div id="blurimageconsole" class="cvsconsole">
                                    <span>Blur:<input id="blurImage"></span>
                                    <button class="btn btn-link btn-xs" id="resetBlurImage" title="Reset to Zero"><span class="fa fa-refresh"></span> Reset</button>
                                    <!--                    <button id="hideBlurImageConsole" class="btn btn-primary btn-xs" title="">
                                                                                    OK
                                                                            </button>-->
                                </div>
                                <div id="resizecvsconsole" class="cvsconsole">
                                    Resize Canvas by setting the width and height manually or by dragging the corner / edges of the canvas. 
                                    <br><button id="closeCustomCanvasSize2" class="btn btn-link btn-xs">Done Resizing</button>
                                </div>                        
                                <div id="nilconsole" class="cvsconsole">
                                    Slide is empty
                                </div>                        
                                <div id="croptextconsole" class="cvsconsole">
                                    <button id="cropTextDownload" class="btn btn-default btn-sm" title="">
                                        <span class="fa fa-download"></span> Download
                                    </button>
                                    <button id="cropTextNewLayer" class="btn btn-danger btn-sm" title="">
                                        <span class="fa fa-crop"></span> Crop to New Image Layer
                                    </button>
                                    <button id="cancelTextCrop" class="btn btn-default btn-sm" title="">
                                        Cancel
                                    </button>
                                </div>          
                                <div id="skewtextconsole" class="cvsconsole">
                                    <div class="">
                                        Skew<span class="shape_parallel_hide shape_trapezoid_show"> direction:</span>
                                        <div class="btn-group shape_parallel_show shape_trapezoid_show">
                                            <button id="skewVText" class="btn btn-slate btn-sm"><span class="fa fa-arrows-v text-primary" style="width:16px"></span></button>
                                            <button id="skewHText" class="btn btn-slate btn-sm"><span class="fa fa-arrows-h"></span>&nbsp;</button>
                                        </div>
                                        <span id="labelSkewAText" class="shape_parallel_hide shape_trapezoid_show">Top</span>:<input id="skewAText">
                                        <span id="labelSkewBText" class="shape_parallel_hide shape_trapezoid_show">Bottom</span><span class="shape_parallel_hide shape_trapezoid_show">: <input id="skewBText"></span>
                                        <button id="skewFlipText" class="btn btn-slate btn-xs">Flip</button>
                                        <span id="spantxtskewsym" class="shape_parallel_hide shape_trapezoid_show"><input id="txtskewsym" type="checkbox" name="txtskewsym" value="1" checked/> <label for="txtskewsym">Symmetrical</label></span>
                                    </div>
                                </div>                           
                                <div id="texttoolbar" class="cvsconsole">
                                    <div class="btn-group" data-toggle="buttons"> 
                                        <label id="txt_align_left" class="btn btn-sm btn-default" title="Text Align Left">
                                            <input id="align_left" class="clearoffsetX" type="radio" name="align" value="left"> <span class="fa fa-align-left"></span>&nbsp;</label>
                                        <label id="txt_align_center" class="btn btn-sm btn-default active" title="Text Align Center">
                                            <input id="align_center" class="clearoffsetX" type="radio" name="align" value="center" checked><span class="fa fa-align-center"></span>&nbsp;</label>
                                        <label id="txt_align_right" class="btn btn-sm btn-default" title="Text Align Right">
                                            <input id="align_right" class="clearoffsetX" type="radio" name="align" value="right"><span class="fa fa-align-right"></span>&nbsp;</label>
                                    </div>
                                    <div class="btn-group" data-toggle="buttons"> 
                                        <label id="txt_valign_top" class="btn btn-sm btn-default" title="Text Align Top">
                                            <input id="valign_top" class="clearoffsetY" type="radio" name="valign" value="top"><span class="fa fi-valign-top"></span></label>
                                        <label id="txt_valign_middle" class="btn btn-sm btn-default active" title="Text Align Middle">     
                                            <input id="valign_middle" class="clearoffsetY" type="radio" name="valign" value="middle" checked><span class="fa fi-valign-middle"></span></label>
                                        <label id="txt_valign_bottom" class="btn btn-sm btn-default" title="Text Align Bottom">
                                            <input id="valign_bottom" class="clearoffsetY" type="radio" name="valign" value="bottom"><span class="fa fi-valign-bottom"></span></label>
                                    </div>
                                    <div class="btn-group" data-toggle="buttons">
                                        <button class="btn btn-sm btn-default" id="bold"><span class="fa fa-bold"></span></button>    
                                        <button class="btn btn-sm btn-default" id="italic"><span class="fa fa-italic"></span></button>    
                                    </div>
                                    <input id="fontfamily" type="text" />
                                    <span id="iconpicker"></span>
                                    <input value="36" id="fontsize">
                                    <div class="btn-group">
                                        <button id="fontsize-minus" class="btn btn-darkslate btn-xs fontsize-plusminus" style="font-size:16px">&ndash;</button>
                                        <button id="fontsize-plus" class="btn btn-darkslate btn-xs fontsize-plusminus" style="font-size:16px">+</button>
                                    </div>
                                    <div id="fontcolorcanvas-wrap"><canvas id="fontcolorcanvas"></canvas></div>
                                    <input id="fontcolor" value="#ffffff"/>
                                    <span id="fontweight-wrapper" class="dropdown" style="display:inline-block">
                                        <button class="btn btn-slate btn-sm dropdown-toggle" type="button" data-toggle="dropdown"><span id="txtFontWeight">400</span>
                                            <span class="caret"></span></button>
                                        <ul id="fontweight-list" class="dropdown-menu">											  
                                            <li><a href="#" class="fontweight-menu" data-value="100">Ultra-Light 100</a></li>
                                            <li><a href="#" class="fontweight-menu" data-value="200">Light 200</a></li>
                                            <li><a href="#" class="fontweight-menu" data-value="300">Book 300</a></li>
                                            <li><a href="#" class="fontweight-menu" data-value="400">Normal 400</a></li>
                                            <li><a href="#" class="fontweight-menu" data-value="500">Medium 500</a></li>
                                            <li><a href="#" class="fontweight-menu" data-value="600">Semi-Bold 600</a></li>
                                            <li><a href="#" class="fontweight-menu" data-value="700">Bold 700</a></li>
                                            <li><a href="#" class="fontweight-menu" data-value="800">Extra-Bold 800</a></li>
                                            <li><a href="#" class="fontweight-menu" data-value="900">Ultra-Bold 900</a></li>
                                        </ul>
                                    </span>
                                </div>

                                <div id="linetoolbar" class="cvsconsole">
                                    <span>Line Width:<input id="borderText2"></span>
                                    <span>Length:<input id="lineLength"></span>  <input id="bordercolorText2" value="#ffffff"/>
                                    &nbsp;&nbsp;
                                    <div class="btn-group" data-toggle="buttons">
                                        <button class="btn btn-slate btn-sm" id="line_keep_horizontal" title="Keep Line Vertical">Horizontal</button>    
                                        <button class="btn btn-slate btn-sm" id="line_keep_vertical" title="Keep Line Horizontal">Vertical</button>    
                                    </div>
                                </div>                             

                                <div id="linestyletoolbar" class="cvsconsole">
                                    Border: <select id="borderTextStyle">
                                        <option value="solid">Solid</option>
                                        <option value="dashed">Dashed (on Border)</option>
                                        <option value="dashedgap" id="borderTextStyle_DashedGap" style="display:none">Dashed (on Gap)</option>
                                    </select>
                                    <span>Dash:<input id="borderTextDash"></span> 
                                    <span>Space:<input id="borderTextSpace"></span> 
                                    <span>Offset:<input id="borderTextDashset"></span> 
                                    &nbsp;<button id="lineJoin" title="Line Join" class="btn btn-sm btn-darkslate activ">Miter</button>
                                    &nbsp;<button id="lineCap" title="Line Cap" class="btn btn-sm btn-darkslate">Round Cap</button>
                                    <div class="btn-group" data-toggle="buttons">
                                        <label id="linestyle_arrow_none" class="btn btn-sm btn-darkslate activ" title="">
                                            <input id="arrow_none_style" class="shape_mode" type="radio" name="linestyle_arrow" value="NONE"><span class="fa fa-minus"></span>&nbsp;</label>
                                        <label id="linestyle_arrow_bothends" class="btn btn-sm btn-darkslate" title="">
                                            <input id="arrow_bothends_style" class="shape_mode" type="radio" name="linestyle_arrow" value="BOTH"><span class="fa fa-arrows-h"></span>&nbsp;</label>
                                        <label id="linestyle_arrow_start" class="btn btn-sm btn-darkslate" title="">
                                            <input id="arrow_start_style" class="shape_mode" type="radio" name="linestyle_arrow" value="LEFT"><span class="fa fa-long-arrow-left"></span>&nbsp;</label>
                                        <label id="linestyle_arrow_end" class="btn btn-sm btn-darkslate" title="">
                                            <input id="arrow_end_style" class="shape_mode" type="radio" name="linestyle_arrow" value="RIGHT"><span class="fa fa-long-arrow-right"></span>&nbsp;</label>
                                    </div> &nbsp;
                                </div>                             

                                <div id="curvedtexttoolbar" class="cvsconsole">
                                    <div class="btn-group" data-toggle="buttons">
                                        <label id="curve_mode_move" class="btn btn-sm btn-default" title="">
                                            <input id="mode_move_curve" class="curve_mode" type="radio" name="curve_mode" value="203"><span class="fa fa-arrows"></span>&nbsp;</label>
                                        <label id="curve_mode_edit" class="btn btn-sm btn-default" title="">
                                            <input id="mode_edit_curve" class="curve_mode" type="radio" name="curve_mode" value="202"><span class="fa fa-pencil"></span>&nbsp;</label>
                                    </div> 
                                    &nbsp;<span>Grow Text:<input id="txtGrow"></span>
                                    <div class="btn-group" data-toggle="buttons">
                                        <button id="txtGrowRight" class="btn btn-darkslate btn-sm txtGrowDir" data-dir="1" title="Grow left"><span class="fa fa-sort-down rotate45"></span></button>
                                        <button id="txtGrowCenter" class="btn btn-darkslate btn-sm txtGrowDir" data-dir="2" title="Grow center"><span class="fa fa-expand rotate45"></span></button>
                                        <button id="txtGrowLeft" class="btn btn-darkslate btn-sm txtGrowDir" data-dir="0" title="Grow right"><span class="fa fa-sort-down rotate-45"></span></button>
                                    </div>
                                    &nbsp;<span>Start angle:<input id="txtAngle1"></span>
                                    &nbsp;<span>End angle:<input id="txtAngle2"></span>
                                    &nbsp;<button class="btn btn-link btn-sm" id="growAngleReset" title="Reset Angles"><span class="fa fa-refresh"></span></button>
                                    &nbsp;<span>Spacing:<input id="spacingText2"></span>
                                    &nbsp;<span class="toggle"> 
                                        <i class="fa fa-toggle-on fa-2x active uprightText" id="uprightTextOn" style="display:none;"></i>
                                        <i class="fa fa-toggle-on fa-2x fa-rotate-180 inactive uprightText" id="uprightTextOff" ></i>
                                    </span>Upright
                                </div>
                                <div id="shapetoolbar" class="cvsconsole">
                                    <div class="mode_move_show mode_edit_hide" style="display:inline-block">
                                        Mode: <div class="btn-group" data-toggle="buttons">
                                            <label id="shape_mode_move" class="btn btn-sm btn-default" title="Move">
                                                <input id="mode_move_shape" class="shape_mode" type="radio" name="shape_mode" value="203"><span class="fa fa-arrows"></span>&nbsp;</label>
                                            <label id="shape_mode_edit" class="btn btn-sm btn-default" title="Edit Points">
                                                <input id="mode_edit_shape" class="shape_mode" type="radio" name="shape_mode" value="202"><span class="fa fa-pencil"></span>&nbsp;</label>
                                        </div> &nbsp;
                                    </div>
                                    <button class="btn btn-primary btn-sm mode_move_show mode_edit_hide" title="Continue Drawing Shape" id="shape_mode_draw">Continue Drawing</button>    
                                    <div id="mode_edit_controls" style="display:inline-block">
                                        Edit: <div class="btn-group" data-toggle="buttons">
                                            <label id="shape_point_corner" class="btn btn-sm btn-default" title="Corner">
                                                <input id="point_corner" class="pointcode" type="radio" name="pointcode" value="1"><span class="fa fi-node-corner"></span>&nbsp;</label>
                                            <label id="shape_point_regular" class="btn btn-sm btn-default hidden" title="Regular">
                                                <input id="point_regular" class="pointcode" type="radio" name="pointcode" value="0"><span class="fa fi-node-corner"></span>&nbsp;</label>
                                            <label id="shape_point_smooth" class="btn btn-sm btn-default" title="Smooth">
                                                <input id="point_smooth" class="pointcode" type="radio" name="pointcode" value="2"><span class="fa fi-node-smooth"></span>&nbsp;</label>
                                            <label id="shape_point_symmetric" class="btn btn-sm btn-default" title="Symmetric">
                                                <input id="point_smooth" class="pointcode" type="radio" name="pointcode" value="3"><span class="fa fi-node-symm"></span>&nbsp;</label>
                                        </div> &nbsp;
                                        Node: 
                                        <button class="btn btn-slate btn-sm" title="Add Point" id="add_shape_point_prev"><span class="fa fa-plus"></span></button>    
                                        <button class="btn btn-slate btn-sm" title="Add Point" id="add_shape_point_next"><span class="fa fa-plus"></span></button>    
                                        <button class="btn btn-slate btn-sm" title="Delete Point" id="delete_shape_point"><span class="fa fa-minus"></span></button>    
                                        &nbsp;
                                        <div class="btn-group" data-toggle="buttons">
                                            <button class="btn btn-slate btn-sm" title="Flip Horizontally" id="flip_shape_horizontal"><span class="fa fa-exchange"></span></button>    
                                            <button class="btn btn-slate btn-sm" title="Flip Vertically" id="flip_shape_vertical"><span class="fa fa-exchange rotate90"></span></button>    
                                        </div>
                                    </div> 
                                    <button class="btn btn-danger btn-sm mode_edit_show mode_move_hide" title="Stop Drawing Shape" id="shape_mode_drawstop">Stop Drawing</button>    
                                    <div class="mode_move_show mode_edit_hide" style="display:inline-block">
                                        &nbsp;&nbsp;Close Path <span id="togglePathClosed" class="toggle"> 
                                            <i class="fa fa-toggle-on fa-2x active" id="pathClosedOn" style="display:none;"></i>
                                            <i class="fa fa-toggle-on fa-2x fa-rotate-180 inactive" id="pathClosedOff" ></i>									
                                        </span> 
                                    </div>
                                </div>                             

                                <div id="polygontoolbar" class="cvsconsole">
                                    <div class="btn-group" data-toggle="buttons">
                                        <label id="txt_polyspoke_off" class="btn btn-sm btn-default" title="Regular Polygon">
                                            <input id="polyspoke_off" class="" type="radio" name="polyspoke" value="0"> <span class="fa fi-poly5-yellow"></span>&nbsp;</label>
                                        <label id="txt_polyspoke_on" class="btn btn-sm btn-default active" title="Star">
                                            <input id="polyspoke_on" class="" type="radio" name="polyspoke" value="1" checked><span class="fa fi-poly5-star-yellow"></span>&nbsp;</label>
                                    </div> &nbsp;
                                    <span>Sides:<input id="polygonSides"></span>
                                    <span id="spantxtSpokeratio">Spoke Ratio:<input id="polygonSpokeRatio"></span>
                                </div>                             

                                <div id="rotatetextconsole" class="cvsconsole">
                                    <div id="spanTextAngle" style="display:inline-block">
                                        <span>Text Rotation:<input id="textAngle"></span>
                                        <button class="btn btn-link btn-sm" id="rotateTextAngleReset" title="Reset to Zero"><span class="fa fa-refresh"></span> Reset</button>
                                    </div>
                                    <span style="margin-left:20px">Rotate:<input id="rotateText"></span>
                                    <button class="btn btn-link btn-xs" id="rotateTextReset" title="Reset to Zero"><span class="fa fa-refresh"></span> Reset</button>
                                </div>                             
                                <div id="positiontextconsole" class="cvsconsole">
                                    <span class="">Text Position </span> <span>X Offset: <input id="xFine"></span>
                                    <span>Y Offset:<input id="yFine"></span>
                                    Padding: <input id="textPadding">  
                                    <span>Letter spacing:<input id="spacingText"></span>
                                    <span>Line Height:</span>
                                    <select id="lineheight">
                                        <option value="0.3">0.3</option>
                                        <option value="0.4">0.4</option>
                                        <option value="0.5">0.5</option>
                                        <option value="0.6">0.6</option>
                                        <option value="0.7">0.7</option>
                                        <option value="0.8">0.8</option>
                                        <option value="0.9">0.9</option>
                                        <option value="1" selected>1</option>
                                        <option value="1.1">1.1</option>
                                        <option value="1.2">1.2</option>
                                        <option value="1.3">1.3</option>
                                        <option value="1.4">1.4</option>
                                        <option value="1.5">1.5</option>
                                        <option value="1.6">1.6</option>
                                        <option value="1.7">1.7</option>
                                        <option value="1.8">1.8</option>
                                        <option value="1.9">1.9</option>
                                        <option value="2">2</option>
                                    </select>
                                    <button class="btn btn-link btn-xs" id="positionTextReset" title="Reset to Zero"><span class="fa fa-refresh"></span> Reset</button>
                                </div>                             
                                <div id="circulartextconsole" class="cvsconsole">
                                    Circular Text <span class="toggle"> 
                                        <i class="fa fa-toggle-on fa-2x active" id="circTextOn" style="display:none;"></i>
                                        <i class="fa fa-toggle-on fa-2x fa-rotate-180 inactive" id="circTextOff" ></i>
                                    </span> &nbsp;&nbsp;
                                    <span>Start Angle: <input id="circAngle"></span>
                                    <span>Radius Adjust: <input id="circRadAdj"></span>
                                    Text: <select id="circIO">
                                        <option value="0">Outward</option>
                                        <option value="1">Inward</option>
                                    </select>

                                </div>                             
                                <div id="comconsole" class="cvsconsole">
                                    <button id="editKitComponent" class="btn btn-sm btn-darkslate" style="position:absolute;right:4px;">Edit Component</button>
                                    Render mode: 
                                    <div class="btn-group" data-toggle="buttons">
                                        <label id="render_mode_redraw" class="btn btn-sm btn-slate">
                                            <input id="mode_redraw_render" class="render_mode" type="radio" name="render_mode" value="0"><span class="fa fa-pencil"></span>&nbsp;Redraw</label>
                                        <label id="render_mode_scale" class="btn btn-sm btn-slate">
                                            <input id="mode_scale_render" class="render_mode" type="radio" name="render_mode" value="1"><span class="fa fa-expand"></span>&nbsp;Scale</label>
                                    </div> 
                                    &nbsp;&nbsp;
                                    <div class="btn-group" data-toggle="buttons">
                                        <button class="btn btn-slate btn-sm" id="flip_com_horizontal" title="Flip Horizontally"><span class="fa fa-exchange"></span></button>    
                                        <button class="btn btn-slate btn-sm" id="flip_com_vertical" title="Flip Vertically"><span class="fa fa-exchange rotate90"></span></button>    
                                    </div>

                                    &nbsp;&nbsp;<span class="toggle"> 
                                        <i class="fa fa-toggle-on fa-2x active" id="keepOriAspectOn" style="display:none;"></i>
                                        <i class="fa fa-toggle-on fa-2x fa-rotate-180 inactive" id="keepOriAspectOff" ></i>
                                    </span> &nbsp;
                                    Keep Original Aspect Ratio&nbsp;&nbsp;
                                    <button class="btn btn-link btn-xs" id="componentSizeReset" title="Reset to Original Size"><span class="fa fa-refresh"></span> Reset Size</button>								
                                </div>                             
                                <div id="outlinetextconsole" class="cvsconsole">
                                    <span>Stroke Text:<input id="outlineText"></span> <input id="outlinecolorText" value="#ffffff"/>
                                    <button class="btn btn-link btn-xs" id="outlineTextReset" title="Reset to Zero"><span class="fa fa-refresh"></span> Reset</button>
                                </div>           
                                <div id="bordertextconsole" class="cvsconsole">
                                    <span>Width:<input id="borderText"></span> 
                                    <input id="bordercolorText" value="#ffffff"/>
                                    <span id="spanBorderGap" style="display:none">Gap:<input id="borderGap">
                                    <input id="bordergapcolor" value="#ffffff"/></span> 
                                    <span id="spanRadiusText">Corner-Radius:<input id="radiusText"></span>
                                    <button class="btn btn-link btn-xs" id="borderTextReset" title="Reset to Zero"><span class="fa fa-refresh"></span> Reset</button>
                                    <!--                    <button id="hideTextRadiusConsole" class="btn btn-primary btn-xs" title="">
                                                                                    OK
                                                                            </button>               -->
                                </div>           
                                <div id="shadowtextconsole" class="cvsconsole">
                                    Text Shadow <span class="toggle"> 
                                        <i class="fa fa-toggle-on fa-2x active" id="shadowTextOn" style="display:none;"></i>
                                        <i class="fa fa-toggle-on fa-2x fa-rotate-180 inactive" id="shadowTextOff" ></i>
                                    </span> &nbsp;&nbsp;
                                    <span>Blur:<input id="shadowText"></span> <input id="shadowcolorText" value="#ffffff"/>
                                    <span>X:<input id="shadowOxText"></span>
                                    <span>Y:<input id="shadowOyText"></span>
                                </div>                             
                                <div id="shadowfilltextconsole" class="cvsconsole">
                                    Fill Shadow <span class="toggle"> 
                                        <i class="fa fa-toggle-on fa-2x active" id="shadowTextFillOn" style="display:none;"></i>
                                        <i class="fa fa-toggle-on fa-2x fa-rotate-180 inactive" id="shadowTextFillOff" ></i>
                                    </span> &nbsp;&nbsp;
                                    <span>Blur:<input id="shadowTextFill"></span> <input id="shadowcolorTextFill" value="#ffffff"/>
                                    <span>X:<input id="shadowOxTextFill"></span>
                                    <span>Y:<input id="shadowOyTextFill"></span>
                                    <button class="btn btn-link btn-xs" id="resetShadowText" title="Reset to Zero"><span class="fa fa-refresh"></span> Reset</button>
                                    <!--                    <button id="hideTextShadowConsole" class="btn btn-primary btn-xs" title="">
                                                                                    OK
                                                                            </button>-->
                                </div>                             
                            </div>            

                            <div id="undoredo-box">
                                <button class="btn btn-default btn-sm disabled" id="undo" title="Undo"><span class="fa fi-undo"></span></button>    
                                <button class="btn btn-default btn-sm disabled" id="redo" title="Redo"><span class="fa fi-redo"></span></button>    
                            </div>                    
                            <div id="txtconsole" class="">
                                <span class="dropdown">
                                    <button class="btn btn-link dropdown-toggle" type="button" id="btnBaseShapeTxt" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                        <span class="fa fa-circle-thin"></span>
                                    </button>&nbsp;
                                    <ul id="ddBaseShapeTxt" class="dropdown-menu dropdown-menu-left" aria-labelledby="">
                                        <li><a id="txtbase_rectangle" href="#"><span class="fa fa-square-o stretch"></span> Rectangle</a></li>
                                        <li><a id="txtbase_square" href="#"><span class="fa fa-square-o"></span> Square</a></li>
                                        <li><a id="txtbase_circle" href="#"><span class="fa fa-circle-thin"></span> Circle</a></li>
                                        <li><a id="txtbase_ellipse" href="#"><span class="fa fa-circle-thin stretch"></span> Ellipse</a></li>
                                        <li><a id="txtbase_trapezoid" href="#"><span class="fa fa-square-o trapezoid"></span> Trapezoid</a></li>
                                        <li><a id="txtbase_parallelogram" href="#"><span class="fa fa-square-o skewed"></span> Parallelogram</a></li>
                                        <li><a id="txtbase_ribbon" href="#"><span class="fa fa-bookmark-o rotate90"></span> Ribbon</a></li>
                                    </ul>
                                </span>                        
                                <div class="btn-group" data-toggle="buttons">
                                    <label id="txt_oalign_left" class="btn btn-default" title="Align Left">
                                        <span class="fa fi-object-align-left"></span></label>
                                    <label id="txt_oalign_center" class="btn btn-default" title="Align Center">
                                        <span class="fa fi-object-align-horizontal"></span></label>
                                    <label id="txt_oalign_right" class="btn btn-default" title="Align Right">
                                        <span class="fa fi-object-align-right"></span></label>
                                </div>
                                <div class="btn-group" data-toggle="buttons">
                                    <label id="txt_ovalign_top" class="btn btn-default" title="Align Top">
                                        <span class="fa fi-object-align-top"></span></label>
                                    <label id="txt_ovalign_middle" class="btn btn-default" title="Align Middle">
                                        <span class="fa fi-object-align-vertical"></span></label>
                                    <label id="txt_ovalign_bottom" class="btn btn-default" title="Align Bottom">
                                        <span class="fa fi-object-align-bottom"></span></label>
                                </div>
                                <div class="btn-group" data-toggle="buttons">
                                    <button class="btn btn-default" id="resizeTextWidth2Canvas"><span class="fa fa-arrows-h"></span></button>
                                    <button class="btn btn-default" id="resizeTextHeight2Canvas"><span class="fa fa-arrows-v"></span></button>
                                    <button class="btn btn-default" id="resizeText2Canvas"><span class="fa fa-arrows-alt"></span></button>		                                
                                </div>                        
                                <span id="spanFontsize3">Font Size: <input value="36" id="fontsize3"></span>
                                <span id="spantxtRadius">Radius:<input id="txtRadius"></span>
                                <span>Opacity:<input id="alphaText"></span>
                                <span id="spantxtWidth">Width:<input id="txtWidth"></span>
                                <span id="spantxtHeight">Height:<input id="txtHeight"></span>
                                <span id="spantxtKeepratio"><input id="txtkeepratio" type="checkbox" name="txtratio" title="Keep Ratio" value="1" checked/> <label for="txtkeepratio">ratio</label></span>
                                &nbsp;   <button class="btn btn-link btn-reset btn-xs" id="resetText" title="Reset Text Position"><span class="fa fa-refresh"></span></button>                            
                                <div id="txtconsole_litebar" style="margin-top:4px;">
                                    <div id="txtconsole_litebar_edit" class="txtconsole_litebar">
                                        <button id="modeTextEdit" class="btn btn-link btn-xs" title="Edit Text">
                                            Edit Text
                                        </button>                
                                    </div>
                                </div>
                            </div>
                            <div id="imgconsole">
                                <span class="dropdown">
                                    <button class="btn btn-link dropdown-toggle" type="button" id="btnBaseShapeImg" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                        <span class="fa fa-circle-thin"></span>
                                    </button>&nbsp;
                                    <ul id="ddBaseShapeImg" class="dropdown-menu dropdown-menu-left" aria-labelledby="">
                                        <li><a id="imgbase_rectangle" href="#"><span class="fa fa-square-o stretch"></span> Rectangle</a></li>
                                        <li><a id="imgbase_square" href="#"><span class="fa fa-square-o"></span> Square</a></li>
                                        <li><a id="imgbase_circle" href="#"><span class="fa fa-circle-thin"></span> Circle</a></li>
                                        <li><a id="imgbase_ellipse" href="#"><span class="fa fa-circle-thin stretch"></span> Ellipse</a></li>
                                        <li><a id="imgbase_trapezoid" href="#"><span class="fa fa-square-o trapezoid"></span> Trapezoid</a></li>
                                        <li><a id="imgbase_parallelogram" href="#"><span class="fa fa-square-o skewed"></span> Parallelogram</a></li>
                                    </ul>
                                </span>                        

                                <div class="btn-group" data-toggle="buttons">
                                    <label id="img_oalign_left" class="btn btn-default" title="Image Align Left">
                                        <span class="fa fi-object-align-left"></span></label>
                                    <label id="img_oalign_center" class="btn btn-default" title="Image Align Center">
                                        <span class="fa fi-object-align-horizontal"></span></label>
                                    <label id="img_oalign_right" class="btn btn-default" title="Image Align Right">
                                        <span class="fa fi-object-align-right"></span></label>
                                </div>
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
                                <span>Opacity:<input id="alphaImage"></span>
                                <span>Width:<input id="imageWidth"></span>
                                <span>Height:<input id="imageHeight"></span>
                                <span id="spanimgKeepratio"><input id="imgkeepratio" type="checkbox" name="imgkeepratio" title="Keep Ratio" value="1" checked/> <label for="imgkeepratio">ratio</label></span>
                                &nbsp; <button class="btn btn-link btn-xs btn-reset" id="resetImage" title="Reset Image to Original Size & Position"><span class="fa fa-refresh"></span></button>
                            </div>
                            <div id="canvascolorpickerconsole" class="cvsconsole">
                                <canvas id="canvas-color-picker"></canvas>
                                <div id="canvas-color-picker-sample">
                                    <div style="position:absolute;left:0px;bottom:2px">
                                    </div>
<!--                                    <div style="position:absolute;right:10px;bottom:2px"><a id="managecolorpalettes" class="" href="#">Color Palette</a></div>-->
                                    <div id="previewcanvascolorpicker" class="evo-sample trigger" value="#000000" style="background-color:#000000"></div>
                                    <span class="toollabel">Selected Color</span>
                                    <button id="okcanvascolorpicker" class="btn btn-default btn-xs">
                                        OK
                                    </button>
                                    <button id="cancelcanvascolorpicker" class="btn btn-danger btn-xs">
                                        Cancel
                                    </button>
                                    <button id="pickoncanvascolorpicker" class="btn btn-slate btn-xs">
                                        Pick Color from Canvas
                                    </button>
                                </div>
                            </div>                            
                        </div>
                        <div id="canvasinfo" class="onloadHide">
                        </div>
                        <textarea type="text" id="input" placeholder="Write your message here"></textarea>
                        <div id="cvsOutput">
                            <canvas id="cvs" dir="ltr" class=""></canvas>
                        </div>              						
                    </div>
                </div>
                <canvas id="comcanvas_child"></canvas>
                <canvas id="cvtemp"></canvas>
                <canvas id="imgcanvas"></canvas>
                <canvas id="comcanvas"></canvas>
                <canvas id="comperspective"></canvas>
                <canvas id="BGCanvas"></canvas>
                <canvas id="BGCanvas3X"></canvas>
                <canvas id="PatternCanvas"></canvas>
                <canvas id="PatternCanvasLight"></canvas>
                <canvas id="PatternCanvasDark"></canvas>
                <canvas id="MaskCanvas"></canvas>
                <canvas id="MaskCanvas2"></canvas>
                <canvas id="thumbnail"></canvas>
                <canvas id="thumbpreview"></canvas>
                <canvas id="blinkOn"></canvas>
                <canvas id="blinkOff"></canvas>
                <canvas id="cvso"></canvas>
                <canvas id="cvst"></canvas>				
                <canvas id="canvas_measuretext"></canvas>

                <div id="cvsfooter_wrap">
                    <div id="cvsfooter">
                        <div id="cvsdownload-box">
                            <div style="padding:4px 0;">
                                <div style="display: inline-block;padding:1px 4px 0;vertical-align: middle">Canvas &bull; <span id="currentSizeLayout"></span></div>
                                <a hre="#" id="checkout_component" class="btn btn-xs btn-link blue" style="font-size:13px;display: inline-block;vertical-align: middle">Component#</a>
                            </div>
                        </div>
                        <div id="cvszoom-box" class="percentspinner">
                            <input type="hidden" id="cvszoom" value="100">
                            <span id="cvszoom-text">100%</span>&nbsp;
                            <span class="dropup">
                                <button class="btn btn-darkslate btn-sm dropdown-toggle" type="button" id="btnZoomLevel" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                    <span class="fa fa-search-plus"></span>
                                </button>&nbsp;
                                <ul id="duZoom" class="dropdown-menu dropdown-menu-right" aria-labelledby="btnZoomLevel">
                                    <li><a id="canvas_zoom_100" href="#" class="canvas_zoom text-center" data-zoom="1">1:1</a></li>
                                    <li><a id="canvas_zoom_fullcover" href="#" class="canvas_zoom text-center" data-zoom="0">Auto</a></li>
                                    <!--                                    <li><a href="#" class="canvas_zoom">80%</a></li>
                                                                        <li><a href="#" class="canvas_zoom">70%</a></li>
                                                                        <li><a href="#" class="canvas_zoom">60%</a></li>
                                                                        <li><a href="#" class="canvas_zoom">50%</a></li>
                                                                        <li><a href="#" class="canvas_zoom">25%</a></li>-->
                                </ul>
                            </span>                        
                        </div>
                        <span id="cvsinfo_footer"></span></div>
                </div>
            </div>
            <div id="ComCanvasEstate" class="hidden"></div>

            <div id="onloadError" style="margin:0 auto; max-width: 660px "><span class="fa fa-exclamation-triangle text-danger"></span><br> This canvas requires a newer version of the plugin.<br>
                Current plugin version is <span class="version"></span>. Please upgrade to version <span class="version_required"></span> or higher.
                <div style="margin:20px 30px 0"><button id="cmdProceedAnyway" class="btn btn-default btn-sm pull-left">Proceed Anyway</button> <a class="btn btn-sm btn-primary pull-right" href="<?php echo esc_url(admin_url('admin.php')) ?>?page=wpimager_dashboard"><span class="fa fa-wordpress"></span> Back to WordPress</a></div>
            </div>

            <div id="onloadError_CanvasData"><span class="fa fa-exclamation-triangle text-danger"></span><br> Unexpected Error: Invalid canvas data.<br>
                Expecting JSON formatting. Data received is as below:-
                <div>
                    <textarea id="txt_debug"></textarea>
                </div>
            </div>

            <!-- Change Page Title -->
            <div class="modal fade" id="dialog-edit-title" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content" style="background:#333;color:#eaeaea;">
                        <div class="modal-header" style="border:none">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 class="modal-title" id="myModalLabel">Title</h4>
                        </div>
                        <div class="modal-body">
                            <input type="text" maxlength="80" id="txtPagetitle" class="form-control" name="Webpages[title]" value="<?php echo $title; ?>"/>

                        </div>
                        <div class="modal-footer" style="border:none">
                            <!--                            <button type="button" class="btn btn-default btn-sm pull-left" data-dismiss="modal">Close</button>-->
                            <button type="button" class="btn btn-primary btn-sm" onclick="postEditTitle();
                                    return false;">Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Error Message-->
            <div class="modal fade" id="dialog-error-message" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-body" style="background:#333;color:#eaeaea">
                            <div id="dialog-error-message-data" style="margin:10px 10px 16px"></div>
                            <button type="button" class="btn btn-primary btn-sm" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- dialog-com-textedit -->
            <div class="modal fade" id="dialog-com-textedit" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                <div class="modal-dialog" style="">
                    <div class="modal-content" style="">
                        <div class="modal-header" style="border:none">
                            <div style="position:absolute;right:16px;top:12px;z-index:2000">
                                <button type="button" class="close" data-dismiss="modal"><span style="color:#999">&times;</span></button>                            
                            </div>
                            <div class="palette-list"><span class="fa fa-cube"></span> Component</div>
                        </div>
                        <div id="com-textedit-export-wrap"  class="palette-list" style="text-align: left;padding:0px 20px">
                            <div class="text-center" style="position:absolute;right:42px;top:14px;margin:0 0px 6px;z-index: 10000"><button id="cmdExportComShow" class="btn btn-xs btn-slate">Export Component</button></div>
                            <div id="com-textedit-export" style="padding-bottom:20px;display: none">
                                <div style="width:75%;margin:0 auto">
                                    <div class="text-center" style="color:#999">Copy the code below to export the current component:</div>									
                                    <div class="input-group">
                                        <input id="exportSlideCode2" type="text" class="form-control" value="">
                                        <span class="input-group-btn">
                                            <button class="btn btn-default btn-clipboard" type="button" style="display:inline-block;" data-clipboard-demo="" data-clipboard-target="#exportSlideCode2">
                                                <span class="fa fa-clipboard"></span>
                                            </button>
                                        </span>
                                    </div>
                                    <div class="code-copy-msg text-right" style="display:none;color:#fff"><small>Copied!</small></div>                                                                       
                                </div>                                
                            </div>
                        </div>
                        <div class="modal-body" style="background:#333;color:#eaeaea;">
                            <div class="text-center" style="margin:0 0 10px">Replace Text</div>
                            <div id="com-textedit-box-wrap"  class="palette-list" style="text-align: left">
                                <div id="com-textedit-none" class="text-center" style="padding:30px;background:#232323;margin-top:10px">No text in component.</div>
                                <div id="com-textedit-box"></div>
                            </div>
                        </div>
                        <div class="modal-footer" style="padding:8px 12px;border:none;">
                            <button id="com-textedit-apply" type="button" class="btn btn-success btn-sm">Apply</button>
                            <button id="com-textedit-ok" type="button" class="btn btn-primary btn-sm">OK</button>
                            <button type="button" class="btn btn-default btn-sm" data-dismiss="modal">Cancel</button>
                        </div>

                    </div>
                </div>
            </div>
            <!-- Color Palette -->
            <div class="modal fade" id="dialog-color-palette" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                <div class="modal-dialog" style="height:70%;margin-top: 150px;">
                    <div class="modal-content" style="height:100%;">
                        <div class="modal-body" style="background:#333;color:#eaeaea;height:100%;">
                            <div style="position:absolute;right:16px;top:12px;z-index:2000">
                                <button type="button" class="close" data-dismiss="modal"><span style="color:#999">&times;</span></button>                            
                            </div>
                            <div class="palette-list">Select Color Palette </div>
                            <div id="color-palette-box-wrap"  class="palette-list" style="text-align: left">
                                <div id="color-palette-box"></div>
                            </div>
                            <div id="color-palette-add" class="palette-add text-left">
                                <div class="text-center">Color Palette</div>
                                <div style="margin:16px 0 4px">Palette Name</div>
                                <input id="textPaletteTitle" maxlength="40" type="text" val="" style="width:50%"/>
                                <div style="margin:20px 0 4px">Colors in Hex (comma separated, max 20 colors)</div>
                                <input id="textColorPalette" type="text" val="" style="width:100%"/>
                                <label id="invalid-input-colors" class="label-danger"></label>
                                <div style="margin:20px 0" class="text-center">
                                    <a href="#" id="addColorPalette" class="btn btn-sm btn-success">&nbsp;&nbsp;&nbsp;OK&nbsp;&nbsp;&nbsp;</a>
                                    &nbsp; <a href="#" id="addColorPalette_cancel" class="btn btn-sm btn-default">Cancel</a>
                                </div>
                                <input id="editPaletteIndex" type="hidden" val="-1"/>
                            </div>
                            <div style="position: absolute;bottom:10px;left:10px;z-index:2000"><a href="#" id="addNewColorPalette" class="btn btn-sm btn-darkslate palette-list">Add New Color Palette</a></div>
                            <div class="palette-list" style="position:absolute;bottom:10px;right:10px;display:inline-block">
                                <button type="button" class="btn btn-darkslate btn-sm" data-dismiss="modal">Close</button>
                            </div>
                            <div class="palette-add" style="position:absolute;bottom:16px;text-align: right;">
                                <button id="cmdPaletteDelete" type="button" class="btn btn-link btn-sm">Delete Palette</button>
                                <button id="cmdPaletteDeleteConfirm" type="button" class="btn btn-danger btn-sm">Click again to confirm deleting palette</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Replace Image Options -->
            <div class="modal fade" id="dialog-replace-image" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                <div class="modal-dialog" style="height:50%;margin-top: 100px;max-width: 440px">
                    <div class="modal-content" style="">
                        <div class="modal-body" style="background:#333;color:#eaeaea;padding: 10px">
                            <div style="position:absolute;right:16px;top:12px;z-index:2000">
                                <button type="button" class="close" data-dismiss="modal"><span style="color:#999">&times;</span></button>                            
                            </div>
                            <div class="palette-list">Replace Image &bull; <span id="lblReplacedSize" class="small"></span> px</div>                            
                            <div id=""  class="palette-list text-center">
                                <fieldset>
                                    <legend style="">Options</legend>
                                    <div style="margin:0 0 8px">Select Image Size</div>
                                    <div id="replaceimagesizes" class="btn-group">
                                    </div>
                                    <div style="margin:10px 0 0" class="">
                                        <div style="margin:0 0 8px">Resize Image</div>
                                        <div id="cmd-replace-image-options" class="" data-resize-option="0">
                                            <button data-resize-option="0" class="btn btn-sm btn-primary" data-tip="Image size will be the selected image size above.">Don't Resize</button>
                                            <button data-resize-option="1" class="btn btn-sm btn-darkslate" data-tip="Resize image to the one being replaced.">Resize to old image size</button>
                                            <button data-resize-option="2" class="btn btn-sm btn-darkslate" data-tip="Don't resize image. Crop image image to old image size.">Crop to old image size</button>
                                        </div>
                                        <div id="tip-replace-image-options" style="color:#d58512"></div>
                                    </div>
                                </fieldset>
                                <div id="tip-replace-image-warn-size" style="color:#777777;margin: 4px 0 0" class="small"><span class="fa fa-exclamation-circle"></span> indicates that the image is smaller than the one being replaced.</div>
                            </div>
                            <div class="text-center" style="margin-top:10px">
                                <button id="cmd-replace-image-ok" type="button" class="btn btn-darkslate btn-sm">OK</button>
                                <button id="cmd-replace-image-cancel" type="button" class="btn btn-darkslate btn-sm">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Restore Slides -->
            <div class="modal fade" id="dialog-restore-slides" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                <div class="modal-dialog" style="height:50%;margin-top: 150px;max-width: 300px">
                    <div class="modal-content" style="height:100%;">
                        <div class="modal-body" style="background:#333;color:#eaeaea;height:100%;">
                            <div style="position:absolute;right:16px;top:12px;z-index:2000">
                                <button type="button" class="close" data-dismiss="modal"><span style="color:#999">&times;</span></button>                            
                            </div>
                            <div class="palette-list" style="margin-bottom:4px;"><span class="fa fa-trash"></span> Trash</div>
                            <div id="restore-slides-box-wrap"  class="palette-list" style="text-align: left">
                                <div id="restore-slides-box"></div>
                                <div id="restore-slides-prompt" class="text-center" style="padding:0px;margin-top:10px">Click to restore item.</div>
                                <div id="restore-slides-none" class="text-center" style="padding:30px;background:#232323;margin-top:10px">No deleted items yet.</div>
                            </div>
                            <div class="" style="position:absolute;bottom:10px;right:10px;display:inline-block">
                                <button type="button" class="btn btn-darkslate btn-sm" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Add Component -->
            <div class="modal fade" id="dialog-add-component" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                <div class="modal-dialog" style="margin-top: 150px;max-width: 300px">
                    <div class="modal-content" style="height:100%;">
                        <div class="modal-body" style="background:#333;color:#eaeaea;">
                            <div style="position:absolute;right:16px;top:12px;z-index:2000">
                                <button type="button" class="close" data-dismiss="modal"><span style="color:#999">&times;</span></button>                            
                            </div>
                            <div class="palette-list">Create Component</div>
                            <div id="wpimager_add_component">
                                <div class="sub-title"	>
                                    <div class="selbanner" style="padding:0px;margin: 0px">
                                        <div style="margin: 20px 0 20px;padding: 0px">
                                            <span style="font-size:40px;" class="fa fa-cube"></span>
                                        </div>
                                        Component Size
                                        <div style="background-color:#434343;padding:10px;margin:10px 0;">
                                            <input id="component_canvas_width" value=""/> x <input id="component_canvas_height" value=""/> px
                                        </div>
                                    </div>
                                </div>
                                <div id="component_dimenso" class="hidden">Preview</div>
                            </div><!-- #wpimager_addslide_component -->
                            <div style="color:#999;padding:0 0 10px">
                                Components are insertable &amp; reusable in normal slides. Made up of text &amp; shapes only. No images.
                            </div>

                                        <div class="addslide_show" style="padding:0">
                                            <button type="button" class="button button-primary" onclick="WPImager.slideCreateComponent();">Create Component Slide</button>
                                        </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- I/O Slide Code -->
            <div class="modal fade" id="dialog-IO-slides" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                <div class="modal-dialog" style="height:50%;margin-top: 150px;max-width: 360px; min-height:360px;">
                    <div class="modal-content" style="height:100%;">
                        <div class="modal-body" style="background:#333;color:#eaeaea;height:100%;">
                            <div style="position:absolute;right:16px;top:12px;z-index:2000">
                                <button type="button" class="close" data-dismiss="modal"><span style="color:#999">&times;</span></button>                            
                            </div>
                            <div class="palette-list"><span class="fa fa-cube"></span> Components</div>
                            <div id="io-slides-box-wrap"  class="palette-list" style="line-height:26px;color:#aaa">											
                                <div id="cvsCodeImport_InsertSlide" class="text-center" style="margin:10px 0 0">
                                    <div style="padding:10px 0" class="text-center">
                                        <img id="io-insert-preview" style="max-width:90%; max-height: 120px;border:1px solid #555;"/>
                                        <div id="io-insert-dimension" style="margin:3px"></div>
                                    </div>
                                    <div class="">Component added to canvas. Insert it to slide:</div>
                                    <div style="padding:4px 0">
                                        <ul id="io-slides-select" style="line-height:30px;" class="text-left">                                        
                                        </ul>
                                    </div>
                                    <div style="margin:4px">
                                        <button id="io-insert-later" type="button" class="btn btn-default btn-sm">Later</button>
                                        <button id="io-insert-com" type="button" class="btn btn-primary btn-sm">Insert</button>
                                    </div>
                                    <div style="line-height:30px;" class="">
                                        <input id="chkImportCodeClose" style="vertical-align: middle;margin: 0" type="checkbox" class="" value="1" name="chkImportCodeClose" checked> <label for="chkImportCodeClose" style="display:inline-block;vertical-align: middle;margin:0 3px">Close this dialog after inserting component.</label>
                                    </div>
                                </div>
                                <div id="cvsCodeImport" class="text-center" style="margin:30px 0">
                                    <div class="text-left">Paste Code to import a component or layer:</div>
                                    <div class="input-group">
                                        <input id="importSlideCode" type="text" class="form-control"/>
                                        <span class="input-group-btn">
                                            <button id="cmdImportCode" type="button" class="btn btn-success">Import</button>
                                        </span>
                                    </div>
                                    <div style="line-height:30px;" class="text-left">
                                        <input id="chkCenterOnImport" style="vertical-align: middle;margin: 0" type="checkbox" class="" value="1" name="chkCenterOnImport" checked> <label for="chkCenterOnImport" style="display:inline-block;vertical-align: middle;margin:0 3px">Center component on canvas</label>
                                    </div>
                                    <div id="code-paste-error" style="display:none;" class="label label-danger">Code Unrecognized. Please provide a valid component code.</div>									

                                </div>
                                <div id="cvsCodeExport" class="text-center" style="margin:30px 0 0">
                                    <div class="text-left">Copy the Code to export the current component:</div>									
                                    <div class="input-group">
                                        <input id="exportSlideCode" type="text" class="form-control" value="">
                                        <span class="input-group-btn">
                                            <button class="btn btn-default btn-clipboard" type="button" style="display:inline-block;" data-clipboard-demo="" data-clipboard-target="#exportSlideCode">
                                                <span class="fa fa-clipboard"></span>
                                            </button>
                                        </span>
                                    </div>
                                    <div class="code-copy-msg text-right" style="display:none;color:#fff"><small>Copied!</small></div>
                                </div>
                            </div>
                            <div id="cvsCodeImportFooter">
                                <div class="small text-left" style="position:absolute;bottom:16px;left:10px;display:inline-block;">
                                    Tryout the sample component <br>
                                    <a href="https://wpimager.com/sample-getcode/" target="_blank">https://wpimager.com/sample-getcode/</a>
                                </div>
                                <div class="" style="position:absolute;bottom:10px;right:10px;display:inline-block">
                                    <button type="button" class="btn btn-darkslate btn-sm" data-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
        <input type="hidden" id="closeFontSelect" value="0"/>
        <input type="hidden" id="canvascolorpicker_point" value=""/>
        <input type="hidden" id="canvascolorpicker_selector" value=""/>
        <input type="hidden" id="canvascolorpicker_ori">
        <input type="hidden" id="canvas_id" value="<?php echo $id; ?>"/>
        <input type="hidden" id="nonce" value="<?php echo $nonce ?>"/>
        <div id="fb-root"></div>
        <div><i id="fontTest"></i></div>
        <div id="paste_clipboard" contenteditable="true"></div>
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
        <?php
    }

}
