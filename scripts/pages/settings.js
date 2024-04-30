/* Settings.js
	Build the interface for the settings
*/

// Import modules.
//import { windowman } from "../windowman.js";

import {global} from "/scripts/secretariat.js";
import Page from "/scripts/pages/page.js";
import texts from "/scripts/mapping/read.js";

class Page_Settings extends Page {
	constructor() {
		super();
		(this.events) ? this.events() : false;
	}

	/*
	Define the mapping of each button.

	@param {object} window the window
	*/
	events() {
		if (document.querySelector(`[data-action="filters,update"]`)) {
			document
				.querySelector(`[data-action="filters,update"]`)
				.addEventListener(`click`, async () => {
					let filters = new (
						await import(chrome.runtime.getURL(`scripts/filters.js`))
					).default();
					filters.update();
				});
		}
	
		if (document.querySelector(`[data-action="filters,add,one"]`)) {
			document
				.querySelector(`[data-action="filters,add,one"]`)
				.addEventListener(`click`, async () => {
					// Import the filters module.
					let filters = new (
						await import(chrome.runtime.getURL(`scripts/filters.js`))
					).default();
					
					let filter_source = prompt(
						texts.localized(`settings_filters_add_prompt`),
					);
					if (filter_source ? filter_source.trim() : false) {
						filters.update(filter_source.trim());
					};
				});
		}
		if (document.querySelector(`[data-action="filters,update,one"]`)) {
			document
				.querySelector(`[data-action="filters,update,one"]`)
				.addEventListener(`click`, async () => {
					// Import the filters module.
					const texts = (
						await import(chrome.runtime.getURL(`/scripts/mapping/read.js`))
					).default;
					let filters = new (
						await import(chrome.runtime.getURL(`scripts/filters.js`))
					).default();
	
					// Open text input window for adding a filter.
					let filter_source = (document.querySelector(`[data-result-linked="filters"] [data-result-content="*"]`)) ? document.querySelector(`[data-result-linked="filters"] [data-result-content="*"]`).innerText : prompt(texts.localized(`settings_filters_add_prompt`));
					if (filter_source ? filter_source.trim() : false) {
						filters.update(filter_source.trim());
					};
				});
		}
		
		if (document.querySelector(`[data-action="filters,delete,one"]`)) {
			document
				.querySelector(`[data-action="filters,delete,one"]`)
				.addEventListener(`click`, async () => {
					// Import the filters module.
					let filters = new (
						await import(chrome.runtime.getURL(`scripts/filters.js`))
					).default();
	
					// Open text input window for adding a filter.
					let filter_source = (document.querySelector(`[data-result-linked="filters"] [data-result-content="*"]`)) ? document.querySelector(`[data-result-linked="filters"] [data-result-content="*"]`).innerText : prompt(texts.localized(`settings_filters_remove_prompt`));
					if (filter_source ? filter_source.trim() : false) {
						filters.remove(filter_source.trim());
					}
				});
		}
	
		if (document.querySelector(`[data-action="storage,clear"]`)) {
			document
				.querySelector(`[data-action="storage,clear"]`)
				.addEventListener(`click`, async () => {
					await global.forget(`sites`);
					console.log(await global.read(null, 1), await global.read(null, -1));
				});
		}

		(document.querySelectorAll(`[data-action]`)).forEach((ELEMENT) => {
			ELEMENT.removeAttribute(`data-action`);
		})
	}
}

new Page_Settings();