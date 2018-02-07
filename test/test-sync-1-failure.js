'use strict';

const assert = require('assert');
const test = require('../')(module);

test('1', () => {
	assert.strictEqual(1, 1);
});

test('2', () => {
	assert.strictEqual(2, 3);
});

test('3', () => {
	assert.strictEqual(3, 3);
});
