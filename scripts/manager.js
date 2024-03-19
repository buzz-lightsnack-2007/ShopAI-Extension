/* manager.js 
Manage the running of the scripts. 
*/

/* ```js
chrome.runtime.onInstalled.addListener(function() {
  // Request permission for the website.
  chrome.permissions.request({
    origins: ["https://example.com"]
  }, function(granted) {
    // If permission was granted, attach the content script to the website.
    if (granted) {
      chrome.tabs.executeScript({
        code: 'console.log("Hello from the content script!");'
      });
    } else {
      // Permission was not granted. Display an error message.
      console.error("Error: Permission not granted.");
    }
  });
});
```*/

