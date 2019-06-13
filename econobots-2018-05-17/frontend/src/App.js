import React from 'react';
import {Loader} from 'semantic-ui-react';
import AbstractComponent from './components/AbstractComponent.js';
import { withRouter } from 'react-router-dom';
import Header from './components/Header.js';
import Body from './components/Body.js';
import SocketIOClient from './common/SocketIOClient.js';
import ajax from './common/ajax.js';

class App extends AbstractComponent
{
	constructor(props)
	{
		super(props);
		this.state = {};
	}

	init()
	{
		this.subscribeEvent('logged-user', (user) =>
		{
			if(user)
			{
				SocketIOClient.connect();
			}
			else
			{
				SocketIOClient.disconnect();
				this.props.history.replace('/login');
			}
		});

		this.subscribeEvent('http-401', () =>
		{
			this.fireEvent('logged-user', undefined, true);
		});

		this.subscribeEvent('socket.io-client-connected', () =>
		{
			if(this.props.history.location.pathname === '/login')
			{
				this.props.history.replace('/');
			}
			else
			{
				this.forceUpdate();
			}
		});

		ajax('GET', 'user/self', null, (resp) =>
		{
			this.fireEvent('logged-user', resp.data ? resp.data.user : undefined, true);
			this.setState({loggedUserLoaded: true});
		});
	}

	render()
	{
		let content = [];
		if(this.state.loggedUserLoaded)
		{
			content.push(<Header key='header' />);
			content.push(<Body key='body' />);
		}
		else
		{
			content.push(<Loader active size='huge' key='loader' />);
		}

		return (
			<div className='fill-parent'>
				{content}
			</div>
		);
	}
}

export default withRouter(App);
