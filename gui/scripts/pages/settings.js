/* Settings.js
  Build the interface for the settings
*/

// Import modules.
//import { windowman } from "../windowman.js";

async function build() {
  let secretariat = (
    await import(chrome.runtime.getURL("scripts/secretariat.js"))
  ).secretariat;
  let windowman = (
    await import(chrome.runtime.getURL("gui/scripts/windowman.js"))
  ).windowman;

  let window = new windowman();
}

/*
    Arrange the interface.
    */
/*function arrange() {
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


function main() {
  windowman.fill();
  events();
  arrange();
}*/

/*
    Define the mapping of each button.
    */
function events() {
  if (document.querySelector(`[data-action="filters,update"]`)) {
    document
      .querySelector(`[data-action="filters,update"]`)
      .addEventListener(`click`, async () => {
        let filters = (
          await import(chrome.runtime.getURL(`scripts/filters.js`))
        ).default;
        filters.update();
      });
  }
  if (document.querySelector(`[data-action="storage,clear"]`)) {
    document
      .querySelector(`[data-action="storage,clear"]`)
      .addEventListener(`click`, async () => {
        let storage = (
          await import(chrome.runtime.getURL(`scripts/secretariat.js`))
        )["secretariat"];
        storage.forget(`sites`);
      });
  }
}

//main();
function load() {
  document.addEventListener("DOMContentLoaded", function () {
    M.AutoInit();
  });

  build();
  events();
}

load();
