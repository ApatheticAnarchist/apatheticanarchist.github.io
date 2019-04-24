'use strict';

const	parts	= {
					'X'	: [ 'X', '+', 'Y', 1 ],
					'Y'	: [ 1, 'X', '-', 'Y' ]
				},
		start	= [ 1, 'X' ];


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
	
	postMessage(
		pathifyOutput(
			recurse(
				start,
				0,
				maxRecurse
			).filter(
				cleanOutput_filter
			),
			res && res.data && res.data.center || [ 100, 100 ]
		)
	);
	
}
onmessage	= onMessage;



function recurse( input, count, maxCount ) {
	
	let	output	= iterate( input );
	
	if ( ++count < maxCount ) {
		
		return	recurse( output, count, maxCount );
		
	} else {
		
		return	output;
		
	}
	
}


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



function pathifyOutput( input, start ) {
	
	let	current	= start.slice(),
		output	= [],
		dir		= [ -4, 0 ];
	
	input.forEach(
		function( item ) {
			
			let	dx	= dir[ 0 ],
				dy	= dir[ 1 ];
			
			if ( item === 1 ) {
				
				
				let	x	= current[ 0 ] + dx,
					y	= current[ 1 ] + dy;
				
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
