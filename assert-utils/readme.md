# assert-utils
Assertion tool that deeply compares value to its definition.

## Install
```javascript
npm install assert-utils
```

## Usage
```javascript
import assertUtils from 'assert-utils';

const {assert} = assertUtils;

function checkIsString(myText) {
	assert.type(myText, 'string');
}

checkIsString('this is string'); // valid, outputs nothing
checkIsString(2); // invalid, throws an error with message 'Assertion error: expected "string" but got "number"'
```

### assert.value(value, expectation)
#### value |`any`
#### expectation |`any`

Checks whether the `value` equals to the `expectation`. Throws error if not.

```javascript
assert.value('1' + 0, '10'); // valid
assert.value('1' + 0, 1); // invalid
```

### assert.type(value, definition)
#### value |`any`
#### definition |`any`

Deeply checks whether the whole `value` equals to its `definition`. If the `definition` is an object, it recursively checks all its properties.

```javascript
let
	value = {
		number: 200,
		string: 'this is string',
		function: function() {},
		object: {
			stringProperty: 'also string'
		}
	};

assert.type(value, {
	number: 'number',
	string: 'string',
	function: 'function',
	object: {
		stringProperty: 'string'
	}
});
```

`definition` basically accepts the same value as returned by `typeof` operator. In addition, there are some extra definition values:

- `'[]'` for `array`
- `'{}'` or `{}` for `object`

#### Optional properties

If you want to mark any definition _optional_, just add a `?` before the first letter.

```javascript
assert.type('this is string', '?string'); // valid
assert.type(undefined, '?string'); // also valid
assert.type(undefined, 'string'); // invalid
```

In case of optional object definition you can use special property `_required` (default is `true`):

```javascript
// valid
assert.type({
	string: 'this is string'
}, {
	string: 'string'
})

// also valid
assert.type(undefined, {
	_required: false,
	string: 'string'
})

// invalid
assert.type(undefined, {
	string: 'string'
})
```

#### Multiple possible types
In case you expect multiple type, just divide them by `|`.
```javascript
// valid
assert.type({
	stringOrNumber: 2
}, {
	stringOrNumber: 'string|number'
})

// also valid
assert.type({
	stringOrNumber: 'this is string'
}, {
	stringOrNumber: '?string|number'
})

// invalid - "?" has to be first
assert.type({
	stringOrNumber: 'this is string'
}, {
	stringOrNumber: 'string|?number'
})
```

#### Equal properties
Only the properties included in definition object are checked by default. If the tested object has some additional properties, it just passes as true. If you want to check there are no additional properties beside those in the definition, use a special property `_strict` (default is `false`):

```javascript
// valid
assert.type({
	string: 'this is string'
}, {
	string: 'string'
})

// also valid
assert.type({
	string: 'this is string',
	number: 2
}, {
	string: 'string'
})

// invalid
assert.type({
	string: 'this is string',
	number: 2
}, {
	_strict: true,
	string: 'string'
})
```
