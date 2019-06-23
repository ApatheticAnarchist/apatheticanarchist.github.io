function findShapeCentre( shape, dimensionality ) {
	
	let	d		= dimensionality,
		sums	= [],
		count	= shape.length / d;
	
	( shape || shape ).forEach(
		function( n, idx ) {
			
			let	i	= idx % d;
			
			if ( sums[ i ] ) {
				
				sums[ i ]	+= n;
				
			} else {
				
				sums[ i ]	= n;
				
			}
			
		}
	);
	
	return	sums.map(
		function( n ) {
			
			return	n / count;
			
		}
	);
	
}


function find3DPolygonNormal( poly ) {
	
	let	p1x	= poly[ 0 ],
		p1y	= poly[ 1 ],
		p1z	= poly[ 2 ],
		p2x	= poly[ 3 ],
		p2y	= poly[ 4 ],
		p2z	= poly[ 5 ],
		p3x	= poly[ 6 ],
		p3y	= poly[ 7 ],
		p3z	= poly[ 8 ],
		
		i1	= p2x - p1x,
		j1	= p2y - p1y,
		k1	= p2z - p1z,
		i2	= p2x - p3x,
		j2	= p2y - p3y,
		k2	= p2z - p3z,
		
		i	= ( j1 * k2 ) - ( k1 * j2 ),
		j	= ( k1 * i2 ) - ( i1 * k2 ),
		k	= ( i1 * j2 ) - ( j1 * i2 ),
		
		max	= Math.max(
				Math.abs( i ),
				Math.abs( j ),
				Math.abs( k )
			);
	
	return	[
				i / max,
				j / max,
				k / max
			];
	
}



function scaleShape( shape, scaleFactor ) {
	
	shape.forEach(
		function( n, idx ) {
			
			shape[ idx ]	= n * scaleFactor;
			
		}
	);
	
}



function translateShape( shape, dimensionality, distances ) {
	
	shape.forEach(
		function( n, idx ) {
			
			let	i		= idx % dimensionality,
				dist	= distances[ i ];
			
			if ( dist ) {
				
				shape[ idx ]	+= dist;
				
			}
			
		}
	);
	
}



function rotateShape( shape, dimensionality, theta, centre ) {
	
	switch ( dimensionality ) {
		
		case	3:
			rotate3DShape( shape, theta, centre );
			break;
		
		default:
			throw ( 'Not implemented' );
			break;
		
	}
	
}

function rotate3DShape( shape, theta, centre ) {
	
	if ( ! centre || ! centre.length ) {
		
		// N.B.	could potentially call an optimised `find3DShapeCentre`
		centre	= findShapeCentre( shape, 3 );
		
	}
	
	let	cx	= centre[ 0 ] || 0,
		cy	= centre[ 1 ] || 0,
		cz	= centre[ 2 ] || 0,
		
		pitch	= theta[ 0 ],
		yaw		= theta[ 1 ],
		roll	= theta[ 2 ],
		
		matrix;
	
	//
	//	build up the 3x3 rotation matrix
	//
	if ( pitch ) { // rotate on x
		
		let	sinP	= Math.sin( pitch ),
			cosP	= Math.cos( pitch );
		
		matrix	= [
					[ 1, 0, 0 ],
					[ 0, cosP, -sinP ],
					[ 0, sinP, cosP ]
				];
		
	}
	
	if ( yaw ) {	// rotate on y
		
		let	sinY	= Math.sin( yaw ),
			cosY	= Math.cos( yaw );
		
		if ( matrix ) {
			
			matrix	= multMatrices3x3(
						matrix,
						[
							[ cosY, 0, sinY ],
							[ 0, 1, 0 ],
							[ -sinY, 0, cosY ]
						]
					);
			
		} else {
			
			matrix	= [
						[ cosY, 0, sinY ],
						[ 0, 1, 0 ],
						[ -sinY, 0, cosY ]
					];
			
		}
		
	}
	
	if ( roll ) {	// rotate on z
		
		let	sinR	= Math.sin( roll ),
			cosR	= Math.cos( roll );
		
		if ( matrix ) {
			
			matrix	= multMatrices3x3(
						matrix,
						[
							[ cosR, -sinR, 0 ],
							[ sinR, cosR, 0 ],
							[ 0, 0, 1 ]
						]
					);
			
		} else {
			
			matrix	= [
						[ cosR, -sinR, 0 ],
						[ sinR, cosR, 0 ],
						[ 0, 0, 1 ]
					];
			
		}
		
	}
	
	if ( matrix ) {
		
		newShape	= [];
		
		for (
			let	n = shape.length,
				i = 0;
			i < n;
			i += 3
		) {
			
			let	x	= shape[ i ] - cx,
				y	= shape[ i + 1 ] - cy,
				z	= shape[ i + 2 ] - cz;
			
			newShape[ i ]		= cx + ( x * matrix[ 0 ][ 0 ] ) + ( y * matrix[ 1 ][ 0 ] ) + ( z * matrix[ 2 ][ 0 ] );
			newShape[ i + 1 ]	= cy + ( x * matrix[ 0 ][ 1 ] ) + ( y * matrix[ 1 ][ 1 ] ) + ( z * matrix[ 2 ][ 1 ] );
			newShape[ i + 2 ]	= cz + ( x * matrix[ 0 ][ 2 ] ) + ( y * matrix[ 1 ][ 2 ] ) + ( z * matrix[ 2 ][ 2 ] );
			
		}
		
		return	newShape;
		
	}
	
	return	shape;	// TODO	this should be pure and not modify the existing array
					//		could also use the matrix fn to concat to newShape then
	
}



