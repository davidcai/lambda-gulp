var conf = require('../gulp/conf');
var awsConf = require('./aws-config');


module.exports = {
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": conf.project.name + " resources",
  "Parameters": {
    "aaProjectName": {
      "Type": "String",
      "Default": conf.project.name,
      "AllowedValues": [
        conf.project.name
      ]
    },
    "aaProjectDomain": {
      "Type": "String",
      "Default": "financialengines.com"
    },
    "aaStage": {
      "Type": "String",
      "Default": awsConf.stage
    },
    "aaDataModelStage": {
      "Type": "String",
      "Default": awsConf.stage
    },
    "aaNotficationEmail": {
      "Type": "String",
      "Default": "dcai@financialengines.com"
    },
    "aaDefaultDynamoRWThroughput": {
      "Type": "String",
      "Default": "1"
    }
  },
  "Resources": {
    "IamRoleLambda": {
      "Type": "AWS::IAM::Role",
      "Properties": {
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "Service": [
                  "lambda.amazonaws.com"
                ]
              },
              "Action": [
                "sts:AssumeRole"
              ]
            }
          ]
        },
        "Path": "/"
      }
    },
    "IamRoleApiGateway": {
      "Type": "AWS::IAM::Role",
      "Properties": {
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "Service": [
                  "apigateway.amazonaws.com"
                ]
              },
              "Action": [
                "sts:AssumeRole"
              ]
            }
          ]
        },
        "Path": "/"
      }
    },
    "IamInstanceProfileLambda": {
      "Type": "AWS::IAM::InstanceProfile",
      "Properties": {
        "Path": "/",
        "Roles": [
          {
            "Ref": "IamRoleLambda"
          }
        ]
      }
    },
    "IamInstanceProfileApiGateway": {
      "Type": "AWS::IAM::InstanceProfile",
      "Properties": {
        "Path": "/",
        "Roles": [
          {
            "Ref": "IamRoleApiGateway"
          }
        ]
      }
    },
    "IamGroupLambda": {
      "Type": "AWS::IAM::Group",
      "Properties": {
        "Path": "/"
      }
    },
    "IamGroupApiGateway": {
      "Type": "AWS::IAM::Group",
      "Properties": {
        "Path": "/"
      }
    },
    "IamPolicyLambda": {
      "Type": "AWS::IAM::Policy",
      "Properties": {
        "PolicyName": {
          "Fn::Join": [
            "_",
            [
              {
                "Ref": "aaProjectName"
              },
              {
                "Ref": "aaStage"
              },
              "lambda"
            ]
          ]
        },
        "PolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
              ],
              "Resource": {
                "Fn::Join": [
                  ":",
                  [
                    "arn:aws:logs",
                    {
                      "Ref": "AWS::Region"
                    },
                    "*:*"
                  ]
                ]
              }
            },
            {
              "Effect": "Allow",
              "Action": [
                "s3:Get*",
                "s3:List*"
              ],
              "Resource": "*"
            }
          ]
        },
        "Roles": [
          {
            "Ref": "IamRoleLambda"
          }
        ],
        "Groups": [
          {
            "Ref": "IamGroupLambda"
          }
        ]
      }
    },
    "IamPolicyApiGateway": {
      "Type": "AWS::IAM::Policy",
      "Properties": {
        "PolicyName": {
          "Fn::Join": [
            "_",
            [
              {
                "Ref": "aaProjectName"
              },
              {
                "Ref": "aaStage"
              },
              "api-gateway"
            ]
          ]
        },
        "PolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Action": [
                "lambda:InvokeFunction"
              ],
              "Resource": {
                "Fn::Join": [
                  ":",
                  [
                    "arn:aws:lambda",
                    {
                      "Ref": "AWS::Region"
                    },
                    "*:*"
                  ]
                ]
              }
            }
          ]
        },
        "Roles": [
          {
            "Ref": "IamRoleApiGateway"
          }
        ],
        "Groups": [
          {
            "Ref": "IamGroupApiGateway"
          }
        ]
      }
    }
  },
  "Outputs": {
    "IamRoleArnLambda": {
      "Description": "ARN of the lambda IAM role",
      "Value": {
        "Fn::GetAtt": [
          "IamRoleLambda",
          "Arn"
        ]
      }
    },
    "IamRoleArnApiGateway": {
      "Description": "ARN of the api gateway IAM role",
      "Value": {
        "Fn::GetAtt": [
          "IamRoleApiGateway",
          "Arn"
        ]
      }
    }
  }
};
