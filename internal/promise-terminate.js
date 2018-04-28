'use strict';

const callNextTick = f => value => {
	process.nextTick(f, value);
};

const throwNextTick = callNextTick(error => {
	throw error;
});

const terminate = (promise, success) => {
	promise.then(
		callNextTick(success),
		throwNextTick
	);
};

module.exports = terminate;
