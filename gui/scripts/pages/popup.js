/* Popup.js
  Build the interface for popup
*/

// Import modules.
import windowman from "../windowman.js";
let secretariat = await import(chrome.runtime.getURL("scripts/secretariat.js"));

function start() {
  windowman.prepare();
}
/* Populate the strings on the page. */
function say(element) {
  // document.title
}

function main() {
  let tab = start();
  say(tab);
}

main();
