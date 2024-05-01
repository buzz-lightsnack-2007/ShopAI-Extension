/* ShopAI
Shop wisely with AI!
*/

(async () => {
	const fc = (await import(browser.runtime.getURL("scripts/external/watch.js"))).default;
	const BackgroundCheck = (await import(browser.runtime.getURL("/scripts/background/background.check.js"))).default;
	const BackgroundMessaging = (await import(browser.runtime.getURL("/scripts/background/background.messaging.js"))).default;
	
	fc.run();
	BackgroundCheck.init();
	new BackgroundMessaging();
})