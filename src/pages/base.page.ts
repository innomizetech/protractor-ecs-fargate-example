import {
  protractor,
  element,
  by,
  browser,
  ElementFinder,
  Locator,
  ExpectedConditions
} from 'protractor';

import { ActionHelper } from '../helpers/action-helper';
import { WaitHelper } from '../helpers/wait-helper';
import { BrowserHelper } from '../helpers/browser-helper';

export class BasePage {
  protected EC = ExpectedConditions;
  protected action: ActionHelper;
  loaderEle = element(by.css('div[id="sysLoader"]'));
  timeout: any;
  url: string = '/';

  constructor() {
    /**
     * wrap this.timeout. (ms) in t-shirt sizes
     */
    this.timeout = {
      xs: 420,
      s: 1000,
      m: 2000,
      l: 5000,
      xl: 9000,
      xxl: 15000
    };
    this.action = new ActionHelper();
  }

  /**
   * Wait and verify that a page is loaded
   * @returns {promise}
   * @requires a page to include `pageLoaded` method
   */
  loaded() {
    let pageLoaded = WaitHelper.waitUntilElementToInvisible(
      this.loaderEle,
      this.timeout.xl
    );

    return browser.wait(
      pageLoaded,
      this.timeout.xl,
      'timeout: waiting for page to load. The url is: ' + this.url
    );
  }

  /**
   * Navigate to a page via it's `url` var
   * and verify/wait via loaded()
   * @requires page have both `url` and `pageLoaded` properties
   */
  goto(url?: string) {
    browser.get(url || this.url, this.timeout.xxl);

    return this.loaded();
  }

  /**
   * Test if an element has a class
   * @param  {elementFinder} locator - eg. $('div#myId')
   * @param  {string}  class  - class name
   * @return {Boolean} - does the element have the class?
   */
  hasClass(locator: any, className: string) {
    return locator
      .getAttribute('class')
      .then((classes: any) => classes.split(' ').indexOf(className) !== -1);
  }

  /**
   * Webdriver equivalent to hitting Enter/Return key.
   */
  hitEnter() {
    return browser
      .actions()
      .sendKeys(protractor.Key.ENTER)
      .perform();
  }

  inputValueByLocator(locator: Locator, value: any) {
    element(locator).sendKeys(value);
  }

  inputValueByElement(element: ElementFinder, value: any) {
    WaitHelper.waitElementToClickable(element, this.timeout.xl);
    return this.action.enterText(element, value, this.timeout.xl);
  }

  inputFieldName(inputName: string, value: any) {
    let inputEle = element(by.css(`input[name="${inputName}"]`));

    return this.inputValueByElement(inputEle, value);
  }

  inputData(data: any) {
    let keys = Object.keys(data);

    keys.forEach(key => {
      this.inputFieldName(key, data[key]);
    });
  }

  clickButton(buttonFinder: ElementFinder, timeout: number = this.timeout.xl) {
    return this.action.clickButton(buttonFinder);
  }

  clickButtonWithText(buttonText: string, timeout: number = this.timeout.xl) {
    let button = element(by.buttonText(buttonText));

    return this.action.clickButton(button, timeout);
  }

  clickLinkWithText(linkText: string, timeout: number = this.timeout.xl) {
    let link = element(by.linkText(linkText));

    return this.action.clickButton(link, timeout);
  }

  uploadFile(uploadButton: ElementFinder, filePath: string) {
    return uploadButton.sendKeys(filePath);
  }

  setCookie(name: string, value: string, days?: number) {
    let expires = '';

    if (days) {
      let date = new Date();

      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    browser.executeScript(
      `document.cookie = '${name}=${value || ''}${expires}; path=/;'`
    );
  }

  clearCookie(name: string) {
    browser.executeScript(`document.cookie = '${name}=; Max-Age=-99999999;'`);
  }

  takeScreenshot(filename: string) {
    return browser
      .takeScreenshot()
      .then(data => BrowserHelper.writeScreenShot(data, filename));
  }
}
