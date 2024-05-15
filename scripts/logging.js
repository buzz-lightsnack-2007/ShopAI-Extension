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
	constructor(TITLE, MESSAGE, PRIORITY = false) {
		// Set this message's properties. 
		if (!MESSAGE || (typeof MESSAGE).includes(`undef`)) {
			this.message = TITLE;
		} else {
			this.title = TITLE;
			this.message = MESSAGE;
		}

		(PRIORITY) ? this.clear() : false;

		// Display the message. 
		if (MESSAGE) {
			console.log(`%c%s\n%c%s`, `font-weight: bold; font-family: system-ui;`, this.title, `font-family: system-ui;`, this.message);
		} else {
			console.log(`%c%s`, `font-family: system-ui`, this.message);
		}

		try {
			M.toast({ text: (MESSAGE ? (this.title).concat(`\n`) : ``).concat(this.message) });
		} catch (err) {}
	}

	static log(message) {
		return(new logging(message));
	}

	/*
	Raise a warning. 

	@param {boolean} message the message
	@param {boolean} critical the critical nature
	*/
	static warn(message, critical = false) {
		// Depackage the shortcut method of sending the error message, if it is. 
		((typeof message).includes(`obj`))
			? console.error(`%c%s: %c%s`, `font-weight: bold; font-family: system-ui;`, message.name, `font-family: system-ui`, message.message)
			: console.error(`%c%s`, `font-family: system-ui;`, message);
		
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
		// Depackage the shortcut method of sending the error message. 
		if ((typeof ERROR_CODE).includes(`obj`)) {
			ERROR_MESSAGE = ERROR_CODE.message;
			ERROR_STACK = ERROR_CODE.stack;
			ERROR_CODE = ERROR_CODE.name;
		};

		// Display the error message.
		(ERROR_CODE && ERROR_MESSAGE && ERROR_STACK)
			? console.error(`%c%s: %c%s\n%c%s`, `font-weight: bold; font-family: system-ui;`, ERROR_CODE, `font-family: system-ui`, ERROR_MESSAGE, ``, ERROR_STACK)
			: console.error(ERROR_MESSAGE);
		
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
