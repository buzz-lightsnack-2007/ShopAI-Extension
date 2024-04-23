/* Popup.js
	Build the interface for popup
*/

// Import modules.
import {read, forget} from "/scripts/secretariat.js";
import windowman from "/scripts/GUI/windowman.js";
import Window from "/scripts/GUI/window.js";
import Page from "/scripts/pages/page.js";
import texts from "/scripts/strings/read.js";

class Page_Popup extends Page {
	constructor() {
		super();
		(this.events) ? this.events() : false;
	};

	content() {
		if (document.querySelector(`[data-text="loading_text"]`)) {
			document.querySelector(`[data-text="loading_text"]`).textContent = (new texts())
		}
	}

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