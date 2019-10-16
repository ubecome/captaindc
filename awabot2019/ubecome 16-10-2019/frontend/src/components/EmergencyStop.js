import React from 'react';
import i18n from '../i18n/i18n.js';
import '../css/emergency-stop.css';

class EmergencyStop extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {};
	}

	onClick()
	{
		// TODO
	}

	render()
	{
		return (
			<div className='emergency-stop-root'>
				<div className='emergency-stop-container'>
					<div className='emergency-stop' onClick={this.onClick}>
						{i18n.get('emergency-stop')}
					</div>
				</div>
			</div>
		);
	}
}

export default EmergencyStop;
