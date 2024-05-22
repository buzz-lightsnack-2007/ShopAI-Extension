import {global} from "/scripts/secretariat.js";
import nested from "/scripts/utils/nested.js";

/*
Collapsibles are also tabs. 
*/
class Tabs {
	status = {};
	options = {};

	/*
	Initialize the tabs. 

	@param {string} location The URL of the page.
	*/
	constructor(options = {}) {
		this.options = options;
		this.#get();
		this.#set();
	};

	/*
	Get the relevant elements. 
	*/
	#get() {
		(document.querySelector(`ul.collapsible[tabs-group]`))
			? (document.querySelectorAll(`ul[tabs-group]`).forEach((CONTAINER) => {
				let NAME = CONTAINER.getAttribute("tabs-group");

				if (!Object.keys(this).includes(NAME)) {
					// Get the tabs.
					this[NAME] = {};
	
					// Reference the elements in this object. 
					this[NAME][`elements`] = {};
					this[NAME][`elements`][`container`] = CONTAINER;
					this[NAME][`elements`][`tabs`] = {};
					
					// Set the other options.
					(CONTAINER.getAttribute(`tabs-required`))
						? this[`options`] = nested.dictionary.set(this[`options`], [NAME, `required`], (([`true`, `false`].includes(CONTAINER.getAttribute(`tabs-required`))) ? Boolean(CONTAINER.getAttribute(`tabs-required`)) : CONTAINER.getAttribute(`tabs-required`)))
						: false;
				

					(CONTAINER.querySelector(`:scope > li`))
						? CONTAINER.querySelectorAll(`:scope > li`).forEach((TAB, INDEX) => {
							let ID = (TAB.getAttribute(`id`))
								? TAB.getAttribute(`id`)
								: ((TAB.getAttribute(`tab-name`))
									? TAB.getAttribute(`tab-name`)
									: INDEX);
	
							this[NAME][`elements`][`tabs`][ID] = {};
							this[NAME][`elements`][`tabs`][ID][`container`] = TAB;
							[`header`, `body`].forEach((ELEMENT) => {
								this[NAME][`elements`][`tabs`][ID][ELEMENT] = TAB.querySelector(`:scope > .collapsible-${ELEMENT}`);
							});
	
							// Get the active state. 
							TAB.classList.contains(`active`)
								? this[NAME][`selected`] = ID
								: false;
	
							// Remove the attributes. 
							TAB.removeAttribute(`tab-name`);
						})
						: false;
	
					// Delete the attribute. 
					[`group`, `required`].forEach((ATTRIBUTE) => {
						CONTAINER.removeAttribute(`tabs-`.concat(ATTRIBUTE));
					});
				}
			}))
			: false;
	};

	/*
	Set the properties of the tabs. 
	*/
	#set() {
		(Object.keys(this).length > 1)
			? (Object.keys(this).forEach((NAME) => {
				if (![`status`, `options`].includes(NAME)) {
					// Add the events to each tab. 
					(Object.keys(this[NAME][`elements`][`tabs`]).length)
						? (Object.keys(this[NAME][`elements`][`tabs`]).forEach((ID) => {
							this[NAME][`elements`][`tabs`][ID][`header`].addEventListener(`click`, () => {
								(!this[`status`][`opening`])
									? (this[NAME][`elements`][`tabs`][ID][`container`].classList.contains(`active`))
										? this.close(NAME, {"automatic": true})
										: this.open(NAME, ID, {"automatic": true})
									: false;
							});
						}))
						: false;
	
					// Open the last selected tab. 
					(global.read([`view`, `tabs`, NAME, `selected`])).then((SELECTED) => {
						if (SELECTED != null) {
							// Wait until page load is complete. 
							this.open(NAME, SELECTED, {"don't save": true});
						};
					});
				}
				
			}))
			: false;
	}

	/*
	Open a particular tab. 

	@param {string} name The name of the tab group.
	@param {string} ID The ID of the tab.
	@param {object} options The options to be used.
	*/
	async open (name, ID, options) {
		if ((name && ID) && Object.keys(this).includes(name)) {
			// Add the lock. 
			this[`status`][`opening`] = true;

			// Update the variable. 
			this[name][`selected`] = ID;

			if (!(((typeof options).includes(`obj`) && options) ? options[`don't save`] : false)) {
				this[`status`][`last`] = await global.write([`view`, `tabs`, name, `selected`], ID, 1, {"silent": true});
			};

			// Select the tab.
			((nested.dictionary.get(this, [name, `elements`, `tabs`, ID, `header`]) && ((nested.dictionary.get(options, [`automatic`]) != null) ? !options[`automatic`] : true))
				? ((this[name][`elements`][`tabs`][ID][`container`].classList.contains(`active`)) ? false : this[name][`elements`][`tabs`][ID][`header`].click())
				: false);	

			// Scroll to the tab. 
			if (nested.dictionary.get(this, [name, `elements`, `tabs`, ID, `header`])) {
				// Scroll to the tab.
				this[name][`elements`][`tabs`][ID][`header`].scrollIntoView({"behavior": "smooth", "block": "start"});
			};
			
			// Remove the lock.
			this[`status`][`opening`] = false;
		}
	}
	
	/*
	De-select any tab. 

	@param {string} name The name of the tab group.
	@param {object} options The options to be used.
	*/
	async close (name, options) {
		let ID = this[name][`selected`];

		if (((name && ID) && Object.keys(this).includes(name)) ? !(nested.dictionary.get(this[`options`], [name, `required`])) : false) {
			// Add the lock. 
			this[`status`][`opening`] = true;

			// Update the variable. 
			this[name][`selected`] = null;
			if (!(((typeof options).includes(`obj`) && options) ? options[`don't save`] : false)) {
				this[`status`][`last`] = await global.write([`view`, `tabs`, name, `selected`], null, 1, {"silent": true});
			};

			// Select the tab. 
			((nested.dictionary.get(this, [name, `elements`, `tabs`, ID, `header`]) && ((nested.dictionary.get(options, [`automatic`]) != null) ? !options[`automatic`] : true))
				? ((this[name][`elements`][`tabs`][ID][`container`].classList.contains(`active`)) ? this[name][`elements`][`tabs`][ID][`header`].click() : false)
				: false);	
			
			// Remove the lock.
			this[`status`][`opening`] = false;
		} else if (((name && ID) && Object.keys(this).includes(name)) ? (nested.dictionary.get(this[`options`], [name, `required`]) == true) : false) {
			// Intercept a closing tab to re-open it.
			this.open(name, ID);
		}
	}
}

export {Tabs};