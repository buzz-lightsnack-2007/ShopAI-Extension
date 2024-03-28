/* Settings.js
	Build the interface for the settings
*/

// Import modules.
import { windowman } from "../windowman.js";
let secretariat = await import(chrome.runtime.getURL("scripts/secretariat.js"));

// Import configuration file.
// const config = chrome.runtime.getURL('gui/layouts/settings.json');

let pref_pane = 0;

function start() {
  windowman.prepare();
}

/* Generate the appropriate strings.  */
function say() {
  windowman.fill();
}

/*
		Arrange the interface.
		*/
function arrange() {
  async function click() {
    let last_opened = (
      await Promise.all([secretariat.read([`view`, window.location.href], 1)])
    )[0];
    if (!last_opened) {
      last_opened = "settings";
    }

    document.querySelector(`[role="tab"][for="${last_opened}"]`).click();
  }

  // click!
  // document.querySelector(`menu button[role="tab"][aria-controls="${last_opened}"]`).click();
  click();
}

/*
		Define the mapping of each button.
		*/
function events() {
  windowman.events();
}

function main() {
  let tab = start();
  say();
  events();

  arrange();

  /*arrange();
			events();*/
}

main();
