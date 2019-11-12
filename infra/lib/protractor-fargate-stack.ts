import path = require('path');
import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import ecs = require('@aws-cdk/aws-ecs');
import iam = require('@aws-cdk/aws-iam');
import { PolicyStatement } from '@aws-cdk/aws-iam';
import logs = require('@aws-cdk/aws-logs');
import { Bucket } from '@aws-cdk/aws-s3/lib/bucket';
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';

import { ProtractorFargateStackProps } from './interfaces';

export class ProtractorFargateStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props?: ProtractorFargateStackProps
  ) {
    super(scope, id, props);

    const vpc = this.constructVpc(props);
    const cluster = new ecs.Cluster(this, 'ProtractorE2ECluster', { vpc });
    const bucket = this.constructReportBucket(props);
    this.constructTaskDef(props, bucket);

    // Write outputs
    new cdk.CfnOutput(this, 'ecsClusterArn', {
      value: cluster.clusterArn
    });
    new cdk.CfnOutput(this, 'ecsClusterName', {
      value: cluster.clusterName
    });
    new cdk.CfnOutput(this, 'reportBucketName', {
      value: props.reportBucketName
    });
  }

  private constructVpc(props: ProtractorFargateStackProps) {
    if (props.useDefaultVpc) {
      return ec2.Vpc.fromLookup(this, 'VPC', {
        isDefault: true
      });
    }

    return new ec2.Vpc(this, 'EcsFargateVPC', {
      cidr: '172.15.0.0/16',
      maxAzs: 1,
      // natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 16,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC
        }
        // In case if you want to run your task under private subnet
        // then uncomment below lines and change subnetSelection
        // options above to PRIVATE
        // {
        //   cidrMask: 20,
        //   name: 'Private',
        //   subnetType: ec2.SubnetType.PRIVATE
        // }
      ]
    });
  }

  private constructReportBucket(props: ProtractorFargateStackProps) {
    return new Bucket(this, 'ProtractorTestReportBucket', {
      bucketName: props.reportBucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
  }

  private constructTaskDef(props: ProtractorFargateStackProps, bucket: Bucket) {
    // Role for task
    const taskRole = this.constructTaskRole(bucket);

    // Define docker image assets that allows to build and push docker images to ECR automatically
    // See: https://docs.aws.amazon.com/cdk/latest/guide/assets.html for more details
    const asset = new DockerImageAsset(this, 'ProtractorTestImage', {
      directory: path.join(__dirname, '../../'),
      exclude: ['cdk.out', 'node_modules']
    });

    const getBrowserName = (image: string): string =>
      image.substring(image.indexOf('-') + 1, image.indexOf(':'));

    // Create a log group to write log streams of all task definitions
    const logGroup = new logs.LogGroup(this, 'ProtractorLogGroup', {
      retention: 1
    });

    props.supportedSeleniumImages.forEach((image: string) => {
      const browserName = getBrowserName(image);
      // Task definition for Chrome browser
      const taskDef = new ecs.FargateTaskDefinition(
        this,
        `${browserName}ProtractorTaskDefinition`,
        {
          family: `ProtractorTaskDefinition-${browserName}`,
          memoryLimitMiB: 1024,
          cpu: 256,
          taskRole,
          volumes: [{ name: 'data-volume' }]
        }
      );

      taskDef
        .addContainer('Protractor', {
          // Note - adding imageUri will throw invalid docker ref of the task definition
          image: ecs.ContainerImage.fromEcrRepository(asset.repository),
          logging: new ecs.AwsLogDriver({
            logGroup,
            streamPrefix: `protractor-e2e-${browserName}`
          }),
          environment: {
            S3_BUCKET: bucket.bucketName
          }
        })
        .addMountPoints({
          containerPath: '/home/protractor-test',
          sourceVolume: 'data-volume',
          readOnly: false
        });

      this.addSeleniumContainer(taskDef, image, props.enableSeleniumLog);
    });
  }

  private addSeleniumContainer(
    taskDef: ecs.FargateTaskDefinition,
    seleniumImage: string,
    writeLog?: boolean
  ) {
    taskDef
      .addContainer('Selenium', {
        image: ecs.ContainerImage.fromRegistry(seleniumImage),
        logging:
          writeLog &&
          new ecs.AwsLogDriver({
            streamPrefix: seleniumImage,
            logRetention: 1
          })
      })
      .addMountPoints({
        containerPath: '/home/protractor-test',
        sourceVolume: 'data-volume',
        readOnly: false
      });
  }

  private constructTaskRole(bucket: Bucket) {
    const taskRole = new iam.Role(this, 'EcsTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com')
    });

    // Note: we can add more policy here
    taskRole.addToPolicy(
      new PolicyStatement({
        resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
        actions: ['s3:PutObject']
      })
    );

    return taskRole;
  }
}
