(function( window ) {
	
	'use strict';
	
	const	SVG_NS		= 'http://www.w3.org/2000/svg',
			XLINK_NS	= 'http://www.w3.org/1999/xlink';
	
	
	function initialise() {
		
		let	dims	= getDims(),
			canvas	= appendCanvas( null, dims );
		
		
		document.body.dispatchEvent(
			new CustomEvent(
				'linesInitialised',
				{
					detail	: {
						dims	: dims,
						canvas	: canvas,
						addPath	: function( className ) {
							
							let	path	= appendPath( canvas );
							
							if ( className ) {
								
								path.setAttribute( 'class', className );
								
							}
							
							return	path;
							
						}
					}
				}
			)
		);
		
	}
	
	document.addEventListener(
		'DOMContentLoaded',
		initialise
	);
	
	
	
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
	
	function getDims( size ) {
		
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
		
		return	document.createElementNS( SVG_NS, 'svg' );
		
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
			
			dims	= getDims();
			
		}
		
		
		canvas.setAttribute( 'height', dims.height );
		canvas.setAttribute( 'width', dims.width );
		
		
		return	canvas;
		
	}
	
	function appendCanvas( canvas, dims /* allow this to be passed thru to sizeCanvas() */ ) {
		
		//
		//	if canvas was not passed in we should create & size it
		//
		if ( ! canvas ) {
			
			canvas	= sizeCanvas( null, dims );
			
		}
		
		
		document.body.appendChild( canvas );
		
		
		return	canvas;
		
	}
	
	
	
	function buildPath() {
		
		return	document.createElementNS( SVG_NS, 'path' );
		
	}
	
	function stylePath( path ) {
		
		//
		//	if path was not passed in we should create it
		//
		if ( ! path ) {
			
			path	= buildPath();
			
		}
		
		/*
		path.setAttribute( 'stroke', 'cyan' );
		path.setAttribute( 'stroke-width', 2 );
		path.setAttribute( 'filter', 'url(#smallglow)' );
		*/
		
		return	path;
		
	}
	
	function appendPath( canvas, path ) {
		
		//
		//	if canvas was not passed in OR is not the correct element
		//	type we need to throw, as we have nowhere to append it to
		//
		if (
			! canvas
			||
			! canvas.viewBox
		) {
			
			throw ( 'Missing or invalid canvas' );
			
		}
		
		//
		//	if path was not passed in we should create & style it
		//
		if ( ! path ) {
			
			path	= stylePath();
			
		}
		
		
		canvas.appendChild( path );
		
		
		return	path;
		
	}
	
})( window );
