(function($){

 	$.fn.extend({ 
 		
		bottomFixed: function(options) {

			var options =  $.extend(defaults, options);
			var layer = this;
		
			//主要
			var gaptop = ((($('html').outerHeight(true)-$('body').height())<options.offsetMax && ($('html').outerHeight(true)-$('body').height())>options.offsetMin) || ($('html').outerHeight(true)-$('body').height())==0)?$('html').outerHeight(true)-$('body').height():options.offset;
			if ($('html').data('gap')===undefined){$('html').data('gap',gaptop).css('height','100%');}
			if(document.addEventListener){$('body').css('height',$('html').outerHeight(true)-$('html').data('gap'));}
			var diff = $('html').height()-$(window).height();
			if (document.all && document.querySelector && !document.addEventListener) {$('body').css({'height':$('html').outerHeight(true)-$('html').data('gap')-diff,'min-height':$('html').outerHeight(true)-$('html').data('gap')-diff});$('#ie8_redraw').html($('html').outerHeight(true));}
			$('.ftfix').css('margin-top',-$('.ftfix').outerHeight())
		}
		
	});

	//默认设置
	var defaults = {
		offset:16,
		offsetMax:20,
		offsetMin:4,
	}
	
})(jQuery);

$(window).resize(function() {
	$.fn.bottomFixed();
});

$(window).load(function() {
	$.fn.bottomFixed();
});