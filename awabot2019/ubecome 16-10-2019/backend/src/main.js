const express = require('express');
const http = require('http');
const https = require('https');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const config = require('../config.js');
const socketIOServer = require('./socketio/SocketIOServer.js');

const DatabaseManager = require('./core/DatabaseManager.js');

const TAG = 'Main';
const log = require('./core/Logger.js');
const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use(require('./core/SessionManager.js').httpRequestHandler);
app.use(require('./core/URLAccessManager.js').httpRequestHandler);
app.use(require('./routes/RootRouter.js'));
app.use(require('./routes/AuthentificationRouter.js'));
app.use(require('./routes/UserRouter.js'));
app.use(require('./routes/RobotRouter.js'));
app.use(require('./routes/ErrorRouter.js'));

DatabaseManager.connect(() =>
{
	log(TAG, 'Connected to database');

	const {ssl, port} = config.server;
	let server;

	if(config.server.ssl)
	{
		const serverConfig =
		{
			key: fs.readFileSync('./ssl/key.pem'),
			cert: fs.readFileSync('./ssl/cert-self-signed.crt')
		};

		server = https.createServer(serverConfig, app);
	}
	else
	{
		server = http.createServer(app);
	}

	socketIOServer(server);
	server.listen(port);

	log(TAG, 'Server started (ssl: ' + ssl + ', port: ' + port + ')');
});
