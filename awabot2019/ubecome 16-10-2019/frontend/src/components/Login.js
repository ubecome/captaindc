import React from 'react';
import AbstractComponent from './AbstractComponent.js';
import {Form, Button, Segment} from 'semantic-ui-react';
import ajax from '../common/ajax.js';
import i18n from '../i18n/i18n.js';

class Login extends AbstractComponent
{
	constructor(props)
	{
		super(props);
		this.state = {login: '', password: ''};

		this.loginInputId = 'login-input';

		this.onValueChanged = this.onValueChanged.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
	}

	onValueChanged(e, {name, value})
	{
		this.setState({[name]: value});
	}

	onSubmit(e)
	{
		e.preventDefault();

		this.fireEvent('logged-user', undefined, true);

		const {login, password} = this.state;

		ajax('POST', 'auth/login', {login, password}, (authResp) =>
		{
			if(authResp.ok)
			{
				ajax('GET', 'user/self', null, (userResp) =>
				{
					this.fireEvent('logged-user', userResp.data.user, true);
				});
			}
			else
			{
				this.setState({error: i18n.get('login-failed')});
			}
		});
	}

	componentDidMount()
	{
		document.getElementById(this.loginInputId).focus();
	}

	render()
	{
		let errorMessage = [];
		if(this.state.error)
		{
			errorMessage.push(
				<div className='ui red header' key={0}>{this.state.error}</div>
			);
		}

		return (
			<div id='login-container' className='offset-page-content'>
				<Segment>
					<h1>{i18n.get('authentication')}</h1>
					{errorMessage}
					<Form onSubmit={this.onSubmit}>
						<Form.Input id={this.loginInputId} name='login' type='text' placeholder={i18n.get('login')} text={this.state.login} onChange={this.onValueChanged} />
						<Form.Input name='password' type='password' placeholder={i18n.get('password')} text={this.state.password} onChange={this.onValueChanged} />
						<Button primary type='submit' floated={'right'}>{i18n.get('login')}</Button>
					</Form>
				</Segment>
			</div>
		);
	}
}

export default Login;
