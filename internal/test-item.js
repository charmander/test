'use strict';

const discard = () => undefined;

class TestItem {
	constructor(path, run) {
		if (typeof run !== 'function') {
			throw new TypeError('Test item function must be a function');
		}

		this.path = path;
		this._run = run;
	}

	run() {
		const run = this._run;
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
	}
}

module.exports = TestItem;
