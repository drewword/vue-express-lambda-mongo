#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FullVueProtoStack } from '../lib/full-vue-proto-stack';
import { LambdaEnvironment } from '../lib/lambda-environment';

const app = new cdk.App();

// Create the 1st stack that sets everything up
const fullStack = new FullVueProtoStack(app, 'FullVueProtoStack',
    {
        // NOTE: This is a deviation from the standard template,
        // but is required to pass your account through.
        env: {
            'account': process.env['CDK_DEFAULT_ACCOUNT'], 
            'region': process.env['CDK_DEFAULT_REGION'] 
        }
    }
);

new LambdaEnvironment(app,"LambdaModEnvironment", {
    expressAppLambda: fullStack.expressAppLambda,
    apiGatewayEndpoint: fullStack.apiGatewayEndpoint
});
