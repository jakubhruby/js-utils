# waterfall-exec
Executes array of Promises one after another.
Can also listen to an array for new items.

## Install
```
npm install waterfall-exec
```

### Usage
```javascript
import waterfallExec from 'waterfall-exec';

const {Waterfall} = waterfallExec;

let
    jobs = [
        () => Promise.resolve(),
        () => Promise.resolve(),
        () => Promise.resolve()
    ],
    waterfall = new Waterfall();

waterfall.exec(jobs);
```

`Waterfall` uses standard `Promise` chain to synchronous execution of asynchronous functions. Just pass an array of functions and `Waterfall` starts to execute them one by one.

#### Waterfall.constructor([config])
##### config |`object`_optional_
- `onNewPromise`|`function(promise)`_optional_ - a function to be called when new job starts. Accepts one argument `promise`.

#### Waterfall.exec(jobs [, options])
##### jobs |`Array`
`Array` of `function` items. Each `function` should return either `Promise` or some data to be passed as resolved data.

##### options |`object`_optional_
- `waitForItems`|`boolean`_optional_ - causes main Promise is never resolved and Waterfall executes every new job added to the `jobs` array. Default is `false`.
- `waitTimeout`|`number`_optional_ - timeout for `waitForItems`. If `undefined`, there is no timeout and `waterfall` will tick forever. Default is `undefined`.
- `checkInterval`|`number`_optional_ - interval in miliseconds for `waitForItems`. Default is `1000`.

#### Waterfall.stop()
Stops the execution and clears the `jobs` array. Also sets `waitForItems` to `false`, so if you want to resume execution, you need to call `exec()` again.
