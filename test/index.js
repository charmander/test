'use strict';

const assert = require('assert');
const child_process = require('child_process');
const path = require('path');
const regexChain = require('./regex-chain');

const test = require('../')(module);

const testResolvedValue = require('./test-resolved-value');

const ASSERTION_ERROR = /^(?=(AssertionError[^]*?^ {4}at ))\1.*\n(?: {4}at .*\n)*/m;

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
		assert.strictEqual(
			error.stdout.search(
				regexChain.empty
					.and(/^1\n/m)
					.and(/^2\n/m).and(ASSERTION_ERROR)
					.and(/^3\n(?![^])/m)
					.asRegex()
			),
			0
		);
	})
);

test('sync entire failure', () =>
	rejection(run('test-sync-3-failure.js')).then(error => {
		assert.strictEqual(error.code, 1);
		assert.strictEqual(error.stderr, '\n0/3 passed\n');
		assert.strictEqual(
			error.stdout.search(
				regexChain.empty
					.and(/^1\n/m).and(ASSERTION_ERROR)
					.and(/^2\n/m).and(ASSERTION_ERROR)
					.and(/^3\n/m).and(ASSERTION_ERROR)
					.and(/^(?![^])/m)
					.asRegex()
			),
			0
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
		assert.strictEqual(
			error.stdout.search(
				regexChain.empty
					.and(/^1\n/m).and(ASSERTION_ERROR)
					.and(/^2\n/m)
					.and(/^3\n/m).and(ASSERTION_ERROR)
					.and(/^order\n(?![^])/m)
					.asRegex()
			),
			0
		);
	})
);

test('non-Error failure', () =>
	rejection(run('test-non-error-failure.js')).then(error => {
		assert.strictEqual(error.code, 1);
		assert.strictEqual(error.stderr, '\n0/1 passed\n');
		assert.strictEqual(error.stdout, 'throws null\nthrew non-Error: null\n');
	})
);

test('pending promise with no work left', () =>
	rejection(run('test-async-pending-no-work.js')).then(error => {
		assert.strictEqual(error.code, 1);
		assert.strictEqual(error.stderr, '\n0/1 passed\n');
		assert.ok(/^x\nError: Test promise will never resolve\n( {4}at .*\n)+$/.test(error.stdout));
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
