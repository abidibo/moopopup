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
var moopopup=new Class({Implements:[Options,Chain],options:{id:"moopopup",title:null,width:400,height:null,top_left_x:null,top_left_y:null,min_width:300,min_height:100,max_body_height:null,draggable:true,resizable:true,overlay:true,overlay_click_close_window:true,url:null,text:null,html_node:null,close_callback:null,disable_objects:true,},initialize:function(a){this.showing=false;if(typeOf(a)!=null){this.setOptions(a);this.checkOptions()}},checkOptions:function(){var a=/[0-9]+/;if(!a.test(this.options.width)||this.options.width<this.options.minWidth){this.options.width=this.options.min_width}if(typeOf(this.options.height)!="null"&&(!a.test(this.options.height)||this.options.height<this.options.min_height)){this.options.height=this.options.min_height}}.protect(),setOption:function(a,b){if(typeof this.options[a]!="undefined"){this.options[a]=b;this.checkOptions()}},display:function(){if(this.options.disable_objects){this.disableObjects()}if(this.options.overlay){this.renderOverlay()}else{this.renderPopup()}this.showing=true},disableObjects:function(){for(var a=0;a<window.frames.length;a++){var c=window.frames[a];if(this.sameDomain(c)){var d=c.document.getElementsByTagName("object");for(var b=0;b<d.length;b++){d[b].style.visibility="hidden"}}}$$("object").each(function(e){e.style.visibility="hidden"})}.protect(),enableObjects:function(){for(var a=0;a<window.frames.length;a++){var c=window.frames[a];if(sameDomain(c)){var d=c.document.getElementsByTagName("object");for(var b=0;b<d.length;b++){d[b].style.visibility="visible"}}}$$("object").each(function(e){e.style.visibility="visible"})}.protect(),sameDomain:function(c){var a=location.href;local=a.substring(0,a.indexOf(location.pathname));try{c=c.document;return c&&c.URL&&c.URL.indexOf(local)==0}catch(b){return false}}.protect(),renderOverlay:function(){var a=document.getScrollSize();this.overlay=new Element("div",{"class":"moopopup-overlay"});this.overlay.setStyles({width:a.x,height:a.y});this.overlay.setStyle("z-index",this.getMaxZindex()+1);this.overlay.inject(document.body);this.overlay_anim=new Fx.Tween(this.overlay,{property:"opacity"});this.overlay_anim.start(0,0.7).chain(function(){this.renderPopup()}.bind(this));if(this.options.overlay_click_close_window){this.overlay.addEvent("click",function(c){var b=new DOMEvent(c);if(b.target!=this.container){this.close()}}.bind(this))}}.protect(),renderPopup:function(){this.renderContainer();this.setFocus();if(this.options.url){this.loading=new Element("div",{"class":"moopopup-loading"});this.loading.setStyle("visibility","hidden");this.loading.inject(document.body,"top");var a=this.getViewport();this.loading.setStyles({position:"absolute",top:(a.cY-this.loading.getCoordinates().height/2)+"px",left:(a.cX-this.loading.getCoordinates().width/2)+"px","z-index":this.getMaxZindex()+1});this.loading.setStyle("visibility","visible");this.request()}else{if(this.options.html_node){var b=typeOf(this.options.html_node)=="element"?this.options.html_node:$(this.options.html_node);if(typeOf(b)=="element"){this.body.set("html",b.clone(true,true).get("html"))}}else{this.body.set("html",this.options.text)}this.position();this.container.setStyle("visibility","visible")}if(this.options.draggable){this.makeDraggable()}if(this.options.resizable){this.makeResizable()}},request:function(){var a=new Request.HTML({evalScripts:true,url:this.options.url,method:"get",onComplete:function(d,b,e,c){$(this.options.id).getChildren(".moopopup-body")[0].set("html",e);this.loading.dispose();this.position();this.container.setStyle("visibility","visible")}.bind(this)}).send()}.protect(),renderContainer:function(){this.container=new Element("div",{id:this.options.id,"class":"moopopup-container"});this.container.setStyles({visibility:"hidden",width:this.options.width+"px"});this.container.addEvent("mousedown",function(){this.setFocus()}.bind(this));if(typeOf(this.options.height)=="number"){this.container.setStyle("height",this.options.height+"px")}this.renderHeader();this.renderBody();this.container.inject(document.body,"top")}.protect(),makeDraggable:function(){var b=document.getCoordinates();var a=new Drag(this.container,{handle:this.header,limit:{x:[0,(b.width-this.container.getCoordinates().width)],y:[0,]}});this.header.setStyle("cursor","move")}.protect(),makeResizable:function(){var c=new Element("div",{"class":"moopopup-resize"});c.inject(this.container,"bottom");var a=document.body.getSize().y-20;var b=document.body.getSize().x-20;this.container.makeResizable({handle:c,limit:{x:[this.options.min_width,b],y:[this.options.min_height,a]}})}.protect(),renderHeader:function(){this.header=new Element("header",{"class":"moopopup-header"});if(this.options.title){var a=new Element("h1",{"class":"moopopup-title"});a.set("html",this.options.title);a.inject(this.header,"top")}this.close_button=new Element("div",{"class":"moopopup-closebutton"});this.close_button.set("text","×");this.close_button.inject(this.header,"bottom");this.close_button.addEvent("click",this.close.bind(this));this.header.inject(this.container,"top")}.protect(),renderBody:function(){this.body=new Element("div",{"class":"moopopup-body"});if(typeOf(this.options.max_body_height)=="number"){this.body.setStyle("max-height",this.options.max_body_height+"px")}this.body.inject(this.container,"bottom")}.protect(),position:function(){var b,c;var a=this.getViewport();b=a.cX-this.container.getCoordinates().width/2;c=a.cY-this.container.getCoordinates().height/2;if(this.options.top_left_x){b=this.options.top_left_x}if(this.options.top_left_y){c=this.options.top_left_y}this.container.setStyles({top:c+"px",left:b+"px"})},setFocus:function(){var a=this.getMaxZindex();if(!this.container.style.zIndex||(this.container.getStyle("z-index").toInt()<a)){this.container.setStyle("z-index",a+1)}},close:function(){if(this.showing){if(this.options.disable_objects){this.chain(this.container.dispose(),this.enableObjects())}else{this.container.dispose()}if(this.options.overlay){this.overlay_anim.start(0.7,0).chain(function(){this.overlay.dispose()}.bind(this))}if(typeOf(this.options.close_callback)=="function"){this.options.close_callback()}this.showing=false}},getViewport:function(){var b,a,d,c,f,e;if(typeof window.innerWidth!="undefined"){b=window.innerWidth,a=window.innerHeight}if(typeOf(self.pageXOffset)!="null"){c=self.pageYOffset;d=self.pageXOffset}else{if(document.documentElement&&document.documentElement.scrollTop){c=document.documentElement.scrollTop;d=document.documentElement.scrollLeft}else{c=document.body.clientHeight;d=document.body.clientWidth}}f=d+b/2;e=c+a/2;return{width:b,height:a,left:d,top:c,cX:f,cY:e}}.protect(),getMaxZindex:function(){var a=0;$$("body *").each(function(b){if(b.getStyle("z-index").toInt()){a=Math.max(a,b.getStyle("z-index").toInt())}});return a}.protect(),});
