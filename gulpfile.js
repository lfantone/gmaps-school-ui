'use strict';

var $ = require('gulp-load-plugins')();
var config = require('./config/gulp.properties.json');
var gulp = require('gulp');

gulp.task('webserver', function() {
  return gulp.src(config.path.DEST)
    .pipe($.webserver(config.webserver));
});

gulp.task('default', ['webserver']);
