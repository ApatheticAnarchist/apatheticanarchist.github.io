(function() {
	
	'use strict';
	
	if ( ! ( console && typeof console.log === 'function' ) ) {
		
		( window['console'] = {} ).log = function() {};
				
	}
	
	var l_systems	= {
				'koch'		: {
					vars		: {
						'F' : [ 'F', '-', 'F', '+', '+', 'F', '-', 'F' ]
					},
					moves		: {
						'F'	: 1
					},
					angles	: {
						'+'	: Math.PI / 3,
						'-'	: - Math.PI / 3
					},						
					start		: [ 'F', '+', '+', 'F', '+', '+', 'F' ], //[ 'F' ]
					init		: function( ctx ) {
						
						ctx.translate( Math.floor( width / 2 ) + 0.5, 3.5 );
						ctx.rotate( - Math.PI / 6 );
						
						line_length	= 1.5;
						
					},
					iterations	: 5
				},
				'koch_90'		: {
					vars		: {
						'F' : [ 'F', '-', 'F', '+', 'F', '+', 'F', '-', 'F' ]
					},
					moves		: {
						'F'	: 1
					},
					angles	: {
						'+'	: Math.PI / 2,
						'-'	: - Math.PI / 2
					},						
					start		: [ 'F' ],
					init		: function( ctx ) {
						
						ctx.translate( width - 0.5, 3.5 );
						ctx.rotate( Math.PI / 2 );
						
						line_length	= 3;
						
					},
					iterations	: 5,
					pause_on_iterations	: 1
				},
				'dragon'	: {
					vars		: {
						'X' : [ 'X', '+', 'Y', 'F' ],
						'Y'	: [ 'F', 'X', '-', 'Y' ]
					},
					moves		: {
						'F'	: 1
					},
					angles	: {
						'+'	: Math.PI / 2,
						'-'	: - Math.PI / 2
					},						
					start		: [ 'F', 'X' ],
					init		: function( ctx ) {
						
						ctx.translate( Math.floor( width / 4 ) + 0.5, Math.floor( 3 * height / 4 ) + 0.5 );
						
						line_length	= 3;
						
					},
					iterations	: 13,
					pause_on_iterations	: 5
				},
				'sierpinski'	: {
					vars		: {
						'F' : [ 'F', '-', 'G', '+', 'F', '+', 'G', '-', 'F' ],
						'G'	: [ 'G', 'G' ]
					},
					moves		: {
						'F'	: 1,
						'G'	: 1
					},
					angles	: {
						'+'	: 2 * Math.PI / 3,
						'-'	: -2 * Math.PI / 3
					},						
					start		: [ 'F', '-', 'G', '-', 'G' ],
					init		: function( ctx ) {
						
						ctx.translate( Math.floor( width / 2 ) + 0.5, 3.5 );
						ctx.rotate( Math.PI / 6 );
						
						line_length	= 6;
						
					},
					iterations	: 6
				},
				'sierpinski_hex'	: {
					vars		: {
						'F' : [ 'G', '-', 'F', '-', 'G' ],
						'G'	: [ 'F', '+', 'G', '+', 'F' ]
					},
					moves		: {
						'F'	: 1,
						'G'	: 1
					},
					angles	: {
						'+'	: - Math.PI / 3,
						'-'	: Math.PI / 3
					},						
					start		: [ 'F' ],
					init		: function( ctx ) {
						
						ctx.translate( Math.floor( width / 2 ) + 0.5, 3.5 );
						
						if ( l_system.iterations % 2 ) {
							
							ctx.rotate( - Math.PI / 6 );
							
						} else {
							
							ctx.rotate( Math.PI / 6 );
							
						}
						
						line_length	= 1.5;
						
					},
					iterations	: 8,
					pause_on_iterations	: 3
				},
				'levy'		: {
					vars		: {
						'F' : [ '+', 'F', '-', '-', 'F', '+' ]
					},
					moves		: {
						'F'	: 1
					},
					angles	: {
						'+'	: Math.PI / 4,
						'-'	: - Math.PI / 4
					},						
					start		: [ 'F' ],
					init		: function( ctx ) {
						
						ctx.translate( Math.floor( width / 4 ) + 0.5, Math.floor( height / 4 ) + 0.5 );
						ctx.rotate( - Math.PI / 2 );
						
						line_length	= 5;
						
					},
					iterations	: 12,
					pause_on_iterations	: 6
				}
			},
			l_system,
			
			buttons	= {
				'koch'						: 'Koch Snowflake',
				'koch_90'					: 'Quadratic Koch Curve',
				'dragon'					: 'Dragon Curve',
				'sierpinski'			: 'Sierpinski 1',
				'sierpinski_hex'	: 'Sierpinski 2',
				'levy'						: 'L\u00E9vy C Curve'
			},
			button,
			
			width, height,
			line_length,
			i, l,
			
			placeholder,
			canvas, ctx,
			
			temp_character		= '',
			temp_array				= [],
			system_array			= [],
			wait							= false,
			iteration_lengths	= [],
			timeout						= false,
			
			buildSystem,
			buildStep,
			draw,
			drawSystem,
			drawStep,
			
			fail,
			
			window_onload,
			window_unload,
			button_click;

	buildSystem	= function( system ) {
		
		l_system	= l_systems[ system ];
		
		if ( l_system ) {
			
			buildStep( l_system.start, 0, l_system.iterations, function( output ) {
				
				draw( true );
				
			} );
			
		} else {
			
			fail( 'System not found' );
			
		}
		
	}
	
	buildStep	= function( input, iteration, max_iteration, finish_callback ) {
		
		system_array	= input.slice( 0 );
			
		iteration_lengths.push( system_array.length );
		
		if ( iteration >= max_iteration ) {
						
			finish_callback( system_array );
			
			return;
			
		}
		
		for ( i = system_array.length; i >= 0; i-- ) {
			
			temp_character	= system_array[ i ];
			
			if ( l_system.vars.hasOwnProperty( temp_character ) ) {
				
				// clone the character array (to prevent overwriting)
				temp_array	= l_system.vars[ temp_character ].slice( 0 );
				// add the extra args for splice to its start
				temp_array.unshift( i, 1 );
				
				system_array.splice.apply( system_array, temp_array );
				
			}
			
		}
		
		timeout	= setTimeout( function() {
		
			buildStep( system_array, ++iteration, max_iteration, finish_callback );
			
		}, 25 );
		
	}
	
	draw	= function( animate ) {
		
		ctx.save();
		
		l_system.init( ctx );
		
		ctx.beginPath();
		ctx.moveTo( 0, 0 );
		
		drawStep( 0, system_array.length, animate, function() {
			
			ctx.restore();
			
			if ( ! animate ) {
				
				var grad = ctx.createLinearGradient( 0, 0, 0, height );
				
				grad.addColorStop( 0, '#f30' );
				grad.addColorStop( 0.5, '#ff0' );
				grad.addColorStop( 1, '#3f0' );
				
				ctx.strokeStyle	= grad;
				ctx.fillStyle		= grad;
				
				ctx.fill();
				//ctx.stroke();
				
			}
			
		} );
		
	}
	
	drawStep	= function( iteration, max_iteration, animate, finish_callback ) {
		
		if ( iteration < max_iteration ) {
			
			temp_character	= system_array[ iteration ];
			
			if ( l_system.moves.hasOwnProperty( temp_character ) ) {
				
				if ( animate ) {
					
					ctx.beginPath();
					ctx.moveTo( 0, 0 );
					
				}
				
				ctx.lineTo( 0, line_length * l_system.moves[ temp_character ] );
				ctx.translate( 0, line_length * l_system.moves[ temp_character ] );
				
				if ( animate ) {
					
					ctx.stroke();
					
					wait	= 4;
						
				}
				
			} else if ( l_system.angles.hasOwnProperty( temp_character ) ) {
				
				ctx.rotate( l_system.angles[ temp_character ] );
				
				wait	= false;
				
			}
			
			if (
				l_system.pause_on_iterations
				&&
				iteration_lengths.indexOf( iteration ) >= l_system.pause_on_iterations
			) {
				
				wait	= 400;
				
			}
			
			if ( animate && wait ) {
				
				timeout	= setTimeout( function() {
					
					drawStep( ++iteration, max_iteration, animate, finish_callback );
					
				}, wait );
				
			} else {
				
				drawStep( ++iteration, max_iteration, animate, finish_callback );
				
			}
			
		} else {
			
			finish_callback( animate );
			
		}
		
	}
	
	fail	= function( msg ) {
		
		placeholder.innerHTML = msg;
		
	}
	
	window_onload = function() {
		
		width		= 800;
		height	= 440;
		
		placeholder	= document.getElementById( 'placeholder' );
		canvas			= document.createElement( 'canvas' );
		
		placeholder.innerHTML = '';
		placeholder.appendChild( canvas );
		
		if (
			canvas.getContext
			&&
			canvas.getContext( '2d' )
		) {
			
			ctx = canvas.getContext( '2d' )
			
			canvas.width	= width;
			canvas.height	= height;
			
			for ( var system in buttons ) {
				
				button				= document.createElement( 'input' );
				button.type		= 'button';
				button.value	= buttons[ system ];
				
				placeholder.parentNode.insertBefore( button, placeholder );
				
				button.addEventListener( 'click', button_click( system ) );
				
			}
			
		} else {
			// canvas unsupported
			
			fail( 'Unsupported browser' );
			
		}
		
	}
	
	window_unload	= function() {
		
		if ( timeout ) {
			
			clearTimeout( timeout	);
			
		}
		
	}
	
	button_click	= function( system ) {
		
		return function() {
			
			if ( timeout ) {
				
				clearTimeout( timeout	);
				
			}
			
			ctx.restore();
			ctx.restore();
			
			ctx.clearRect( 0, 0, width, height );
			
			iteration_lengths	= [];
			
			buildSystem( system );
			
		};
		
	}
	
	window.addEventListener( 'load', window_onload );
	window.addEventListener( 'unload', window_unload );
	
} ()	)
