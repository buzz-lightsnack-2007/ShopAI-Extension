import Tabs from "/scripts/GUI/tabs.js";
import EntryManager from "/scripts/GUI/entrypoints/manager.js"

export default class user_actions {
	static init() {
		user_actions.tabs();
	};

	static tabs() {
		new EntryManager();
	}
};