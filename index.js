'use strict';

const Test = require('./internal/test');
const run = require('./internal/run');
const defaultOutput = require('./internal/output');

let runScheduled = false;

module.exports = testModule => {
	if (!Array.isArray(testModule.exports)) {
		testModule.exports = [];
	}

	if (testModule === require.main && !runScheduled) {
		runScheduled = true;

		process.nextTick(() => {
			const tests = Object.freeze(testModule.exports);
			run(defaultOutput, tests);
		});
	}

	return (name, run) => {
		if (!Object.isExtensible(testModule.exports)) {
			throw new Error('Can’t add tests during test run');
		}

		testModule.exports.push(new Test(name, run));
	};
};
