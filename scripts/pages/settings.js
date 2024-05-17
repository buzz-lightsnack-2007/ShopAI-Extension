/* Settings.js
	Build the interface for the settings
*/

// Import modules.
import {global} from "/scripts/secretariat.js";
import Page from "/scripts/pages/page.js";
import texts from "/scripts/mapping/read.js";
import filters from "/scripts/filters.js";
import logging from "/scripts/logging.js";
import {URLs} from "/scripts/utils/URLs.js";

class Page_Settings extends Page {
	data = {};

	constructor() {
		super();
		this.events();
	};

	/*
	Define the mapping of each button.

	@param {object} window the window
	*/
	events() {
		if ((Object.keys(this.window.elements[`interactive`][`action`])).length) {
			// Instantiate the filters module, since it's needed for some of the actions below. 
			this.data.filters = (this.data.filters) ? this.data.filters : new filters();

			
			// Set the actions. 
			let ACTIONS = {};
			ACTIONS[`filters,update`] = async () => {this.data.filters.update(`*`);};
			ACTIONS[`filters,add,one`] = () => {
				let SOURCE = ``;

				while (true) {
					SOURCE = prompt(texts.localized(`settings_filters_add_prompt`), SOURCE);

					// Update the filter if the source is not empty.
					if (SOURCE ? SOURCE.trim() : false) {
						SOURCE = SOURCE.trim().split(`, `);

						// Verify user inputs are valid. 
						let VALID = true;

						// Check if the URL is valid.
						SOURCE.forEach((LOCATION) => {
							VALID = (URLs.test(LOCATION));
						});

						// Update the filter if the source is valid.
						if (VALID) {
							return(this.data.filters.update(SOURCE));
						} else {
							if (!confirm(texts.localized(`error_msg_notURL_syntax`))) {
								return (false);
							};
						}
					} else {
						return (false);
					};
				}
			};
			ACTIONS[`filters,update,one`] = () => {
				// Update the selected filter. 
				return((this.window.search.filters.selected) ? this.data.filters.update(this.window.search.filters.selected) : false)
			};
			ACTIONS[`filters,delete,one`] = () => {
				// Remove the selected filter. 
				return((this.window.search.filters.selected) ? this.data.filters.remove(this.window.search.filters.selected) : false)
			}
			ACTIONS[`storage,clear`] = () => {
				return(global.forget(`sites`));
			}
			
			// Add the event listeners. 
			(Object.keys(ACTIONS)).forEach((NAME) => {
				(this.window.elements[`interactive`][`action`][NAME] ? this.window.elements[`interactive`][`action`][NAME].length : false)
					? this.window.elements[`interactive`][`action`][NAME].forEach((ELEMENT) => {
						ELEMENT.addEventListener(`click`, ACTIONS[NAME]);
					})
					: false;
			})
		};

		if (this.window.elements[`linked`] ? (this.window.elements[`linked`][`show`] ? Object.keys(this.window.elements[`linked`][`show`]).length : false) : false) {
			(this.window.elements[`linked`][`show`][`settings,general,showApplicable`] ? this.window.elements[`linked`][`show`][`settings,general,showApplicable`].length : false)
				? (this.window.elements[`linked`][`show`][`settings,general,showApplicable`]).forEach((ELEMENT) => {
					ELEMENT.addEventListener(`change`, () => {
						// The extension icon cache doesn't clear by itself. 
						ELEMENT.addEventListener(`change`, () => {
							!(ELEMENT.checked)
								? new logging(texts.localized(`settings_restartToApply`), texts.localized(`settings_restartToApply_iconChange`), true)
								: false;
						})
					});
				})
				: false;
		}
	}
}

new Page_Settings();