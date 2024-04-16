/* Popup.js
	Build the interface for popup
*/

// Import modules.
import {read, forget} from "/scripts/secretariat.js";
import windowman from "/scripts/GUI/windowman.js";
import Page from "/scripts/pages/page.js";

class Page_Popup extends Page {
	constructor() {
		super();
		(this.events) ? this.events() : false;
	}

	events() {

	}
}

new Page_Popup();