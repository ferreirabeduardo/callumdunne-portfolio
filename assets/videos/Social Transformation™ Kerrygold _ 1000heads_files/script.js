function setCookie(key, value, expiry) {
  var cookieStr = key + '=' + value;
  if (expiry) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (expiry * 60 * 60 * 1000));
    cookieStr += ';expires=' + expires.toUTCString();
  }
  cookieStr += ';path=/';
  document.cookie = cookieStr; //key + '=' + value;';expires=' + expires.toUTCString() + ';path=/';
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Handle cookies
function enableAnalyticalCookies(enable) {
  if (enable == undefined) enable = false;
  if (typeof gtag !== 'undefined' && enable) {
    gtag('consent', 'update', {
      'analytics_storage': 'granted',
    });
  }
}

function enableFunctionalCookies(enable) {
  var location = getCookie(location_cookie_name);
  location_cookie_expire = 24*90;
  setCookie(location_cookie_name, location, location_cookie_expire);
}

function enableAdvertisingCookies(enable) {
  if (typeof gtag !== 'undefined' && enable) {
    gtag('consent', 'update', {
      'ad_storage': 'granted',
    });
  }
}

function ga_track_event(action, params) {
  if (typeof gtag !== 'undefined' && $.fn.ihavecookies.preference('analytical') == true) {
    gtag('event', action, params);
  }
}


