/*
	hello.js
	Build the interface for the welcome and configuration page. 
*/

// Import modules.
import {global} from "/scripts/secretariat.js";
import Page from "/scripts/pages/page.js";
import texts from "/scripts/mapping/read.js";
import filters from "/scripts/filters.js";
import logging from "/scripts/logging.js";

class Page_MiniConfig extends Page {
	constructor () {
		super();
		this.#get();
		this.content();
	};

	/*
	Get all elements needed for content().
	*/
	#get() {
		this.elements = (this.elements) ? this.elements : {};
		this.elements[`1`] = (this.elements[`1`]) ? this.elements[`1`] : {};

		this.elements[`1`]["headline"] = document.querySelectorAll(`[for="GUI_welcome_headline"]`);
	}

	/*
	Build the additional content for the page. 
	*/
	content() {
		if (this.elements[`1`][`headline`].length) {
			let RANDOM = Math.floor(Math.random() * 2) + 1;
			(this.elements[`1`]["headline"]).forEach((ELEMENT) => {
				console.log(RANDOM, texts.localized(`OOBE_welcome_headline_`.concat(String(RANDOM))));
				ELEMENT.textContent = texts.localized(`OOBE_welcome_headline_`.concat(String(RANDOM)));
			});
		};
	};

	/*
	Assist with navigation. 
	*/
	navigate() {
		this.navigation = (this.navigation) ? this.navigation : {};
		this.navigation.selection = (this.navigation.selection) ? this.navigation.selection : 0;
	}
}

new Page_MiniConfig();