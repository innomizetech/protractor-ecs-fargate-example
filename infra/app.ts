import 'source-map-support/register';
import cdk = require('@aws-cdk/core');

import { ProtractorFargateStack } from './lib/protractor-fargate-stack';

const env = {
  region: 'us-east-2',
  account: process.env.CDK_DEFAULT_ACCOUNT
};

const app = new cdk.App();

new ProtractorFargateStack(app, 'ProtractorFargateStack', {
  description:
    'The AWS CloudFormation template for running Protractor test on AWS Fargate',
  env,
  useDefaultVpc: true,
  reportBucketName: 'protractor-e2e-example',
  repoName: 'protractor-e2e-example',
  supportedSeleniumImages: [
    'selenium/standalone-chrome:3.141.59-dubnium',
    'selenium/standalone-firefox:3.141.59-dubnium'
  ]
});
