import React from 'react';
import '../css/map-component.css';
import {ReactSVGPanZoom} from 'react-svg-pan-zoom';
import AbstractComponent from "./AbstractComponent";
import {Loader} from 'semantic-ui-react';
import Dimensions from 'react-dimensions';
import { mapSettings } from '../common/config';
import ajax from "../common/ajax";

class MapComponent extends AbstractComponent
{
	constructor(props)
	{
		super(props);

		this.state = {
			shouldFollowTarget: mapSettings.defaults.shouldFollowTarget,
			miniatureOpen: true,
			theta: undefined,
			x: undefined,
			y: undefined,
			mapWidth: undefined,
			mapHeight: undefined
		};

		this.map = undefined;
		this.minScaleFactor = mapSettings.defaults.minScaleFactor;
		this.maxScaleFactor = mapSettings.defaults.maxScaleFactor;
		this.scaleFactor = undefined;
	}

	onSocketIOConnected(socketIO)
	{
		ajax('GET', 'robot/map/size', null, (response) =>
		{
			if (response.ok)
			{
				this.setState({mapWidth: response.data.width, mapHeight: response.data.height});

				this.subscribeEvent('robot-position', (newCoords) =>
				{
					const {x, y, theta} = this.processRobotCoord(newCoords);

					this.setState({x, y ,theta});

					if (this.map && this.state.shouldFollowTarget)
					{
						this.map.setPointOnViewerCenter(x, y, this.scaleFactor);
					}
				});

				socketIO.emit('robot-position-request');
			}
			else
			{
				console.log('Error trying to retrieve map info');
			}
		});
	}



	processRobotCoord(newCoords)
	{
		return {
			theta: -newCoords.theta * 180 / Math.PI,
			x: newCoords.x ,
			y: this.state.mapHeight - newCoords.y
		}
	}

	onChangeValue = (value) =>
	{
		if (this.scaleFactor !== value.a)
		{
			this.scaleFactor = value.a;
		}

		this.setState({miniatureOpen: value.miniatureOpen});
	};

	onToggleTargetLock = () =>
	{
		if (!this.state.shouldFollowTarget)
		{
			this.map.setPointOnViewerCenter(this.state.x, this.state.y, this.scaleFactor);
		}

		this.setState({shouldFollowTarget: !this.state.shouldFollowTarget});
	};

