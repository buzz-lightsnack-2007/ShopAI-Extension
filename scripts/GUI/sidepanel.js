// Manage the sidepanel. 
// The sidepanel is what I'll call the Sidebar. 

import Tabs from './tabs.js';

export default class Sidebar {
	options; // The options for the sidebar
	path; // The URL of the sidebar
	focused; // The focused state of the sidebar. 
	hidden; // The hidden state of the sidebar.

	/* 
	Create a new sidebar. 

	@param {string} PATH the path of the file to be displayed by the sidebar
	*/
	constructor (PATH) {
		// Set the side panel options. 
		this.options = ((typeof PATH).includes(`str`)) ? { "path": PATH } : PATH;
	
		// Determine whether the sidebar is open. 
		this.hidden = (Object.keys(this.options).length > 0 ? (this.options.hidden != null) : false) ? this.options.hidden : false;
		delete this.options.hidden;

		// Grab the current tab ID. 
		Tabs.query({ active: true, currentWindow: true }, 0).then((TAB) => {
			this.path = chrome.sidePanel.getOptions({"tabId": TAB.id}).path;
			(!this.hidden) ? this.show(TAB.id) : this.hide();
		});
	}

	// Close the side panel. 
	hide () {
		// Make sure that the panel is still active. 
		if (this.state) {
			// First, disable it to close it. 
			chrome.sidePanel.setOptions({enabled: false});
		};
	};

	/* 
	Open the side panel. 

	@param {string} tab_ID the tab ID to open the side panel in
	*/
	show (tab_ID) {
		// Set the options. Make sure that it is enabled. 
		chrome.sidePanel.setOptions(Object.assign(this.options, {enabled: true}));

		if (tab_ID) {chrome.sidePanel.open({"tabId": tab_ID});}
		else {
			Tabs.query({ active: true, currentWindow: true }, 0).then((TAB) => {
				chrome.sidePanel.open({"tabId": TAB.id});
			});
		};
	}

	/* Set the options. 
	
	@param {object} options the options
	*/
	setOptions(options) {
		// Merge the options. 
		options = Object.assign(this.options, options);

		// Set the options. 
		chrome.sidePanel.setOptions(options);
	}
}