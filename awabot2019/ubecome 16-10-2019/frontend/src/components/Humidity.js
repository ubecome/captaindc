import React from 'react';
import '../css/main.css';
class Humidity extends React.Component{
    render(){
      return(
        <div id='control-panel-hum'>
        <label>Humidity</label>
        <img src='humidity.png' id='logo-img' alt='logo humidity'/>
        <input type="text" disabled="disabled" value={this.props.sensorsStateHum} name="name" />
        </div>
    );
    }
}
export default Humidity;