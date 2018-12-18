(function(){
	
	'use strict';
	
	var	SVG_NS	= 'http://www.w3.org/2000/svg';
	
	
	
	document.addEventListener(
		'DOMContentLoaded',
		function() {
			
			var	t;
			
			getSVG(
				'/sun.svg',
				drawRoad
			);
			
			// debounced resize listener
			window.addEventListener(
				'resize',
				function() {
					
					clearTimeout( t );
					
					t	= setTimeout(
							sizeSVG,
							25
						);
					
				}
			);
			
		}
	);
	
	
	
	function getSVG( path, then ) {
		
		fetch(
			path
		).then(
			function( res ) {
				
				res.text().then(
					function( str ) {
						
						document.body.innerHTML	= document.body.innerHTML + str;
						
						sizeSVG();
						
						then && then( str, path );
						
					}
				);
				
			}
		);
		
	}
	
	
	
	function sizeSVG() {
		
		var	svg	= document.querySelector( 'svg' ),
			g	= svg.querySelector( '.everything' ),
			vb	= svg.getAttribute( 'data-viewBox' ) || svg.getAttribute( 'viewBox' ),
			
			wh	= window.innerHeight,
			ww	= window.innerWidth,
			
			ox;
		
		svg.setAttribute( 'data-viewBox', vb );
		
		vb	= vb.split( ' ' );
		
		ox	= vb[ 2 ];
		
		if ( ww > wh ) {
			
			vb[ 2 ]	= Math.round( vb[ 2 ] * ( ww / wh ) );
			
		}
		
		g.setAttribute(
			'transform',
			'translate(' + Math.round( ( vb[ 2 ] - ox ) / 2 ) + ', 0)'
		);
		
		console.log( Math.round( ( vb[ 2 ] - ox ) / 2 ) );
		
		svg.setAttribute( 'viewBox', vb.join( ' ' ) );
		
		svg.setAttribute( 'width', ww );
		
	}
	
	
	
	function drawRoad() {
			
		var	path	= document.querySelector( '.JS_gridroad' ),
			newPath,
			str		= '',
			arr		= [],
			
			height	= 256,
			width	= 256,
			
			cy		= 128,
			cx		= 128,
			
			h		= 32,
			i, j, k;
		
		// lines along
		for (
			var	i = -cx, l = cx;
			i <= l;
			i += cx / 4
		) {
			
			arr.push(
				[
					( i / 0.25 ) + 128,
					256
				],
				[
					128,
					128
				]
			);
			
		}
		
		// along lines
		for (
			j = 0.5, k = 8;
			j <= k;
			j += 0.33
		) {
			
			arr.push(
				[
					( -128 / j ) + 128,
					( h / j ) + 128
				],
				[
					( 128 / j ) + 128,
					( h / j ) + 128
				]
			);
			
		}
		
		arr.forEach(
			function( p, idx ) {
				
				if ( ! ( idx % 2 ) ) {
					
					str	+= 'M' + Math.ceil( p[ 0 ] ) + ' ' + Math.round( p[ 1 ] );
					
				} else {
					
					str	+= ' ' + Math.floor( p[ 0 ] ) + ' ' + Math.round( p[ 1 ] );
					
				}
				
			}
		);
		
		path.setAttribute( 'd', str );
		
		newPath	= path.cloneNode();
		
		newPath.setAttribute( 'filter', 'url(#smallglow)' );
		
		path.parentNode.appendChild( newPath );
		
	}
	
}());
