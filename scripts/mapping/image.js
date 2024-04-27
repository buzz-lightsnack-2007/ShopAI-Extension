
const CONFIG = chrome.runtime.getURL("media/config.icons.json");

class Image {
	/* Get the appropriate image path from the configuration. 
	
	@param {string} name The name of the image.
	*/
	static get(name, size) {
		return (fetch(CONFIG)
			.then((response) => response.json())
			.then((jsonData) => {
				let image = {'raw': jsonData[name]};
				image[`filtered`] = (image[`raw`] && size) ? image[`raw`][String(size)] : image[`raw`];

				// Set the appropriate URL. 
				if (typeof image[`filtered`] == `string` && !image[`filtered`].includes(`://`)) {
					image[`filtered`] = chrome.runtime.getURL(image[`filtered`]);
				} else if (((typeof image[`filtered`]).includes(`obj`) && image[`filtered`] != null && !Array.isArray(image[`filtered`])) ? (Object.keys(image[`filtered`]).length) : false) {
					Object.keys(image[`filtered`]).forEach((key) => {
						image[`filtered`][key] = (!image[`filtered`][key].includes(`://`)) ? chrome.runtime.getURL(image[`filtered`][key]) : image[`filtered`][key];
					});
				} else if (Array.isArray(image[`filtered`])) {
					image[`filtered`] = image[`filtered`].map((element) => {
						return chrome.runtime.getURL(element);
					});
				};

				return image[`filtered`];
			})
			.catch((error) => {
				console.error(error);
			}));
	};
}

export {Image as default};