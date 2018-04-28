'use strict';

const terminate = require('./promise-terminate');

const run = (output, tests) => {
	let pass = 0;
	let i = 0;

	const next = () => {
		if (i === tests.length) {
			output.done({pass, total: tests.length});
			return;
		}

		const test = tests[i];

		output.enter(test);

		terminate(
			test.run().then(
				() => ({test, pass: true, error: null}),
				error => ({test, pass: false, error})
			),
			result => {
				pass += result.pass;
				output.leave(result);
				i++;
				next();
			}
		);
	};

	next();
};

module.exports = run;
