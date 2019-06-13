class Daemon
{
	constructor(name, delay, sleep, params, f)
	{
		const tag = '[DAEMON ' + name + ']';

		this.running = true;
		this.sleep = sleep;
		
		const loop = () =>
		{
			if(this.running)
			{
				try
				{
					f(params);
				}
				catch(e)
				{
					console.log(tag + ' ERROR', e);
				}

				setTimeout(loop, this.sleep);
			}
		};
		
		setTimeout(loop, delay);
	}
}

module.exports = Daemon;
