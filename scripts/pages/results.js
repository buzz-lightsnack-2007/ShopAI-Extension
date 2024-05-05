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

                    // Remove the construction data active result. 
                    ELEMENT.removeAttribute(`data-active-result`);
               }) 
          }
          
          await this.update();
          this.fill();
     }

     /* 
     Populate the contents.
     */
     async fill() {
          (this.elements)
               ?  (Object.keys(this.elements)).forEach(async (SOURCE) => {
                    if (SOURCE.includes(`*`)) {
                         let DATA = (nested.dictionary.get(this[`data`][`analysis`], SOURCE));
     
                         this.elements[SOURCE][(this.elements[SOURCE].nodeName.toLowerCase().includes(`input`) || this.elements[SOURCE].nodeName.toLowerCase().includes(`progress`)) ? `value` : `innerHTML`] = (DATA)
                              ? (((typeof DATA).includes(`obj`) && !Array.isArray(DATA))
                                   ? JSON.stringify(DATA)
                                   : String(DATA))
                              : null;
                    } else {
                         
                    }

                    
               })
               : false;
     };
}

new Page_Results();