var gulp = require('gulp');
var del = require('del');
var path = require('path');
var conf = require('./conf');


gulp.task('clean', function () {
  return del([path.join(conf.paths.dist, '/'), path.join(conf.paths.tmp, '/')]);
});
