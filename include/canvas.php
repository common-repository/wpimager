<?php
if (!defined('ABSPATH'))
    exit; // Exit if accessed directly

$WPImagerEditor->WPImagerAccess();

if (!class_exists('WP_List_Table')) {
    require_once( ABSPATH . 'wp-admin/includes/class-wp-list-table.php' );
}

class UI_WPImager_Canvas extends WP_List_Table {

    public $minGFonts = 20;

    function __construct() {
        global $status, $page;
        parent::__construct(array(
            'ajax' => false
        ));
    }

    function no_items() {
        _e('No canvas found, create one.');
    }

    function column_default($item, $column_name) {
        $item = (array) ($item);
        switch ($column_name) {
            case 'title':
            case 'mode':
            case 'updated':
            case 'created':
                return $item[$column_name];
        }
    }

    function get_sortable_columns() {
        $sortable_columns = array(
            'title' => array('title', false),
        );
        return $sortable_columns;
    }

    function get_columns() {
        $columns = array(
            'title' => __('Canvas', 'listtable'),
            'mode' => __('Actions', 'listtable'),
        );
        return $columns;
    }

    function column_updated($item) {
        return human_time_diff(time(), intval($item['updated'])) . ' ago';
    }

    function column_created($item) {
        return human_time_diff(time(), intval($item['created'])) . ' ago';
    }

    function column_slides($item) {
        
    }

    function column_mode($item) {
        $settings = unserialize(base64_decode($item['settings']));
        $par['canvas'] = json_decode($settings['canvas'], true);
        $return = '<div class="alignright">';
        if (!empty($item['wplsent'])) {
            $return .= '<a class="button btn-white" href="' . admin_url("upload.php") . '?s=wpimager&canvas_id=' . $item['id'] . '&mode=list"><span class="dashicons dashicons-admin-media"></span></a>';
        }
        if (!empty($item['slideshow'])) {
            $return .= '<a class="button btn-white" target="_blank" href="' . admin_url("admin.php") . '?page=wpimager_preview_slideshow&id=' . $item['id'] . '&_wpnonce=' . wp_create_nonce('wpimager_editor' . $item['id']) . '"><span class="dashicons dashicons-controls-play"></span></a>';
        }

        if ($item['user_id'] == get_current_user_id()) {
            $nonce = wp_create_nonce('wpimager_pin' . $item['id']);
            $return .= sprintf('<a class="button' . ($item['pinned'] ? '' : ' btn-grey') . '" href="#" id="pin-canvas-%d" title="' . ($item['pinned'] ? 'Unpin from Top' : 'Pin to Top') . '" onclick = "pinCanvas(%d,\'' . $nonce . '\',' . ($item['pinned'] ? 0 : 1) . ');return false;">' . ($item['pinned'] ? '<span class="dashicons dashicons-admin-post pin-small"></span>' : '<span class="dashicons dashicons-admin-post pin-small"></span>') . '</a>', $item['id'], $item['id']);
            $return .= '<a href="#" class="button btn-cyan" onclick="popCopyCanvas(' . $item['id'] . ',\'' . wp_create_nonce("wpimager_copy" . $item['id']) . '\');return false;"><span class="dashicons dashicons-admin-page"></span></a>';
        }
        $return .= sprintf('<a class="button btn-red" href="#" id="confirm-delete-%d" onclick = "confirmdeleteCanvas(%d);return false;"><span class="dashicons dashicons-trash"></span></a>', $item['id'], $item['id'], $item['id'], $item['id'], 'delete', 'confirm-delete-' . $item['id']);
        $return .= '</div>';
        $nonce = wp_create_nonce('wpimager_delete' . $item['id']);
        $return .= '<div id="delete-' . $item["id"] . '" class="hidden prompt-delete alignright" style="clear:both;margin:10px 0;line-height:28px">Confirm Delete? <a class="button btn-red" style="color:#fff" href="#" onclick = "deleteCanvas(' . $item['id'] . ',\'' . $nonce . '\');return false;">Yes</a></div>';
        $return .= '<div style="clear:both;padding:6px 0 0" id="canvas-form-' . $item['id'] . '"></div>';

        return '<div class="alignright">' . $return . '</div>';
    }

