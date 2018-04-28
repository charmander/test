'use strict';

const assert = require('assert');
const delay = require('./delay');
const test = require('../')(module);

const order = [];

test('1', () => {
	order.push(1);

	return delay(150).then(() => {
		assert.strictEqual(1, 2);
	});
});

test('2', () => {
	order.push(2);

	return delay(100).then(() => {
		assert.strictEqual(2, 2);
		order.push(2);
	});
});

test('3', () => {
	order.push(3);

	return delay(50).then(() => {
		assert.strictEqual(3, 4);
	});
});

test('order', () => {
	assert.deepStrictEqual(
		order,
		[1, 2, 2, 3]
	);
});
