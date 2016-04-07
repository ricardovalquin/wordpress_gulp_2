// configuration
// buildInclude = ['**/*.php',
// 				'**/*.html',
// 				'**/*.css',
// 				'**/*.js',
// 				'**/*.svg',
// 				'**/*.ttf',
// 				'**/*.otf',
// 				'**/*.eot',
// 				'**/*.woff',
// 				'**/*.woff2',

// 				// include specific files and folders
// 				'screenshot.png',

// 				// exclude files and folders
// 				'!node_modules/**/*',
// 				'!bower_components/**/*',
// 				'!style.css.map',
// 				'!assets/js/custom/*',
// 				'!assets/css/patrials/*'
// ];


// plugins
var gulp = require('gulp');
var	browserSync  = require('browser-sync'); // Asynchronous browser loading on .scss file changes
var	reload       = browserSync.reload;
var	autoprefixer = require('gulp-autoprefixer'); // Autoprefixing magic
var	minifycss    = require('gulp-uglifycss');
var	filter       = require('gulp-filter');
var	uglify       = require('gulp-uglify');
var	imagemin     = require('gulp-imagemin');
var	newer        = require('gulp-newer');
var	rename       = require('gulp-rename');
var	concat       = require('gulp-concat');
var	notify       = require('gulp-notify');
var	cmq          = require('gulp-combine-media-queries');
var	runSequence  = require('gulp-run-sequence');
var	sass         = require('gulp-sass');
var	plugins      = require('gulp-load-plugins')({ camelize: true });
var	ignore       = require('gulp-ignore'); // Helps with ignoring files and directories in our run tasks
var	rimraf       = require('gulp-rimraf'); // Helps with removing files and directories in our run tasks
var	zip          = require('gulp-zip'); // Using to zip up our packaged theme into a tasty zip file that can be installed in WordPress!
var	plumber      = require('gulp-plumber'); // Helps prevent stream crashing on errors
var	cache        = require('gulp-cache');
var	sourcemaps   = require('gulp-sourcemaps');
var eslint = require('gulp-eslint');

// plumber variable for handled errors
var plumberErrorHandler = {errorHandler: notify.onError({
		title: 'Gulp',
		message: 'Error <%= error.message %>'
	})
};


// Styles task

gulp.task('styles', function(){
	gulp.src('./assets/css/*.scss')
		.pipe(plumber(plumberErrorHandler))
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'compact',
      		precision: 10, 
		}))
		.pipe(sourcemaps.write({includeContent: false}))
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(autoprefixer('last 2 version', '> 1%', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(sourcemaps.write('.'))
		.pipe(plumber.stop())
		.pipe(gulp.dest('./'))
		.pipe(filter('**/*.css')) // Filtering stream to only css files
		// .pipe(cmq()) // Combines Media Queries
		.pipe(reload({stream:true})) // Inject Styles when style file is created
		.pipe(rename({ suffix: '.min' }))
		.pipe(minifycss({
			maxLineLen: 80
		}))
		.pipe(gulp.dest('./'))
		.pipe(reload({stream:true})) // Inject Styles when min style file is created
		.pipe(notify({ message: 'Styles task complete', onLast: true }))
});


// Vendor scripts

gulp.task('vendorsJs', function(){
	gulp.src(['./assets/js/vendor/*.js', './bower_components/**/*.js'])
		.pipe(concat('vendors.js'))
		.pipe(gulp.dest('./assets/js/'))
		.pipe(rename({
			basename: "vendors",
			suffix: '.min'
		}))
		.pipe(uglify())
		.pipe(gulp.dest('./assets/js/'))
		.pipe(notify({ message: 'Vendor scripts task complete', onLast: true }));
});


// Custom scripts

gulp.task('scriptsJs', function(){
	gulp.src('./assets/js/custom/*.js')
		.pipe(concat('custom.js'))
		.pipe(gulp.dest('./assets/js/'))
		.pipe(rename({
			basename: 'custom',
			suffix: '.min'
		}))
		.pipe(uglify())
		.pipe(gulp.dest('./assets/js/'))
		.pipe(notify({ message: 'Custom scripts task complete', onLast: true }));

});

// Image optimization

gulp.task('images', function(){
	gulp.src(['./assets/img/raw/**/*.{png,jpg,gif}'])
		.pipe(newer('./assets/img/'))
		.pipe(rimraf({force: true}))
		.pipe(imagemin({
			optimizationLevel: 7,
			progressive: true,
			interlaced: true
		}))
		.pipe(gulp.dest('./assets/img/'))
		.pipe(notify({ message: 'Images task complete', onLast: true }));
});


// Lint for js files
gulp.task('lint', function() {
	gulp.src(['./assets/js/**/*.js','!node_modules/**', '!bower_components/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});


// BrowserSync Task
gulp.task('serve', ['styles', 'vendorsJs', 'scriptsJs', 'images'], function(){
	var files = [
		'**/*.php',
		'**/*.{png, jpg, gif}'
	];

	browserSync.init(files, {
		proxy: 'http://localhost:8888/',
		injectChanges: true
	});
	gulp.watch('./assets/img/raw/**/*', ['images']); 
 	gulp.watch('./assets/css/**/*.scss', ['lint', 'styles']);
 	gulp.watch('./assets/js/**/*.js', ['scriptsJs', 'vendorsJs', browserSync.reload]);


});


// Watch Task
 gulp.task('default', ['serve']);
 	


