(function( window ){
	
	'use strict';
	
	/*document.addEventListener(
		'DOMContentLoaded',*/
	window.addEventListener(
		'load',
		function() {
			
			window.svg.initialiseCanvas();
			
			//window.svg.loadIcons( '/img/svg/icons.svg' );
			
		}
	);
	
	document.body.addEventListener(
		'canvasInitialised',
		canvasInitialised
	);
	
	function canvasInitialised( evt ) {
		
		const	dims	= evt.detail.dims,
				canvas	= evt.target,
				//wheel	= window.wheel.initialise( canvas, dims ),
				dragon	= getDragon( 13, { rotation : 1 } ),
				grid	= generateHexGrid( 16, dims.width,  dims.height );	// TODO workerise
		
		canvas.setAttribute( 'class', 'svgcanvas' );
		
		const	init	= ( { points, center } ) => {
			
			let	dragonPath	= Dragon.svgPath(
								points,
								center,
								canvas,
								dims
							),
				dragonId	= 'dragon-' + Math.floor( Math.random() * 1000000 ).toString( 36 ),
				
				use 		= document.createElementNS( window.svg.SVG_NS, 'use' ),
				use2, maskUse,	// gonna clone `use` for these
				
				hexGrid		= getHexSVG( dims.height, 16 ),
				hexId		= 'hex-' + Math.floor( Math.random() * 1000000 ).toString( 36 ),
				hexBox		= getHexRect( hexId, dims ),
				
				defs		= document.querySelector( 'defs' ),	// TODO	generate
				mask		= document.getElementById( 'foregroundOutlines' ),	// TODO generate
				
				txt			= document.createElementNS( window.svg.SVG_NS, 'text' );
			
			hexGrid.id	= hexId;
			
			defs.appendChild( hexGrid );
			
			canvas.appendChild( hexBox );
			
			
			dragonPath.id	= dragonId;
			
			defs.insertBefore( dragonPath, mask );
			
			
			use.setAttribute( 'class', 'dragon' );
			use.setAttributeNS( window.svg.XLINK_NS, 'href', '#' + dragonId );
			
			canvas.appendChild( use );
			
			
			use2	= use.cloneNode( true );
			
			use2.setAttribute( 'class', 'dragon wiggly' );
			
			canvas.appendChild( use2 );
			
			
			maskUse	= use.cloneNode( true );
			
			mask.appendChild( maskUse );
			
			
			setTimeout( () => {
				
				document.querySelector( '.JS_content' ).classList.add( 'show' );
				use.setAttribute( 'class', 'dragon show' );
				use2.setAttribute( 'class', 'dragon wiggly show' );
				hexBox.setAttribute( 'class', 'hexbox show' );
				
			}, 250 );
			
			let	t;
			
			// TODO
			window.addEventListener(
				'resize',
				( evt ) => {
					
					if ( t ) {
						
						clearTimeout( t );
						
					}
					
					t	= setTimeout(
							() => {},
							200
						);
					
				}
			);
			
		}
		
		dragon.then( init );
		
	}
	
})( window );
