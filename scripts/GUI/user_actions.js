export default class user_actions {
	static init() {
		chrome.sidePanel
			.setPanelBehavior({ openPanelOnActionClick: true })
			.catch((error) => console.error(error));
	};
};