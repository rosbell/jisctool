// Utility function
function Util () {};

/* 
	class manipulation functions
*/
Util.hasClass = function(el, className) {
	if (el.classList) return el.classList.contains(className);
	else return !!el.getAttribute('class').match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

Util.addClass = function(el, className) {
	var classList = className.split(' ');
 	if (el.classList) el.classList.add(classList[0]);
  else if (!Util.hasClass(el, classList[0])) el.setAttribute('class', el.getAttribute('class') +  " " + classList[0]);
 	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
	var classList = className.split(' ');
	if (el.classList) el.classList.remove(classList[0]);	
	else if(Util.hasClass(el, classList[0])) {
		var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
    el.setAttribute('class', el.getAttribute('class').replace(reg, ' '));
	}
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
	if(bool) Util.addClass(el, className);
	else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/* 
  DOM manipulation
*/
Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < el.children.length; i++) {
    if (Util.hasClass(el.children[i], className)) childrenByClass.push(el.children[i]);
  }
  return childrenByClass;
};

Util.is = function(elem, selector) {
  if(selector.nodeType){
    return elem === selector;
  }

  var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
    length = qa.length,
    returnArr = [];

  while(length--){
    if(qa[length] === elem){
      return true;
    }
  }

  return false;
};

/* 
	Animate height of an element
*/
Util.setHeight = function(start, to, element, duration, cb, timeFunction) {
	var change = to - start,
	    currentTime = null;

  var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = parseInt((progress/duration)*change + start);
    if(timeFunction) {
      val = Math[timeFunction](progress, start, to - start, duration);
    }
    element.style.height = val+"px";
    if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
    } else {
    	if(cb) cb();
    }
  };
  
  //set the height of the element before starting animation -> fix bug on Safari
  element.style.height = start+"px";
  window.requestAnimationFrame(animateHeight);
};

/* 
	Smooth Scroll
*/

Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;
      
  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    element.scrollTo(0, val);
    if(progress < duration) {
      window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

/* 
  Focus utility classes
*/

//Move focus to an element
Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

/* 
  Misc
*/

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  if('CSS' in window) {
    return CSS.supports(property, value);
  } else {
    var jsProperty = property.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase();});
    return jsProperty in document.body.style;
  }
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; // return false if not supported
}; 

/* 
	Polyfills
*/
//Closest() method
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function(s) {
		var el = this;
		if (!document.documentElement.contains(el)) return null;
		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1); 
		return null;
	};
}

//Custom Event() constructor
if ( typeof window.CustomEvent !== "function" ) {

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
}

/* 
	Animation curves
*/
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInQuart = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t + b;
};

Math.easeOutQuart = function (t, b, c, d) { 
  t /= d;
	t--;
	return -c * (t*t*t*t - 1) + b;
};

Math.easeInOutQuart = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t + b;
	t -= 2;
	return -c/2 * (t*t*t*t - 2) + b;
};

