/* Settings.js
  Build the interface for the settings
*/

import texts from './read.JS';
import windowman from './windowman.JS';

function start() {
	windowman.prepare();

	return(new windowman(`body`, null, null, {'Close': true}));
}

function populate(element) {
	/* Populate the strings on the page. */
	element.update(element[`titlebar`][`title`], texts.localized(`GUI_title_prefs`));
}

function main() {
	let tab = start();
	populate(tab);
}

main();
