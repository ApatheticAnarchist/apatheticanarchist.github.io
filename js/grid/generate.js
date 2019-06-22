'use strict';

function drawHexGrid( canvas, grid, others ) {
	
	let	frag	= document.createDocumentFragment(),
		g		= document.createElementNS( window.svg.SVG_NS, 'g' );
	
	let	str	= 'M' + grid[ 0 ].edges[ 0 ][ 0 ][ 0 ] + ' ' + grid[ 0 ].edges[ 0 ][ 0 ][ 1 ];;
	
	grid.forEach(
		( pt ) => {
			
			let	substr	= ''
			
			pt.edges.forEach(
				( edge, i ) => {
					
					let	ss	= '';
					
					ss	+=( i ? 'L' : 'M' ) + edge[ 0 ][ 0 ] + ' ' + edge[ 0 ][ 1 ];
					
					substr	+= ss;
					
				}
			);
			
			str	+= substr;
			
		}
	);
	
	let	def	= document.createElementNS( window.svg.SVG_NS, 'path' );
	
	def.setAttribute( 'd', str );
	def.setAttribute( 'class', 'default' );
	
	g.appendChild( def );
	g.appendChild( frag );
	
	g.setAttribute( 'class', 'hexgrid' );
	
	canvas.appendChild( g );
	
	return	g;
	
}


function generateHexGrid( blocksize = 16, width = 640, height = 480 ) {
	
	const	cos30	= Math.cos( Math.PI / 6 ),
			dims	= getScaleFromDimensions(
						blocksize,
						width,
						height,
						{
							xMod	: 1,
							yMod	: cos30,
							xOffset	: 8,
							yOffset	: 0
						}
					);
	
	const	pts	= getHexPoints( dims );
		
	let	arr		= [];
	
	for ( let i = 0, l = dims.scale; i < l; i++ ) {
		
		let	{ x, y }	= getXYFromI( i, dims.x ),
			iscentre	= getIsCentreOrVertex( x, y );
		
		if ( iscentre ) {
			
			/*
			 *   1--2
			 *  / \/ \
			 * 6--()--3
			 *  \ /\ /
			 *   5--4
			 */
			
			let obj	= { c : pts[ i ], edges : [] },
				
				edges	= [
					// 1
					x !== dims.x - 1
						? y % 2 ? pts[ i - dims.x + 1 ] : pts[ i - dims.x ]
						: null,
					// 2
					x !== 0
						? y % 2 ? pts[ i - dims.x ] : pts[ i - dims.x - 1 ]
						: null,
					// 3
					x !== 0 ? pts[ i - 1 ] : null,
					// 4
					x !== 0
						? y % 2 ? pts[ i + dims.x ] : pts[ i + dims.x - 1 ]
						: null,
					// 5
					x !== 0
						? y % 2 ? pts[ i + dims.x + 1 ] : pts[ i + dims.x ]
						: null,
					// 6
					x !== dims.x - 1 ? pts[ i + 1 ] : null
				];
			
			edges.forEach(
				( edge, j ) => {
					
					const	next	= edges[ ( j + 1 ) % 6 ];
					
					if ( edge && next ) {
						
						obj.edges.push( [ edge, next ] );
						
					}
					
				}
			);
			
			arr.push(
				obj
			);
			
		}
		
	}
		
	return	arr;
	
	
	/*return	gridifyHexPoints(
				getHexPoints( dims, invert ),
				dims
			);*/
	
}

function getScaleFromDimensions(
	blocksize,
	width,
	height,
	opts
) {
	
	let	{ xMod = 1, yMod = 1, xOffset = 0, yOffset = 0 }	= opts;
	
	let	x	= Math.floor( width / ( blocksize * xMod ) ),
		y	= Math.floor( height / ( blocksize * yMod ) );
	
	// add extras and then centralise
	//
	// N.B.	I don't know why it needs so many extra rows, should only be
	//		a couple per hex but apparently not
	x	= x + 25;
	xOffset	= xOffset + ( ( width - ( x * xMod * blocksize ) ) / 2 );
	console.log( xOffset );
	y	= y + 25;
	yOffset	= yOffset + ( ( height - ( y * yMod * blocksize ) ) / 2 );
	
	return	{
				blocksize,
				x,
				y,
				xMod,
				yMod,
				xOffset,
				yOffset,
				scale	: x * y
			}
	
}

function getXYFromI( i, colcount ) {
	
	const	y	= Math.floor( i / colcount );	// divide total `i` by `colcount` to get row number
	
	return	{
		y,
		x	: i - ( y * colcount )	// column number is total minus ( row number times colcount )
	}
	
}

function getIsCentreOrVertex( x, y ) {
	
	return	! (
				( y % 2 && x % 3 )
				||
				( ! ( y % 2 ) && ( x + 1 ) % 3 )
			);
	
}

function getHexPoints( dims ) {
	
	let	arr	= [];
	
	for ( let i = 0, l = dims.scale; i < l; i++ ) {
		
		let	{ x, y }	= getXYFromI( i, dims.x );
		
		arr.push(
			[
				dims.xOffset
					+ ( x * dims.xMod * dims.blocksize )
					+ ( y % 2 ? dims.blocksize / 2 : 0 ),	// extra offset ever other row
				dims.yOffset
					+ ( y * dims.yMod * dims.blocksize )
			]
		);
		
	}
	
	return	arr;
	
}

function gridifyHexPoints( points, dims ) {
	
	let	arr	= [];
	
	points.forEach(
		( pt, i ) => {
			
			let	obj			= { pt, edges : [] };
			
			const	{ x, y }	= getXYFromI( i, dims.x );
			arr.push( pt );
			if ( y % 2 && ( x % 3 ) === 1 ) {
				
				
				
			}
			
		}
	);
	
	return	points;
	
}

/*
function generateTriGrid( dims ) {
	
	let	arr	= [];
	
	for ( let i = 0, l = dims.scale; i < l; i++ ) {
		
		let	y	= Math.floor( i / dims.x ),	// divide total `i` by rowcount `x` to get row number
			x	= i - ( y * dims.x );		// column number is total minus ( row number times rowcount )
		
		arr.push(
			[
				( x * dims.xMod * dims.blocksize )
					+ ( y % 2 ? dims.blocksize / 2 : 0 ),	// offset ever other row
				y * dims.yMod * dims.blocksize
			]
		);
		
	}
	
	return	arr;
	
};
*/
