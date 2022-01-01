# [Fill RAM](#)

Fill RAM shows a webpage that can fill up browser RAM **with some caveats**.

## Quick install

Just load this page on a browser. No need for a web server to serve the file. 

### How to use
After it loads up, choose the amount of ram then click on submit. 
You can also use the query params:
```
headless: boolean // whether to start without user input
ram: number // the amount of ram to fill in MBs, if it exceeds the heap size the tab may crash
```

### Dependencies

It uses [bulma](https://www.jsdelivr.com/package/npm/bulma) for layout and for the simple controls.
For future updates, just copy their release, minified js and css files to the `js` and `css` folders.

## Browser Support

Results tested on chrome only.