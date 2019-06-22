(function( window ){
	
	'use strict';
	
	/*document.addEventListener(
		'DOMContentLoaded',*/
	window.addEventListener(
		'load',
		function() {
			
			window.svg.initialiseCanvas();
			
			//window.svg.loadIcons( '/img/svg/icons.svg' );
			
		}
	);
	
	document.body.addEventListener(
		'canvasInitialised',
		canvasInitialised
	);
	
	function canvasInitialised( evt ) {
		
		const	dims	= evt.detail.dims,
				canvas	= evt.target,
				//wheel	= window.wheel.initialise( canvas, dims ),
				dragon	= getDragon( 13, { rotation : 1 } ),
				grid	= generateHexGrid( 16, dims.width,  dims.height );	// TODO workerise
		
		dragon.then(
			function( { points, center } ) {
				
				let	drawPath	= Dragon.svgPath(
									points,
									center,
									canvas,
									dims
								),
					maskPath	= Dragon.svgPath(
									Dragon.simplify( points ),	// TODO workerise
									center,
									canvas,
									dims
								),
					
					hexPath		= drawHexGrid( canvas, grid ),
					
					mask		= document.getElementById( 'foregroundOutlines' ),
					
					txt			= document.createElementNS( window.svg.SVG_NS, 'text' );
				
				txt.textContent	= 'Demo Title';
				txt.setAttribute( 'font-size', 64 );
				txt.setAttribute( 'font-family', 'Hybrid, NamskoutIn, Matematica, PP Handwriting, Metal on Metal, NamskoutIn' );
				txt.setAttribute( 'stroke', 'url(#blue-pink)' );
				txt.setAttribute( 'stroke-width', 3 );
				txt.setAttribute( 'fill', 'url(#blue-pink)' );
				txt.setAttribute( 'fill-opacity', 0.25 );
				txt.setAttribute( 'filter', 'url(#smallglow) drop-shadow( 0 0 5px black )' );
				txt.setAttribute( 'x', '100' );
				txt.setAttribute( 'y', '90%' );
				
				
				canvas.appendChild( txt );
				
				mask.appendChild( maskPath );
				
				setTimeout( () => {
					
					//document.querySelector( '.JS_content' ).classList.add( 'show' );
					drawPath.setAttribute( 'class', 'dragon show' );
					maskPath.setAttribute( 'class', 'dragon show' );
					hexPath.setAttribute( 'class', 'hexgrid show' );
					
				}, 250 );
				
			}
		);
		
	}
	
})( window );
