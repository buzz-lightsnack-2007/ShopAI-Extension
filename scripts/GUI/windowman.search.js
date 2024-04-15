import {read, write, observe} from "/scripts/secretariat.js";
import logging from "/scripts/logging.js"
import texts from "/scripts/strings/read.js";

export function search() {
     if (document.querySelectorAll(`[data-result]`)) {
          /* 
               Display the search result. 
               
               @param {object} ELEMENT_TARGET the target element
               @param {object} RESULTS the results
               @param {object} TITLE_FIELD the title field for each result
          */
          var SEARCH = {};
          
          function display(TARGET_NAME, RESULTS, TITLE_FIELD) {

               if (document.querySelectorAll(`[data-results-list="${TARGET_NAME}"]`)) {
                    (document.querySelectorAll(`[data-results-list="${TARGET_NAME}"]`)).forEach(function (ELEMENT_TARGET) {
                         // Set the target element to the correct data structure (lists). 
                         TARGET_NAME = (!Array.isArray(TARGET_NAME)) ? TARGET_NAME.split(`,`) : TARGET_NAME;
                         
                         // Clear the target element.
                         ELEMENT_TARGET.innerHTML = ``;

                         function setSelected(element) {
                              SEARCH[TARGET_NAME][`selected`] = (element) ? (Object.keys(RESULTS))[(Array.prototype.slice.call(element.parentElement.parentElement.querySelectorAll(`a`))).indexOf(element)] : null;
                              
                              // Array.prototype.slice.call(element.parentElement.children)
                              if (element) {
                                   (element.parentElement).parentElement.querySelectorAll(`li`).forEach((element_others) => {
                                        element_others.classList.remove(`active`);
                                   });
                                   element.parentElement.classList.add(`active`)
                              };							
                         }

                         // Display the results.
                         if ((RESULTS != null && (typeof RESULTS).includes(`obj`) && !Array.isArray(RESULTS)) ? Object.keys(RESULTS).length > 0 : false) {
                              let ACCESS_KEYS = {"top": ["1", "2", "3", "4", "5", "6", "7", "8", "9"], "nav": ["<", ">"]};
                              (Object.keys(RESULTS)).forEach((result) => {
                                   let result_element = document.createElement(`li`);
                                   let result_title = document.createElement(`a`);
                                   result_title.classList.add(`waves-effect`);
                                   result_title.innerText = (RESULTS[result][TITLE_FIELD]) ? RESULTS[result][TITLE_FIELD] : result;
                                   
                                   function accessKey(ELEMENT) {
                                        if (!ELEMENT) {
                                             let RESULT_INDEX = (Object.keys(RESULTS)).indexOf(result);
                                             if (RESULT_INDEX < ACCESS_KEYS[`top`].length) {
                                                  result_title.setAttribute(`accesskey`, ACCESS_KEYS[`top`][RESULT_INDEX]);
                                             }
                                        } else {
                                             let ELEMENT_INDEX = (new Array((ELEMENT.parentElement).querySelectorAll(`*`))).indexOf(ELEMENT);
                                             if (ELEMENT_INDEX >= ACCESS_KEYS[`top`].length) {
                                                  if (((ELEMENT.parentElement).querySelectorAll(`*`)).length > ELEMENT_INDEX + 1) {
                                                       ((ELEMENT.parentElement).querySelectorAll(`*`))[ELEMENT_INDEX + 1].setAttribute(`accesskey`, ACCESS_KEYS[`nav`][1])
                                                  };
                                                  if ((((ELEMENT.parentElement).querySelectorAll(`*`))[ELEMENT_INDEX - 1].getAttribute(`accesskey`)) ? !(ACCESS_KEYS[`top`].includes(((ELEMENT.parentElement).querySelectorAll(`*`))[ELEMENT_INDEX - 1].getAttribute(`accesskey`))) : true) {
                                                       ((ELEMENT.parentElement).querySelectorAll(`*`))[ELEMENT_INDEX - 1].setAttribute(`accesskey`, ACCESS_KEYS[`nav`][1])
                                                  };
                                                  // Set the quick return access key. 
                                                  ELEMENT.setAttribute(`accesskey`, `0`);
                                             } 
                                        }
                                   }

                                   result_title.addEventListener(`click`, function () {
                                        setSelected(this);
                                        pick(result, RESULTS[result], TARGET_NAME);

                                        // Set the access key.
                                        accessKey(this);
                                   });
                                   
                                   accessKey();
                                   result_element.appendChild(result_title);
                                   ELEMENT_TARGET.appendChild(result_element);

                                   if ((SEARCH[TARGET_NAME]) ? SEARCH[TARGET_NAME][`selected`] == result : false) {
                                        setSelected(result_title);
                                        pick(result, RESULTS[result], TARGET_NAME);
                                   }
                              });
                         }
                    });
               }
          }

          /* Function to execute when a search result item has been picked. 

          @param {string} NAME the name of the currently selected data
          @param {object} ITEM the item picked
          @param {string} AREA the ID of the search
          */
          async function pick(NAME, ITEM, AREA) {
               if (AREA) {
                    let CONTAINERS = (document.querySelectorAll(`[data-result-linked="${AREA}"]`));
               
                    if (CONTAINERS) {
                         (CONTAINERS).forEach((CONTAINER) => {
                              CONTAINER.disabled = (ITEM != null) ? !((typeof ITEM).includes(`obj`) && !Array.isArray(ITEM)) : true;
                              ([].concat(CONTAINER.querySelectorAll(`[data-result-content]`), CONTAINER.querySelectorAll(`[data-result-store]`), document.querySelectorAll(`[data-result-enable]`))).forEach(async function (ELEMENTS) {
                                   if (ELEMENTS) {
                                        (ELEMENTS).forEach(async function(ELEMENT) {
                                             ELEMENT.disabled = CONTAINER.disabled;
                                             if (!ELEMENT.disabled) {
                                                  if (ELEMENT.getAttribute(`data-result-store`) && ELEMENT.type) {
                                                       // Init updater function.
                                                       ELEMENT[`function`] = function() {};
                                          
                                                       var DATA = {};

                                                       DATA[`target`] = ((ELEMENT.getAttribute(`data-result-store`).split(`,`))[0] == ``) ? [...(ELEMENT.getAttribute(`data-result-store`).split(`,`).slice(1)), ...[NAME]] : [...AREA, ...[NAME], ...(ELEMENT.getAttribute(`data-result-store`).split(`,`))];
                                                       DATA[`value`] = ((Object.keys(ITEM).includes(ELEMENT.getAttribute(`data-result-store`))) ? ITEM[ELEMENT.getAttribute(`data-result-store`)] : await read(DATA[`target`], (ELEMENT.hasAttribute(`data-store-location`)) ? parseInt(ELEMENT.getAttribute(`data-store-location`)) : -1));

                                                       switch (ELEMENT[`type`]) {
                                                            case `checkbox`:
                                                                 ELEMENT.checked = (DATA[`value`]);
                                                                 
                                                                 ELEMENT[`function`] = function() {
                                                                      DATA[`target`] = ((ELEMENT.getAttribute(`data-result-store`).split(`,`))[0] == ``) ? [...(ELEMENT.getAttribute(`data-result-store`).split(`,`).slice(1)), ...[NAME]] : [...AREA, ...[NAME], ...(ELEMENT.getAttribute(`data-result-store`).split(`,`))];
                                                                      write(DATA[`target`], ELEMENT.checked, (ELEMENT.hasAttribute(`data-store-location`)) ? parseInt(ELEMENT.getAttribute(`data-store-location`)) : -1);
                                                                 };
                                                                 break;
                                                            default:
                                                                 if ((typeof (ITEM[ELEMENT.getAttribute(`data-result-store`)])).includes(`obj`)) {
                                                                      ELEMENT.value = JSON.stringify(DATA[`value`]);

                                                                      ELEMENT[`function`] = function() {
                                                                           try {
                                                                                DATA[`target`] = ((ELEMENT.getAttribute(`data-result-store`).split(`,`))[0] == ``) ? [...(ELEMENT.getAttribute(`data-result-store`).split(`,`).slice(1)), ...[NAME]] : [...AREA, ...[NAME], ...(ELEMENT.getAttribute(`data-result-store`).split(`,`))];
                                                                                DATA[`value`] = JSON.parse(ELEMENT.value.trim());
                                                                                write(DATA[`target`], DATA[`value`], (ELEMENT.hasAttribute(`data-store-location`)) ? parseInt(ELEMENT.getAttribute(`data-store-location`)) : -1);
                                                                           } catch(err) {
                                                                                // The JSON isn't valid.
                                                                                logging.error(err.name, texts.localized(`JSON_parse_error`), err.stack, false);
                                                                           };
                                                                      }
                                                                 } else {
                                                                      ELEMENT.value = DATA[`value`];

                                                                      ELEMENT[`function`] = function() {
                                                                           DATA[`target`] = ((ELEMENT.getAttribute(`data-result-store`).split(`,`))[0] == ``) ? [...(ELEMENT.getAttribute(`data-result-store`).split(`,`).slice(1)), ...[NAME]] : [...AREA, ...[NAME], ...(ELEMENT.getAttribute(`data-result-store`).split(`,`))];
                                                                           write(DATA[`target`], ELEMENT.value.trim(), (ELEMENT.hasAttribute(`data-store-location`)) ? parseInt(ELEMENT.getAttribute(`data-store-location`)) : -1);
                                                                      }
                                                                 }
                                                                 break;
                                                       }

                                                       if (ELEMENT.nodeName.toLowerCase().includes(`textarea`)) {
                                                            ELEMENT.addEventListener(`blur`, ELEMENT[`function`]);
                                                       } else {
                                                            ELEMENT.addEventListener(`change`, ELEMENT[`function`]);
                                                       }
                                                  } else if (ELEMENT.getAttribute(`data-result-content`) || ELEMENT.getAttribute(`data-result-store`)) {
                                                       ELEMENT.innerText = (ITEM[ELEMENT.getAttribute(`data-result-content`)] || ELEMENT.getAttribute(`data-result-content`).includes(`*`))
                                                       ? ((ELEMENT.getAttribute(`data-result-content`).includes(`*`))
                                                            ? NAME
                                                            : ITEM[ELEMENT.getAttribute(`data-result-content`)])
                                                       : ((ITEM[ELEMENT.getAttribute(`data-result-store`)])
                                                            ? (ITEM[ELEMENT.getAttribute(`data-result-store`)])
                                                            :  null) /*read(((ITEM[(ELEMENT.getAttribute(`data-result-store`).split(`,`))])[ITEM])));*/
                                                  }
                                             } else {
                                                  if (ELEMENT.getAttribute(`data-result-store`) && ELEMENT.type) {
                                                       switch (ELEMENT[`type`]) {
                                                            case `checkbox`:
                                                                 ELEMENT.checked = false;
                                                                 break;
                                                            case `range`: 
                                                            case `number`: 
                                                                 ELEMENT.value = 0;
                                                                 break;
                                                            default:
                                                                 ELEMENT.value = ``;
                                                                 break;
                                                       }
                                                  } else if (ELEMENT.getAttribute(`data-result-content`) || ELEMENT.getAttribute(`data-result-store`)) {
                                                       ELEMENT.innerText = ``;
                                                  }

                                                  // Disable the list element if in case it is a clickable element. 
                                                  if ((ELEMENT.parentElement.nodeName.toLowerCase()).includes(`li`)) {
                                                       ELEMENT.parentElement.disabled = CONTAINER.disabled;
                                                  }
                                             };
                                        })
                                   }
                              })
                         })
                    }
               }
          }
          
          async function find(element) {
               if (element.getAttribute(`data-result`)) {
                    if (!SEARCH[element.getAttribute(`data-result`)]) {
                         SEARCH[element.getAttribute(`data-result`)] = {};
                    }
                    SEARCH[element.getAttribute(`data-result`)][`criteria`] = element.value.trim();
                    
                    if (SEARCH[element.getAttribute(`data-result`)][`criteria`]) {
                         if (
                              element.getAttribute(`data-results-filters`)
                                   ? element.getAttribute(`data-results-filters`).trim()
                                   : false
                         ) {
                              SEARCH[element.getAttribute(`data-result`)][`additional criteria`] = element
                                   .getAttribute(`data-results-filters`)
                                   .split(`,`);
                         }
                         SEARCH[element.getAttribute(`data-result`)][`results`] = await search(
                                   element.getAttribute(`data-result`),
                                   SEARCH[element.getAttribute(`data-result`)][`criteria`],
                                   SEARCH[element.getAttribute(`data-result`)][`additional criteria`],
                              );
                    } else {
                         SEARCH[element.getAttribute(`data-result`)][`results`] = await read(element.getAttribute(`data-result`));
                    };

                    display(element.getAttribute(`data-result`), SEARCH[element.getAttribute(`data-result`)][`results`], `name`);
                    
                    // Make sure it compensates vanished objects and no results detection. 
                    if (((
                         !(SEARCH[element.getAttribute(`data-result`)][`selected`])
                              || (typeof SEARCH[element.getAttribute(`data-result`)][`results`]).includes(`obj`) && SEARCH[element.getAttribute(`data-result`)][`results`] != null)
                         ? (((SEARCH[element.getAttribute(`data-result`)][`results`] != null) ? (Object.keys(SEARCH[element.getAttribute(`data-result`)][`results`]).length <= 0) : false)
                              || !((SEARCH[element.getAttribute(`data-result`)][`selected`])))
                         : true) || 
                         (SEARCH[element.getAttribute(`data-result`)][`results`] && SEARCH[element.getAttribute(`data-result`)][`selected`])
                              ? !(Object.keys(SEARCH[element.getAttribute(`data-result`)][`results`]).includes(SEARCH[element.getAttribute(`data-result`)][`selected`])) 
                              : false
                    ) {
                         pick(null, null, element.getAttribute(`data-result`));
                    }

                    observe((what) => {
                         find(element);
                    });
               }
          }

          document.querySelectorAll(`[data-result]`).forEach((element) => {
               /* GUI changes to find
               
               @param {object} ELEMENT the element to change
               */
               
               element.addEventListener(`change`, async function () {find(element)});
               find(element);
          });

          return (SEARCH);
     }
}