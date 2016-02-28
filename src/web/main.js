"use strict";

// import React from 'react' // installed from external script for performance
// import ReactDOM from 'react-dom' // installed from external script for performance
import Root from './components/root'

window.addEventListener('load', x => ReactDOM.render(<Root />, document.getElementById('container')))
