# [CPU](#)

This shows a webpage that can generate max CPU usage using intensive tasks by webworkers.

## Quick install

Just load this page on a browser.

### How to use
After it loads up, choose the amount of workers to spin up then click on submit. Alternatively, use the query params
```
workers: number // number of workers to spawn (default: no of logical processors reported by the JS engine)
work: number   // amount of work (2 low - 30 high) (default: 14)
headless: boolean   // autostarts the intensive tasks (default: false)
```

### Dependencies

It uses [bulma](https://www.jsdelivr.com/package/npm/bulma) for layout and for the simple controls.
For future updates, just copy their release, minified js and css files to the `js` and `css` folders.

## Browser Support

Results tested on Chrome only. Not tested on other browsers.