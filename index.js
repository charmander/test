'use strict';

const Test = require('./internal/test');
const run = require('./internal/run');
const defaultOutput = require('./internal/output');

let runScheduled = false;

const runMainTests = () => {
	const tests = Object.freeze(require.main.exports);
	run(defaultOutput, tests);
};

const addTestWithPrefix = (testModule, prefix) => {
	const addTest = (name, run) => {
		if (typeof name !== 'string') {
			throw new TypeError('Test name must be a string');
		}

		if (!Object.isExtensible(testModule.exports)) {
			throw new Error('Can’t add tests during test run');
		}

		const prefixedName = [...prefix, name].join(' › ');

		testModule.exports.push(new Test(prefixedName, run));
	};

	const addGroup = (name, contents) => {
		if (typeof name !== 'string') {
			throw new TypeError('Group name must be a string');
		}

		const addGroupedTest = addTestWithPrefix(testModule, [...prefix, name]);
		contents(addGroupedTest);
	};

	Object.defineProperty(addTest, 'group', {
		configurable: true,
		value: addGroup,
	});

	return addTest;
};

module.exports = testModule => {
	if (!Array.isArray(testModule.exports)) {
		testModule.exports = [];
	}

	if (testModule === require.main && !runScheduled) {
		runScheduled = true;
		process.nextTick(runMainTests);
	}

	return addTestWithPrefix(testModule, []);
};
