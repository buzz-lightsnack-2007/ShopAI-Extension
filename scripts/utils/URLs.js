/*
URL tools
*/

class URLs {
     /*
     Remove the protocol from the URL.

     @param {string} URL the URL to clean
     */
     static clean(URL) {
          return((URL.trim().replace(/(^\w+:|^)\/\//, ``).split(`?`))[0]);
     }
}

export {URLs};