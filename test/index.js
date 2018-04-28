'use strict';

const assert = require('assert');
const child_process = require('child_process');
const path = require('path');
const {promisify} = require('util');

const execFile = promisify(child_process.execFile);

const test = require('../')(module);

const testResolvedValue = require('./test-resolved-value');

const rejection = promise =>
	promise.then(
		() => Promise.reject(new Error('Promise did not reject')),
		error => error,
	);

const run = testPath =>
	execFile('node', [path.join(__dirname, testPath)]);

test('empty test list', async () => {
	assert.deepStrictEqual(await run('test-empty.js'), {
		stdout: '',
		stderr: '\n0/0 passed\n',
	});
});

test('sync success', async () => {
	assert.deepStrictEqual(await run('test-sync-success.js'), {
		stdout: '1\n2\n3\n',
		stderr: '\n3/3 passed\n',
	});
});

test('sync single failure', async () => {
	const error = await rejection(run('test-sync-1-failure.js'));
	assert.strictEqual(error.code, 1);
	assert.strictEqual(error.stderr, '\n2/3 passed\n');
	assert.ok(/^1\n2\nAssertionError.*(\n([ +-].*)?)*\n3\n$/.test(error.stdout));
});

test('sync entire failure', async () => {
	const error = await rejection(run('test-sync-3-failure.js'));
	assert.strictEqual(error.code, 1);
	assert.strictEqual(error.stderr, '\n0/3 passed\n');
	assert.deepStrictEqual(
		error.stdout.match(/\d\nAssertionError.*(\n([ +-].*)?)*\n|$/yg)
			.map(m => m.charAt(0)),
		['1', '2', '3', ''],
	);
});

test('async success', async () => {
	assert.deepStrictEqual(await run('test-async-success.js'), {
		stdout: '1\n2\n3\n',
		stderr: '\n3/3 passed\n',
	});
});

test('async failure', async () => {
	const error = await rejection(run('test-async-2-failure.js'));
	assert.strictEqual(error.code, 1);
	assert.strictEqual(error.stderr, '\n2/4 passed\n');
	assert.ok(/^1\nAssertionError.*(\n([ +-].*)?)*\n2\n3\nAssertionError.*(\n([ +-].*)?)*\norder\n$/.test(error.stdout));
});

test('non-Error failure', async () => {
	const error = await rejection(run('test-non-error-failure.js'));
	assert.strictEqual(error.code, 1);
	assert.strictEqual(error.stderr, '\n0/1 passed\n');
	assert.strictEqual(error.stdout, 'throws null\nthrew non-Error: null\n');
});

test('long sync test list', async () => {
	const result = await run('test-sync-overflow.js');
	assert.strictEqual(result.stderr, '\n20000/20000 passed\n');
});

test('resolved value', async () => {
	const result = await testResolvedValue[0].run();
	assert.strictEqual(result, undefined);
});
