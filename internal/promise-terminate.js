'use strict';

const callNextTick = f => value => {
	process.nextTick(f, value);
};

const throwNextTick = callNextTick(error => {
	throw error;
});

const terminate = (promise, success, failure) => {
	promise.then(
		callNextTick(success),
		failure === undefined ?
			throwNextTick :
			callNextTick(failure)
	);
};

module.exports = terminate;
