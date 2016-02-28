# FasterTitanium: Accelerate Titanium development
[![Circle CI](https://circleci.com/gh/CureApp/faster-titanium.svg?style=svg&circle-token=659aabd19fe243737c97ddcd9d39f4b509ef34f1)](https://circleci.com/gh/CureApp/faster-titanium)
[![npm version](https://badge.fury.io/js/faster-titanium.svg)](https://badge.fury.io/js/faster-titanium)


```bash
ti build -p ios --faster
```
Live a happier Titanium life!

![demo](https://cureapp.github.io/faster-titanium/demo.gif)

## Feature
- immediate reload on file changed
- both Alloy|non-Alloy support
- stable, robust connection
- no trouble with `require`
- native module support
- web UI support
- readable, well-documented code written in ES6+ JavaScript

## Installation

```
$ npm install -g faster-titanium
```

That's all.

Note that your Node.js has to be greater than v0.12.



## Usage

Run `ti build` with `--faster` option.

```bash
ti build -p ios --faster
```

That's all.

### Change port number of the web server

```bash
ti build -p ios --faster --ft-port 3000
```


### Web UI
![web-ui](https://cureapp.github.io/faster-titanium/web-ui.png)

Access to the URL: http://localhost:4157

#### Connection state
It shows the state of current connection with Titanium app.

#### Reload button
`Reload App` button can reload Titanium app


#### Change loading style
Clicking `Value` column of `loading style` enable you to select loading style.

- **auto-reload**: App will reload everytime a file changes.
- **auto-reflect**: Everytime a file changes, app clear the module cache and try to fetch new js file in `require()`.
- **manual**: Do nothing.

Default value is `auto-reload`.

