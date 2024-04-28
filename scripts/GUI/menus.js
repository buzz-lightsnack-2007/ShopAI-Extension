/* context_menus.js
Context menu management
*/

export default class Menu {
	#options;

	constructor (ID, title, contexts, events, type, icon) {
		if ((typeof ID).includes(`obj`) && !Array.isArray(ID)) {
			// Create the ID if it doesn't exist. 
			ID.ID = ((ID.hasOwnProperty(`ID`)) ? ID.ID : false) ? ID.ID : String(Math.random() / Math.random() * 100);

			(Object.keys(ID)).forEach((key) => {
				this[key] = ID[key];
			})
		} else {
			this.ID = String((ID) ? ID : (Math.random() / Math.random() * 100));
			this.title = (title) ? title : `Menu`;
			this.contexts = (Array.isArray(contexts)) ? contexts : [`all`];
			this.events = (events) ? events : {"onClicked" : function() {}};
			this.type = (((typeof type).includes(`str`) && type) ? type.trim() : false) ? type : `normal`;

			if (icon) {
				this.icon = icon;
			};
		};

		this.#options = {
			id: this.ID,
			title: this.title,
			contexts: this.contexts,
			type: this.type
		};
		(this.icon) ? this.#options.icon = this.icon : null;
		((this.hidden != null) ? (!this.hidden) : true) ? this.show() : null;
	};

	remove() {
		(!this.hidden) ? chrome.contextMenus.remove(this.ID) : false;
		this.hidden = true;
	};

	show() {
		if (this.hidden || this.hidden == null) {
			this.hidden = false;
			this.ID = chrome.contextMenus.create(this.#options);	

			if (((this.events && (typeof this.events).includes(`obj`) && !Array.isArray(this.events))) ? Object.keys(this.events).length > 0 : false) {
				(Object.keys(this.events)).forEach((EVENT) => {
					chrome.contextMenus[EVENT].addListener((info, tab) => {
						if (info.menuItemId == this.ID) {
							this.events[EVENT](info, tab)
						}
					})
				});
			};
		}
	}

	/* Update the context menu. 
	
	@param {Object} options The new options for the context menu.
	*/
	update(options) {
		if ((typeof options).includes(`obj`) && options != null && !Array.isArray(options)) {
			(Object.keys(options)).forEach((key) => {
				(options[key] != null && options[key] != undefined) ? this[key] = options[key] : delete this[key];
			});
		}

		this.#options = {
			id: this.ID,
			title: this.title,
			contexts: this.contexts,
			type: this.type
		};
		(this.icon) ? this.#options.icon = this.icon : null;

		(!this.hidden) ? chrome.contextMenus.update(this.ID, this.#options) : false;

		(((this.events && (typeof this.events).includes(`obj`) && !Array.isArray(this.events))) ? Object.keys(this.events) > 0 : false) 
			? (Object.keys(this.events)).forEach((EVENT) => {
				chrome.contextMenus[EVENT].addListener((info, tab) => {
					((info.menuItemId) ? info.menuItemId == this.ID : false)
						? this.events[EVENT](info, tab)
						: false;
				})
			})
			: false;
	}

	/*
	Run a new function when triggered.
	
	@param {function} callback the function to run
	*/
	onclick(callback) {
		this.addActionListener("onClicked", callback);
	}
	
	/*
	Run an event following an action. 
	
	@param {string} event the event
	@param {function} callback the function to run
	*/
	addActionListener(event, callback) {
		this.events = (this.events == null) ? {} : this.events;
		this.events[event] = callback;
		this.update();
	};
}