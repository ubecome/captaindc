import React from 'react';
import dateFormat from 'dateformat';
import {Loader, Icon} from 'semantic-ui-react';
import AbstractComponent from './AbstractComponent.js';
import tools from '../common/tools.js';
import i18n from '../i18n/i18n.js';
import '../css/video-stream.css';
import { videoSettings } from '../common/config';
import SocketIOClient from '../common/SocketIOClient.js';
import ajax from '../common/ajax';
import noVideo from '../assets/no-video.png';
import ActionButton from './ActionButton';
import VideoPlayer from './VideoPlayer';

class VideoStream extends AbstractComponent
{
	constructor(props)
	{
		super(props);

		this.state = {
			robotConnectionState: 0, // 0 : connecting | 1 : connected | 2 : failed
			videoPanelOpened: false,
			videoSettingsOpened: false,
			cameraCount: 4,
			videoSourceIndex: videoSettings.defaults.videoSourceIndex,
			videoConfigIndex: videoSettings.defaults.qualityIndex,
			screenShotState: 0,
		};

		this.checkRobotConnection = this.checkRobotConnection.bind(this);
		this.onVideoPanelSwitchClicked = this.onVideoPanelSwitchClicked.bind(this);
		this.onSettingsClicked = this.onSettingsClicked.bind(this);
		this.onRecordClicked = this.onRecordClicked.bind(this);
		this.onScreenShotClicked = this.onScreenShotClicked.bind(this);
		this.onMultiScreenShotClicked = this.onMultiScreenShotClicked.bind(this);
	}

	init()
	{
		ajax('GET', 'robot/config', null, (resp) =>
		{
			if(resp.ok && resp.data)
			{
				this.setState({robotConfig: resp.data.config});
			}
		});

		this.subscribeEvent('start-recording-response', (ok) =>
		{
			this.startRecordingCallback(ok);
			this.startRecordingCallback = undefined;
		});

		this.subscribeEvent('pilot-recording-remaining-time', (recordingRemainingTime) =>
		{
			this.setState({recordingRemainingTime});
		});

		this.subscribeEvent('pilot-recording-stopped', (recordedVideoURL) =>
		{
			this.setState({recordedVideoURL, recordingRemainingTime: undefined});

			if(this.stopRecordingCallback)
			{
				this.stopRecordingCallback(recordedVideoURL !== undefined);
				this.stopRecordingCallback = undefined;
			}
		});
	}

	componentDidMount()
	{
		this.checkRobotConnection(2);
	}

	checkRobotConnection(retryCount)
	{
		if (this.state.robotConnectionState === 0)
		{
			//ajax("GET", "test/toto", null, (response) =>
			this.connectionTester(retryCount, (response) =>
			{
				if (response === true)
				{
					this.setState({robotConnectionState: 1});
				}
				else if (retryCount === 0)
				{
					this.setState({robotConnectionState: 2});
				}
			});
			if (retryCount > 0)
			{
				setTimeout(this.checkRobotConnection, 2000, retryCount-1);
			}
		}
	}

	// TODO Remove - For testing purpose only
	connectionTester(count, callback)
	{
		if (count>0)
		{
			callback(true);
		}
		else
		{
			callback(true);
		}
	}

	onVideoPanelSwitchClicked()
	{
		this.setState({videoPanelOpened: !this.state.videoPanelOpened, videoSettingsOpened: false});
	}

	generateCameraURL(camera, resolution, compression)
	{
		if(this.state.robotConfig)
		{
			const {ip, port} = this.state.robotConfig;

			let url = 'http://' + ip + ':' + port.camera + '/axis-cgi/mjpg/video.cgi?camera=' + camera;
			url += '&resolution=' + resolution;
			url += '&compression=' + compression;

			return url;
		}
		else
		{
			return '';
		}
	}

	generateScreenshotFileName()
	{
		return 'Screenshot_' + dateFormat(new Date(), 'dd.mm.yyyy_HH.MM.ss.l');
	}

	onScreenShotClicked(cb)
	{
		const img = document.createElement('img');
		const timeoutHandler = setTimeout(() => cb(false), 9000);

		img.addEventListener('load', () =>
		{
			const canvas = document.createElement('canvas');
			canvas.width = 800;
			canvas.height = 600;
			canvas.getContext('2d').drawImage(img, 0, 0, 800, 600);

			tools.screenshot(canvas.toDataURL('image/jpeg'), this.generateScreenshotFileName() + '.jpg');

			clearTimeout(timeoutHandler);
			cb(true);
		});

		img.addEventListener('error', () =>
		{
			clearTimeout(timeoutHandler);
			cb(false);
		});

		img.src = '/api/robot/screenshot/' + this.state.videoSourceIndex + '?t=' + Date.now();
	}

	onMultiScreenShotClicked(cb)
	{
		const fileName = this.generateScreenshotFileName();
		const timeoutHandler = setTimeout(() => cb(false), 9000);

		const url = window.location.origin + '/api/robot/screenshot?fileName=' + fileName;

		tools.blobURLfromURL(url, (blobURL) =>
		{
			clearTimeout(timeoutHandler);

			if(blobURL)
			{
				tools.download(blobURL, fileName + '.zip');
				cb(true);
			}
			else
			{
				cb(false);
			}
		});
	}

