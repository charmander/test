'use strict';

const assert = require('assert');
const delay = require('./delay');
const test = require('../')(module);

const order = [];

test('1', async () => {
	order.push(1);
	await delay(150);
	assert.strictEqual(1, 2);
});

test('2', async () => {
	order.push(2);
	await delay(100);
	assert.strictEqual(2, 2);
	order.push(2);
});

test('3', async () => {
	order.push(3);
	await delay(50);
	assert.strictEqual(3, 4);
});

test('order', () => {
	assert.deepStrictEqual(
		order,
		[1, 2, 2, 3],
	);
});
