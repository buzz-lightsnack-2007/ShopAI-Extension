/* windowman
Window management */

import texts from "./read.JS";

class windowman {
     /* Initialize the window frame. */
	static prepare() {
    try {
         let UI = {'library': [chrome.runtime.getURL('gui/styles/interface.external.css'), chrome.runtime.getURL('gui/styles/ui.css')], 'script': chrome.runtime.getURL('gui/scripts/external/interface.external.js')};

				 (UI.library).forEach((source) => {
					 	$(`head`).append(`<link rel="stylesheet" type="text/css" href="${source}">`);
				 })

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

	static fill() {

		function text() {
			let text_elements = document.querySelectorAll("[data-text]");

			text_elements.forEach((text_element) => {
				let text_inserted = texts.localized(text_element.getAttribute(`data-text`), (text_element.hasAttribute(`data-text-parameter`)) ? eval(text_element.getAttribute(`data-text-parameter`)) : null );
				if (!text_inserted) {text_inserted = texts.localized(`term_`.concat(text_element.getAttribute(`data-text`)));}

				text_element.innerText = text_inserted;
			})
		}

		text();
	}
}

export {windowman};
