/*
Wait until a condition is met. It isn't recommended since you're better off using the callback on the function itself, but it's still here just in case. 

@param {Function} watch the condition to watch for
@param {Object} options the options
@return {Promise} the callback
*/
const wait = (watch, options) => {
	return new Promise((resolve, reject) => {
		(watch)
			? resolve()
			: setTimeout(() => {
				wait(watch, options).then(resolve).catch(reject);
			}, (((options && (typeof options).includes(`obj`)) ? options[`time`] : false) ? Math.abs(parseInt(options[`time`])) : 100));
	});
}

export default wait;