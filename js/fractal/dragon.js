(function(){
	
	'use strict';
	
	let	worker	= new Worker( '/js/fractal/dragon-worker.js' ),
		
		maxIters	= 11,
		
		CENTER		= null,
		center		= null,
		lineLength	= 6;
		
	function onMessage( res ) {
		
		let	points	= res.data;
		
		center	= [
						CENTER[ 0 ] - ( points[ points.length - 2 ] * lineLength ),
						CENTER[ 1 ] - ( points[ points.length - 1 ] * lineLength ) - lineLength
					];
				
		let	pathStr	= 'M' + center[ 0 ] + ',' + center[ 1 ]
					+ 'L' + res.data
								.map( getPointScreenPosition )
								.join( ' ' );
		
		let	g		= document.createElementNS( window.svg.SVG_NS, 'g' ),
			path	= document.createElementNS( window.svg.SVG_NS, 'path' );
		
		path.setAttribute( 'd', pathStr );
		path.setAttribute( 'stroke-width', 1 );
		path.setAttribute( 'stroke-dasharray', path.getTotalLength() );
		path.setAttribute( 'stroke-dashoffset', path.getTotalLength() );
		
		g.setAttribute( 'class', 'wheel-node' );
		
		g.appendChild( path );
		document.querySelector( '.wheel-canvas' ).appendChild( g );
		
		setTimeout(function(){
			g.setAttribute( 'class', 'wheel-node show' );
		},200);
		
	};
	
	worker.onmessage	= onMessage;
	
	
	function getPointScreenPosition( raw, idx ) {
		
		return	raw * lineLength + ( ( idx % 2 ) ? center[ 1 ] : center[ 0 ] );
		
	}
	
	
	window.goDragon	= function( screenSize ) {
		
		CENTER	= [ screenSize[ 0 ] + 0.5, screenSize[ 1 ] + 0.5 ];
		
		worker.postMessage(
			{
				iters		: maxIters,
				rotation	: 0,
				//center		: [ maxIters-1, maxIters-1 ]
			}
		);
		worker.postMessage(
			{
				iters	: maxIters,
				rotation	: 1,
				//center		: [ maxIters-1, -maxIters+1 ]
			}
		);
		
	};
	
}());	
