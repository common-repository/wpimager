<?php
if (!defined('ABSPATH'))
    exit; // Exit if accessed directly

if (defined('WPIMAGER_FRONTEND')) {
    
} else {
    $WPImagerEditor->WPImagerAccess();
}
if (!function_exists('wpimager_gfonts_headscript')) {

    function wpimager_gfonts_headscript() {
        ?>
        <?php if (strpos($_SERVER['HTTP_REFERER'], "_editor") !== false): ?>
            <style>
                #adminmenuback, #adminmenuwrap, #wpadminbar, #section_font_apply {
                    display: none;
                }
                #wpcontent { 
                    margin-left:14px !important;
                }

                html.wp-toolbar { padding-top: 0 }
                #wpwrap { background-color:#393939 }
                #wpcontent h1, #wpcontent h2, #wpcontent h3 { 
                    color:#eaeaea;
                    font-weight:300;
                }
                .btn-danger {
                    color: #fff !important;
                    background-color: #d9534f !important;
                    border-color: #d43f3a !important;
                    line-height: 24px !important;
                    -moz-border-radius: 3px;
                    -webkit-border-radius: 3px;
                    border-radius: 3px;    
                }
                input {
                    line-height: 20px;
                }
                #section_font_apply {
                    vertical-align: top;
                    line-height: 30px;
                    margin: 0px 20px;
                    font-size:18px;

                }
            </style>
        <?php endif; ?>	
        <script>
            var ajaxurl = "<?php echo admin_url('admin-ajax.php') ?>";
            var CloudGFonts = {};
        <?php
        $userID = get_current_user_id();
        $_options = get_user_option('wpimager_options', $userID);
        $options = unserialize($_options);
        if (!isset($options['gfonts'])) {
            // set default google fonts
            $options['gfonts'] = WPIMAGER_FONTS_DEFAULT;
        }
        ?>
            var Fonts = {};
        <?php if (!empty($options['gfonts'])): ?>
                try {
                    Fonts = <?php echo $options['gfonts']; ?>;
                } catch (exception) {
                }
        <?php endif; ?>

            jQuery(function ($) {

                // fetch all available Google fonts for selection 
                $.ajax({
                    type: 'POST',
                    url: ajaxurl,
                    data: {action: 'googlefonts_list'},
                    dataType: 'json',
                    cache: false,
                    success: function (data) {
                        if (isJSON(data.googlefonts))
                            CloudGFonts = JSON.parse(data.googlefonts);
                        jQuery('#fontfamily').fontselect({
                            style: 'font-select',
                            placeholder: 'Select a font',
                            lookahead: 2,
                            gfonts: CloudGFonts,
                            Fonts: Fonts,
                            wpimager_options_gfonts: '<?php echo wp_create_nonce('wpimager_options_gfonts') ?>'

                        });

                        // sort fonts by name in ASC order
                        var $divs = $("ul.fs-results li");
                        var alphabeticallyOrderedDivs = $divs.sort(function (a, b) {
                            return $(a).find("span.abcff").text().toUpperCase().localeCompare($(b).find("span.abcff").text().toUpperCase());
                        });

                        // refresh html with sorted fonts
                        $("ul.fs-results").html(alphabeticallyOrderedDivs);

                        countFonts();

                        // show ticks to indicate font selected
                        $(".fs-results li").each(function () {
                            var selfont = $(this).find("span.abcff").text();
                            var tick = $(this).find(".fontpick");
                            if (typeof Fonts[selfont] === "undefined") {
                                tick.hide();
                            } else if (Fonts[selfont] == 1) {
                                tick.show();
                                $(this).addClass("active");
                            } else {
                                tick.hide();
                                $(this).removeClass("active");
                            }

                        });

                    }
                });


                /**
                 * Validate JSON String. Avoid errors.              
                 */
                function isJSON(str) {
                    try {
                        var obj = JSON.parse(str);
                        return !!obj && typeof obj === 'object';
                    } catch (e) {
                    }
                    return false;
                }

                // Allow user to key in custom phrase to preview font
                $('#txtphrase').keyup(function () {
                    var newphrase = $(this).val();
                    $(".fs-results li").each(function () {
                        var phrase = $(this).find("span.abc");
                        phrase.text(newphrase);
                    })
                });
                $("#cmdApplyFont").click(function () {
                    var font = $("#section_font_apply").data("font");
                    window.parent.closeFontsMore(font);
                });

            })

            var current_category = "";
            var current_search = "";

            /**
             * Count the number of fonts for each category
             * Show count on buttons
             */
            function countFonts() {
                var cat_selected = 0, cat_all = 0, cat_display = 0, cat_sansserif = 0, cat_serif = 0, cat_handwriting = 0, cat_monospace = 0;
                for (var i = 0; i < CloudGFonts.length; i++) {
                    var category = CloudGFonts[i].category.replace(/-/g, '');
                    eval("cat_" + category + "++");
                    cat_all++;
                    var font = CloudGFonts[i].family;
                    if (typeof Fonts[font] !== "undefined") {
                        if (Fonts[font] == 1)
                            cat_selected++;
                    }
                }
                (function ($) {
                    $("#cnt_selected").text(cat_selected.toString());
                    $("#cnt_all").text(cat_all.toString());
                    $("#cnt_display").text(cat_display.toString());
                    $("#cnt_sansserif").text(cat_sansserif.toString());
                    $("#cnt_serif").text(cat_serif.toString());
                    $("#cnt_handwriting").text(cat_handwriting.toString());
                    $("#cnt_monospace").text(cat_monospace.toString());
                })(jQuery);
            }



        </script>
        <?php
    }

}

