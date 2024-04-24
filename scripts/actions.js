import Tabs from "/scripts/GUI/tabs.js";
import EntryManager from "/scripts/external/entries/manager.js"

export default class user_actions {
	static init() {
		chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));

		user_actions.tabs();
	};

	static tabs() {
		new EntryManager();
	}
};