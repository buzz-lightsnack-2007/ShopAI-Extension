import BrowserIcon from '/scripts/GUI/extensionIcon.js';
import Image from '/scripts/mapping/image.js';
import Tabs from '/scripts/GUI/tabs.js';
import texts from "/scripts/mapping/read.js";
import {session} from '/scripts/secretariat.js';

class IconIndicator {
	/* 
	Indicate that the website is supported through icon change. 
	*/
	static async enable() {
		BrowserIcon.set({"BadgeText": await (new texts(`extensionIcon_website_loading`)).symbol});
	}

	/* 
	Indicate that the website isn't supported through icon change. 
	*/
	static async disable() {
		BrowserIcon.set({"BadgeText": await (new texts(`extensionIcon_website_unsupported`)).symbol});
	}
}

export {IconIndicator as default};