Organizes and runs tests.

> [!WARNING]
> Deprecated in favor of the built-in [node:test][].

[node:test]: https://nodejs.org/docs/latest/api/test.html


## Usage

```javascript
'use strict';

const assert = require('assert');
const test = require('@charmander/test')(module);

test('synchronous test, no return value', () => {
    assert(1 < 2);
});

test('asynchronous test, promise return value', async () => {
    const n = await Promise.resolve(2);
    assert(1 < n);
});
```

or

```javascript
const describe = require('@charmander/test/describe')(module);

describe('thing', it => {
    it('behaves', () => {
        assert(1 < 2);
    });
});
```

Running `node path/to/test-module.js` will run tests in that module. Test modules export an array of test objects, which have a `name` property and a `.run()` method. `.run()` returns a promise that rejects with a test error or resolves with `undefined`.


  [ci]: https://travis-ci.org/charmander/test
  [ci image]: https://api.travis-ci.org/charmander/test.svg
