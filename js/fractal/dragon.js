(function(){
	
	'use strict';
	
	let	worker	= new Worker( '/js/fractal/dragon-worker.js' ),
		arg		= null,
		max		= 15,
		center	= null;
		
	function onMessage( res ) {
		
		let	points	= res.data,
			pathStr	= 'M' + center[ 0 ] + ',' + center[ 1 ]
					+ 'L' + points.join( ' ' );
		
		let	g		= document.createElementNS( window.svg.SVG_NS, 'g' ),
			path	= document.createElementNS( window.svg.SVG_NS, 'path' );
		
		path.setAttribute( 'd', pathStr );
		//path.setAttribute( 'stroke-width', 1 );
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
	
	window.goDragon	= function( c ) {
	
	center	= [ c[ 0 ]/* + 0.5*/, c[ 1 ]/* + 0.5*/ ];
	
	worker.postMessage(
		{
			iters	: max,
			center	: center
		}
	);
	
	};
	
}());	