if (!function_exists('wpimager_gfonts')) {

    /**
     * Google Font view. Displays a list of selectable Google fonts for use in Canvas editor
     */
    function wpimager_gfonts() {
        ?>      

        <div class="wrap">
        <?php if (strpos($_SERVER['HTTP_REFERER'], "_editor") !== false): ?>
                <button  class="hideOutputConsole btn btn-sm btn-slate pull-right"  onclick="window.parent.closeFontsMore();"><span class="fa fa-times"></span></button>
            <?php else: ?>
                <?php require_once WPIMAGER_PLUGIN_PATH . 'include/header.php'; ?>
            <?php endif; ?>
            <h3 class="title">Google Fonts</h3>
            <div style="margin-bottom:12px">Select fonts to add to editor's list of dropdown fonts.</div>
            <button id="btnSelectedFonts" class="button button-primary btnFilter" data-category="selected">Selected Fonts <span id="cnt_selected" class="badge"></span></button>
            <button class="button button-secondary btnFilter" data-category="display">Display <span id="cnt_display" class="badge"></span></button>
            <button class="button button-secondary btnFilter" data-category="handwriting">Handwriting <span id="cnt_handwriting" class="badge"></span></button>
            <button class="button button-secondary btnFilter" data-category="sans-serif">Sans-Serif <span id="cnt_sansserif" class="badge"></span></button>
            <button class="button button-secondary btnFilter" data-category="serif">Serif <span id="cnt_serif" class="badge"></span></button>
            <button class="button button-secondary btnFilter" data-category="monospace">Monospace <span id="cnt_monospace" class="badge"></span></button>

            <p class="search-box clear">
                <label class="screen-reader-text" for="search_id-search-input">Search Title:</label>
                <input type="search" id="fontname-filter" name="s" value="" placeholder="Font name filter"></p>
            <p>
                <span id="alphamenu"></span> 
            </p>
            <div>
                <input type="text" id="txtphrase" class="regular-text" name="txtphrase" placeholder="Enter New Phrase" value="">
        <?php if (strpos($_SERVER['HTTP_REFERER'], "_editor") !== false): ?>
                    <div id="section_font_apply" style="color:#eaeaea">
                        <span id="label_font_apply"></span> <button id="cmdApplyFont" class="button btn-danger">Apply Font</button>
                    </div>
        <?php endif; ?>
            </div>
            <p>
                <input id="fontfamily" type="text"/>       
            </p>
            <div id="currfonts"></div>
        </div>


        <?php
    }

}