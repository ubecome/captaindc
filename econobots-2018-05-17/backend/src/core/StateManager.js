class StateManager
{
	constructor()
	{
		this.states = new Map();
		this.listeners = new Map();
	}

	get(state)
	{
		return this.states.get(state);
	}

	update(action, state, save)
	{
		if(save === true)
		{
			this.states.set(action, state);
		}

		let list = this.listeners.get(action);
		if(list !== undefined)
		{
			for(let listener of list)
			{
				listener.callback(state);
			}
		}
	}

	subscribe(action, ref, callback)
	{
		let list = this.listeners.get(action);
		if(list === undefined)
		{
			list = [];
		}

		list.push({callback, ref});
		this.listeners.set(action, list);
	}

	unsubscribe(action, ref)
	{
		let list = this.listeners.get(action);
		if(list)
		{
			for(let i = 0; i < list.length; i++)
			{
				if(list[i].ref === ref)
				{
					list.splice(i, 1);
					break;
				}
			}

			this.listeners.set(action, list);
		}
	}
}

module.exports =  new StateManager();
