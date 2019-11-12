import { resolve } from 'path';
import { ElementFinder, element, by, browser } from 'protractor';

import { BasePage } from './base.page';

interface FormItem {
  note: string;
  filePath: string;
}

export class FileUploadPage extends BasePage {
  note: ElementFinder = element(by.css(`input[name="note"]`));
  uploadButtonEle: ElementFinder = element(by.css(`input[name="upfile"]`));
  sendButtonEle: ElementFinder = element(by.css(`input[type="submit"]`));

  get browserName() {
    return browser.params.browserName;
  }

  constructor() {
    super();
  }

  async fillForm(row: FormItem) {
    this.inputValueByElement(this.note, row.note);
    await this.uploadFile(this.uploadButtonEle, resolve(row.filePath));
  }

  send() {
    return this.clickButton(this.sendButtonEle);
  }
}
