// Manage all entries. 

import Tabs from "/scripts/GUI/tabs.js";
import Window from "/scripts/GUI/window.js";
import IconIndicator from "./iconindicator.js";
import check from "/scripts/platform/check.js";
import pointer from "/scripts/data/pointer.js";

export default class EntryManager {
	constructor () {
		// Add the action listeners.
		this.#listen();
	}

	/* Add the action listeners. */
	#listen() {
		this.onRefresh()
		Tabs.addActionListener(`onActivated`, (data) => {this.onRefresh()});
		Tabs.addActionListener(`onUpdated`, (data) => {this.onRefresh()});
		Window.addActionListener(`onFocusChanged`, (data) => {this.onRefresh()});
	}

	onRefresh() {
		(Tabs.query(null, 0)).then((DATA) => {
			if (DATA ? (DATA.url) : false) {
				(check.platform(DATA.url)).then(async (result) => {
					if (result) {
						this.enable();
						await pointer.select(DATA.url);
					} else {
						this.disable();
					};
				});
			};
		})
	}

	/* 
	Enable the entries. 
	*/
	enable () {
		IconIndicator.enable();
	}

	/* 
	Disable the entries and the existing opened side panel. 
	*/
	disable () {
		IconIndicator.disable();
	}
}