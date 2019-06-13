import React from 'react';
import {Button, Form, Message} from 'semantic-ui-react';
import ajax from '../common/ajax';
import i18n from '../i18n/i18n';

class Account extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			editable: false,
			busy: false,
			profile: '',
			name: '',
			login: '',
			password: '',
			confirmation: '',
			success: [],
			errors: []
		};

		this.setEditionMode = this.setEditionMode.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.updateAccount = this.updateAccount.bind(this);
	}

	componentWillMount()
	{
		ajax('GET', 'user/self', null, (response) =>
		{
			if (response.ok)
			{
				this.setState({...response.data.user});
			}
			else
			{
				this.setState({errors: [i18n.get('error.database-error')]});
			}
		});
	}

	setEditionMode(isEditionMode)
	{
		this.setState({editable: isEditionMode, success: [], errors: []});
	}

	handleChange(event, {name, value})
	{
		this.setState({[name]: value});
	}

	updateAccount()
	{
		if ( !this.validateContent() )
		{
			return;
		}

		let {password, name} = this.state;
		this.setState({busy: true});

		ajax('PUT', 'user/self', {name, password}, (response) =>
		{
			if (response.ok)
			{
				this.setState({busy: false, editable: false, success: [i18n.get('success.data-update')], errors: []});
			}
			else
			{
				this.setState({busy: false, errors: [i18n.get('error.database-error')], success: []});
			}
		});
	}

	validateContent()
	{
		let errors = [];

		if (this.state.password !== this.state.confirmation)
		{
			errors.push(i18n.get('error.invalid-field'));
		}

		if (!this.state.profile.length || !this.state.name.length)
		{
			errors.push(i18n.get('error.missing-fields'));
		}

		this.setState({errors});

		return !errors.length;
	}

	render()
	{
		let messages = [];
		let inputs = [];
		let buttons = [];

		const {busy, editable, success, errors, login, profile, name, password, confirmation} = this.state;

		for (let message of success)
		{
			messages.push(
				<Message success key={'message-'+messages.length} header={i18n.get('success')} content={message} />
			);
		}

		for (let message of errors)
		{
			messages.push(
				<Message error key={'message-'+messages.length} header={i18n.get('error')} content={message} />
			);
		}

		inputs.push(<Form.Input className={'lock-field locked'} key='login' label={i18n.get('login')} value={login}/>);
		inputs.push(<Form.Input className={'lock-field locked'} key='profile' label={i18n.get('profile')} value={i18n.get(profile)}/>);
		inputs.push(<Form.Input className={'lock-field ' + (editable ? 'unlocked' : 'locked')} name='name' key='name' label={i18n.get('name')} value={name} onChange={this.handleChange} />);

		if (editable)
		{
			inputs.push(<Form.Input className={'lock-field unlocked'} name='password' key='password' type='password' label={i18n.get('password')} value={password} onChange={this.handleChange} />);
			inputs.push(<Form.Input className={'lock-field unlocked'} name='confirmation' key='password-validation' type='password' label={i18n.get('confirmation')} value={confirmation} onChange={this.handleChange} />);
			buttons.push(<Button color='green' inverted floated='right' key='update' onClick={this.updateAccount}>{i18n.get('update')}</Button>);
			buttons.push(<Button color='red' inverted floated='right' key='cancel' onClick={() => this.setEditionMode(false)}>{i18n.get('cancel')}</Button>);
		}
		else
		{
			buttons.push(<Button key='edit' floated='right' onClick={() => this.setEditionMode(true)}>Edit</Button>);
		}

		return (
			<div id='account-container' className='offset-page-content'>
				<Form error success loading={busy} >
					{messages}
					{inputs}
					{buttons}
				</Form>
			</div>
		);
	}
}

export default Account;
