/* fc.js
This does not stand for "FamiCom" but instead on Finalization and Completion. This script provides installation run scripts.
*/

class fc {

	static hello() {
		chrome.tabs.create({ url: `https://codeberg.org/buzzcode2007/ShopAI/wiki` }, function (tab) {});
	};

	static setup() {
		/* Initialize the set-up.

		Returns: the initialization result
		*/




	}

	static trigger() {
		chrome.runtime.onInstalled.addListener(function (object) {
			if (object.reason == chrome.runtime.OnInstalledReason.INSTALL) {
				fc.hello();
				fc.setup();
			}
		});
	}

	static run() {
		/* main function */

		fc.trigger();
	}
}
