import React from 'react';
import {Modal, Button} from 'semantic-ui-react';
import i18n from '../i18n/i18n.js';
import tools from '../common/tools.js';

class VideoStream extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {};

		this.fileName = this.props.src.split('/').slice(-1).pop();

		this.onDownloadClicked = this.onDownloadClicked.bind(this);
	}

	onDownloadClicked()
	{
		tools.blobURLfromURL(this.props.src, (blobURL) =>
		{
			if(blobURL)
			{
				tools.download(blobURL, this.fileName);
			}
		});
	}

	render()
	{
		return (
			<Modal basic open onClose={this.props.onClose}>
				<Modal.Content>
					<div>
						<video src={this.props.src} controls />
					</div>
				</Modal.Content>
				<Modal.Actions>
					<Button inverted onClick={this.onDownloadClicked}>{i18n.get('download')}</Button>
				</Modal.Actions>
			</Modal>
		);
	}
}

export default VideoStream;