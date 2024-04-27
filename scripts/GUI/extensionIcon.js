class BrowserIcon {
	/* Change a property of the browser icon. 

	@param {object} options The options to change.
	@param {object} parameters The parameters to apply with the change.
	*/
	static set(options, parameters) {
		/* Format the parameter to pass. */
		function format(option, parameters) {
			// Remove windowId if both that and tabId is present. 
			(parameters) ? ((parameters.tabId != null && parameters.windowId != null) ? delete parameters.windowId : null) : null;

			// Merge the option to be passed and the updated parameters. 
			return ((parameters) ? Object.assign(option, parameters) : option);
		}

		(options.Icon) ? chrome.browserAction.setIcon(format({"path": path}, parameters)) : null;
		(options.BadgeText) ? chrome.browserAction.setBadgeText(format({"text": String(options.text)}, parameters)) : null;
		(options.BadgeBackgroundColor) ? chrome.browserAction.setBadgeBackgroundColor(format({"color": color}, parameters)) : null; 
		(options.Popup) ? chrome.browserAction.setPopup(format({"popup": popup}, parameters)) : null;
	};

	/* 
	Get a detail regarding the current browser icon.
	
	@param {string} detail The detail to get.
	@param {object} parameters The filter parameters
	*/
	static get(detail, parameters) {
		/* Format the parameter to pass. */
		function format(parameters) {
			// Remove windowId if both that and tabId is present. 
			(parameters) ? ((parameters.tabId != null && parameters.windowId != null) ? delete parameters.windowId : null) : null;

			// Merge the option to be passed and the updated parameters. 
			return (parameters);
		}

		return (chrome.browserAction[`get`.concat(detail)](((parameters) ? format(parameters) : null)));
	}
};

export {BrowserIcon as default};