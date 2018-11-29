'use strict';

const createBeforeExitListener = () => {
	let reject;

	const promise = new Promise((resolve_, reject_) => {
		reject = reject_;
	});

	const beforeExit = () => {
		remove();
		reject(new Error('Test promise will never resolve'));
	};

	const remove = () => {
		process.removeListener('beforeExit', beforeExit);
	};

	process.on('beforeExit', beforeExit);

	return {
		remove,
		promise,
	};
};

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

		const beforeExitListener = createBeforeExitListener();

		return Promise.race([
			Promise.resolve(result).then(
				() => {
					beforeExitListener.remove();
				},
				error => {
					beforeExitListener.remove();
					return Promise.reject(error);
				}
			),
			beforeExitListener.promise,
		]);
	}
}

module.exports = TestItem;
