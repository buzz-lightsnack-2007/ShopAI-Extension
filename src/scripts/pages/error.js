/*
Display the error screen details. 
*/

import Page from "/scripts/pages/page.js";
import Tabs from "/scripts/GUI/tabs.js";

import {global, background} from "/scripts/secretariat.js";
import pointer from "/scripts/data/pointer.js";
import texts from "/scripts/mapping/read.js";

import logging from "/scripts/logging.js";

class Page_Error extends Page {
	status = {};

	constructor() {
		super({"headers": {"CSS": [`/styles/popup.css`]}});
		this.content();
		this.background();
		this.events();
	};

	async background() {
		// Wait until a change in the session storage.
		new background(async (changes) => {
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
		let STORAGE_DATA = await global.read([`sites`, this[`ref`], `status`, `error`], -1);

		// Update all other data. 
		this[`status`][`error`] = ((STORAGE_DATA && (typeof STORAGE_DATA).includes(`obj`)) ? (Object.keys(STORAGE_DATA).length) : false)
			? STORAGE_DATA
			// Accomodate data erasure. 
			: ((this[`status`][`error`])
				? this[`status`][`error`]
				: {});
		
		const parse = (error) => {
			// If the error isn't the correct type, try to disect it assuming it's in the stack format. 
			this[`status`][`error`] = {};

			try {
				const FIELDS = {
					"name": (error.split(texts.localized(`delimiter_error`)))[0].trim(),
					"message": (((error.split(`\n`))[0]).split(texts.localized(`delimiter_error`))).slice(1).join(texts.localized(`delimiter_error`)).trim(),
					"stack": error.split(`\n`).slice(1).join(`\n`)
				};
				
				(Object.keys(FIELDS)).forEach((KEY) => {
					this[`status`][`error`][KEY] = (FIELDS[KEY]) ? FIELDS[KEY] : ``;
				})
			} catch(err) {
				logging.error(err.name, err.message, err.stack);
				this[`status`][`error`] = {
					"name": texts.localized(`error_msg_GUI_title`),
					"message": ``,
					"stack": error
				};
			}
		};

		(STORAGE_DATA && (typeof STORAGE_DATA).includes(`str`))
			? parse(STORAGE_DATA)
			: false;
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
				this[`elements`][`error display`][KEY].innerText = this[`status`][`error`][KEY];
			}))
			: false;
	}

	/*
	Add event listeners to the page. 
	*/
	events () {
		// Add an event listener to the refresh button. 
		(this[`window`][`elements`][`interactive`][`action`] ? this[`window`][`elements`][`interactive`][`action`].length : false)
			? (this[`window`][`elements`][`interactive`][`action`][`refresh`] ? this[`window`][`elements`][`interactive`][`action`][`refresh`].length : false)
				? (this[`window`][`elements`][`interactive`][`action`][`refresh`]).forEach((ELEMENT) => {
					ELEMENT.addEventListener(`click`, () => {
						this.send();
					})
				})
				: false
			: false;
	};

	/*
	Send a request to the content script to scrape the page.
	*/
	send() {
		try {
			// Send a message to the content script. 
			Tabs.query(null, 0).then((TAB) => {
				chrome.tabs.sendMessage(TAB.id, {"refresh": "manual"});
			});
		} catch(err) {
			logging.error(err.name, err.message, err.stack);
		};
	};
}

new Page_Error()