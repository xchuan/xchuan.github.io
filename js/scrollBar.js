(function($){

 	$.fn.extend({ 
 		
		scrollBar: function(options) {

			//继承配置
			var options =  $.extend(defaults, options);
			$(document).data("targets",[]);
			$(document).data("menu",[]);
			var scroll = this;

			var setBox = function(a) {
				scroll.box=a;
			}
			this.updateSize = function(html){
				scroll.box.resize();
				return this;
			}
			//初始化
    		return this.each(function(){
				var o = options;
				var obj = $(this);
				var box= new ResizableContent(obj,o);
				setBox(box);
    		});
		}
		
	});

	function addEventHandler(oTarget, sEventType, fnHandler) {
		if (sEventType=='mousewheel') {
			sEventType =(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : sEventType
		}
		if (oTarget.addEventListener) {
			oTarget.addEventListener(sEventType, fnHandler, false);
		} else if (oTarget.attachEvent) {
			oTarget.attachEvent("on" + sEventType, fnHandler);
		} else {
			oTarget["on" + sEventType] = fnHandler;
		}
	};

	function removeEventHandler(oTarget, sEventType, fnHandler) {
		if (sEventType=='mousewheel') {
			sEventType =(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : sEventType
		}
		if (oTarget.removeEventListener) {
			oTarget.removeEventListener(sEventType, fnHandler, false);
		} else if (oTarget.detachEvent) {
			oTarget.detachEvent("on" + sEventType, fnHandler);
		} else { 
			oTarget["on" + sEventType] = null;
		}
	};

	//初始化可变尺寸内容框
	var ResizableContent = function(element,opt){
		var target=element;
		var obj = this;
		
		var init= function() {
			var boxstyledict={
				'position': 'relative',
				'overflow': 'hidden'
			}
			obj.target = element;
			obj.settings = $.extend({}, defaults, opt);
			obj.target.css(boxstyledict);
			obj.ratio = 1;
			var scrollinner = $('<div class="scroll_inner"></div>');
			obj.target.wrapInner(scrollinner);
			
			obj.content = element.find(' > div:eq(0)');
			if (opt.isFixPart) {
				obj.content.css({'padding-right':'14px'});	
			}
			if (opt.type=='x' && opt.maxwidth!=0) {
				//console.log(opt.maxwidth);
				obj.content.css({
					'height':(element.height()+16)+'px',
					'width':opt.maxwidth+'px'
				})	
			}
			if (opt.maxwidth!=0) {
				obj.content.css({
					'width':opt.maxwidth+'px'
				})
			}

			obj.ratio = Number((element.find(' > div:eq(0)').outerHeight()-element.height())/(element.height()-obj.settings.scrollColumnWidth));
			obj.xratio = Number((element.find(' > div:eq(0)').outerWidth()-element.width())/(element.width()-obj.settings.scrollColumnWidth));
			obj.rate = obj.maxRatio(obj.ratio);
			$('.indict em:eq(0)').html(element.find(' > div:eq(0)').outerHeight()-element.height()+'|'+(element.height()-obj.settings.scrollColumnWidth));
			var yScroll,xScroll;

			if (opt.type =='x') {
				xScroll = new Scroll('x',obj);		
			}else if(opt.type =='y'){
				yScroll = new Scroll('y',obj);
			}else {
				yScroll = new Scroll('y',obj);
				xScroll = new Scroll('x',obj);
			}
			
			obj.x=xScroll;
			obj.y=yScroll;
			var rbResizer = new Resizer();
			obj.target.focus();
			
			obj.target.mouseover(function(evt) {
				if (typeof obj.target.data('animating')=='undefined') {
					addEventHandler(document, "mousewheel", onMouseWheel);
					obj.target.data('animating','1')
					if (typeof xScroll!='undefined') {
						xScroll.bar.stop().animate({opacity:1},function() {
							if (typeof obj.target.data('animating') !='undefined') {
								obj.target.removeData('animating')
							}
						});
					}
					if (typeof yScroll!='undefined') {
						yScroll.bar.stop().animate({opacity:1},function() {
							if (typeof obj.target.data('animating') !='undefined') {
								obj.target.removeData('animating')
							}
						});
					}
				}
				evt.stopPropagation();
			}).mouseout(function(evt) {
				if (typeof obj.target.data('hold')=='undefined') {
					if (typeof xScroll!='undefined') {
						xScroll.bar.stop().animate({opacity:0});	
					}
					if (typeof yScroll!='undefined') {
						yScroll.bar.stop().animate({opacity:0});
					}
					obj.target.removeData('animating');
				}
				removeEventHandler(document, "mousewheel", onMouseWheel);
			});
		}
		this.maxRatio =function(a) {
			return Number(a)>parseInt(a,10)?parseInt(a,10)+1:parseInt(a,10); 
		}
		this.resize = function() {
			obj.ratio = Number((element.find(' > div:eq(0)').outerHeight()-element.height())/(element.height()-obj.settings.scrollColumnWidth));
			obj.ratio = obj.maxRatio(obj.ratio);
			$('.indict em:eq(0)').html(obj.ratio+'|'+element.find(' > div:eq(0)').outerHeight()+'|'+(element.height()-obj.settings.scrollColumnWidth));
		}
		
		function onMouseWheel(event) {
			event.preventDefault();

			var nowtop,nowctop;
			var nowleft,nowcleft;
			if (typeof obj.x!='undefined' && obj.settings.type!='xy') {
				if (target.find(' > div:eq(0)').css('left')=='auto' && typeof obj!='undefined') {
					if (obj.x.tip.data('left')){
						nowleft=parseInt(obj.y.tip.data('left'),10);	
					}else {
						nowleft=0;
					}
					if (target.find(' > div:eq(0)').data('left')) {
						nowcleft=parseInt(target.find(' > div:eq(0)').data('left'),10);
					}else {
						nowcleft=0;
					}
				}else {
					nowleft=parseInt(obj.x.tip.data('left'),10);
					nowcleft=parseInt(target.find(' > div:eq(0)').data('left'),10);
				}

				var nowscrolltop= -(nowleft+event.wheelDelta*(1/obj.xratio));
				var maxRange = obj.x.w-obj.x.barsize;
				var maxContent = obj.target.find('>div:eq(0)').outerWidth()-obj.target.width();
				if (typeof obj=='undefined') {
					obj.x.bar.stop().css({opacity:1});
				}
				//console.log(obj.xratio);
				var nowcontenttop= -(nowleft+event.wheelDelta*obj.rate);
				if (nowcontenttop<0) {
					nowcontenttop=0;	
				}
				if (nowscrolltop<0) {
					nowscrolltop=0;	
				}
				if (nowscrolltop>maxRange) {
					nowscrolltop=maxRange;
					
				}
				if (nowcontenttop>maxContent) {
					nowcontenttop=maxContent;
				}
				var contentstyle={
					'position': 'absolute',
					'left':-nowcontenttop+'px',
				}
				var newstyle={
					'left':nowscrolltop+'px',
					'cursor':'default'
				}
				if (nowscrolltop>-120) {
					obj.x.tip.css(newstyle);
					obj.x.tip.data('left',-nowscrolltop);
					target.find(' > div:eq(0)').data('left',-nowcontenttop);
					target.find(' > div:eq(0)').css(contentstyle);
				}
			}
			if (typeof obj.y!='undefined') {
				//console.log(obj.y.bar);
				if (target.find(' > div:eq(0)').css('top')=='auto' && typeof obj!='undefined' && obj.y.bar.data('lock')===undefined) {
					if (obj.y.tip.data('top')){
						nowtop=parseInt(obj.y.tip.data('top'),10);	
					}else {
						nowtop=0;
					}
					if (target.find(' > div:eq(0)').data('top')) {
						nowctop=parseInt(target.find(' > div:eq(0)').data('top'),10);
					}else {
						nowctop=0;
					}
				}else {
					nowtop=parseInt(obj.y.tip.data('top'),10);
					nowctop=parseInt(target.find(' > div:eq(0)').data('top'),10);
				}
				
				var nowscrolltop= -(nowtop+event.wheelDelta*(1/obj.ratio));
				var maxRange = obj.y.h-obj.y.barsize;
				var maxContent = obj.target.find('>div:eq(0)').outerHeight()-obj.target.height();
				$('.indict em:eq(1)').html(event.wheelDelta*(1/obj.ratio)+'|'+(1/obj.ratio));
				if (typeof obj=='undefined') {
					obj.x.bar.stop().css({opacity:1});
				}
				obj.y.bar.stop().css({opacity:1});
				
				var nowcontenttop= -(nowctop+event.wheelDelta*obj.rate);
				$('.indict em:eq(2)').html(nowcontenttop+'|'+maxContent);
				if (nowcontenttop<0) {
					nowcontenttop=0;	
				}
				if (nowscrolltop<0) {
					nowscrolltop=0;	
				}
				if (nowscrolltop>maxRange) {
					nowscrolltop=maxRange;
					
				}
				if (nowcontenttop>maxContent) {
					nowcontenttop=maxContent;
				}
				var contentstyle={
					'position': 'absolute',
					//'left':(event.clientX - offsetX)+'px',
					'top':-nowcontenttop+'px',
				}
				var newstyle={
					//'left':(event.clientX - offsetX)+'px',
					'top':nowscrolltop+'px',
					'cursor':'default'
				}
				if (nowscrolltop>-120) {
					obj.y.tip.css(newstyle);
					obj.y.tip.data('top',-nowscrolltop);
					target.find(' > div:eq(0)').data('top',-nowcontenttop);
					target.find(' > div:eq(0)').css(contentstyle);
				}
			}
			
			return false;
		}
		
		this.hideScrollBar=function() {
			if (typeof this.y !='undefined') {
				this.y.bar.animate({opacity:0});	
			}
			if (typeof this.x !='undefined') {
				this.x.bar.animate({opacity:0});	
			}
		}
		
		init();
	}

	//初始化滚动条
	var Scroll = function(type,obj){
		var parent = obj.target;
		this.type=type;
		var thisbar = this;
		this.init=function() {
			var scrollbar = $('<div></div>');
			this.bar = scrollbar;
			scrollbar.addClass('barstick');
			pos = contentSize(type,obj.settings);
			var scrollbar_tip = $('<div></div>');
			var barstyle={
				'position': 'relative',
				'left':'0px','top':'0px',
				'width':obj.settings.scrollColumnWidth+'px',
				'height':obj.settings.scrollFixSize+'px',
				'background-color': '#3c3c3c',
				'border':'1px solid #ccc',
				'opacity':'0.8'
			}
			if (type=='x') {
				barstyle['height']=obj.settings.scrollColumnWidth+'px';
				barstyle['width']=obj.settings.scrollFixSize+'px';
			}
			this.h = parseInt(pos['height'].replace('px',''),10);
			this.w = parseInt(pos['width'].replace('px',''),10);
			this.barsize = parseInt(barstyle['height'].replace('px',''),10);
			if (type=='x') {
				this.barsize = parseInt(barstyle['width'].replace('px',''),10);
			}
			scrollbar_tip.css(barstyle)
			scrollbar.append(scrollbar_tip);
			
			scrollbar.css(pos)
			parent.append(scrollbar);
			
			this.tip = scrollbar_tip;
			
			scrollbar.hover(function() {
				scrollbar.css({'background-color': 'rgba(128,128,128,0.5)'})	
			},function() {
				scrollbar.css({'background-color': ''})	
			})
			//拖拽事件
			var offsetX,offsetY;
			scrollbar_tip.on('mousedown', function(event) {
				offsetX = (typeof event.clientX !='undefined' ? event.clientX : event.offsetX) - parseInt(scrollbar_tip.css('left') || 0);
				offsetY = (typeof event.clientY !='undefined' ? event.clientY : event.offsetY) - parseInt(scrollbar_tip.css('top') || 0);
				window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
				parent.data('hold','1');


				$(document).mousemove(onMouseMove);
				$(document).mouseup(onMouseUp);
			});

			function onMouseMove(event) {
				var topSize=((typeof event.clientY !='undefined' ? event.clientY : event.offsetY) - offsetY);
				var leftSize =0;
				var maxContent = obj.target.find('>div:eq(0)').outerHeight()-obj.target.height();
				var maxContentX = 0;
				var bar_ratio= maxContent/(thisbar.h-thisbar.barsize);
				var bar_ratio_x;
				var topContentSize=topSize*bar_ratio;
				var leftContentSize=0;
				if (topSize<0) {
					topSize=0;
				}
				if (topContentSize<0) {
					topContentSize=0;
				}
				
				if (parseInt(topSize,10)>(thisbar.h-thisbar.barsize)) {
					topSize=thisbar.h-thisbar.barsize;
				}
				if (parseInt(topContentSize,10)>maxContent) {
					topContentSize=maxContent;
				}
				var newstyle={
					'top':topSize+'px',
					'cursor':'default'
				}
				var contentstyle={
					'position': 'absolute',
					'top':-(topContentSize)+'px'
				}

				if (obj.settings.type=='x' || obj.settings.type=='xy') {
					leftSize =((typeof event.clientX !='undefined' ? event.clientX : event.offsetX) - offsetX);
					
					maxContentX = obj.target.find('>div:eq(0)').outerWidth()-obj.target.width();
					bar_ratio_x = maxContentX/(thisbar.w-thisbar.barsize);
					leftContentSize = leftSize*bar_ratio_x;

					if (leftContentSize<0) {
						leftContentSize=0;
					}
					if (leftSize<0) {
						leftSize=0;
					}
					if (parseInt(leftSize,10)>(thisbar.w-thisbar.barsize)) {
						leftSize=thisbar.w-thisbar.barsize;	
					}
					if (parseInt(leftContentSize,10)>maxContentX) {
						leftContentSize=maxContentX;
					}
					if (thisbar.type=='x') {
						delete newstyle['top']; 
						delete contentstyle['top'];
						newstyle['left']=leftSize+'px';
						contentstyle['left']=-leftContentSize+'px';
						thisbar.tip.data('left',-leftSize);
						parent.find(' > div:eq(0)').data('left',-leftContentSize);
					}
					if (thisbar.type=='y') {
						delete newstyle['left']; 
						delete contentstyle['left']; 	
					}
					
				}
				window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
				scrollbar_tip.data('top',-topSize);
				scrollbar_tip.css(newstyle);
				parent.find(' > div:eq(0)').data('top',-topContentSize)
				parent.find(' > div:eq(0)').css(contentstyle);

			}

			function onMouseUp(event) {
				// 删除侦听
				parent.removeData('hold')
				$(document).unbind('mousemove');
				$(document).unbind('mouseup');
				if (event.target!=scrollbar_tip.get(0)) {
					obj.hideScrollBar();	
				}
				
			}
			return this	
		};
		var contentSize = function(type,opt){
			//console.log(obj.target.outerWidth());
			var releft= parent.width()-opt.scrollColumnWidth;
			var retop= 0;

			var styledict;
			if (type=='y') {
				styledict={
					'position': 'absolute',
					//'left': releft,
					'right': '0px',
					'top':retop,
					'width':opt.scrollColumnWidth+'px',
					'height':(parent.height()-opt.scrollColumnWidth)+'px',
					'z-index':'999',
					'background-color': 'none',
					'opacity': '0.0'
				}	
			}else {
				retop= parent.height()-opt.scrollColumnWidth;
				styledict={
					'position': 'absolute',
					'left': '0px',
					'top':retop,
					'width':(parent.width()-opt.scrollColumnWidth)+'px',
					'height':opt.scrollColumnWidth+'px',
					'z-index':'999',
					'background-color': 'none',
					'opacity': '0.0'
				}
			}
			
			return styledict
		}
		this.leftBorder=function() {
			
		};
		this.rightBorder=function() {
			
		};
		this.dragger=function() {
			
		};
		this.updateBorderPosition=function() {
			
		};
		this.updateBorderSize=function() {
			
		};
		this.init();
	}

	//重新设定内容尺寸
	var Resizer = function(){
		this.init=function() {
			//console.log('rrrrrrr');	
		};
		this.onDrag=function() {
			
		};
		this.init();
	}
	/*$.floatMenu = {};*/

	//默认设置
	var defaults = {
		event: 'mouseover',//触发事件类型,mouseover,click
		type:'xy',//滚动是否都显示,x,y,xy
		maxwidth:0,
		float_layout : 'rel',
		mouseOutColor : '#ffffff',
		scrollColumnWidth:12, //滚动条宽度
		scrollFixSize:40, //滚动条固定长度
		isFixPart:true //是否给滚动条挡住内容
	}
	
})(jQuery);