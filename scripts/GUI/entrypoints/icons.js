import BrowserIcon from '/scripts/GUI/extensionIcon.js';
import Image from '/scripts/mapping/image.js';
import {session} from '/scripts/secretariat.js';

class IconIndicator {
     /* 
     Indicate that the website is supported through icon change. 
     */
     static async enable() {
          // Set default enabled icon. 
          BrowserIcon.set({"Icon": await Image.get('default')});
     }

     /* 
     Indicate that the website isn't supported through icon change. 
     */
     static async disable() {
          BrowserIcon.setIcon({"Icon": await Image.get('disabled')});
     }
}

export {IconIndicator as default};