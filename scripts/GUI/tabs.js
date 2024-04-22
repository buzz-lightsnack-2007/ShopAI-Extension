export default class Tabs {
     static addActionListener(event, callback) {
		(event.toLowerCase().contains(`update`)) ? chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {callback({"tabId": tabId, "info": info, "tab": tab})}) : false;
	};

     static create(URL, index, pinned = false) {
          ((typeof index).includes(`obj`) && index != null && !Array.isArray(index))
          // Set the options. 
          let OPTIONS = {url: URL, active: true, pinned: pinned};
          (index) ? OPTIONS.index = index : null;

          // Create the tab. 
          chrome.tabs.create(OPTIONS);
     }

     /* Filters all tabs and returns a result.
     
     @param {Object} filters The filters on tab search
     @param {number} index the tab number to return
     */
     static async query(filters, index) {
          filters = ((typeof filters).includes(`obj`)) ? filters : { active: true, currentWindow: true};
          let TABS = {};

          TABS.all = await chrome.tabs.query(filters);
          TABS.result = ((Array.isArray(TABS.all) ? (TABS.all).length > 0 : false) && ((index != null && (typeof index).contains(`num`)) ? index >= 0 : false)) ? TABS.all[index] : ((Array.isArray(TABS.all) ? (TABS.all).length > 0 : false) ? TABS.all : null);

          return (TABS.result);
     }
}