function get3d2dProjection( points ) {
	
	// super simple version
	let	ez	= 100;
	
	// need to get each face's centre of mass
	// so we can z order
	//
	// DEPRECATED HERE, DONE AT ANOTHER STEP
	//let	centre	= findShapeCentre( shape, 3 );
		
	let	face	= [];
	
	for (
		let	n = points.length,
			i = 0;
		i < n;
		i += 3	// 3d
	) {
		
		let	x	= points[ i ],
			y	= points[ i + 1 ],
			z	= points[ i + 2 ]
		
		face.push(
			[
				( ez / z ) * x,
				( ez / z ) * y,
				z	// keep track of z, it might come in handy I guess
			]
		);
		
	}
	
	return	face;
	
}

//
//	https://www.gamedev.net/forums/topic/543708-depth-sorting-polygons-and-obliquecabinet-projection/
//
//	rather than simply comparing z coords we
//	have to order by the "real" distance, taking
//	account of x/y distance too
//
//	N.B.	this actually returns the SQUARE OF THE
//			DISTANCE, as it's quicker to compute
//
function calc3dViewlineDistance( x, y, z ) {
	
	// a^2 + b^2 = c^2
	//
	//	so we basically do that twice (for x and y)
	//
	//	N.B.	don't need to sqrt I dont think,
	//			as the magnitude of the distances
	//			should still be in the correct
	//			order { n^2 > (n-1)^2 for n > 0 }
	//
	
	let	dist	= ( x * x ) + ( z * z ) + ( y * y );
	
	// handle negative z (squaring will lose that)
	if ( z < 0 ) {
		
		dist	*= -1;
		
	}
	 
	return	dist;
	
}


/*
 * [
 * 	[ 0, 1, 2 ] // 0,n
 * 	[ 0, 1, 2 ] // 1,n
 * 	[ 0, 1, 2 ] // 2,n
 * ]
 */
function multMatrices3x3( a, b ) {
	
	return	[
		[
			( a[ 0 ][ 0 ] * b[ 0 ][ 0 ] )
			+ ( a[ 0 ][ 1 ] * b[ 1 ][ 0 ] )
			+ ( a[ 0 ][ 2 ] * b[ 2 ][ 0 ] ),
			
			( a[ 0 ][ 0 ] * b[ 0 ][ 1 ] )
			+ ( a[ 0 ][ 1 ] * b[ 1 ][ 1 ] )
			+ ( a[ 0 ][ 2 ] * b[ 2 ][ 1 ] ),
			
			( a[ 0 ][ 0 ] * b[ 0 ][ 2 ] )
			+ ( a[ 0 ][ 1 ] * b[ 1 ][ 2 ] )
			+ ( a[ 0 ][ 2 ] * b[ 2 ][ 2 ] )
		],
		[
			( a[ 1 ][ 0 ] * b[ 0 ][ 0 ] )
			+ ( a[ 1 ][ 1 ] * b[ 1 ][ 0 ] )
			+ ( a[ 1 ][ 2 ] * b[ 2 ][ 0 ] ),
			
			( a[ 1 ][ 0 ] * b[ 0 ][ 1 ] )
			+ ( a[ 1 ][ 1 ] * b[ 1 ][ 1 ] )
			+ ( a[ 1 ][ 2 ] * b[ 2 ][ 1 ] ),
			
			( a[ 1 ][ 0 ] * b[ 0 ][ 2 ] )
			+ ( a[ 1 ][ 1 ] * b[ 1 ][ 2 ] )
			+ ( a[ 1 ][ 2 ] * b[ 2 ][ 2 ] )
		],
		[
			( a[ 2 ][ 0 ] * b[ 0 ][ 0 ] )
			+ ( a[ 2 ][ 1 ] * b[ 1 ][ 0 ] )
			+ ( a[ 2 ][ 2 ] * b[ 2 ][ 0 ] ),
			
			( a[ 2 ][ 0 ] * b[ 0 ][ 1 ] )
			+ ( a[ 2 ][ 1 ] * b[ 1 ][ 1 ] )
			+ ( a[ 2 ][ 2 ] * b[ 2 ][ 1 ] ),
			
			( a[ 2 ][ 0 ] * b[ 0 ][ 2 ] )
			+ ( a[ 2 ][ 1 ] * b[ 1 ][ 2 ] )
			+ ( a[ 2 ][ 2 ] * b[ 2 ][ 2 ] )
		]
	];
	
}