(function($) {

  $.fn.headsLocations = function() {
    var $nav = $(this),
        $navLocation = $nav.find('.nav-location'),
        $navLocationName = $navLocation.find('>a'),
        currentLocation = $('header').data('location'),
        $navLocationDropdown = $navLocation.find('.nav-location-dropdown');

    setLocation(currentLocation);
    if ($nav.attr('id') == 'main-nav' && $nav.find('li.current-menu-item:visible').length == 0) {
      if ($('body').hasClass('single-work')) {
        $nav.find('.nav-work').addClass('current-menu-item');
      } else {
        $navLocation.addClass('current-menu-item');
      }
    }

    $navLocationName.off('click').on('click', function(e) {
      e.preventDefault();
      $navLocation.toggleClass('open');
      if ($nav.attr('id') == 'main-nav') {
        $('header').toggleClass('full');
      }
    });

    $nav.find('.menu-item').on({
      mouseenter: function() {
        $nav.find('.menu-item').addClass('unfocused');
        $(this).removeClass('unfocused').addClass('focused');
      },
      mouseleave: function() {
        $nav.find('.menu-item').removeClass('unfocused');
        $(this).removeClass('focused');
      }
    });

    $navLocation.find('.nav-location-dropdown a').off('click').on('click', function(e) {
      e.preventDefault();
      var selectedLocation = $(this).data('location');
      setLocation(selectedLocation);
      $navLocation.removeClass('open');
      setCookie(location_cookie_name, selectedLocation, location_cookie_expire);
      var url = $(this).data('href');
      loadPage(url);
    });

    $('footer .offices a').off('click').on('click', function(e) {
      e.preventDefault();
      var selectedLocation = $(this).data('location');
      setCookie(location_cookie_name, selectedLocation, location_cookie_expire);
      var url = $(this).attr('href');
      loadPage(url);
    });

    function setLocation(location) {
      var $location = $navLocationDropdown.find('a.nav-location-' + location),
          locationName = $location.text();
      $navLocationName.text(locationName);
      $navLocation.fadeIn();
      $navLocationDropdown.find('a').show();
      $location.hide();
    };
  };

  $.fn.heads_show_more = function() {
    $(this).each(function() {
      var $handle = $(this);
      $handle.on('click', function(e) {
        e.preventDefault();
        var $toShow = $('#' + $handle.data('show'));
        if ($handle.hasClass('open')) {
          $toShow.slideUp();
          $handle.removeClass('open');
        } else {
          $toShow.slideDown();
          $handle.addClass('open');
        }
      });
    });
  };

  $.fn.headsPaginate = function() {
    var $loader = $(this),
        $container = $($loader.data('container')),
        total_pages = $loader.data('total_pages') || 20,
        loading = false;

    var data = {
      posts_per_page: $loader.data('posts_per_page') || 8,
      post_type: $loader.data('post_type'),
      action: 'heads_infinite_paginate',
      page_no: 2,
      template: $loader.data('template'),
      query: $loader.data('query')
    };

    $loader.on('click', function(e) {
      e.preventDefault();

      if (!loading && data.page_no <= total_pages) {
        loading = true;

        $.ajax({
          url: heads_vars.ajaxurl,
          type: 'GET',
          data: data,
          success: function(html) {
            var $content = $(html).hide();
            $container.append($content.fadeIn());
            loading = false;
            if (data.page_no == total_pages) {
              //$loader.hide();
              $loader.addClass('iconless').html('Back to top');
            }
            data['page_no']++;
          }
        });
      } else if (data.page_no > total_pages) {
        $('html, body').animate({
          scrollTop: $container.offset().top
        });
      }
    });
    return this;
  };

  $.ParallaxScroll = {
    /* PUBLIC VARIABLES */
    showLogs: false,
    round: 1000,

    /* PUBLIC FUNCTIONS */
    init: function init() {
      this._log("init");
      if (this._inited) {
        this._log("Already Inited");
        this._inited = true;
        return;
      }
      this._requestAnimationFrame = function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function ( /* function */callback, /* DOMElement */element) {
          window.setTimeout(callback, 1000 / 60);
        };
      }();
      this._onScroll(true);
    },

    /* PRIVATE VARIABLES */
    _inited: false,
    _properties: ['x', 'y', 'z', 'rotateX', 'rotateY', 'rotateZ', 'scaleX', 'scaleY', 'scaleZ', 'scale'],
    _requestAnimationFrame: null,

    /* PRIVATE FUNCTIONS */
    _log: function _log(message) {
      if (this.showLogs) console.log("Parallax Scroll / " + message);
    },
    _onScroll: function _onScroll(noSmooth) {
      var scroll = $(document).scrollTop();
      var windowHeight = $(window).height();
      this._log("onScroll " + scroll);
      $("[data-parallax]").each($.proxy(function (index, el) {
        var $el = $(el);
        var properties = [];
        var applyProperties = false;
        var style = $el.data("style");
        if (style == undefined) {
          style = $el.attr("style") || "";
          $el.data("style", style);
        }
        var datas = [$el.data("parallax")];
        var iData;
        for (iData = 2;; iData++) {
          if ($el.data("parallax" + iData)) {
            datas.push($el.data("parallax-" + iData));
          } else {
            break;
          }
        }
        var datasLength = datas.length;
        for (iData = 0; iData < datasLength; iData++) {
          var data = datas[iData];
          var scrollFrom = data["from-scroll"];
          if (scrollFrom == undefined) scrollFrom = Math.max(0, $(el).offset().top - windowHeight);
          scrollFrom = scrollFrom | 0;
          var scrollDistance = data["distance"];
          var scrollTo = data["to-scroll"];
          if (scrollDistance == undefined && scrollTo == undefined) scrollDistance = windowHeight;
          scrollDistance = Math.max(scrollDistance | 0, 1);
          var easing = data["easing"];
          var easingReturn = data["easing-return"];
          if (easing == undefined || !$.easing || !$.easing[easing]) easing = null;
          if (easingReturn == undefined || !$.easing || !$.easing[easingReturn]) easingReturn = easing;
          if (easing) {
            var totalTime = data["duration"];
            if (totalTime == undefined) totalTime = scrollDistance;
            totalTime = Math.max(totalTime | 0, 1);
            var totalTimeReturn = data["duration-return"];
            if (totalTimeReturn == undefined) totalTimeReturn = totalTime;
            scrollDistance = 1;
            var currentTime = $el.data("current-time");
            if (currentTime == undefined) currentTime = 0;
          }
          if (scrollTo == undefined) scrollTo = scrollFrom + scrollDistance;
          scrollTo = scrollTo | 0;
          var smoothness = data["smoothness"];
          if (smoothness == undefined) smoothness = 30;
          smoothness = smoothness | 0;
          if (noSmooth || smoothness == 0) smoothness = 1;
          smoothness = smoothness | 0;
          var scrollCurrent = scroll;
          scrollCurrent = Math.max(scrollCurrent, scrollFrom);
          scrollCurrent = Math.min(scrollCurrent, scrollTo);
          if (easing) {
            if ($el.data("sens") == undefined) $el.data("sens", "back");
            if (scrollCurrent > scrollFrom) {
              if ($el.data("sens") == "back") {
                currentTime = 1;
                $el.data("sens", "go");
              } else {
                currentTime++;
              }
            }
            if (scrollCurrent < scrollTo) {
              if ($el.data("sens") == "go") {
                currentTime = 1;
                $el.data("sens", "back");
              } else {
                currentTime++;
              }
            }
            if (noSmooth) currentTime = totalTime;
            $el.data("current-time", currentTime);
          }
          this._properties.map($.proxy(function (prop) {
            var defaultProp = 0;
            var to = data[prop];
            if (to == undefined) return;
            if (prop == "scale" || prop == "scaleX" || prop == "scaleY" || prop == "scaleZ") {
              defaultProp = 1;
            } else {
              to = to | 0;
            }
            var prev = $el.data("_" + prop);
            if (prev == undefined) prev = defaultProp;
            var next = (to - defaultProp) * ((scrollCurrent - scrollFrom) / (scrollTo - scrollFrom)) + defaultProp;
            var val = prev + (next - prev) / smoothness;
            if (easing && currentTime > 0 && currentTime <= totalTime) {
              var from = defaultProp;
              if ($el.data("sens") == "back") {
                from = to;
                to = -to;
                easing = easingReturn;
                totalTime = totalTimeReturn;
              }
              val = $.easing[easing](null, currentTime, from, to, totalTime);
            }
            val = Math.ceil(val * this.round) / this.round;
            if (val == prev && next == to) val = to;
            if (!properties[prop]) properties[prop] = 0;
            properties[prop] += val;
            if (prev != properties[prop]) {
              $el.data("_" + prop, properties[prop]);
              applyProperties = true;
            }
          }, this));
        }
        if (applyProperties) {
          if (properties["z"] != undefined) {
            var perspective = data["perspective"];
            if (perspective == undefined) perspective = 800;
            var $parent = $el.parent();
            if (!$parent.data("style")) $parent.data("style", $parent.attr("style") || "");
            $parent.attr("style", "perspective:" + perspective + "px; -webkit-perspective:" + perspective + "px; " + $parent.data("style"));
          }
          if (properties["scaleX"] == undefined) properties["scaleX"] = 1;
          if (properties["scaleY"] == undefined) properties["scaleY"] = 1;
          if (properties["scaleZ"] == undefined) properties["scaleZ"] = 1;
          if (properties["scale"] != undefined) {
            properties["scaleX"] *= properties["scale"];
            properties["scaleY"] *= properties["scale"];
            properties["scaleZ"] *= properties["scale"];
          }
          var translate3d = "translate3d(" + (properties["x"] ? properties["x"] : 0) + "px, " + (properties["y"] ? properties["y"] : 0) + "px, " + (properties["z"] ? properties["z"] : 0) + "px)";
          var rotate3d = "rotateX(" + (properties["rotateX"] ? properties["rotateX"] : 0) + "deg) rotateY(" + (properties["rotateY"] ? properties["rotateY"] : 0) + "deg) rotateZ(" + (properties["rotateZ"] ? properties["rotateZ"] : 0) + "deg)";
          var scale3d = "scaleX(" + properties["scaleX"] + ") scaleY(" + properties["scaleY"] + ") scaleZ(" + properties["scaleZ"] + ")";
          var cssTransform = translate3d + " " + rotate3d + " " + scale3d + ";";
          this._log(cssTransform);
          $el.attr("style", "transform:" + cssTransform + " -webkit-transform:" + cssTransform + " " + style);
        }
      }, this));
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame($.proxy(this._onScroll, this, false));
      } else {
        this._requestAnimationFrame($.proxy(this._onScroll, this, false));
      }
    }
  };

  $.fn.randomizeEls = function(childElem) {
    var $childElem = $(this).find(childElem);
    function _shuffle(o) {
      for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
    };
    return this.each(function() {
      var $this = $(this);
      var $elems = $this.children(childElem);
      _shuffle($elems);
      $this.remove($childElem);
      for (var i=0; i < $elems.length; i++) {
        $this.prepend($elems[i]);
      }
    });
  };

  $.fn.initSlider = function() {
    var $slider = $(this).find('.slider'),
        $sliderNavDots = $(this).find('.slider-nav-dots'),
        $sliderNavPrev = $(this).find('.slider-nav-prev'),
        $sliderNavNext = $(this).find('.slider-nav-next'),
        dots = $slider.data('dots') || false,
        arrows = $slider.data('arrows') || false,
        infinite = $slider.data('infinite') || false,
        fade = $slider.data('fade') || false,
        vertical = $slider.data('vertical') || false,
        autoplay = $slider.data('autoplay') || false,
        autoplaySpeed = $slider.data('autoplayspeed') || 3000,
        options = {dots: dots, arrows: arrows, fade: fade, infinite: infinite, vertical: vertical, autoplay: autoplay, autoplaySpeed: autoplaySpeed};

    if ($sliderNavDots.length) options.appendDots = $sliderNavDots;
    if ($sliderNavPrev.length) options.prevArrow = $sliderNavPrev;
    if ($sliderNavNext.length) options.nextArrow = $sliderNavNext;

    $slider.slick(options);
  }

  $.fn.initMobileSlider = function() {
    var $slider = $(this).find('.slider'),
        $sliderNavPrev = $(this).find('.slider-nav-prev'),
        $sliderNavNext = $(this).find('.slider-nav-next'),
        dots = $slider.data('dots') || false,
        arrows = $slider.data('arrows') || false,
        infinite = $slider.data('infinite') || false,
        fade = $slider.data('fade') || false,
        vertical = $slider.data('vertical') || false,
        options = {dots: dots, arrows: arrows, fade: fade, infinite: infinite, vertical: vertical},

        currentSlide = 0,
        activeSlide = 2,
        slick = null;

    function goToSlide(index, callback) {
      $sliderNavPrev.removeClass('slick-disabled');
      $sliderNavNext.removeClass('slick-disabled');

      if (currentSlide > index) { // prev
        if (slick.slideCount + index <= activeSlide+1) $sliderNavPrev.addClass('slick-disabled');
        if (slick.slideCount + index <= activeSlide) return;
      }
      if (currentSlide < index) { // next
        if (index > activeSlide-1) $sliderNavNext.addClass('slick-disabled');
        if (index > activeSlide) return;
      }

      currentSlide = index;
      slick.$slideTrack.css({
        'transform': 'translate3d('+currentSlide*slick.slideWidth+'px, 0, 0)'
      });
      $slider.find('.slick-slide').removeClass('slick-scaled');

      setTimeout(function() {
        $slider.find('.slick-slide').eq(activeSlide - currentSlide).addClass('slick-scaled');
      }, 400);
    }

    $slider.on('init', function(event, _slick) {
      slick = _slick;
      if (activeSlide >= slick.slideCount) activeSlide = slick.slideCount-1;
      $slider.find('.slick-slide').eq(activeSlide).addClass('slick-scaled');
    });
    $sliderNavPrev.on('click', function() {
      goToSlide(currentSlide-1);
    });
    $sliderNavNext.on('click', function() {
      goToSlide(currentSlide+1);
    });

    $slider.slick(options);
  }

  function stickyHeader() {
    var $header = $('header'),
        sticky = $header.offset().top;
    $(window).on('scroll', function() {
      if (window.pageYOffset > sticky) {
        $header.addClass("sticky")
      } else {
        $header.removeClass("sticky");
      }
    });
  }

  function stickyShare() {
    var $share = $('.news-share');
    if ($share.length == 0) return;

    var $showMore = $('.show-more-container'),
        from = $share.offset().top - 40,
        to = $showMore.offset().top - $share.outerHeight();

    $(window).on('scroll', function() {
      if (window.pageYOffset > from && window.pageYOffset < to) {
        $share.addClass("sticky");
      } else {
        $share.removeClass("sticky");
      }
    });
  }

  function stickyScroll() {
    var $scroll = $('.page-scroll');
    if (!$scroll.length) return;

    var bodyClasses = $('body').attr('class'),
        padding = 20,
        position = 'bottom',
        $el = $('body'),
        top = 0,
        hide = true;

    if (bodyClasses.indexOf('page-template-home') > -1) {
      $el = $('.banner-video');
    } else if (bodyClasses.indexOf('page-template-about') > -1) {
      $el = $('#about-socialfirst');
      position = 'middle';
    } else if (bodyClasses.indexOf('page-template-social-transformation') > -1) {
      $el = $('#social-transformation-expertise');
      position = 'middle';
    } else if (bodyClasses.indexOf('page-template-careers') > -1 || bodyClasses.indexOf('work-template') > -1 || bodyClasses.indexOf('page-template-whitepaper') > -1) {
      $el = $('.content-top');
    } else if (bodyClasses.indexOf('page-template-news') > -1) {
      $el = $('.news-grid a').eq(1);
      hide = false;
    } else if (bodyClasses.indexOf('page-template-services') > -1) {
      $el = $('.service-layout').eq(0);
      position = 'middle';
    } else {
      hide = false;
    }

    if ($el.is('video')) {
      $el.on('loadedmetadata', function() {
        setPosition();
      });
    } else {
      setPosition();
    }

    function setPosition() {
      if (position == 'top') {
        top = $el.offset().top + padding;
      } else if (position == 'middle') {
        top = $el.offset().top + $el.outerHeight()/2 - $scroll.height()/2;
      } else {
        top = $el.offset().top + $el.outerHeight() - $scroll.height() - padding;
      }
      $scroll.css({
        'opacity': 1,
        'bottom': 'initial',
        'top': top
        //'display': 'none'
      });
    }

    $(window).on('scroll', function() {
      var _top = top + $scroll.height() + padding,
          _sticky_top = top; //$(window).height() - $scroll.height() - padding;
      if (_top - $(window).height() < window.pageYOffset) {
        if (_top > $(window).height()) {
          _sticky_top = $(window).height() - $scroll.height() - padding;
        }
        $scroll.css('top', _sticky_top);
        $scroll.addClass('sticky');
        if (hide && $el.offset().top + $el.outerHeight() - _sticky_top < window.pageYOffset) {
          $scroll.fadeOut();
        } else {
          $scroll.fadeIn();
        }
      } else {
        $scroll.css('top', top);
        $scroll.removeClass('sticky');
      }
    });
  }

  function handleTestimonies() {
    var $quotes = $('#about-testimony .quote'),
        $quotesRoulette = $('#testimonies-roulette'),
        quoteCount = 0,
        quoteNumber = ($(window).width() <= 767) ? 1 : 2;

    if ($quotes.length > quoteNumber) {
      $quotesRoulette.fadeIn();
    }

    $quotesRoulette.click(function() {
      $toShow = $quotes.filter(function() {
        var start = quoteCount % $quotes.length;
        var end = (quoteCount + quoteNumber) % $quotes.length;
        if (start < end) {
          return $(this).index() >= start && $(this).index() < end;
        } else {
          return $(this).index() >= start || $(this).index() < end;
        }
      });

      $quotes.hide().removeClass('quote-right');
      $toShow.fadeIn();
      $toShow.eq(0).addClass('quote-right');
      quoteCount += quoteNumber;
    });
    $quotesRoulette.click();
  }

  // Video as stream for faster loading
  window.streamVideo = function(videoId, callback) {
    var video = document.getElementById(videoId);
    if (!video) return;

    var videoSrc = video.getAttribute('data-playlist');
    if (Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function() {
        callback(video);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc;
      video.addEventListener('loadedmetadata', function() {
        callback(video);
      });
    }

    $(video).siblings('.volume-control').on('click', function() {
      if ($(this).hasClass('muted')) {
        $(this).removeClass('muted');
        $(video).prop('muted', 0);
      } else {
        $(this).addClass('muted');
        $(video).prop('muted', 1);
      }
    });
  }

  function loadPage(url) {
    $.get(url, function(response) {
      var html = document.createElement('html');
      html.innerHTML = response;
      var $response = $(html);

      // update body classes
      $('body').attr('class', $response.find('body').attr('class'));

      // reload content
      $('.main-container').html($response.find('.main-container').html());

      // reload footer
      $('footer').html($response.find('footer').html());

      // update location data in header
      $('header')
        .attr('class', $response.find('header').attr('class'))
        .data('location', $response.find('header').data('location'));

      // update header nav
      $('#brand').attr('href', $response.find('#brand').attr('href'));
      $('#main-nav').html($response.find('#main-nav').html());

      // update modal nav
      $('#modal-nav').html($response.find('#modal-nav').html());

      if (window.history.replaceState) {
        //prevents browser from storing history with each change:
        var title = $response.find('title').html();
        document.title = title;
        window.history.replaceState($response.html(), title, url);
      }
      UTIL.init();
      UTIL.fire('common', 'header');
    });
  }

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1),
        vars = query.split("&");
    for (var i=0; i<vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] == variable) { return pair[1]; }
    }
    return (false);
  }

