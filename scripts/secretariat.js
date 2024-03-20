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

	static rules(domain = ``) {
		/* Load all of the rules or a rule from a particular domain. 
		
		Parameters: 
			domain: the RegEx of the domain
		Returns: (dictionary) the rules
		*/
		
		let result;


		
		// Load the data. 
		
		/* 
		if (domain) {
			
		} else {
			
		}*/
		
		
		console.log(`Rules are being loaded...`);
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
		
		Returns: the user's confirmation
		*/
		
		let forget_action = false; 
		
		(async () => {
			// Import alerts module. 
			let alerts = await import(chrome.runtime.getURL("gui/scripts/alerts.js"));
		
			// Confirm the action. 
			let forget_action = alerts.confirm_action();
		
			if (forget_action) {
				// Clear the data storage. 
				chrome.storage.local.clear();
			};
		})();
		
		return (forget_action);
	};
};

export function read(prefname) {
	return(secretariat.read(prefname));
};	

export function rules(domain = ``) {
	return(secretariat.rules(domain));
};	


export function amend(website, rules) {
	return (secretariat.amend(website, rules));
};

export function forget(domain) {
	return (secretariat.forget(domain));
};

