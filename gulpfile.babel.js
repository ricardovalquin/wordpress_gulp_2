// plugins
import gulp from 'gulp';
import browserSync from 'browser-sync'; // Asynchronous browser loading on .scss file changes
import autoprefixer from 'gulp-autoprefixer'; // Autoprefixing magic
import minifycss from 'gulp-uglifycss';
import filter from 'gulp-filter';
import uglify from 'gulp-uglify';
import imagemin from 'gulp-imagemin';
import newer from 'gulp-newer';
import rename from 'gulp-rename';
import concat from 'gulp-concat';
import notify from 'gulp-notify';
import cmq from 'gulp-combine-media-queries';
import runSequence from 'gulp-run-sequence';
import sass from 'gulp-sass';
import plugins from 'gulp-load-plugins';
import ignore from 'gulp-ignore'; // Helps with ignoring files and directories in our run tasks
import rimraf from 'gulp-rimraf'; // Helps with removing files and directories in our run tasks
import zip from 'gulp-zip'; // Using to zip up our packaged theme into a tasty zip file that can be installed in WordPress!
import plumber from 'gulp-plumber'; // Helps prevent stream crashing on errors
import cache from 'gulp-cache';
import sourcemaps from 'gulp-sourcemaps';
import eslint from 'gulp-eslint';
import babel from 'gulp-babel';
const reload = browserSync.reload;

// plumber variable for handled errors
let plumberErrorHandler = {errorHandler: notify.onError({
		title: 'Gulp',
		message: 'Error <%= error.message %>'
	})
};

// boilerplate a new theme
import json from 'json-file';
import cpr from 'cpr';

let themeName = json.read('./package.json').get('themeName');
let themeDir = '../' + themeName;


// Init task to create a new theme
gulp.task('init', () => {
	cpr('./theme_boilerplate', themeDir, (err, files) => {
		console.log('theme files and directories structure succefully created');
	});
	
	cpr('./package.json', themeDir, (err, files) => {
		console.log('package.json file succefully copied');
	});

	cpr('./gulpfile.babel.js', themeDir, (err, files) => {
		console.log('gulpfile.js file succefully copied');
	});

	cpr('./.babelrc', themeDir, (err, files) => {
		console.log('.babelrc file succefully copied');
	});

	cpr('./bower.json', themeDir, (err, files) => {
		console.log('bower.json file succefully copied');
	});

});


// Styles task

gulp.task('styles', () => {
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

gulp.task('vendorsJs', () => {
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

gulp.task('scriptsJs', () => {
	gulp.src('./assets/js/custom/*.js')
		.pipe(plumber(plumberErrorHandler))
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(concat('custom.js'))
		.pipe(gulp.dest('./assets/js/'))
		.pipe(rename({
			basename: 'custom',
			suffix: '.min'
		}))
		.pipe(uglify())
		.pipe(sourcemaps.write('./assets/js'))
		.pipe(gulp.dest('./assets/js/'))
		.pipe(notify({ message: 'Custom scripts task complete', onLast: true }));

});

// Image optimization

gulp.task('images', () => {
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
gulp.task('lint', () =>  {
	gulp.src(['./assets/js/**/*.js','!node_modules/**', '!bower_components/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});


// BrowserSync Task
gulp.task('serve', ['styles', 'vendorsJs', 'scriptsJs', 'images', 'lint'], () => {
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
 	


