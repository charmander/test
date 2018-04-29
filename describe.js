'use strict';

const getTest = require('./');

module.exports = testModule =>
	getTest(testModule).group;
