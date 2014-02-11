;(function($){
 
$.fn.redraw = function() {
    return this.hide(0, function() {
        $(this).show();
    });
};

$.fn.splitter = function(args){
	args = args || {};
	var hsticker = $('<div class="sticker"></div>');
	
	return this.each(function(){ 
		
		var box = $(this).css({position: "relative"});
		var panes = $(">*", box[0]).css({
			//position: "relative",
			"z-index": "1",					// splitbar is positioned above
			"-moz-outline-style": "none"	// don't show dotted outline
		});
		var leftw= $(".left-column", box[0]).width();
		

		var hsticker = $('<div class="sticker" accesskey="h"><i>░</i></div>');

		function resetCol() {
			$(".left-column").css({'height':($(".mc").outerHeight(true)-61)+'px'});
			hsticker.css({'height':($(".mc").outerHeight(true)-61)+'px'});
			hsticker.find('i').css('top',(parseInt($(".mc").outerHeight(true),10)/2-77)+'px');
		}

		function startMove(evt) {
			$(document)
				.bind("mousemove", doMove)
				.bind("mouseup", endMove);
		}
		function doMove(evt) {
			$(".left-column", box[0]).css("-webkit-user-select", "none");
			$(".right-column", box[0]).css("-webkit-user-select", "none");
			window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
			resetPos(evt['pageX']);

		}

		function stickerclick() {
			
			hsticker.find('i').unbind('click').click(function(){
				//console.log(hsticker.data('evt'));
				if (hsticker.data('closed')) {
					hsticker.css({'left':hsticker.data('closed')+'px'})
					$(".left-column", box[0]).css({'width':hsticker.data('closed')+'px'});
					$(".right-column", box[0]).css({'margin-left':(hsticker.data('closed')+4)+'px'});
					hsticker.data('closed',0);
				}else {
					hsticker.data('closed',$(".left-column", box[0]).width());	
					hsticker.css({'left':'0px'})
					$(".left-column", box[0]).css({'width':'0px'});
					$(".right-column", box[0]).css({'margin-left':'4px'});	
				}	
				resetCol();
				return false;
			});	
		}
		stickerclick();
		
		function endMove(evt) {
			$(document)
				.unbind("mousemove", doMove)
				.unbind("mouseup", endMove);   
			$(".left-column", box[0]).css("-webkit-user-select", "text");
			$(".right-column", box[0]).css("-webkit-user-select", "text");
			return false; 
		}

		function resetPos(left) {
			if (left<0) {
				left=0;	
			}
			hsticker.data('closed',0);
			hsticker.css({'left':left+'px'});
			$(".left-column", box[0]).css({'width':(left)+'px'});
			$(".right-column", box[0]).css({'margin-left':(left+4)+'px'});
			//stickerclick()
			resetCol();
		}
		
		
		
		$(".left-column", box[0]).after(hsticker);
		$(".right-column", box[0]).css({'margin-left':(leftw+4)+'px'});
		hsticker.css({'cursor':'e-resize'}).bind("mousedown",startMove);
		var fixh =$(".mc").outerHeight(true)-61;
		$(".left-column", box[0]).css({'height':fixh+'px'});
		hsticker.css({'height':fixh+'px','width':'4px','position':'absolute',"z-index": "1",'left':leftw+'px'});
		hsticker.find('i').css('top',(parseInt(fixh,10)/2-77)+'px');
		$(window).bind("resize", function(){
			resetCol();
		}).trigger("resize");
	});

	

	
};

})(jQuery);

$(window).load(function(){
	$(".has-splitter").splitter();
});