    function column_title($item) {
        global $admin_url;
        // get width and height of canvas
        $settings = unserialize(base64_decode($item['settings']));
        $par['canvas'] = json_decode($settings['canvas'], true);
        $width = (int) $par['canvas']['width'];
        $height = (int) $par['canvas']['height'];
        $backgroundsize = ($width <= 90 || $height <= 90) ? "background-size:initial" : "background-size:cover";
        // prepare canvas thumbnail 
        $wp_upload_dir = wp_upload_dir();
        $upload_dir = $wp_upload_dir['baseurl'] . '/wpimager/canvas-' . $item['id'];
        $thumbfile = $upload_dir . "/IMG" . $item['id'] . '_thumb.png?' . time();
        $thumb_style = "background-image:url('$thumbfile');$backgroundsize;background-position:center left";
        $thumb = '<a class="row-title" href="' . esc_url($admin_url) . '?page=wpimager_editor&id=' . $item['id'] . '&_wpnonce=' . wp_create_nonce('wpimager_editor' . $item['id']) . '"><div id="thumb' . $item['id'] . '" class="squared bg" style="' . $thumb_style . '"></div></a>';
        $preview = '<div class="previewthumb-wrapper"><img id="thumb' . $item['id'] . '" src="' . $thumbfile . '" class="previewthumb"/></div>';

        // canvas title with pin status
        $title = '<a class="row-title" href="' . esc_url($admin_url) . '?page=wpimager_editor&id=' . $item['id'] . '&_wpnonce=' . wp_create_nonce('wpimager_editor' . $item['id']) . '">' . esc_html($item['title']) . '</a>';
        if ($item['pinned']) {
            $title .= ' <span class="dashicons dashicons-admin-post pin-small"></span>';
        }

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
        if (is_array($per_page) || empty($per_page) || $per_page < 1) {
            // get the default value if none is set
            $per_page = $screen->get_option('per_page', 'default');
        }


        // prepare columns
        $columns = $this->get_columns();
        $hidden = array();
        $sortable = $this->get_sortable_columns();
        $this->_column_headers = array($columns, $hidden, $sortable);

        // prepare pagination
        $_GET['paged'] = isset($_GET['paged']) ? intval($_GET['paged']) : 0;
        if ($_GET['paged'] < 1)
            $_GET['paged'] = 1;
        $start = ( $_GET['paged'] - 1 ) * $per_page;
        if ($start < 1)
            $start = 0;


        if (!$WPImagerEditor->is_admin() || empty($_REQUEST['select_user'])) {
            $userID = get_current_user_id(); // *omed
            $_REQUEST['select_user'] = $userID;
        }
        $_REQUEST['select_user'] = (int) $_REQUEST['select_user'];
        // fetch canvases from database
        $search = ( isset($_REQUEST['s']) ) ? $_REQUEST['s'] : false;
        $do_search = ( $search ) ? " AND (c.title LIKE '%%%s%%') " : '';
        $orderby = "c.pinned DESC,";
        if ($_GET['orderby'] == "author") {
            $orderby = "u.display_name";
        } else {
            $orderby .= isset($_GET['orderby']) && ($_GET['orderby'] == "title" || $_GET['orderby'] == "updated" || $_GET['orderby'] == "created") ? "c." . $_GET['orderby'] : "c.created";
        }
        $order = isset($_GET['order']) && ($_GET['order'] == "asc" || $_GET['order'] == "desc") ? $_GET['order'] : "desc";

        $table_name = $wpdb->wpimager_db;
        $table_user = $wpdb->prefix . 'users';

        $result = $wpdb->get_results($wpdb->prepare('SELECT c.*, u.display_name FROM ' . $table_name . ' c '
                        . 'LEFT JOIN ' . $table_user . ' u ON c.user_id = u.ID '
                        . 'WHERE c.disposed = 0 AND c.user_id = %d ' . $do_search . ' ORDER BY ' . $orderby . ' ' . $order . ' LIMIT ' . $start . ',' . $per_page, $_REQUEST['select_user'], $wpdb->esc_like($search), $wpdb->esc_like($search)), ARRAY_A);


        $this->items = $result;
        // count total canvas
        $total_items = $wpdb->get_var($wpdb->prepare('SELECT COUNT(*) FROM ' . $table_name . ' c '
                        . 'WHERE c.disposed = 0 AND c.user_id = %d ' . $do_search, $_REQUEST['select_user'], $wpdb->esc_like($search)));

        // set pagination
        $this->set_pagination_args(array(
            'total_items' => $total_items,
            'per_page' => $per_page,
        ));
    }

