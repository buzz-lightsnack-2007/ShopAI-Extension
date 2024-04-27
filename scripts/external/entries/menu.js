import Menu from '/scripts/GUI/menus.js';
import texts from "/scripts/mapping/read.js";
import ManagedSidebar from "./sidebar.js";

export default class MenuEntry {
     /* Create all entries. */
	constructor() {
		// Add the context menu.
		this.menu = new Menu({title: (new texts(`entry_contextMenu`)).localized, contexts: [`all`], event: {"onClicked": MenuEntry.onclick}, hidden: true});
	};

     /* 
	Enable the sidebar. 
	*/
	enable () {
		this.menu.show();
	}

	/* Disable. */
	disable () {
		this.menu.remove();
	}

	static onclick() {
		new ManagedSidebar();
	};
}