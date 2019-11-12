const fs = require('fs');
const glob = require('glob');

import AWS = require('aws-sdk');
import { RunTaskRequest } from 'aws-sdk/clients/ecs';

// import yargs = require('yargs');

const ecs = new AWS.ECS({
  region: 'us-east-2'
});
let ckdContext;

try {
  ckdContext = JSON.parse(fs.readFileSync('infra/cdk.outputs.json').toString());
} catch (err) {
  if (err.code === 'ENOENT') {
    console.log(
      `Could not load infra/cdk.outputs.json, you might forgot deploy your CDK stack?`
    );
  } else {
    console.error(err);
  }

  process.exit(1);
}

const buildParams = (spec: string, browserName: string): RunTaskRequest => {
  return {
    cluster: ckdContext['ProtractorFargateStack.clusterName'],
    launchType: 'FARGATE',
    taskDefinition: `ProtractorTaskDefinition-${browserName}`,
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: ckdContext['ProtractorFargateStack.subnets'],
        securityGroups: ckdContext['ProtractorFargateStack.securityGroups'],
        assignPublicIp: 'ENABLED'
      }
    },
    overrides: {
      containerOverrides: [
        {
          environment: [
            {
              name: 'S3_BUCKET',
              value: ckdContext['ProtractorFargateStack.reportBucketName']
            }
            // {
            //   name: 'SYNC_REPORT',
            //   value: yargs['syncReport']
            // }
          ],
          command: [
            `protractor`,
            'dist/protractor.config.js',
            '--',
            `--headless`,
            `--disableChecks`,
            `--browser`,
            `${browserName}`,
            `--specs`,
            `**/${spec}`
          ],
          name: 'Protractor'
        }
      ]
    }
  };
};

const browsers = ['chrome', 'firefox'];

async function run() {
  // Run a Task for each spec file
  const tasks = glob
    .sync('**/*.spec.ts', {
      cwd: 'src'
    })
    .reduce((acc, next) => {
      acc.push(
        ...browsers.map(b => ({ browser: b, spec: next.replace('.ts', '.js') }))
      );

      return acc;
    }, []);

  try {
    const results = await Promise.all(
      tasks.map(task =>
        ecs.runTask(buildParams(task.spec, task.browser)).promise()
      )
    );

    console.log(JSON.stringify(results, undefined, 2));
  } catch (e) {
    console.error(e);
  }
}

run();
