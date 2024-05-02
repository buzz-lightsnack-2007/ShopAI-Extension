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
		this.background();
	};

	async background() {
		// Wait until a change in the session storage.
		
	}

	async loading() {
		this.loading = new Loader();
	}

	async switch() {
		let PAGES = {
			"results": "results.htm",
			"loading": "load.htm",
			"error": "error.htm"
		}

		// Get the last edited site. 
		let SITE = {};
		SITE = await session.read([`last`], -1);
		SITE.details = (SITE.url) ? await session.read([`sites`, SITE.url]) : null;

		// Set the relative chrome URLs
		(Object.keys(PAGES)).forEach(PAGE => {
			PAGES[PAGE] = chrome.runtime.getURL(`pages/popup/${PAGES[PAGE]}`);
		});

		// Check if the site is available.
		if (SITE.url ? (!SITE.done) : true) {
			this.elements[`frame`].src = PAGES[`loading`];
		} else if (SITE.details.error) {
			// Set the iframe src to display the error. 
			this.elements[`frame`].src = PAGES[`error`];
		} else {
			// Set the iframe src to display the results. 
			this.elements[`frame`].src = PAGES[`results`];
		}
	}
	
	async content() {
		this.elements = {};
		this.elements[`frame`] = document.querySelectorAll(`iframe.viewer`);

		// Check if the frame is available.
		if (this.elements[`frame`].length) {
			await this.switch();
			// observe((DATA) => {this.switch();});
		} else {
			this.loading();
		}
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