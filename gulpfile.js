'use strict';

var $ = require('gulp-load-plugins')();
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var config = require('./config/gulp.properties.json');
var del = require('del');
var gulp = require('gulp');
var source = require('vinyl-source-stream');

gulp.task('clean', function(next) {
  $.util.log('[clean] ', $.util.colors.cyan('Cleaning ' + config.path.bundle + ' folder...'));
  return del([config.path.bundle + '/**/*'], next);
});

gulp.task('javascript', ['clean'], function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: config.path.entries,
    debug: true
  });

  return b.bundle()
    .pipe(source('vendor.js'))
    .pipe(buffer())
    .pipe($.sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe($.uglify())
        .on('error', $.util.log)
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(config.path.bundle));
});

gulp.task('webserver', function() {
  return gulp.src(config.path.dest)
    .pipe($.webserver(config.webserver));
});

gulp.task('default', ['javascript', 'webserver']);
