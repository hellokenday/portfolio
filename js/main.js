$( document ).ready(function() {
  
  checkComponents();
  fadeInPages();
  pauseCarousels();
  scrollToAnchor();
  
  window.LazyLoad = new LazyLoad({
    elements_selector: ".lazy-load",
  });
  window.LazyLoad.update();
});

function checkComponents() {
  
  if ($("nav").hasClass("navbar")) {
    
    // call navbar function
    console.log("project");
    
    hideNavbarOnScroll();
    showHideNavTitle();
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


function scrollToAnchor() {
  
  console.log("scrollToAnchor");

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
 

// Tabbed images

var slideIndex = 1;
  showSlides(slideIndex);

  function plusSlides(n) {
    showSlides(slideIndex += n);
  }

  function currentSlide(n) {
    showSlides(slideIndex = n);
  }

  function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("mySlides");
    var dots = document.getElementsByClassName("image-tab");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex-1].style.display = "block";  
    dots[slideIndex-1].className += " active";
  }
