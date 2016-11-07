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
      case '1': case '2':  case '3':
          $(this).css('background-color','#EC000A')
          break;
      case '4':  case '5':  case '6':
          $(this).css('background-color','#008000')
          break;
      case '7':
          $(this).css('background-color','#800080')
          break;
      case 'A':  case 'C':  case 'E':
          $(this).css('background-color','#0032FF')
          break;
      case 'B':  case 'D':  case 'F':  case 'M':
          $(this).css('background-color','#FF5900')
          break;
      case 'G':
          $(this).css('background-color','#69DB3D')
          break;
      case 'J':  case 'Z':
          $(this).css('background-color','#7A5001')
          break;
      case 'L':  case 'S':
          $(this).css('background-color','#999999')
          break;
      case 'N':  case 'Q':  case 'R':  case 'W':
          $(this).css('background-color','#FFD900'),
          $(this).children('a').css('color','black')
          break;
    }
  })

  /* To manipulate the awful HTML that the MTA API responds with */
  var long_status = $('.long_status');
  var planned_work_container = $('.plannedworkTableStyle');

  long_status.find('b + br').remove();
  long_status.find('br + br').remove();
  long_status.find('br + br + br').remove();
  long_status.find('span + br').remove();
  long_status.children('br:last-child').hide();

  planned_work_container.hide();

  /* Prevent default behavior of links. This allows the app to stay internal
   * when added to the homescreen on iOS */

  $('a').on('click', function(e){
    var link = $(this).attr('href');
    if(link.indexOf(location.hostname) === -1){
      e.preventDefault();
      window.location = link;
    }
  });

})();