	render()
	{
		const {x, y, theta, mapWidth, mapHeight} = this.state;
		const shouldDisplayMap = (x && y && mapWidth && mapHeight);

		if (shouldDisplayMap)
		{
			return (
				<div id='map-container'>
					<ReactSVGPanZoom
						width={this.props.containerWidth}
						height={this.props.containerHeight}
						tool='pan'
						detectAutoPan={false}
						scaleFactorMax={this.maxScaleFactor}
						scaleFactorMin={this.minScaleFactor}
						miniaturePosition={'right'}
						toolbarPosition={'none'}
						ref={(map) => this.map = map}
						onChangeValue={this.onChangeValue}
					>
						<svg width={mapWidth} height={mapHeight}>
							<image href="/api/robot/map" x="0" y="0" width={mapWidth} height={mapHeight} />
							<g transform={"translate(" + x + ", " + y + ") rotate(" + theta + ")" } >
								<path stroke="rgb(234, 106, 18)" strokeWidth="1.79" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" fill="none" d="M 13.47,7.02 L 19.96,-0.09 20,-0.13 13.3,-7.2" />
								<path stroke="none" fill="rgb(0, 0, 0)" d="M 9.55,-0.02 C 9.54,5.01 5.76,8.2 5.76,8.2 5.76,8.2 9.89,9.97 10.45,10.18 10.74,10.29 10.98,10.74 11.04,12.4 10.98,15.09 9.19,15 9.19,15 L -6.16,15 C -6.16,15 -7.3,14.98 -7.53,13.85 -7.76,12.72 -7.98,11.25 -7.98,11.25 L -20,3.63 -20,-3.67 -7.98,-11.29 C -7.98,-11.29 -7.76,-12.76 -7.53,-13.89 -7.3,-15.02 -6.16,-15 -6.16,-15 L 9.19,-15 C 9.19,-15 10.98,-15.13 11.04,-12.44 10.98,-10.78 10.74,-10.33 10.45,-10.22 9.89,-10.01 5.76,-8.24 5.76,-8.24 5.76,-8.24 9.54,-5.05 9.55,-0.02 Z M 9.55,-0.02" />
								<path stroke="none" fill="rgb(208, 208, 208)" d="M 8.83,-0.01 C 8.82,-6.07 2.72,-9.28 -0.21,-10.24 -0.3,-10.27 -4.23,-10.1 -4.56,-10.07 -5.61,-10.44 -7.41,-11.09 -7.98,-11.28 -7.96,-11.3 -0.49,-11.67 -0.49,-11.67 L -0.49,-11.67 C -0.5,-11.63 0.52,-10.22 0.52,-10.22 0.52,-10.22 9.71,-10.24 10.53,-10.25 9.96,-10.01 5.78,-8.24 5.78,-8.24 5.78,-8.24 9.54,-5.05 9.54,-0.01 9.54,5.02 5.78,8.21 5.78,8.21 L 5.8,8.19 C 5.78,8.21 9.96,9.98 10.53,10.22 9.71,10.22 0.52,10.19 0.52,10.19 L -0.5,11.61 C -0.49,11.65 -7.96,11.27 -7.98,11.25 -7.41,11.06 -5.61,10.41 -4.56,10.05 -4.23,10.07 -0.3,10.25 -0.21,10.21 1.45,9.67 4.13,8.41 6.14,6.31 7.68,4.71 8.83,2.61 8.83,-0.01 Z M 8.14,-0.01 C 8.14,-0.82 7.89,-2.19 7.89,-2.19 7.89,-2.19 8.29,-1.06 8.29,-0.01 8.29,1.03 7.89,2.16 7.89,2.16 7.89,2.16 8.14,0.79 8.14,-0.01 Z M 6.33,-0.01 C 6.33,0.69 6.4,1.41 6.51,1.41 6.62,1.41 6.76,0.69 6.76,-0.01 6.76,-0.72 6.62,-1.44 6.51,-1.44 6.4,-1.44 6.33,-0.72 6.33,-0.01 Z M 0.3,-5.46 C 0.39,-5.54 3.54,-2.71 3.59,-0.02 3.54,2.67 0.39,5.51 0.28,5.43 0.17,5.35 3.28,2.71 3.33,-0.02 3.28,-2.74 0.3,-5.46 0.3,-5.46 Z M -2.31,-0.01 L -2.32,5.71 C -2.32,5.71 -2.33,5.86 -2.19,6.01 -2.05,6.16 -1.78,6.3 -1.23,6.3 -1.72,7.09 -2.38,7.61 -2.87,7.88 -3.15,8.04 -3.37,8.11 -3.46,8.11 -3.46,8.11 -7.38,6.43 -7.41,6.42 -7.41,6.42 -8.73,6.85 -8.91,6.91 -9.13,6.82 -10.84,6.14 -10.84,6.14 L -13.13,6.27 -11.17,7.87 C -11.14,7.86 -7.46,6.64 -7.46,6.64 -7.42,6.62 -3.43,8.33 -3.43,8.33 -3.43,8.33 -3.44,9.48 -3.44,9.47 -3.44,9.48 -7.36,7.78 -7.36,7.78 L -11.27,9.15 C -11.27,9.15 -19.96,3.67 -20,3.65 L -20,-0.02 -20,-3.67 C -19.96,-3.7 -11.27,-9.18 -11.27,-9.18 L -7.36,-7.81 -3.44,-9.5 -3.44,-9.5 C -3.44,-9.5 -3.43,-8.36 -3.43,-8.36 L -7.42,-6.65 C -7.46,-6.67 -11.14,-7.89 -11.14,-7.89 -11.17,-7.9 -13.13,-6.3 -13.13,-6.3 L -10.84,-6.17 C -10.84,-6.17 -9.13,-6.85 -8.91,-6.94 -8.73,-6.88 -7.41,-6.45 -7.41,-6.45 -7.38,-6.46 -3.46,-8.14 -3.46,-8.14 -3.37,-8.14 -3.15,-8.07 -2.87,-7.91 -2.38,-7.63 -1.71,-7.12 -1.23,-6.33 -1.78,-6.33 -2.05,-6.18 -2.19,-6.04 -2.33,-5.89 -2.32,-5.74 -2.32,-5.74 L -2.31,-0.01 Z M 7.85,-0.01 C 7.84,1.07 7.45,1.83 7.45,1.83 7.42,1.85 6.24,1.85 6.24,1.85 6.14,1.85 6,0.91 6,-0.01 6,-0.95 6.14,-1.88 6.24,-1.88 L 7.42,-1.88 C 7.54,-1.77 7.84,-1.1 7.85,-0.01 Z M 7.06,-0.01 C 7.06,0.37 7.06,1.25 7.15,1.41 7.24,1.41 7.35,0.66 7.35,-0.01 7.35,-0.69 7.24,-1.44 7.16,-1.44 7.06,-1.28 7.06,-0.39 7.06,-0.01 Z M 7.06,-0.01" />
							</g>
						</svg>
					</ReactSVGPanZoom>
					<div id='target-lock-toggle' className={(this.state.shouldFollowTarget ? 'active ' : '') + (this.state.miniatureOpen ? 'shifted' : '')}>
						<svg width="24" height="24" onClick={this.onToggleTargetLock}>
							<circle stroke="none" cx="12" cy="12" r="12" />
							<path strokeLinecap="round" strokeMiterlimit="10" fill="none" d="M 18,12 C 18,15.31 15.31,18 12,18 8.69,18 6,15.31 6,12 6,8.69 8.69,6 12,6 15.31,6 18,8.69 18,12 Z M 2,12 L 9,12 M 15,12 L 22,12 M 12,22 L 12,15 M 12,9 L 12,2" />
						</svg>
					</div>
				</div>
			);
		}
		else
		{
			return (
				<div id='map-container'>
				
					<Loader active size='large' key='loader' />
				</div>
			);
		}
	}
}

export default Dimensions()(MapComponent);
