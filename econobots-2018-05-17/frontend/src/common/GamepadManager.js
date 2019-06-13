const TAG = '[GamepadManager]';

class GamepadManager
{
	constructor()
	{
		this.polling = false;
		this.axes = [];
		this.buttons = [];

		this.deadZone = 0.15;

		this.pollingThread = this.pollingThread.bind(this);
	}

	init(cb)
	{
		this.onChanged = cb;

		this.polling = true;
		setTimeout(this.pollingThread, 0);

		console.log(TAG, 'init');
	}

	pollingThread()
	{
		if(this.polling)
		{
			let gamepad = navigator.getGamepads()[0];

			if(gamepad)
			{
				let axes = [];
				for(let axe of gamepad.axes)
				{
					axes.push(axe);
				}

				for(let i = 0; i < axes.length; i += 2)
				{
					if(((axes[i] > 0 && axes[i] < this.deadZone) || (axes[i] < 0 && axes[i] > -this.deadZone)) && ((axes[i + 1] > 0 && axes[i + 1] < this.deadZone) || (axes[i + 1] < 0 && axes[i + 1] > -this.deadZone)))
					{
						axes[i] = 0;
						axes[i + 1] = 0;
					}
				}

				let buttons = [];
				for(let button of gamepad.buttons)
				{
					buttons.push(button.value);
				}

				let changed = false;

				if(this.axes.length === axes.length && this.buttons.length === buttons.length)
				{
					for(let i = 0; i < this.axes.length; i++)
					{
						if(this.axes[i] !== axes[i])
						{
							changed = true;
							break;
						}
					}

					if(!changed)
					{
						for(let i = 0; i < this.buttons.length; i++)
						{
							if(this.buttons[i] !== buttons[i])
							{
								changed = true;
								break;
							}
						}
					}
				}
				else
				{
					changed = true;
				}

				if(changed)
				{
					this.axes = axes;
					this.buttons = buttons;

					if(this.onChanged)
					{
						this.onChanged({axes, buttons});
					}
				}
			}

			setTimeout(this.pollingThread, gamepad ? 33 : 1000);
		}
	}

	terminate()
	{
		this.polling = false;
		console.log(TAG, 'terminate');
	}
}

export default new GamepadManager();