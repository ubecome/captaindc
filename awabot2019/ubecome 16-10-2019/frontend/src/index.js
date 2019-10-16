import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import 'semantic-ui-icon/icon.min.css';
import './css/main.css';

ReactDOM.render((
	<BrowserRouter>
		<App />
	</BrowserRouter>
), document.getElementById('root'));
