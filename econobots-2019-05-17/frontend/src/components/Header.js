import React from 'react';
import AbstractComponent from './AbstractComponent.js';
import { withRouter } from 'react-router-dom';
import {Menu} from 'semantic-ui-react';
import StateManager from '../common/StateManager.js';
import ajax from '../common/ajax.js';
import i18n from '../i18n/i18n.js'; 
import '../css/main.css';
class Header extends AbstractComponent
{
	static HOME = 'home';
	static ACCOUNT = 'account';
	static TOOLS = 'tools';
	static ADMIN = 'admin';
	static LOGOUT = 'logout';

	constructor(props)
	{
		super(props);

		var currentLocation = this.props.location.pathname.substring(1); // To remove the '/' in the path

		this.state = {activeItem: currentLocation};
	}

	handleItemClicked = (e, {name}) =>
	{
		this.setState({activeItem: name});

		switch (name)
		{
			case Header.HOME:
				this.props.history.push('/');
				break;
			case Header.LOGOUT:
				this.setState({activeItem: Header.HOME});
				ajax('POST', 'auth/logout', null, () => { this.fireEvent('logged-user', undefined, true) });
				break;
			default:
				this.props.history.push('/' + name);
		}
	};

	render()
	{
		const {activeItem} = this.state;
		let buttons = [];

		if(StateManager.get('logged-user') !== undefined)
		{
			buttons.push(
				<Menu.Item name={Header.HOME} active={activeItem === Header.HOME} onClick={this.handleItemClicked} key='homeButton'>
					{i18n.get('home')}
				</Menu.Item>
			);

			buttons.push(
				<Menu.Item name={Header.ACCOUNT} active={activeItem === Header.ACCOUNT} onClick={this.handleItemClicked} key='accountButton'>
					{i18n.get('account')}

				</Menu.Item>
			);
			buttons.push(
				<Menu.Item name={Header.TOOLS} active={activeItem === Header.TOOLS} onClick={this.handleItemClicked} key='toolsButton'>
                   {i18n.get('tools')} 
  

				</Menu.Item>
					

			);
	
			if(StateManager.get('logged-user').profile === 'profile.admin')
			{
				buttons.push(
					<Menu.Item name={Header.ADMIN} active={activeItem === Header.ADMIN} onClick={this.handleItemClicked} key='adminButton'>
						{i18n.get('admin')}
					</Menu.Item>
				);
			}

			buttons.push(
				<Menu.Menu position='right' key='right-menu' >
					<Menu.Item>
						<img src='UBECOME-LOGO.png' id='logo-img' alt='logo Econocom'/>
					</Menu.Item>
					<Menu.Item name={Header.LOGOUT} onClick={this.handleItemClicked} position='right' key='logoutButton'>
						{i18n.get('logout')}
					</Menu.Item>
				</Menu.Menu>
			);
		}

		return (
			<Menu id='top-menu' className='main-color' fixed='top' inverted size='huge'>
				{buttons}
			</Menu>
		);
	}
}

export default withRouter(Header);
