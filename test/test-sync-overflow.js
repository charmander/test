'use strict';

const assert = require('assert');
const test = require('../')(module);

for (let i = 0; i < 20000; i++) {
	test(String(i), () => {
		assert.strictEqual(1, 1);
	});
}
