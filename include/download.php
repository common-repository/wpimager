<?php

if (!defined('ABSPATH'))
    exit; // Exit if accessed directly

$WPImagerEditor->WPImagerAccess();

$_wpimager_file = trim($_GET['path']);
$_wpimager_canvas_id = (int) trim($_GET['canvas_id']);
$_wpimager_time = trim($_GET['tick']);
// $guest = (int) trim($_GET['guest']);
$_wpimager_ext = in_array($_GET['ext'], array("png", "jpg", "gif")) ? $_GET['ext'] : "png";
$_wpimager_fname = trim($_GET['fname']);

// assign download file name if not specified
$_wpimager_fname = (!empty($_wpimager_fname)) ? $_wpimager_fname . "." . $_wpimager_ext : "IMG" . $_wpimager_canvas_id . "_download." . $_wpimager_ext;

$_wpimager_download = WPIMAGER_TEMP_DIR . "IMG" . $_wpimager_canvas_id . "_download" . $_wpimager_time . "." . $_wpimager_ext;
$_wpimager_file = $_wpimager_download;
// force user to download the image
if (file_exists($_wpimager_file)) {
    header('Content-Description: File Transfer');
    header('Content-Type: image/png');
    header('Content-Disposition: attachment; filename=' . $_wpimager_fname);
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    header('Pragma: public');
    header('Content-Length: ' . filesize($_wpimager_file));
    ob_clean();
    flush();
    readfile($_wpimager_file);
    @unlink($_wpimager_file);
    exit;
} else {
    echo "$_wpimager_file not found";
}