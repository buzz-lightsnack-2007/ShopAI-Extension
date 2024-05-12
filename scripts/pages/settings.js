/* Settings.js
	Build the interface for the settings
*/

// Import modules.
import {global} from "/scripts/secretariat.js";
import Page from "/scripts/pages/page.js";
import texts from "/scripts/mapping/read.js";
import filters from "/scripts/filters.js";
import logging from "/scripts/logging.js";

class Page_Settings extends Page {
	data = {};

	constructor() {
		super();
		(this.events) ? this.events() : false;
	}

	/*
	Define the mapping of each button.

	@param {object} window the window
	*/
	events() {
		(document.querySelector(`[data-action="filters,update"]`))
			? document.querySelector(`[data-action="filters,update"]`).addEventListener(`click`, async () => {
					// Import the filters module.
					this.data.filters = (this.data.filters) ? this.data.filters : new filters();

					// Update all of the filters. 
					filters.update(`*`);
				})
			: false;
	
		(document.querySelector(`[data-action="filters,add,one"]`))
			? document.querySelector(`[data-action="filters,add,one"]`).addEventListener(`click`, async () => {
				// Import the filters module.
				this.data.filters = (this.data.filters) ? this.data.filters : new filters();
				// Request for the filter URL. 
				let FILTER_SOURCE = prompt(texts.localized(`settings_filters_add_prompt`));

				// Update the filter if the source is not empty.
				if (FILTER_SOURCE ? FILTER_SOURCE.trim() : false) {
					this.data.filters.update(FILTER_SOURCE.trim());
				};
			})
			: false;
		
		(document.querySelector(`[data-action="filters,update,one"]`))
			? document.querySelector(`[data-action="filters,update,one"]`).addEventListener(`click`, async () => {
					this.data.filters = (this.data.filters) ? this.data.filters : new filters();
	
					// Open text input window for adding a filter.
					let filter_source = (document.querySelector(`[data-result-linked="filters"] [data-result-content="*"]`)) ? document.querySelector(`[data-result-linked="filters"] [data-result-content="*"]`).innerText : prompt(texts.localized(`settings_filters_add_prompt`));
					if (filter_source ? filter_source.trim() : false) {
						this.data.filters.update(filter_source.trim());
					};
				})
			: false;
		
		if (document.querySelector(`[data-action="filters,delete,one"]`)) {
			document.querySelector(`[data-action="filters,delete,one"]`).addEventListener(`click`, async () => {
				this.data.filters = (this.data.filters) ? this.data.filters : new filters();
	
					// Open text input window for adding a filter.
					let filter_source = (document.querySelector(`[data-result-linked="filters"] [data-result-content="*"]`)) ? document.querySelector(`[data-result-linked="filters"] [data-result-content="*"]`).innerText : prompt(texts.localized(`settings_filters_remove_prompt`));
					if (filter_source ? filter_source.trim() : false) {
						this.data.filters.remove(filter_source.trim());
					}
				});
		}
		
		// The extension icon cache doesn't clear by itself. 
		(document.querySelector(`[data-store="settings,general,showApplicable"]`))
			? document.querySelectorAll(`[data-store="settings,general,showApplicable"]`).forEach((ELEMENT) => {
				ELEMENT.addEventListener(`change`, () => {
					!(ELEMENT.checked)
						? new logging(texts.localized(`settings_restartToApply`), texts.localized(`settings_restartToApply_iconChange`), true)
						: false;
				})
			}) 
			: false;
	
		(document.querySelector(`[data-action="storage,clear"]`)) 
			? document.querySelector(`[data-action="storage,clear"]`).addEventListener(`click`, async () => {
					await global.forget(`sites`);
					console.log(await global.read(null, 1), await global.read(null, -1));
				})
			: false;		

		(document.querySelectorAll(`[data-action]`)) 
			? (document.querySelectorAll(`[data-action]`)).forEach((ELEMENT) => {
				ELEMENT.removeAttribute(`data-action`);
			})
			: false;
	}
}

new Page_Settings();