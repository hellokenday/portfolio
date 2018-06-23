$( document ).ready(function() {
  
//  initLazyLoad();
  pauseCarousels();
});

// Bootstrap carousel
function pauseCarousels() {
  
  $('.carousel').carousel('pause');
}

// Lazy load images
function initLazyLoad(w, d){
  
	var b = d.getElementsByTagName('body')[0];
	var s = d.createElement("script"); s.async = true;
	var v = !("IntersectionObserver" in w) ? "8.8.0" : "10.7.0";
	s.src = "https://cdnjs.cloudflare.com/ajax/libs/vanilla-lazyload/" + v + "/lazyload.min.js";
	w.lazyLoadOptions = {}; // Your options here. See "recipes" for more information about async.
	b.appendChild(s);
}(window, document) ;

var myLazyLoad = new LazyLoad({
  
    elements_selector: ".lazy-load"
});

(function() {
  new LazyLoad({
    elements_selector: ".lazy-load"
  });
}());