Math.easeOutElastic = function (t, b, c, d) {
  var s=1.70158;var p=d*0.7;var a=c;
  if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
  if (a < Math.abs(c)) { a=c; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (c/a);
  return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
};


/* JS Utility Classes */

// make focus ring visible only for keyboard navigation (i.e., tab key) 
(function() {
  var focusTab = document.getElementsByClassName('js-tab-focus'),
    shouldInit = false,
    outlineStyle = false,
    eventDetected = false;

  function detectClick() {
    if(focusTab.length > 0) {
      resetFocusStyle(false);
      window.addEventListener('keydown', detectTab);
    }
    window.removeEventListener('mousedown', detectClick);
    outlineStyle = false;
    eventDetected = true;
  };

  function detectTab(event) {
    if(event.keyCode !== 9) return;
    resetFocusStyle(true);
    window.removeEventListener('keydown', detectTab);
    window.addEventListener('mousedown', detectClick);
    outlineStyle = true;
  };

  function resetFocusStyle(bool) {
    var outlineStyle = bool ? '' : 'none';
    for(var i = 0; i < focusTab.length; i++) {
      focusTab[i].style.setProperty('outline', outlineStyle);
    }
  };

  function initFocusTabs() {
    if(shouldInit) {
      if(eventDetected) resetFocusStyle(outlineStyle);
      return;
    }
    shouldInit = focusTab.length > 0;
    window.addEventListener('mousedown', detectClick);
  };

  initFocusTabs();
  window.addEventListener('initFocusTabs', initFocusTabs);
}());

function resetFocusTabsStyle() {
  window.dispatchEvent(new CustomEvent('initFocusTabs'));
};
// File#: _1_tabs
// Usage: codyhouse.co/license
(function() {
	var Tab = function(element) {
		this.element = element;
		this.tabList = this.element.getElementsByClassName('js-tabs__controls')[0];
		this.listItems = this.tabList.getElementsByTagName('li');
		this.triggers = this.tabList.getElementsByTagName('a');
		this.panelsList = this.element.getElementsByClassName('js-tabs__panels')[0];
		this.panels = Util.getChildrenByClassName(this.panelsList, 'js-tabs__panel');
		this.hideClass = 'is-hidden';
		this.customShowClass = this.element.getAttribute('data-show-panel-class') ? this.element.getAttribute('data-show-panel-class') : false;
		this.layout = this.element.getAttribute('data-tabs-layout') ? this.element.getAttribute('data-tabs-layout') : 'horizontal';
		// deep linking options
		this.deepLinkOn = this.element.getAttribute('data-deep-link') == 'on';
		// init tabs
		this.initTab();
	};

	Tab.prototype.initTab = function() {
		//set initial aria attributes
		this.tabList.setAttribute('role', 'tablist');
		for( var i = 0; i < this.triggers.length; i++) {
			var bool = (i == 0),
				panelId = this.panels[i].getAttribute('id');
			this.listItems[i].setAttribute('role', 'presentation');
			Util.setAttributes(this.triggers[i], {'role': 'tab', 'aria-selected': bool, 'aria-controls': panelId, 'id': 'tab-'+panelId});
			Util.addClass(this.triggers[i], 'js-tabs__trigger'); 
			Util.setAttributes(this.panels[i], {'role': 'tabpanel', 'aria-labelledby': 'tab-'+panelId});
			Util.toggleClass(this.panels[i], this.hideClass, !bool);

			if(!bool) this.triggers[i].setAttribute('tabindex', '-1'); 
		}

		//listen for Tab events
		this.initTabEvents();

		// check deep linking option
		this.initDeepLink();
	};

	Tab.prototype.initTabEvents = function() {
		var self = this;
		//click on a new tab -> select content
		this.tabList.addEventListener('click', function(event) {
			if( event.target.closest('.js-tabs__trigger') ) self.triggerTab(event.target.closest('.js-tabs__trigger'), event);
		});
		//arrow keys to navigate through tabs 
		this.tabList.addEventListener('keydown', function(event) {
			;
			if( !event.target.closest('.js-tabs__trigger') ) return;
			if( tabNavigateNext(event, self.layout) ) {
				event.preventDefault();
				self.selectNewTab('next');
			} else if( tabNavigatePrev(event, self.layout) ) {
				event.preventDefault();
				self.selectNewTab('prev');
			}
		});
	};

	Tab.prototype.selectNewTab = function(direction) {
		var selectedTab = this.tabList.querySelector('[aria-selected="true"]'),
			index = Util.getIndexInArray(this.triggers, selectedTab);
		index = (direction == 'next') ? index + 1 : index - 1;
		//make sure index is in the correct interval 
		//-> from last element go to first using the right arrow, from first element go to last using the left arrow
		if(index < 0) index = this.listItems.length - 1;
		if(index >= this.listItems.length) index = 0;	
		this.triggerTab(this.triggers[index]);
		this.triggers[index].focus();
	};

	Tab.prototype.triggerTab = function(tabTrigger, event) {
		var self = this;
		event && event.preventDefault();	
		var index = Util.getIndexInArray(this.triggers, tabTrigger);
		//no need to do anything if tab was already selected
		if(this.triggers[index].getAttribute('aria-selected') == 'true') return;
		
		for( var i = 0; i < this.triggers.length; i++) {
			var bool = (i == index);
			Util.toggleClass(this.panels[i], this.hideClass, !bool);
			if(this.customShowClass) Util.toggleClass(this.panels[i], this.customShowClass, bool);
			this.triggers[i].setAttribute('aria-selected', bool);
			bool ? this.triggers[i].setAttribute('tabindex', '0') : this.triggers[i].setAttribute('tabindex', '-1');
		}

		// update url if deepLink is on
		if(this.deepLinkOn) {
			history.replaceState(null, '', '#'+tabTrigger.getAttribute('aria-controls'));
		}
	};

	Tab.prototype.initDeepLink = function() {
		if(!this.deepLinkOn) return;
		var hash = window.location.hash.substr(1);
		var self = this;
		if(!hash || hash == '') return;
		for(var i = 0; i < this.panels.length; i++) {
			if(this.panels[i].getAttribute('id') == hash) {
				this.triggerTab(this.triggers[i], false);
				setTimeout(function(){self.panels[i].scrollIntoView(true);});
				break;
			}
		};
	};

	function tabNavigateNext(event, layout) {
		if(layout == 'horizontal' && (event.keyCode && event.keyCode == 39 || event.key && event.key == 'ArrowRight')) {return true;}
		else if(layout == 'vertical' && (event.keyCode && event.keyCode == 40 || event.key && event.key == 'ArrowDown')) {return true;}
		else {return false;}
	};

	function tabNavigatePrev(event, layout) {
		if(layout == 'horizontal' && (event.keyCode && event.keyCode == 37 || event.key && event.key == 'ArrowLeft')) {return true;}
		else if(layout == 'vertical' && (event.keyCode && event.keyCode == 38 || event.key && event.key == 'ArrowUp')) {return true;}
		else {return false;}
	};
	
	//initialize the Tab objects
	var tabs = document.getElementsByClassName('js-tabs');
	if( tabs.length > 0 ) {
		for( var i = 0; i < tabs.length; i++) {
			(function(i){new Tab(tabs[i]);})(i);
		}
	}
}());
// File#: _1_accordion
// Usage: codyhouse.co/license
(function() {
	var Accordion = function(element) {
		this.element = element;
		this.items = Util.getChildrenByClassName(this.element, 'js-accordion__item');
		this.version = this.element.getAttribute('data-version') ? '-'+this.element.getAttribute('data-version') : '';
		this.showClass = 'accordion'+this.version+'__item--is-open';
		this.animateHeight = (this.element.getAttribute('data-animation') == 'on');
		this.multiItems = !(this.element.getAttribute('data-multi-items') == 'off'); 
		// deep linking options
		this.deepLinkOn = this.element.getAttribute('data-deep-link') == 'on';
		// init accordion
		this.initAccordion();
	};

	Accordion.prototype.initAccordion = function() {
		//set initial aria attributes
		for( var i = 0; i < this.items.length; i++) {
			var button = this.items[i].getElementsByTagName('button')[0],
				content = this.items[i].getElementsByClassName('js-accordion__panel')[0],
				isOpen = Util.hasClass(this.items[i], this.showClass) ? 'true' : 'false';
			Util.setAttributes(button, {'aria-expanded': isOpen, 'aria-controls': 'accordion-content-'+i, 'id': 'accordion-header-'+i});
			Util.addClass(button, 'js-accordion__trigger');
			Util.setAttributes(content, {'aria-labelledby': 'accordion-header-'+i, 'id': 'accordion-content-'+i});
		}

		//listen for Accordion events
		this.initAccordionEvents();

		// check deep linking option
		this.initDeepLink();
	};

	Accordion.prototype.initAccordionEvents = function() {
		var self = this;

		this.element.addEventListener('click', function(event) {
			var trigger = event.target.closest('.js-accordion__trigger');
			//check index to make sure the click didn't happen inside a children accordion
			if( trigger && Util.getIndexInArray(self.items, trigger.parentElement) >= 0) self.triggerAccordion(trigger);
		});
	};

	Accordion.prototype.triggerAccordion = function(trigger) {
		var bool = (trigger.getAttribute('aria-expanded') === 'true');

		this.animateAccordion(trigger, bool, false);

		if(!bool && this.deepLinkOn) {
			history.replaceState(null, '', '#'+trigger.getAttribute('aria-controls'));
		}
	};

	Accordion.prototype.animateAccordion = function(trigger, bool, deepLink) {
		var self = this;
		var item = trigger.closest('.js-accordion__item'),
			content = item.getElementsByClassName('js-accordion__panel')[0],
			ariaValue = bool ? 'false' : 'true';

		if(!bool) Util.addClass(item, this.showClass);
		trigger.setAttribute('aria-expanded', ariaValue);
		self.resetContentVisibility(item, content, bool);

		if( !this.multiItems && !bool || deepLink) this.closeSiblings(item);
	};

	Accordion.prototype.resetContentVisibility = function(item, content, bool) {
		Util.toggleClass(item, this.showClass, !bool);
		content.removeAttribute("style");
		if(bool && !this.multiItems) { // accordion item has been closed -> check if there's one open to move inside viewport 
			this.moveContent();
		}
	};

	Accordion.prototype.closeSiblings = function(item) {
		//if only one accordion can be open -> search if there's another one open
		var index = Util.getIndexInArray(this.items, item);
		for( var i = 0; i < this.items.length; i++) {
			if(Util.hasClass(this.items[i], this.showClass) && i != index) {
				this.animateAccordion(this.items[i].getElementsByClassName('js-accordion__trigger')[0], true, false);
				return false;
			}
		}
	};

	Accordion.prototype.moveContent = function() { // make sure title of the accordion just opened is inside the viewport
		var openAccordion = this.element.getElementsByClassName(this.showClass);
		if(openAccordion.length == 0) return;
		var boundingRect = openAccordion[0].getBoundingClientRect();
		if(boundingRect.top < 0 || boundingRect.top > window.innerHeight) {
			var windowScrollTop = window.scrollY || document.documentElement.scrollTop;
			window.scrollTo(0, boundingRect.top + windowScrollTop);
		}
	};

	Accordion.prototype.initDeepLink = function() {
		if(!this.deepLinkOn) return;
		var hash = window.location.hash.substr(1);
		if(!hash || hash == '') return;
		var trigger = this.element.querySelector('.js-accordion__trigger[aria-controls="'+hash+'"]');
		if(trigger && trigger.getAttribute('aria-expanded') !== 'true') {
			this.animateAccordion(trigger, false, true);
			setTimeout(function(){trigger.scrollIntoView(true);});
		}
	};

	window.Accordion = Accordion;
	
	//initialize the Accordion objects
	var accordions = document.getElementsByClassName('js-accordion');
	if( accordions.length > 0 ) {
		for( var i = 0; i < accordions.length; i++) {
			(function(i){new Accordion(accordions[i]);})(i);
		}
	}
}());
// File#: _1_main-header
// Usage: codyhouse.co/license
// File#: _1_main-header
// Usage: codyhouse.co/license
(function() {
    var mainHeader = document.getElementsByClassName('js-header');
    if( mainHeader.length > 0 ) {
      var trigger = mainHeader[0].getElementsByClassName('js-header__trigger')[0],
        nav = mainHeader[0].getElementsByClassName('js-header__nav')[0];
  
      // we'll use these to store the node that needs to receive focus when the mobile menu is closed 
      var focusMenu = false;
  
      //detect click on nav trigger
      trigger.addEventListener("click", function(event) {
        event.preventDefault();
        console.log('omg please work')
        toggleNavigation(!Util.hasClass(nav, 'header__nav--is-visible'));
      });
  
      // listen for key events
      window.addEventListener('keyup', function(event){
        // listen for esc key
        if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
          // close navigation on mobile if open
          if(trigger.getAttribute('aria-expanded') == 'true' && isVisible(trigger)) {
            focusMenu = trigger; // move focus to menu trigger when menu is close
            trigger.click();
          }
        }
        // listen for tab key
        if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
          // close navigation on mobile if open when nav loses focus
          if(trigger.getAttribute('aria-expanded') == 'true' && isVisible(trigger) && !document.activeElement.closest('.js-header')) trigger.click();
        }
      });
  
      // listen for resize
      var resizingId = false;
      window.addEventListener('resize', function() {
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 500);
      });
  
      function doneResizing() {
        if( !isVisible(trigger) && Util.hasClass(mainHeader[0], 'header--expanded')) toggleNavigation(false); 
      };
    }
  
    function isVisible(element) {
      return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    };
  
    function toggleNavigation(bool) { // toggle navigation visibility on small device
      console.log(bool);
      Util.toggleClass(nav, 'header__nav--is-visible', bool);
      Util.toggleClass(mainHeader[0], 'header--expanded', bool);
      trigger.setAttribute('aria-expanded', bool);
      if(bool) { //opening menu -> move focus to first element inside nav
        nav.querySelectorAll('[href], input:not([disabled]), button:not([disabled])')[0].focus();
      } else if(focusMenu) {
        focusMenu.focus();
        focusMenu = false;
      }
    };
  }());
