<?php

/*
 * Plugin Name: WPImager
 * Plugin URI: https://wpimager.com/
 * Description: The visual editing tool for WordPress. Create rich looking visuals from within WordPress.
 * Author: WPImager
 * Version: 1.0.0
 *
 * WPImager is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * WPImager is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with WPImager. If not, see <http://www.gnu.org/licenses/>.
 */

if (!defined('ABSPATH'))
    exit; // Exit if accessed directly

define("WPIMAGER_VERSION", "1.0.0");
define("WPIMAGER_GOOGLEFONT_API", "//fonts.googleapis.com/css?family=");
define("WPIMAGER_ASSET_PATH", "/wpimager/");
define("WPIMAGER_ASSET_DIR", WP_CONTENT_DIR . WPIMAGER_ASSET_PATH);
define("WPIMAGER_TEMP_DIR", get_temp_dir());
define("WPIMAGER_PLUGIN_URL", plugin_dir_url(__FILE__));
define("WPIMAGER_PLUGIN_PATH", plugin_dir_path(__FILE__));
define("WPIMAGER_URL", "https://wpimager.com");
define("WPIMAGER_FONTS_DEFAULT", '{"ABeeZee":1,"Abril Fatface":1,"Arvo":1,"Architects Daughter":1,"Anonymous Pro":1,"Candal":1,"Ultra":1,"Marck Script":1,"Modak":1,"Playfair Display SC":1,"Lato":1,"Roboto":1,"Zeyada":1,"Merriweather Sans":1,"Jura":1,"Droid Sans":1,"Chivo":1,"Anton":1,"Josefin Slab":1,"Vollkorn":1,"Ubuntu":1,"PT Serif":1,"Old Standard TT":1}');

if (!defined('WP_DEBUG')) {
    define('WP_DEBUG', true);
}


