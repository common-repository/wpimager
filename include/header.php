<?php
if (!defined('ABSPATH'))
    exit; // Exit if accessed directly
?>


<style>
    .cover-tab {
        border-right:1px solid #eaeaea;
        padding:10px 16px;
        display: block;	
        float:left;
        font-weight: bold;
        font-size:15px;
        text-decoration: none;
        margin: 0 !important;
    }
    .cover-tabs:after {
        content:"";
        display: table;
        clear:both;

    }
    .cover-tab:hover {
        text-decoration: none;
        background-color: #fafafa;
    }
    .cover-tab.active {
        color:#676767;
    }
</style>
<?php global $admin_url, $WPImagerEditor; ?>
<div style="padding:0;border-bottom: 1px solid #e5e5e5;background-color: #ffffff;box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);margin-bottom: 0px;">
    <div style="padding: 6px 14px 6px;background-color: #fdfdfd">
        <a href="<?php echo $admin_url ?>?page=wpimager_dashboard"><img style="float:left;padding:3px;margin-right:10px;background-color:#fff;border: 1px solid #eaeaea" src="<?php echo WPIMAGER_PLUGIN_URL ?>images/logo-wpimager.png"/></a>
        <h1 style="color:#676767;margin-top:20px;padding:0 0 0 100px"><a href="<?php echo $admin_url ?>?page=wpimager_dashboard" style="text-decoration: none;color:#676767">WPImager</a></h1>
    </div>
    <div style="border-top:1px solid #eaeaea;padding:0 0 0 120px">
        <div class="cover-tabs" style="border-left:1px solid #eaeaea;padding:0;position:relative">
            <?php if ($_REQUEST['page'] == 'wpimager_canvas'): ?>
                <div style="float:right;padding:5px 6px 0;">
                    <form style="margin:0px;padding:0" method="get" action="<?php echo $admin_url; ?>?page=wpimager_canvas">
                        <input type="hidden" name="select_user" value="<?php echo $_REQUEST['select_user'] ?>" />
                        <input type="hidden" name="page" value="wpimager_canvas" />

                        <?php
                        $wpimager_canvas_ui->search_box('Search Title', 'search_id');
                        global $wpdb, $WPImagerEditor;
                        if (empty($_REQUEST['select_user'])) {
                            $userID = get_current_user_id();
                            $_REQUEST['select_user'] = $userID;
                        }
                        $_REQUEST['select_user'] = (int) $_REQUEST['select_user'];
                        if ($WPImagerEditor->is_admin()) {
                            $table_name = $wpdb->wpimager_db;
                            $table_user = $wpdb->prefix . 'users';
                            $users = $wpdb->get_results('SELECT c.user_id, u.display_name FROM ' . $table_name . ' c LEFT JOIN ' . $table_user . ' u ON c.user_id = u.ID WHERE u.ID <> 0 GROUP BY c.user_id');

                            if ($users && count($users) > 2) {
                                // show author list
                                echo '<div style="display:inline-block;vertical-align:top;margin:6px 0"><span class="dashicons dashicons-admin-users" style="color:#999"></span> </div> <select id="select_user" name="select_user">';
                                foreach ($users as $user) {
                                    echo '<option value="' . $user->user_id . '" ' . selected($user->user_id, $_REQUEST['select_user'], false) . '>' . $user->display_name . '</option>';
                                }
                                echo '</select>';
                                echo '<input type="submit" id="show-gallery" value="Filter" class="button-secondary" />&nbsp;&nbsp;';
                            }
                        }
                        ?>       
                    </form>
                </div>
            <?php elseif ($_REQUEST['page'] == 'wpimager_dashboard'): ?>
                <?php if (class_exists('ZipArchive')): ?>
                    <div class="pull-right" style="padding:5px 10px 0;">
                        <button id="cmdImportCanvas" class="button btn btn-sm btn-default button-main">
                            <span class="fa fa-file-archive-o"></span> &nbsp;Import Canvas
                        </button>		
                    </div>
                <?php else: ?>
                    <div class="pull-right" style="padding:5px 10px 0;">
                        <button id="naImportCanvas" class="button btn btn-sm btn-default button-main">
                            <span class="fa fa-file-archive-o"></span> &nbsp;Import Canvas
                        </button>		
                    </div>
                <?php endif; ?>
            <?php endif; ?>
            <a class="cover-tab<?php echo ($_REQUEST['page'] == 'wpimager_dashboard' ? ' active' : ''); ?>" href="<?php echo $admin_url ?>?page=wpimager_dashboard">Dashboard</a>
            <a class="cover-tab<?php echo ($_REQUEST['page'] == 'wpimager_canvas' ? ' active' : ''); ?>" href="<?php echo $admin_url ?>?page=wpimager_canvas">Canvas</a>
            <a class="cover-tab<?php echo ($_REQUEST['page'] == 'wpimager_create' ? ' active' : ''); ?>" href="<?php echo $admin_url ?>?page=wpimager_create">Create</a>
            <a class="cover-tab<?php echo ($_REQUEST['page'] == 'wpimager_gfonts' ? ' active' : ''); ?>" href="<?php echo $admin_url ?>?page=wpimager_gfonts">Fonts</a>
            <?php if ($WPImagerEditor->is_admin()): ?>
                <a class="cover-tab<?php echo ($_REQUEST['page'] == 'wpimager_useraccess' ? ' active' : ''); ?>" href="<?php echo $admin_url ?>?page=wpimager_useraccess">Users</a>
            <?php endif; ?>
        </div>
    </div>
</div>

