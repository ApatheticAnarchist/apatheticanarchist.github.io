(function( window ) {
	
	function EventEmitter() {
		
		this.handlers	= {};
		
		this.targets	= [];
		
	}
	
	
	
	function listen( target, evtName, evtHandler ) {
		
		if ( ! this.handlers[ evtName ] ) {
			
			this.handlers[ evtName ]	= [];
			
		}
		
		this.handlers[ evtName ].push( evtHandler );
		
	}
	
	EventEmitter.prototype.listen	= listen;
	
	
	
	function emit(  ) {
		
		
		
	}
	
	EventEmitter.prototype.emit	= emit;
	
})( window );
