// Because this file references protractor, you'll need to have it as a project
// dependency to use 'protractor/globals'. Here is the full list of imports:
//
// import {browser, element, by, By, $, $$, ExpectedConditions}
//   from 'protractor';
//
// The jasmine typings are brought in via DefinitelyTyped ambient typings.
import { browser } from 'protractor';
import { execSync } from 'child_process';

const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

import { resolve } from 'path';

import { FileUploadPage } from '../pages/fup.page';
import { WaitHelper } from '../helpers/wait-helper';
import { putObject } from '../helpers/s3-helper';

const dataDir = './data';
const dataCollectionPage = new FileUploadPage();

describe('Sample file upload', () => {
  beforeAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

    await browser.get('https://cgi-lib.berkeley.edu/ex/fup.html');

    await writeFile(
      `${dataDir}/sample.txt`,
      `This is a generated when running Protractor test at ${new Date().toISOString()}`
    );
  });

  it('should able to upload file', async () => {
    await dataCollectionPage.fillForm({
      note: 'This is a sample file',
      filePath: `${dataDir}/sample.txt`
    });

    dataCollectionPage.send();
    await WaitHelper.waitUntilUrlContains(
      'https://cgi-lib.berkeley.edu/ex/fup.cgi'
    );

    await dataCollectionPage.takeScreenshot('upload-result.png');
  });

  afterAll(async () => {
    const timestamp = new Date().toISOString();
    const readSimpleFile = readFile(resolve('data/sample.txt'), {
      encoding: 'utf8'
    });
    const readScreenshot = readFile(resolve('upload-result.png'));

    const simpleFileBuffer = await readSimpleFile;
    const screenshotFileBuffer = await readScreenshot;

    await putObject({
      bucketName: process.env.S3_BUCKET,
      key: `${timestamp}/sample.txt`,
      data: simpleFileBuffer
    });
    await putObject({
      bucketName: process.env.S3_BUCKET,
      key: `${timestamp}/upload-result.png`,
      data: screenshotFileBuffer
    });

    if (process.env.SYNC_REPORT) {
      execSync(
        `aws s3 sync ./reports s3://${process.env.S3_BUCKET}/${timestamp}`,
        {
          stdio: 'inherit'
        }
      );
    }
  });
});
