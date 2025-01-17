"use strict"

const { series, src, dest, watch } = require( 'gulp' );

var plugins = require( 'gulp-load-plugins' )();

/** source files for uglify **/
var js = [
	'src/js/lib/modernizr.js',
	'src/js/lib/conditionizr-4.3.0.min.js',
	'node_modules/jquery/dist/jquery.js',
	'src/js/scripts.js'
];

var css = {
	development: [
		'src/css/banner.css',
		'src/css/style.css'
	], 
	production: [
		'src/css/banner.css',
		'node_modules/normalize.css/normalize.css',
		'src/css/style.css'
	]
};

var clean_target = [
	'.tmp',
	'dist'
];

var env = (function() {

	env = "development";

	process.argv.some(function( key ) {
		var matches = key.match( /^\-{2}env\=([A-Za-z]+)$/ );

		if ( matches && matches.length === 2 ) {
			env = matches[1];
			return true;
		}
	});

	return env;

} ());


/** Clean **/
function clean() {

	var del = require( 'del' );
	return del(clean_target);
}


/** Copy **/
function copy() {

	return src([
		'src/*.{php,png,css}',
		'src/modules/*.php',
		'src/img/**/*.{jpg,png,svg,gif,webp,ico}',
		'src/fonts/*.{woff,woff2,ttf,otf,eot,svg}',
		'src/languages/*.{po,mo,pot}'
	], {
		base: 'src'
	})
		.pipe( dest( 'dist' ) );
}


/** SASS **/
function sass() {

	return src( 'src/css/sass/style.scss' )
		.pipe( plugins.sourcemaps.init() )
		.pipe( plugins.sass() )
		.pipe( plugins.sourcemaps.write( '.' ) )
		.on( 'error' , function( error ) {
			console.error( error );
		})
		.pipe( dest( 'src/css') );
}


/** Styles **/
function stylesTask() {
	console.log( '`styles` task run in `' + env + '` environment.' );

	var stream = src( css[env] )
		.pipe( plugins.concat( 'style.css' ) )
		.pipe( plugins.autoprefixer( 'last 2 version' ) );

	if ( env == 'production' ) {
		stream.pipe( plugins.csso() );
	}

	return stream.on( 'error', function( error ) {
		console.error( error );
	})
		.pipe( dest( 'src' ) );
}


/** JSHint **/
function jshint() {

	return src( 'src/js/{!(lib)/*.js,*.js}' )
		.pipe( plugins.jshint() )
		.pipe( plugins.jshint.reporter( 'jshint-stylish' ) )
		.pipe( plugins.jshint.reporter( 'fail' ));
}


/** Template **/
function template() {
	console.log( '`template` task run in `' + env + '` environment.' );

	var is_debug = (env === 'development' ? 'true' : 'false');

	return src( 'src/dev-templates/is-debug.php' )
		.pipe( plugins.template({ is_debug: is_debug }) )
		.pipe( dest( 'src/modules' ) );
}


/** Modernizr **/
function modernizr( callback ) {
	// console.log( 'modernizr' );
	var modernizr = require( 'modernizr' ),
		config = require( './node_modules/modernizr/lib/config-all' ),
		fs = require( 'fs' );

	modernizr.build( config, function( code ) {
		fs.writeFileSync( './src/js/lib/modernizr.js', code );
	});

	callback();
}


/** Uglify **/
function uglify() {
	
	return src( js )
		.pipe( plugins.concat( 'scripts.min.js' ) )
		.pipe( plugins.uglify() )
		.pipe( dest( 'dist/js' ) );
}


/** jQuery **/
function jquery() {
	
	return src( 'node_modules/jquery/dist/jquery.js' )
		.pipe( plugins.sourcemaps.init() )
		.pipe( plugins.sourcemaps.write() )
		.pipe( dest( 'src/js/lib' ) );
}


/** Normalize **/
function normalize() {
	
	return src( 'node_modules/normalize.css/normalize.css' )
		.pipe( dest( 'src/css/lib' ) );
}


/** envProduction **/
function envProduction( callback ) {
	env = 'production';

	callback();
}


/** Watch **/
function watchTask() {
	console.log('watchTask');
	plugins.livereload.listen();

	watch([
		'src/js/**/*.js',
		'src/*.php',
		'src/*.css'
	], { events: 'all' })
		.on( 'change', function( path ) {
			console.log( path );
		});

	watch([
		'src/css/*.css',
		'src/css/sass/**/*.scss'
	], stylesTask);

	watch( 'src/js/{!(lib)/*.js,*.js}', jshint );
}


/** Build **/
function buildTask( callback ){
	callback(console.log('Build complete.'));
}


exports.clean = clean;
exports.copy = copy;
exports.sass = sass;
exports.styles = series( sass, stylesTask );
exports.jshint = jshint;
exports.template = template;
exports.modernizr = modernizr;
exports.uglify = uglify;
exports.jquery = jquery;
exports.normalize = normalize;
exports.envProduction = envProduction;
exports.watch = series( template, exports.styles, jshint, modernizr, jquery, normalize, watchTask );
exports.build = series( envProduction, clean, template, exports.styles, modernizr, jshint, copy, uglify, buildTask );
exports.default = series( exports.watch );

/*
[07:31:29] Tasks for ~/dev/GitHub/html5blank-vjandrea/gulpfile.old
[07:31:29] ├── clean
[07:31:29] ├── copy
[07:31:29] ├── sass
[07:31:29] ├─┬ styles
[07:31:29] │ └─┬ <series>
[07:31:29] │   └── sass
[07:31:29] ├── jshint
[07:31:29] ├── template
[07:31:29] ├── modernizr
[07:31:29] ├── uglify
[07:31:29] ├── jquery
[07:31:29] ├── normalize
[07:31:29] ├── envProduction
[07:31:29] ├─┬ watch
[07:31:29] │ └─┬ <series>
[07:31:29] │   ├── template
[07:31:29] │   ├─┬ styles
[07:31:29] │   │ └─┬ <series>
[07:31:29] │   │   └── sass
[07:31:29] │   ├── jshint
[07:31:29] │   ├── modernizr
[07:31:29] │   ├── jquery
[07:31:29] │   └── normalize
[07:31:29] ├─┬ build
[07:31:29] │ └─┬ <series>
[07:31:29] │   ├── envProduction
[07:31:29] │   ├── clean
[07:31:29] │   ├── template
[07:31:29] │   ├─┬ styles
[07:31:29] │   │ └─┬ <series>
[07:31:29] │   │   └── sass
[07:31:29] │   ├── modernizr
[07:31:29] │   ├── jshint
[07:31:29] │   ├── copy
[07:31:29] │   └── uglify
[07:31:29] └─┬ default
[07:31:29]   └─┬ <series>
[07:31:29]     └─┬ watch
[07:31:29]       └─┬ <series>
[07:31:29]         ├── template
[07:31:29]         ├─┬ styles
[07:31:29]         │ └─┬ <series>
[07:31:29]         │   └── sass
[07:31:29]         ├── jshint
[07:31:29]         ├── modernizr
[07:31:29]         ├── jquery
[07:31:29]         └── normalize

*/