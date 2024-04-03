/* alerts.js
Alert management system.
*/

export default class alerts {
	static confirm_action() {
		let user_response = false;

		(async () => {
			// Import the module.
			let reader = (await import(chrome.runtime.getURL("gui/scripts/read.js")))[
				`texts`
			];

			// Get the user response.
			user_response = confirm(
				reader.localized(`GUI_alert_confirm_action_text`),
			);
		})();
		// Return the user response.
		return user_response;
	}

	static log(message) {
		console.log(message);
		try {
			M.toast({ text: message });
		} catch (err) {}
	}

	/*
	Raise a warning. 

	@param {boolean} message the message
	@param {boolean} critical the critical nature
	*/
	static warn(message, critical = false) {
		console.warn(message);
	if (critical) {
		alert(message);
	} else {
		try {
			M.toast({ text: message });
		} catch (err) {}
	}
	}
	
	/*
	Raise an error message.

	@param {number} ERROR_CODE the error code
	@param {number} ERROR_MESSAGE the custom error message
	@param {boolean} critical the critical nature
	*/
	static error(ERROR_CODE, ERROR_MESSAGE, ERROR_STACK, critical = true) {
		(async () => {
			// Import the templating.
			const texts = (await import(chrome.runtime.getURL("gui/scripts/read.js"))).default;

			// Display the error message.
			console.error(texts.localized(`error_msg`, false, [ERROR_CODE, ERROR_MESSAGE, ERROR_STACK]));
			if (critical) {
				alert(texts.localized(`error_msg_GUI`, false, [String(ERROR_CODE), ERROR_MESSAGE]));
			} else {
				try {
					M.toast({ text: message });
				} catch (err) {}
			}
		})();
	}
}
