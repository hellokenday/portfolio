$( document ).ready(function() {
  
  checkComponents();
  fadeInPages();
  pauseCarousels();
  initReadMoreLinks();
  
  window.LazyLoad = new LazyLoad({
    elements_selector: ".lazy-load",
  });
  window.LazyLoad.update();
});

function checkComponents() {
  
  if ($("nav").hasClass("navbar")) {
    
    // call navbar function
    
    hideNavbarOnScroll();
    showHideNavTitle();
    initOwlCarousels();
    insertIframeStyles();
  }
  
  if ($("body").hasClass("index")) {
    
    scrollToAnchor();
  }
}

function fadeInPages() {

 $('body').fadeIn(700).removeClass('hidden');
}

// Bootstrap carousel
function pauseCarousels() {
  
  // check if carousel exists
  if ( $('.carousel').length ) {

    // pause carousels
    $('.carousel').carousel({   
      interval: false 
    });
  }
}

// Hide nav on scroll down and show on scroll up
function hideNavbarOnScroll() {
  
  $(".navbar.sticky-top").autoHidingNavbar();
}

// Show or hide page title in navbar on scroll

function showHideNavTitle() {

  $(window).scroll(function() {    
    var scroll = $(window).scrollTop();

    if (scroll >= 400) {
        $(".nav-title").removeClass("invisible");
    } else {
        $(".nav-title").addClass("invisible");
    }
  });  
}

function initOwlCarousels() {

  $('.owl-carousel').owlCarousel({
    margin: 20,
    loop: false,
    items: 4,
    dots: true,
    responsive:{
      320: {
          items:2
      },
      600: {
          items:2
      },
      1000: {
          items:3
      },
      1600: {
          items:4
      }
    }
  })
}

function initReadMoreLinks() {

  $('.read-more').click(function(){
      var $this = $(this);
      $this.toggleClass('read-more');
      if($this.hasClass('read-more')){
          $this.text('Read more');         
      } else {
          $this.text('Read less');
      }
  });
}

function scrollToAnchor() {

  // Select all links with hashes
  $('a[href*="#"]')
  // Remove links that don't actually link to anything
  .not('[href="#"]')
  .not('[href="#0"]')
  .click(function(event) {
    // On-page links
    if (
      location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
      && 
      location.hostname == this.hostname
    ) {
      // Figure out element to scroll to
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      // Does a scroll target exist?
      if (target.length) {
        // Only prevent default if animation is actually gonna happen
        event.preventDefault();
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000, function() {
          // Callback after animation
          // Must change focus!
          var $target = $(target);
          $target.focus();
          if ($target.is(":focus")) { // Checking if the target was focused
            return false;
          } else {
            $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
            $target.focus(); // Set focus again
          };
        });
      }
    }
  });
}

function insertIframeStyles() {
  
  var head = $("iframe").contents().find("head");
  var css = '<style type="text/css">' +
            '.player.player{box-shadow: 0 .125rem .25rem rgba(0,0,0,.075);margin-bottom: 5px;} ' +
            '</style>';
  $(head).append(css);
  
  console.log("insertIframeStyles");
}

// Lazyload images
(function(w, d){
	var b = d.getElementsByTagName('body')[0];
	var s = d.createElement("script"); s.async = true;
	var v = !("IntersectionObserver" in w) ? "8.15.2" : "10.17.0";
	s.src = "https://cdnjs.cloudflare.com/ajax/libs/vanilla-lazyload/" + v + "/lazyload.min.js";
	w.lazyLoadOptions = {
    elements_selector: ".lazy-load",
  }; // Your options here. See "recipes" for more information about async.
	b.appendChild(s);
}(window, document));
 