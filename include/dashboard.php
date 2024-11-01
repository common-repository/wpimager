<?php


if (!defined('ABSPATH'))
    exit; // Exit if accessed directly

$WPImagerEditor->WPImagerAccess();

if (!class_exists('WP_List_Table')) {
    require_once( ABSPATH . 'wp-admin/includes/class-wp-list-table.php' );
}

class UI_WPImager_Dashboard_Recent extends WP_List_Table {

    function __construct() {
        global $status, $page;
        parent::__construct(array(
            'ajax' => false
        ));
    }

    function no_items() {
        _e('No canvas created yet.');
    }

    function get_columns() {
        $columns = array(
            'title' => __('Recent Canvas', 'listtable'),
        );
        return $columns;
    }

    function column_title($item) {
        global $admin_url;
        // get width and height of canvas
        $settings = unserialize(base64_decode($item['settings']));
        $par['canvas'] = json_decode($settings['canvas'], true);
        $width = (int) $par['canvas']['width'];
        $height = (int) $par['canvas']['height'];
        $backgroundsize = ($width <= 80 || $height <= 80) ? "background-size:initial" : "background-size:cover";
        // prepare canvas thumbnail 
        $wp_upload_dir = wp_upload_dir();
        $upload_dir = $wp_upload_dir['baseurl'] . '/wpimager/canvas-' . $item['id'];
        $thumbfile = $upload_dir . "/IMG" . $item['id'] . '_thumb.png?' . time();
        $thumb_style = "background-image:url('$thumbfile');background-position:center left;$backgroundsize;";
        $preview = '<div class="previewthumb-wrapper"><img id="thumb' . $item['id'] . '" src="' . $thumbfile . '" class="previewthumb"/></div>';
        $thumb = '<a class="row-title" href="' . esc_url($admin_url) . '?page=wpimager_editor&id=' . $item['id'] . '&_wpnonce=' . wp_create_nonce('wpimager_editor' . $item['id']) . '"><div id="thumb' . $item['id'] . '" class="squared bg" style="' . $thumb_style . '"></div></a>';

        // canvas title 
        $title = '<a class="row-title" href="' . esc_url($admin_url) . '?page=wpimager_editor&id=' . $item['id'] . '&_wpnonce=' . wp_create_nonce('wpimager_editor' . $item['id']) . '">' . esc_html($item['title']) . '</a>';

        return $thumb . $title . $preview;
    }

    function extra_tablenav($which) {
        global $admin_url;
        if ($which == "top") {
            
        }
    }

    function prepare_items() {
        global $wpdb, $WPImagerEditor;

        // retrieve the "per_page" option
        $user = get_current_user_id();
        $screen = get_current_screen();
        $screen_option = $screen->get_option('per_page', 'option');
        $per_page = get_user_meta($user, $screen_option, true);

        if (empty($per_page) || $per_page < 1) {
            // get the default value if none is set
            $per_page = $screen->get_option('per_page', 'default');
        }
        $per_page = (int) $per_page;

        // prepare columns
        $columns = $this->get_columns();
        $hidden = array();
        $sortable = $this->get_sortable_columns();
        $this->_column_headers = array($columns, $hidden, $sortable);

        // prepare pagination
        if (!$WPImagerEditor->is_admin() || empty($_REQUEST['select_user'])) {
            $userID = get_current_user_id(); // *omed
            $_REQUEST['select_user'] = $userID;
        }
        $_REQUEST['select_user'] = (int) $_REQUEST['select_user'];
        // fetch canvases from database
        $orderby = "c.updated DESC";

        $table_name = $wpdb->wpimager_db;

        $result = $wpdb->get_results($wpdb->prepare('SELECT c.* FROM ' . $table_name . ' c '
                        . 'WHERE c.disposed = 0 AND c.user_id = %d ORDER BY ' . $orderby . ' LIMIT ' . $per_page, $_REQUEST['select_user']), ARRAY_A);

        $this->items = $result;
    }

}

