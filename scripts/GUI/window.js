/* different from windowman.js, just creates window management. */

export default class Window {
	#options;

	constructor(url, options) {
		this.url = url;
		this.update(options);

		// Show the window if it's not hidden.
		(!this.hidden) ? this.show() : false;
	}

	/* 
	Check this window's state. 
	*/
	#check() {
		const deactivate = () => {
			delete this.ID;
			this.hidden = true;
		};

		// Determine if this window is still open. 
		try {
			(this.ID)
				? chrome.windows.get(this.ID, (window) => {
					(window == null) ? deactivate() : false;
				})
				: false;
		} catch(err) {
			deactivate();
		}
		
	}

	/*
	Show the window.
	*/
	show() {
		this.#check();

		if (!this.ID) {
			chrome.windows.create(this.#options, (window) => {
				this.hidden = false;
				this.ID = window.id;
			})
		};
	};


	/*
	Hide the window. 
	*/
	hide() {
		this.#check();

		// Close the window if it is still defined. 
		(this.ID) ? chrome.windows.remove(this.ID) : false;

		// Remove the ID. 
		delete this.ID;
		this.hidden = true;
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

	/* 
	Set the options of the window. 
	*/
	update(options) {
		if ((typeof options).includes(`obj`) && options != null) {
			// Merge the options if defined. If not, set it to the options itself. 
			this.#options = (this.#options)
				? Object.assign(this.#options, options)
				: options;
			
			(Object.keys(options)).forEach((OPTION) => {
				this[OPTION] = options[OPTION];
			});
		}

		// Check if the URL starts with a valid protocol. If not, it is most likely an extension page. 
		(!(this.url.startsWith(`http`) && this.url.contains(`://`)))
			? this.url = chrome.runtime.getURL(this.url)
			: false;
		
		this.#options[`url`] = (this.url != this.#options[`url`]) ? this.url : this.#options[`url`];

		// Make sure height and width are integers. 
		[`height`, `width`].forEach((DIMENSION) => {
			if (this[DIMENSION]) {
				this[DIMENSION] = Math.abs(parseInt(this[DIMENSION]));
				this.#options[DIMENSION] = this[DIMENSION];
			}
		});

		// Remove options only readable here and not in the API. 
		(this.hidden != null)
			? delete this.#options.hidden
			: this.hidden = ((this.hidden != null)
				? this.hidden
				: false);

		// Update windows already open. 
		this.#check();
		(this.ID) ? chrome.windows.update(this.ID, options) : false;
	}
};