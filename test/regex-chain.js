'use strict';

const isEscaped = (regex, offset) => {
	let i = offset - 1;

	while (i >= 0 && regex.charAt(i) === '\\') {
		i--;
	}

	return (offset - i) % 2 === 0;
};

const isCapturing = (regex, offset) => {
	if (regex.charAt(offset + 1) !== '?') {
		return true;
	}

	switch (regex.charAt(offset + 2)) {
	case ':':
	case '=':
	case '!':
		return false;

	case '<':
		return !['=', '!'].includes(regex.charAt(offset + 3));

	default:
		throw new Error('Unknown group type');
	}
};

const getGroupCount = regex => {
	let count = 0;

	for (let i = -1; (i = regex.indexOf('(', i + 1)) !== -1;) {
		if (!isEscaped(regex, i) && isCapturing(regex, i)) {
			count++;
		}
	}

	return count;
};

class RegexChain {
	constructor(init, last, groupOffset) {
		this._init = init;
		this._last = last;
		this._groupOffset = groupOffset;
	}

	and(regex) {
		if (regex.flags !== 'm') {
			throw new Error('Regex must have multiline flag only');
		}

		const groupOffset = this._groupOffset;
		const groupCount = getGroupCount(regex.source);

		return new RegexChain(
			this,
			regex.source.replace(/\\([1-9]\d*)/g, (match, groupIndexSource, offset, source) => {
				if (isEscaped(source, offset)) {
					return match;
				}

				const groupIndex = parseInt(groupIndexSource, 10);

				if (groupIndex > groupCount) {
					throw new RangeError(`Backreference ${match} is out of range in ${regex}`);
				}

				return '\\' + (groupOffset + groupIndex);
			}),
			groupOffset + groupCount
		);
	}

	asRegex() {
		const parts = [];
		let node = this;

		while (node !== empty) {
			parts.push(node._last);
			node = node._init;
		}

		parts.reverse();
		return new RegExp(parts.join(''), 'm');
	}

	[Symbol.toPrimitive]() {
		throw new TypeError('Can’t convert RegexChain to primitive');
	}
}

const empty = new RegexChain(null, null, 0);

module.exports = {empty};
