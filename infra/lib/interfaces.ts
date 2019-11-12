import { StackProps } from '@aws-cdk/core';

export interface ProtractorFargateStackProps extends StackProps {
  useDefaultVpc?: boolean;
  reportBucketName: string;
  repoName: string;
  enableSeleniumLog?: boolean;
  supportedSeleniumImages: string[];
}
