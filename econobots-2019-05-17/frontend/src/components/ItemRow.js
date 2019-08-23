import React from 'react';
import {Icon} from 'semantic-ui-react';
import '../css/item-row.css';

/*
	Props:
		items              : array - list of strings to display
		type               : enum (default|dashed)
		primaryAction      : function - callback on background click

		accessoryName      : string - icon name (semantic) for accessory
		secondaryAction    : function - callback on accessory click
*/

class ItemRow extends React.Component
{
	onAccessoryClick = (event) =>
	{
		event.stopPropagation();
		this.props.secondaryAction();
	};

	onRowClick = (event) =>
	{
		event.stopPropagation();
		this.props.primaryAction();
	};

	render()
	{
		const {item, accessoryName} = this.props;

		if (item)
		{
			let columns = [];
			let accessory = null;

			for (let index=0; index < item.length; index++)
			{
				columns.push(<div key={index} className='column'>{item[index]}</div>);
			}

			if (accessoryName)
			{
				accessory = (
					<div className='accessory-container'>
						<div key='accessory' className='accessory' onClick={this.onAccessoryClick}>
							<Icon name={accessoryName} size='large'/>
						</div>
					</div>
				);
			}

			return (
				<div className={'item-row' + (!accessoryName ? ' no-accessory' : '') + (this.props.type === 'dashed' ? ' dashed' : '')}>
					<div className='column-container' onClick={this.onRowClick}>
						{columns}
					</div>
					{accessory}
				</div>
			);
		}
	}
}

export default ItemRow;
