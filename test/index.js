'use strict';

const assert = require('assert');
const child_process = require('child_process');
const path = require('path');

const test = require('../')(module);

const testResolvedValue = require('./test-resolved-value');

const execFile = (file, args, options) =>
	new Promise((resolve, reject) => {
		child_process.execFile(file, args, options, (error, stdout, stderr) => {
			if (error) {
				error.stdout = stdout;
				error.stderr = stderr;
				reject(error);
				return;
			}

			resolve({stdout, stderr});
		});
	});

const rejection = promise =>
	promise.then(
		() => Promise.reject(new Error('Promise did not reject')),
		error => error
	);

const run = testPath =>
	execFile('node', [path.join(__dirname, testPath)]);

test('empty test list', () =>
	run('test-empty.js').then(result => {
		assert.deepStrictEqual(result, {
			stdout: '',
			stderr: '\n0/0 passed\n',
		});
	})
);

test('sync success', () =>
	run('test-sync-success.js').then(result => {
		assert.deepStrictEqual(result, {
			stdout: '1\n2\n3\n',
			stderr: '\n3/3 passed\n',
		});
	})
);

test('sync single failure', () =>
	rejection(run('test-sync-1-failure.js')).then(error => {
		assert.strictEqual(error.code, 1);
		assert.strictEqual(error.stderr, '\n2/3 passed\n');
		assert.ok(/^1\n2\nAssertionError.*(\n([ +-].*)?)*\n3\n$/.test(error.stdout));
	})
);

test('sync entire failure', () =>
	rejection(run('test-sync-3-failure.js')).then(error => {
		assert.strictEqual(error.code, 1);
		assert.strictEqual(error.stderr, '\n0/3 passed\n');
		assert.deepStrictEqual(
			error.stdout.match(/\d\nAssertionError.*(\n([ +-].*)?)*\n|$/yg)
				.map(m => m.charAt(0)),
			['1', '2', '3', '']
		);
	})
);

test('async success', () =>
	run('test-async-success.js').then(result => {
		assert.deepStrictEqual(result, {
			stdout: '1\n2\n3\n',
			stderr: '\n3/3 passed\n',
		});
	})
);

test('async failure', () =>
	rejection(run('test-async-2-failure.js')).then(error => {
		assert.strictEqual(error.code, 1);
		assert.strictEqual(error.stderr, '\n2/4 passed\n');
		assert.ok(/^1\nAssertionError.*(\n([ +-].*)?)*\n2\n3\nAssertionError.*(\n([ +-].*)?)*\norder\n$/.test(error.stdout));
	})
);

test('non-Error failure', () =>
	rejection(run('test-non-error-failure.js')).then(error => {
		assert.strictEqual(error.code, 1);
		assert.strictEqual(error.stderr, '\n0/1 passed\n');
		assert.strictEqual(error.stdout, 'throws null\nthrew non-Error: null\n');
	})
);

test('long sync test list', () =>
	run('test-sync-overflow.js').then(result => {
		assert.strictEqual(result.stderr, '\n20000/20000 passed\n');
	})
);

test('resolved value', () =>
	testResolvedValue.tests[0].run().then(result => {
		assert.strictEqual(result, undefined);
	})
);
