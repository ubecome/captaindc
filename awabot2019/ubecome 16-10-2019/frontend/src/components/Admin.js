import React from 'react';
import ItemRow from './ItemRow.js';
import AddUserModal from './AddUserModal.js';
import EditUserModal from './EditUserModal.js';
import DeleteUserModal from './DeleteUserModal.js';
import ajax from '../common/ajax.js';
import i18n from "../i18n/i18n";

class Admin extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {users: []};

		this.onAdd = this.onAdd.bind(this);
		this.onAddModalClose = this.onAddModalClose.bind(this);
		this.onEdit = this.onEdit.bind(this);
		this.onEditModalClose = this.onEditModalClose.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onDeleteModalClose = this.onDeleteModalClose.bind(this);
	}

	componentWillMount()
	{
		ajax('GET', 'user', null, (resp) =>
		{
			const {users} = resp.data;
			this.setState({users});
		});
	}

	onAdd()
	{
		this.setState({add: true});
	}

	onAddModalClose(user)
	{
		if(user)
		{
			const {users} = this.state;

			users.push(user);
			users.sort((a, b) => a.login >= b.login);
		}

		delete this.state.add;
		this.setState(this.state);
	}

	onEdit(user)
	{
		this.setState({userToEdit: user});
	}

	onEditModalClose(data)
	{
		if(data)
		{
			for(let user of this.state.users)
			{
				if(user.login === this.state.userToEdit.login)
				{
					for(let prop in data)
					{
						user[prop] = data[prop];
					}

					break;
				}
			}
		}

		delete this.state.userToEdit;
		this.setState(this.state);
	}

	onDelete(user)
	{
		this.setState({userToDelete: user});
	}

	onDeleteModalClose(deleted)
	{
		if(deleted)
		{
			const {login} = this.state.userToDelete;
			for(let i = 0; i < this.state.users.length; i++)
			{
				if(this.state.users[i].login === login)
				{
					this.state.users.splice(i, 1);
					break;
				}
			}
		}

		delete this.state.userToDelete;
		this.setState(this.state);
	}

	onDismiss = () =>
	{
		let newState = this.state;
		delete newState.add;
		delete newState.userToEdit;
		delete newState.userToDelete;

		this.setState(this.state);
	};

	render()
	{

		let users = this.state.users.map((user) =>
		{
			let item = [user.login, user.name, i18n.get(user.profile)];
			let deleteEnabled = (user.profile !== 'profile.admin');

			return <ItemRow className='user-row' key={user.login} item={item} primaryAction={() => this.onEdit(user)} accessoryName={(deleteEnabled ? 'delete' : '')} secondaryAction={() => this.onDelete(user)} />
		});
		users.unshift(<ItemRow key={'add-user'} className='user-row add' item={[i18n.get('new-user'), '', '']} primaryAction={() => this.onAdd()} type='dashed'/>);

		let modal;
		if(this.state.add)
		{
			modal = <AddUserModal onClose={this.onAddModalClose} key='0' onDismiss={this.onDismiss}/>;
		}

		if(this.state.userToEdit)
		{
			modal = <EditUserModal user={this.state.userToEdit} onClose={this.onEditModalClose} key='0' onDismiss={this.onDismiss}/>;
		}

		if(this.state.userToDelete)
		{
			modal = <DeleteUserModal user={this.state.userToDelete} onClose={this.onDeleteModalClose} key='0' onDismiss={this.onDismiss}/>;
		}

		return (
			<div id='admin-container' className='offset-page-content'>
				{users}
				{modal}
			</div>
		);
	}
}

export default Admin;
