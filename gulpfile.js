const	gulp	= require( 'gulp' ),
		stylus	= require( 'gulp-stylus' ),
		log		= require('fancy-log');


//
//	javascript tasks
//
function js( cb ) {
	
	cb();
	
}

//
//	css tasks
//
function css( cb ) {
	
	return	gulp.src( 'css/src/*.styl' )
				.pipe(
					stylus(
						{ compress : true }
					)
				)
				.pipe(
					gulp.dest( './css/build/' )
				);
	
}

// css watcher
gulp.task(
	'watch',
	function() {
		
		log( '\x1b[45m\x1b[1m%s\x1b[0m', ' ctrl-z to stop ' );
		
		return	gulp.watch(
			'css/src/*.styl',
			{ ignoreInitial : false },
			all()
		);
		
	}
);


function all() {
	
	return	gulp.parallel( js, css );
	
}

exports.default	= all();
