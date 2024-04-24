export default class Tabs {
	/* Add an action listener. 
	
	@param {string} event The event to listen for
	@param {function} callback The callback function
	*/
	static addActionListener(event, callback) {
		chrome.tabs[event].addListener((tabId, info, tab) => {callback({"tabId": tabId, "info": info, "tab": tab})})
	};

	/* Create a new tab.

	@param {string} URL The URL to open
	@param {number} index The index of the tab
	@param {boolean} pinned Whether the tab is pinned
	*/
	static create(URL, index, pinned = false) {
		((typeof index).includes(`obj`) && index != null && !Array.isArray(index))
		// Set the options. 
		let OPTIONS = {url: URL, active: true, pinned: pinned};
		(index) ? OPTIONS.index = index : null;

		// Create the tab. 
		chrome.tabs.create(OPTIONS);
	}

	/* Filters all tabs and returns a result.
	
	@param {Object} filters The filters on tab search
	@param {number} index the tab number to return
	*/
	static async query(filters, index) {
		filters = ((typeof filters).includes(`obj`) && filters != null) ? filters : { active: true, currentWindow: true};
		let TABS = {};

		TABS.all = await chrome.tabs.query(filters);
		TABS.result = (index != null)
			? TABS.all[Math.abs(parseFloat(index))]
			: TABS.all;

		return (TABS.result);
	}
}