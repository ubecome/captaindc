import React from 'react';
import '../css/event-logger.css';
import i18n from '../i18n/i18n';


class EventLogger extends React.Component
{
	/*
		state params are :
		logs - array of maximum 5 event strings
	*/

	constructor()
	{
		super();

		this.state = {logs: []};
		this._addLog = this._addLog.bind(this);
		this.testLog = this.testLog.bind(this);
	}

	componentDidMount()
	{
		this.testLog();
	}

	testLog()
	{
		this._addLog('14/02/18 14:03:49', 'Longue phrase de test pour vérifier l\'affichage dans les cas limites');
		setTimeout(this.testLog, 2000);
	}

	_addLog(timestamp, text)
	{
		let logs = this.state.logs;
		logs.unshift(timestamp + ' - ' + text);

		if (logs.length > 5)
		{
			logs = logs.slice(0, 5);
		}

		this.setState({logs});
	}

	render()
	{
		let { logs } = this.state;
		let content = [];

		if (logs.length)
		{
			for (let log of logs)
			{
				content.push(<div key={'log-' + content.length}>{log}</div>);
			}
		}
		else
		{
			content.push(<div key='empty-log'>{i18n.get('event-log.empty')}</div>);
		}

		return (
			<div id='event-logger'>
				<div className='container'>
					{content}
				</div>
			</div>
		);
	}
}

export default EventLogger;


