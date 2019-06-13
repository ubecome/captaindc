const {PassThrough} = require('stream');
const archiver = require('archiver');
const RestResponse = require('./RestResponse.js');
const RobotLink = require('../core/RobotLink.js');
const PilotManager = require('../core/PilotManager.js');
const sizeOf = require('image-size');


const isPilot = (req) =>
{
	const pilot = PilotManager.getPilot();
	return pilot && pilot.token === req.session.user.token;
};

const cameraScreenshot = (camera, cb) =>
{
	const resolution = '800x600';
	const compression = 0;

	RobotLink.frame({camera, resolution, compression}, (err, response) =>
	{
		cb(err, response);
	});
};

const screenshotAll = (screenshots, cb) =>
{
	cameraScreenshot(screenshots.length + 1, (err, response) =>
	{
		if(!err && response.statusCode === 200)
		{
			screenshots.push(response.body);

			if(screenshots.length < 4)
			{
				screenshotAll(screenshots, cb);
			}
			else
			{
				cb();
			}
		}
		else
		{
			cb();
		}
	});
};

const router = require('express').Router();

router.get('/api/robot/config', (req, res) =>
{
	res.send(new RestResponse(true).set('config', RobotLink.config()));
});

router.get('/api/robot/screenshot/:camera', (req, res) =>
{
	cameraScreenshot(req.params.camera, (err, response) =>
	{
		if(!err && response.statusCode === 200)
		{
			res.set('Content-Type', 'image/jpg');
			res.send(response.body);
		}
		else
		{
			res.status(500).end();
		}
	});
});

router.get('/api/robot/screenshot', (req, res) =>
{
	res.set('Content-Type', 'application/zip');

	const stream = new PassThrough();
	stream.on('data', (chunk) => res.write(chunk));
	stream.on('end', () => res.end());

	const archive = archiver('zip');
	archive.pipe(stream);

	const screenshots = [];
	screenshotAll(screenshots, () =>
	{
		if(screenshots.length !== 4)
		{
			res.status(500).end();
		}
		else
		{
			for(let i = 0; i < screenshots.length; i++)
			{
				archive.append(screenshots[i], {name: '/' + req.query.fileName + '/camera' + (i + 1) + '.jpg'});
			}

			archive.finalize();
		}
	});
});

router.get('/api/robot/map/size', (req, res) =>
{
	RobotLink.api({url: '/map', encoding: null}, (err, response) =>
	{
		if (err || response.statusCode !== 200)
		{
			res.send(new RestResponse(false));
		}
		else
		{
			const size = sizeOf(response.body);

			if (size.width && size.height)
			{
				res.send(new RestResponse(true).set('width', size.width).set('height', size.height));
			}
			else
			{
				res.send(new RestResponse(false));
			}
		}
	});
});

router.get('/api/robot/map', (req, res) =>
{
	RobotLink.api({url: '/map', encoding: null}, (err, response) =>
	{
		res.set('Content-Type', 'image/png');
		res.send(err ? '' : response.body);
	});
});

router.post('/api/robot/move', (req, res) =>
{
	const {x, y} = req.body;

	if(isPilot(req) && x !== undefined && y !== undefined)
	{
		RobotLink.api({url: '/move?x=' + x + '&y=' + y});
		res.send(new RestResponse(true));
	}
	else
	{
		res.send(new RestResponse(false));
	}
});

router.post('/api/robot/turn-by', (req, res) =>
{
	const {theta} = req.body;

	if(isPilot(req) && theta !== undefined)
	{
		RobotLink.api({url: '/turn_by?theta=' + theta});
		res.send(new RestResponse(true));
	}
	else
	{
		res.send(new RestResponse(false));
	}
});

router.post('/api/robot/light', (req, res) =>
{
	const {state} = req.body;

	if(isPilot(req) && state !== undefined)
	{
		RobotLink.api({url: '/light?action=' + (state ? '1' : '0')});
		res.send(new RestResponse(true));
	}
	else
	{
		res.send(new RestResponse(false));
	}
});

router.post('/api/robot/siren', (req, res) =>
{
	const {state} = req.body;

	if(isPilot(req) && state !== undefined)
	{
		RobotLink.api({url: '/siren?action=' + (state ? '1' : '0')});
		res.send(new RestResponse(true));
	}
	else
	{
		res.send(new RestResponse(false));
	}
});

router.post('/api/robot/goto-dock', (req, res) =>
{
	if(isPilot(req))
	{
		RobotLink.api({url: '/go_recharging'});
		res.send(new RestResponse(true));
	}
	else
	{
		res.send(new RestResponse(false));
	}
});

module.exports = router;
