const StateManager = require('./StateManager.js');
const Daemon = require('./Daemon.js');
const RobotLink = require('./RobotLink.js');
const {name, time, recordingTime, timeout} = require('../../config').robot.pilot;

let pilot;
let timestamp;
let timeoutDaemon;
let recordingDaemon;
let remainingTime;
let remainingRecordingTime;

const pilotLeaved = (cb) =>
{
	timeoutDaemon.running = false;
	timeoutDaemon = undefined;
	remainingTime = undefined;

	RobotLink.api({url: '/light?action=0'});
	RobotLink.api({url: '/siren?action=0'});
	RobotLink.api({url: '/start_patrolling'});

	const onDone = () =>
	{
		pilot = undefined;
		cb();
	};

	if(recordingDaemon)
	{
		stopRecording({token: pilot.token}, onDone);
	}
	else
	{
		onDone();
	}
};

const changePilot = (user) =>
{
	if(!pilot)
	{
		pilot = user;
		timestamp = Date.now();

		remainingTime = time;

		timeoutDaemon = new Daemon('pilot-timeout', 0, 1000, undefined, () =>
		{
			StateManager.update('pilot-remaining-time', remainingTime);

			if(Date.now() > timestamp + timeout || remainingTime === 0)
			{
				pilotLeaved(() =>
				{
					StateManager.update('pilot-timeout');
				});
			}

			remainingTime--;
		});

		RobotLink.api({url: '/stop?timeout=' + time});
		return true;
	}
	else
	{
		return false;
	}
};

const keepAlive = (user) =>
{
	if(pilot && pilot.token === user.token)
	{
		timestamp = Date.now();
	}
};

const startRecording = (user, camera, cb) =>
{
	if(pilot && pilot.token === user.token)
	{
		const url = '/start_video_recording?name=' + name + '&duration=' + (recordingTime + 10) + '&camera=' + camera;

		RobotLink.api({url}, (err, response) =>
		{
			if(!err)
			{
				const body = JSON.parse(response.body);
				if(body.return === 'done')
				{
					remainingRecordingTime = recordingTime;

					recordingDaemon = new Daemon('recording-timeout', 0, 1000, undefined, () =>
					{
						StateManager.update('pilot-recording-remaining-time', remainingRecordingTime);

						if(remainingRecordingTime === 0)
						{
							recordingDaemon.running = false;
							stopRecording({token: pilot.token});
						}

						remainingRecordingTime--;
					});

					cb(true);
				}
				else
				{
					cb(false);
				}
			}
			else
			{
				cb(false);
			}
		});
	}
	else
	{
		cb(false);
	}
};

const stopRecording = (user, cb) =>
{
	if(pilot && pilot.token === user.token)
	{
		const url = '/stop_video_recording?name=' + name;

		RobotLink.api({url}, (err, response) =>
		{
			recordingDaemon.running = false;
			recordingDaemon = undefined;
			remainingRecordingTime = undefined;

			if(!err)
			{
				const body = JSON.parse(response.body);
				if(body.return === 'done')
				{
					StateManager.update('pilot-recording-stopped', body.status);
				}
			}

			if(cb)
			{
				cb();
			}
		});
	}
};

const leave = (user, cb) =>
{
	if(pilot && pilot.token === user.token)
	{
		pilotLeaved(() =>
		{
			cb(true);
		});
	}
	else
	{
		cb(false);
	}
};

const getPilot = () =>
{
	return pilot;
};

StateManager.subscribe('emergency-stop', {}, () =>
{
	if(pilot)
	{
		pilotLeaved(() =>
		{
			StateManager.update('pilot-leaved-after-emergency-stop');
		});
	}
});

module.exports = {changePilot, keepAlive, startRecording, stopRecording, leave, getPilot};
