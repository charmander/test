'use strict';

const terminate = require('./promise-terminate');

const forEach = (array, action, callback) => {
	let i = 0;
	const length = array.length;

	const next = error => {
		if (error || i === length) {
			callback(error);
			return;
		}

		action(array[i++], next);
	};

	next(null);
};

const runTests = (output, tests, callback) => {
	let pass = 0;

	forEach(
		tests,
		(test, callback) => {
			const e = {item: test, type: 'test'};

			output.enter(e);

			terminate(
				test.run().then(
					() => ({item: test, type: 'test', pass: true, error: null}),
					error => ({item: test, type: 'test', pass: false, error})
				),
				result => {
					pass += result.pass;
					output.leave(result);
					callback(null);
				}
			);
		},
		error => {
			callback(error, {pass, total: tests.length});
		}
	);
};

const runEssential = (type, output, items, callback) => {
	forEach(items, (item, callback) => {
		const e = {item, type};

		output.enter(e);

		terminate(
			item.run(),
			() => {
				output.leave(e);
				callback(null);
			},
			callback
		);
	}, callback);
};

const run = (output, group, callback) => {
	runEssential('setup', output, group.setup, error => {
		if (error) {
			callback(error, undefined);
			return;
		}

		runTests(output, group.tests, (error, summary) => {
			if (error) {
				callback(error, undefined);
				return;
			}

			let {pass, total} = summary;

			forEach(
				group.groups,
				(group, callback) => {
					run(output, group, (error, groupSummary) => {
						if (error) {
							callback(error);
							return;
						}

						pass += groupSummary.pass;
						total += groupSummary.total;
						callback(null);
					});
				},
				error => {
					if (error) {
						callback(error, undefined);
						return;
					}

					runEssential('teardown', output, group.teardown, error => {
						if (error) {
							callback(error, undefined);
							return;
						}

						callback(null, {pass, total});
					});
				}
			);
		});
	});
};

module.exports = run;
