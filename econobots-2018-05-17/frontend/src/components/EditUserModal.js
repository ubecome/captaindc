import React from 'react';
import {Form, Modal, Button, Message} from 'semantic-ui-react';
import ProfileSelector from './ProfileSelector.js';
import ajax from '../common/ajax.js';
import i18n from '../i18n/i18n.js';
import '../css/modal.css';

class EditUserModal extends React.Component
{
	constructor(props)
	{
		super(props);

		const {name, profile} = this.props.user;
		this.state = {name, profile};

		this.handleChange = this.handleChange.bind(this);
		this.onConfirm = this.onConfirm.bind(this);
	}

	handleChange(e, {name, value})
	{
		this.setState({[name]: value});
	}

	onConfirm()
	{
		if(this.state.name === '')
		{
			this.setState({error: 'error.missing-fields'});
		}
		else
		{
			let user = {login: this.props.user.login};

			if(this.props.user.name !== this.state.name)
			{
				user.name = this.state.name;
			}

			if(this.props.user.profile !== this.state.profile)
			{
				user.profile = this.state.profile;
			}

			if(user.name || user.profile)
			{
				this.setState({busy: true});
				ajax('PUT', 'user', user, (resp) =>
				{
					this.setState({busy: false});
					if(resp.ok)
					{
						this.props.onClose(user);
					}
					else
					{
						const {error} = resp.data;
						this.setState({error});
					}
				});
			}
			else
			{
				this.props.onClose();
			}
		}
	}

	render()
	{
		let error = [];
		if(this.state.error)
		{
			error.push(<Message error header={i18n.get('error')} content={i18n.get(this.state.error)} key='0' />);
		}

		let profileSelector = [];
		if(this.props.user.login !== 'admin')
		{
			profileSelector.push(<ProfileSelector name='profile' value={this.state.profile} onChange={this.handleChange} key='0' />);
		}

		return (
			<Modal
				basic={true}
				open={true}
				size={'tiny'}
				closeOnEscape={true}
				closeOnDimmerClick={true}
				onClose={this.props.onDismiss}
				key='0'>
				<Modal.Header content={i18n.get('edit-user', {user: this.props.user.login})} />
				<Modal.Content>
					<Form error loading={this.state.busy}>
						{error}
						<Form.Input name='name' label={i18n.get('name')} value={this.state.name} placeholder={i18n.get('name')} onChange={this.handleChange} />
						{profileSelector}
					</Form>
				</Modal.Content>
				<Modal.Actions>
					<Button basic color='red' inverted onClick={() => this.props.onClose()}>{i18n.get('cancel')}</Button>
					<Button color='green' inverted onClick={this.onConfirm}>{i18n.get('update')}</Button>
				</Modal.Actions>
			</Modal>
		);
	}
}

export default EditUserModal;