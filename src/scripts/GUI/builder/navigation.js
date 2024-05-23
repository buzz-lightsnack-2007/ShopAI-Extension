/*

*/

import nested from "/scripts/utils/nested.js";

class NavigationBar {
	options = {};

	constructor () {
		this.#get();
	};

	#get () {
		let NAVIGATION_ELEMENTS = document.querySelectorAll(`nav.nav-wrapper`);

		// If there are navigation elements, then proceed.
		(NAVIGATION_ELEMENTS.length)
			? (NAVIGATION_ELEMENTS.forEach((ELEMENT) => {
				// Set the name, or generate one if it doesn't exist.
				let NAME = (ELEMENT.getAttribute(`id`) || ELEMENT.getAttribute(`nav-name`) || Object.keys(this).length);

				if (!([`options`].includes(NAME))) {
					this[NAME] = (this[NAME]) ? this[NAME] : {};

					// Set the elements. 
					this[NAME][`elements`] = nested.dictionary.set(this[NAME][`elements`], `container`, ELEMENT);
					
					/*
					Get elements expected to only have one in existence. 
					*/
					const get_constant_elements = () => {
						// Define the attributes to look for
						const ELEMENTS_ATTRIBUTES = [`brand-logo`];

						const add_elements = (list_classes) => {
							list_classes.forEach((CLASS) => {
								let ELEMENTS = ELEMENT.querySelectorAll(`:scope .${CLASS}`);

								// If the element exists, then proceed.
								(ELEMENTS.length)
									? this[NAME][`elements`][CLASS] = ELEMENTS
									: false;
							})
						};
						add_elements(ELEMENTS_ATTRIBUTES);
					}

					const set_elements_groups = () => {
						let GROUPS = ELEMENT.querySelectorAll(`:scope > ul`);

						(GROUPS.length)
							? GROUPS.forEach((GROUP) => {
								// Get the name. 
								let NAME_GROUP = (GROUP.getAttribute(`nav-group-name`) || GROUP.getAttribute(`id`) || ((this[NAME][`elements`][`groups`] ? Object.keys(this[NAME][`elements`][`groups`]).length + 1 : 0) + 1));

								// Set the elements.
								this[NAME][`elements`][`groups`] = nested.dictionary.set(this[NAME][`elements`][`groups`], NAME_GROUP, {"container": GROUP, "items": GROUP.querySelectorAll(`:scope > li`)});

								// Set the element properties. 
								this[NAME][`group`] = nested.dictionary.set(this[NAME][`group`], NAME_GROUP, {"hidden": GROUP.hidden});

								// Remove the attributes. 
								GROUP.removeAttribute(`nav-group-name`)
							})
							: false;
					};

					const set_default_properties = () => {
						this[NAME].hidden = this[NAME][`elements`][`container`].hidden;
					};

					get_constant_elements();
					set_elements_groups();
				};

				// Remove the attributes.
				ELEMENT.removeAttribute(`nav-name`);
			}))
			: false;
	};

	/*
	Show the navigation bar or one of its groups.

	@param {string} name the name of the navigation bar
	@param {string} group the name of the group to show
	@return {boolean} the operation state
	*/
	show(name, group) {
		if ((name && group) ? ((Object.keys(this).includes(name)) ? ((this[name][`group`]) ? Object.keys(this[name][`group`]).includes(group) : false) : false) : false) {
			this[name][`elements`][`groups`][group][`container`].hidden = false;
			this[name][`group`][group][`hidden`] = this[name][`elements`][`groups`][group][`container`].hidden;

			return (this[name][`group`][group][`hidden`] == false);
		} else if (name ? Object.keys(this).includes(name) : false) {
			this[name][`elements`][`container`].hidden = false;
			this[name][`elements`][`container`].classList.remove(`hidden`);
			this[name].hidden = this[name][`elements`][`container`].hidden;

			return (this[name].hidden == false);
		};
	};

	/*
	Hide the navigation bar or one of its groups.

	@param {string} name the name of the navigation bar
	@param {string} group the name of the group to show
	@return {boolean} the operation state
	*/
	hide(name, group) {
		if ((name && group) ? ((Object.keys(this).includes(name)) ? ((this[name][`group`]) ? Object.keys(this[name][`group`]).includes(group) : false) : false) : false) {
			this[name][`elements`][`groups`][group][`container`].hidden = true;
			this[name][`group`][group][`hidden`] = this[name][`elements`][`groups`][group][`container`].hidden;

			return (this[name][`group`][group][`hidden`] == true);
		} else if (name ? Object.keys(this).includes(name) : false) {
			this[name][`elements`][`container`].hidden = true;
			this[name][`elements`][`container`].classList.add(`hidden`);
			this[name].hidden = this[name][`elements`][`container`].hidden;

			return (this[name].hidden == true);
		};
	};
};

export {NavigationBar};