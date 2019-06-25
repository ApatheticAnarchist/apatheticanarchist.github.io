(function() {
	
	'use strict';
	
	const	SVG_NS	= 'http://www.w3.org/2000/svg';
	
	document.addEventListener(
		'DOMContentLoaded',
		function() {
			
			const	w	= window.innerWidth,
					h	= window.innerHeight,
					
					r	= Math.min( w, h ) * 0.25,
					z	= 20;
			
			document.body.appendChild(
				drawIt(
					w, h, r,
					[
						//Math.PI / 3,
						//Math.PI / 5,
						//Math.PI
					]
				)
			);
			
			document.querySelector( 'input' ).addEventListener(
				'change',
				() => {
					
					document.body.removeChild( document.querySelector( '.spiro' ) );
					
					document.body.appendChild(
						drawIt(
							w, h, r,
							[
								//Math.PI / 3,
								//Math.PI / 5,
								//Math.PI
							]
						)
					);
					
				}
			);
			
		}
	);
	
	function drawIt( w, h, r, rot ) {
		
		const	vals	= document.querySelector( 'input' ).value.split( ',' ),
				count	= vals[ 0 ] * 1,
				skip	= vals[ 1 ] * 1,
				curve	= vals[ 2 ] * 1;
				
		
		
		let	z	= 100;
		
		const	svg	= document.createElementNS( SVG_NS, 'svg' );
		
		svg.setAttribute( 'class', 'spiro' );
		svg.setAttribute( 'width', w );
		svg.setAttribute( 'height', h );
		
		
		let	pts		= getPoints( count, skip, curve ),
			trans	= get3d2dProjection(
						rotate3DShape(
							pts.reduce(
								( arr, pt ) => {
									
									arr.push(
										pt[ 0 ],
										pt[ 1 ],
										z,
										pt[ 2 ],
										pt[ 3 ],
										z
									);
									
									return	arr;
									
								},
								[]
							),
							rot,
							[ 0, 0, z ]
						)
					).reduce(
						( arr, pt, i ) => {
							
							if ( i % 2 ) {
								
								arr[ 0 ].push( pt[ 0 ], pt[ 1 ] );
								
							} else {
								
								arr.unshift( [ pt[ 0 ], pt[ 1 ] ] );
								
							}
							
							return	arr;
							
						},
						[]
					).reverse();
		
		
		
		let	p	= getPath(
					{
						points		: trans,
						centerX		: w / 2,
						centerY		: h / 2,
						radius		: r,
						curvature	: 1
					}
				);
		
		requestAnimationFrame(()=>{ p.setAttribute( 'stroke-dashoffset', 0 ); });
		
		svg.appendChild( p );
		
		return	svg;
		
	}
	
	function getPath(
		{
			points			= null,	// allow points to be passed in (default is to generate them)
			count			= 240,
			skip			= 111,
			centerX			= 100,
			centerY			= 100,
			radius			= 100,
			curvature 		= 0.25,
			animationCalcs	= true
		}
	) {
		
		const	path	= document.createElementNS( SVG_NS, 'path' ),
				
				pts			= points || getPoints( count, skip, curvature ),
				
				lastPoint	= pts[ pts.length - 1 ],
				last		= pointXY( lastPoint, centerX, centerY, radius );
		
		path.setAttribute(
			'd',
			'M' + last.x + ' ' + last.y
			+ pts.reduce(
				( str, pt, i ) => {
					
					// N.B. could reuse `last` for the final one but the
					//		calc aint that expensive
					const	{ x, y, cpx, cpy }	= pointXY( pt, centerX, centerY, radius );
					
					if ( i ) {
						
						// subsequent curves can infer their first control
						// point from the previous one
						str	= str + '\nS' + cpx + ' ' + cpy
									+ ' ' + x + ' ' + y;
						
					} else {
						
						let	lcpx	= ( -1 * ( last.cpx - last.x ) ) + last.x,
							lcpy	= ( -1 * ( last.cpy - last.y ) ) + last.y;
						
						// the first curve need both control points
						str	= str + '\nC' + lcpx + ' ' + lcpy
									+ ' ' + cpx + ' ' + cpy
									+ ' ' + x + ' ' + y;
						
					}
					
					return	str;
					
				},
				''
			)
		);
		
		if ( animationCalcs ) {
			
			const	pLen	= Math.ceil( path.getTotalLength() );
			
			path.setAttribute( 'stroke-dasharray', pLen + ' ' + pLen );
			path.setAttribute( 'stroke-dashoffset', pLen );
			path.setAttribute( 'style', 'transition-duration:' + Math.round( pLen / 5000 ) + 's' );
			
		}
		
		return	path;
		
	}
	
	function getPoints( count = 240, skip = 111, curvature = 0.1 ) {
		
		/*if ( count / skip === Math.floor( count / skip ) ) {
			
			throw( 'skip must not divide count evenly' );
			
		}*/
		
		let	pts	= [];
		
		// generate the points round the edge
		for ( let i = 0, l = count; i < l; i++ ) {
			
			let	p	= ( i * skip ) % count,
				a	= ( Math.PI * p * 2 ) / count,
				x	= - Math.sin( a ),
				y	= Math.cos( a ),
				// bezier control points
				a2	= a - Math.PI / 2,
				cpx	= x - ( Math.sin( a2 ) * curvature ),
				cpy	= y + ( Math.cos( a2 ) * curvature );
			
			pts.push( [ x, y, cpx, cpy ] );
			
		}
		
		// do the skipping
		return	pts;
		
	}
	
	function pointXY( pt, centerX, centerY, radius ) {
		
		return	{
					x	: roundish( centerX + ( pt[ 0 ] * radius ) ),
					y	: roundish( centerY + ( pt[ 1 ] * radius ) ),
					cpx	: roundish( centerX + ( pt[ 2 ] * radius ) ),
					cpy	: roundish( centerY + ( pt[ 3 ] * radius ) )
				};
		
	}
	
	function roundish( v ) {
		
		return	Math.round( v * 100 ) / 100;
		
	}
	
})();