/* ========================================================================
 * DOM-based Routing
 * Based on http://goo.gl/EUTi53 by Paul Irish
 *
 * Only fires on body classes that match. If a body class contains a dash,
 * replace the dash with an underscore when adding it to the object below.
 *
 * .noConflict()
 * The routing is enclosed within an anonymous function so that you can
 * always reference jQuery with $, even when in .noConflict() mode.
 *
 * Google CDN, Latest jQuery
 * To use the default WordPress version of jQuery, go to lib/config.php and
 * remove or comment out: add_theme_support('jquery-cdn');
 * ======================================================================== */

// Use this variable to set up the common and page specific functions. If you
// rename this variable, you will also need to rename the namespace below.

var Heads = {
  // All pages
  common: {
    init: function() {
      stickyScroll();

      $('.slider-container').each(function() {
        $(this).initSlider();
      });

      $('.mobile-slider-container').each(function() {
        $(this).initMobileSlider();
      });

      if ($('.show-more').length) {
        $('.show-more').heads_show_more();
      }

      if ($('.scroll-to').length) {
        $('.scroll-to').on('click', function(e) {
          $('html, body').animate({
            scrollTop: $($(this).data('scrollto')).offset().top
          }, 800);
        });
      }


      $.ParallaxScroll.init();
    },
    header: function() {
      var $burger = $('#burger-icon'),
          $modalNav = $('#modal-nav'),
          $contactform = $modalNav.find('form.contact-form'),
          $menuItems = $modalNav.find('#modal-nav-menu'),
          menuHeight = $menuItems.height(),
          minMenuHeight = 0,
          initContact = function() {
            if ($modalNav.hasClass('open') && $modalNav.hasClass('form-open')) {
              minMenuHeight = $menuItems.find('.nav-location').outerHeight(true);
              $modalNav.addClass('form-open');
              $menuItems.css({height: minMenuHeight+'px'});
              $contactform.show();
            }
          },
          toggleContact = function() {
            $('.nav-contact-success, .nav-contact-error').hide();
            if ($modalNav.hasClass('form-open')) {
              $menuItems.animate({height: menuHeight+'px'}, 500);
              $contactform.slideUp(500, function() {$modalNav.removeClass('form-open')});
            } else {
              menuHeight = $menuItems.height();
              minMenuHeight = $menuItems.find('.nav-location').outerHeight(true);
              $modalNav.addClass('form-open');
              $menuItems.animate({height: minMenuHeight+'px'}, 500);
              $contactform.slideDown(500);
              ga_track_event('click', {'event_category' : 'open', 'event_label' : 'Contact form'});
            }
          },
          toggleMenu = function() {
            if ($burger.hasClass('open')) {
              $burger.removeClass('open');
              $modalNav.removeClass('open').toggle('slide', {direction: 'right'}, 700, function() {
                if ($modalNav.hasClass('form-open')) {
                  toggleContact();
                }
              });
            } else {
              $burger.addClass('open');
              $modalNav.toggle('slide', {direction: 'right'}, 600);
              setTimeout(function() {
                $modalNav.addClass('open');
              }, 100);
            }
          };

      $burger.off('click').on('click', function(e) {
        e.preventDefault();
        toggleMenu();
      });

      $modalNav.find('.nav-contact').off('click').on('click', function(e) {
        e.preventDefault();
        toggleContact();
      });

      $('.open-nav-contact').off('click').on('click', function(e) {
        e.preventDefault();
        toggleMenu();
        toggleContact();
      });

      $('#main-nav').headsLocations();
      $('#modal-nav').headsLocations();
      stickyHeader();
      initContact();

      // if contact page
      if (getQueryVariable('contact')) {
        toggleMenu();
        toggleContact();
      }

      $('.contact-form, .contact-pro-form, .download-form, .newsletter-form').each(function() {
        var $form = $(this),
            $formError = $form.siblings('.form-error');
        $form.find('a.submit').on('click', function() {
          var errors = $form.headsFormValidate();
          if ($.isEmptyObject(errors)) {
            $formError.hide();
            $form.submit();
          } else {
            $formError.html(Object.values(errors).join('<br>')).show();
          }
        });
      });

      if ($('.contact-form').length) {
        $('.contact-form').on('submit', function(e) {
          e.preventDefault();

          $('.nav-contact-success, .nav-contact-error').hide();
          var data = $(this).serializeArray();
          data.push({name: "action", value: "heads_contact_save"});
          $.ajax({
            url: heads_vars.ajaxurl,
            type: 'POST',
            data: data,
            complete: function(response) {
              if (response.responseJSON.success) {
                var currentLocation = $('header').data('location');
                if (currentLocation == 'london' || currentLocation == 'berlin') {
                  ga_track_event('conversion', {'send_to': heads_vars.google_conversion_id + '/ySRKCM2r5_8BEO7Mj5oC'});
                }
                if ($('body').hasClass('page-template-home')) {
                  ga_track_event('conversion', {'send_to': heads_vars.google_conversion_id_ny + '/C1MDCOfz6fACEPGEpuUB'});
                }
                $contactform.slideUp(500, function() {$('.nav-contact-success').show()});
              } else {
                var errors = Object.values(response.responseJSON.data).join('<br>');
                $('.nav-contact-error').html(errors).show();
              }
            }
          });
        });
      }

      if ($('.contact-pro-form').length) {
        $('.contact-pro-form').on('submit', function(e) {
          e.preventDefault();
          $('.contact-pro-success, .contact-pro-error').hide();
          var $proForm = $(this),
              data = $(this).serializeArray();
          data.push({name: "action", value: "heads_contact_pro_save"});
          $.ajax({
            url: heads_vars.ajaxurl,
            type: 'POST',
            data: data,
            complete: function(response) {
              if (response.responseJSON.success) {
                ga_track_event('conversion', {'send_to': heads_vars.google_conversion_id_ny + '/C1MDCOfz6fACEPGEpuUB'});
                $proForm.slideUp(500, function() {$('.contact-pro-success').show()});
              } else {
                $('.contact-pro-error').show();
              }
            }
          });
        });
      }

      // show newsletter popup
      var documentHeight = $(document).height(),
          $newsletterFormPopup = $('.newsletter-form-popup');
      if (!getCookie('newsletter-popup-closed')) {
        $(window).on('scroll', function() {
          if (window.pageYOffset > documentHeight/3 && !getCookie('newsletter-popup-closed')) {
            $newsletterFormPopup.fadeIn();
          }
        });
      }

      $('.newsletter-form-popup .popup-close').click(function() {
        $('.newsletter-form-popup').fadeOut();
        setCookie('newsletter-popup-closed', 1);
      });

      $('#show-newsletter-form').click(function() {
        $(this).hide();
        $('footer .newsletter-form').fadeIn();
      });

      $('.newsletter-form').on('submit', function(e) {
        e.preventDefault();

        var $newsletterForm = $(this),
            $newsletterFormSuccess = $newsletterForm.siblings('.newsletter-form-success'),
            data = $(this).serializeArray();

        $newsletterFormSuccess.hide();
        data.push({name: "action", value: "heads_newsletter_send"});
        $.ajax({
          url: heads_vars.ajaxurl,
          type: 'POST',
          data: data,
          complete: function(response) {
            if (response.responseJSON.success) {
              $newsletterForm.hide();
              $newsletterFormSuccess.show();
              var $newsletterFormPopup = $('.newsletter-form-popup');
              if ($newsletterFormPopup.length) {
                setTimeout(function() {
                  $newsletterFormPopup.find('.popup-close').click();
                }, 1500);
              }
            }
          }
        });
      });

      $('.video-container .video-thumb').on('click', function() {
        $(this).siblings('video').click();
      });

      $('.video-container video.autoplay').each(function() {
        var video = this;
        if (isVideoVisible(video)) {
          video.play()
        }
        $(window).on('scroll', function() {
          if (isVideoVisible(video) && !$(video).hasClass('paused')) {
            video.play()
          }
        });
      });

      $('video').on('click', function() {
        playVideo(this);
      });

      function isVideoVisible(video) {
        return (window.pageYOffset + $(window).height() > $(video).offset().top + $(video).height() * 0.75);
      }

      function playVideo(video) {
        video.paused ? video.play() : video.pause()
      }

      $('video').on('play', function() {
        $(this).removeClass('paused');
        $(this).siblings('.video-thumb').css({'opacity': 0});
      })

      $('video').on('pause', function() {
        $(this).addClass('paused');
        $(this).siblings('.video-thumb').css({'opacity': 1});
      });
    }
  },
  // Home page
  page_template_home: {
    init: function() {
      streamVideo('home-video', function(video) {
        if (isVideoVisible()) {
          playVideo();
        }
        $(window).on('scroll', function() {
          if (isVideoVisible() && !$(video).hasClass('paused')) {
            playVideo();
          }
        });
        video.ontimeupdate = function() {
          if (this.duration && this.currentTime >= this.duration*0.98) {
            this.currentTime = 0.1;
          }
        }
        function isVideoVisible() {
          return (window.pageYOffset + $(window).height() > $(video).offset().top + $(video).height() * 0.75);
        }
        function playVideo() {
          if (video.paused) {
            video.play();
          }
        }
      });
      var clientRandomCount = 0;
      var $clients = $('.clients-grid');
      // Clients roulette
      $('#clients-roulette').click(function(e) {
        clientRandomCount++;
        $clients.find('.clients-grid-item').hide();
        $clients.randomizeEls('div.showon-all,div.showon-'+clientRandomCount);
        $clients.find('.clients-grid-item:lt(16)').show();
      });
      $('#clients-roulette').click();
    },
  },
  // About us page, note the change from about-us to about_us.
  page_template_about: {
    init: function() {
      handleTestimonies();

      /* Headshots slider: infinite regroup headshots to have all slides filled */
      var $headshotsSlider = $('#headshots-slider'),
          $slider = $headshotsSlider.find('.slider'),
          $dots = $headshotsSlider.find('.slider-nav-dots'),
          $prevArrow = $headshotsSlider.find('.slider-nav-prev'),
          $nextArrow = $headshotsSlider.find('.slider-nav-next'),
          headsPerSlide = 5
          options = {
            dots: true, arrows: true,
            fade: true, infinite: false,
            appendDots: $dots, prevArrow: $prevArrow, nextArrow: $nextArrow,
          };

      $slider.on('beforeChange', function(event, slick, currentSlide, nextSlide) {
        var $currentSlide = $(slick.$slides[nextSlide]),
            $currentSlideHeads = $currentSlide.find('.headshots-grid-item');

        if ($currentSlideHeads.length < headsPerSlide) {
          var $nextSlide = $(slick.$slides[(nextSlide+1) % slick.slideCount]),
              $nextSlideHeads = $nextSlide.find('.headshots-grid-item'),
              shiftByNumber = headsPerSlide - $currentSlide.find('.headshots-grid-item').length;
          $currentSlideHeads.last().after($nextSlideHeads.slice(0, shiftByNumber));
        }
      });

      $slider.on('afterChange', function(event, slick, currentSlide) {
        if (currentSlide == slick.slideCount-1) {
          var $currentSlide = $(slick.$slides[currentSlide]);
          $nextArrow.removeClass('slick-disabled');

          if (currentSlide == slick.slideCount-1) {
            $nextArrow.on('click.h', function() {
              $slider.slick('slickGoTo', 0, false);
              $(this).off('click.h');
            });
          }
        }
      });

      $slider.slick(options);
    }
  },
  page_template_news: {
    init: function() {
      if ($('#load-more-news').length) {
        $('#load-more-news').headsPaginate();
      }
    }
  },
  search_results: {
    init: function() {
      if ($('#load-more-search').length) {
        $('#load-more-search').headsPaginate();
      }
    }
  },
  page_template_social_transformation: {
    init: function() {
      var count = 0;
      var audio_files = [
        'https://s3-eu-west-1.amazonaws.com/1000heads.com/5-audioMessage.mp3',
        'https://s3-eu-west-1.amazonaws.com/1000heads.com/AudioCut1V2.mp3',
      ];
      $('.social-transformation-sound').on('click', function() {
        var audio_file = audio_files[count % audio_files.length];
        var audio = $(this).find('audio')[0];
        var source = $(this).find('audio source')[0];
        source.src = audio_file;
        audio.load();
        audio.play();
        count++;
      });
    }
  },
  single_post: {
    init: function() {
      stickyShare();
    }
  },
  single_work: {
    init: function() {
      $('.video-cover > a').on('click', function(e) {
        e.preventDefault();
        var videoUrl = $(this).data('video-url');
        $(this).html('<iframe src="'+videoUrl+'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
      });
      $('.social-transformation-slider').each(function() {
        $(this).slick({
          slidesToShow: 1,
          infinite: false,
          prevArrow: '<div class="slick-prev slider-nav-prev slick-arrow"></div>',
          nextArrow: '<div class="slick-next slider-nav-next slick-arrow"></div>',
        });

        $('.with-motion').on({
          mouseenter: function() {
            $(this).siblings().removeClass('active');
            $(this).addClass('active');
          }
        });
      });
    }
  },
  page_template_work: {
    init: function() {
      var currentLocation = $('header').data('location');
      if (currentLocation == 'london' || currentLocation == 'berlin') {
        ga_track_event('conversion', {'send_to': heads_vars.google_conversion_id + '/eMIvCIvBsYwCEO7Mj5oC'})
      }
    }
  },
  page_template_whitepaper: {
    init: function() {

      if ($('.download-form').length) {
        var $downloadFormWrapper = $('#download-form-wrapper'),
            $downloadForm = $('.download-form'),
            $downloadFormSuccess = $('.download-form-success'),
            $downloadFormError = $('.download-form-error'),
            $whitepaperSuccessLink = $('#whitepaper-success-link');

        $downloadForm.on('submit', function(e) {
          e.preventDefault();
          $downloadFormSuccess.hide(); $downloadFormError.hide();
          var data = $(this).serializeArray();
          $.ajax({
            url: heads_vars.ajaxurl,
            type: 'POST',
            data: data,
            complete: function(response) {
              if (response.responseJSON.success) {
                $downloadFormWrapper.slideUp(500, function() {
                  $downloadFormSuccess.show();
                  if (response.responseJSON.data.link != undefined) {
                    $whitepaperSuccessLink.attr('href', response.responseJSON.data.link);
                    setTimeout(function() { window.location = response.responseJSON.data.link}, 1000);
                  }
                });
              } else {
                $downloadFormError.html(Object.values(response.responseJSON.data).join('<br>')).show();
              }
            }
          });
        });
      }
    }
  },
  page_template_technology: {
    init: function() {
      var clientRandomCount = 0;
      var $clients = $('.clients-grid');
      // Clients roulette
      $('#clients-roulette').click(function(e) {
        clientRandomCount++;
        $clients.find('.clients-grid-item').hide();
        $clients.randomizeEls('div.showon-all,div.showon-'+clientRandomCount);
        $clients.find('.clients-grid-item:lt(16)').show();
      });
      $('#clients-roulette').click();
    }
  }

};

// The routing fires all common scripts, followed by the page specific scripts.
// Add additional events for more control over timing e.g. a finalize event
var UTIL = {
  fire: function(func, funcname, args) {
    var namespace = Heads;
    funcname = (funcname === undefined) ? 'init' : funcname;
    if (func !== '' && namespace[func] && typeof namespace[func][funcname] === 'function') {
      namespace[func][funcname](args);
    }
  },
  init: function() {
    UTIL.fire('common');
    $.each(document.body.className.replace(/-/g, '_').split(/\s+/),function(i,classnm) {
      UTIL.fire(classnm);
    });
  }
};

$(document).ready(function() {
  UTIL.init();
  UTIL.fire('common', 'header');
});

$.fn.headsFormValidate = function() {
  var $form = $(this);
  var errors = {};

  $form.find('input, textarea').each(function() {
    let $field = $(this);
    if ($field.prop('required')) {
      if (!$field.val()) {
        let fieldName = $field.attr('name');
        errors[fieldName] = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' is required';
      }
    }
  });

  if (!isValidWorkEmail($form.find('input[name=email]').val())) {
    errors.email = 'Please use your business email'
  }
  return errors;

  function isValidWorkEmail(value) {
    var freemails = ['123mail.org', '150mail.com', '150ml.com', '16mail.com', '2-mail.com', '2trom.com', '4email.net', '50mail.com', 'aapt.net.au', 'accountant.com', 'acdcfan.com', 'activist.com', 'adam.com.au', 'adexec.com', 'africamail.com', 'aircraftmail.com', 'airpost.net', 'allergist.com', 'allmail.net', 'alumni.com', 'alumnidirector.com', 'angelic.com', 'anonymous.to', 'aol.com', 'appraiser.net', 'archaeologist.com', 'arcticmail.com', 'artlover.com', 'asia-mail.com', 'asia.com', 'atheist.com', 'auctioneer.net', 'australiamail.com', 'bartender.net', 'bellair.net', 'berlin.com', 'bestmail.us', 'bigpond.com', 'bigpond.com.au', 'bigpond.net.au', 'bikerider.com', 'birdlover.com', 'blader.com', 'boardermail.com', 'brazilmail.com', 'brew-master.com', 'brew-meister.com', 'bsdmail.com', 'californiamail.com', 'cash4u.com', 'catlover.com', 'cheerful.com', 'chef.net', 'chemist.com', 'chinamail.com', 'clerk.com', 'clubmember.org', 'cluemail.com', 'collector.org', 'columnist.com', 'comcast.net', 'comic.com', 'computer4u.com', 'consultant.com', 'contractor.net', 'coolsite.net', 'counsellor.com', 'cutey.com', 'cyber-wizard.com', 'cyberdude.com', 'cybergal.com', 'cyberservices.com', 'dallasmail.com', 'dbzmail.com', 'deliveryman.com', 'diplomats.com', 'disciples.com', 'discofan.com', 'disposable.com', 'dispostable.com', 'doctor.com', 'dodo.com.au', 'doglover.com', 'doramail.com', 'dr.com', 'dublin.com', 'dutchmail.com', 'earthlink.net', 'elitemail.org', 'elvisfan.com', 'email.com', 'emailcorner.net', 'emailengine.net', 'emailengine.org', 'emailgroups.net', 'emailplus.org', 'emailuser.net', 'eml.cc', 'engineer.com', 'englandmail.com', 'europe.com', 'europemail.com', 'everymail.net', 'everyone.net', 'execs.com', 'exemail.com.au', 'f-m.fm', 'facebook.com', 'fast-email.com', 'fast-mail.org', 'fastem.com', 'fastemail.us', 'fastemailer.com', 'fastest.cc', 'fastimap.com', 'fastmail.cn', 'fastmail.co.uk', 'fastmail.com.au', 'fastmail.es', 'fastmail.fm', 'fastmail.im', 'fastmail.in', 'fastmail.jp', 'fastmail.mx', 'fastmail.net', 'fastmail.nl', 'fastmail.se', 'fastmail.to', 'fastmail.tw', 'fastmail.us', 'fastmailbox.net', 'fastmessaging.com', 'fastservice.com', 'fea.st', 'financier.com', 'fireman.net', 'flashmail.com', 'fmail.co.uk', 'fmailbox.com', 'fmgirl.com', 'fmguy.com', 'ftml.net', 'galaxyhit.com', 'gardener.com', 'geologist.com', 'germanymail.com', 'gmail.com', 'gmx.com', 'googlemail.com', 'graduate.org', 'graphic-designer.com', 'greenmail.net', 'groupmail.com', 'guerillamail.com', 'h-mail.us', 'hackermail.com', 'hailmail.net', 'hairdresser.net', 'hilarious.com', 'hiphopfan.com', 'homemail.com', 'hot-shot.com', 'hotmail.co.uk', 'hotmail.com', 'hotmail.fr', 'hotmail.it', 'housemail.com', 'humanoid.net', 'hushmail.com', 'icloud.com', 'iinet.net.au', 'imap-mail.com', 'imap.cc', 'imapmail.org', 'iname.com', 'inbox.com', 'innocent.com', 'inorbit.com', 'inoutbox.com', 'instruction.com', 'instructor.net', 'insurer.com', 'internet-e-mail.com', 'internet-mail.org', 'internetemails.net', 'internetmailing.net', 'internode.on.net', 'iprimus.com.au', 'irelandmail.com', 'israelmail.com', 'italymail.com', 'jetemail.net', 'job4u.com', 'journalist.com', 'justemail.net', 'keromail.com', 'kissfans.com', 'kittymail.com', 'koreamail.com', 'lawyer.com', 'legislator.com', 'letterboxes.org', 'linuxmail.org', 'live.co.uk', 'live.com', 'live.com.au', 'lobbyist.com', 'lovecat.com', 'lycos.com', 'mac.com', 'madonnafan.com', 'mail-central.com', 'mail-me.com', 'mail-page.com', 'mail.com', 'mail.ru', 'mailandftp.com', 'mailas.com', 'mailbolt.com', 'mailc.net', 'mailcan.com', 'mailforce.net', 'mailftp.com', 'mailhaven.com', 'mailinator.com', 'mailingaddress.org', 'mailite.com', 'mailmight.com', 'mailnew.com', 'mailsent.net', 'mailservice.ms', 'mailup.net', 'mailworks.org', 'marchmail.com', 'me.com', 'metalfan.com', 'mexicomail.com', 'minister.com', 'ml1.net', 'mm.st', 'moscowmail.com', 'msn.com', 'munich.com', 'musician.org', 'muslim.com', 'myfastmail.com', 'mymacmail.com', 'myself.com', 'net-shopping.com', 'netspace.net.au', 'ninfan.com', 'nonpartisan.com', 'nospammail.net', 'null.net', 'nycmail.com', 'oath.com', 'onebox.com', 'operamail.com', 'optician.com', 'optusnet.com.au', 'orthodontist.net', 'outlook.com', 'ownmail.net', 'pacific-ocean.com', 'pacificwest.com', 'pediatrician.com', 'petlover.com', 'petml.com', 'photographer.net', 'physicist.net', 'planetmail.com', 'planetmail.net', 'polandmail.com', 'politician.com', 'post.com', 'postinbox.com', 'postpro.net', 'presidency.com', 'priest.com', 'programmer.net', 'proinbox.com', 'promessage.com', 'protestant.com', 'publicist.com', 'qmail.com', 'qq.com', 'qualityservice.com', 'radiologist.net', 'ravemail.com', 'realemail.net', 'reallyfast.biz', 'reallyfast.info', 'realtyagent.com', 'reborn.com', 'rediff.com', 'reggaefan.com', 'registerednurses.com', 'reincarnate.com', 'religious.com', 'repairman.com', 'representative.com', 'rescueteam.com', 'rocketmail.com', 'rocketship.com', 'runbox.com', 'rushpost.com', 'safrica.com', 'saintly.com', 'salesperson.net', 'samerica.com', 'sanfranmail.com', 'scientist.com', 'scotlandmail.com', 'secretary.net', 'sent.as', 'sent.at', 'sent.com', 'seznam.cz', 'snakebite.com', 'socialworker.net', 'sociologist.com', 'solution4u.com', 'songwriter.net', 'spainmail.com', 'spamgourmet.com', 'speedpost.net', 'speedymail.org', 'ssl-mail.com', 'surgical.net', 'swedenmail.com', 'swift-mail.com', 'swissmail.com', 'teachers.org', 'tech-center.com', 'techie.com', 'technologist.com', 'telstra.com', 'telstra.com.au', 'the-fastest.net', 'the-quickest.com', 'theinternetemail.com', 'theplate.com', 'therapist.net', 'toke.com', 'toothfairy.com', 'torontomail.com', 'tpg.com.au', 'trashmail.net', 'tvstar.com', 'umpire.com', 'usa.com', 'uymail.com', 'veryfast.biz', 'veryspeedy.net', 'virginbroadband.com.au', 'walla.com', 'walla.co.il', 'warpmail.net', 'webname.com', 'westnet.com.au', 'windowslive.com', 'worker.com', 'workmail.com', 'writeme.com', 'xsmail.com', 'xtra.co.nz', 'y7mail.com', 'yahoo.ae', 'yahoo.at', 'yahoo.be', 'yahoo.ca', 'yahoo.ch', 'yahoo.cn', 'yahoo.co.id', 'yahoo.co.il', 'yahoo.co.in', 'yahoo.co.jp', 'yahoo.co.kr', 'yahoo.co.nz', 'yahoo.co.th', 'yahoo.co.uk', 'yahoo.co.za', 'yahoo.com', 'yahoo.com.ar', 'yahoo.com.au', 'yahoo.com.br', 'yahoo.com.cn', 'yahoo.com.co', 'yahoo.com.hk', 'yahoo.com.mx', 'yahoo.com.my', 'yahoo.com.ph', 'yahoo.com.sg', 'yahoo.com.tr', 'yahoo.com.tw', 'yahoo.com.vn', 'yahoo.cz', 'yahoo.de', 'yahoo.dk', 'yahoo.es', 'yahoo.fi', 'yahoo.fr', 'yahoo.gr', 'yahoo.hu', 'yahoo.ie', 'yahoo.in', 'yahoo.it', 'yahoo.nl', 'yahoo.no', 'yahoo.pl', 'yahoo.pt', 'yahoo.ro', 'yahoo.ru', 'yahoo.se', 'yandex.ru', 'yepmail.net', 'ymail.com', 'your-mail.com', 'zoho.com'];
    let email = value.trim().toLowerCase();
    let email_domain = email.substring(email.indexOf('@') + 1);
    return !freemails.includes(email_domain);
  }

};

})(jQuery); // Fully reference jQuery after this point.
