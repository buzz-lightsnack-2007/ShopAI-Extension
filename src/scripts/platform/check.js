/*
check.js

Check if a website is supported.
*/

import FilterManager from '/scripts/filters.js';

export default class check {
     /*
     Check if an e-commerce platform is supported.

     @param {string} URL
     @returns {object} the support state
     */
     static async platform (URL = window.location.href) {
          return (await ((new FilterManager).select(URL)));
     }
}
