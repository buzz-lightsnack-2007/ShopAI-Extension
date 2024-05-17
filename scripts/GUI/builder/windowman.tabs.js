import {global} from "/scripts/secretariat.js";
import nested from "/scripts/utils/nested.js";

/*
Collapsibles are also tabs. 
*/
class Tabs {
	status = {};

	/*
	Initialize the tabs. 

	@param {string} location The URL of the page.
	*/
	constructor(options = {}) {
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
					CONTAINER.removeAttribute("tabs-group");
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
				if (NAME != `status`) {
					// Add the events to each tab. 
					(Object.keys(this[NAME][`elements`][`tabs`]).length)
						? (Object.keys(this[NAME][`elements`][`tabs`]).forEach((ID) => {
							this[NAME][`elements`][`tabs`][ID][`header`].addEventListener(`click`, () => {
								this.open(NAME, ID);
							});
						}))
						: false;
	
					// Open the last selected tab. 
					(global.read([`view`, `tabs`, NAME, `selected`])).then((SELECTED) => {
						if (SELECTED != null) {
							// Wait until page load is complete. 
							this.open(NAME, SELECTED, {"don't save": true, "automatic": true});
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
			// Update the variable. 
			this[name][`selected`] = ID;

			(((typeof options).includes(`obj`) && options) ? options[`don't save`] : false)
				? false
				: this[`status`][`last`] = await global.write([`view`, `tabs`, name, `selected`], ID, 1, {"silent": true});

			// Select the tab. 
			(((typeof options).includes(`obj`) && options) ? options[`automatic`] : false)
				? ((nested.dictionary.get(this, [name, `elements`, `tabs`, ID, `header`]))
					? this[name][`elements`][`tabs`][ID][`header`].click()
					: false)
				: false;		
		}

	}
}

export {Tabs};