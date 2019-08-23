import React from 'react';
import {Form} from 'semantic-ui-react';
import i18n from '../i18n/i18n.js';

class ProfileSelector extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {value: this.props.value};

		this.options = [];
		for(let profile of ['admin', 'pilot', 'spectator'])
		{
			const key = 'profile.' + profile;
			this.options.push({key, value: key, text: i18n.get(key)});
		}

		this.onChange = this.onChange.bind(this);
	}

	onChange(e, {value})
	{
		const {name} = this.props;
		this.props.onChange({}, {name, value});
		this.setState({value});
	}

	render()
	{
		return (
			<Form.Select label={i18n.get('profile')} options={this.options} value={this.state.value} placeholder={i18n.get('select-profile')} onChange={this.onChange} />
		);
	}
}

export default ProfileSelector;