// File#: _1_popover
// Usage: codyhouse.co/license
(function() {
    var Popover = function(element) {
      this.element = element;
          this.elementId = this.element.getAttribute('id');
          this.trigger = document.querySelectorAll('[aria-controls="'+this.elementId+'"]');
          this.selectedTrigger = false;
      this.popoverVisibleClass = 'popover--is-visible';
      this.selectedTriggerClass = 'popover-control--active';
      this.popoverIsOpen = false;
      // focusable elements
      this.firstFocusable = false;
          this.lastFocusable = false;
          // position target - position tooltip relative to a specified element
          this.positionTarget = getPositionTarget(this);
          // gap between element and viewport - if there's max-height 
          this.viewportGap = parseInt(getComputedStyle(this.element).getPropertyValue('--popover-viewport-gap')) || 20;
          initPopover(this);
          initPopoverEvents(this);
    };
  
    // public methods
    Popover.prototype.togglePopover = function(bool, moveFocus) {
      togglePopover(this, bool, moveFocus);
    };
  
    Popover.prototype.checkPopoverClick = function(target) {
      checkPopoverClick(this, target);
    };
  
    Popover.prototype.checkPopoverFocus = function() {
      checkPopoverFocus(this);
    };
  
      // private methods
      function getPositionTarget(popover) {
          // position tooltip relative to a specified element - if provided
          var positionTargetSelector = popover.element.getAttribute('data-position-target');
          if(!positionTargetSelector) return false;
          var positionTarget = document.querySelector(positionTargetSelector);
          return positionTarget;
      };
  
    function initPopover(popover) {
          // init aria-labels
          for(var i = 0; i < popover.trigger.length; i++) {
              Util.setAttributes(popover.trigger[i], {'aria-expanded': 'false', 'aria-haspopup': 'true'});
          }
    };
    
    function initPopoverEvents(popover) {
          for(var i = 0; i < popover.trigger.length; i++) {(function(i){
              popover.trigger[i].addEventListener('click', function(event){
                  event.preventDefault();
                  // if the popover had been previously opened by another trigger element -> close it first and reopen in the right position
                  if(Util.hasClass(popover.element, popover.popoverVisibleClass) && popover.selectedTrigger !=  popover.trigger[i]) {
                      togglePopover(popover, false, false); // close menu
                  }
                  // toggle popover
                  popover.selectedTrigger = popover.trigger[i];
                  togglePopover(popover, !Util.hasClass(popover.element, popover.popoverVisibleClass), true);
              });
      })(i);}
      
      // trap focus
      popover.element.addEventListener('keydown', function(event){
        if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
          //trap focus inside popover
          trapFocus(popover, event);
        }
      });
    };
    
    function togglePopover(popover, bool, moveFocus) {
          // toggle popover visibility
          Util.toggleClass(popover.element, popover.popoverVisibleClass, bool);
          popover.popoverIsOpen = bool;
          if(bool) {
        popover.selectedTrigger.setAttribute('aria-expanded', 'true');
        getFocusableElements(popover);
        // move focus
        focusPopover(popover);
              popover.element.addEventListener("transitionend", function(event) {focusPopover(popover);}, {once: true});
              // position the popover element
              positionPopover(popover);
              // add class to popover trigger
              Util.addClass(popover.selectedTrigger, popover.selectedTriggerClass);
          } else if(popover.selectedTrigger) {
              popover.selectedTrigger.setAttribute('aria-expanded', 'false');
              if(moveFocus) Util.moveFocus(popover.selectedTrigger);
              // remove class from menu trigger
              Util.removeClass(popover.selectedTrigger, popover.selectedTriggerClass);
              popover.selectedTrigger = false;
          }
      };
      
      function focusPopover(popover) {
          if(popover.firstFocusable) {
              popover.firstFocusable.focus();
          } else {
              Util.moveFocus(popover.element);
          }
      };
  
    function positionPopover(popover) {
          // reset popover position
          resetPopoverStyle(popover);
          var selectedTriggerPosition = (popover.positionTarget) ? popover.positionTarget.getBoundingClientRect() : popover.selectedTrigger.getBoundingClientRect();
          
          var menuOnTop = (window.innerHeight - selectedTriggerPosition.bottom) < selectedTriggerPosition.top;
              
          var left = selectedTriggerPosition.left,
              right = (window.innerWidth - selectedTriggerPosition.right),
              isRight = (window.innerWidth < selectedTriggerPosition.left + popover.element.offsetWidth);
  
          var horizontal = isRight ? 'right: '+right+'px;' : 'left: '+left+'px;',
              vertical = menuOnTop
                  ? 'bottom: '+(window.innerHeight - selectedTriggerPosition.top)+'px;'
                  : 'top: '+selectedTriggerPosition.bottom+'px;';
          // check right position is correct -> otherwise set left to 0
          if( isRight && (right + popover.element.offsetWidth) > window.innerWidth) horizontal = 'left: '+ parseInt((window.innerWidth - popover.element.offsetWidth)/2)+'px;';
          // check if popover needs a max-height (user will scroll inside the popover)
          var maxHeight = menuOnTop ? selectedTriggerPosition.top - popover.viewportGap : window.innerHeight - selectedTriggerPosition.bottom - popover.viewportGap;
  
          var initialStyle = popover.element.getAttribute('style');
          if(!initialStyle) initialStyle = '';
          popover.element.setAttribute('style', initialStyle + horizontal + vertical +'max-height:'+Math.floor(maxHeight)+'px;');
      };
      
      function resetPopoverStyle(popover) {
          // remove popover inline style before appling new style
          popover.element.style.maxHeight = '';
          popover.element.style.top = '';
          popover.element.style.bottom = '';
          popover.element.style.left = '';
          popover.element.style.right = '';
      };
  
    function checkPopoverClick(popover, target) {
      // close popover when clicking outside it
      if(!popover.popoverIsOpen) return;
      if(!popover.element.contains(target) && !target.closest('[aria-controls="'+popover.elementId+'"]')) togglePopover(popover, false);
    };
  
    function checkPopoverFocus(popover) {
      // on Esc key -> close popover if open and move focus (if focus was inside popover)
      if(!popover.popoverIsOpen) return;
      var popoverParent = document.activeElement.closest('.js-popover');
      togglePopover(popover, false, popoverParent);
    };
    
    function getFocusableElements(popover) {
      //get all focusable elements inside the popover
          var allFocusable = popover.element.querySelectorAll(focusableElString);
          getFirstVisible(popover, allFocusable);
          getLastVisible(popover, allFocusable);
    };
  
    function getFirstVisible(popover, elements) {
          //get first visible focusable element inside the popover
          for(var i = 0; i < elements.length; i++) {
              if( isVisible(elements[i]) ) {
                  popover.firstFocusable = elements[i];
                  break;
              }
          }
      };
  
    function getLastVisible(popover, elements) {
          //get last visible focusable element inside the popover
          for(var i = elements.length - 1; i >= 0; i--) {
              if( isVisible(elements[i]) ) {
                  popover.lastFocusable = elements[i];
                  break;
              }
          }
    };
  
    function trapFocus(popover, event) {
      if( popover.firstFocusable == document.activeElement && event.shiftKey) {
              //on Shift+Tab -> focus last focusable element when focus moves out of popover
              event.preventDefault();
              popover.lastFocusable.focus();
          }
          if( popover.lastFocusable == document.activeElement && !event.shiftKey) {
              //on Tab -> focus first focusable element when focus moves out of popover
              event.preventDefault();
              popover.firstFocusable.focus();
          }
    };
    
    function isVisible(element) {
          // check if element is visible
          return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
      };
  
    window.Popover = Popover;
  
    //initialize the Popover objects
    var popovers = document.getElementsByClassName('js-popover');
    // generic focusable elements string selector
      var focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
      
      if( popovers.length > 0 ) {
          var popoversArray = [];
          var scrollingContainers = [];
          for( var i = 0; i < popovers.length; i++) {
              (function(i){
                  popoversArray.push(new Popover(popovers[i]));
                  var scrollableElement = popovers[i].getAttribute('data-scrollable-element');
                  if(scrollableElement && !scrollingContainers.includes(scrollableElement)) scrollingContainers.push(scrollableElement);
              })(i);
          }
  
          // listen for key events
          window.addEventListener('keyup', function(event){
              if( event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape' ) {
          // close popover on 'Esc'
                  popoversArray.forEach(function(element){
                      element.checkPopoverFocus();
                  });
              } 
          });
          // close popover when clicking outside it
          window.addEventListener('click', function(event){
              popoversArray.forEach(function(element){
                  element.checkPopoverClick(event.target);
              });
          });
          // on resize -> close all popover elements
          window.addEventListener('resize', function(event){
              popoversArray.forEach(function(element){
                  element.togglePopover(false, false);
              });
          });
          // on scroll -> close all popover elements
          window.addEventListener('scroll', function(event){
              popoversArray.forEach(function(element){
                  if(element.popoverIsOpen) element.togglePopover(false, false);
              });
          });
          // take into account additinal scrollable containers
          for(var j = 0; j < scrollingContainers.length; j++) {
              var scrollingContainer = document.querySelector(scrollingContainers[j]);
              if(scrollingContainer) {
                  scrollingContainer.addEventListener('scroll', function(event){
                      popoversArray.forEach(function(element){
                          if(element.popoverIsOpen) element.togglePopover(false, false);
                      });
                  });
              }
          }
      }
  }());
