/* Popup.js
	Build the interface for popup
*/

// Import modules.
import {global, background} from "/scripts/secretariat.js";
import Page from "/scripts/pages/page.js";
import Loader from "/scripts/GUI/loader.js";
import Tabs from "/scripts/GUI/tabs.js";
import logging from "/scripts/logging.js";

class Page_Popup extends Page {
	constructor() {
		super({"headers": {"CSS": [`/styles/popup.css`]}});
		this.content();
		this.background();
		this.events();
	};

	async background() {
		// Wait until a change in the session storage.
		new background((changes) => {
			this.update();
			this.switch();
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
		let DATA = {};
		DATA[`status`] = await global.read([`sites`, this[`ref`], `status`], -1);
		DATA[`init`] = (await global.read([`init`])) && (await global.read([`settings`,`analysis`,`api`,`key`]));

		// Update all other data. 
		this[`status`] = (DATA[`status`] != null)
			? DATA[`status`]
			// Accomodate data erasure. 
			: ((this[`status`])
				? this[`status`]
				: {});
		this[`status`][`init`] = DATA[`init`];

		// Confirm completion by returning the status.
		return (this[`status`]);
	}

	async loading() {
		this[`elements`] = (this[`elements`]) ? this[`elements`] : {};
		this[`elements`][`loader`] = new Loader();
	}

	switch() {
		if (this.elements[`frame`]) {
			let PAGES = {
				"results": "results.htm",
				"loading": "load.htm",
				"OOBE": "hello.htm",
				"error": "error.htm"
			};
	
			// Prepare all the necessary data. 
			this.update().then(() => {
				// Make sure that the website has been selected!
				if (this[`ref`]) {
					let SELECTION = this[`status`][`init`]
						? (this[`status`][`done`] <= -1 || this[`status`][`error`])
							? `error`
							: ((this[`status`][`done`] >= 1)
								? `results`
								: `loading`)
						: `OOBE`;
					let PAGE = chrome.runtime.getURL(`pages/popup/`.concat(PAGES[SELECTION]));
					
					// Replace the iframe src with the new page.
					(this.elements[`frame`].src != PAGE) ? this.elements[`frame`].src = PAGE : false;
		
					// The results and OOBE pages has its own container. 
					this.elements[`container`].classList[([`results`, `OOBE`].includes(SELECTION)) ? `remove` : `add`](`container`);

					// Set the title bar content. 
					this[`window`][`navigation bar`][([`OOBE`].includes(SELECTION)) ? `hide` : `show`](`header`, `results`);
					this[`window`][`navigation bar`][([`OOBE`].includes(SELECTION)) ? `show` : `hide`](`header`, `OOBE`);
				};
			});
		}

		// Also set the loader. 
		(this[`elements`][`loader`])
			? ((this[`status`] ? (this[`status`][`done`] ? (this[`status`][`done`] <= 1) : false) : false) ? parseFloat(this[`elements`][`loader`].update(this[`status`][`done`])) : false)
			: false
	};
	
	async content() {
		this.elements = {};
		this.elements[`container`] = document.querySelector(`main`);
		this.elements[`frame`] = document.querySelector(`main > iframe.viewer`);
		this.elements[`nav`] = document.querySelector(`nav`);
		
		// Check if the frame is available.
		if (this.elements[`frame`]) {
			this.switch();

			// Call for scraping of data if global data does not indicate automatic scraping or if data doesn't exist.
			if (!await global.read([`settings`, `behavior`, `autoRun`]) && this[`status`] == null) {
				this.send({"refresh": "automatic"});
			}
		} else {
			this.loading();
		}
	};

	/*
	Call for the scraper and analyzer. 
	*/
	send(options) {
		// Make sure that it is the correct format. 
		let OPTIONS = (options && (typeof options).includes(`obj`) && !Array.isArray(options)) ? options : {};

		try {
			// Send a message to the content script. 
			Tabs.query(null, 0).then((TAB) => {
				chrome.tabs.sendMessage(TAB.id, OPTIONS);
			});
		} catch(err) {
			logging.error(err.name, err.message, err.stack);
		};
	};

	events() {
		let ACTIONS = {};
		ACTIONS[`open,settings`] = () => {chrome.runtime.openOptionsPage();};
		ACTIONS[`analysis,reload`] = () => {this.send({"refresh": "manual"});}

		// Add the event listeners. 
		(Object.keys(ACTIONS)).forEach((NAME) => {
			(this.window.elements[`interactive`][`action`][NAME] ? this.window.elements[`interactive`][`action`][NAME].length : false)
				? this.window.elements[`interactive`][`action`][NAME].forEach((ELEMENT) => {
					ELEMENT.addEventListener(`click`, ACTIONS[NAME]);
				})
				: false;
		})
	}
}

new Page_Popup();