import React from 'react';
import StateManager from '../common/StateManager.js';
import SocketIOClient from '../common/SocketIOClient.js';

class AbstractComponent extends React.Component
{
	constructor(props)
	{
		super(props);

		this.subscribedEvents = [];
	}

	componentWillMount()
	{
		if(this.init)
		{
			this.init();
		}

		if(this.onSocketIOConnected)
		{
			if(SocketIOClient.connected)
			{
				this.onSocketIOConnected(SocketIOClient);
			}
			else
			{
				this.subscribeEvent('socket.io-client-connected', () =>
				{
					this.onSocketIOConnected(SocketIOClient);
				});
			}
		}

		if(this.onSocketIOOnClose)
		{
			this.subscribeEvent('socket.io-client-on-close', () =>
			{
				this.onSocketIOOnClose(SocketIOClient);
			});
		}
	}

	componentWillUnmount()
	{
		if(this.terminate)
		{
			this.terminate();
		}

		for(let event of this.subscribedEvents)
		{
			StateManager.unsubscribe(event, this);
		}

		this.subscribedEvents = [];
	}

	subscribeEvent(event, cb)
	{
		if(!this.subscribedEvents.includes(event))
		{
			StateManager.subscribe(event, this, cb);
			this.subscribedEvents.push(event);
		}
	}
	
	fireEvent(event, data, save)
	{
		StateManager.update(event, data, save);
	}
}

export default AbstractComponent;
