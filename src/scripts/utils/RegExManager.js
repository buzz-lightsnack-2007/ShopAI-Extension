/*
RegEx Manager
Tests and manages regular expressions
*/

class RegExManager {
	/*
	Tests a regular expression.

	@param {string} expression The regular expression to test.
	@return {boolean} the state
	*/
	static test(expression) {
		let RESULT = {};
		RESULT[`state`] = false;
		try {
			RESULT[`expression`] = new RegExp(expression);
			RESULT[`state`] = true;
		} catch(err) {};

		return (RESULT[`state`]);
	};
};

export {RegExManager};
