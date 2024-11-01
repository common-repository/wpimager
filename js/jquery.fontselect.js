/*!
 * jQuery.fontselect - A font selector for the Google Web Fonts api
 * Tom Moor, http://tommoor.com
 * Copyright (c) 2011 Tom Moor
 * MIT Licensed
 * @version 0.1
 */

/*!
    Original source: https://github.com/tommoor/fontselect-jquery-plugin

    Modified work: Implementing font selector in WPImager
    
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
        var fonts = [];
        var ifonts = [];
        
        var settings = {
            style: 'font-select',
            placeholder: 'Select a font',
            lookahead: 2,
            localcssdir: '',
            api: '//fonts.googleapis.com/css?family='
        };


        $.fn.fontselect.getLOCALCSSDIR = function () {
            return settings.localcssdir;
        };        
        
        $.fn.fontselect.getAPIURL= function () {
            return settings.api;
        };        
        
        var Fontselect = (function () {

            function Fontselect(original, o) {
                this.$original = $(original);
                this.options = o;
                this.active = false;
                this.setupHtml();
                this.getVisibleFonts();
                this.bindEvents();
                var font = this.$original.val();
                if (font) {
                    this.updateSelected();
                }
            }

            Fontselect.prototype.bindEvents = function () {

                $('li', this.$results)
                        .click(__bind(this.selectFont, this))
                        .mouseenter(__bind(this.activateFont, this))
                        .mouseleave(__bind(this.deactivateFont, this));

                $('span', this.$select).click(__bind(this.toggleDrop, this));
                this.$arrow.click(__bind(this.toggleDrop, this));
                this.$original.change(__bind(this.updateSelected, this));
                var that = this;
                $('body,input,button').click(__bind(this.closeDrop, this));
                $('select').focus(__bind(this.closeDrop, this));
            };
            Fontselect.prototype.closeDrop = function (evt) {
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
                    this.visibleInterval = setInterval(__bind(this.getVisibleFonts, this), 500);
                }

                this.active = !this.active;
            };

            Fontselect.prototype.selectFont = function () {

                var font = $('li.active', this.$results).data('value');
                var srctype = $('li.active', this.$results).data('srctype');
                if (srctype == 10) {
                    this.$original.trigger("change",[font, srctype]);                    
                } else {
                    this.$original.val(font);
                    this.$original.trigger("change",[font, srctype]);
                    this.updateSelected();
                }
                this.toggleDrop();
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
                try {
                    this.$results.scrollTop($li.position().top);
                } catch (err) {
                }

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

            Fontselect.prototype.setupHtml = function () {

                this.$original.empty().hide();
                this.$element = $('<div>', {'class': this.options.style});
                this.$arrow = $('<div id="fs-arrow"><b id="fs-arrow-b"></b></div>');
                this.$select = $('<a id="fs-selected"><span id="fs-span">' + this.options.placeholder + '</span></a>');
                this.$drop = $('<div>', {'class': 'fs-drop'});
                this.$results = $('<ul>', {'class': 'fs-results'});
                this.$original.after(this.$element.append(this.$select.append(this.$arrow)).append(this.$drop));
                this.$drop.append(this.$results.append(this.fontsAsHtml())).hide();
            };

            Fontselect.prototype.fontsAsHtml = function () {
                var l = safefonts.length;
                var r, s, h = '';

                for (var i = 0; i < l; i++) {
                    r = this.toReadable(safefonts[i]);
                    s = this.toStyle(safefonts[i]);
                    h += '<li data-srctype="0" data-value="' + safefonts[i] + '" class="websafe" style="font-family: ' + s['font-family'] + '; font-weight: ' + s['font-weight'] + '">' + r + '</li>';
                }

                l = ifonts.length;

                for (var i = 0; i < l; i++) {
                    r = this.toReadable(ifonts[i]);
                    s = this.toStyle(ifonts[i]);
                    h += '<li data-srctype="2" data-value="' + ifonts[i] + '" class="ifonts" style="font-family: ' + s['font-family'] + '; font-weight: ' + s['font-weight'] + '">' + r + '</li>';
                }

                l = fonts.length;

                for (var i = 0; i < l; i++) {
                    r = this.toReadable(fonts[i]);
                    s = this.toStyle(fonts[i]);
                    h += '<li data-srctype="3" data-value="' + fonts[i] + '" style="font-family: ' + s['font-family'] + '; font-weight: ' + s['font-weight'] + '">' + r + '</li>';
                }

                h += '<li id="addmorefonts" data-srctype="10" data-value="FontsMore" style="font-size:12px;">Add More Fonts ...</li>';
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

                var fs = this;
                var top = this.$results.scrollTop();
                var bottom = top + this.$results.height();

                if (this.options.lookahead) {
                    var li = $('li', this.$results).first().height();
                    bottom += li * this.options.lookahead;
                }

                $('li', this.$results).each(function () {

                    var ft = $(this).position().top + top;
                    var fb = ft + $(this).height();

                    if ((fb >= top) && (ft <= bottom)) {
                        var font = $(this).data('value');
                        var srctype = parseInt($(this).data('srctype'));
                            fs.addFontLink(font, srctype);
                    }

                });
            };

            Fontselect.prototype.addFontLink = function (font, srctype) {
                if (srctype !== 2 && srctype !== 3)
                    return;
                var link;
                
                if (srctype == 3) 
                    link = this.options.api + font + ":400,700,400italic,700italic";
                else if (srctype == 2)
                    link = this.options.localcssdir + font + ".css";
                
                if ($("link[href*='" + font + "']").length === 0) {
                $('link:last').after('<link href="' + link + '" rel="stylesheet" type="text/css">');
                }
            };

            return Fontselect;
        })();

            if (options && options.gfonts) {
                for (var font in options.gfonts) {
                    if (options.gfonts.hasOwnProperty(font)) {
                        var selected = options.gfonts[font];
                        if (selected == 1) {
                            fonts.push(font);
                        }
                    }
                }
            }

            if (options && options.ifonts) {
                for (var font in options.ifonts) {
                    if (options.ifonts.hasOwnProperty(font)) {
                        var selected = options.ifonts[font];                       
                        if (selected == 1) {
                            ifonts.push(font);
                        }
                    }
                }
            }            
            if (options && options.safefonts) {
                for (var font in options.safefonts) {
                    if (options.safefonts.hasOwnProperty(font)) {
                        var selected = options.safefonts[font];
                        if (selected == 1) {
                            safefonts.push(font);
                        }
                    }
                }
            }

        return this.each(function () {
            // If options exist, lets merge them
            if (options)
                $.extend(settings, options);

            return new Fontselect(this, settings);
        });

    };
})(jQuery);