import React from 'react';
import {Form, Modal, Button, Message} from 'semantic-ui-react';
import ProfileSelector from './ProfileSelector.js';
import ajax from '../common/ajax.js';
import i18n from '../i18n/i18n.js';
import '../css/modal.css';

class AddUserModal extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {login: '', name: '', password: '', confirmation: ''};

		this.handleChange = this.handleChange.bind(this);
		this.onConfirm = this.onConfirm.bind(this);
	}

	handleChange(e, {name, value})
	{
		this.setState({[name]: value});
	}

	onConfirm()
	{
		const {login, name, password, confirmation, profile} = this.state;

		if(login && name && password && confirmation && profile)
		{
			if(password === confirmation)
			{
				this.setState({busy: true});
				ajax('POST', 'user', {login, name, password, profile}, (resp) =>
				{
					this.setState({busy: false});
					if(resp.ok)
					{
						this.props.onClose({login, name, profile});
					}
					else
					{
						this.setState({error: resp.data.error});
					}
				});
			}
			else
			{
				this.setState({error: 'error.invalid-field'});
			}
		}
		else
		{
			this.setState({error: 'error.missing-fields'});
		}
	}

	render()
	{
		let error = [];
		if(this.state.error)
		{
			error.push(<Message error header={i18n.get('error')} content={i18n.get(this.state.error)} key='0' />);
		}

		return (
			<Modal
				open={true}
				dimmer={'inverted'}
				size={'tiny'}
				closeOnEscape={true}
				closeOnDimmerClick={true}
				onClose={this.props.onDismiss}
				key='0'>
				<Modal.Header content={i18n.get('new-user')} />
				<Modal.Content>
					<Form error loading={this.state.busy} >
						{error}
						<Form.Input name='login' label={i18n.get('login')} value={this.state.login} onChange={this.handleChange} />
						<Form.Input name='name' label={i18n.get('name')} value={this.state.name} onChange={this.handleChange} />
						<Form.Input name='password' type='password' label={i18n.get('password')} value={this.state.password} onChange={this.handleChange} />
						<Form.Input name='confirmation' type='password' label={i18n.get('confirmation')} value={this.state.confirmation} onChange={this.handleChange} />
						<ProfileSelector name='profile' value={this.state.profile} onChange={this.handleChange} />
					</Form>
				</Modal.Content>
				<Modal.Actions>
					<Button basic color='red' inverted onClick={() => this.props.onClose()}>{i18n.get('cancel')}</Button>
					<Button color='green' inverted onClick={this.onConfirm}>{i18n.get('create')}</Button>
				</Modal.Actions>
			</Modal>
		);
	}
}

export default AddUserModal;