if (!class_exists('WPImagerEditor')):

    final Class WPImagerEditor {

        /** Refers to a single instance of this class. */
        private static $instance = null;

        /* Saved options */
        public $options;
        private $is_admin = false;
        private $is_user_licensed = false;

        /**
         * Creates or returns an instance of this class.
         */
        public static function get_instance() {

            if (null == self::$instance) {
                self::$instance = new self;
            }

            return self::$instance;
        }

        public function init() {
            global $current_user;
            wp_get_current_user();
            $this->is_admin = current_user_can("administrator");
            $this->is_user_licensed = current_user_can("WPIMAGER_USER_LICENSE");
            wpimager_call_include_page();
        }

        /**
         * Verify user has wpimager access
         */
        public function WPImagerAccess() {
            if ($this->is_user_licensed) {
                return;
            }
            if ($this->is_admin && $_REQUEST['page'] == 'wpimager_useraccess') {
                return;
            }

            if ($this->is_admin && trim($_REQUEST['page']) !== 'wpimager_useraccess') {
                wp_redirect("admin.php?page=wpimager_useraccess");
                exit;
            }

            echo "<p>Access denied. Please check permission with your Wordpress administrator.</p>";
            wp_die();
        }

        /**
         * Initialize the plugin by setting localization, filters, and administration functions.
         */
        private function __construct() {

            // user permission check
            add_action('plugins_loaded', array(&$this, 'init'));

            $this->action_init();


            // register shortcodes
            add_action('init', array(&$this, 'register_shortcodes'));

            // Add plugin submenus to the admin menu.
            add_action('admin_menu', array(&$this, 'action_menu_page'));

            // Create tables when plugin is activated.
            register_activation_hook(__FILE__, array(&$this, 'action_create_tables'));

            // Create Page actions
            add_action('wp_ajax_newcanvas', array(&$this, 'callback_create_newcanvas'));

            add_action('wp_ajax_createcanvas_printscreen', array(&$this, 'callback_createcanvas_printscreen'));

            add_action('wp_ajax_importzip', array(&$this, 'callback_create_importzip'));

            // Canvas Page actions
            add_action('wp_ajax_copycanvas', array(&$this, 'callback_canvas_copycanvas'));

            add_action('wp_ajax_pincanvas', array(&$this, 'callback_canvas_pincanvas'));

            add_action('wp_ajax_deletecanvas', array(&$this, 'callback_canvas_deletecanvas'));

            // Google fonts actions
            add_action('wp_ajax_update_gfonts', array(&$this, 'callback_options_gfonts'));

            add_action('wp_ajax_googlefonts_list', array(&$this, 'callback_googlefonts_list'));

            add_action('wp_ajax_user_fetch_fonts', array(&$this, 'callback_userfonts_list'));

            // Editor actions
            add_action('wp_ajax_loadcanvas', array(&$this, 'callback_editor_loadcanvas'));

            add_action('wp_ajax_loadmediaimages', array(&$this, 'callback_editor_loadmedia'));

            add_action('wp_ajax_deletemediaimage', array(&$this, 'callback_editor_deletemedia'));

            add_action('wp_ajax_uploadmediaimage', array(&$this, 'callback_editor_uploadmedia'));

            add_action('wp_ajax_uploadbase64', array(&$this, 'callback_editor_uploadbase64'));

            add_action('wp_ajax_quickdownload', array(&$this, 'callback_editor_postthumbload'));

            add_action('wp_ajax_postdownload', array(&$this, 'callback_editor_postthumbload'));

            add_action('wp_ajax_postthumbnail', array(&$this, 'callback_editor_postthumbload'));

            add_action('wp_ajax_update_title', array(&$this, 'callback_editor_updatetitle'));

            add_action('wp_ajax_printcanvas', array(&$this, 'callback_editor_printcanvas'));

            add_action('wp_ajax_savecanvas', array(&$this, 'callback_editor_savecanvas'));

            add_action('wp_ajax_savecolors', array(&$this, 'callback_editor_savecolors'));


            // Media search function
            add_filter('posts_search', array(&$this, 'guid_media_canvas_search'));
        }

        /**
         * Define tables and check upload directory
         */
        function action_init() {
            global $wpdb;

            // define database tables
            $wpdb->wpimager_db = $wpdb->prefix . "wpimager";
        }

        function wpimager_directory($asset_dir) {
            if (!file_exists($asset_dir)) {
                wp_mkdir_p($asset_dir);
            }
            if (!is_writable($asset_dir)) {
                echo '<div class="notice notice-error"><p>Could not write to ' . $asset_dir . '. Please check filesystem permissions.</p></div>';
            }
        }

        function register_shortcodes() {
            
        }

        /**
         * Make a duplicate copy of an existing canvas
         */
        function callback_canvas_copycanvas() {
            global $wpdb, $current_user;


            $_POST = array_map('stripslashes_deep', $_POST);

            $source_id = (int) $_POST['canvas_id'];

            // verify nonce
            if (!wp_verify_nonce($_REQUEST['_wpnonce'], 'wpimager_copy' . $source_id)) {
                die();
            }

            $this->WPImagerAccess();

            // init variables
            $user_id = $current_user->ID;
            $title = sanitize_text_field($_POST['title']);
            $return_arr['success'] = false;
            $inserted = false;
            $time = time();



            // fetch the canvas to be copied
            $table_name = $wpdb->wpimager_db;
            $original_canvas = $wpdb->get_row($wpdb->prepare('SELECT * FROM ' . $table_name . ' WHERE id = %d AND disposed=0', $source_id));

            if ($original_canvas) {
                if ($original_canvas->user_id != $user_id) {
                    // not canvas author
                    wp_die();
                }
                // create a copy of canvas in database
                $inserted = $wpdb->insert($table_name, array(
                    'title' => $title,
                    'settings' => $original_canvas->settings,
                    'user_id' => $user_id,
                    'pinned' => 1,
                    'created' => $time,
                    'updated' => $time), array('%s', '%s', '%d', '%d', '%d', '%d'));
                $return_arr['success'] = $inserted;
            }

            if ($inserted) {

                // update title if none specified by user
                $wpimager = $wpdb->get_row($wpdb->prepare('SELECT id FROM ' . $wpdb->wpimager_db . ' WHERE disposed = 0 ORDER BY created DESC'));
                $return_arr['canvas_id'] = $wpimager->id;

                $canvas_settings = str_replace(',"id":' . $original_canvas->id . ',', ',"id":' . $wpimager->id . ',', $original_canvas->settings);

                $title = empty($title) ? $original_canvas->title . " (copy)" : $title;
                $update = $wpdb->update(
                        $table_name, array(
                    'title' => $title,
                    'settings' => $canvas_settings,
                    'updated' => $time + 1
                        ), array('id' => $wpimager->id), // not deleted
                        array('%s', '%s', '%d'), array('%d')
                );
                // copy canvas thumbnail image
                $wp_upload_dir = wp_upload_dir();
                $upload_dir_source = $wp_upload_dir['basedir'] . '/wpimager/canvas-' . $source_id;
                $upload_dir_target = $wp_upload_dir['basedir'] . '/wpimager/canvas-' . $wpimager->id;

                $thumb_source = $upload_dir_source . "/IMG" . $source_id . "_thumb.png";
                $thumb_target = $upload_dir_target . "/IMG" . $wpimager->id . "_thumb.png";
                if (file_exists($thumb_source)) {
                    copy($thumb_source, $thumb_target);
                }
            }

            echo json_encode($return_arr);

            wp_die();
        }

        /**
         * Pin / unpin Canvas on dashboard
         */
        function callback_canvas_pincanvas() {
            global $wpdb;
            $canvas_id = (int) $_POST['canvas_id'];
            $pin = (int) $_POST['pin'];

            // verify nonce
            if (!wp_verify_nonce($_REQUEST['_wpnonce'], 'wpimager_pin' . $canvas_id)) {
                die();
            }

            $this->WPImagerAccess();

            // fetch canvas to be pinned / unpinned
            $table_name = $wpdb->wpimager_db;
            $canvas = $wpdb->get_row($wpdb->prepare('SELECT * FROM ' . $table_name . ' WHERE id = %d', $canvas_id));

            if ($canvas) {
                $userID = get_current_user_id();
                if ($canvas->user_id != $userID) {
                    // not canvas author
                    wp_die();
                }
                // pin or unpin canvas
                $result = $wpdb->update(
                        $table_name, array(
                    'pinned' => $pin // 1 - pin, 0 - unpin
                        ), array('id' => $canvas_id, 'disposed' => 0), array('%d'), array('%d')
                );
            }

            $return_arr['success'] = true;
            echo json_encode($return_arr);
            wp_die();
        }

        /**
         * Delete Canvas from dashboard
         */
        function callback_canvas_deletecanvas() {
            global $wpdb;
            $canvas_id = (int) $_POST['canvas_id'];

            // verify nonce
            if (!wp_verify_nonce($_REQUEST['_wpnonce'], 'wpimager_delete' . $canvas_id))
                die();

            $this->WPImagerAccess();

            $table_name = $wpdb->wpimager_db;
            // allow only self or admin to delete canvas
            if ($this->is_admin) {
                $sql = $wpdb->prepare('SELECT * FROM ' . $table_name . ' WHERE id = %d', $canvas_id);
            } else {
                $userID = get_current_user_id();
                $sql = $wpdb->prepare('SELECT * FROM ' . $table_name . ' WHERE id = %d AND user_id = %d', $canvas_id, $userID);
            }

            $canvas = $wpdb->get_row($sql);

            if ($canvas) {
                // flag canvas disposed
                $result = $wpdb->update(
                        $table_name, array(
                    'disposed' => time()
                        ), array('id' => $canvas_id,
                    'disposed' => 0), array('%d'), array('%d')
                );
            }

            $return_arr['success'] = true;
            echo json_encode($return_arr);
            wp_die();
        }

        /**
         * Insert a new canvas into database
         * @return array 
         */
        function newcanvas_ID() {
            global $wpdb, $current_user;

            // prepare new canvas variables
            $user_id = $current_user->ID;

            // insert new canvas
            $table_name = $wpdb->wpimager_db;


            $wpimager = $wpdb->get_row($wpdb->prepare('SELECT id FROM ' . $wpdb->wpimager_db . ' WHERE user_id = %d AND created = %d AND updated = %d AND disposed > %d ORDER BY created DESC', $user_id, 0, 0, 0));
            if ($wpimager) {
                return $wpimager->id;
            }

            $wpdb->insert($table_name, array(
                'title' => '',
                'user_id' => $user_id,
                'created' => 0,
                'updated' => 0,
                'disposed' => time()), array('%s', '%d', '%d', '%d', '%d'));

            // fetch id of new canvas 
            $newcanvas = $wpdb->get_row($wpdb->prepare('SELECT id FROM ' . $wpdb->wpimager_db . ' WHERE user_id = %d AND created = %d AND updated = %d AND disposed > %d ORDER BY created DESC', $user_id, 0, 0, 0));
            return $newcanvas->id;
        }

        /**
         * Insert a new canvas into database
         * @return array 
         */
        function newcanvas_insert() {
            global $wpdb, $current_user;

            // prepare new canvas variables
            $user_id = $current_user->ID;

            // insert new canvas
            $table_name = $wpdb->wpimager_db;
            $wpdb->insert($table_name, array(
                'title' => '',
                'user_id' => $user_id,
                'created' => time(),
                'updated' => time()), array('%s', '%d', '%d', '%d'));

            // fetch id of new canvas 
            $wpimager = $wpdb->get_row($wpdb->prepare('SELECT id FROM ' . $wpdb->wpimager_db . ' WHERE disposed = %d ORDER BY created DESC', 0));


            return array(
                'id' => $wpimager->id,
                'title' => '',
                'success' => true
            );
        }

        function newcanvas_mode() {
            $mode = "custom";
            if (in_array($_REQUEST['mode'], array("cover", "custom"))) {
                $mode = $_REQUEST['mode'];
            }
            return $mode;
        }

        /**
         * Create New Canvas with dimension specified
         */
        function callback_create_newcanvas() {
            global $wpdb;

            $_POST = array_map('stripslashes_deep', $_POST);

            // verify nonce
            if (!wp_verify_nonce($_REQUEST['_wpnonce'], 'wpimager_create')) {
                die();
            }

            $this->WPImagerAccess();

            if (!$this->isJson($_POST['cvs'])) {
                wp_die();
            }

            // start to create canvas
            $_cvs = json_decode($_POST['cvs'], true);
            $cvs_default = array(
                "title" => "",
                "imgsrc" => "",
                "cvswidth" => 0,
                "cvsheight" => 0,
                "imgx" => 0,
                "imgy" => 0,
                "imgwidth" => 0,
                "imgwidth_ori" => 0,
                "imgheight" => 0,
                "imgheight_height" => 0,
            );
            // normalize & sanitize $cvs
            $cvs = array_merge($cvs_default, $_cvs);
            foreach ($cvs_default as $key => $cvs_par_val) {
                if ($key == 'title') {
                    $cvs[$key] = sanitize_text_field($cvs[$key]);
                } else if ($key == 'imgsrc') {
                    $cvs[$key] = filter_var($cvs[$key], FILTER_SANITIZE_URL);
                } else if ($cvs_par_val === 0) {
                    $cvs[$key] = (int) $cvs[$key];
                }
            }

            $canvas_id = (int) $_POST['canvas_id'];

            // prepare new canvas variables
            $user_id = get_current_user_id();

            // insert new canvas
            $table_name = $wpdb->wpimager_db;

            $canvas = $wpdb->get_row($wpdb->prepare('SELECT id FROM ' . $wpdb->wpimager_db . ' WHERE id = %d AND user_id = %d AND created = %d AND updated = %d AND disposed > %d ORDER BY created DESC', $canvas_id, $user_id, 0, 0, 0));
            if ($canvas) {
                $return_arr = array(
                    'id' => $canvas->id,
                    'title' => '',
                    'success' => true
                );
            } else {
                // create new canvas
                $return_arr = $this->newcanvas_insert();
            }


            $return_arr['nonce'] = wp_create_nonce('wpimager_editor' . $return_arr['id']);
            echo json_encode($return_arr);

            $canvas_width = $cvs['cvswidth'];
            $canvas_height = $cvs['cvsheight'];
            $title = $cvs['title'];

            $mode = ($cvs['mode'] == "cover") ? "cover" : "custom";
            $settings_arr['canvas'] = '{"version":"' . WPIMAGER_VERSION . '","id":0,"width":' . $canvas_width . ',"height":' . $canvas_height . ',"imgkeepratio":1,"txtkeepratio":1,"current":1,"textdir":"ltr","picktool":"home","shared":0,"disposed":0}';
            $settings_arr['layers'] = '{}';
            $settings_arr['slides'] = '{}';
            $settings_arr['addons'] = '{}';

            if ($mode == "cover" || $mode == "custom") {
                $submode = '';
                if ($mode == "cover") {
                    $submode = sanitize_text_field($cvs['submode']);
                }
                $settings_arr['slides'] = '{"1":{"mode":"' . $mode . '","submode":"' . $submode . '","index":1,"order":1,"slidetitle":"","canvas_width":' . $canvas_width . ',"canvas_height":' . $canvas_height . ',"disposed":0}}';
                if (!empty($cvs['imgsrc'])) {
                    $media_src = $cvs['imgsrc'];
                    $imgx = $cvs['imgx'];
                    $imgy = $cvs['imgy'];
                    $imgwidth = $cvs['imgwidth'];
                    $imgheight = $cvs['imgheight'];
                    $imgwidth_ori = $cvs['imgwidth_ori'];
                    $imgheight_ori = $cvs['imgheight_ori'];
                    if (!filter_var($media_src, FILTER_VALIDATE_URL, FILTER_FLAG_PATH_REQUIRED) === false) {
                        $settings_arr['layers'] = '{"1":{"code":1,"slide":1,"index":1,"src":"' . $media_src . '","imgcrop_x":0,"imgcrop_y":0,"imgcrop_h":0,"imgcrop_w":0,"imgx":' . $imgx . ',"imgy":' . $imgy . ',"imgwidth":' . $imgwidth . ',"imgheight":' . $imgheight . ',"imgwidth_ori":' . $imgwidth_ori . ',"imgheight_ori":' . $imgheight_ori . ',"imgradius":0,"imgrotation":0,"imgshadow":0,"imgshadowOx":0,"imgshadowOy":0,"imgshadowcolor":"#000000","absLeft":0,"absRight":' . $imgwidth . ',"absTop":0,"absBottom":' . $imgheight . ',"imgalpha":100,"imgbackcolor":"","disposed":0,"visible":true,"locked":false}}';
                    }
                }
            } else {
                wp_die();
            }
            $settings = base64_encode(serialize($settings_arr));

            // give canvas a title
            $update = $wpdb->update(
                    $table_name, array(
                'title' => (empty($title) ? "Canvas #" . $return_arr['id'] : $title),
                'created' => time(),
                'updated' => time(),
                'settings' => $settings,
                'disposed' => 0
                    ), array('id' => $return_arr['id']), array('%s', '%d', '%d', '%s', '%d'), array('%d')
            );
            wp_die();
        }

        /**
         * Create New Canvas by uploading clipboard image 
         */
        function callback_createcanvas_printscreen() {
            global $wpdb;

            // verify nonce
            if (!wp_verify_nonce($_REQUEST['_wpnonce'], 'wpimager_create')) {
                die();
            }

            $this->WPImagerAccess();

            $jsondata = file_get_contents("php://input");
            parse_str($jsondata, $jsonpost);

            $return_arr = $this->uploadfoto($jsonpost);


            echo json_encode($return_arr);
            wp_die();
        }

        /**
         * Upload photo called by callback_editor_uploadbase64, callback_createcanvas_printscreen
         */
        function uploadfoto($jsonpost) {
            $timestamp = time();

            if (!function_exists('wp_handle_upload')) {
                require_once( ABSPATH . 'wp-admin/includes/file.php' );
            }

            $canvas_id = (int) $jsonpost['canvas_id'];
            $imageData = $jsonpost['imageData'];
            $ext = (!empty($jsonpost['ext']) && in_array($_POST['ext'], array("png", "jpg"))) ? $_POST['ext'] : "png";


            $imgdata_canvas = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imageData));
            $fileloc = $this->image_upload_path($canvas_id, $timestamp, $ext);

            if (!file_exists(dirname($fileloc))) {
                wp_mkdir_p(dirname($fileloc), 0755, true);
            }
            file_put_contents($fileloc, $imgdata_canvas);

            $attach_data = $this->attachWPMedia($canvas_id, $fileloc, false, false);
            return array(
                'width' => $attach_data['width'],
                'height' => $attach_data['height'],
                'success' => true,
                'src' => $attach_data['src'],
                'attachment' => $attach_data
            );
        }

        function attachWPMedia($canvas_id, $fileloc, $use_wp_upload_dir, $unlink_file) {
            $wp_upload_dir = wp_upload_dir();
            if ($use_wp_upload_dir) {
                $uploadfile = $wp_upload_dir['path'] . '/' . basename($fileloc);
                if (!file_exists(dirname($fileloc))) {
                    wp_mkdir_p(dirname($uploadfile), 0755, true);
                }
                rename($fileloc, $uploadfile);
                $guid = $wp_upload_dir['url'] . '/' . basename($fileloc);
            } else {
                $uploadfile = $fileloc;
            }

            $filetype = wp_check_filetype(basename($fileloc), null);
            // prepare image attachment array
            $attachment = array(
                'guid' => $guid,
                'post_mime_type' => $filetype['type'],
                'post_title' => preg_replace('/\.[^.]+$/', '', basename($fileloc)),
                'post_content' => '',
                'post_status' => 'inherit',
            );

            if ($canvas_id) {
                $attachment['wpimager_canvas_id'] = $canvas_id;
            }


            require_once( ABSPATH . 'wp-admin/includes/image.php' );
            $attach_id = wp_insert_attachment($attachment, $uploadfile);

            // Generate the metadata for the attachment, and update the database record.
            $attach_data = wp_generate_attachment_metadata($attach_id, $uploadfile);
            wp_update_attachment_metadata($attach_id, $attach_data);

            if ($unlink_file) {
                // remove image file from temp dir
                @unlink($fileloc);
            }
            $attach_data['src'] = $wp_upload_dir['baseurl'] . '/' . $attach_data['file'];
            $attach_data['attach_id'] = $attach_id;
            return $attach_data;
        }

        /**
         * Google Font selections  
         */
        function callback_options_gfonts() {
            $_POST = array_map('stripslashes_deep', $_POST);

            // verify nonce
            if (!wp_verify_nonce($_REQUEST['_wpnonce'], 'wpimager_options_gfonts')) {
                die();
            }

            $this->WPImagerAccess();

            if (isset($_POST['fonts']) &&
                    $this->isJson($_POST['fonts'])) {
                $userID = get_current_user_id();
                $_options = get_user_option('wpimager_options', $userID);
                if (!empty($_options)) {
                    $options = unserialize($_options);
                }
                if (!isset($options['gfonts'])) {
                    // set default google fonts
                    $options['gfonts'] = WPIMAGER_FONTS_DEFAULT;
                }
                $options['gfonts'] = sanitize_text_field($_POST['fonts']);
                update_user_option($userID, 'wpimager_options', serialize($options));
                $return_arr['success'] = true;
                echo json_encode($return_arr);
            }

            wp_die();
        }

        function image_upload_path($canvas_id, $timestamp, $ext = "png") {
            $filename = $this->image_filename($canvas_id, $timestamp, $ext);
            $wp_upload_dir = wp_upload_dir();
            return $wp_upload_dir['basedir'] . '/wpimager/canvas-' . $canvas_id . '/' . $filename;
        }

        function image_filename($canvas_id, $timestamp, $ext = "png") {
            $filename = "IMG" . $canvas_id . "_" . $timestamp . "." . $ext;
            return $filename;
        }

        /**
         * Fectch Canvas for canvas editor
         */
        function callback_editor_loadcanvas() {
            global $wpdb;
            $_POST = array_map('stripslashes_deep', $_POST);
            $canvas_id = (int) $_POST['canvas_id'];

            // verify nonce
            if (!wp_verify_nonce($_REQUEST['_wpnonce'], 'wpimager' . $canvas_id)) {
                die();
            }
            $this->WPImagerAccess();

            $userID = get_current_user_id();

            $table_name = $wpdb->wpimager_db;
            $canvas = $wpdb->get_row($wpdb->prepare('SELECT * FROM ' . $table_name . ' WHERE id=%d AND disposed = 0', $canvas_id));

            if (!$canvas) {
                $return_arr['success'] = false;
                $return_arr['message'] = 'Canvas not found!';
                echo json_encode($return_arr);
                wp_die();
            } else if ($canvas->user_id != $userID) {
                $return_arr['success'] = false;
                $return_arr['message'] = 'You are not authorized to edit this canvas. Only the author can do so.';
                echo json_encode($return_arr);
                wp_die();
            }

            $par = unserialize(base64_decode($canvas->settings));
            $_options = get_user_option('wpimager_options', $userID);
            $options = unserialize($_options);

            // get app options
            $_app_options = get_option('wpimager_options');
            $app_options = unserialize($_app_options);
            $gfontapi = WPIMAGER_GOOGLEFONT_API;
            if (!empty($app_options['gfontapi'])) {
                $gfontapi = $app_options['gfontapi'];
            }

            if (!isset($options['gfonts'])) {
                // set default google fonts
                $options['gfonts'] = WPIMAGER_FONTS_DEFAULT;
            }

            $return_arr['id'] = $canvas_id;
            $return_arr['cloudcanvas'] = $par['canvas'];
            $return_arr['cloudlayers'] = $par['layers'];
            $return_arr['cloudslides'] = $par['slides'];
            $return_arr['cloudaddons'] = (isset($par['addons']) ? $par['addons'] : '{}');
            $return_arr['cloudzipimg'] = (isset($par['zipimg']) ? $par['zipimg'] : '{}');
            $return_arr['colorpalettes'] = isset($options['colorpalettes']) ? $options['colorpalettes'] : '{}';
            $return_arr['cloudgfonts'] = $options['gfonts'];
            $return_arr['googlefonts'] = $this->get_googlefonts_list();
            $return_arr['googlefontsapi'] = $gfontapi;


            $return_arr['success'] = true;
            echo json_encode($return_arr);
            wp_die();
        }

        function callback_editor_loadmedia() {
            global $wpdb;

            $_POST = array_map('stripslashes_deep', $_POST);

            $canvas_id = (int) $_POST['canvas_id'];

            if (!wp_verify_nonce($_REQUEST['_wpnonce'], 'wpimager' . $canvas_id)) {
                die();
            }

            $this->WPImagerAccess();

            $paged = ($paged == 0) ? 1 : (int) $_POST['paged'];

            $query_images_args = array(
                'post_type' => 'attachment',
                'post_mime_type' => 'image',
                'post_status' => 'inherit',
                'posts_per_page' => 20,
                'orderby' => 'post_date',
                'order' => 'DESC',
                'paged' => $paged
            );

            $query_images = new WP_Query($query_images_args);

            $images = array();
            foreach ($query_images->posts as $image) {
                $images[$image->ID] = wp_get_attachment_metadata($image->ID);
            }
            $return_arr['success'] = true;
            $return_arr['images'] = $images;
            $return_arr['paged'] = $paged;
            echo json_encode($return_arr);
            wp_die();
        }

        function callback_editor_deletemedia() {

            $_POST = array_map('stripslashes_deep', $_POST);

            $canvas_id = (int) $_POST['canvas_id'];

            if (!wp_verify_nonce($_REQUEST['_wpnonce'], 'wpimager' . $canvas_id)) {
                die();
            }

            $this->WPImagerAccess();

            $attachment_id = (int) $_POST['attachment_id'];
            $return_arr['success'] = !(wp_delete_attachment($attachment_id) === false);
            echo json_encode($return_arr);
            wp_die();
        }

        function callback_editor_uploadmedia() {
            global $wpdb;
            require_once 'include/Uploader.php';

            $_POST = array_map('stripslashes_deep', $_POST);

            $canvas_id = (int) $_REQUEST['canvas_id'];

            if (!wp_verify_nonce($_REQUEST['_wpnonce'], 'wpimager' . $canvas_id)) {
                die();
            }

            $this->WPImagerAccess();

            $user_id = get_current_user_id();

            // prepare canvas in database
            $criteria = (isset($_REQUEST['_source']) && $_REQUEST['_source'] == 'wpimager_create') ? 'created = %d' : 'disposed = %d';
            $canvas = $wpdb->get_row($wpdb->prepare('SELECT id FROM ' . $wpdb->wpimager_db . ' WHERE user_id = %d AND ' . $criteria . ' ORDER BY created DESC', $user_id, 0));
            if (!$canvas) {
                wp_die(); // not canvas author
            }

            $timestamp = time();

            $wp_upload_dir = wp_upload_dir();

            $upload_dir = $wp_upload_dir['basedir'] . '/wpimager/canvas-' . $canvas_id;


            $uploader = new WPImagerFileUpload('uploadfile');
            $ext = $uploader->fileExtension;
            $filename = $this->image_filename($canvas_id, $timestamp, $ext);


            $fileloc = $upload_dir . '/' . $filename;
            if (!file_exists(dirname($fileloc))) {
                wp_mkdir_p(dirname($fileloc), 0755, true);
            }


            if (!in_array(strtolower($ext), array('png', 'jpg', 'jpeg'))) {
                $return_arr['success'] = false;
                $return_arr['msg'] = 'Invalid zip file uploaded!';
                echo json_encode($return_arr);
                wp_die();
            }

            $uploader->newFileName = $filename;
            // Handle the upload
            $result = $uploader->handleUpload($upload_dir);
            if (!$result) {
                $return_arr['success'] = false;
                $return_arr['msg'] = $uploader->getErrorMsg();
                echo json_encode($return_arr);
                wp_die();
            }

            $return_arr["success"] = true;

            $attach_data = $this->attachWPMedia($canvas_id, $fileloc, false, false);
            $return_arr['attach_data'] = $attach_data;
            echo json_encode($return_arr);
            wp_die();
        }

        /**
         * Change Canvas title via canvas editor page
         */
        function callback_editor_updatetitle() {
            global $wpdb;
            $_POST = array_map('stripslashes_deep', $_POST);
            $userID = get_current_user_id();
            $canvas_id = (int) $_POST['canvas_id'];

            // verify nonce
            if (!wp_verify_nonce($_REQUEST['_wpnonce'], 'wpimager_updatetitle' . $canvas_id)) {
                die();
            }

            $this->WPImagerAccess();

            $title = sanitize_text_field($_POST['title']);
            $table_name = $wpdb->wpimager_db;

            $return_arr['success'] = true;
            if (!empty($title)) {
                // update canvas title in database
                $update = $wpdb->update(
                        $table_name, array(
                    'title' => $title// column & new value
                        ), array('id' => $canvas_id, 'user_id' => $userID), // not deleted
                        array('%s'), array('%d', '%d')
                );

                $return_arr['id'] = $canvas_id;
                $return_arr['title'] = $title;
                $return_arr['success'] = true;
            }
            echo json_encode($return_arr);
            wp_die();
        }

        function callback_editor_uploadbase64() {
            global $wpdb;

            $timestamp = time();
            $jsondata = file_get_contents("php://input");
            parse_str($jsondata, $jsonpost);

            $canvas_id = (int) $jsonpost['canvas_id'];

            // verify nonce
            if (!wp_verify_nonce($jsonpost['_wpnonce'], 'wpimager' . $canvas_id)) {
                die();
            }

            $this->WPImagerAccess();

            $userID = get_current_user_id();
            $table_name = $wpdb->wpimager_db;
            $canvas = $wpdb->get_row($wpdb->prepare('SELECT * FROM ' . $table_name . ' WHERE id = %d AND disposed=0', $canvas_id));
            if (!$canvas || $canvas->user_id != $userID) {
                wp_die(); // not canvas author
            }


            $return_arr = $this->uploadfoto($jsonpost);
            echo json_encode($return_arr);


            wp_die();
        }

        function callback_editor_savecolors() {
            global $wpdb;

            $return_arr['success'] = false;

            $userID = get_current_user_id();
            // update database
            $_POST = array_map('stripslashes_deep', $_POST);
            $_options = get_user_option('wpimager_options', $userID);
            $options = unserialize($_options);
            if ($this->isJson($_POST['colorpalettes'])
                    && $this->isJson(sanitize_text_field($_POST['colorpalettes']))) {                
                $options['colorpalettes'] =  sanitize_text_field($_POST['colorpalettes']);
                update_user_option($userID, 'wpimager_options', serialize($options));
                $return_arr['success'] = true;
            }

            echo json_encode($return_arr);

            wp_die();
        }

        /**
         * Save canvas called from canvas editor
         */
        function callback_editor_savecanvas() {
            global $wpdb;

            $return_arr['success'] = false;

            $userID = get_current_user_id();
            // update database
            $_POST = array_map('stripslashes_deep', $_POST);
            $canvas_id = (int) $_POST['canvas_id'];

            // verify nonce
            if (!wp_verify_nonce($_REQUEST['_wpnonce'], 'wpimager' . $canvas_id)) {
                die();
            }

            $this->WPImagerAccess();

            $settings_arr['canvas'] = $this->isJson($_POST['canvas']) ? $_POST['canvas'] : "";
            $settings_arr['layers'] = $this->isJson($_POST['layers']) ? $_POST['layers'] : "";
            $settings_arr['slides'] = $this->isJson($_POST['slides']) ? $_POST['slides'] : "";
            $settings_arr['addons'] = $this->isJson($_POST['addons']) ? $_POST['addons'] : "";
            $settings = base64_encode(serialize($settings_arr));

            if (strlen($settings_arr['canvas']) > 0 && strlen($settings_arr['layers']) > 0 && strlen($settings_arr['slides']) > 0 && strlen($settings_arr['addons']) > 0) {
                // save canvas data in database
                $table_name = $wpdb->wpimager_db;
                $result = $wpdb->update(
                        $table_name, array(
                    'settings' => $settings,
                    'updated' => time()
                        ), array('id' => $canvas_id,
                    'user_id' => $userID, // author only
                    'disposed' => 0), array('%s', '%d'), array('%d', '%d')
                );
                $return_arr['success'] = ($result !== FALSE);
            }

            if ($return_arr['success'] === false) {
                $return_arr['message'] = 'Unable to save canvas. Please try again.';
            }
            echo json_encode($return_arr);
            wp_die();
        }

        /**
         * Generate Composed Canvas image and send to Media Library and Upload directory
         */
        function callback_editor_printcanvas() {
            $userID = get_current_user_id();

            $_POST = array_map('stripslashes_deep', $_POST);

            global $wpdb;
            if (!function_exists('wp_handle_upload')) {
                require_once( ABSPATH . 'wp-admin/includes/file.php' );
            }

            $canvas_id = (int) $_POST['canvas_id'];

            // verify nonce
            if (!wp_verify_nonce($_REQUEST['_wpnonce'], 'wpimager' . $canvas_id)) {
                die();
            }

            $this->WPImagerAccess();

            // handle long base64 string
            $jsondata = file_get_contents("php://input");
            parse_str($jsondata, $jsonpost);


            if (!$this->cap_upload_files()) {
                // user has no access to upload media files
                $return_arr['success'] = false;
                $return_arr['message'] = "Generate to media failed. No upload files permission.";
                echo json_encode($return_arr);
                wp_die();
            }

            $return_arr['success'] = false;

            $_ext = in_array($_POST['ext'], array("png", "jpg")) ? $_POST['ext'] : "png";

            // save posted canvas image as png file
            $imgCanvas = $jsonpost['imageCanvas'];
            $imgdata_canvas = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imgCanvas));
            $filename = "IMG" . $canvas_id . "_" . time() . "G." . $_ext;
            $fileloc = WPIMAGER_TEMP_DIR . $filename;

            file_put_contents($fileloc, $imgdata_canvas);


            $settings_arr['canvas'] = $this->isJson($_POST['canvas']) ? $_POST['canvas'] : "";
            $settings_arr['layers'] = $this->isJson($_POST['layers']) ? $_POST['layers'] : "";
            $settings_arr['slides'] = $this->isJson($_POST['slides']) ? $_POST['slides'] : "";
            $settings_arr['addons'] = $this->isJson($_POST['addons']) ? $_POST['addons'] : "";
            $settings = base64_encode(serialize($settings_arr));

            if (strlen($settings_arr['canvas']) > 0 && strlen($settings_arr['layers']) > 0 && strlen($settings_arr['slides']) > 0 && strlen($settings_arr['addons']) > 0) {
                // save canvas data in database
                $table_name = $wpdb->wpimager_db;
                $result = $wpdb->update(
                        $table_name, array(
                    'settings' => $settings, // column & new value
                    'updated' => time(),
                    'wplsent' => time(),
                        ), array('id' => $canvas_id,
                    'user_id' => $userID, // author only
                    'disposed' => 0), // not deleted
                        array(
                    '%s', '%s', '%d', '%d'
                        ), array('%d', '%d', '%d')
                );
                $return_arr['success'] = ($result !== FALSE);
            }

            if ($return_arr['success'] === false) {
                $return_arr['message'] = 'Unable to save canvas.';
                $return_arr['canvas'] = $canvas_id;
                echo json_encode($return_arr);
                wp_die();
            }

            $attach_data = $this->attachWPMedia($canvas_id, $fileloc, true, true);

            // log canvas print
            $return_arr['success'] = true;
            $return_arr['attach_id'] = $attach_data['attach_id'];
            $return_arr['attach_data'] = $attach_data;
            echo json_encode($return_arr);

            @unlink($fileloc);

            wp_die();
        }

        /**
         * Save Canvas image thumbnail after every canvas save
         * also doubles to save full canvas image on server before download
         */
        function callback_editor_postthumbload() {

            // update database
            $_POST = array_map('stripslashes_deep', $_POST);

            global $wpdb;
            if (!function_exists('wp_handle_upload')) {
                require_once( ABSPATH . 'wp-admin/includes/file.php' );
            }

            if ($_POST['action'] == "quickdownload") {
                $canvas_id = 0;
                // verify nonce
                if (!wp_verify_nonce($_REQUEST['_wpnonce'], 'wpimager_quick')) {
                    die();
                }
                $this->WPImagerAccess();
            } else {
                $canvas_id = (int) $_POST['canvas_id'];
                $userID = get_current_user_id();
                $table_name = $wpdb->wpimager_db;
                $canvas = $wpdb->get_row($wpdb->prepare('SELECT * FROM ' . $table_name . ' WHERE id = %d AND disposed=0', $canvas_id));
                if (!$canvas) {
                    wp_die(); // canvas not exist
                }

                // verify nonce
                if (!wp_verify_nonce($_REQUEST['_wpnonce'], 'wpimager' . $canvas_id)) {
                    die();
                }

                if ($_POST['action'] !== "postdownload") {
                    if ($canvas->user_id != $userID) {
                        wp_die(); // not canvas author                        
                    }
                    $this->WPImagerAccess();
                }
            }

            // save thumbnail as IMG_{canvas_id}_thumb.png
            $imgCanvas = $_POST['imageCanvas'];
            $imgdata_canvas = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imgCanvas));
            $time = time() . rand(10000, 99999);
            if ($_POST['action'] == "postdownload" || $_POST['action'] == "quickdownload") {
                $_ext = in_array($_POST['ext'], array("png", "jpg", "gif")) ? $_POST['ext'] : "png";
                $filename = "IMG" . $canvas_id . "_download" . $time . "." . $_ext;
                $fileloc = WPIMAGER_TEMP_DIR . $filename;
            } else {
                $wp_upload_dir = wp_upload_dir();
                $upload_dir = $wp_upload_dir['basedir'] . '/wpimager/canvas-' . $canvas_id;
                $filename = "IMG" . $canvas_id . "_thumb.png";
                $fileloc = $upload_dir . '/' . $filename;
                if (!file_exists(dirname($fileloc))) {
                    wp_mkdir_p(dirname($fileloc), 0755, true);
                }
            }


            file_put_contents($fileloc, $imgdata_canvas);

            $return_arr['success'] = true;
            $return_arr['action'] = $_POST['action'];
            $return_arr['tick'] = $time;
            $return_arr['canvas_id'] = $canvas_id;
            echo json_encode($return_arr);

            wp_die();
        }

        function callback_create_importzip() {
            global $wpdb;
            require_once 'include/Uploader.php';


            // verify nonce
            if (!wp_verify_nonce($_REQUEST['_wpnonce'], 'wpimager_create')) {
                die();
            }

            $this->WPImagerAccess();

            $user_id = get_current_user_id();

            // prepare canvas in database
            $canvas = $wpdb->get_row($wpdb->prepare('SELECT id FROM ' . $wpdb->wpimager_db . ' WHERE user_id = %d AND created = %d AND updated = %d AND disposed > %d ORDER BY created DESC', $user_id, 0, 0));
            if ($canvas) {
                $return_arr = array(
                    'id' => $canvas->id,
                    'title' => '',
                    'success' => true
                );
            } else {
                // create new canvas
                $return_arr = $this->newcanvas_insert();
            }

            $canvas_id = (int) $return_arr['id'];

            $timestamp = time();
            // $upload_dir = WPIMAGER_TEMP_DIR;

            $wp_upload_dir = wp_upload_dir();
            $upload_dir = $wp_upload_dir['basedir'] . '/wpimager/canvas-' . $canvas_id;
            $filename = "IMGZIP_" . $timestamp . ".zip";
            $zipfile = $upload_dir . '/' . $filename;
            if (!file_exists(dirname($zipfile))) {
                wp_mkdir_p(dirname($zipfile), 0755, true);
            }

            $uploader = new WPImagerFileUpload('uploadfile');
            if (strtolower($uploader->fileExtension) !== 'zip') {
                $return_arr['success'] = false;
                $return_arr['msg'] = 'Invalid zip file uploaded!';
                echo json_encode($return_arr);
                wp_die();
            }

//            $filename = $this->image_filename($canvas_id, $timestamp, $uploader->fileExtension);

            $uploader->newFileName = $filename;
            // Handle the upload
            $result = $uploader->handleUpload($upload_dir);
            if (!$result) {
                $return_arr['success'] = false;
                $return_arr['msg'] = $uploader->getErrorMsg();
                echo json_encode($return_arr);
                wp_die();
            }

            $return_arr["success"] = true;
            $canvas_txt = file_get_contents('zip://' . $zipfile . '#wpimager.txt');
            $_canvas_txt = explode("\n", $canvas_txt);
            $cloudcanvas = $_canvas_txt[0];
            $cloudlayers = $_canvas_txt[1];
            $cloudslides = $_canvas_txt[2];
            $cloudaddons = $_canvas_txt[3];
            $zip = new ZipArchive;

            $_app_options = get_option('wpimager_options');
            $app_options = unserialize($_app_options);

            // get running counter to name image file
            $uniqueCounter = 0;
            if (!empty($app_options['unzipCounter'])) {
                $uniqueCounter = (int) $app_options['unzipCounter'];
            }
            $uniqueCounter = ($uniqueCounter < 1000) ? 1000 : $uniqueCounter;

            $zipImages = array();
            if ($zip->open($zipfile) === true) {
                for ($i = 0; $i < $zip->numFiles; $i++) {
                    $entry = $zip->getNameIndex($i);
                    if (preg_match('#\.(bmp|jpg|jpeg|png)$#i', $entry, $matches)) {
                        ////This copy function will move the entry to the root of "txt_files" without creating any sub-folders unlike "ZIP->EXTRACTO" function.
                        $new_filename = $timestamp . '-' . $uniqueCounter . $matches[0];
//                            $fileloc = WPIMAGER_TEMP_DIR . $new_filename;
                        $fileloc = $upload_dir . '/' . $new_filename;
                        if (!file_exists(dirname($fileloc))) {
                            wp_mkdir_p(dirname($fileloc), 0750, true);
                        }

                        copy('zip://' . $zipfile . '#' . $entry, $fileloc);
                        $attach_data = $this->attachWPMedia($canvas_id, $fileloc, false, false);
                        $attach_data['imagesrc'] = $entry;  // filename
                        $zipImages[] = $attach_data;
                        $uniqueCounter++;
                    }
                }
                $zip->close();
            } else {
                
            }

            $app_options['unzipCounter'] = $uniqueCounter;
            update_option('wpimager_options', serialize($app_options));

            @unlink($zipfile);
            // create new canvas
            $return_arr['nonce'] = wp_create_nonce('wpimager_editor' . $return_arr['id']);
            echo json_encode($return_arr);

            $mode = $this->newcanvas_mode();
            $settings_arr['canvas'] = '{}';
            $settings_arr['layers'] = '{}';
            $settings_arr['slides'] = '{}';
            $settings_arr['addons'] = '{}';
            $settings_arr['zipimg'] = '{}';
            $title = "Canvas #" . $return_arr['id'];
            if ($this->isJson($cloudcanvas)) {
                $_canvas = json_decode($cloudcanvas, true);
                $settings_arr['canvas'] = $cloudcanvas;
                if (!empty($_canvas['title'])) {
                    $title = sanitize_text_field($_canvas['title']);
                }
            }

            $settings_arr['zipimg'] = '{';
            for ($i = 0; $i < count($zipImages); $i++) {
                if ($i > 0) {
                    $settings_arr['zipimg'] .= ',';
                }
                $settings_arr['zipimg'] .= '"' . $i . '":["' . filter_var($zipImages[$i]['imagesrc'], FILTER_SANITIZE_URL) . '","' . filter_var($zipImages[$i]['src'], FILTER_SANITIZE_URL) . '"]';
            }
            $settings_arr['zipimg'] .= '}';

            if ($this->isJson($cloudlayers)) {
                $settings_arr['layers'] = $cloudlayers;
            }
            if ($this->isJson($cloudslides)) {
                $settings_arr['slides'] = $cloudslides;
            }

            if ($this->isJson($cloudaddons)) {
                $settings_arr['addons'] = $cloudaddons;
            }


            $settings = base64_encode(serialize($settings_arr));

            // give canvas a title if none specified by user
            $table_name = $wpdb->wpimager_db;
            $update = $wpdb->update(
                    $table_name, array(
                'title' => $title,
                'settings' => $settings,
                'created' => time(),
                'updated' => time(),
                'disposed' => 0,
                    ), array('id' => $return_arr['id']), array('%s', '%s', '%d', '%d', '%d'), array('%d')
            );

            wp_die();
        }

        /**
         * Ajax User font list
         */
        function callback_userfonts_list() {

            $_POST = array_map('stripslashes_deep', $_POST);

            $userID = get_current_user_id();

            $_options = get_user_option('wpimager_options', $userID);
            $options = unserialize($_options);

            // get app options
            $_app_options = get_option('wpimager_options');
            $app_options = unserialize($_app_options);
            $gfontapi = WPIMAGER_GOOGLEFONT_API;
            if (!empty($app_options['gfontapi'])) {
                $gfontapi = $app_options['gfontapi'];
            }

            if (!isset($options['gfonts'])) {
                // set default google fonts
                $options['gfonts'] = WPIMAGER_FONTS_DEFAULT;
            }

            $return_arr['googlefonts'] = $this->get_googlefonts_list();
            $return_arr['success'] = true;
            $return_arr['cloudgfonts'] = $options['gfonts'];
            $return_arr['googlefontsapi'] = $gfontapi;
            $return_arr['success'] = true;

            echo json_encode($return_arr);
            wp_die();
        }

        /**
         * Ajax Google font list
         */
        function callback_googlefonts_list() {
            $return_arr['googlefonts'] = $this->get_googlefonts_list();
            $return_arr['success'] = true;
            echo json_encode($return_arr);
            wp_die();
        }

        /**
         * Build json encoded array of Google Fonts
         * @return String
         */
        function get_googlefonts_list() {
            include WPIMAGER_PLUGIN_PATH . "fonts/webfonts.php";

            $googlefonts = array();

            $webfonts_object = json_decode($webfonts);

            if ($webfonts_object && is_object($webfonts_object)) {
                if ($webfonts_object->items && is_array($webfonts_object->items)) {
                    $_googlefonts = $webfonts_object->items;
                }
            }
            foreach ($_googlefonts as $font) {

                if (count($font->variants) > 0) {
                    $variants = implode(',', $font->variants);
                } else {
                    $variants = $font->variants;
                }

                $googlefonts[] = array(
                    'family' => $font->family,
                    'category' => $font->category,
                    'variants' => $variants,
                );
            }
            return json_encode($googlefonts);
        }

        // Function to convert CSV into associative array
        function csvToArray($file, $delimiter) {
            $arr = array();
            if (($handle = fopen($file, 'r')) !== FALSE) {
                $i = 0;
                while (($lineArray = fgetcsv($handle, 4000, $delimiter, '"')) !== FALSE) {
                    for ($j = 0; $j < count($lineArray); $j++) {
                        $arr[$i][$j] = $lineArray[$j];
                    }
                    $i++;
                }
                fclose($handle);
            }
            return $arr;
        }

        /**
         * Adapt search for Media Library when wpimager keyword applied to search box
         */
        function guid_media_canvas_search($search) {
            global $wpdb, $pagenow;

            // Only Admin side && Only Media Library page
            if (!$this->is_admin && 'upload.php' != $pagenow)
                return $search;
            if (empty($_GET['s']) || $_GET['s'] != "wpimager")
                return $search;

            if (!empty($search)) {
                if (empty($_GET['canvas_id'])) {
                    // show all canvas images
                    $search = str_replace(
                            'AND ((', 'AND (((' . $wpdb->prefix . 'posts.guid LIKE \'%IMG%\' AND ' . $wpdb->prefix . 'posts.guid LIKE \'%G\.%\') OR ', $search
                    );
                } else {
                    // show only canvas_id related images
                    $search = str_replace(
                            'AND ((', 'AND (((' . $wpdb->prefix . 'posts.guid LIKE \'%IMG' . intval($_GET['canvas_id']) . '%\' AND ' . $wpdb->prefix . 'posts.guid LIKE \'%G\.%\') OR ', $search
                    );
                }
            }
            return $search;
        }

        public function is_admin() {
            return $this->is_admin;
        }

        public function cap_upload_files() {
            return current_user_can("upload_files");
        }

        private function isJson($string) {
            return ((is_string($string) && (is_object(json_decode($string)) || is_array(json_decode($string))))) ? true : false; //PHP Version 5.2.17 server
            //https://wordpress.org/support/topic/fatal-error-json_last_error-1
        }

        /**
         * Build menus for plugins in wordpress admin area
         * Define stylesheets and js file inclusion for each submenu pages 
         */
        public function action_menu_page() {
            global $wpimager_dashboard_page, $WPImager_AddOns;

//            $update_count = wpimager_get_update_count();
//            $update_badge = ($update_count == 0) ? '' : ' <span class="update-plugins count-' . $update_count . '"><span class="update-count">' . $update_count . '</span></span>';


            $page = add_menu_page('WPImager', 'WPImager' . $update_badge, $this->is_admin ? 'administrator' : 'WPIMAGER_USER_LICENSE', 'wpimager_dashboard', '', WPIMAGER_PLUGIN_URL . "images/wpimager-icon.png");

            $wpimager_dashboard_page = add_submenu_page('wpimager_dashboard', 'WPImager', 'Dashboard', 'WPIMAGER_USER_LICENSE', 'wpimager_dashboard', 'wpimager_dashboard');

            add_action("load-$wpimager_dashboard_page", 'wpimager_dashboard_add_options');

            $wpimager_canvas = add_submenu_page('wpimager_dashboard', 'WPImager', 'Canvas', 'WPIMAGER_USER_LICENSE', 'wpimager_canvas', 'wpimager_canvas');

            add_action("load-$wpimager_canvas", 'wpimager_canvas_add_options');

            $wpimager_create = add_submenu_page('wpimager_dashboard', 'Create Canvas', 'Create Canvas', 'WPIMAGER_USER_LICENSE', 'wpimager_create', 'wpimager_create');

            $wpimager_gfonts = add_submenu_page('wpimager_dashboard', 'Canvas Google Fonts', 'Google Fonts', 'WPIMAGER_USER_LICENSE', 'wpimager_gfonts', 'wpimager_gfonts');

            $wpimager_useraccess = add_submenu_page('wpimager_useraccess', 'WPImager', 'User Access', $this->is_admin ? 'administrator' : 'WPIMAGER_USER_LICENSE', 'wpimager_useraccess', 'wpimager_useraccess');
            add_action("load-$wpimager_useraccess", 'wpimager_useraccess_add_options');

            $wpimager_editor = add_submenu_page('wpimager_editor', 'WPImager', 'Canvas', 'WPIMAGER_USER_LICENSE', 'wpimager_editor', 'wpimager_editor');


            $wpimager_create_cover = add_submenu_page('wpimager_create_cover', 'Create Cover', 'Create Cover', 'WPIMAGER_USER_LICENSE', 'wpimager_create_cover', 'wpimager_create_cover');


            add_action('admin_print_styles-' . $wpimager_editor, array(&$this, 'enqueue_wpimager_editor_css'));
            add_action('admin_print_scripts-' . $wpimager_editor, array(&$this, 'enqueue_wpimager_editor_js'));

            add_action('admin_print_styles-' . $wpimager_dashboard_page, array(&$this, 'enqueue_dashboard_css'));
            add_action('admin_print_scripts-' . $wpimager_dashboard_page, array(&$this, 'enqueue_dashboard_js'));

            add_action('admin_print_styles-' . $wpimager_canvas, array(&$this, 'enqueue_canvas_css'));
            add_action('admin_print_scripts-' . $wpimager_canvas, array(&$this, 'enqueue_canvas_js'));

            add_action('admin_print_styles-' . $wpimager_create, array(&$this, 'enqueue_create_css'));
            add_action('admin_print_scripts-' . $wpimager_create, array(&$this, 'enqueue_create_js'));

            add_action('admin_print_styles-' . $wpimager_create_cover, array(&$this, 'enqueue_create_css'));
            add_action('admin_print_scripts-' . $wpimager_create_cover, array(&$this, 'enqueue_create_js'));

            add_action('admin_print_styles-' . $wpimager_gfonts, array(&$this, 'enqueue_gfonts_css'));
            add_action('admin_print_scripts-' . $wpimager_gfonts, array(&$this, 'enqueue_gfonts_js'));


            add_action("admin_head-{$wpimager_dashboard_page}", 'wpimager_dashboard_headscript');
            add_action("admin_head-{$wpimager_create}", 'wpimager_create_headscript');
            add_action("admin_head-{$wpimager_canvas}", 'wpimager_canvas_headscript');
            add_action("admin_head-{$wpimager_gfonts}", 'wpimager_gfonts_headscript');
            add_action("admin_head-{$wpimager_editor}", 'wpimager_editor_headscript');
            add_action("admin_head-{$wpimager_create_cover}", 'wpimager_create_cover_headscript');
        }

        public function enqueue_canvas_js() {
            wp_enqueue_script('jquery'); 
            wp_enqueue_script('jquery-ui-core');
            wp_enqueue_script('bootstrap', plugins_url('/js/bootstrap.min.js', __FILE__));
        }

        public function enqueue_canvas_css() {
            wp_enqueue_style('wpimager-jquery-ui', plugins_url('/css/jquery.ui.css', __FILE__));
        }

        public function enqueue_dashboard_js() {
            wp_enqueue_script('jquery'); 
            wp_enqueue_script('jquery-ui-core');
            wp_enqueue_script('bootstrap', plugins_url('/js/bootstrap.min.js', __FILE__));
            wp_enqueue_script('ajaxuploader', plugins_url('/js/SimpleAjaxUploader.js', __FILE__));
        }

        public function enqueue_dashboard_css() {
            wp_enqueue_style('wpimager-jquery-ui', plugins_url('/css/jquery.ui.css', __FILE__));
            wp_enqueue_style('fa-icon', plugins_url('/fonts/font-awesome-4.7.0/css/font-awesome.min.css', __FILE__));
        }

        public function enqueue_create_js() {
            wp_enqueue_script('thickbox');
            wp_enqueue_script('jquery'); 
            wp_enqueue_script('jquery-ui-core');
            wp_enqueue_script('jquery-ui-spinner');
            wp_enqueue_script('bootstrap', plugins_url('/js/bootstrap.min.js', __FILE__));
            wp_enqueue_script('canvas2image', plugins_url('/js/canvas2image.js', __FILE__));
            wp_enqueue_script('paste-js', plugins_url('/js/paste.js?' . WPIMAGER_VERSION, __FILE__));
            wp_enqueue_script('ajaxuploader', plugins_url('/js/SimpleAjaxUploader.js', __FILE__));
            wp_enqueue_script('wpimager.mod.create', plugins_url('/js/wpimager.mod.create.js', __FILE__));
            wp_enqueue_script('dragster', plugins_url('/js/dragster.js', __FILE__));
        }

        public function enqueue_create_css() {
            wp_enqueue_style('thickbox');
            wp_enqueue_style('canvas-style', plugins_url('/css/canvas.css', __FILE__));
            wp_enqueue_style('bootstrap', plugins_url('/css/bootstrap.min.css', __FILE__));
            wp_enqueue_style('fa-icon', plugins_url('/fonts/font-awesome-4.7.0/css/font-awesome.min.css', __FILE__));
            wp_enqueue_style('wpimager-jquery-ui', plugins_url('/css/jquery.ui.css', __FILE__));
        }

        public function enqueue_wpimager_editor_js() {
            wp_enqueue_script('thickbox');
            wp_enqueue_script('jquery');
            wp_enqueue_script('jquery-ui-core');
            wp_enqueue_script('jquery-ui-widget');
            wp_enqueue_script('jquery-ui-draggable');
            wp_enqueue_script('jquery-ui-droppable');
            wp_enqueue_script('jquery-ui-resizable');
            wp_enqueue_script('jquery-ui-sortable');
            wp_enqueue_script('jquery-ui-spinner');
            wp_enqueue_script('bootstrap', plugins_url('/js/bootstrap.min.js', __FILE__));
            wp_enqueue_script('wpimagerpicker', plugins_url('/js/colorpicker.js', __FILE__), array('jquery-ui-widget'));
            wp_enqueue_script('cpicker', plugins_url('/js/evol.colorpicker.js', __FILE__));
            wp_enqueue_script('undoredo', plugins_url('/js/undo-redo.js', __FILE__));
            wp_enqueue_script('fontselect', plugins_url('/js/jquery.fontselect.js', __FILE__));
            wp_enqueue_script('canvas2image', plugins_url('/js/canvas2image.js', __FILE__));
            wp_enqueue_script('fa-iconset', plugins_url('/js/iconset/iconset-fontawesome-4.2.0.min.js', __FILE__));
            wp_enqueue_script('bs-iconpicker', plugins_url('/js/bootstrap-iconpicker.min.js', __FILE__));
            wp_enqueue_script('stackblur', plugins_url('/js/StackBlur.js', __FILE__));
            wp_enqueue_script('fontspy', plugins_url('/js/jQuery-FontSpy.js', __FILE__));
            wp_enqueue_script('gradient', plugins_url('/js/jquery.classygradient.js', __FILE__));
            wp_enqueue_script('tinycolor', plugins_url('/js/tinycolor.js', __FILE__));
            wp_enqueue_script('ajaxuploader', plugins_url('/js/SimpleAjaxUploader.js', __FILE__));
            wp_enqueue_script('dragster', plugins_url('/js/dragster.js', __FILE__));
            wp_enqueue_script('bezierjs', plugins_url('/js/bezier.js', __FILE__));
            wp_enqueue_script('jqColors', plugins_url('/js/colors.js', __FILE__));
            wp_enqueue_script('jqColorPicker', plugins_url('/js/jqColorPicker.js', __FILE__));
            wp_enqueue_script('wpimager', plugins_url('/js/wpimager.js?' . WPIMAGER_VERSION, __FILE__));
            wp_enqueue_script('wpimager-lib-init', plugins_url('/js/wpimager.lib.init.js?' . WPIMAGER_VERSION, __FILE__));
            wp_enqueue_script('wpimager-lib', plugins_url('/js/wpimager.lib.js?' . WPIMAGER_VERSION, __FILE__));
            wp_enqueue_script('wpimager-lib-image', plugins_url('/js/wpimager.lib.image.js?' . WPIMAGER_VERSION, __FILE__));
            wp_enqueue_script('wpimager-lib-draw', plugins_url('/js/wpimager.lib.draw.js?' . WPIMAGER_VERSION, __FILE__));
            wp_enqueue_script('wpimager-lib-text-draw', plugins_url('/js/wpimager.lib.text.draw.js?' . WPIMAGER_VERSION, __FILE__));
            wp_enqueue_script('wpimager-lib-text-fill', plugins_url('/js/wpimager.lib.text.fill.js?' . WPIMAGER_VERSION, __FILE__));
            wp_enqueue_script('wpimager-lib-text', plugins_url('/js/wpimager.lib.text.js?' . WPIMAGER_VERSION, __FILE__));
            wp_enqueue_script('wpimager-lib-ui', plugins_url('/js/wpimager.lib.ui.js?' . WPIMAGER_VERSION, __FILE__));
            wp_enqueue_script('wpimager-lib-slide', plugins_url('/js/wpimager.lib.slide.js?' . WPIMAGER_VERSION, __FILE__));
            wp_enqueue_script('wpimager-lib-component', plugins_url('/js/wpimager.lib.com.js?' . WPIMAGER_VERSION, __FILE__));
            wp_enqueue_script('wpimager-clipboard', plugins_url('/js/clipboard.js?' . WPIMAGER_VERSION, __FILE__));
            wp_enqueue_script('wpimager-mod-image', plugins_url('/js/wpimager.mod.image.js?' . WPIMAGER_VERSION, __FILE__));

            wp_enqueue_script('wpimager-paste-js', plugins_url('/js/paste.js?' . WPIMAGER_VERSION, __FILE__));
            wp_enqueue_script('wpimager-perspective', plugins_url('/js/perspective.js?' . WPIMAGER_VERSION, __FILE__));
            wp_enqueue_script('wpimager-jszip-utils', plugins_url('/js/jszip-utils.min.js?' . WPIMAGER_VERSION, __FILE__));
            wp_enqueue_script('wpimager-jszip', plugins_url('/js/jszip.min.js?' . WPIMAGER_VERSION, __FILE__));
            wp_enqueue_script('wpimager-fsaver', plugins_url('/js/FileSaver.js?' . WPIMAGER_VERSION, __FILE__));
            do_action('wpimager_editor_enqueue_script');  // enqueue scripts - add Ons 
        }

        public function enqueue_wpimager_editor_css() {
            wp_enqueue_style('wpimager-jquery-ui', plugins_url('/css/jquery.ui.css', __FILE__));
            wp_enqueue_style('bootstrap', plugins_url('/css/bootstrap.min.css', __FILE__));
            wp_enqueue_style('thickbox');
            wp_enqueue_style('cpicker', plugins_url('/css/evol.colorpicker.min.css', __FILE__));
            wp_enqueue_style('jgradient', plugins_url('/css/jquery.classygradient.css', __FILE__));
            wp_enqueue_style('fontselect', plugins_url('/css/fontselect.css', __FILE__));
            wp_enqueue_style('fa-icon', plugins_url('/fonts/font-awesome-4.7.0/css/font-awesome.min.css', __FILE__));
            wp_enqueue_style('bs-iconpicker', plugins_url('/css/bootstrap-iconpicker.min.css', __FILE__));
            wp_enqueue_style('canvas-style', plugins_url('/css/canvas.css?' . WPIMAGER_VERSION, __FILE__));
            do_action('wpimager_editor_enqueue_style');  // enqueue style - add Ons 
        }

        public function enqueue_gfonts_js() {
            wp_enqueue_script('jquery'); 
            wp_enqueue_script('jquery-ui-core');
            wp_enqueue_script('gfontselect', plugins_url('/js/jquery.gfontselect.js', __FILE__));
            wp_enqueue_script('ajaxuploader', plugins_url('/js/SimpleAjaxUploader.js', __FILE__));
        }

        public function enqueue_gfonts_css() {
            wp_enqueue_style('wpimager-jquery-ui', plugins_url('/css/jquery.ui.css', __FILE__));
            wp_enqueue_style('wpimager-canvas-style', plugins_url('/css/canvas.css', __FILE__));
            wp_enqueue_style('wpimager-gfontselect', plugins_url('/css/gfontselect.css', __FILE__));
            wp_enqueue_style('wpimager-fa-icon', plugins_url('/fonts/font-awesome-4.7.0/css/font-awesome.min.css', __FILE__));
        }

        /**
         * Create tables on plugin activation
         */
        function action_create_tables() {
            global $wpdb, $current_user;


            $user_licensed = 0;
            $result = new WP_User_Query(
                    array(
                'role' => '',
            ));
            $users = $result->get_results();
            foreach ($users as $user) {
                $allcaps = $user->allcaps;
                if (array_key_exists('WPIMAGER_USER_LICENSE', $allcaps)) {
                    $user_licensed++;
                }
            }
            if ($user_licensed == 0) {
                $user_id = $current_user->ID;
                $user = new WP_User($user_id);
                $user->add_cap('WPIMAGER_USER_LICENSE');
            }

            $table_name = $wpdb->wpimager_db;

            $sql = "CREATE TABLE IF NOT EXISTS $table_name (
      id int(11) NOT NULL AUTO_INCREMENT,
        user_id int(11) unsigned NOT NULL DEFAULT '0',
        created int(11) NOT NULL DEFAULT '0',
        updated int(11) NOT NULL,
        wplsent int(11) NOT NULL DEFAULT '0',
        title varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
        filename varchar(255) NOT NULL,
        pinned tinyint(4) NOT NULL DEFAULT '0',
        addons mediumtext NOT NULL,
        settings mediumtext NOT NULL,
        parent_id tinyint(4) NOT NULL DEFAULT '0',
        disposed int(11) NOT NULL DEFAULT '0',
      UNIQUE KEY id (id)
    );";
            require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
            dbDelta($sql);
        }

    }

    endif;

