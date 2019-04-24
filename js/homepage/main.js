(function( window ){
	
	'use strict';
	
	/*document.addEventListener(
		'DOMContentLoaded',*/
	window.addEventListener(
		'load',
		function() {
			
			window.svg.initialiseCanvas();
			
			window.svg.loadIcons( '/img/svg/icons.svg' );
			
		}
	);
	
	document.body.addEventListener(
		'canvasInitialised',
		canvasInitialised
	);
	
	function canvasInitialised( evt ) {
		
		const	dims	= evt.detail.dims,
				canvas	= evt.target,
				wheel	= window.wheel.initialise( canvas, dims );
		window.goDragon( [ dims.centreX, dims.centreY ] );
	}
	
})( window );
