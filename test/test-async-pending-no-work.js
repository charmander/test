'use strict';

const test = require('../')(module);

test('x', () =>
	new Promise(() => {}));
