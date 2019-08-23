import React from 'react';
import {Loader, Modal, Header, Button, Icon} from 'semantic-ui-react';
import AbstractComponent from './AbstractComponent.js';
import ControlPanelButton from './ControlPanelButton.js';
import Daemon from '../common/Daemon.js';
import StateManager from '../common/StateManager.js';
import SocketIOClient from '../common/SocketIOClient.js';
import i18n from '../i18n/i18n.js';
import tools from '../common/tools.js';
import '../css/pilot-panel.css';

class PilotPanel extends AbstractComponent
{
	constructor(props)
	{
		super(props);
		this.state = {
			loaded: false,
			modalOpen: false,
			emergencyStop: false
		};
	}

	init()
	{
		this.subscribeEvent('pilot-response', (granted) =>
		{
			if(granted)
			{
				this.pilotKeepAliveDaemon = new Daemon('pilot-keep-alive', 0, 2000, null, () =>
				{
					SocketIOClient.emit('pilot-keep-alive');
				});
			}
		});

		this.subscribeEvent('pilot-changed', (pilot) =>
		{
			this.setState({loaded: true, pilot});
		});

		this.subscribeEvent('robot-emergency-button', (state) =>
		{
			if (state === 'UP')
			{
				this.setState({emergencyStop: false});
			}
			else if (state === 'DOWN')
			{
				const state = {emergencyStop: true};

				if(!this.state.modalOpen && this.isPilot())
				{
					state.modalOpen = true;
				}

				this.setState(state);
				this.leave();
			}
		});

		this.subscribeEvent('goto-dock', () =>
		{
			this.leave();
		});

		SocketIOClient.emit('robot-emergency-button-request');
	}

	onSocketIOConnected()
	{
		SocketIOClient.emit('pilot-state-request');
	}

	leave()
	{
		SocketIOClient.emit('pilot-leave');
	}

	onSocketIOOnClose()
	{
		this.leave();
	}

	terminate()
	{
		if(this.pilotKeepAliveDaemon)
		{
			this.pilotKeepAliveDaemon.running = false;
			SocketIOClient.emit('pilot-leave');
		}
	}

	handleModalClose = () =>
	{
		this.setState({modalOpen: false});
	};

	sendPilotRequest = () =>
	{
		if (this.state.emergencyStop)
		{
			this.setState({modalOpen: true});
		}
		else
		{
			SocketIOClient.emit('pilot-request');
		}
	};

	isPilot = () =>
	{
		return this.state.pilot && this.state.pilot.yourself;
	};

	render()
	{
		let content = [];
		if(this.state.loaded)
		{
			if(StateManager.get('logged-user'))
			{
				if(StateManager.get('logged-user').profile === 'profile.spectator')
				{
					if(this.state.pilot)
					{
						content.push(<div id='pilot-title' key='pilot-title'>{i18n.get('pilot')}</div>);
						content.push(<div id='pilot-name' key='pilot-name'>{this.state.pilot.name}</div>);
					}
					else
					{
						content.push(<div id='doing-his-rounds' key='doing-his-rounds'>{i18n.get('doing-his-rounds')}</div>);
					}
				}
				else
				{
					if(this.state.pilot)
					{
						if(this.state.pilot.yourself)
						{
							content.push(<div id='pilot-title' key='pilot-title'>{i18n.get('pilot')}</div>);
							content.push(<div id='pilot-name' key='pilot-name'>{i18n.get('yourself')}</div>);
							content.push(<ControlPanelButton size={[120, 45]} text={i18n.get('leave') + ' ( ' + tools.secToMinSec(this.props.remainingTime) + ' )'} onClick={this.leave} key='button' />);
						}
						else
						{
							content.push(<div id='pilot-title' key='pilot-title'>{i18n.get('pilot')}</div>);
							content.push(<div id='pilot-name' key='pilot-name'>{this.state.pilot.name}</div>);
						}
					}
					else
					{
						content.push(<div id='doing-his-rounds' key='doing-his-rounds'>{i18n.get('doing-his-rounds')}</div>);

						content.push(<ControlPanelButton size={[120, 45]} text={i18n.get('pilot-request')} onClick={this.sendPilotRequest} key='button' />);
					}
				}
			}
		}
		else
		{
			content.push(<Loader active inline size='large' key={0} />);
		}

		return (
			<div id='pilot-panel-container'>
				<Modal
					open={this.state.modalOpen}
					onClose={this.handleModalClose}
					basis
					size='small'
				>
					<Header icon='frown' content='Sorry' />
					<Modal.Content>
						<h3>The robot is currently unavailable. Please try again later</h3>
					</Modal.Content>
					<Modal.Actions>
						<Button color='green' onClick={this.handleModalClose} inverted>
							<Icon name='checkmark' /> Got it
						</Button>
					</Modal.Actions>
				</Modal>
				{content}
			</div>
		);
	}


}

export default PilotPanel;