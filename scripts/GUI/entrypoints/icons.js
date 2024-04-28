import BrowserIcon from '/scripts/GUI/extensionIcon.js';
import Image from '/scripts/mapping/image.js';
import Tabs from '/scripts/GUI/tabs.js';
import {session} from '/scripts/secretariat.js';

class IconIndicator {
	/*
	Update the icon. 
	 
	@param {string} state The state to update the icon to. 
	*/
	static update(state = false) {
		(Image.get(((state) ? `default` : 'disabled'))).then((ICON) => {
			(Tabs.query(null, 0)).then((DATA) => {
				BrowserIcon.set({"Icon": ICON});
			});
		})
	}

	/* 
	Indicate that the website is supported through icon change. 
	*/
	static async enable() {
		IconIndicator.update(true);
	}

	/* 
	Indicate that the website isn't supported through icon change. 
	*/
	static async disable() {
		IconIndicator.update(false);
	}
}

export {IconIndicator as default};