// End class


$WPImagerEditor = WPImagerEditor::get_instance();

function wpimager_call_include_page() {
    global $WPImagerEditor, $WPImager_AddOns;
    if (!empty($_REQUEST['page'])) {
        switch ($_REQUEST['page']) {
            case "wpimager_editor":
                require_once 'include/editor.php';
                break;
            case "wpimager_create":
                require_once 'include/create.php';
                break;
            case "wpimager_dashboard":
                require_once 'include/dashboard.php';
                break;
            case "wpimager_create_cover":
                require_once 'include/create_canvas.php';
                break;
            case "wpimager_canvas":
                require_once 'include/canvas.php';
                break;
            case "wpimager_gfonts":
                require_once 'include/gfonts.php';
                break;
            case "wpimager_useraccess":
                require_once 'include/useraccess.php';
                break;
            case "wpimager_download":
                require_once 'include/download.php';
                break;
        }
    }
}

add_filter('wp_handle_upload_prefilter', 'wpimager_handle_upload_prefilter');

function wpimager_handle_upload_prefilter($file) {
    add_filter('upload_dir', 'wpimager_custom_upload_dir');
    return $file;
}

add_filter('wp_handle_upload', 'wpimager_handle_upload');

function wpimager_handle_upload($fileinfo) {
    remove_filter('upload_dir', 'wpimager_custom_upload_dir');
    return $fileinfo;
}

