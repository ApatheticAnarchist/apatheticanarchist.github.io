(function(){
	
	'use strict';
	
	// TODO export properly
	window[ 'Dragon' ]	= window[ 'Dragon' ] || {};
	
	
	const	MAXITERS	= 11,
			
			LINELENGTH	= 8;
	
		
	function onMessage( resolve, reject ) {
		
		return	
		
	};
	
	function getDragon( iters, { rotation } ) {
		
		let	worker	= new Worker( '/js/fractal/dragon-worker.js' ),
			res, rej;
		
		worker.onmessage	= ( msg ) => {
								
								const	points	= msg.data.points;
								
								res(
									{
										points,
										center	: [
													points[ points.length - 2 ],
													points[ points.length - 1 ]
												]
									}
								);
								
							};
		
		return	new Promise(
			( resolve, reject ) => {
				
				res	= resolve;
				rej	= reject;
				
				worker.postMessage(
					{
						iters		: iters || MAXITERS,
						rotation	: rotation || 0
					}
				);
				
			}
		);
		
	}
	
	window.getDragon	= getDragon;
	
	
	
	function getSvgPath( points, start, canvas, dims, lineLength = LINELENGTH ) {
		
		let	center	= [
						dims.centreX - ( start[ 0 ] * lineLength ),
						dims.centreY - ( start[ 1 ] * lineLength ) - lineLength
					];
		
		let	g		= document.createElementNS( window.svg.SVG_NS, 'g' ),
			path	= document.createElementNS( window.svg.SVG_NS, 'path' );
		
		this.element	= g;
		this.path		= path;
		
		path.setAttribute( 'd', getPathString( points, center, lineLength ) );
		
		return	path;
		
	}
	
	Dragon[ 'svgPath' ]	= getSvgPath;
	
	
	function getPathString( points, center, lineLength = LINELENGTH ) {
		
		if ( ! points[ 0 ].join ) {
			
			const	reducer	= ( pt, idx ) => {
								
								return	getPointScreenPosition( pt, idx, lineLength, center );
								
							};
			
			return	'M' + center[ 0 ] + ',' + center[ 1 ]
					+ 'L' + points.map( reducer ).join( ' ' );
			
		}else{
			
			const	reducer	= ( pt ) => {
								
								if ( pt[ 0 ] && pt[ 1 ] ) {
									
									return	'M' +
											getPointScreenPosition( pt[ 0 ][ 0 ], 0, lineLength, center )
											+ ' ' +
											getPointScreenPosition( pt[ 0 ][ 1 ], 1, lineLength, center )
											+ 'L' +
											getPointScreenPosition( pt[ 1 ][ 0 ], 0, lineLength, center )
											+ ' ' +
											getPointScreenPosition( pt[ 1 ][ 1 ], 1, lineLength, center )
									
								}
								
							};
			console.log( points );
			return	points.map( reducer ).join( '' );
		}
	}
	
	Dragon[ 'svgString' ]	= getPathString;
	
	function getPointScreenPosition( raw, idx, lineLength, center ) {
		
		return	raw * lineLength + ( ( idx % 2 ) ? center[ 1 ] : center[ 0 ] );
		
	}
	
	
	function getSimplifiedPath( points ) {
		
		let	_mergingX	= {},
			_mergingY	= {};
		
		for ( let i = 0, l = points.length; i < l; i = i + 2 ) {
			
			let	x	= points[ i ],
				y	= points[ i + 1 ];
			
			_mergingX[ x ]	= _mergingX[ x ] || [];
			_mergingY[ y ]	= _mergingY[ y ] || [];
			
			_mergingX[ x ].push( [ x, y ] );
			_mergingY[ y ].push( [ x, y ] );
			
		}
		
		let	cols	= [];
		
		for ( let x in _mergingX ) {
			
			let	col	= _mergingX[ x ].slice();
			
			cols	= cols.concat( mergePoints( col, 1, x * 1 ) );
			
		}
		
		for ( let y in _mergingY ) {
			
			let	col	= _mergingY[ y ].slice();
			
			cols	= cols.concat( mergePoints( col, 0, y * 1 ) );
			
		}
		
		return	cols;
		
	}
	
	Dragon[ 'simplify' ]	= getSimplifiedPath;
	
	function mergePoints( merging, idx, val ) {
		
		let	cols	= [];
		
		const	mMap	= mergeMap( idx );
		
		let	col	= new Set( merging.map( mMap ).sort( mergeSort ) );
		
		let	current	= [];
		
		col.forEach(
			( alt ) => {
				
				let	prev	= alt - 1,
					next	= alt + 1,
					
					coords	= [];
				
				coords[ idx ]				= alt;
				coords[ 1 - ( idx % 2 ) ]	= val;
				
				if (
					! col.has( prev )
				) {
					
					current	= [];
					current.push( coords );
					
				}
				
				if (
					! col.has( next )
				) {
					
					current.push( coords );
					cols.push( current );
					current	= [];
					
				}
				
			}
		);
		
		return	cols;
		
	}
	
	const	mergeMap	= ( idx ) => { return ( pt ) => { return pt[ idx ] } };
	const	mergeSort	= ( a, b ) => { return ( a > b ) };
	
}());	
