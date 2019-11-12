/*global module, element, protractor, by, browser, expect*/
import { browser, ExpectedConditions, ElementFinder, ProtractorExpectedConditions, promise as WebDriverPromise } from 'protractor';

export class WaitHelper {
  static EC: ProtractorExpectedConditions = ExpectedConditions;

  constructor() {}

  static waitUntilAlertIsPresent(timeout?: number): WebDriverPromise.Promise<any> {
    return browser.wait(WaitHelper.EC.alertIsPresent(), timeout);
  }

  static waitElementToClickable(element: ElementFinder, timeout?: number): WebDriverPromise.Promise<any> {
    return browser.wait(WaitHelper.EC.elementToBeClickable(element), timeout);
  }

  static waitUntilTextToBePresentInElement(element: ElementFinder, str: string, timeout?: number): WebDriverPromise.Promise<any> {
    return browser.wait(WaitHelper.EC.textToBePresentInElement(element, str), timeout);
  }

  static waitUntilTextToBePresentInElementValue(element: ElementFinder, str: string, timeout?: number): WebDriverPromise.Promise<any> {
    return browser.wait(WaitHelper.EC.textToBePresentInElementValue(element, str), timeout);
  }

  static waitUntilTitleToContains(str: string, timeout?: number): WebDriverPromise.Promise<any> {
    return browser.wait(WaitHelper.EC.titleContains(str), timeout);
  }

  static waitUntilTitleIs(str: string, timeout?: number): WebDriverPromise.Promise<any> {
    return browser.wait(WaitHelper.EC.titleIs(str), timeout);
  }

  static waitUntilUrlContains(str: string, timeout?: number): WebDriverPromise.Promise<any> {
    return browser.wait(WaitHelper.EC.urlContains(str), timeout);
  }

  static waitUrlIsEqualsTo(str: string, timeout?: number): WebDriverPromise.Promise<any> {
    return browser.wait(WaitHelper.EC.urlIs(str), timeout);
  }

  static waitUntilPresenceOfElement(element: ElementFinder, timeout?: number): WebDriverPromise.Promise<any> {
    return browser.wait(WaitHelper.EC.presenceOf(element), timeout);
  }

  static waitUntilStalenessOfElement(element: ElementFinder, timeout?: number): WebDriverPromise.Promise<any> {
    return browser.wait(WaitHelper.EC.stalenessOf(element), timeout);
  }

  static waitUntilElementToVisible(element: ElementFinder, timeout?: number): WebDriverPromise.Promise<any> {
    return browser.wait(WaitHelper.EC.visibilityOf(element), timeout);
  }

  static waitUntilElementToInvisible(element: ElementFinder, timeout?: number): WebDriverPromise.Promise<any> {
    return browser.wait(WaitHelper.EC.invisibilityOf(element), timeout);
  }

  static waitUntilElementToBeSelected(element: ElementFinder, timeout?: number): WebDriverPromise.Promise<any> {
    return browser.wait(WaitHelper.EC.elementToBeSelected(element), timeout);
  }
}
