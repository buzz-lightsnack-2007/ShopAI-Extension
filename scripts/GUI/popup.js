/* 
popup.js
Manage extension popups. 
*/

class Popup {
	options; // The options for the popup
	path; // The URL of the popup
	enabled = true; // The popup's enabled state

	/* Create a new pop-up configuration. 
	
	@param {Object} options The options for the popup. If string, this is set to the URL; otherwise, this is passed directly as the options. 
	*/
	constructor (options) {
		// Set the side panel options. 
		this.options = ((typeof options).includes(`str`)) ? { "popup": options } : options;
	
		// Set the other options not to be directly passed to the Chrome API. 
		[`hidden`, `enabled`].forEach((key) => {
			this[key] = (Object.keys(this.options).length > 0 ? (this.options[key] != null) : false) ? this.options[key] : true;
			delete this.options[key];
		})

		// Set the popup path.
		chrome.action.setPopup(this.options);

		// Set the popup state.
		this[(this.enabled) ? `enable` : `disable`]();
		(!this.hidden && this.hidden != null) ? this.show() : false;

		// Remove untrackable variables. 
		delete this.hidden;
	}

	/* 
	Open the side panel. 
	*/
	show () {
		if (this.enabled) {
			// Set the options if in case it was previously overwritten.  
			chrome.action.setPopup(this.options);
	
			// Open the pop-up. 
			chrome.action.openPopup();
		};
	};

	/*
	Disable the popup. 
	*/
	disable () {
		chrome.action.disable();
		this.enabled = false;
	}

	/*
	Enable the popup. 
	*/
	enable () {
		chrome.action.enable();
		this.enabled = true;
	}

	/*
	Set the options. 
	
	@param {object} options the options
	*/
	setOptions(options) {
		// Merge the options. 
		options = Object.assign(this.options, options);

		// Set the options. 
		chrome.action.setPopup(options);
	}
}

export {Popup as default}