class UI_WPImager_Dashboard_Favorited extends WP_List_Table {

    function __construct() {
        parent::__construct(array(
            'ajax' => false
        ));
    }

    function no_items() {
        _e('No recent canvas yet.');
    }

    function get_columns() {
        $columns = array(
            'title' => __('Pinned as Favorite', 'listtable'),
        );
        return $columns;
    }

    function column_title($item) {
        global $admin_url;
        // get width and height of canvas
        $settings = unserialize(base64_decode($item['settings']));
        $par['canvas'] = json_decode($settings['canvas'], true);
        $width = (int) $par['canvas']['width'];
        $height = (int) $par['canvas']['height'];
        $backgroundsize = ($width <= 80 || $height <= 80) ? "background-size:initial" : "background-size:cover";
        // prepare canvas thumbnail 
        $wp_upload_dir = wp_upload_dir();
        $upload_dir = $wp_upload_dir['baseurl'] . '/wpimager/canvas-' . $item['id'];
        $thumbfile = $upload_dir . "/IMG" . $item['id'] . '_thumb.png?' . time();
        $thumb_style = "background-image:url('$thumbfile');background-position:center left;$backgroundsize";
        $thumb = '<a class="row-title" href="' . esc_url($admin_url) . '?page=wpimager_editor&id=' . $item['id'] . '&_wpnonce=' . wp_create_nonce('wpimager_editor' . $item['id']) . '"><div id="thumb' . $item['id'] . '" class="squared bg" style="' . $thumb_style . '"></div></a>';
        $preview = '<div class="previewthumb-wrapper"><img id="thumb' . $item['id'] . '" src="' . $thumbfile . '" class="previewthumb"/></div>';

        // canvas title 
        $title = '<a class="row-title" href="' . esc_url($admin_url) . '?page=wpimager_editor&id=' . $item['id'] . '&_wpnonce=' . wp_create_nonce('wpimager_editor' . $item['id']) . '">' . esc_html($item['title']) . '</a>';

        return $thumb . $title . $preview;
    }

    function extra_tablenav($which) {
        global $admin_url;
        if ($which == "top") {
            
        }
    }

    function prepare_items() {
        global $wpdb, $WPImagerEditor;

        // prepare columns
        $columns = $this->get_columns();
        $hidden = array();
        $sortable = $this->get_sortable_columns();
        $this->_column_headers = array($columns, $hidden, $sortable);

        if (!$WPImagerEditor->is_admin() || empty($_REQUEST['select_user'])) {
            $userID = get_current_user_id(); // *omed
            $_REQUEST['select_user'] = $userID;
        }
        $_REQUEST['select_user'] = (int) $_REQUEST['select_user'];
        // fetch canvases from database
        $orderby = "c.updated DESC";

        $table_name = $wpdb->wpimager_db;

        $result = $wpdb->get_results($wpdb->prepare('SELECT c.* FROM ' . $table_name . ' c '
                        . 'WHERE c.disposed = 0 AND c.pinned > 0 AND c.user_id = %d ORDER BY ' . $orderby . ' LIMIT 100', $_REQUEST['select_user']), ARRAY_A);
        $this->items = $result;
    }

}

