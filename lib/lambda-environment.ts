import * as cdk from '@aws-cdk/core';
import lambda = require("@aws-cdk/aws-lambda");
import apigateway = require("@aws-cdk/aws-apigateway");

interface LambdaProps extends cdk.StackProps {
    expressAppLambda:lambda.Function,
    apiGatewayEndpoint:apigateway.RestApi
}

/**
 * LambdaEnvironment
 * Add the base url to the lambda as an environment variable.
 * This needs to be done after the initial stack is created. 
 */
export class LambdaEnvironment extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: LambdaProps) {
        super(scope, id, props);

        let lambda = props?.expressAppLambda;
        let api = props?.apiGatewayEndpoint;
        let theURL = "https://" + 
                     api?.restApiId + 
                     ".execute-api." + this.region + "." +
                     "amazonaws.com/prod" 
        lambda?.addEnvironment("BASE_URL", theURL);

    }

}
