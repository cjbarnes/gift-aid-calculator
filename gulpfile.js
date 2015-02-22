/* jshint node: true  */
'use strict';

var gulp         = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var csscomb      = require('gulp-csscomb');
var less         = require('gulp-less');
var minifyCSS    = require('gulp-minify-css');
var plumber      = require('gulp-plumber');
var notify       = require('gulp-notify');
var rename       = require('gulp-rename');
var sourcemaps   = require('gulp-sourcemaps');
var uglify       = require('gulp-uglify');

// File paths.
var src = 'src/';
var srcLess = src + 'less/';
var dist = 'dist/';
var example = 'example/gift-aid-calculator/';

// Process JavaScript and add to dist and example folders.
gulp.task('scripts', function() {

  return gulp.src(src + 'gift-aid-calculator.js')
    // Error handling: notify on error.
    .pipe(plumber(notify.onError({
      title: 'Error compiling gift-aid-calculator.js',
      message: "Scripts Error: <%= error.message %>",
      sound: 'Pop'
    })))
    .pipe(sourcemaps.init())
    // Minify (keeping the @license comment).
    .pipe(uglify({
      preserveComments: 'some'
    }))
    // Output to /example and (with sourcemap) /dist.
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest(example))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dist));
});

/*
 * Compile Less, save to src folder, then process and add to dist and example
 * folders.
 */
gulp.task('styles', function() {

  return gulp.src(srcLess  + 'gift-aid-calculator.less')
    // Error handling: notify on error.
    .pipe(plumber(notify.onError({
      title: 'Error compiling gift-aid-calculator.less',
      message: "Styles Error: <%= error.message %>",
      sound: 'Pop'
    })))
    .pipe(sourcemaps.init())
    // Compile Less.
    .pipe(less())
    // Automated support for old browsers.
    .pipe(autoprefixer({
      browsers: [
        '> 1% in GB',
        'last 2 versions',
        'Firefox ESR',
        'Opera 12.1',
        'ie >= 8'
      ]
    }))
    // Enforce the preferred CSS property order and format.
    .pipe(csscomb())
    // Output to src as compiled, non-minified CSS.
    .pipe(gulp.dest(src))
    // Minify.
    .pipe(minifyCSS())
    // Output to /example and (with sourcemap) /dist.
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(gulp.dest(example))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dist));
});

/*
 * Copy assets to the dist and example folders. Note that when called with
 * `gulp.watch()`, added files will **not** trigger this task.
 */
gulp.task('assets', function() {

  // Copy all files in assets to both /example and /dist.
  return gulp.src(src + 'assets/**/*.*', {read: false})
    .pipe(gulp.dest(example + 'assets/'))
    .pipe(gulp.dest(dist + 'assets/'));
});

/* Default action. Run all tasks, then watch for source file changes. */
gulp.task('default', ['scripts', 'styles', 'assets'], function() {

  // Watch JavaScript files.
  gulp.watch(src + 'gift-aid-calculator.js', ['scripts']);

  // Watch Less files.
  gulp.watch(srcLess + 'gift-aid-calculator.less', ['styles']);

  // Watch assets.
  gulp.watch(src + 'assets/**/*', ['assets']);

});
