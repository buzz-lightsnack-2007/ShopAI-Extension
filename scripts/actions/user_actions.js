import Watcher_Tabs from "./tabs.js";

export default class user_actions {
	static init() {
		chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));

		new Watcher_Tabs();
	};
};