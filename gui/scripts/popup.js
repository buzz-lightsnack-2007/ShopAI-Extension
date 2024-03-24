/* Popup.js
  Build the interface for popup
*/

// Import modules. 
import texts from './read.JS';
import windowman from './windowman.JS';


     // Import modules.
     let secretariat = await import(chrome.runtime.getURL("scripts/secretariat.js"));
     
     let pref_pane = 0;


     function start() {
          windowman.prepare();

          return(new windowman(`body`, null, null, {'Close': true}));
     }

     /* Add the UI design. */
     function design(element) {
          // Set the event of the window. 
          function controls() {
               document.getElementById(element[`titlebar`][`controls`][`Close`][`ID`]).onclick = function(){element.terminate(false)};
          }


          

          // TODO work on the content; perhaps, it must read from JSON of valid prefs

          controls();

     }

     /* Populate the strings on the page. */
     function say(element) {
          element.update(element[`titlebar`][`title`], texts.localized(`GUI_title_preferences`));

     };

     function main() {
          let tab = start();
          design(tab);
          say(tab);
     }

     main();



