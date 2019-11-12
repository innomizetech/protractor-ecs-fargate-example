import AWS = require('aws-sdk');

const s3 = new AWS.S3({ signatureVersion: 'v4' });

export const putObject = async ({
  bucketName,
  key,
  data,
  acl
}: {
  bucketName: string;
  key: string;
  data: string | Buffer;
  acl?: string;
}) => {
  if (!bucketName) {
    return;
  }

  console.log(`Uploading file ${key}...`);

  return s3
    .putObject({
      Bucket: bucketName,
      Key: key,
      Body: data,
      ACL: acl || 'private'
    })
    .promise();
};
