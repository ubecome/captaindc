import React from 'react';
import AbstractComponent from './AbstractComponent.js';
import SocketIOClient from '../common/SocketIOClient.js';
import ControlPanel from './ControlPanel.js';
import VideoStream from './VideoStream.js';
import MapComponent from './MapComponent';

class Home extends AbstractComponent
{
	constructor(props)
	{
		super(props);
		this.state = {};
	}

	onSocketIOConnected()
	{
		SocketIOClient.emit('home-on');
	}

	onSocketIOOnClose()
	{
		SocketIOClient.emit('home-off');
	}

	terminate()
	{
		SocketIOClient.emit('home-off');
	}

	render()
	{
		return (
			<div id='pilot-interface'>
				<div id='pilot-board'>
					<div id='pilot-video'>
						<VideoStream/>
					</div>
					<div id='pilot-map'>
						<MapComponent />
					</div>
				</div>
				<div id='pilot-toolbar'>
					<ControlPanel />
				</div>
			</div>
		);
	}
}

export default Home;
