
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
				return image[`filtered`];
			})
			.catch((error) => {
				console.error(error);
			}));
	};
}

export {Image as default};