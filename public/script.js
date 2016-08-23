"use strict";

(function(){

	// Fix background image jump on mobile
	var $background = $('.bg, .screen');
  if ((/Android|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent || navigator.vendor || window.opera)) {
    $background.css({'top': 'auto', 'bottom': 0});
    $background.height(screen.height);
    $(window).resize($background.height(screen.height));
  }
	// each to give the trains color for their circles. 
	$.each($('.trainname'),function(){
		switch($(this).children('a').children('.letter').text()) {
			case '1': case '2':	case '3':
					$(this).css('background-color','#EC000A')
					break;
			case '4':	case '5':	case '6':
					$(this).css('background-color','#008000')
					break;
			case '7':
					$(this).css('background-color','#800080')
					break;
			case 'A':	case 'C':	case 'E':
					$(this).css('background-color','#0032FF')
					break;
			case 'B':	case 'D':	case 'F':	case 'M':
					$(this).css('background-color','#FF5900')
					break;
			case 'G':
					$(this).css('background-color','#69DB3D')
					break;
			case 'J':	case 'Z':
					$(this).css('background-color','#7A5001')
					break;
			case 'L':	case 'S':
					$(this).css('background-color','#999999')
					break;
			case 'N':	case 'Q':	case 'R':
					$(this).css('background-color','#FFD900'),
					$(this).children('a').css('color','black')
					break;
		}
	})

	// each to replace the MTA status text with my own status text. 
	$.each($('.status'),function(){
		switch($(this).text()) {
			case 'PLANNED WORK':
				$(this).text('planned work.')
				break;
			case 'SERVICE CHANGE':
				$(this).text('service change.')
				break;
			case 'DELAYS':
				$(this).html('delayed <br> af.')
				break;
			case 'GOOD SERVICE':
				$(this).text('all good.')
				break;
			default:
				$(this).text('probably fucked.')
				break;
		}
	})
	
	//hides extra detail info on single train status reports
	$('.plannedworkTableStyle').hide()
	
	//removes extra br from the end of single train status reports
	while ($('.longstatus').children().last().is('br')){
		$('.longstatus').children().last().remove()
	}

	//if .longstatus is blank, hide it. 
	if($('.longstatus').text()){
	}else{
		$('.longstatus').hide()		
	}


})();