/* windowman
Window management */

import texts from "./read.JS";

class windowman {
     /* Initialize the window frame. */
	static prepare() {
          try {
               let UI = {'library': chrome.runtime.getURL('gui/styles/interface.external.css'), 'script': chrome.runtime.getURL('gui/scripts/external/interface.external.js')};

               $(`head`).append(`<link rel="stylesheet" type="text/css" href="${UI.library}">`);
               $(`head`).append(`<script type="module" src="${UI.script}"></script>`);
          } catch(error) {
               console.error(texts.localized(`error_fileNotFound`, [error]));
          }

					// Prevent scaling, similar to a real window. 
					$(`head`).append(`<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />`);
	}


	constructor(URL, height, width) {
		this.window = chrome.windows.create({
	    url: chrome.runtime.getURL(URL),
	    type: "popup",
	    width: (width) ? width: 400,
	    height: (height) ? height: 600,
	  });
	}
}

export {windowman};
