'use strict';

const assert = require('assert');
const delay = require('./delay');
const test = require('../')(module);

test('1', () => {
	assert.strictEqual(1, 1);
	return Promise.resolve();
});

test('2', () =>
	delay(100).then(() => {
		assert.strictEqual(2, 2);
	})
);

test('3', () => {
	assert.strictEqual(3, 3);
	return Promise.resolve();
});
