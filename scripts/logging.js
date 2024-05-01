/* logging.js
Alert management system.
*/

import texts from "/scripts/mapping/read.js";

export default class logging {
	static async confirm(MESSAGE) {
		let user_response = confirm(
			texts.localized((MESSAGE) ? MESSAGE : `GUI_alert_confirm_action_text`),
		);

		// Return the user response.
		return user_response;
	}

	/* Create a new message. 

	@param {string} TITLE the title
	@param {string} MESSAGE the message
	@param {bool} PRIORITY automatically dismiss other, older messages */
	constructor(TITLE, MESSAGE, PRIORITY = true) {
		// Set this message's properties. 
		if (MESSAGE == null) {
			this.message = TITLE;
		} else {
			this.title = TITLE;
			this.message = MESSAGE;
		}

		(PRIORITY) ? this.clear() : false;

		// Display the message. 
		if (MESSAGE) {
			console.log('%c%s%c\n%s', 'font-weight: bold;', this.title, ``, this.message);
		} else {
			console.log(this.message);
		}

		try {
			M.toast({ text: (MESSAGE ? (this.title).concat(`\n`) : ``).concat(this.message) });
		} catch (err) {}
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
		try {
			(critical) ? alert(message) : M.toast({ text: message });
		} catch(err) {};
	}
	
	/*
	Raise an error message.

	@param {number} ERROR_CODE the error code
	@param {number} ERROR_MESSAGE the custom error message
	@param {boolean} critical the critical nature
	*/
	static async error(ERROR_CODE, ERROR_MESSAGE, ERROR_STACK, critical = true) {
		// Display the error message.
		console.error(texts.localized(`error_msg`, false, [ERROR_CODE, ERROR_MESSAGE, ERROR_STACK]));
		try {
			(critical) ? alert(texts.localized(`error_msg_GUI`, false, [String(ERROR_CODE), ERROR_MESSAGE])) : M.toast({ text: ERROR_MESSAGE });
		} catch(err) {};
	}

	/* Clear the current message. */
	clear() {
		try {
			var toastElement = document.querySelectorAll('.toast');
			(toastElement) ? (
			toastElement.forEach((element) => {
				element.style.display = "none";
			})) : false;
		} catch(err) {};
	};
}
