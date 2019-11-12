const fs = require('fs');

export class BrowserHelper {
  static writeScreenShot(data: any, filename: any) {
    let stream = fs.createWriteStream(filename);

    stream.write(Buffer.from(data, 'base64'));
    stream.end();
  }
}
