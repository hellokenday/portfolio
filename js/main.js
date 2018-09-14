$( document ).ready(function() {
  
  fadeInPages();
  pauseCarousels();
  hideNavbarOnScroll();
  
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
