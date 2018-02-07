'use strict';

const assert = require('assert');
const delay = require('./delay');
const test = require('../')(module);

test('1', async () => {
	assert.strictEqual(1, 1);
});

test('2', async () => {
	await delay(100);
	assert.strictEqual(2, 2);
});

test('3', async () => {
	assert.strictEqual(3, 3);
});
