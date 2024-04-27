import Menu from '/scripts/GUI/menus.js';
import texts from "/scripts/mapping/read.js";

export default class MenuEntry {
     /* Create all entries. */
	constructor() {
		// Add the context menu.
		this.menu = new Menu({title: (new texts(`entry_contextMenu`)).localized, contexts: [`all`], events: {"onClicked": MenuEntry.onclick}, hidden: true});
	};

     /* 
	Enable the sidebar. 
	*/
	enable () {
		this.menu.show();
	}

	/*
	Disable.
	*/
	disable () {
		this.menu.remove();
	}

	/*
	The onclick event
	*/
	static onclick() {
		// Send the message to open the side panel. 
		chrome.runtime.sendMessage({"action": "popup_open"});
	};
}