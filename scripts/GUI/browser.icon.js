class BrowserIcon {
     /* Change the extension icon. 
     
     @param {string} path The path to the icon.
     */
     static set(path) {
          chrome.browserAction.setIcon({"path": path});
     };
};

export {BrowserIcon as default};