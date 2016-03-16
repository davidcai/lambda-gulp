/**
 * See lambda-config.js example at https://github.com/ThoughtWorksStudios/node-aws-lambda
 */

var awsConf = require('../config/aws-config');

module.exports = {
  // accessKeyId: '<access key id>',  // Optional
  // secretAccessKey: '<secret access key>',  // Optional
  profile: awsConf.profile, // Optional for loading AWS credientail from custom profile
  region: awsConf.region,
  handler: 'index.handler', // The fully qualified name of the handler function
  role: '<%= IamRoleLambda %>', // Role ARN
  functionName: 'getS3Files', // Lambda function name
  description: 'Get a list of files from a S3 bucket',
  timeout: 10,
  memorySize: 1024,
  runtime: 'nodejs'
  // ,
  // eventSource: {
  //   EventSourceArn: '<event source such as kinesis ARN>',
  //   BatchSize: 200,
  //   StartingPosition: "TRIM_HORIZON"
  // }
};
