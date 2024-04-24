/* context_menus.js */

export default class Menu {
	#options;

	constructor (ID, title, contexts, event, type, icon) {
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
			this.events = (event) ? event : {"onClicked" : function() {}};
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
		this.hidden = true;
		chrome.contextMenus.remove(this.ID);
	};

	show() {
		this.hidden = false;
		this.ID = chrome.contextMenus.create(this.#options);

		if (((this.events && (typeof this.events).includes(`obj`) && !Array.isArray(this.events))) ? Object.keys(events) > 0 : false) {
			(Object.keys(this.events)).forEach((EVENT) => {
				chrome.contextMenus[EVENT].addListener((info, tab) => {
					((info.menuItemId) ? info.menuItemId == this.ID : false)
						? this.events[EVENT](info, tab)
						: false;
				})
			});
		};
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
			title: this.title,
			contexts: this.contexts,
			type: this.type
		};
		(this.icon) ? this.#options.icon = this.icon : null;

		chrome.contextMenus.update(this.ID, this.#options);

		(((this.events && (typeof this.events).includes(`obj`) && !Array.isArray(this.events))) ? Object.keys(events) > 0 : false) 
			? (Object.keys(this.events)).forEach((EVENT) => {
				chrome.contextMenus[EVENT].addListener((info, tab) => {
					((info.menuItemId) ? info.menuItemId == this.ID : false)
						? this.events[EVENT](info, tab)
						: false;
				})
			})
			: false;
	}

	/* Run a new function when triggered. */
	onclick(callback) {
		this.event = {"onClicked": callback};
		this.update();
	}
}