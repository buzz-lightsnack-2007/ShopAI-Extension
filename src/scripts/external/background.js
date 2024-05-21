/* 
content.js

The content script
*/

// Import the necessary modules.
(async () => {
	// Import the watchman module.
	let watch = (await import(chrome.runtime.getURL("scripts/external/watch.js"))).default;

	// Begin the job.
	watch.main();
})()