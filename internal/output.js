'use strict';

module.exports = {
	enter(test) {
		console.log(test.name);
	},
	leave(e) {
		if (!e.pass) {
			const {error} = e;

			if (error instanceof Error) {
				console.log(error.stack);
			} else {
				console.log('threw non-Error: %o', error);
			}
		}
	},
	done(result) {
		const {pass, total} = result;

		console.error('\n%d/%d passed', pass, total);

		if (pass !== total) {
			process.exit(1);
		}
	},
};
