/* Popup.js
	Build the interface for popup
*/

// Import modules.
import {session, observe} from "/scripts/secretariat.js";
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
		observe(async (changes) => {
			this.update();
			this.switch();
			// First, update site data but retain the URL. 
		});
	}

	/* 
	Update the data used by the page. 

	@param {boolean} override override the current data.
	*/
	async update(override = false) {
		// Set the reference website when overriding or unset. 
		(override || !this[`ref`]) ? this[`ref`] = await session.read([`last`, `URL`]) : false;

		// Update all other data. 
		(this[`ref`]) ? this[`data`] = await session.read([`last`]) : false;

		// Merge objects
		(this[`data`] && this[`ref`]) ? this[`data`] = Object.assign(this[`data`], await session.read([`sites`, this[`ref`]])) : false;
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

		// Prepare all the necessary data. 
		await this.update();
		
		// Make sure that the website has been selected!
		if (this[`ref`]) {	
			// Set the relative chrome URLs
			(Object.keys(PAGES)).forEach(PAGE => {
				PAGES[PAGE] = chrome.runtime.getURL(`pages/popup/${PAGES[PAGE]}`);
			});
	
			// Check if the site is available.
			if ((this[`ref`] && this[`data`]) ? (!this[`data`][`done`]) : true) {
				this.elements[`frame`].src = PAGES[`loading`];
			} else if (this[`data`][`error`]) {
				// Set the iframe src to display the error. 
				this.elements[`frame`].src = PAGES[`error`];
			} else {
				// Set the iframe src to display the results. 
				this.elements[`frame`].src = PAGES[`results`];
			}
		}
	}
	
	async content() {
		this.elements = {};
		this.elements[`frame`] = document.querySelectorAll(`iframe.viewer`);

		
		// Check if the frame is available.
		if (this.elements[`frame`].length) {
			await this.switch();
			this.background();
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