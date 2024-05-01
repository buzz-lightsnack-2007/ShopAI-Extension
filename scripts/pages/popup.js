/* Popup.js
	Build the interface for popup
*/

// Import modules.
import {session} from "/scripts/secretariat.js";
import Window from "/scripts/GUI/window.js";
import Page from "/scripts/pages/page.js";
import Loader from "/scripts/GUI/loader.js";

class Page_Popup extends Page {
	constructor() {
		super();
		(this.events) ? this.events() : false;
		this.content();
	};

	content() {
		this.loading = new Loader();
	};

	events() {
		(document.querySelector(`[data-action="open,settings"]`)) ? document.querySelector(`[data-action="open,settings"]`).addEventListener("click", () => {
			chrome.runtime.openOptionsPage();
		}) : false;
		(document.querySelector(`[data-action="open,help"]`)) ? document.querySelector(`[data-action="open,help"]`).addEventListener("click", () => {
			new Window(`help.htm`);
		}) : false;
	}
}

new Page_Popup();