    /**
     * Count and return the number of selected google fonts in user option
     */
    function gfontscount() {
        $userID = get_current_user_id();
        $_options = get_user_option('wpimager_options', $userID);
        $options = unserialize($_options);
        $count = 0;
        if (!empty($options['gfonts'])) {
            $count = substr_count($options['gfonts'], ":1");
        }
        return $count;
    }

}

if (!function_exists('wpimager_canvas_headscript')) {

    function wpimager_canvas_headscript() {

        $userID = get_current_user_id();
        $_options = get_user_option('wpimager_options', $userID);
        $options = unserialize($_options);

        if (!isset($options['gfonts'])) {
            // set default google fonts
            $options['gfonts'] = WPIMAGER_FONTS_DEFAULT;
            update_user_option($userID, 'wpimager_options', serialize($options));
        }
        ?>
        <script type="text/javascript">
            var canvas_id, nonce;


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
                $(".previewthumb-wrapper").width($("#the-list").width() - 16);
            });

            function popCopyCanvas(_canvas_id, _nonce)
            {
                canvas_id = _canvas_id;
                nonce = _nonce;
                (function ($) {
                    $(".prompt-delete").hide();
                    $("#dialog-copy-canvas").appendTo($("#canvas-form-" + canvas_id.toString()));
                    $("#dialog-copy-canvas").show();
                })(jQuery);
            }

            function postCopyCanvas()
            {
                jQuery.ajax({
                    'dataType': 'json',
                    'success': function (data) {
                        window.location = "<?php echo esc_url($admin_url) ?>?page=wpimager_canvas";
                    },
                    'type': 'POST',
                    'url': ajaxurl,
                    'cache': false,
                    'data': {action: 'copycanvas', title: jQuery("#copytitle").val(), canvas_id: canvas_id, _wpnonce: nonce},
                });

            }
            function confirmdeleteCanvas(id) {
                (function ($) {
                    $('.prompt-delete,#dialog-copy-canvas').hide();
                    $('#delete-' + id.toString()).show();
                })(jQuery);
            }
            /**
             *  Delete Canvas. Admin or author only
             */
            function deleteCanvas(id, _nonce) {
                canvas_id = id;
                nonce = _nonce;
                jQuery.ajax({
                    type: 'POST',
                    url: ajaxurl,
                    data: {action: 'deletecanvas', canvas_id: canvas_id, _wpnonce: nonce
                    },
                    dataType: 'json',
                    cache: false,
                    success: function (msg) {
                        jQuery("#delete-" + canvas_id.toString()).closest('tr').slideUp();

                    }
                });
            }

            /**
             * Pin Canvas to top
             * */
            function pinCanvas(id, _nonce, val) {
                canvas_id = id;
                nonce = _nonce;
                jQuery.ajax({
                    type: 'POST',
                    url: ajaxurl,
                    data: {action: 'pincanvas', canvas_id: canvas_id, _wpnonce: nonce, pin: val
                    },
                    dataType: 'json',
                    cache: false,
                    success: function (msg) {
                        window.location = "<?php echo esc_url($admin_url) ?>?page=wpimager_canvas";
                    }
                });
            }
        </script>
        <style>
            #wpbody .update-nag {
                display: none;
            }
            #the-list .button .dashicons {
                line-height: 28px !important;
                height:28px !important;
                color:#fff !important;
            }
            #the-list .button {
                margin-right: 4px !important;
                border:none;
                background-color:#e5e5e5 !important;

            }
            #the-list .button.btn-red {
                /*				background-color:#cd0a0a !important;*/
                background-color:#ef5350 !important;
            }
            #the-list .button.btn-white {
                background-color:#fff !important;
                color:#007cc1 !important;
            }
            #the-list .button.btn-white .dashicons {
                color:#007cc1 !important;
            }
            #the-list .button.btn-cyan  {
                background-color:#4dd0e1 !important;
            }
            #the-list .button.btn-grey {
                background-color:#bbb !important;
                color:#fff !important;
            }
            #the-list .button.btn-primary {
                background-color:#007cc1 !important;
                color:#fff !important;
            }
            #the-list tr {
                overflow: hidden;
            }
            #the-list td {
                position: relative;
            }
            #mode {
                padding-right:110px;
            }
            .wp-list-table .column-title { width: 45%; }
            /*            .wp-list-table .column-author { width: 15%;}*/
            /*            .wp-list-table .column-updated { width: 15%;}
                                    .wp-list-table .column-created { width: 15%; }*/
            .wp-list-table .column-mode { 
                width: 40%; 
                text-align: right;
            }
            .notice2 {
                background: #fff;
                border-left-width: 4px;
                border-left-style: solid;
                -webkit-box-shadow: 0 1px 1px 0 rgba(0,0,0,.1);
                box-shadow: 0 1px 1px 0 rgba(0,0,0,.1);
                margin: 5px 0 15px;
                padding: 1px 12px;
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
            .previewthumb-wrapper {
                position: absolute;
                top:43px;
                left:0px;
                width:100%;
                overflow:hidden;
            }
            .previewthumb {
                max-height:55px;
                opacity: 0.5;
                margin-left: 110px;
            }
            td:hover .previewthumb {
                opacity: 1;
            }
            #dialog-copy-canvas {
                display: none;
            }

        </style>

        <?php
    }

}


