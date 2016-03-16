var gulp = require('gulp');
var gutil = require('gulp-util');
var _ = require('lodash');
var path = require('path');
var source = require('vinyl-source-stream');
var AWS = require('aws-sdk');
var awsConf = require('../config/aws-config');
var conf = require('./conf');

// CloudFormation outputs file
var CF_OUTPUTS_FILE = 'cf-outputs.json';

var cf = new AWS.CloudFormation({
  region: awsConf.region
});

var stackName = [conf.project.name, awsConf.stage].join('-');
var template = JSON.stringify(require('../config/cf-template'), null, 2);


/**
 * Validate CloudFormation template
 */
gulp.task('validate-cf-template', function(done) {
  cf.validateTemplate({ TemplateBody: template }, getCfLogger(done));
});


/**
 * Create a CloudFormation stack by uploading a template file to AWS
 */
gulp.task('create-stack', function(done) {

  var params = {
    StackName: stackName,
    Capabilities: ['CAPABILITY_IAM'],
    TemplateBody: template
  };

  cf.createStack(params, getCfLogger())
    .on('success', getStackActionPostProcessor(done))
    .on('error', function() {
      done();
    });
});


/**
 * Update a CloudFormation stack
 */
gulp.task('update-stack', function(done) {

  var params = {
    StackName: stackName,
    Capabilities: ['CAPABILITY_IAM'],
    TemplateBody: template
  };

  cf.updateStack(params, getCfLogger())
    .on('success', getStackActionPostProcessor(done))
    .on('error', function() {
      done();
    });
});


/**
 * Describe a stack
 */
gulp.task('describe-stack', function(done) {
  cf.describeStacks({ StackName: stackName }, getCfLogger(done));
});


/**
 * Delete a CloudFormation stack
 */
gulp.task('delete-stack', function(done) {
  cf.deleteStack({ StackName: stackName }, getCfLogger(done));
});


/**
 * Post process for a stack action
 */
function getStackActionPostProcessor(done) {

  return function stackActionPostProcess() {

    gutil.log(gutil.colors.yellow('Waiting for stack to complete work. This might take about 5 min ...'));

    waitForStackActionToComplete(function(err) {
      if (err) {
        getCfLogger().apply(null, [err]);
        done();
        return;
      }

      // Save stack outputs to a cf-outputs.json
      gutil.log('Saving stack outputs to', gutil.colors.magenta(path.join(conf.paths.config, CF_OUTPUTS_FILE)));
      saveStackOutputs(getCfLogger(done));
    });
  };
}


/**
 * Wait until a stack completes a create or update action
 */
function waitForStackActionToComplete(cb) {

  isStackActionCompleted(function(err, event) {
    if (err) {
      // Error out
      cb.apply(null, [err]);
    }
    else if (event) {
      // Completed
      cb.apply(null, [null, event]);
    }
    else {
      // Poll again after 10 seconds
      _.delay(function() {
        waitForStackActionToComplete(cb);
      }, 10000);
    }
  });
}


/**
 * Check if a stack completes create or update actions
 */
function isStackActionCompleted(cb) {

  cf.describeStackEvents({ StackName: stackName }, function(err, data) {
    if (err) {
      cb.apply(null, [err]);
      return;
    }

    // Get CloudFormation stack related events
    var cfEvents = _.filter(data.StackEvents, function(event) {
      return event.ResourceType === 'AWS::CloudFormation::Stack';
    });

    if (cfEvents.length > 0 && cfEvents[0].ResourceStatus.endsWith('_COMPLETE')) {
      // Found complete event
      cb.apply(null, [null, cfEvents[0]]);
    }
    else {
      // Didn't find complete event
      cb.apply(null, [null, null]);
    }
  });
}


/**
 * Write stack outputs to a cf-outputs.json
 */
function saveStackOutputs(cb) {
  cf.describeStacks({ StackName: stackName }, function(err, data) {

    if (err) {
      cb.apply(null, [err]);
      return;
    }

    //
    // Extract outputs from the describeStacks response
    //

    var outputs = {};
    _.forEach(data.Stacks[0].Outputs, function(output) {
      outputs[output.OutputKey] = output.OutputValue;
    });

    //
    // Write outputs to config/cf-outputs.json which might be
    // used to create lambda functions later.
    //

    var stream = source(CF_OUTPUTS_FILE);
    stream.end(JSON.stringify(outputs, null, 2));
    stream.pipe(gulp.dest(path.join(conf.paths.config, '/')));

    cb.apply(null, [null, outputs]);
  });
}


/**
 * Return a callback function that handles CloudFormation SDK response
 */
function getCfLogger(done) {

  return function logCfResponse(err, data) {
    if (err) {
      gutil.log(gutil.colors.red('[CloudFormation]'), 'Error:', err.toString());
      gulp.emit('end');
    }
    else {
      gutil.log(gutil.colors.cyan('[CloudFormation]'), 'Response:', data);
    }

    if (done) {
      done();
    }
  }
}
