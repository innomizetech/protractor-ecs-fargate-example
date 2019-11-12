import { browser, Config } from 'protractor';
import { SpecReporter } from 'jasmine-spec-reporter';
import * as HtmlReporter from 'protractor-beautiful-reporter';

// Configure node environment variables
// require('dotenv-safe').config({ path: '.env' });

import yargs = require('yargs');

const mozCapabilities = yargs.argv['firefox-headless']
  ? {
      'moz:firefoxOptions': {
        args: ['--headless']
      }
    }
  : {};
const chromeCapabilities = yargs.argv['chrome-headless']
  ? {
      chromeOptions: {
        args: [
          '--headless',
          '--window-size=1920,1240',
          '-no-sandbox',
          '--disable-dev-shm-usage'
        ]
      }
    }
  : {};

const seleniumAddress =
  process.env.SELENIUM_ADDRESS || 'http://localhost:4444/wd/hub';
const headlessMode = yargs.argv['headless'];
const browserName = yargs.argv['browser'];
const specs = yargs.argv['specs'] || '**/specs/*.spec.js';
const multipleCapabilities = [
  {
    browserName: 'chrome',
    chromeOptions: {
      args: headlessMode
        ? [
            '--headless',
            '--window-size=1920,1240',
            '-no-sandbox',
            '--disable-dev-shm-usage'
          ]
        : []
    }
  },
  {
    browserName: 'firefox',
    'moz:firefoxOptions': {
      args: headlessMode ? ['--headless'] : []
    }
  }
];

export const config: Config = {
  framework: 'jasmine',
  capabilities: browserName
    ? {
        browserName: browserName || 'chrome',
        platform: 'ANY',
        version: '11',
        ...mozCapabilities,
        ...chromeCapabilities
      }
    : undefined,
  multiCapabilities: browserName ? [] : multipleCapabilities,
  directConnect: false,

  // Spec patterns are relative to the location of this config
  specs: [specs],

  // Specify 3 parameters below if you want to use local selenium driver without starting its web hub
  // seleniumServerJar: 'path',
  // chromeDriver: 'path',
  // geckoDriver: 'path',

  seleniumAddress: seleniumAddress,

  baseUrl: process.env.BASE_URL,
  noGlobals: false,
  allScriptsTimeout: 12000,

  // plugins: [],

  onPrepare: async () => {
    jasmine.getEnv().addReporter(
      new SpecReporter({
        spec: {
          displayStacktrace: true,
          displayDuration: true
        },
        summary: {
          displayStacktrace: true
        }
      })
    );

    jasmine.getEnv().addReporter(
      // @help :: https://www.npmjs.com/package/protractor-beautiful-reporter
      new HtmlReporter({
        docTitle: 'Protractor Reporter',
        docName: 'index.html',
        // baseDirectory can create folder on both Linux and Window system
        baseDirectory: './reports/beautifulReport',
        screenshotsSubfolder: 'screenshots',
        jsonsSubfolder: 'json',
        inlineScreenshots: true
        // takeScreenShotsForSkippedSpecs: true,
        // takeScreenShotsOnlyForFailedSpecs: true,
        // gatherBrowserLogs: true,
      }).getJasmine2Reporter()
    );

    // For some reason in Chrome console network tab there is a websocket request as "Pending"
    // so apparently Protractor keeps waiting this request to finish.
    // To solve this issue we prevent synchronization
    browser.ignoreSynchronization = true;
    browser
      .getCapabilities()
      .then(cap => (browser.params.browserName = cap.get('browserName')));
    browser.driver
      .manage()
      .window()
      .maximize();

    // Disable waitForAngularEnabled option when e2e run on non-angular web application
    browser.waitForAngularEnabled(false);

    // returning the promise makes protractor wait for the reporter config before executing tests
    return browser.getProcessedConfig().then(function(config) {});
  },

  params: {},

  // Turn off control_flow to allow using async/await anywhere in a spec
  // see this https://www.protractortest.org/#/async-await
  SELENIUM_PROMISE_MANAGER: false,

  // Options to be passed to Jasmine.
  jasmineNodeOpts: {
    defaultTimeoutInterval: 360000,
    showColors: true
  }
};
