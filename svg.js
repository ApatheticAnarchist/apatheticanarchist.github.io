(function(){
	
	'use strict';
	
	var	SVG_NS	= 'http://www.w3.org/2000/svg';
	
	
	
	document.addEventListener(
		'DOMContentLoaded',
		function() {
			
			getSVG(
				'/sun.svg',
				drawRoad
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
						
						then && then( str, path );
						
					}
				);
				
			}
		);
		
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
			j += 0.5
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
					
					str	+= 'M' + Math.round( p[ 0 ] ) + ' ' + Math.round( p[ 1 ] );
					
				} else {
					
					str	+= ' ' + Math.round( p[ 0 ] ) + ' ' + Math.round( p[ 1 ] );
					
				}
				
			}
		);
		
		path.setAttribute( 'd', str );
		
		newPath	= path.cloneNode();
		
		newPath.setAttribute( 'filter', 'url(#smallglow)' );
		
		path.parentNode.appendChild( newPath );
		
	}
	
}());
