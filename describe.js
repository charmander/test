'use strict';

const getTest = require('./');

module.exports = testModule => {
	const test = getTest(testModule);

	return (what, description) => {
		if (typeof what !== 'string') {
			throw new TypeError('Test name must be a string');
		}

		const it = (behaviour, run) => {
			if (typeof behaviour !== 'string') {
				throw new TypeError('Test name must be a string');
			}

			test(what + ' › ' + behaviour, run);
		};

		description(it);
	};
};
