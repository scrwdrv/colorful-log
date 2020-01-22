# colorful-log
 Simple, lightweight and good looking logger.

## Installation
```sh
npm i colorful-log
```

## Usage
All the options are optional, you can even just use `new Logger()` without passing any opts. 
```js
import Logger from 'colorful-log';

const log = new Logger({
    debug: false, // default is set to true
    path: './logs', // which is default
    system: 'test',
    cluster: 0,
    saveInterval: 60000 // 60 secs
})

log.info('info');
log.warn('warn');
log.error('error');
log.debug('debug'); // won't print out since debug is set to false, but still save to log files

throw new Error('fatal'); 
// uncaughtException & unhandledRejection will be catched and logged, then exit (as it should be)
```

### Manual Save
`log.save()` method returns a Promise, it's the same method that was called when saveInterval reached.
```js
(async () => await log.save().catch(log.error))();
```