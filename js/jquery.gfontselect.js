/*!
 * jQuery.fontselect - A font selector for the Google Web Fonts api
 * Tom Moor, http://tommoor.com
 * Copyright (c) 2011 Tom Moor
 * MIT Licensed
 * @version 0.1
 */

/*!
 Original source: https://github.com/tommoor/fontselect-jquery-plugin
 
 Modified work: Implementing Google Font selection in WPImager user option.
 
 2018 WPImager  
 https://wpimager.com/
 */

(function ($) {

    $.fn.fontselect = function (options) {

        var __bind = function (fn, me) {
            return function () {
                return fn.apply(me, arguments);
            };
        };
        var safefonts = [];


        var settings = {
            style: 'font-select',
            placeholder: 'Select a font',
            lookahead: 2,
            abc: 'The quick brown fox jumps over the lazy dog.',
            page: 'wpimager_gfonts',
            api: '//fonts.googleapis.com/css?family='
        };

        $.fn.fontselect.getAPIURL = function () {
            return settings.api;
        };
        var Fontselect = (function () {

            function Fontselect(original, o) {
                this.$original = $(original);
                this.options = o;
                this.active = false;
                this.current_search = "";
                this.current_category = "";
                this.setupHtml('selected');
                this.getVisibleFonts();
                this.bindEvents();
                var font = this.$original.val();
                if (font) {
                    this.updateSelected();
                    this.addFontLink(font);
                }

                setTimeout(function () {
                    $("#btnSelectedFonts").click();
                }, 1000);

            }

            Fontselect.prototype.bindEvents = function () {

                $('#fontname-filter').keyup(__bind(this.txtSearch, this));

                $('.btnFilter').click(__bind(this.btnSelectCategory, this));

                $('span', this.$select).click(__bind(this.toggleDrop, this));

                $('.li', this.$results).click(__bind(this.selectFont, this));


                this.$arrow.click(__bind(this.toggleDrop, this));
                this.$original.change(__bind(this.updateSelected, this));
            };



            Fontselect.prototype.closeDrop = function (evt) {
                return;
                if (this.active) {
                    if (evt.target.id.substr(0, 3) !== "fs-")
                    {                    //
                        this.$element.removeClass('font-select-active');
                        this.$drop.hide();
                        clearInterval(this.visibleInterval);
                        clearInterval(this.closeDropInterval);
                        this.active = false;
                        $("#closeFontSelect").val("0");
                    }
                }
            };



            Fontselect.prototype.toggleDrop = function (ev) {

                if (this.active) {
                    this.$element.removeClass('font-select-active');
                    this.$drop.hide();
                    clearInterval(this.visibleInterval);

                } else {
                    $("#closeFontSelect").val("0");
                    this.$element.addClass('font-select-active');
                    this.$drop.show();
                    this.moveToSelected();
                    this.visibleInterval = setInterval(__bind(this.getVisibleFonts, this), 1000);
                }

                this.active = !this.active;
            };

            Fontselect.prototype.txtSearch = function (e) {
                this.current_search = $(e.delegateTarget).val().toLowerCase();
                var current_category = this.current_category;
                var current_search = this.current_search;
                $(".fs-results li").each(function () {
                    var selfont = $(this).find("span.abcff").text();
                    var category = current_category;
                    var match = (selfont.toLowerCase().indexOf(current_search) !== -1);

                    if (match && (category == "all" || $(this).data("category") == category)) {
                        $(this).css("display", "list-item");
                    } else {
                        $(this).css("display", "none");
                    }
                })
                this.getVisibleFonts();

            };


            /**
             * Select Google Font. Update server via ajax call.
             * Indicate selected with a tick.
             */
            Fontselect.prototype.pickfont = function (e) {
                var selfont = $(e.delegateTarget).find("span.abcff").text();
                var tick = $(e.delegateTarget).find(".fontpick");
                if (typeof this.options.Fonts[selfont] === "undefined") {
                    this.options.Fonts[selfont] = 1;
                    tick.show();
                    $(e.delegateTarget).parent().addClass("active");
                    $("#label_font_apply").text(selfont).css('font-family', selfont);
                    $("#section_font_apply").css('display', 'inline-block');
                    $("#section_font_apply").data("font", selfont);
                    $("#txtphrase").css('font-family', selfont);
                } else if (Fonts[selfont] == 1) {
                    this.options.Fonts[selfont] = 0;
                    tick.hide();
                    $(e.delegateTarget).parent().removeClass("active");
                    // if (selfont == $("#label_font_apply").text())
                    {
                        $("#section_font_apply").hide();
                    }
                    $("#txtphrase").css('font-family', selfont);
                } else {
                    this.options.Fonts[selfont] = 1;
                    tick.show();
                    $(e.delegateTarget).parent().addClass("active");
                    $("#label_font_apply").text(selfont).css('font-family', selfont);
                    $("#section_font_apply").css('display', 'inline-block');
                    $("#section_font_apply").data("font", selfont);
                    $("#txtphrase").css('font-family', selfont);
                }
                // update to server
                $.ajax({
                    type: 'POST',
                    url: ajaxurl,
                    data: {action: 'update_gfonts', fonts: JSON.stringify(this.options.Fonts), _wpnonce: this.options.wpimager_options_gfonts},
                    dataType: 'json',
                    cache: false,
                    success: function (msg) {
                        if (msg.success) {
                            countFonts();
                        }
                    }
                });
                return false;
            }


            Fontselect.prototype.btnSelectCategory = function (e) {
//                				current_category = category;
                this.current_category = $(e.delegateTarget).data("category");
                this.current_search = $('#fontname-filter').val();
                this.setupHtml(this.current_category);
                this.getVisibleFonts();
                $(".button").removeClass("button-primary").addClass("button-secondary");
                $(e.delegateTarget).addClass("button-primary").removeClass("button-secondary");
                letterCount = {};

                l = this.options.gfonts.length;
                for (var i = 0; i < l; i++) {
                    var category = this.options.gfonts[i].category;
                    var selfont = this.options.gfonts[i].family;
                    var match = false;
                    if (selfont.toLowerCase().indexOf(this.current_search) !== -1)
                    {
                        match = true;
                    }
//                    					if (typeof Fonts[font] !== "undefined" && Fonts[font] == 1) {

                    if (match && (this.current_category == "all" || this.current_category == category)) {
//                        $(e.delegateTarget).css("display", "list-item");
                        if (typeof letterCount[selfont.charAt(0).toUpperCase()] === "undefined")
                            letterCount[selfont.charAt(0).toUpperCase()] = 1;
                        else
                            letterCount[selfont.charAt(0).toUpperCase()]++;
                    } else {
                        //                      $(e.delegateTarget).css("display", "none");
                    }


                }


//                $(".fs-results li").each(function () {
//                    var selfont = $(this).find("span.abcff").text();
//                    var match = false;
//                    var category = current_category;
//                    if (selfont.toLowerCase().indexOf(current_search) !== -1)
//                    {
//                        match = true;
//                    }
//                    if (match && (category == "all" || $(this).data("category") == category)) {
//                        $(this).css("display", "list-item");
//                        if (typeof letterCount[selfont.charAt(0).toUpperCase()] === "undefined")
//                            letterCount[selfont.charAt(0).toUpperCase()] = 1;
//                        else
//                            letterCount[selfont.charAt(0).toUpperCase()]++;
//
//                    } else {
//                        $(this).css("display", "none");
//                    }
//                })
                $('#alphamenu').html("");
                for (var alphabet in letterCount) {
                    $('#alphamenu').append($('<a href="#" class="pickalphabet" data-alphabet="' + alphabet + '">' + alphabet + "(" + letterCount[alphabet].toString() + ")" + '</a>')).append(" &nbsp;");
                }

                $('.pickalphabet').click(__bind(this.pickAlphabet, this));

            }

            Fontselect.prototype.pickAlphabet = function (e) {
                var current_category = this.current_category;
                var letter = $(e.delegateTarget).data("alphabet");
                ;
                var Fonts = this.options.Fonts;
                $(".fs-results li").each(function () {
                    var selfont = $(this).find("span.abcff").text();
                    var category = current_category;
                    if (selfont.charAt(0).toUpperCase() == letter && category == "" && typeof Fonts[selfont] !== "undefined" && Fonts[selfont] == 1) {
                        $(this).css("display", "list-item");
                    } else if (selfont.charAt(0).toUpperCase() == letter && (category == "all" || $(this).data("category") == category)) {
                        $(this).css("display", "list-item");
                    } else {
                        $(this).css("display", "none");
                    }
                })
                this.getVisibleFonts();

            }

            Fontselect.prototype.selectFont = function () {

//                var font = $('li.active', this.$results).data('value');
//                this.$original.val(font).change();
//                this.updateSelected();
//                this.toggleDrop();
            };

            Fontselect.prototype.moveToSelected = function () {

                var $li, font = this.$original.val();
                this.$results.scrollTop(0);
                if (font) {
                    $li = $("li[data-value='" + font + "']", this.$results);
                } else {
                    $li = $("li", this.$results).first();
                }
                $li.addClass('active');
                this.$results.scrollTop($li.position().top);
            };

            Fontselect.prototype.activateFont = function (ev) {
                $('li.active', this.$results).removeClass('active');
                $(ev.currentTarget).addClass('active');
            };

            Fontselect.prototype.deactivateFont = function (ev) {

                $(ev.currentTarget).removeClass('active');
            };

            Fontselect.prototype.updateSelected = function () {

                var font = this.$original.val();
                $('span', this.$element).text(this.toReadable(font)).css(this.toStyle(font));
            };

            Fontselect.prototype.setupHtml = function (category) {
                if (typeof this.$element !== "undefined") {
                    this.$element.remove();
                    this.$arrow.remove();
                    this.$select.remove();
                    this.$drop.remove();
                    this.$results.remove();
                }
                this.$original.empty().hide();
                this.$element = $('<div>', {'class': this.options.style});
                this.$arrow = $('<div id="fs-arrow"><b id="fs-arrow-b"></b></div>');
                this.$select = $('<a id="fs-selected"><span id="fs-span">' + this.options.placeholder + '</span></a>');
                this.$drop = $('<div>', {'class': 'fs-drop'});
                this.$results = $('<ul>', {'class': 'fs-results'});
                this.$original.after(this.$element.append(this.$select.append(this.$arrow)).append(this.$drop));
                // this.$drop.append(this.$results.append(this.fontsAsHtml(category))); //.hide();
                this.$drop.append(this.$results.append(this.fontsAsHtml(category))); //.hide();
                this.$select.hide();
//                this.toggleDrop();
                $(this.$results)
                        .scroll(__bind(this.getVisibleFonts, this))

                $('.pickfont').click(__bind(this.pickfont, this));

            };

            Fontselect.prototype.fontsAsHtml = function (category) {
                var l = safefonts.length;
                var r, s, h = '';
                var abc = ($("#txtphrase").val().length > 0) ? $("#txtphrase").val() : this.options.abc;
                for (var i = 0; i < l; i++) {
                    r = this.toReadable(safefonts[i]);
                    s = this.toStyle(safefonts[i]);
                    h += '<li data-value="' + safefonts[i] + '" class="websafe" style="font-family: ' + s['font-family'] + '; font-weight: ' + s['font-weight'] + '">' + r + '</li>';
                }

                l = this.options.gfonts.length;
                for (var i = 0; i < l; i++) {
                    var font = this.options.gfonts[i].family;
                    if ((category == "selected" && typeof this.options.Fonts[font] !== "undefined" && this.options.Fonts[font] == 1) ||
                            (this.options.gfonts[i].category == category && (this.options.gfonts[i].family.toLowerCase().indexOf(this.current_search) !== -1))) {
                        r = this.toReadable(this.options.gfonts[i].family);
                        s = this.toStyle(this.options.gfonts[i].family);
                        if (this.options.page == "wpimager_options") {
                            h += '<li data-value="' + this.options.gfonts[i].family + '" data-category="' + this.options.gfonts[i].category + '" data-font-family="' + s['font-family'] + '" data-font-weight="' + s['font-weight'] + '"><span class="">' + s['font-family'] + '</span></li>';
                        } else {
                            h += '<li data-value="' + this.options.gfonts[i].family + '" data-category="' + this.options.gfonts[i].category + '" data-font-family="' + s['font-family'] + '" data-font-weight="' + s['font-weight'] + '"><a href="#" class="pickfont"><span class="abc">' + abc + '</span><span class="abcff">' + s['font-family'] + '</span><div class="fontpick"><span class="fa fa-check"></span></div></a></li>';
                        }
                    }
                }

                return h;
            };

            Fontselect.prototype.toReadable = function (font) {
                return font.replace(/[\+|:]/g, ' ');
            };

            Fontselect.prototype.toStyle = function (font) {
                var t = font.split(':');
                return {'font-family': this.toReadable(t[0]), 'font-weight': (t[1] || 400)};
            };

            Fontselect.prototype.getVisibleFonts = function () {
                if (this.$results.is(':hidden'))
                    return;
                if (this.$results.css('display') === "none")
                    return;

                var fs = this;
                var top = this.$results.scrollTop();
                var bottom = top + this.$results.height();

                if (this.options.lookahead) {
                    var li = $('li', this.$results).first().height();
                    bottom += li * this.options.lookahead;
                }
                var Fonts = this.options.Fonts;
                $('li', this.$results).each(function () {
                    if ($(this).css("display") !== "none") {
                        var ft = $(this).position().top + top;
                        var fb = ft + $(this).height();
                        if ((fb >= top) && (ft <= bottom)) {
                            var font = $(this).data('value');
                            var fontfamily = $(this).data("font-family");
                            var fontweight = $(this).data("font-weight");
                            $(this).css("font-family", fontfamily);
                            $(this).css("font-weight", fontweight);
                            var tick = $(this).find(".fontpick");
                            if (typeof Fonts[fontfamily] !== "undefined" && Fonts[fontfamily] == 1) {
                                tick.show();
                                $(this).addClass("active");
                            } else {
                                tick.hide();
                                $(this).removeClass("active");
                            }
                            fs.addFontLink(font);
                        }
                    }

                });
            };

            Fontselect.prototype.addFontLink = function (font) {
                if (safefonts.indexOf(font) >= 0)
                    return;
                var link = this.options.api + font;
                if ($("link[href*='" + font + "']").length === 0) {
                    $('link:last').after('<link href="' + link + '" rel="stylesheet" type="text/css">');
                }
            };

            return Fontselect;
        })();

        if (options)
            $.extend(settings, options);
        new Fontselect(this, settings);

    };
})(jQuery);