/*
---
description: moopopup is a plugin designed to display html content in a draggable, resizable popup window (really a layer over the document). The content shown may be passed as an option, taken from an existing html node or through an ajax request.

license: MIT-style

authors:
- abidibo (Otto srl) <abidibo@gmail.com>

requires:
- core/1.4.4
- more/1.4.0.1 Drag
- more/1.4.0.1 Drag.Move

provides:
- moopopup

...

For documentation, demo and download link please visit http://www.abidibo.net/projects/js/moopopup

*/
var moopopup = new Class({

	Implements: [Options, Chain],
	options: {
		// window identifier
		id: 'moopopup',
		// window title
		title: null,
		// window width (px)
		width: 400,
		// window height (autofill the content if null)
		height: null,
		// x coordinate of the top left corner (if not given the window will be centered)
		top_left_x: null,
		// y coordinate of the top left corner (if not given the window will be centered)
		top_left_y: null,
		// minimum width (when resizing)
		min_width: 300,
		// minimum height (when resizing)
		min_height: 100,
		// maximum height of popoup contents
		max_body_height: null,
		// make window draggable
		draggable: true,
		// make window resizable
		resizable: true,
		// show over an overlay
		overlay: true,
		// close window when clicking out of it if overlay is true
		overlay_click_close_window: true,
		// url for ajax request contents
		url: null,
		// test content
		text: null,
		// html node to get content from
		html_node: null,
		// callback function called when closing the window
		close_callback: null,
		// disable all active objects in the page when sowing the popoup
		disable_objects: true,
	},
	initialize: function(options) {

		this.showing = false;	

		if(typeOf(options) != null) {
			this.setOptions(options);
			this.checkOptions();
		}

	},
	checkOptions: function() {

		var rexp = /[0-9]+/;
		if(!rexp.test(this.options.width) || this.options.width < this.options.minWidth) {
			this.options.width = this.options.min_width;
		}
		if(typeOf(this.options.height) != 'null' && (!rexp.test(this.options.height) || this.options.height < this.options.min_height)) {
			this.options.height = this.options.min_height;
		}

	}.protect(),
	setOption: function(option, value) {

		if(typeof this.options[option] != 'undefined') {
			this.options[option] = value;
			this.checkOptions();
		}

	},
	display: function() {

		if(this.options.disable_objects) {
			this.disableObjects();
		}

		// if the overlay is shown then the popup is shown after the overlay animation
		if(this.options.overlay) {
			this.renderOverlay();
		}
		else {
			this.renderPopup();
		}

		this.showing = true;

	},
	disableObjects: function() {
				
		for(var i=0; i<window.frames.length; i++) {
			var myFrame = window.frames[i];
			// iframe are in the same domain? if not can't disable objects inside
			if(this.sameDomain(myFrame)) {
				var obs = myFrame.document.getElementsByTagName('object');
				for(var ii=0; ii<obs.length; ii++) {
					obs[ii].style.visibility='hidden';
				}
			}
		}

		$$('object').each(function(item) {
			item.style.visibility='hidden';
		});

	}.protect(),
	enableObjects: function() {
		
		for(var i=0;i<window.frames.length;i++) {
			var myFrame = window.frames[i];
			if(sameDomain(myFrame)) {
				var obs = myFrame.document.getElementsByTagName('object');
				for(var ii=0; ii<obs.length; ii++) {
					obs[ii].style.visibility='visible';
				}
			}
		}

		$$('object').each(function(item) {
			item.style.visibility='visible';
		});

	}.protect(),
	sameDomain: function(win) {
		
		var H = location.href;
     		local = H.substring(0, H.indexOf(location.pathname));
		try {
			win = win.document;
			return win && win.URL && win.URL.indexOf(local) == 0;
		}
		catch(e) {
			return false;
		}
	}.protect(),
	renderOverlay: function() {
	
		// get overlay dimensions
		var doc_dimensions = document.getScrollSize();

		this.overlay = new Element('div', {'class': 'moopopup-overlay'});
		this.overlay.setStyles({
			'width': doc_dimensions.x,
			'height': doc_dimensions.y
		});
		
		this.overlay.setStyle('z-index', this.getMaxZindex() + 1);

		this.overlay.inject(document.body);

		// overlay animation
		this.overlay_anim = new Fx.Tween(this.overlay, {property: 'opacity'});
		this.overlay_anim.start(0, 0.7).chain(function() { this.renderPopup(); }.bind(this));

		if(this.options.overlay_click_close_window) {
			this.overlay.addEvent('click', function(e) {
				var event = new DOMEvent(e);
				if(event.target != this.container) {
					this.close();
				}
			}.bind(this));
		}

	}.protect(),
	renderPopup: function() {
		
		this.renderContainer();

		// always show it over all other elements
		this.setFocus();

		// insert text
		if(this.options.url) {
			
			this.loading = new Element('div', {'class': 'moopopup-loading'});
			this.loading.setStyle('visibility', 'hidden'); // ie can't get element dimensions if not in dom
			this.loading.inject(document.body, 'top');
			var viewport = this.getViewport();
			this.loading.setStyles({
				'position':'absolute',
				'top': (viewport.cY-this.loading.getCoordinates().height/2)+'px',		
				'left': (viewport.cX-this.loading.getCoordinates().width/2)+'px',		
				'z-index': this.getMaxZindex() + 1
			});
			this.loading.setStyle('visibility', 'visible');
			this.request();
		}
		else {
			if(this.options.html_node) {
				var html_node = typeOf(this.options.html_node) == 'element'
					? this.options.html_node 
					: $(this.options.html_node);

				if(typeOf(html_node) == 'element') {
					this.body.set('html', html_node.clone(true, true).get('html'));
				}
			}
			else {
				this.body.set('html', this.options.text);
			}

			// now let's position the popup
			this.position();
			// ...and make it visible
			this.container.setStyle('visibility', 'visible');
		}

		// the popup is draggable?
		if(this.options.draggable) {
			this.makeDraggable();
		}
		// the popup is resizable?
		if(this.options.resizable) {
			this.makeResizable();
		}

	},
	request: function() {
			 
		var request = new Request.HTML({
			evalScripts: true,
			url: this.options.url,
			method:	'get',
			onComplete: function(responseTree, responseElements, responseHTML, responseJavaScript) {
				$(this.options.id).getChildren('.moopopup-body')[0].set('html', responseHTML);
				this.loading.dispose();
				// now let's position the popup
				this.position();
				// ... and make it visible
				this.container.setStyle('visibility', 'visible');
			}.bind(this)
		}).send();

	}.protect(),
	renderContainer: function() {

		this.container = new Element('div', {'id': this.options.id, 'class': 'moopopup-container'});	

		// why visibility hidden?
		// because the popoup is positionated only at the end, when all its content is rendered, and its dimensions known
		this.container.setStyles({
				'visibility': 'hidden',
				'width': this.options.width+'px'
		});

		this.container.addEvent('mousedown', function() {
			this.setFocus();
		}.bind(this));

		if(typeOf(this.options.height) == 'number') {
			this.container.setStyle('height', this.options.height+'px');
		}

		this.renderHeader();
		this.renderBody();

		this.container.inject(document.body, 'top');

	}.protect(),
	makeDraggable: function() {

		var doc_dimensions = document.getCoordinates();
			
		var drag_instance = new Drag(this.container, {
				'handle': this.header, 
				'limit':{'x':[0, (doc_dimensions.width-this.container.getCoordinates().width)], 'y':[0, ]}
		});
		
		this.header.setStyle('cursor', 'move');
    
	}.protect(),
	makeResizable: function() {

		var ico_resize = new Element('div', {'class': 'moopopup-resize'});
		
		ico_resize.inject(this.container, 'bottom');

		var ylimit = document.body.getSize().y-20;
		var xlimit = document.body.getSize().x-20;

		this.container.makeResizable({
			'handle': ico_resize,
			'limit': {'x':[this.options.min_width, xlimit], 'y':[this.options.min_height, ylimit]}
		});

	}.protect(),
	renderHeader: function() {
		
		this.header = new Element('header', {'class': 'moopopup-header'});

		// is there a title?
		if(this.options.title) {
			var h1 = new Element('h1', {'class': 'moopopup-title'});
			h1.set('html', this.options.title);
			h1.inject(this.header, 'top');
		}

		// close button, always visible
		this.close_button = new Element('div', {'class': 'moopopup-closebutton'});
		this.close_button.set('text', '×');
		this.close_button.inject(this.header, 'bottom');	
		this.close_button.addEvent('click', this.close.bind(this));

		this.header.inject(this.container, 'top');

	}.protect(),
	renderBody: function() {
			    
		this.body = new Element('div', {'class': 'moopopup-body'});	
		
		if(typeOf(this.options.max_body_height) == 'number') {
			this.body.setStyle('max-height', this.options.max_body_height+'px');
		}

		this.body.inject(this.container, 'bottom');

	}.protect(),
	position: function() {

		var x, y;

		var viewport = this.getViewport();

		// set the position to the center of viewport
		x = viewport.cX - this.container.getCoordinates().width / 2;
		y = viewport.cY - this.container.getCoordinates().height / 2;

		// want it in another position?
		if(this.options.top_left_x) {
			x = this.options.top_left_x;
		}	

		if(this.options.top_left_y) {
			y = this.options.top_left_y;
		}

		this.container.setStyles({
			'top': y+'px',
			'left': x+'px'
		});

	},
	setFocus: function() {
		var maxZ = this.getMaxZindex();
		if(!this.container.style.zIndex || (this.container.getStyle('z-index').toInt() < maxZ)) {
			this.container.setStyle('z-index', maxZ+1);
		}
	},
	close: function() {

		if(this.showing) {
			
			if(this.options.disable_objects) {
				this.chain(this.container.dispose(), this.enableObjects());
			}
			else {
				this.container.dispose();
			}

			// animate the overlay before disposing it
			if(this.options.overlay) {
				this.overlay_anim.start(0).chain(function() { this.overlay.dispose(); }.bind(this));
			}

			// is there a callback function?
    			if(typeOf(this.options.close_callback) == 'function') {
				this.options.close_callback();		
			}
			
			this.showing = false;

		}

	},
	getViewport: function() {

		var width, height, left, top, cX, cY;

		// decided not to support ie6 anymore
		if(typeof window.innerWidth != 'undefined') {
			width = window.innerWidth,
			height = window.innerHeight
		}

		if(typeOf(self.pageXOffset) != 'null') {
			top = self.pageYOffset;
			left = self.pageXOffset;
		}
		else if(document.documentElement && document.documentElement.scrollTop) {
			top = document.documentElement.scrollTop;
			left = document.documentElement.scrollLeft;
		}
		else {
			top = document.body.clientHeight;
			left = document.body.clientWidth;
		}

		cX = left + width/2;
		cY = top + height/2;

		return {'width':width, 'height':height, 'left':left, 'top':top, 'cX':cX, 'cY':cY};

	}.protect(),
	getMaxZindex: function() {
	
		var maxZ = 0;
		$$('body *').each(function(el) {
			if(el.getStyle('z-index').toInt()) {
				maxZ = Math.max(maxZ, el.getStyle('z-index').toInt());
			}
		});

		return maxZ;

	}.protect(),

});