function wpimager_custom_upload_dir($path) {
    // Determines if uploading from inside a post/page/cpt
    // If not, default Upload folder is used
    parse_str(parse_url($_SERVER['HTTP_REFERER'], PHP_URL_QUERY), $queries);
    if (isset($queries['page']) && substr($queries['page'], 0, strlen('wpimager_editor')) == 'wpimager_editor') {
        if (isset($queries['canvas_id']) || isset($queries['id'])) {
            $canvas_id = (int) (isset($queries['canvas_id']) ? $queries['canvas_id'] : $queries['id']);
            $_customdir = '/wpimager/canvas-' . $canvas_id;
        } else {
            return $path;
        }
    } else if (isset($queries['page']) && substr($queries['page'], 0, strlen('wpimager_create')) == 'wpimager_create') {
        if (isset($queries['id'])) {
            $canvas_id = (int) $queries['id'];
            $_customdir = '/wpimager/canvas-' . $canvas_id;
        } else {
            return $path;
        }
    } else {
        return $path; //error or uploading not from a post/page/cpt 		
    }

    // Save uploads in FILETYPE based folders. When using this method, 
    // you may want to change the check for $use_default_dir
    $extension = substr(strrchr($_POST['name'], '.'), 1);
    switch ($extension) {
        case 'jpg':
        case 'png':
        case 'gif':
            $customdir = $_customdir;
            break;
        default:
            return $path;
    }

    $path['path'] = str_replace($path['subdir'], '', $path['path']);
    $path['url'] = str_replace($path['subdir'], '', $path['url']);
    $path['subdir'] = $customdir;
    $path['path'] .= $customdir;
    $path['url'] .= $customdir;

    return $path;
}