if (!function_exists('wpimager_dashboard_headscript')) {

    function wpimager_dashboard_headscript() {
//		global $admin_url;
        $userID = get_current_user_id();
        $_options = get_user_option('wpimager_options', $userID);
        $options = unserialize($_options);
        ?>
        <script type="text/javascript">
            var adminurl = '<?php echo admin_url('admin.php') ?>';
            jQuery(function ($) {
                $(".squared.bg").each(function (i, img) {
                    var bi = $(this).css("background-image").match(/url\(["']?([^()]*)["']?\)/).pop();
                    var image = new Image();
                    $(image).error(function () {
                        var thumb_id = '#' + $(this).data("id");
                        $(thumb_id).css("background-image", "url('<?php echo WPIMAGER_PLUGIN_URL ?>images/thumbnail-na.png')");
                    });
                    $(image).attr("src", bi).data("id", $(this).attr("id"));
                });

                $('#createcanvas a').click(function (event) {
                    var clickqval = $(this).data("clickq");
                    event.preventDefault();
                    var newForm = $('<form>', {
                        'action': adminurl + '?page=wpimager_create',
                        'method': 'post',
                        'target': '_top'
                    }).append($('<input>', {
                        'name': 'clickq',
                        'value': clickqval,
                        'type': 'hidden'
                    }));
                    $(document.body).append(newForm);
                    newForm.submit();
                });

                $('#naImportCanvas').click(function (event) {
                    var clickqval = 'import';
                    event.preventDefault();
                    var newForm = $('<form>', {
                        'action': adminurl + '?page=wpimager_create',
                        'method': 'post',
                        'target': '_top'
                    }).append($('<input>', {
                        'name': 'clickq',
                        'value': clickqval,
                        'type': 'hidden'
                    }));
                    $(document.body).append(newForm);
                    newForm.submit();
                });

                $("#cmdUpdatesScrollTo").click(function (event) {
                    event.preventDefault();
                    setTimeout(function () {
                        $(".update-badge").hide();
                    }, 300);
                    setTimeout(function () {
                        $(".update-badge").show();
                    }, 600);

                    $('html, body').animate({
                        scrollTop: $("#updates-postbox").offset().top
                    }, 500);
                });


                var uploadZipBtn = document.getElementById('cmdImportCanvas');
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
                            action: 'importzip', _wpnonce: '<?php echo wp_create_nonce('wpimager_create') ?>'
                        });
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
                            window.location = "<?php echo esc_url($admin_url) ?>?page=wpimager_editor&id=" + response.id.toString() + '&_wpnonce=' + response.nonce;
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

                $(".previewthumb-wrapper").width($("#the-list").width() - 16);

            });

        </script>
        <style>
            body {
                background: #f1f1f1 !important;
            }
            #wpbody .update-nag {
                display: none;
            }
            .postbox-container tfoot,.tablenav {
                display:none;
            }

            .postbox-container table {
                border:none;
            }
            ul#createcanvas {
                margin:0;
            }
            ul#createcanvas li {
                width:33%;
                float:left;
                margin:0;
                padding:0;				
            }
            ul#createcanvas li a {
                display:block;
                border:1px solid #eaeaea;
                background-color:#fafafa;
                margin:4px;
                padding:20px 0 16px;
                text-align:center;
                height:40px;
                color:#454545;
            }				
            ul#createcanvas li a:hover {
                border-color:#ddd;
                background-color:#fdfdfd;
                color:#006799;

            }

            ul#createcanvas li a span.fa, ul#createcanvas li a span.dashicons {
                margin-bottom: 6px;
                font-size:20px;
            }
            ul#summary ul, ul#updates-available {
                margin-top: 8px;
            }

            ul#summary li {
                margin-bottom: 8px;
            }
            ul#summary li {
                margin-left: 16px;
            }
            ul#updates-available li {
                line-height: 36px;
                margin-bottom: 8px;
                margin-left: 4px;
                padding-left:4px;
                border-bottom: 1px solid #eaeaea;
            }
            span.update-badge {
                background-color: #dd4b39;
                -moz-border-radius: 50%;
                -webkit-border-radius: 50%;
                border-radius: 50%;    
                width:18px;
                height:18px;
                line-height: 18px;
                font-size:12px;
                display: inline-block;
                text-align: center;
                color:#fff;
            }

            .squared {
                float: left;
                position: relative;
                width: 90px;
                height: 90px;
                margin: 0;
                margin-right: 10px;
                background-color: transparent;
                overflow: hidden;
            }			
            #cmdUpdatesScrollTo {
                text-decoration: none;
            }
            #wpimager-latest a {
                font-weight: bold;				
            }
            .postdate {
                color:#888;
            }
            .metabox-holder h2.hndle {
                font-size: 14px;
                padding: 8px 12px;
                margin: 0;
                line-height: 1.4;
                border-bottom: 1px solid #eee;
                font-weight: bold;
            }
            .previewthumb-wrapper {
                position: absolute;
                top:42px;
                left:0px;
                width:100%;
                overflow:hidden;
            }
            td:hover .previewthumb {
                opacity: 1;
            }
            .previewthumb {
                max-height:55px;
                opacity: 0.5;
                margin-left: 110px;
            }
            #the-list td {
                position: relative;
            }

        </style>
        <?php
    }

}


