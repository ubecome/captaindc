const StateManager = require('./StateManager.js');

export default (method, url, params, callback) =>
{
	let urlParams = '';
	if(method === 'GET' && params)
	{
		urlParams += '?';
		for(let key in params)
		{
			urlParams += key + '=' + params[key] + '&';
		}
	}

	let xhr = new XMLHttpRequest();
	xhr.open(method, window.location.origin + '/api/' + url + encodeURI(urlParams));

	xhr.setRequestHeader('content-type', 'application/json');

	if(callback != null)
	{
		xhr.onreadystatechange = () =>
		{
			if(xhr.readyState === 4)
			{
				const {status, responseText} = xhr;

				if(status === 200)
				{
					callback(JSON.parse(responseText));
				}
				else
				{
					callback({ok: false, data: {status, responseText}});

					if(status === 401)
					{
						StateManager.update('http-401');
					}
				}
			}
		};
	}

	xhr.send(params ? JSON.stringify(params) : '');
};
