(function( window ) {
	
	'use strict';
	
	window.svg	= window.svg || {};
	
	window.svg.SVG_NS	= 'http://www.w3.org/2000/svg';
	window.svg.XLINK_NS	= 'http://www.w3.org/1999/xlink';
	
	
	
	function getSVG( path, then ) {
		
		fetch(
			path
		).then(
			function( res ) {
				
				res.text().then(
					function( str ) {
						
						document.body.insertAdjacentHTML( 'afterbegin', str );
						
						then && then( str, path );
						
					}
				);
				
			}
		);
		
	}
	
	function loadIcons( path ) {
		
		getSVG(
			path,
			function( svgStr ) {
				
				document.body.dispatchEvent(
					new CustomEvent(
						'iconsLoaded',
						{
							detail	: {
								str	: svgStr
							},
							bubbles	: true
						}
					)
				);
				
			}
		);
		
	}
	
	window.svg.loadIcons	= loadIcons;
	
	
	
	function getWindowSize() {
		
		try {
			
			return	{
						height	: window.innerHeight,
						width	: window.innerWidth
					};
			
		} catch ( ex ) {
			
			alert( 'Unable to determine window size' );
			
		}
		
	}
	
	function getWindowDimensions( size ) {
		
		//
		//	if size was not passed in we should get it
		//
		if ( ! size ) {
			
			size	= getWindowSize();
			
		}
		
		
		return	{
					width	: size.width,
					height	: size.height,
					centreX	: Math.floor( size.width / 2 ),
					centreY	: Math.floor( size.height / 2 )
				};
		
	}
	
	
	
	function buildCanvas() {
		
		return	document.createElementNS( window.svg.SVG_NS, 'svg' );
		
	}
	
	function sizeCanvas( canvas, dims ) {
		
		//
		//	if canvas was not passed in we should create it
		//
		if ( ! canvas ) {
			
			canvas	= buildCanvas();
			
		}
		
		//
		//	if dimensions were not passed in we should get them
		//
		if ( ! dims ) {
			
			dims	= getWindowDimensions();
			
		}
		
		
		canvas.setAttribute( 'height', dims.height );
		canvas.setAttribute( 'width', dims.width );
		
		
		return	canvas;
		
	}
	
	function appendCanvas( canvas, dims /* allow this to be passed thru to sizeCanvas() */ ) {
		
		//
		//	if dimensions were not passed in we should get them
		//
		if ( ! dims ) {
			
			dims	= getWindowDimensions();
			
		}
		
		//
		//	if (valid) canvas was not passed in we should create & size it
		//
		if ( ! canvas || ! canvas.appendChild ) {
			
			canvas	= sizeCanvas( null, dims );
			
		}
		
		
		document.body.appendChild( canvas );
		
		
		canvas.dispatchEvent(
			new CustomEvent(
				'canvasInitialised',
				{
					detail	: {
						dims	: dims
					},
					bubbles	: true
				}
			)
		);
		
		
		return	canvas;
		
	}
	
	window.svg.initialiseCanvas	= appendCanvas;
	
})( window );
