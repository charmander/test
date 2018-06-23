'use strict';

const TestItem = require('./internal/test-item');
const run = require('./internal/run');
const defaultOutput = require('./internal/output');

const readonly = value => ({
	configurable: true,
	value,
});

const runMainTests = () => {
	const root = require.main.exports;
	root._freeze();

	run(defaultOutput, root, (error, summary) => {
		if (error) {
			throw error;
		}

		defaultOutput.done(summary);
	});
};

const checkPush = (items, item) => {
	if (!Object.isExtensible(items)) {
		throw new Error('Can’t add test items during test run');
	}

	items.push(item);
};

class TestGroup {
	constructor(path) {
		this.path = path;
		this.tests = [];
		this.setup = [];
		this.teardown = [];
		this.groups = [];
	}

	addTest(name, run) {
		checkPush(this.tests, new TestItem([...this.path, name], run));
	}

	addSetup(name, run) {
		if (run === undefined) {
			run = name;
			name = 'setup';
		}

		checkPush(this.setup, new TestItem([...this.path, name], run));
	}

	addTeardown(name, run) {
		if (run === undefined) {
			run = name;
			name = 'teardown';
		}

		checkPush(this.teardown, new TestItem([...this.path, name], run));
	}

	addGroup(name, contents) {
		if (typeof name !== 'string') {
			throw new TypeError('Group name must be a string');
		}

		if (!Object.isExtensible(this.groups)) {
			throw new Error('Can’t add groups during test run');
		}

		const group = new TestGroup([...this.path, name]);
		this.groups.push(group);
		contents(group._boundAddTest());
	}

	_freeze() {
		Object.freeze(this.tests);
		Object.freeze(this.groups);
		Object.freeze(this.setup);
		Object.freeze(this.teardown);

		for (const group of this.groups) {
			group._freeze();
		}
	}

	_boundAddTest() {
		const test = (name, run) => {
			this.addTest(name, run);
		};

		Object.defineProperties(test, {
			group: readonly((name, contents) => {
				this.addGroup(name, contents);
			}),
			setup: readonly((name, action) => {
				this.addSetup(name, action);
			}),
			teardown: readonly((name, action) => {
				this.addTeardown(name, action);
			}),
		});

		return test;
	}
}

let runScheduled = false;

module.exports = testModule => {
	if (!(testModule.exports instanceof TestGroup)) {
		testModule.exports = new TestGroup([]);
	}

	if (testModule === require.main && !runScheduled) {
		runScheduled = true;
		process.nextTick(runMainTests);
	}

	return testModule.exports._boundAddTest();
};
