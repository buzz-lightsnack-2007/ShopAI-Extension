/* Settings.js
  Build the interface for the settings
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

          function menu() {
               element.inject(null, 'navbar', element[`content`], `menu`, null, null, {'role': 'tablist'})
          }

          function tabs() {
               let tab_names = ['preferences', 'filters', 'about'];
          
               (tab_names).forEach((tab_name) => {
                    // Create the elements for each tab content. 	
                    let inserted_element = element.inject(texts.localized(`term_`.concat(tab_name)), texts.localized(`term_`.concat(tab_name)), element[`content`], `section`, null, null, {'role': `tabpanel`});

                    // Create the menu elements. 
                    element.inject(texts.localized(`term_`.concat(tab_name)), texts.localized(`term_`.concat(tab_name)), element[`content`][`navbar`], `button`, null, null, {'aria-controls': inserted_element});
                    
               });
          }

          function action_buttons() {
               element.inject(null, `footer`, element[`content`], `footer`, [`field-row`], null, {'style': 'justify-content: flex-end'});
               
               let button_names = ['apply', 'cancel'];

               (button_names).forEach((button_name) => {
                    // Create the elements for each tab content. 	
                    element.inject(null, texts.localized(`term_`.concat(button_name)), element[`content`][`footer`], `button`);
               });               
          }

          // TODO work on the content; perhaps, it must read from JSON of valid prefs

          controls();
          menu();
          tabs();
          action_buttons();

     }

     /* Populate the strings on the page. */
     function say(element) {
          document.title = texts.localized(`GUI_title_preferences`);

          element.update(element[`titlebar`][`title`], texts.localized(`GUI_title_preferences`));

          // Controls
          let tab_names = ['preferences', 'filters', 'about'];
          (tab_names).forEach((tab_name) => {
               element.update(element[`content`][`navbar`][texts.localized(`term_`.concat(tab_name))], texts.localized(`term_`.concat(tab_name)));
          });

          function action_buttons() {
               let button_names = ['apply', 'cancel'];

               (button_names).forEach((button_name) => {
                    // Create the elements for each tab content. 	
                    element.update(element[`content`][`footer`][texts.localized(`term_`.concat(button_name))], texts.localized(`term_`.concat(button_name)));
               });               
          };
          
          action_buttons();
     };

     function openLast() {
          let last_opened = 'Preferences';
          
     }

     function main() {
          let tab = start();
          design(tab);
          say(tab);
     }

     main();



