import Sidebar from '/scripts/GUI/sidepanel.js'

export default class ManagedSidebar {
	static manage() {
		chrome.runtime.onMessage.addListener(
			function(request, sender, sendResponse) {
				if (request.action.includes("sidebar_open")) {
					ManagedSidebar.enable();
				}
			}
		);
	}
	
	static enable() {
		new Sidebar(`/pages/popup.htm`);
	}

	disable() {

	}
}