import React from 'react';
import i18n from '../i18n/i18n';

class ConnectionStatus extends React.Component
{
	/*
		Props are :
		status - enum {disconnected, standby, connected}
	*/

	_styleForStatus(status)
	{
		let style = {
			textTransform: 'uppercase',
			textAlign: 'center'
		};

		if (status === 'disconnected')
		{
			style.color = '#D92B2F';
		}
		else if (status === 'standby')
		{
			style.color = '#F9BC2E';
		}
		else if (status === 'connected')
		{
			style.color = '#2DB84B';
		}

		return style;
	}

	_textForStatus(status)
	{
		let text;

		if (status === 'disconnected')
		{
			text = i18n.get('connection-status.offline');
		}
		else if (status === 'standby')
		{
			text = i18n.get('connection-status.standby');
		}
		else if (status === 'connected')
		{
			text = i18n.get('connection-status.online');
		}

		return text;
	}


	render()
	{
		return (
			<div id='connection-status' style={this._styleForStatus(this.props.status)}>{this._textForStatus(this.props.status)}</div>
		);
	}
}

export default ConnectionStatus;


