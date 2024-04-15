// Open the settings in a pop-up window.

import windowman from "/scripts/GUI/windowman.JS";

function redirect() {
	let location = {}; 
	location[`original`] = window.location.href;
	location[`page`] = [...location[`original`].split(`/`)].pop();
	location[`target`] = chrome.runtime.getURL("pages/".concat(location[`page`]));

	windowman.new(location[`target`]);

	window.close();
}

function main() {
	redirect();
}

main();
