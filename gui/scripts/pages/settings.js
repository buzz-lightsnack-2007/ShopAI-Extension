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
    if (!last_opened || typeof last_opened !== `number`) {
      last_opened = 0;
    }

    if (document.querySelector(`[role="tab"][tab="${last_opened}"]`)) {
      document.querySelector(`[role="tab"][tab="${last_opened}"]`).click();
    }
  }

  openLast();
}

/*
		Define the mapping of each button.
		*/
function events() {
  windowman.events();

  if (document.querySelector(`[data-action="filters,update"]`)) {
    document
      .querySelector(`[data-action="filters,update"]`)
      .addEventListener(`click`, async () => {
        let filters = await import(chrome.runtime.getURL(`scripts/filters.js`));
        filters.update();
      });
  }
  if (document.querySelector(`[data-action="storage,clear"]`)) {
    document
      .querySelector(`[data-action="storage,clear"]`)
      .addEventListener(`click`, async () => {
        let storage = await import(
          chrome.runtime.getURL(`scripts/secretariat.js`)
        );
        storage.forget(`sites`);
      });
  }
}

function main() {
  windowman.prepare();
  windowman.fill();
  events();
  arrange();
}

main();
