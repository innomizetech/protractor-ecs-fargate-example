import { ElementFinder } from 'protractor';

import { WaitHelper } from './wait-helper';

export class ActionHelper {
  enterText(txtBox: ElementFinder, text: string, timeout?: number) {
    WaitHelper.waitUntilElementToVisible(txtBox, timeout);
    txtBox.clear();
    txtBox.sendKeys(text);
  }

  // To clear a text box
  clearText(textBox: ElementFinder, timeout?: number) {
    WaitHelper.waitUntilElementToVisible(textBox, timeout);
    textBox.clear();
  }

  // To click a button
  clickButton(button: ElementFinder, timeout?: number) {
    WaitHelper.waitUntilElementToVisible(button, timeout);
    button.click();
  }

  // To set checkbox Value
  setCheckBoxValue(checkBox: ElementFinder, setCheckbox: boolean) {
    checkBox.isSelected().then(function(selected) {
      if (setCheckbox && !selected) {
        checkBox.click();
      } else if (!setCheckbox && selected) {
        checkBox.click();
      }
    });
  }
}
