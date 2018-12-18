(function( window ) {
	
	'use strict';
	
	window.wheel	= window.wheel || {};
	
	
	const	wheelRad		= 64,
			lineWidth		= 2,
			titlePadding	= 4;
	
	
	function initialise( canvas, windowDimensions ) {
		
		let	items		= parseContents(),
			itemcount	= items.length,
			arcTheta	= //( Math.PI * 2 ) / ( itemcount * 2 )
						  Math.PI / itemcount,	// simplify the calc. (factor out the *2)
			
			currentTheta	= ( itemcount % 2 ) ? arcTheta / 2 : 0,
			
			cx		= windowDimensions.centreX,
			cy		= windowDimensions.centreY,
			
			circ	= drawWheelCircle( cx, cy, wheelRad ),
			
			wrap	= document.createElementNS( window.svg.SVG_NS, 'g' ),
			nodes	= [];
		
		canvas.setAttribute( 'class', 'wheel-canvas' );
		
		wrap.setAttribute( 'class', 'wheel' );
		
		
		wrap.appendChild( circ );
		
		
		items.forEach(
			function( it ) {
				
				let	startTheta	= currentTheta,
					endTheta	= currentTheta + arcTheta,
					
					node;
				
				it.theta	= ( startTheta + endTheta ) / 2;
				
				
				node	= drawNode( it, cx, cy, startTheta, endTheta );
				
				it.node	= node;
				
				
				bindNodeEvents( windowDimensions, canvas, it );
				
				wrap.appendChild( node );
				
				currentTheta	= currentTheta + ( arcTheta * 2 );
				
			}
		);
		
		
		canvas.appendChild( wrap );
		
		loadingAnimation( wrap, windowDimensions, 250 );
		
		return	canvas;
		
	}
	
	window.wheel.initialise	= initialise;
	
	function iconsLoaded( canvas ) {
		
		//
		//	yield so the CSS transitions fire
		//
		requestAnimationFrame(
			function(){
				
				//loadedAnimation( canvas );
				
			}
		);
		
	}
	
	window.wheel.iconsLoaded	= iconsLoaded;
	
	
	
	function loadingAnimation( canvas, windowDimensions, delay ) {
		
		let	circle		= canvas.querySelector( 'circle' ),
			
			startValue	= 1 * circle.getAttribute( 'stroke-dashoffset' ),
			endValue	= startValue * -1,
			
			loadingFinished	= false;
		
		circle.addEventListener(
			'transitionend',
			function _t( evt ) {
				
				evt.target.removeEventListener( 'transitionend', _t );
				
				circle.setAttribute( 'style', 'transition:unset' );
				
				requestAnimationFrame(
					function() {
						
						circle.setAttribute( 'stroke-dashoffset', startValue );
						
						setTimeout(
							function() {
								
								circle.removeAttribute( 'style' );
								
								if ( loadingFinished ) {
									
									loadedAnimation( canvas );
									
								} else {
									
									loadingAnimation( canvas, windowDimensions, 0 );
									
								}
								
							},
							25
						);
						
					}
				);
				
			}
		);
		
		document.body.addEventListener(
			'iconsLoaded',
			function() {
				
				loadingFinished	= true;
				
			}
		);
		
		//
		//	yield so the CSS transitions fire
		//
		setTimeout(
			function() {
				
				circle.setAttribute( 'stroke-dashoffset', endValue );
				
			},
			delay
		);
		
	}
	
	
	
	function loadedAnimation( wrap ) {
		
		let	circle	= wrap.querySelector( 'circle' ),
			nodes	= Array.prototype.slice.apply( wrap.querySelectorAll( '.wheel-node' ) );
		
		circle.addEventListener(
			'transitionend',
			function _t( evt ) {
				
				evt.target.removeEventListener( 'transitionend', _t );
				
				nodes.forEach(
					function( node ) {
						
						node.setAttribute(
							'class', 
							node.getAttribute( 'class' ) + ' show'
						);
						
					}
				);
				
			}
		);
		
		circle.setAttribute(
			'class', 
			circle.getAttribute( 'class' ) + ' show'
		);
		
	}
	
	
	
	function parseContents() {
		
		let	contents	= document.getElementById( 'contents' ),
			nodes		= Array.prototype.slice.apply( contents.querySelectorAll( 'li' ) ),
			
			items	= [];
		
		nodes.forEach(
			function( it ) {
				
				items.push(
					{
						id		: it.getAttribute( 'id' ),
						icon	: it.getAttribute( 'data-icon' ),
						title	: it.getAttribute( 'data-title' ),
						text	: it.innerHTML || null
					}
				);
				
			}
		);
		
		return	items;
		
	}
	
	
	
	function drawWheelCircle( cx, cy, radius ) {
		
		let	circle	= document.createElementNS( window.svg.SVG_NS, 'circle' ),
			circumference	= Math.ceil( radius * 2 * Math.PI );
		
		circle.setAttribute( 'cx', cx );
		circle.setAttribute( 'cy', cy );
		circle.setAttribute( 'r', radius );
		
		//
		//	set these for the load animation
		//
		circle.setAttribute( 'stroke-dasharray', circumference );
		circle.setAttribute( 'stroke-dashoffset', circumference );
		
		return	circle;
		
	}
	
	
	
	function drawNode( nodeData, cx, cy, startTheta, endTheta ) {
		
		let	group	= document.createElementNS( window.svg.SVG_NS, 'a' ),
			
			path1	= drawArc(
						cx,
						cy,
						wheelRad - 6,
						startTheta,
						endTheta
					),
			
			path2	= drawArc(
						cx,
						cy,
						wheelRad + 6,
						startTheta,
						endTheta
					),
			
			title	= nodeData.title && drawNodeTitle( nodeData, cx, cy, wheelRad + 6 );
		
		
		group.setAttribute( 'class', 'wheel-node' );
		
		group.setAttribute( 'href', '#' );
		
		
		group.appendChild( path1 );
		group.appendChild( path2 );
		
		if ( title ) {
			
			group.appendChild( title );
			
		}
		
		group.appendChild( drawNodeClickarea( cx, cy, wheelRad - 6, wheelRad * 1.5, startTheta, endTheta ) );
		
		
		//
		//	set these for the load animation
		//
		path1.setAttribute( 'stroke-dasharray', path1.getTotalLength() );
		path1.setAttribute( 'stroke-dashoffset', path1.getTotalLength() );
		
		path2.setAttribute( 'stroke-dasharray', path2.getTotalLength() );
		path2.setAttribute( 'stroke-dashoffset', path2.getTotalLength() );
		
		
		return	group;
		
	}
	
	
	function drawNodeTitle( nodeData, cx, cy, radius ) {
		
		let	group	= document.createElementNS( window.svg.SVG_NS, 'g' ),
			path	= document.createElementNS( window.svg.SVG_NS, 'path' ),
			text	= document.createElementNS( window.svg.SVG_NS, 'text' ),
			
			theta	= nodeData.theta,
			textDir	= theta > Math.PI / 2 && theta < 3 * Math.PI / 2
						? -1
						: 1,
			
			x1	= cx + ( Math.cos( theta ) * radius ),
			y1	= cy + ( Math.sin( theta ) * radius ),
			
			x2	= cx + ( Math.cos( theta ) * ( radius + ( wheelRad / 2 ) ) ),
			y2	= cy + ( Math.sin( theta ) * ( radius + ( wheelRad / 2 ) ) ),
			
			width	= 0;
		
		text.textContent	= nodeData.title;
		
		text.setAttribute( 'class', 'wheel-node--title' );
		text.setAttribute( 'text-anchor', textDir === 1 ? 'start' : 'end' );
		
		text.setAttribute( 'x', x2 + ( titlePadding * textDir ) );
		text.setAttribute( 'y', y2 - titlePadding );
		
		document.body.querySelector( '.wheel-canvas' ).appendChild( text );
		
		width	= ( text.getBoundingClientRect().width + titlePadding + titlePadding ) * textDir;
		
		group.appendChild( text );
		
		
		path.setAttribute(
			'd',
			'M' + x1 + ',' + y1
			+ 'L' + x2 + ',' + y2
			+ 'h' + width
			+ 'a4,4 0 1 0 ' + ( 8 * textDir ) + ',0'
			+ 'a4,4 0 1 0 ' + ( 8 * textDir * -1 ) + ',0'
		);
		
		//
		//	set these for the load animation
		//
		path.setAttribute( 'stroke-dasharray', path.getTotalLength() );
		path.setAttribute( 'stroke-dashoffset', path.getTotalLength() );
		
		group.appendChild( path );
		
		
		return	group;
		
	}
	
	
	function drawNodeClickarea( cx, cy, r1, r2, startTheta, endTheta ) {
		
		let	path	= document.createElementNS( window.svg.SVG_NS, 'path' ),
			
			arc1	= getArcNumbers( cx, cy, r1, startTheta, endTheta ),
			arc2	= getArcNumbers( cx, cy, r2, endTheta, startTheta, true );
		
		path.setAttribute(
			'd',
			arc1.moveStr + arc1.arcStr
			+ 'L' + arc2.start + arc2.arcStr
			+ 'Z'
		);
		
		path.setAttribute( 'class', 'wheel-node--clicker' );
		
		return	path;
		
	}
	
	
	
	function drawArc( cx, cy, radius, startTheta, endTheta ) {
		
		let	path	= document.createElementNS( window.svg.SVG_NS, 'path' ),
			
			pathStr	= getArcNumbers( cx, cy, radius, startTheta, endTheta );
		
		path.setAttribute(
			'd',
			pathStr.moveStr + pathStr.arcStr
		);
		
		return	path;
		
	}
	
	function getArcNumbers( cx, cy, radius, startTheta, endTheta, reverse ) {
		
		let	x1	= cx + ( Math.cos( startTheta ) * radius ),
			y1	= cy + ( Math.sin( startTheta ) * radius ),
			
			x2	= cx + ( Math.cos( endTheta ) * radius ),
			y2	= cy + ( Math.sin( endTheta ) * radius ),
			
			largeArc	= endTheta - startTheta > Math.PI ? 1 : 0,
			sweep		= reverse ? 0 : 1;
		
		return	{
					start	: x1 + ' ' + y1,
					end		: x2 + ' ' + y2,
					moveStr	: 'M' + x1 + ' ' + y1,
					arcStr	: 'A' + radius + ' ' + radius + ' 0 ' + largeArc + ' ' + sweep + ' ' + x2 + ' ' + y2
				};
		
	}
	
	
	
	function bindNodeEvents( windowDimensions, canvas, nodeData ) {
		
		nodeData.node.addEventListener(
			'click',
			function( evt ) {
				
				evt.preventDefault();
				
				nodeClick( windowDimensions, canvas, nodeData );
				
			}
		);
		
	}
	
	function nodeClick( windowDimensions, canvas, nodeData ) {
		
		let	nodes	= Array.prototype.slice.apply( canvas.querySelectorAll( '.wheel-node' ) );
		
		nodes.forEach(
			function( node ) {
				
				if ( node != nodeData.node ) {
					
					console.log( node );
					
					node.setAttribute(
						'class',
						node.getAttribute( 'class' ).replace( /\s*show/g, '' )
					);
										
				}
				
			}
		);
		
		setTimeout(
			function() {
				
				showNodeModal( nodeData, nodes );
				
			},
			1000
		);
		
	}
	
	function showNodeModal( nodeData, nodes ) {
		
		let	modal	= document.createElement( 'div' );
		
		modal.innerHTML	= nodeData.text;
		
		modal.className	= 'wheel-node--modal';
		
		document.body.appendChild(
			modal
		);
		
		setTimeout(
			function() {
				
				//
				//	yield so transitions fire
				//
				modal.classList.add( 'show' );
				
				//
				// delay binding this so that opening
				// click don't close it again
				//
				bindNodeModalCloser( modal, nodes );
				
			},
			25
		);
		
	}
	
	function bindNodeModalCloser( modal, nodes ) {
		
		document.body.addEventListener(
			'click',
			function _c( evt ) {
				
				let	target	= evt.target;
				
				
				document.body.removeEventListener( 'click', _c );
				
				
				do {
					
					if ( target === modal ) return;
					
				} while ( target = target.parentNode );
				
				modal.classList.remove( 'show' );
				
				nodes.forEach(
					function( node ) {
						
						node.setAttribute(
							'class',
							node.getAttribute( 'class' ) + ' show'
						);
							
					}
				);
				
			}
		);
		
	}
	
})( window );
