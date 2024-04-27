import BrowserIcon from '/scripts/GUI/extensionIcon.js';
import Image from '/scripts/mapping/image.js';

class IconIndicator {
     static async enable() {
          // WIP. Make sure to determine if the product is bad / good
          BrowserIcon.set(await Image.get('default'));
     }

     static async disable() {
          BrowserIcon.set(await Image.get('disabled'));
     }
}

export {IconIndicator as default};