if (!function_exists('wpimager_dashboard')) {

    /**
     * Setup Screen option. Number of Canvas per page.
     */
    function wpimager_dashboard_add_options() {

        global $wpimager_dashboard_page;

        $screen = get_current_screen();

        // get out of here if we are not on our settings page
        if (!is_object($screen) || $screen->id != $wpimager_dashboard_page)
            return;
        $args = array(
            'label' => 'Recent Canvas',
            'default' => 3,
            'option' => 'recent_per_page'
        );
        add_screen_option('per_page', $args);
    }

    add_filter('set-screen-option', 'wpimager_dashboard_set_option', 10, 3);

    /**
     * Set Number of Canvas per page.
     */
    function wpimager_dashboard_set_option($status, $option, $value) {

        if ('recent_per_page' == $option)
            return $value;

        return $status;
    }

    /**
     * Dashboard view displays the list of created canvases
     */
    function wpimager_dashboard() {
        global $wpimager_dashboard_recent, $WPImagerEditor, $wpdb, $WPImager_AddOns;
        $AddOns_count = 0;
        $AddOns_html = '<ul>';
        if (count($WPImager_AddOns)) {
            foreach ($WPImager_AddOns as $key => $addOn) {
                if ($addOn['type'] == "module") {
                    $AddOns_count++;
                    $AddOns_html .= '<li>&bull; ' . $addOn['name'] . ' <span style="color:#999">Version ' . $addOn['version'] . '</span></li>';
                }
            }
            foreach ($WPImager_AddOns as $key => $addOn) {
                if ($addOn['type'] == "layer") {
                    $AddOns_count++;
                    $AddOns_html .= '<li>&bull; ' . $addOn['name'] . ' (Layer) <span style="color:#999">Version ' . $addOn['version'] . '</span></li>';
                }
            }
        }
        $AddOns_html .= '</ul>';
        $AddOns_html = ($AddOns_count > 0) ? $AddOns_html : '';

        $update_count = 0; // wpimager_get_update_count();

        $wpimager_dashboard_recent = new UI_WPImager_Dashboard_Recent();
        $wpimager_dashboard_recent->prepare_items();
        $wpimager_dashboard_favorited = new UI_WPImager_Dashboard_Favorited();
        $wpimager_dashboard_favorited->prepare_items();

        $userID = get_current_user_id();

        $table_name = $wpdb->wpimager_db;
        $wpimager = $wpdb->get_row($wpdb->prepare('SELECT COUNT(id) AS canvas_count FROM ' . $table_name . ' c '
                        . 'WHERE c.disposed = 0 AND c.user_id=%d', $userID));
        ?>
        <div class="wrap">

            <?php
            // upload directory 
            $WPImagerEditor->wpimager_directory(WPIMAGER_ASSET_DIR);
            // temp directory
            $WPImagerEditor->wpimager_directory(WPIMAGER_TEMP_DIR);
            ?>
            <?php require_once WPIMAGER_PLUGIN_PATH . 'include/header.php'; ?>
            <div style="margin:0 -8px">
                <h1 style="margin:12px 10px 4px;padding:0;display: inline-block">Dashboard</h1> <?php if ($update_count > 0): ?><a id="cmdUpdatesScrollTo" href="#">Updates Available <span class="fa fa-long-arrow-down"></span></a> <?php endif; ?>
                <div id="dashboard-widgets" class="metabox-holder">			
                    <div id="postbox-container-1" class="postbox-container">
                        <?php if (count($wpimager_dashboard_recent->items) > 0): ?>
                            <div class="meta-box-sortables ui-sortable">
                                <div class="postbox">
                                    <?php
                                    $wpimager_dashboard_recent->display();
                                    ?>
                                    <?php if (count($wpimager_dashboard_recent->items) > 0): ?>
                                        <div style="padding:12px 16px;text-align: right"><a href="<?php echo admin_url('admin.php') ?>?page=wpimager_canvas">Show all &raquo;</a></div>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php else: ?>
                            <div class="meta-box-sortables">
                                <div class="postbox">
                                    <h2 class="hndle"><span>Let's Get Started</span></h2>
                                    <div class="inside">
                                        <ul id="createcanvas">
                                            <li><a href="#" data-clickq="media"><span class="dashicons dashicons-admin-media"></span><br>Upload Photo</a></li>
                                            <li><a href="#" data-clickq="blank"><span class="fa fa-square-o"></span><br>Blank</a></li>
                                            <li><a href="#" data-clickq="print"><span class="fa fa-desktop"></span><br>Print Screen</a></li>
                                        </ul>
                                        <div style="clear:both"></div>
                                    </div>
                                </div>
                            </div>
                        <?php endif; ?>
                        <?php if (count($wpimager_dashboard_favorited->items) > 0): ?>
                            <div class="meta-box-sortables ui-sortable">
                                <div class="postbox">
                                    <?php
                                    $wpimager_dashboard_favorited->display();
                                    ?>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                    <div id="postbox-container-2" class="postbox-container">
                        <?php if (count($wpimager_dashboard_recent->items) > 0): ?>
                            <div class="meta-box-sortables">
                                <div class="postbox">
                                    <h2 class="hndle"><span>Create Canvas</span></h2>
                                    <div class="inside">
                                        <ul id="createcanvas">
                                            <li><a href="#" data-clickq="media"><span class="dashicons dashicons-admin-media"></span><br>Upload Photo</a></li>
                                            <li><a href="#" data-clickq="blank"><span class="fa fa-square-o"></span><br>Blank</a></li>
                                            <li><a href="#" data-clickq="print"><span class="fa fa-desktop"></span><br>Print Screen</a></li>
                                        </ul>
                                        <div style="clear:both"></div>
                                    </div>
                                </div>
                            </div>
                        <?php endif; ?>
                        <div class="meta-box-sortables">
                            <div class="postbox">
                                <h2 class="hndle"><span>Summary Info</span></h2>
                                <div class="inside">
                                    <strong>WPImager <?php echo WPIMAGER_VERSION ?></strong>
                                    <ul id="summary" style="margin:14px 0">
                                        <li><a href="<?php echo admin_url('admin.php') ?>?page=wpimager_canvas"><?php echo $wpimager->canvas_count; ?> Canvas</a></li>
                                        <li><strong><?php echo $AddOns_count ?> Addons Installed</strong> <?php echo $AddOns_html ?></li>
                                        <?php if ($WPImagerEditor->is_admin()): ?>
                                            <?php if (!empty($updates_arr['getAddOns'])): ?>
                                                <li><strong>Get more addons</strong>:<ul id="addons-available">
                                                        <?php foreach ($updates_arr['getAddOns'] as $addOn): ?>
                                                            <li>&bull; <?php echo $addOn['name'] . ' &ndash; Version ' . $addOn['version']; ?>
                                                                <a href="<?php echo esc_url(WPIMAGER_URL . '/addons/wpimager-' . strtolower(str_replace(' ', '-', $addOn['name'])) . '/'); ?>" target="_blank" class="">&raquo; Learn more</a>
                                                            </li>
                                                        <?php endforeach; ?>
                                                    </ul></li>
                                            <?php endif; ?>											
                                        <?php endif; ?>
                                    </ul>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }

} 