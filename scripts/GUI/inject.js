export default class injection {
	constructor (parent, element, id, classes, options) {
		let ELEMENTS = {};
		
		ELEMENTS[`parents`] = ((typeof parent) != `object`) ? docuent.querySelectorAll(parent) : [...parent];
		
		// must only run if there are elements to inject
		if ((ELEMENTS[`parents`]).length > 0) {

		}
	};

	
}