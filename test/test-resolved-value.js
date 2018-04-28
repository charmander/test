'use strict';

const test = require('../')(module);

test('value', () => Promise.resolve(1));
