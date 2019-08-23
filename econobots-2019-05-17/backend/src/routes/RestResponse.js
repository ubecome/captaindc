class RestResponse
{
	constructor(ok)
	{
		this.ok = ok;
	}

	set(key, value)
	{
		if(key && value)
		{
			if(!this.data)
			{
				this.data = {};
			}

			this.data[key] = value;
		}

		return this;
	}
}

module.exports = RestResponse;
