(function( window ){
	
	'use strict';
	
	const	SQUARESIZE	= 12,
			
			//
			//	bitmask flags
			//
			NORTH	= 1,
			EAST	= 2,
			SOUTH	= 4,
			WEST	= 8,
			VISITED	= 16;
	
	
	document.body.addEventListener(
		'linesInitialised',
		function( evt ) {
			
			initialise( evt.detail );
			
		}
	);
	
	
	function initialise( canvas ) {
		
		let	path	= canvas.addPath();
		
		
		//
		//	work out how many squares we need to fill the screen
		//
		let	height	= Math.floor( canvas.dims.height / SQUARESIZE ),
			width	= Math.floor( canvas.dims.width / SQUARESIZE ),
			
			squarecount	= height * width,
			startPoint,
			word,
			
			squares		= [],
			incomplete	= [];
		
		//
		//	populate the squares array with empty bitmasks
		//
		for (
			let	i	= 0;
			i	< squarecount;
			i++
		) {
			
			let	sq	= 0;
			
			//
			//	the squares along the edges need to have
			//	certain directions blocked off to start,
			//	as the line can't go that way
			//
			
			// top edge
			if ( i < width ) {
				
				sq	= sq | NORTH;
				
			}
			
			// bottom edge
			if ( i >= width * ( height - 1 ) ) {
				
				sq	= sq | SOUTH;
				
			}
			
			// left edge
			if ( i % width === 0 ) {
				
				sq	= sq | WEST;
				
			}
			
			// right edge
			if ( ( i + 1 ) % width === 0 ) {
				
				sq	= sq | EAST;
				
			}
			
			squares.push(
				sq
			);
			
		}
		
		
		startPoint	= 3 + width;// Math.floor( ( ( height / 2 ) + 0.5 ) * width );
		
		//
		//	mark the startpoint as VISITED
		//
		squares[ startPoint ]	= squares[ startPoint ] | VISITED;
		
		incomplete.push( startPoint );
		
		
		//
		//	start the recursive backtracker
		//
		recurse( path, '', width, squares, incomplete, startPoint,
			[
				// start H
				[ SOUTH, width ],
				[ SOUTH, width ],
				[ SOUTH, width ],
				[ WEST, -1 ],
				[ NORTH, -width ],
				[ NORTH, -width ],
				[ NORTH, -width ],
				[ WEST, -1 ],
				[ SOUTH, width ],
				[ SOUTH, width ],
				[ SOUTH, width ],
				[ SOUTH, width ],
				[ SOUTH, width ],
				[ SOUTH, width ],
				[ EAST, 1 ],
				[ NORTH, -width ],
				[ NORTH, -width ],
				[ EAST, 1 ],
				[ SOUTH, width ],
				[ SOUTH, width ],
				[ EAST, 1 ],
				[ NORTH, -width ],
				[ NORTH, -width ],
				[ NORTH, -width ],
				[ NORTH, -width ],
				[ NORTH, -width ],
				// end H
				[ EAST, 1 ],
				// start I
				[ EAST, 1 ],
				[ SOUTH, width ],
				[ SOUTH, width ],
				[ SOUTH, width ],
				[ SOUTH, width ],
				[ WEST, -1 ],
				[ SOUTH, width ],
				[ EAST, 1 ],
				[ EAST, 1 ],
				[ EAST, 1 ],
				[ NORTH, -width ],
				[ WEST, -1 ],
				[ NORTH, -width ],
				[ NORTH, -width ],
				[ NORTH, -width ],
				[ NORTH, -width ],
				[ EAST, 1 ],
				[ NORTH, -width ],
				[ WEST, -1 ],
				[ WEST, -1 ],
				[ WEST, -1 ],
				[ WEST, -1 ]
				// end I
			].reverse()
		);
		
	}
	
	
	
	function recurse( path, pathStr, width, squares, incomplete, current, word ) {
		console.log( current, word );
		let	currentSq	= squares[ current ],
			
			neighbours,
			
			target, targetDir, targetIdx, targetSq;
		
		
		if ( ! word || ! word.length ) {
			
			neighbours	= getAvailableNeighbours( squares, width, current, currentSq );
			
		} else {
			
			let	next	= word.pop();
			
			neighbours	= [[ next[ 0 ], current + next[ 1 ] ]];
			
		}
		
		
		//
		//	set the initial pathStr move command
		//
		if ( ! pathStr ) {
			
			pathStr	= 'M' + getSquarePositionString( current, width );
			
		}
		
		
		//
		//	if there are availables squares adjacent to the
		//	current one we target one of those at random
		//
		if ( neighbours.length ) {
			
			target	= neighbours[ Math.floor( Math.random() * neighbours.length ) ];
			
			targetDir	= target[ 0 ];
			
			targetIdx	= target[ 1 ];
			
			targetSq	= squares[ targetIdx ];
			
			
			//
			//	set the direction flag for the current & target squares
			//	to show that way has been done, and the VISITED flag on
			//	the target to prevent loops
			//
			squares[ current ]	= currentSq | targetDir;
			
			squares[ targetIdx ]	= targetSq | ( targetDir > EAST ? targetDir >> 2 : targetDir << 2 ) | VISITED;
			
			
			incomplete.push( targetIdx );
			
			
			//
			//	add the target square's coords to the path string & draw
			//
			pathStr	+= ' ' + getSquarePositionString( targetIdx, width );
			
			path.setAttribute( 'd', pathStr );
			
			//
			//	RECURSE!
			//
			//requestAnimationFrame(
			setTimeout(
				function() {
					
					recurse( path, pathStr, width, squares, incomplete, targetIdx, word );
					
				}
			);
			
		//
		//	no available targets, pick a new start point at random
		//
		} else if ( incomplete.length ) {
			
			incomplete.splice( incomplete.indexOf( current ), 1 );
			
			
			targetIdx	= incomplete[ Math.floor( Math.random() * incomplete.length ) ];
			
			
			if ( targetIdx === targetIdx * 1 ) {	// === so that 0 (zero) doesn't break it
				
				pathStr	+= ' M' + getSquarePositionString( targetIdx, width );
								
			}
			
			//
			//	RECURSE!
			//
			//	N.B.	there is a chance that by not yielding to the browser
			//			this recursion will blow the call stack, but it's a
			//			trade-off for improved performance
			//
			recurse( path, pathStr, width, squares, incomplete, ( targetIdx === targetIdx * 1 ) ? targetIdx : current );
			
		} else {
			
			path.setAttribute( 'd', pathStr );
			
		}
		
	}
	
	
	
	function getAvailableNeighbours( squares, width, current, currentSq ) {
		
		let	neighbours	= [],
			
			north	= current - width,
			south	= current + width,
			east	= current + 1,
			west	= current - 1;
		
		if (
			! ( currentSq & NORTH )
			&&
			! ( squares[ north ] & VISITED )
		) {
			
			neighbours.push( [ NORTH, north ] );
			
		}
		
		if (
			! ( currentSq & SOUTH )
			&&
			! ( squares[ south ] & VISITED )
		) {
			
			neighbours.push( [ SOUTH, south ] );
			
		}
		
		if (
			! ( currentSq & EAST )
			&&
			! ( squares[ east ] & VISITED )
		) {
			
			neighbours.push( [ EAST, east ] );
			
		}
		
		if (
			! ( currentSq & WEST )
			&&
			! ( squares[ west ] & VISITED )
		) {
			
			neighbours.push( [ WEST, west ] );
			
		}
		
		return	neighbours;
		
	}
	
	
	
	function getSquarePosition( idx, width ) {
		
		let	y	= Math.floor( idx / width ),
			x	= idx - ( y * width );
		
		return	{
					x	: x,
					y	: y
				};
		
	}
	
	function getSquarePositionString( idx, width ) {
		
		let	targetPosn	= getSquarePosition( idx, width );
		
		return	( ( targetPosn.x * SQUARESIZE ) + ( SQUARESIZE / 2 ) )
				+ ','
				+ ( ( targetPosn.y * SQUARESIZE ) + ( SQUARESIZE / 2 ) );
		
	}
	
})( window );
