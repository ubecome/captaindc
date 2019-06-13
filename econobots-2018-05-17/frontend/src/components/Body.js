import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './Home.js';
import Login from './Login.js';
import Admin from './Admin.js';
import Account from './Account.js';

class Body extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {};
	}

	render()
	{
		return (
			<div id='body-container'>
				<Switch>
					<Route exact path='/' component={Home}/>
					<Route path='/login' component={Login}/>
					<Route path='/account' component={Account}/>
					<Route path='/admin' component={Admin}/>
				</Switch>
			</div>
		);
	}
}

export default Body;
