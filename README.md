# Overview

An example of how to run protractor test on AWS Fargate (ECS Fargate).

## Prerequisites

- `npm` and `Node.js 10.16.0` are prerequisites to have

## Install Packages

```sh
npm i -g aws-cdk ts-node
npm install
```

## Configuration

In case if you want to load some variables before running test, then:

- Uncomment line #6 of the `protractor.config.ts` file
- You have to create a ".env" file based on the `.env.example` file

```sh
cp .env.example .env
```

## Run Tests

Before running Protractor test on your local machine, you need to update and start webdriver

```sh
npm run webdriver:update && npm run webdriver:start
```

Test all specs with `chrome` and `firefox` browsers

```sh
npm test
```

Run with chrome browser only

```sh
npm run test:chrome
```

Or you can run with firefox

```sh
npm run test:firefox
```

Run test in headless mode

```sh
npm run test:headless
```

## Deploy

Deploy CDK app to your AWS

```sh
cd infra
cdk deploy
```

Once the CDK deploy command is finished, you can run ECS task to start protractor test.

Create the cdk.outputs.json in the `infra` directory likes below:

```json
{
  "ProtractorFargateStack.region": "us-east-2",
  "ProtractorFargateStack.clusterName": "ProtractorFargateStack-ProtractorE2EClusterD3252608-117VTZR3YHQ83",
  "ProtractorFargateStack.subnets": [
    "subnet-xxxxxxxxxxxxxxxxx",
    "subnet-xxxxxxxxxxxxxxxxx",
    "subnet-xxxxxxxxxxxxxxxxx"
  ],
  "ProtractorFargateStack.securityGroups": ["sg-xxxxxxxxxxxxxxxxx"],
  "ProtractorFargateStack.reportBucketName": "protractor-e2e-example"
}
```

Then running the `test-runner.ts` helper file to load specs and start ECS tasks.
For each spec in the `src/specs` directory, we will start a ECS tasks.

```node
ts-node test-runner.ts
```
