$( document ).ready(function() {
  
  fadeInPages();
  pauseCarousels();
  hideNavbarOnScroll();
  showHideNavTitle();
  
  window.LazyLoad = new LazyLoad({
    elements_selector: ".lazy-load",
  });
  window.LazyLoad.update();
});

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
