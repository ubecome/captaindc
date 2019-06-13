const request = require('request');
const {ip, port} = require('../../config.js').robot;

const restBaseURL = 'http://' + ip + ':' + port.rest;
const cameraBaseURL = 'http://' + ip + ':' + port.camera;

const sendRequest = (params, cb) =>
{
	params.timeout = 30000;

	request(params, (err, response) =>
	{
		if(cb)
		{
			cb(err, err ? undefined : response);
		}
	});
};

const urlEncode = (data) =>
{
	const list = [];
	for(let prop in data)
	{
		list.push(prop + '=' + data[prop]);
	}

	return list.join('&');
};

const api = (params, cb) =>
{
	params.url = restBaseURL + params.url;

	sendRequest(params, cb);
};

const frame = (params, cb) =>
{
	const req = {};
	req.url = cameraBaseURL + '/axis-cgi/jpg/image.cgi?' + urlEncode(params);
	req.encoding = null;

	sendRequest(req, cb);
};

const config = () =>
{
	return {ip, port};
};

module.exports = {api, frame, config};