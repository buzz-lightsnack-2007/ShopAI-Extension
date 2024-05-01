// Manage all entries. 

import Tabs from "/scripts/GUI/tabs.js";
import Window from "/scripts/GUI/window.js";
import MenuEntry from "./menuentry.js";
import ManagedWindow from "./ManagedWindow.js";
import IconIndicator from "./iconindicator.js";
import check from "/scripts/external/check.js";

export default class EntryManager {
	constructor () {
		// Initialize the entries. 
		this.instances = {};
		this.instances.popup = new ManagedWindow();
		this.instances.menu = new MenuEntry();

		// Add the action listeners.
		this.#listen();
	}

	/* Add the action listeners. */
	#listen() {
		Tabs.addActionListener(`onActivated`, (data) => {this.onRefresh()});
		Tabs.addActionListener(`onUpdated`, (data) => {this.onRefresh()});
		Window.addActionListener(`onFocusChanged`, (data) => {this.onRefresh()});
		
		// Add the context menu event. 
		IconIndicator.set(() => {this.instances.popup.show()});
		this.instances.menu.menu.onclick(() => {this.instances.popup.show()});
	}

	onRefresh() {
		(Tabs.query(null, 0)).then((DATA) => {
			if (DATA ? (DATA.url) : false) {
				(check.platform(DATA.url)).then((result) => {
					(result) ? (this.enable()) : (this.disable())
				});
			};
		})
	}

	/* 
	Enable the entries. 
	*/
	enable () {
		this.instances.menu.enable();
		IconIndicator.enable();
	}

	/* 
	Disable the entries and the existing opened side panel. 
	*/
	disable () {
		this.instances.menu.disable();
		IconIndicator.disable();
	}
}