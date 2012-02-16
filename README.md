moopopup
===========

![Screenshot](http://github.com/abidibo/moopopup/raw/master/logo.jpg)

moopopup is a plugin designed to display html content in a **draggable, resizable popup window** (really a layer over the document). The content shown may be passed as an option, taken from an existing html node or through an ajax request.
Every aspect is fully customizable through css.
A base css is provided in the Style folder (ubuntu 11.10 windows style).

How to use
----------

moopopup requires 

- core/1.4.4 
- more/1.4.0.1 Drag, Drag.Move

**Include mootools framework and moopopup plugin**

	<script src="path-to-mootools-framework" type="text/javascript"></script>
	<script src="path-to-moopopup-js" type="text/javascript"></script>

**Include moopopup stylesheet**

	<link href="path-to-moopopup-css" type="text/css" rel="stylesheet" />

**Example code**

Javascript:

	window.addEvent('domready', function() {
		var mp_instance = new moopopup({title:'My window title', text: 'My window content'});
		mp_instance.display();
	}

For more demos please visit the moopopup demo page at http://www.abidibo.net/projects/js/moopopup/demo

Screenshots
-----------

![Screenshot](http://github.com/abidibo/moopopup/raw/master/Docs/mp_screenshot1.png)
![Screenshot](http://github.com/abidibo/moopopup/raw/master/Docs/mp_screenshot2.png)

Links
-----------------

The project page: http://www.abidibo.net/projects/js/moopopup  
The documentation page: http://www.abidibo.net/projects/js/moopopup/doc   
The demo page: http://www.abidibo.net/projects/js/moopopup/demo

Please report bugs, errors and advices in the github project page: http://github.com/abidibo/moopopup

