import React from "react";
import "../css/main.css";



/*var options = {};
options = {
    place: 'tl',
    message: (
        <div>
            <div>
                Welcome to <b>Now UI Dashboard React</b> - a beautiful freebie for every web developer.
            </div>
        </div>
    ),
    type: "danger",
    icon: "now-ui-icons ui-1_bell-53",
    autoDismiss: 7
}*/

class Temperature extends React.Component {
 

  render() {

  let temps = [];
     if(this.props.sensorsStateTemp > 30) {
     temps.push(<div id='alert' color="red" > {alert("la temperature atteint le seuil")} </div>)

     } 

    /*else{alert("no")}*/
    return (
      
    
    <div  id="control-panel-temp" >
    
        <label>Temperature</label>
       
       
        
         
        <img src="chaleur.png" id="logo-img" alt="logo temperature" />
        <input disabled="disabled" type="text" value={this.props.sensorsStateTemp} font-color="bleu" name="name" />
      </div>
      
    );
  }
}




export default Temperature;
