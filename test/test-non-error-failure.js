'use strict';

const test = require('../')(module);

test('throws null', () => {
	throw null;  // eslint-disable-line no-throw-literal
});
