'use strict';

const discard = () => undefined;

class Test {
	constructor(name, run) {
		if (typeof name !== 'string') {
			throw new TypeError('Test name must be a string');
		}

		if (typeof run !== 'function') {
			throw new TypeError('Test function must be a function');
		}

		this.name = name;
		this.run = () => {
			let result;

			try {
				result = run();
			} catch (error) {
				return Promise.reject(error);
			}

			if (result !== undefined && typeof result.then !== 'function') {
				throw new TypeError('Test should return promise or undefined');
			}

			return Promise.resolve(result)
				.then(discard);
		};
	}
}

module.exports = Test;
