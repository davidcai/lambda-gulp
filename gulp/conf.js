var gutil = require('gulp-util');


/**
 * Project information from package.json file
 */
exports.project = require('../package.json');


/**
 * The main paths of your project
 */
exports.paths = {
  src: 'src',
  dist: 'dist',
  tmp: '.tmp',
  config: 'config'
};


/**
 * Common implementation for an error handler of a Gulp plugin
 */
exports.errorHandler = function(title) {
  'use strict';

  return function(err) {
    gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
    this.emit('end');
  };
};
