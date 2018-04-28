'use strict';

const Test = require('./internal/test');
const run = require('./internal/run');
const defaultOutput = require('./internal/output');

module.exports = testModule => {
	const suite = [];

	if (testModule === require.main) {
		process.nextTick(() => {
			Object.freeze(suite);
			run(defaultOutput, suite);
		});
	}

	testModule.exports = suite;

	return (name, run) => {
		if (!Object.isExtensible(suite)) {
			throw new Error('Can’t add tests during test run');
		}

		suite.push(new Test(name, run));
	};
};
