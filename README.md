# vue-express-lambda-mongo
AWS CDK Example of Vue.js with Lambda using Express.js and Mongo

# Summary

This project is a full stack demonstration of Vue.js with Express.js, Lambda, and AWS DocumentDB utilizing MongoDB APIs.  The deployment is created using the AWS CDK.

The general application presents a generic guestbook, where you can add your name to the list.  The two exposed API paths are to add an entry and to retrieve all guestbook entries.

This project also demonstrates how to use Express.js locally, in addition to deploying remotely to AWS Lambda.  There are many techniques using serverless to test locally, this is a simple option using the aws-serverless-express project.

Typescript is also used throughout the project with the AWS CDK and AWS Lambda.

# Building

In order to build the project, run the following:

* Run npm install from the root directory.
* Run npm install from within the guestbook-server directory.
* From the root directory, run npm run build. (this will build all projects)

# Running Locally

In order to test locally, run the following command from the guestbook-server directory:

```LOCAL_MODE=1 node server.js```

This should output that the server is running on port 8000.  From there, navigate to localhost:8000/demo-site/.  When running locally, MongoDB APIs are not utilized on the backend, but a mock implementation.

# Deploying to AWS

In order to deploy to AWS, perform the following.

* Ensure you have the AWS CDK installed.
* Run cdk synth from the main directory to make sure the project builds.
* Run cdk deploy --all in the main directory.

Don't forget to run cdk destroy --all to tear down everything after you are done!

# Testing in AWS

After you deploy using the CDK tools, you will see a URL output that looks similar to below.

```FullVueProtoStack.demohtmllambdaEndpointXXXX=[SOME URL]```

Take the URL and add /demo-site/ and then paste into your browser of choice.  At this point, you should see the Express application served from the Lambda API.

# Corresponding article

A more in-depth explanation can be found here in Medium:

https://drewword.medium.com/api-gateway-express-js-greedy-paths-to-a-full-stack-with-vue-js-c11adfc1ecd3

