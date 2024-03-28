/* Settings.js
	Build the interface for the settings
*/

// Import modules.
import { windowman } from "../windowman.js";
let secretariat = await import(chrome.runtime.getURL("scripts/secretariat.js"));

/*
		Arrange the interface.
		*/
function arrange() {
  async function openLast() {
    let last_opened = (
      await Promise.all([secretariat.read([`view`, window.location.href], 1)])
    )[0];
    if (!last_opened) {
      last_opened = "settings";
    }

    document.querySelector(`[role="tab"][for="${last_opened}"]`).click();
  }

  openLast();
}

/*
		Define the mapping of each button.
		*/
function events() {
  windowman.events();

  document
    .querySelector(`[data-action="filters,update"]`)
    .addEventListener(`click`, async () => {
      let filters = await import(chrome.runtime.getURL(`scripts/filters.js`));
      filters.update();
    });
}

function main() {
  let tab = windowman.prepare();
  windowman.fill();
  arrange();
  events();
}

main();
