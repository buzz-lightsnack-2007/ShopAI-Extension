// Manage the sidepanel. 
// The sidepanel is what I'll call the Sidebar. 
export default class Sidebar {
	/* 
	Create a new sidebar. 

	@param {string} PATH the path of the file to be displayed by the sidebar
	*/
	constructor (PATH) {
		// Set side panel's URL. 
		chrome.sidePanel.setOptions({ path: PATH });
		
		// Grab the current tab ID. 
		chrome.tabs.query({ active: true, currentWindow: true }, function ([TAB]) {
			chrome.sidePanel.open({windowId: TAB.id});
			this.root = PATH;
		});

		chrome.runtime.onConnect.addListener((CONNECTION) => {
			if ((CONNECTION.name).includes(`view=${PATH}`)) {
				this.focus(TRUE);
				CONNECTION.onDisconnect.addListener(async () => {
					this.focus(FALSE);
				});
			}
		});
	}

	/* 
	Set the focused state of the side panel. 

	@param {boolean} STATE the focused state
	*/
	focus(STATE) {
		if (STATE != null && (typeof STATE).includes(`bool`)) {this.state = STATE;}
		else {chrome.sidePanel.setOptions({ path: this.root });} 
	}

	// Close the side panel. 
	async close() {
		// Make sure that the panel is still active. 
		if (this.state) {
			// First, disable it to close it. 
			await chrome.sidePanel.setOptions({enabled: false});

			// Then, re-enable it. 
			await chrome.sidePanel.setOptions({enabled: true});
		};
	};
}