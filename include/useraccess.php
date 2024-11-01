<?php


if (!defined('ABSPATH'))
    exit; // Exit if accessed directly

$WPImagerEditor->WPImagerAccess();

if (!class_exists('WP_List_Table')) {
    require_once( ABSPATH . 'wp-admin/includes/class-wp-list-table.php' );
}

class UI_WPImager_UserAccess extends WP_List_Table {

    function __construct() {
        global $status, $page;
        parent::__construct(array(
            'ajax' => false
        ));
    }

    function no_items() {
        _e('No user found.');
    }

    function column_default($item, $column_name) {
        $item = (array) ($item);
        switch ($column_name) {
            case 'title':
            case 'fullname':
            case 'role':
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
            'cb' => '<input type="checkbox" />',
            'title' => __('User', 'listtable'),
            'name' => __('Name', 'listtable'),
            'license' => __('Access', 'listtable'),
            'role' => __('WordPress Role', 'listtable'),
        );
        return $columns;
    }

    function get_bulk_actions() {
        $actions = array(
            'grant-access' => 'Grant Access',
            'remove-access' => 'Remove Access'
        );

        return $actions;
    }

    function column_role($item) {
        return implode(',', array_map("ucfirst", $item['roles']));
    }

    function column_cb($item) {
        return sprintf(
                '<input type="checkbox" name="chk_bulk[]" value="%1$s"/>', $item['ID']);
    }

    function column_title($item) {
        global $admin_url;
        $thumbnail = get_avatar($item['ID'], 32);
        $title = '<div style="font-weight:bold">' . $item['user_login'] . '</div>';
        return '<div style="float:left;line-height:16px;margin-right:6px">' . $thumbnail . '</div>' . $title . '';
    }

    function column_license($item) {
        $user_id = (int) $item['ID'];
        $user = new WP_User($user_id);
        if ($user && $user->has_cap('WPIMAGER_USER_LICENSE')) {
            return '<div style="background-color:#3498db;color:#fff;padding:2px 6px;display:inline-block;"><span class="dashicons dashicons-admin-network"></span> Access Granted</div>';
        }
    }

    function column_name($item) {
        $firstName = get_user_meta($item['ID'], 'first_name', true);
        $lastName = get_user_meta($item['ID'], 'last_name', true);
        return $firstName . ' ' . $lastName;
    }

    function extra_tablenav($which) {
        if ($which == "top") {
        }
    }

    function process_bulk_action() {
        $entry = ( is_array($_REQUEST['chk_bulk']) ) ? $_REQUEST['chk_bulk'] : array($_REQUEST['chk_bulk']);
        
        if ('grant-access' === $this->current_action()) {
            global $wpdb, $wp_roles;
            $result = new WP_User_Query(
                    array(
                'role' => '',
            ));

            $users = $result->get_results();

            foreach ($entry as $id) {
                $user_id = absint($id);
                $user = new WP_User($user_id);
                if ($user && $user->has_cap('WPIMAGER_USER_LICENSE')) {
                    // user already licensed
                } else if ($user && !$user->has_cap('WPIMAGER_USER_LICENSE')) {
                    $user->add_cap('WPIMAGER_USER_LICENSE');
                }
            }
        } else if ('remove-access' === $this->current_action()) {
            foreach ($entry as $id) {
                $user_id = absint($id);
                $user = new WP_User($user_id);
                if ($user && $user->has_cap('WPIMAGER_USER_LICENSE')) {
                    $user->remove_cap('WPIMAGER_USER_LICENSE');
                }
            }
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
        
        $this->process_bulk_action();
        
        // prepare pagination
        $_GET['paged'] = isset($_GET['paged']) ? intval($_GET['paged']) : 0;
        if ($_GET['paged'] < 1)
            $_GET['paged'] = 1;
        $start = ( $_GET['paged'] - 1 ) * $per_page;
        if ($start < 1)
            $start = 0;


        if (!$WPImagerEditor->is_admin() || empty($_REQUEST['select_user'])) {
            $userID = get_current_user_id();
            if (defined('WPIMAGER_DEMO_USER')) {
                $userID = WPIMAGER_DEMO_USER;
            }
            $_REQUEST['select_user'] = $userID;
        }
        $_REQUEST['select_user'] = (int) $_REQUEST['select_user'];


        $result = new WP_User_Query(
                array(
            'role' => '',
            'offset' => $start,
            'number' => $per_page
        ));
        //		print_r($result);
        $users = $result->get_results();
        foreach ($users as $user) {
            $items[] = array(
                'ID' => $user->ID,
                'user_login' => $user->user_login,
                'display_name' => $user->display_name,
                'allcaps' => $user->allcaps,
                'roles' => $user->roles
            );
        }
        $this->items = $items;


        $total_items = $result->total_users;
        // set pagination
        $this->set_pagination_args(array(
            'total_items' => $total_items,
            'per_page' => $per_page,
        ));
    }

}

if (!function_exists('wpimager_useraccess')) {

    /**
     * Setup Screen option. Number of Users per page.
     */
    function wpimager_useraccess_add_options() {
        $option = 'per_page';
        $args = array(
            'label' => 'Users per page',
            'default' => 10,
            'option' => 'per_page'
        );
        add_screen_option($option, $args);
    }

    add_filter('set-screen-option', 'wpimager_useraccess_set_option', 10, 3);

    /**
     * Set Number of Users per page.
     */
    function wpimager_useraccess_set_option($status, $option, $value) {

        if ('per_page' == $option)
            return $value;

        return $status;
    }

    /**
     * Dashboard view displays the list of created canvases
     */
    function wpimager_useraccess() {
        global $wpimager_useraccess_ui, $WPImagerEditor;
        $wpimager_useraccess_ui = new UI_WPImager_UserAccess();
        $wpimager_useraccess_ui->prepare_items();
        ?>
        <div class="wrap">

            <?php require_once WPIMAGER_PLUGIN_PATH . 'include/header.php'; ?>
            <form method="post" id="filter" action="<?php echo $_SERVER['PHP_SELF']; ?>?page=wpimager_useraccess">
                <?php
                $wpimager_useraccess_ui->display();
                ?>
                <div class="alignright">
                    <p class="description">WPImager <?php echo WPIMAGER_VERSION ?></p>
                </div>
            </form>
        </div>
        <style>
            #wpbody .update-nag {
                display: none;
            }
        </style>

        <?php
    }

} 