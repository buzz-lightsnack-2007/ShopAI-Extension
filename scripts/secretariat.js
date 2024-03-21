/* secretriat.js
Manage the local cache.
*/

export default class secretariat {
	static read(prefname, cloud = false) {
		/* Read all storeed data in the browser cache.

		Parameters:
			prefname: (string) the preference name
			cloud: (bool) determine cloud reading, which is otherwise disabled
		Returns: (Object) the preferences
		*/

		// Initialize the selected pref data.
		let pref_data;

		function pref_data_set(database) {
			pref_data = database[prefname];
		};

		// Retrieve the data.
		if (cloud) {
			chrome.storage.sync.get(prefname, (items) => {
				pref_data_set(items);
			  });
		} else {
			chrome.storage.local.get(prefname, (items) => {
				pref_data_set(items);
			  });
		}

		return(pref_data);
	};

	static rules(domain = window.location.href) {
		/* List the matching rule for a particular domain.

		Parameters:
			domain: the website to check, which --- by default --- is the current website
		Returns: (dictionary) the rules
		*/

		let result;

		// Read the filters.
		let filters = read(`filters`);
		if (filters) {
				// Must only run when there stored value.
				if (domain.trim()) {
					// Function to loop through each object defined by their URL
					function reference(article) {
						/* Skim through each one and set a matching find.

						Parameters:
							section: the URL to check
						*/

						// Set the section in focus
						let section = filters[article];
						let qualified = false;

						// Determine validity
						if (section) {
								// The filter must have a matching URL
								if (section[`URL`]) {
									// Now it's time to test it.
									qualified = (new RegExp(section[`URL`])).test(domain);
									if (qualified && section[`filters`]) {
										// Read that out.
										result = section;
									};
								};
						};

					};
					// The keys
					(Object.keys(filters)).forEach(reference);

				} else {
					// Get everything as instructed.
					result = filters;
				}
		};

		// Return the result.
		return(result);
	}

	static amend(website, rules) {
		/* Update the rules.

		Parameters:
			website: RegEx pattern of the website or the domain
			rules: the rules in JSON
		Returns: (boolean) the update status
		*/



	};

	static write(prefname, data) {
		/* Write the data on the selected prefname.

		Parameters:
			prefname: the preference name
			data: the new data to be written
		*/


	};

	static forget(domain) {
		/* Dangerous: Resets all data or a domain's data.

		Parameters:
			domain: the external source of the filter
		Returns: the user's confirmation
		*/

		let forget_action = false;

		(async () => {
			// Import alerts module.
			let alerts = await import(chrome.runtime.getURL("gui/scripts/alerts.js"));

			// Confirm the action.
			let forget_action = alerts.confirm_action();

			if (forget_action) {
				if (domain) {

				} else {
						// Clear the data storage.
						chrome.storage.local.clear();
						chrome.storage.sync.clear();
				};
			};
		})();

		return (forget_action);
	};
};

export function read(prefname) {
	return(secretariat.read(prefname));
};

export function rules(domain = window.location.href) {
	return(secretariat.rules(domain));
}

export function amend(website, rules) {
	return (secretariat.amend(website, rules));
};

export function forget(domain) {
	return (secretariat.forget(domain));
};