if (!function_exists('wpimager_canvas')) {

    /**
     * Setup Screen option. Number of Canvas per page.
     */
    function wpimager_canvas_add_options() {
        $option = 'per_page';
        $args = array(
            'label' => 'Canvases per page',
            'default' => 10,
            'option' => 'canvas_per_page'
        );
        add_screen_option($option, $args);
    }

    add_filter('set-screen-option', 'wpimager_canvas_set_option', 10, 3);

    /**
     * Set Number of Canvas per page.
     */
    function wpimager_canvas_set_option($status, $option, $value) {

        if ('canvas_per_page' == $option)
            return $value;

        return $status;
    }

    /**
     * Canvas view displays the list of created canvases
     */
    function wpimager_canvas() {
        global $wpimager_canvas_ui, $WPImagerEditor;
        $wpimager_canvas_ui = new UI_WPImager_Canvas();
        $wpimager_canvas_ui->prepare_items();
        ?>
        <div class="wrap">

            <?php
            // upload directory 
            $WPImagerEditor->wpimager_directory(WPIMAGER_ASSET_DIR);
            // temp directory
            $WPImagerEditor->wpimager_directory(WPIMAGER_TEMP_DIR);
            ?>
            <?php require_once WPIMAGER_PLUGIN_PATH . 'include/header.php'; ?>
            <?php if (false && $wpimager_canvas_ui->gfontscount() < $wpimager_canvas_ui->minGFonts): ?>
                <div class="notice notice-warning">
                    <p>Please select at least <?php echo $wpimager_canvas_ui->minGFonts ?> fonts for text formatting on the canvas. 
                        <br> You have <?php echo $wpimager_canvas_ui->gfontscount() ?> Google fonts selected. <a href="<?php echo $admin_url ?>?page=wpimager_gfonts" class="">Click here</a> to make the selections.</p>
                </div>
            <?php endif; ?>
            <form method="post" id="filter" action="<?php echo $_SERVER['PHP_SELF']; ?>?page=wpimager_canvas">
                <?php
                $wpimager_canvas_ui->display();
                ?>
                <div class="alignright">
                    <p class="description">WPImager <?php echo WPIMAGER_VERSION ?></p>
                </div>
            </form>
            <div id="dialog-copy-canvas" style="margin:8px 0">
                <input type="text" maxlength="80" id="copytitle" class="form-control" name="copytitle" placeholder="Canvas Title" value="<?php echo $modelCanvas->title; ?>"/>
                <button type="button" class="button btn-primary" onclick="postCopyCanvas();
                                return false;">Make a Copy</button>
            </div>
        </div>
    <?php } ?>
    <?php
} 