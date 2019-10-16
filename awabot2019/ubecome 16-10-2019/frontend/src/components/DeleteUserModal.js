import React from 'react';
import {Modal, Button, Message} from 'semantic-ui-react';
import ajax from '../common/ajax.js';
import i18n from '../i18n/i18n.js';
import '../css/modal.css';

class DeleteUserModal extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {};

		this.onConfirm = this.onConfirm.bind(this);
	}

	onConfirm()
	{
		const {login} = this.props.user;

		ajax('DELETE', 'user', {login}, (resp) =>
		{
			if(resp.ok)
			{
				this.props.onClose(true);
			}
			else
			{
				const {error} = resp.data;
				this.setState({error});
			}
		});
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
				size={'tiny'}
				closeOnEscape={true}
				closeOnDimmerClick={true}
				onClose={this.props.onDismiss}
				key='0'>
				<Modal.Header>
					{i18n.get('confirmation')}
				</Modal.Header>
				<Modal.Content>
					{error}
					<p>{i18n.get('confirm-delete-user', {user: this.props.user.login})}</p>
				</Modal.Content>
				<Modal.Actions>
					<Button color='red' inverted onClick={() => this.props.onClose()}>{i18n.get('no')}</Button>
					<Button basic color='green' inverted onClick={this.onConfirm}>{i18n.get('yes')}</Button>
				</Modal.Actions>
			</Modal>
		);
	}
}

export default DeleteUserModal;