// File#: _2_tabs-v3
// Usage: codyhouse.co/license
var data, areas, dataByArea // store the data from the spreadsheet. data is unordered. areas is an ordered list of areas. dataByArea is a map returning all resources for one area
const target = document.querySelector('#acco') // houses the whole accordion
var templateSection = document.querySelector('.template-section') // hidden template element for a section (tag) in the accordion
var templateItem = document.querySelector('.template-link') // template item for a card - for cloning

// for production, switch to Google with fallback
fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vStY6NwY6S8eNyF040MrpzrCEQi3R6Ye39OahLdQKFxl5m4wddWonHYFbiPiXRI1Tr2-R4G81p-0BtS/pub?gid=394150613&single=true&output=tsv') // get the live TSV from Google sheets
// fetch('fallback.json') // get the fallback data from escholar
.then(r=>r.json()) // convert to JSON (contents will still be URL encoded)
.then(json=>{
  
  data = json.map(row=>Object.fromEntries(Object.entries(row).map(pair=>pair.map(decodeURIComponent)))) // apply URL decoding to all string data within the JSON object (which is quite nested hence the complexity)
  areas = [...new Set(data.map(row=>row.area))].sort() // just a list of unique Jisc areas in order
  dataByArea = new Map( areas.map(area=>[area,data.filter(row=>row.area===area)]) ) // a map of all resources for each area

  areas.forEach(area=>{ // build the page area by area

	var sectionClone = templateSection.cloneNode(true) // create a new section copy (virtual)
	sectionClone.style.display='' // unhide the copy (for when it's added to DOM)

	sectionClone.querySelector('.template-tag').textContent=area // set the title for this section of the accordion    
    
    dataByArea.get(area).filter(row=>row.title&&row.url&&row.desc) // filter to only areas with complete data
	.forEach(row=>{ // resource by resource, add the links

		let itemClone = templateItem.cloneNode(true) // create a virtual copy of a card

		itemClone.href=row.url
		itemClone.querySelector('.template-title').textContent=row.title
		itemClone.querySelector('.template-desc').textContent=row.desc
		itemClone.style.display=''

		// console.log(row)
		// console.log(itemClone)

		sectionClone.querySelector('.template-contents').appendChild(itemClone) // add the card to the section
		// console.log(sectionClone)

    })
	
	target.appendChild(sectionClone) // add the section to the accordion

  })

  target.classList.add('accordion','js-accordion') // add the classes in case needed for CSS (removing these in HTML stops init before dynamic population)
  new Accordion(target) // init the accordion
  target.style.display='' // unhide the accordion
    
})