import * as cdk from '@aws-cdk/core';
import * as docdb from '@aws-cdk/aws-docdb';
import * as ec2 from '@aws-cdk/aws-ec2';
import { SecretValue, RemovalPolicy, Duration } from '@aws-cdk/core';
import lambda = require("@aws-cdk/aws-lambda");
import apigateway = require("@aws-cdk/aws-apigateway");
import { SecurityGroupProps } from '@aws-cdk/aws-ec2';

export class FullVueProtoStack extends cdk.Stack {

    expressAppLambda: lambda.Function;
    apiGatewayEndpoint: apigateway.RestApi;

    readonly DEMO_ADMIN_USER = "demodbadmin";
    readonly DEMO_DB_PASSWORD = "PlainPassword1";

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const defaultVPC = this.getDefaultVPC();
        const cluster = this.createDocumentDBCluster(defaultVPC);
        const lambdaSecurityGroup = this.createSecurityGroupLink(cluster,defaultVPC);
        this.expressAppLambda = this.createVueJSLambda(defaultVPC,
            cluster,lambdaSecurityGroup);
        this.apiGatewayEndpoint = this.createAPIGatewayEndpoint(this.expressAppLambda);
    }

    /**
     * Create the API Gateway endpoint with a greedy qualifier to 
     * allow Express.js endpoints to be exposed easily.
     * @param lambdaFunction 
     */
    createAPIGatewayEndpoint(lambdaFunction:lambda.Function):apigateway.RestApi {
        var apiEndpoint = new apigateway.RestApi(this, "demohtml-lambda", {
            restApiName: "RESTExpress",
            description: "Simple hello world lambda."
        });
        apiEndpoint.root.addProxy({
            defaultIntegration:
                new apigateway.LambdaIntegration(lambdaFunction)
        });
        return apiEndpoint;
    }

    /**
     * Create the lambda that will serve the express application using
     * a single Lambda function.
     * @param vpc 
     * @param cluster 
     * @param lambdaSecurityGroup 
     */
    createVueJSLambda(vpc:ec2.IVpc,
                      cluster:docdb.DatabaseCluster,
                      lambdaSecurityGroup:ec2.SecurityGroup):lambda.Function {
        const clusterEndpoint = cluster.clusterEndpoint;
        const mongoURI = clusterEndpoint.socketAddress +
            "&ssl_ca_certs=rds-bundle.pem&replicaSet=rs0&" + 
            "readPreference=secondaryPreferred&retryWrites=false";

        const vueLambda = new lambda.Function(this,
            "LambdaDemoConnect", {
            runtime: lambda.Runtime.NODEJS_10_X,
            timeout: Duration.seconds(20),
            code: lambda.Code.fromAsset("guestbook-server"),
            vpc: vpc,
            allowPublicSubnet: true,
            environment: {
                MONGODB_URI: mongoURI,
                MONGO_USER: this.DEMO_ADMIN_USER,
                MONGO_PASS: this.DEMO_DB_PASSWORD
            },
            securityGroups: [lambdaSecurityGroup],
            handler: "server.handler",
        });
        return vueLambda;
    }

    /**
     * Create a new security group for the lambda and link to
     * the security group of document DB
     * @param cluster 
     * @param vpc 
     */
    createSecurityGroupLink(cluster:docdb.DatabaseCluster, 
                vpc:ec2.IVpc):ec2.SecurityGroup {
        const dbSecurityGroupId = cluster.securityGroupId;
        const dbSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this,
            'DBSecurityGroup', dbSecurityGroupId, {
            mutable: true
        });
        const lambdaSecurityGroupProps: SecurityGroupProps = {
            vpc: vpc,
            allowAllOutbound: false,
            securityGroupName: "LambdaDocDBSecGroup",
            description: "Lambda to DocDB sec group"
        }
        const lambdaSecurityGroup = new ec2.SecurityGroup(this,
            "LambdaSecGroup", lambdaSecurityGroupProps);
        lambdaSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(),
            ec2.Port.allTraffic(),
            'Open Lambda');
        dbSecurityGroup.connections.allowFrom(lambdaSecurityGroup,
            ec2.Port.tcp(27017), 'From Lambda')
        return lambdaSecurityGroup;
    }

    /**
     * Create document DB cluster
     * @param vpc 
     */
    createDocumentDBCluster(vpc:ec2.IVpc):docdb.DatabaseCluster {
        return  new docdb.DatabaseCluster(this, 'Database', {
            removalPolicy: RemovalPolicy.DESTROY,
            masterUser: {
                username: this.DEMO_ADMIN_USER,
                password: SecretValue.plainText(this.DEMO_DB_PASSWORD)
            },
            instanceProps: {
                instanceType: ec2.InstanceType.of(
                    ec2.InstanceClass.T3,
                    ec2.InstanceSize.MEDIUM),
                vpcSubnets: {
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                vpc: vpc
            }
        });
    }

    /**
     * getDefaultVPC
     * - obtain the default VPC for demo resources.
     */
    getDefaultVPC():ec2.IVpc {
        return ec2.Vpc.fromLookup(this, 'MyExistingVPC',
            {
                isDefault: true,
            }
        );
    }

}
