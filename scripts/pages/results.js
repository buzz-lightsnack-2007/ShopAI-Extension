/*
Results.js

Fills the page with the results of the analysis.
*/

import {global, observe} from "/scripts/secretariat.js";
import Page from "/scripts/pages/page.js";
import nested from "../utils/nested.js";

class Page_Results extends Page {
     constructor() {
		super();
		(this.events) ? this.events() : false;
		this.content();
		this.background();
	};


     async background() {
		// Wait until a change in the session storage.
		observe((changes) => {
               this.update();
			this.content();
			// First, update site data but retain the URL. 
		});
	}

     /* 
     Update the data used by the page. 

     @param {boolean} override override the current data.
     */
     async update(override = false) {
          // Set the reference website when overriding or unset. 
		if (override || !this[`ref`]) {this[`ref`] = await global.read([`last`])};
          
          // Get all the data. 
          let DATA = {
               "data": await global.read([`sites`, this[`ref`]])
		}

          // Set the data. 
          this[`data`] = (DATA[`data`]) ? DATA[`data`] : (this[`data`] ? this[`data`] : {});
     }

     async content() {
          // Select all the elements and add it to the object. 
          if (document.querySelectorAll(`[data-active-result]`)) {
               this.elements = {}
               document.querySelectorAll(`[data-active-result]`).forEach((ELEMENT) => {
                    let PROPERTY = ELEMENT.getAttribute(`data-active-result`).trim();
                    this.elements[PROPERTY] = ELEMENT;

                    // Copy the expected type of sub-elements, if any. 
                    if (ELEMENT.getAttribute(`data-active-result-type`)) {
                         this.elements[PROPERTY][`target element type`] = ELEMENT.getAttribute(`data-active-result-type`).trim();
                         ELEMENT.removeAttribute(`data-active-result-type`);     
                    };

                    // Remove the construction data active result. 
                    ELEMENT.removeAttribute(`data-active-result`);
               });
          }
          
          await this.update();
          this.fill();
     }

     /*
     Resize the window to fit the content. 
     */
     async resize() {

     }

     /* 
     Populate the contents.
     */
     async fill() {
          (this.elements)
               ?  (Object.keys(this.elements)).forEach(async (SOURCE) => {
                    if (SOURCE.indexOf(`*`) < SOURCE.length - 1) {
                         let DATA = (nested.dictionary.get(this[`data`][`analysis`], SOURCE));

                         this.elements[SOURCE][(this.elements[SOURCE].nodeName.toLowerCase().includes(`input`) || this.elements[SOURCE].nodeName.toLowerCase().includes(`progress`)) ? `value` : `innerHTML`] = (DATA)
                              ? (((typeof DATA).includes(`obj`) && !Array.isArray(DATA))
                                   ? JSON.stringify(DATA)
                                   : String(DATA))
                              : null;
                    } else if (SOURCE.indexOf(`*`) >= SOURCE.length - 1) {
                         let DATA = (nested.dictionary.get(this[`data`][`analysis`], SOURCE.split(`,`).slice(0, -1)));

                         (!Array.isArray(DATA) && (typeof DATA).includes(`obj`) && DATA != null)

                         let ELEMENT_TYPES = {
                              "container": "section",
                              "content": "article",
                              "title": "p",
                              "body": "p"
                         };

                         (Object.keys(DATA)).forEach((ITEM) => {
                              let ELEMENTS = {};

                              // Create the elements. 
                              (Object.keys(ELEMENT_TYPES)).forEach((TYPE) => {
                                   ELEMENTS[TYPE] = document.createElement(ELEMENT_TYPES[TYPE]);

                                   (([`content`, `action`, `title`].includes(TYPE) || TYPE.includes(`container`)) && this.elements[SOURCE][`target element type`])
                                        ? ELEMENTS[TYPE].classList.add(this.elements[SOURCE][`target element type`].concat((!TYPE.includes(`container`))
                                             ? `-${TYPE}`
                                             : ``))
                                        : false;
                              });
                              
                              ELEMENTS[`title`].innerText = String(ITEM).trim();
                              ELEMENTS[`title`].classList.add(`flow-text`);
                              ELEMENTS[`body`].innerText = String(DATA[ITEM]).trim();

                              // Inject the elements. 
                              [`title`, `body`].forEach((CONTENT) => {
                                   ELEMENTS[`content`].appendChild(ELEMENTS[CONTENT]);
                              });
                              ELEMENTS[`container`].appendChild(ELEMENTS[`content`]);
                              this.elements[SOURCE].appendChild(ELEMENTS[`container`]);
                         })
                    }
               })
               : false;
          
          // Set the color. 
          (nested.dictionary.get(this[`data`][`analysis`], [`Rating`, `Trust`]) && document.querySelector(`summary`)) ? document.querySelector(`summary`).setAttribute(`result`, (nested.dictionary.get(this[`data`][`analysis`], [`Rating`, `Trust`]))) : false;
     };
}

new Page_Results();