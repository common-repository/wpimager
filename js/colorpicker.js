/*!
 evol.colorpicker 3.2.1
 ColorPicker widget for jQuery UI

 https://github.com/evoluteur/colorpicker
 (c) 2015 Olivier Giulieri

 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */

/*!
    Original source: https://github.com/evoluteur/colorpicker (MIT License)

    Modified work:  Implementing Canvas color picker in WPImager
    
    2018 WPImager  
    https://wpimager.com/
 */

(function( $ ) {

var _idx=0,
	ua=window.navigator.userAgent,
	isIE=ua.indexOf("MSIE ")>0,
	_ie=isIE?'-ie':'',
	isMoz=isIE?false:/mozilla/.test(ua.toLowerCase()) && !/webkit/.test(ua.toLowerCase()),
	transColor='#0000ffff',
	int2Hex=function(i){
		var h=i.toString(16);
		if(h.length==1){
			h='0'+h;
		}
		return h;
	},
	st2Hex=function(s){
		return int2Hex(Number(s));
	},
	toHex3=function(c){
		if(c.length>10){ // IE9
			var p1=1+c.indexOf('('),
				p2=c.indexOf(')'),
				cs=c.substring(p1,p2).split(',');
			return ['#',st2Hex(cs[0]),st2Hex(cs[1]),st2Hex(cs[2])].join('');
		}else{
			return c;
		}
	};

    $.widget( "wpimager.colorichpicker", {

	version: '1.0',
	
	options: {
		color: null, // example:'#31859B'
		showOn: 'both', // possible values: 'focus','button','both'
		hideButton: false,
		transparentColor: false,
        canvaspicker: true,
		history: true,
		defaultPalette: 'theme', // possible values: 'theme', 'web'
		strings: 'Theme Colors,Standard Colors,Web Colors,Theme Colors,Back to Palette,History,No history yet.'
	},

	// this is only true while showing the palette until color is chosen
	_active: false,

	_create: function() {
		var that=this;
		this._id='evo-cp'+_idx++;
		this._enabled=true;
		this.options.showOn=this.options.hideButton?'focus':this.options.showOn;
		switch(this.element.get(0).tagName){
			case 'INPUT':
				var color=this.options.color,
					e=this.element,
					css=((this.options.showOn==='focus')?'':'evo-pointer ')+'evo-colorind'+(isMoz?'-ff':_ie)+(this.options.hideButton?' evo-hidden-button':''),
					style='';
				this._isPopup=true;
				this._palette=null;
				if(color!==null){
					e.val(color);
				}else{
					var v=e.val();
					if(v!==''){
						color=this.options.color=v;
					}
				}
				if(color===transColor){
					css+=' evo-transparent';
				}else{
					style=(color!==null)?('background-color:'+color):'';
				}
				e.addClass('colorichPicker '+this._id)
					.wrap('<div class="colorPickerCover"><div class="colorPickerWrap" style="width:'+(this.options.hideButton?this.element.width():this.element.width()+42)+'px;'+
						(isIE?'padding:0px 0;vertical-align:top;margin-top:0px':'')+
						(isMoz?'padding:2px 0;':'')+
						'"></div></div>')
					.after('<div class="'+css+'" style="'+style+'"></div>')
					.on('keyup onpaste', function(evt){
						var c=$(this).val();
						if(c!=that.options.color){
                                                    that._setValue(c, true);
						}
					});
				var showOn=this.options.showOn;
				if(showOn==='both' || showOn==='focus'){
					e.on('focus', function(){
						that.showPalette();
					});
				}
				if(showOn==='both' || showOn==='button'){
					e.next().on('click', function(evt){
						evt.stopPropagation();
						that.showPalette();
					});
				}
				break;
			default:
				this._isPopup=false;
				this._palette=this.element.html(this._paletteHTML())
					.attr('aria-haspopup','true');
				this._bindColors();
		}
	},


	_colorIndHTML: function(c) {
		var css=isIE?'evo-colorbox-ie ':'',
			style='';

		if(c){
			if(c===transColor){
				css+='evo-transparent';
			}else{
                            if (c.toLowerCase() == "#0000ffff") {
				style='background-color:transparent';                                
				css+='evo-transparent';
                            } else {
				style='background-color:'+c;
                            }
			}
		}else{
			style='display:none';
		}
		return '<div class="evo-color" style="float:left">'+
			'<div style="'+style+'" class="'+css+'"></div><span>'+ // class="evo-colortxt-ie"
			(c?c:'')+'</span></div>';
	},

    _canvasColorPick: function() {
            this.element.trigger('canvaspick.color');
            this.hidePalette();
        },

	showPalette: function() {
       this._canvasColorPick(this);
	},

	hidePalette: function() {
		if(this._isPopup && this._palette){
			$(document.body).off('click.'+this._id);
			var that=this;
			this._palette.off('mouseover click', 'td,.evo-transparent')
				.fadeOut(function(){
					that._palette.remove();
					that._palette=that._cTxt=null;
				})
				.find('.evo-more a').off('click');
		}
		return this;
	},

	_bindColors: function() {
		var that=this,
			opts=this.options,
			es=this._palette.find('div.evo-color'),
			sel=opts.history?'td,.evo-cHist>div':'td';

		if(opts.transparentColor){
			sel+=',.evo-transparent';
		}
		this._palette
			.on('click', sel, function(evt){
				if(that._enabled){
					var $this=$(this);
					that._setValue($this.hasClass('evo-transparent')?transColor:toHex3($this.attr('style').substring(17)));
					that._active=false;
				}
			});
            this._palette.find('.evo-canpick a').on('click', function () {
                that._canvasColorPick(this);
            });
	},

	val: function(value) {
		if (typeof value=='undefined') {
			return this.options.color;
		}else{
			this._setValue(value);
			return this;
		}
	},

	_setValue: function(c, noHide, noTrigger) {
		c = c.replace(/ /g,'');
                var isOk = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(c);
                var isOk2 = /(^[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(c);
                if (isOk || c.toLowerCase() == "#0000ffff") {
                    this.element.css("color","#333333");                                                        
                } else if (isOk2 || c.toLowerCase() == "0000ffff") {
                    c = '#'+c;
                    this.element.css("color","#333333");                                                        
                } else {
                    this.element.css("color","#cc0000");
                    return;
                }
            
		this.options.color=c;
		if(this._isPopup){
			if(!noHide){
				this.hidePalette();
			}
			this._setBoxColor(this.element.val(c).next(), c);
		}else{
			this._setColorInd(c,1);
		}
		if(this.options.history && this._paletteIdx>0){
			this._add2History(c);
		}
                if (typeof noTrigger === "undefined") {
                    this.element.trigger('change.color', c);
                }
	},

	_setColorInd: function(c, idx) {
		var $box=this['_cTxt'+idx];
		this._setBoxColor($box, c);
		$box.next().html(c);
	},

	_setBoxColor: function($box, c) {
		if(c===transColor){
			$box.addClass('evo-transparent')
				.removeAttr('style');
		}else{
                        if (c.toLowerCase() == "#0000ffff") {
			$box.addClass('evo-transparent')
				.attr('style','transparent');
                        } else {
                            $box.removeClass('evo-transparent')
                                    .attr('style','background-color:'+c);                            
                        }
		}
	},

    _setOption: function(key, value) {
		if(key=='color'){
			this._setValue(value, true, true);
		}else{
			this.options[key]=value;
		}
        this.options[key]=value;
	},
    

	clear: function(){
		this.hidePalette().val('');
	},

	enable: function() {
		var e=this.element;
		if(this._isPopup){
			e.removeAttr('disabled');
		}else{
			e.css({
				'opacity': '1', 
				'pointer-events': 'auto'
			});
		}
		if(this.options.showOn!=='focus'){
			this.element.next().addClass('evo-pointer');
		}
		e.removeAttr('aria-disabled');
		this._enabled=true;
		return this;
	},

	disable: function() {
		var e=this.element;
		if(this._isPopup){
			e.attr('disabled', 'disabled');
		}else{
			this.hidePalette();
			e.css({
				'opacity': '0.3', 
				'pointer-events': 'none'
			});
		}
		if(this.options.showOn!=='focus'){
			this.element.next().removeClass('evo-pointer');
		}
		e.attr('aria-disabled','true');
		this._enabled=false;
		return this;
	},

	isDisabled: function() {
		return !this._enabled;
	},

	destroy: function() {
		$(document.body).off('click.'+this._id);
		if(this._palette){
			this._palette.off('mouseover click', 'td,.evo-cHist>div,.evo-transparent')
				.find('.evo-more a').off('click');
			if(this._isPopup){
				this._palette.remove();
			}
			this._palette=this._cTxt=null;
		}
		this.element.removeClass('colorichPicker '+this.id).empty();
		$.Widget.prototype.destroy.call(this);
	}

});

})(jQuery);