/*
BackgroundCheck
Check the tabs in the background, and check the filters.
*/

// Filter importation
import EntryManager from "/scripts/GUI/entrypoints/manager.js"
import FilterManager from "../filters.js";
import {background, global} from "/scripts/secretariat.js";

export default class BackgroundCheck {
	update = {};
	status = {};

	constructor () {
		const main = () => {
			global.read([`ready`]).then((STATE) => {
				if (STATE && !this.status[`ready`]) {
					this.manager = new EntryManager();
					this.updater();
					
					this.status[`ready`] = true;
				};
				
				if (this.status[`ready`]) {
					(this.status.wait) ? this.status.wait.cancel() : false;
				};
			});
		};
		
		this.status.wait = new background(() => {main();})	
	};

	updater() {
		global.read([`settings`,`sync`]).then(async (DURATION_PREFERENCES) => {
			/*
			Set the default options if they don't exist yet.
			*/
			const setDefaults = async () => {
				// Forcibly create the preference if it doesn't exist. It's required!
				if (!(typeof DURATION_PREFERENCES).includes(`obj`) || !DURATION_PREFERENCES || Array.isArray(DURATION_PREFERENCES)) {
					DURATION_PREFERENCES = {};
					DURATION_PREFERENCES[`duration`] = 24;
					
					// Write it.
					return(global.write([`settings`, `sync`, `duration`], DURATION_PREFERENCES[`duration`], -1, {"silent": true}));
				} else {return(true)};
			};
			
			// Set the filter management.
			let filter = new FilterManager();

			/*
			Run the update.

			@return {Promise} the last update status.
			*/
			const updater_run = async () => {
				filter.update();

				// Update the last update time.
				return(await global.write([`settings`,`sync`,`last`], Date.now(), -1, {"silent": true}));
			};
			
			/*
			Check if it's time to update the filters through comparing the difference of the current time and the last updated time to the expected duration.
			*/
			async function updater_check() {
				let TIME = {};
				TIME[`now`] = Date.now();
				TIME[`last`] = await global.read([`settings`,`sync`,`last`], -1);

				// Run if the last time is not set or if the difference is greater than the expected duration.
				return (TIME[`last`] ? ((TIME[`now`] - TIME[`last`]) > DURATION_PREFERENCES[`duration`]) : true);
			};
			
			// Set the interval.
			let updater_set = () => {
				this.update[`checker`] = setInterval(async () => {
					// Update the filters.
					updater_run();
				}, DURATION_PREFERENCES[`duration`]);
			};

			/*
			Reset the interval.
			*/
			const updater_reset = () => {
				// Cancel the interval.
				(this.update[`checker`]) ? clearInterval(this.update[`checker`]) : false;

				// Run the updater, if necessary.
				(updater_check())
					? updater_run()
					: false;

				// Start the new interval.
				updater_set();
			}

			const updater_background = () => {
				this.update[`background`] = async () => {
					if ((await global.read([`settings`, `sync`, `duration`])) ? (await global.read([`settings`, `sync`, `duration`] * (60 ** 2) * 1000 != DURATION_PREFERENCES[`duration`])) : false) {
						if (await global.global.read([`settings`, `sync`, `duration`])) {
							// Get the new time.
							DURATION_PREFERENCES[`duration`] = await global.read([`settings`, `sync`, `duration`]) * (60 ** 2) * 1000;

							// Reset the updater.
							updater_reset();
						}
					};
				};

				// Set the background checker.
				new background(() => {return(this.update.background())});
			}
			
			if (!(DURATION_PREFERENCES)) {
				DURATION_PREFERENCES = {};
			};

			// Convert DURATION_PREFERENCES[`duration`]) from hrs to milliseconds.
			if (DURATION_PREFERENCES[`duration`]) {
				DURATION_PREFERENCES[`duration`] = DURATION_PREFERENCES[`duration`] * (60 ** 2) * 1000;
			};

			// When the browser is started, run the updater immediately only when the filters are not updated yet.
			(updater_check() || !DURATION_PREFERENCES)
				? updater_run()
				: false;

			// Run the background.
			updater_background();
		})
	}
};
