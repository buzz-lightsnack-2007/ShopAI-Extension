/* different from windowman.js, just creates window management. */

export default class Window {
	#options;

	constructor(url, options) {
		this.url = url;

		if ((typeof options).includes(`obj`) && options != null) {
			this.#options = options;
			(Object.keys(options)).forEach((OPTION) => {
				this[OPTION] = options[OPTION];
			});
		}

		// Check if the URL starts with a valid protocol. If not, it is most likely an extension page. 
		if (!(this.url.startsWith(`http`) && this.url.contains(`://`))) {
			this.url = chrome.runtime.getURL(this.url);
		}

		this.#options = (this.#options) ? this.#options : {};
		this.#options[`url`] = (this.url != this.#options[`url`]) ? this.url : this.#options[`url`];

		// Remove options only readable here and not in the API. 
		(this.hidden != null) ? delete this.#options.hidden : this.hidden = false;

		// Show the window if it's not hidden.
		(!this.hidden) ? this.show() : false;
	}

	/*
	Show the window.
	*/
	show() {
		chrome.windows.create(this.#options, (window) => {
			this.ID = window.id;
		});
	};


	/*
	Hide the window. 
	*/
	hide() {
		// Close the window if it is still defined. 
		(this.ID) ? chrome.windows.remove(this.ID) : false;

		// Remove the ID. 
		delete this.ID;
	}

	/* Create an action listener. 

	@param {string} event the event to listen for
	@param {function} callback the callback function
	*/
	static addActionListener(event, callback) {
		// Correct possible syntax error on "on" prefix.
		event = (!event.includes(`on`)) ? `on${event}` : event;

		// Add the event. 
		chrome.windows[event].addListener(callback);
	}
};