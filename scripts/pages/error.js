/*
Display the error screen details. 
*/

import Page from "/scripts/pages/page.js";
import Tabs from "/scripts/GUI/tabs.js";

import {global, observe} from "/scripts/secretariat.js";
import pointer from "/scripts/data/pointer.js";

import logging from "/scripts/logging.js";

class Page_Error extends Page {
	constructor() {
		super();
		this.content();
		this.background();
		this.events();
	};

	async background() {
		// Wait until a change in the session storage.
		observe(async (changes) => {
			await this.update();
			this.fill();
		});
	}

	/*
	Update the data. 
	*/
	async update() {
		// Set the reference website when overriding or unset. 
		if (!this[`ref`]) {this[`ref`] = await pointer.read(`URL`)};

		// Get all the data to be used here. 
		let STORAGE_DATA = await global.read([`sites`, this[`ref`], `status`], -1)

		// Update all other data. 
		this[`status`] = ((STORAGE_DATA != null && (typeof STORAGE_DATA).includes(`obj`)) ? (Object.keys(STORAGE_DATA).length) : false)
			? STORAGE_DATA
			// Accomodate data erasure. 
			: ((this[`status`])
				? this[`status`]
				: {});
	}

	/*
	Extract the contents of the page. 
	*/
	content () {
		this[`elements`] = (this[`elements`]) ? this[`elements`] : {};

		const error_display = () => {
			this[`elements`][`error display`] = {};
			let ERROR_CONTENTS = document.querySelectorAll(`[data-error]`);
	
			ERROR_CONTENTS.forEach((ELEMENT) => {
				let PROPERTY = ELEMENT.getAttribute(`data-error`).trim();
				this[`elements`][`error display`][PROPERTY] = ELEMENT;

				// Remove properties used to construct since it is already saved. 
				ELEMENT.removeAttribute(`data-error`);
			});
		};

		error_display();
		this.fill();
	};

	/*
	Fill in the content of the page. 
	*/
	async fill () {
		await this.update();

		(this[`elements`][`error display`] && (this[`status`] ? this[`status`][`error`] : false))
			? (Object.keys(this[`elements`][`error display`]).forEach((KEY) => {
				this[`elements`][`error display`][KEY].innerText = String(this[`status`][`error`][KEY])
			}))
			: false;
	}

	/*
	Add event listeners to the page. 
	*/
	events () {
		this[`elements`] = (this[`elements`]) ? this[`elements`] : {};
		this[`elements`][`button`] = {};

		document.querySelectorAll(`[data-action]`).forEach((ELEMENT) => {
			let ACTION = ELEMENT.getAttribute(`data-action`);
			this[`elements`][`button`][ACTION] = ELEMENT;

			// Remove the data-action attribute.
			ELEMENT.removeAttribute(`data-action`);
		})

		// Add an event listener to the refresh button. 
		this[`elements`][`button`][`refresh`].addEventListener(`click`, () => {
			this.send();
		});
	};

	/*
	Send a request to the content script to scrape the page.
	*/
	send() {
		try {
			// Send a message to the content script. 
			Tabs.query(null, 0).then((TAB) => {
				chrome.tabs.sendMessage(TAB.id, {"refresh": "automatic"});
			});
		} catch(err) {
			logging.error(err.name, err.message, err.stack);
		};
	};
}

new Page_Error()