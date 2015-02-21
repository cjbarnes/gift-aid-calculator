/* jshint node: true  */
'use strict';

var gulp         = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var csscomb      = require('gulp-csscomb');
var less         = require('gulp-less');
var minifyCSS    = require('gulp-minify-css');
var notify       = require('gulp-notify');
var rename       = require('gulp-rename');
var sourcemaps   = require('gulp-sourcemaps');
var uglify       = require('gulp-uglify');

// File paths.
var SRC = 'src/';
var SRCLESS = SRC + 'less/';
var DIST = 'dist/';
var EXAMPLE = 'example/gift-aid-calculator/';

// Process JavaScript and add to dist and example folders.
gulp.task('scripts', function() {

  return gulp.src(SRC + 'gift-aid-calculator.js')
    .pipe(sourcemaps.init())
    // Minify (keeping the @license comment).
    .pipe(uglify({
      preserveComments: 'some'
    }))
    .on('error', notify.onError({
      message: "Scripts Error: <%= error.message %>",
      title: "Uglify error",
      sound: 'Pop'
    }))
    // Output to /example and (with sourcemap) /dist.
    .pipe(rename({
      extname: '.min.js'
    }))
    .on('error', notify.onError({
      message: "Scripts Error: <%= error.message %>",
      title: "Rename error",
      sound: 'Pop'
    }))
    .pipe(gulp.dest(EXAMPLE))
    .pipe(sourcemaps.write('.'))
    .on('error', notify.onError({
      message: "Scripts Error: <%= error.message %>",
      title: "Sourcemaps error",
      sound: 'Pop'
    }))
    .pipe(gulp.dest(DIST))
    .pipe(notify({
      message: 'Scripts compiled successfully.',
      sound: false
    }));
});

/*
 * Compile Less, save to src folder, then process and add to dist and example
 * folders.
 */
gulp.task('styles', function() {

  return gulp.src(SRCLESS  + 'gift-aid-calculator.less')
    .pipe(sourcemaps.init())
    // Compile Less.
    .pipe(less())
    .on('error', notify.onError({
      message: "Styles Error: <%= error.message %>",
      title: "Less compilation error",
      sound: 'Pop'
    }))
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
    .on('error', notify.onError({
      message: "Styles Error: <%= error.message %>",
      title: "Autoprefixer error",
      sound: 'Pop'
    }))
    // Enforce the preferred CSS property order and format.
    .pipe(csscomb())
    .on('error', notify.onError({
      message: "Styles Error: <%= error.message %>",
      title: "CSScomb error",
      sound: 'Pop'
    }))
    // Output to src as compiled, non-minified CSS.
    .pipe(gulp.dest(SRC))
    // Minify.
    .pipe(minifyCSS())
    .on('error', notify.onError({
      message: "Styles Error: <%= error.message %>",
      title: "clean-css error",
      sound: 'Pop'
    }))
    // Output to /example and (with sourcemap) /dist.
    .pipe(rename({
      extname: '.min.css'
    }))
    .on('error', notify.onError({
      message: "Styles Error: <%= error.message %>",
      title: "Rename error",
      sound: 'Pop'
    }))
    .pipe(gulp.dest(EXAMPLE))
    .pipe(sourcemaps.write('.'))
    .on('error', notify.onError({
      message: "Styles Error: <%= error.message %>",
      title: "Sourcemaps error",
      sound: 'Pop'
    }))
    .pipe(notify({
      message: 'Styles compiled successfully.',
      sound: false
    }));
});

/*
 * Copy assets to the dist and example folders. Note that when called with
 * `gulp.watch()`, added files will **not** trigger this task.
 */
gulp.task('assets', function() {

  // Copy all files in assets to both /example and /dist.
  return gulp.src(SRC + 'assets/**/*.*', {read: false})
    .pipe(gulp.dest(EXAMPLE + 'assets/'))
    .pipe(gulp.dest(DIST + 'assets/'))
    .pipe(notify({
      message: 'Assets copied across successfully.',
      sound: false
    }));
});

/* Default action. Run all tasks, then watch for source file changes. */
gulp.task('default', ['scripts', 'styles', 'assets'], function() {

  // Watch JavaScript files.
  gulp.watch(SRC + 'gift-aid-calculator.js', ['scripts']);

  // Watch Less files.
  gulp.watch(SRCLESS + 'gift-aid-calculator.less', ['styles']);

  // Watch assets.
  gulp.watch(SRC + 'assets/**/*', ['assets']);

});
