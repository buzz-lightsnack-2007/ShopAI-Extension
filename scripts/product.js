/* ask.js
Ask product information to Google Gemini. */

// Import the storage management module.
const secretariat = await import(chrome.runtime.getURL("scripts/secretariat.js"));

// Don't forget to set the class as export default.
class product {
	/* Initialize a new product with its details.

	@param {object} details the product details
	*/
	constructor (details) {
	};

	/* Get the product information.

	@param {object} options the options
	@returns {object} the analysis
	*/
	analyze(options) {
		const gemini = (await import('./AI/gemini.js')).default;
		let analyzer = new gemini ((typeof(options).includes(`obj`) && !Array.isArray(options) && options != null) ? options[`API Key`] : await secretariat.read([`settings`,`analysis`,`api`,`key`], 1), `gemini-pro`);


	}
};
