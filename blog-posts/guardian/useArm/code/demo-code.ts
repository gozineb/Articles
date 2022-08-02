// serverless.ts
import * as AwsConfig from 'serverless/aws';

const serverlessConfiguration: AwsConfig.Serverless = {
  ...
  provider:
    ...
    architecture: arm64
  }
