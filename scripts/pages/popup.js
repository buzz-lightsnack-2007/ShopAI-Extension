/* Popup.js
	Build the interface for popup
*/

// Import modules.
import {global, observe} from "/scripts/secretariat.js";
import Window from "/scripts/GUI/window.js";
import Page from "/scripts/pages/page.js";
import Loader from "/scripts/GUI/loader.js";
import Tabs from "/scripts/GUI/tabs.js";
import logging from "/scripts/logging.js";

class Page_Popup extends Page {
	constructor() {
		super();
		(this.events) ? this.events() : false;
		this.content();
		this.background();
	};

	async background() {
		// Wait until a change in the session storage.
		observe((changes) => {
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
		if (override || !this[`ref`]) {this[`ref`] = await global.read([`last`])};
		
		// Get all the data to be used here. 
		let DATA = {
			"status": await global.read([`sites`, this[`ref`], `status`], -1)
		}

		// Update all other data. 
		this[`status`] = (DATA[`status`])
			? DATA[`status`]
			// Accomodate data erasure. 
			: ((this[`status`])
				? this[`status`]
				: {});
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
			
			let PAGE = PAGES[((this[`status`][`done`])
				? ((this[`status`][`error`])
					? `error`
					: `results`)
				: `loading`)];

			// Replace the iframe src with the new page.
			this.elements[`frame`].forEach((frame) => {
				frame.src = PAGE;
			})

			// The results page has its own container. 
			this.elements[`container`].forEach((CONTAINER) => {
				CONTAINER.classList[(PAGE.includes(`results`)) ? `remove` : `add`](`container`);
			});
		};
	};
	
	async content() {
		this.elements = {};
		this.elements[`container`] = document.querySelectorAll(`main`);
		this.elements[`frame`] = document.querySelectorAll(`main > iframe.viewer`);

		
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
		(document.querySelector(`[data-action="analysis,reload"]`)) ? document.querySelector(`[data-action="analysis,reload"]`).addEventListener("click", () => {
			try {
				// Send a message to the content script. 
				Tabs.query(null, 0).then((TAB) => {
					chrome.tabs.sendMessage(TAB.id, {"refresh": true});
				});
			} catch(err) {
				logging.error(err.name, err.message, err.stack);
				throw (err);
			};
		}) : false;
	}
}

new Page_Popup();