	onSettingsClicked()
	{
		this.setState({videoSettingsOpened: !this.state.videoSettingsOpened});
	}

	startRecording(cb)
	{
		this.startRecordingCallback = cb;
		SocketIOClient.emit('start-recording', this.state.videoSourceIndex);
	}

	stopRecording(cb)
	{
		this.stopRecordingCallback = cb;
		SocketIOClient.emit('stop-recording');
	}

	onRecordClicked(cb)
	{
		if(!this.state.recordingRemainingTime)
		{
			this.startRecording(cb);
		}
		else
		{
			this.stopRecording(cb);
		}
	}

	render()
	{
		if (this.state.robotConnectionState === 1)
		{
			let videoThumbnails = [];
			let currentVideoConfig = videoSettings.qualityConfigs[this.state.videoConfigIndex];
			let videoSettingsItems = [<div className='video-settings-title' key='video-quality-title'>{i18n.get('video-settings.title')}</div>];

			for(let i = 1; i <= this.state.cameraCount; i++)
			{
				const src = this.state.videoPanelOpened ? this.generateCameraURL(i, videoSettings.thumbNail.videoResolution, videoSettings.thumbNail.videoCompression) : noVideo;
				videoThumbnails.push(<img className={'video-item' + (this.state.videoSourceIndex === i ? ' selected' : '')} src={src} onClick={() => this.setState({videoSourceIndex: i})} alt={'camera ' + i + ' - no signal'} key={i} />);
			}

			for (let index = 0; index < videoSettings.qualityConfigs.length; index++)
			{
				videoSettingsItems.push(
					<div className={'video-settings-item' + (this.state.videoConfigIndex === index ? ' selected' : '')} key={index} onClick={() => this.setState({videoConfigIndex: index, videoSettingsOpened: false})}>
						{i18n.get(videoSettings.qualityConfigs[index].name)}
					</div>
				);
			}

			const videoPlayer = [];
			if(this.state.recordedVideoURL)
			{
				videoPlayer.push(<VideoPlayer src={this.state.recordedVideoURL} onClose={() => this.setState({recordedVideoURL: undefined})} key={0} />);
			}

			const videoRecording = [];
			if(this.state.recordingRemainingTime)
			{
				videoRecording.push(
					<div id='video-recording' key={0}>
						<div>
							<Icon name={'circle'} style={{color: 'red'}} size='large' />
						</div>
						<div id='video-recording-time'>
							{tools.secToMinSec(this.state.recordingRemainingTime)}
						</div>
					</div>
				);
			}

			return (
				<div id='video-stream-container'>
					<div id='main-video-container'>
						<img id='main-video' src={this.generateCameraURL(this.state.videoSourceIndex, currentVideoConfig.videoResolution, currentVideoConfig.videoCompression)} onClick={() => this.setState({videoPanelOpened: false, videoSettingsOpened: false})} alt='main-video' />
					</div>
					<div id='photo-video-tools-container' className={(this.state.videoPanelOpened ? 'closed' : '')}>
						<ActionButton className='photo-video-tool pointer-cursor' classicIcon='setting' action={this.onSettingsClicked} needsResult={false} />
						<ActionButton className='photo-video-tool pointer-cursor' classicIcon='camera' action={this.onScreenShotClicked} needsResult={true} />
						<ActionButton className='photo-video-tool pointer-cursor' customIcon='multishot' action={this.onMultiScreenShotClicked} needsResult={true} />
						<ActionButton className='photo-video-tool pointer-cursor' classicIcon={this.state.recordingRemainingTime ? 'square' : 'video camera'} action={this.onRecordClicked} needsResult={true} />
					</div>
					<div id='video-settings' hidden={!this.state.videoSettingsOpened}>
						{videoSettingsItems}
					</div>
					<div id='video-panel' className={(!this.state.videoPanelOpened ? 'closed' : '')}>
						<div id='video-panel-switch' className='pointer-cursor' onClick={this.onVideoPanelSwitchClicked}>
							<div id="scrollbar-mask">
								<div id='video-thumbnail-container'>
									{videoThumbnails}
								</div>
							</div>
							<svg id='video-panel-handle' width='20' height='100'>
								<path stroke="#FFF7" strokeWidth="2" strokeLinecap="round" strokeMiterlimit="10" fill="none" d="M 7,35 L 7,65" />
								<path stroke="#FFF7" strokeWidth="2" strokeLinecap="round" strokeMiterlimit="10" fill="none" d="M 13,35 L 13,65" />
							</svg>
						</div>
					</div>
					{videoRecording}
					{videoPlayer}
				</div>
			);
		}
		else
		{
			return (
				<div id='video-stream-container'>
					<div id='video-overlay'>
						<div id='video-overlay-content'>
							<Loader active size='large' key='loader' />
							<div className='connecting-message' hidden={(this.state.robotConnectionState !== 0)} >{i18n.get('robot-connection.connecting')}</div>
							<div className='connection-failed-message' hidden={(this.state.robotConnectionState !== 2)} >{i18n.get('robot-connection.failed')}</div>
						</div>
					</div>
				</div>
			);
		}

	}
}

export default VideoStream;