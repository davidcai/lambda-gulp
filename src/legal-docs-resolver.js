var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var Promise = require('promise');
var _ = require('lodash');


function LegalDocsResolver() {
  var me = this;

  me.getS3Files = function() {
    var promise = new Promise(function(resolve, reject) {

      // Get S3 bucket object list
      s3.listObjects({ Bucket: 'legaldoc' }, function(err, data) {
        if (err) {
          console.log(err, err.stack);
          reject(err);
        }
        else {
          var files = _.pluck(data.Contents, 'Key');
          // console.log(files);
          resolve(files);
          // resolve(data);
        }
      });
    });

    return promise;
  };
}


module.exports = LegalDocsResolver;
