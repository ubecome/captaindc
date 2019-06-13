import io from 'socket.io-client';
import StateManager from './StateManager.js';

const TAG = '[SocketIOClient]';

const events = {};
events['pilot-response'] = 'pilot-response';
events['pilot-changed'] = 'pilot-changed';
events['robot-battery-level'] = 'robot-battery-level';
events['robot-state'] = 'robot-state';
events['robot-docking-state'] = 'robot-docking-state';
events['robot-emergency-button'] = 'robot-emergency-button';
events['robot-position'] = 'robot-position';
events['pilot-remaining-time'] = 'pilot-remaining-time';
events['pilot-recording-remaining-time'] = 'pilot-recording-remaining-time';
events['start-recording-response'] = 'start-recording-response';
events['pilot-recording-stopped'] = 'pilot-recording-stopped';

class SocketIOClient
{
	connect()
	{
		if(!this.socket)
		{
			this.socket = io('', {query: 'token=' + StateManager.get('logged-user').token});
			this.socket.on('connect', () =>
			{
				this.connected = true;
				console.log(TAG, 'connected');
				delete StateManager.get('logged-user').token;

				StateManager.update('socket.io-client-connected');
			});

			for(let event in events)
			{
				this.socket.on(event, (data) =>
				{
					StateManager.update(events[event], data);
				});
			}

			for(let event of ['connect_error', 'disconnect'])
			{
				this.socket.on(event, (data) =>
				{
					console.log(TAG, 'event', data);
				});
			}
		}
	}

	emit(event, data)
	{
		if(this.socket)
		{
			this.socket.emit(event, data);
		}
	}

	disconnect()
	{
		if(this.socket)
		{
			StateManager.update('socket.io-client-on-close');

			this.socket.close();
			delete this.connected;
			delete this.socket;

			console.log(TAG, 'disconnected');
		}
	}
}

export default new SocketIOClient();
