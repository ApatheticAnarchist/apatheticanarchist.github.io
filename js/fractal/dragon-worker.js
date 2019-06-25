'use strict';

const	parts		= {
						'X'	: [ 'X', '+', 'Y', 1 ],
						'Y'	: [ 1, 'X', '-', 'Y' ]
					},
		startPart	= [ 1, 'X' ],
		
		angles	= [
					[ 1, 0 ],
					[ 0, -1 ],
					[ -1, 0 ],
					[ 0, 1 ]
				];


/*
 * message handler (worker entry point)
 */
function onMessage( res ) {
	
	// default iteration count
	let	maxRecurse	= 5;
	
	// if res.data.iters exists and is numeric use that
	// as the iteration count
	if ( res && res.data && res.data.iters === res.data.iters * 1 ) {
		
		maxRecurse	= res.data.iters;
		
	}
	
	let	points	= pathifyOutput(
					recurse(
						startPart,
						0,
						maxRecurse
					).filter(
						cleanOutput_filter
					),
					res && res.data && res.data.center || [ 0, 0 ],
					res && res.data && res.data.rotation || 0,
					res && res.data && res.data.lineLength || 1
				);
	//console.log( points );
	postMessage( { points } );
	
}
onmessage	= onMessage;



/*
 * run the l-system to generate the points
 */
function recurse( input, count, maxCount ) {
	
	let	output	= iterate( input );
	
	//postMessage( { points: output, i: count } );
	
	if ( ++count < maxCount ) {
		
		return	recurse( output, count, maxCount );
		
	} else {
		
		return	output;
		
	}
	
}


/*
 * run a single iteration of the l-system (called
 * recursively by `recurse`)
 */
function iterate( input ) {
	
	let	output	= input.slice();
	
	for (
		let i = output.length;
		i--;
		i >= 0
	) {
		
		let	item	= output[ i ],
			repl	= parts[ item ] && parts[ item ].slice();
		
		if ( item && repl ) {
			
			Array.prototype.splice.apply( output, [ i, 1 ].concat( repl ) );
			
		}
		
	}
	
	return	output;
	
}


/*
 * strip the unneeded 'X's and 'Y's from the array
 */
function cleanOutput_filter( item ) {
	
	return	item !== 'X' && item !== 'Y';
	
}


/*
 * converts the l-system +/-/1 into cartesian points 
 * 
 * TODO	absolute/relative
 * TODO	consolidate colinear points (if not animating)
 */
function pathifyOutput( input, startPoint, rotation, lineLength ) {
	
	let	current	= startPoint.slice(),
		output	= [],
		dir		= angles[ rotation ].slice();
	
	input.forEach(
		function( item ) {
			
			let	dx	= dir[ 0 ],
				dy	= dir[ 1 ];
			
			if ( item === 1 ) {
				
				
				let	x	= current[ 0 ] + ( dx * lineLength ),
					y	= current[ 1 ] + ( dy * lineLength );
				
				current	= [ x, y ];
				
				output.push( x, y );
				
				//output.push( dx, dy );
				
			} else if ( item === '+' ) {
				
				dir	= [
						-dy,
						dx
					];
				
			} else if ( item === '-' ) {
				
				dir	= [
						dy,
						-dx
					];
				
			}
			
		}
	);
	
	return	output;
	
}
