'use strict';

module.exports = {
	enter: e => {
		console.log(e.item.path.join(' > '));
	},
	leave: e => {
		if (e.type === 'test' && !e.pass) {
			const {error} = e;

			if (error instanceof Error) {
				console.log(error.stack);
			} else {
				console.log('threw non-Error:', error);
			}
		}
	},
	done: result => {
		const {pass, total} = result;

		console.error('\n%d/%d passed', pass, total);

		if (pass !== total) {
			process.exit(1);
		}
	},
};
