/**
 * Gulp tasks to streamline AWS Lambda development.
 * References:
 * - [node-aws-lambda module](https://github.com/ThoughtWorksStudios/node-aws-lambda)
 * - [Gulp Lambda Boilerplate](https://github.com/austinrivas/gulp-lambda-boilerplate)
 */

var gulp = require('gulp');
var zip = require('gulp-zip');
var replace = require('gulp-replace');
var runSequence = require('run-sequence');
var awsLambda = require("node-aws-lambda");
var path = require('path');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var conf = require('./conf');

var LAMBDA_CONFIG_FILE = 'lambda-config.js';
var LAMBDA_ZIP_FILE = 'lambda.zip';


/**
 * Browserify all JS into one file, minify it, and zip it
 */
gulp.task('bundle-lambda', function() {
  var b = browserify({
    entries: path.join(process.cwd(), conf.paths.src, '/index.js'),
    node: true,
    standalone: 'lambda'
  });
  b.exclude('aws-sdk');

  return b.bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(zip(LAMBDA_ZIP_FILE))
    .on('error', conf.errorHandler('Lambda bundle'))
    .pipe(gulp.dest(conf.paths.dist));
});


/**
 * Copy lambda-config.js to .tmp/ and insert Lambda ARN
 */
gulp.task('resolve-lambda-config', function() {

  var cfOutputs = require('../' + conf.paths.config + '/cf-outputs.json');

  return gulp.src(path.join(conf.paths.config, LAMBDA_CONFIG_FILE))
    .pipe(replace('<%= IamRoleLambda %>', cfOutputs.IamRoleArnLambda))
    .pipe(gulp.dest(conf.paths.tmp));
});


/**
 * Upload bundled lambda zip to AWS
 */
gulp.task('upload-lambda-bundle', ['resolve-lambda-config'], function(done) {
  awsLambda.deploy(
    path.join(conf.paths.dist, LAMBDA_ZIP_FILE),
    require(path.join(process.cwd(), conf.paths.tmp, LAMBDA_CONFIG_FILE)),
    done
  );
});


gulp.task('deploy-lambda', function(done) {
  return runSequence(
    ['clean'],
    ['bundle-lambda'],
    ['upload-lambda-bundle'],
    done
  );
});
