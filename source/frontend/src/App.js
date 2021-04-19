import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Navbar from './ui/NavBar/NavBar';
import SideBar from './components/SideBar';
import Main from './components/Main';
import Monitor from './components/Monitor';
import Info from './ui/Info/Info';
import Sensors from './ui/Sensors';
import classNames from 'classnames';
import MQTTConnector from './components/mqtt-client/connector';
import ProgramConfig from './ui/ProgramConfig';
import RunningProgram from './ui/RunningProgram';
import { Alert } from './components/Alert';

import './scss/App.scss';


class App extends React.Component {
  state = { isMinimized: localStorage.getItem("isMinimized"),mqttClient:undefined};
  ref= React.createRef();

  mqttClient=undefined;
  url=  "ws://" + window.location.hostname + ":1884";

  options = {
    keepalive: 30,
    protocolId: "MQTT",
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    qos: 1,
    will: {
      topic: "WillMsg",
      payload: "Connection Closed abnormally..!",
      qos: 0,
      retain: false,
    },
    rejectUnauthorized: true,
    clientId: 'FermentaClient_' + Math.random().toString(16).substr(2, 8),
    username: 'Fermenta',
    password: 'Ferment@21',
    port: 1884
  };

  toggleSidebar(newisMinimized){
    //this.setState({ isMinimized: newisMinimized });
    if(newisMinimized){
      this.ref.current.classList.add("mini");
    }
    else{
      this.ref.current.classList.remove("mini");
    }
  }

  handleError = (error) =>{
    this.setState({ Error: error });
  }

  componentDidMount()
  {
    if(this.state.isMinimized){
      this.ref.current.classList.add("mini");
    }
    else{
      this.ref.current.classList.remove("mini");
    }
  }
  render() {
    const isMinimized = this.state.isMinimized;
    const MainClass = classNames("main", "container-fluid", "flex-shrink-0");
    //, {"mini": isMinimized}

    return (
      <MQTTConnector mqttProps={{ url: this.url,options: this.options}}>
        <div className="App">
          
          <header className="App-header">
            <Navbar/>
          </header>
          
          <Container fluid className="flex-shrink-0">
            <Row className="h-100">
                <div>
                  <Alert/>
                  <Router>
                    <SideBar isMinimized={this.toggleSidebar.bind(this)}/>
                    <main className={MainClass} id="Main" ref={this.ref}> 
                      <Switch>
                        <Route path="/" exact component={() => <Main />} />
                        <Route path="/Monitor" exact component={() => <Monitor mqttClient={this.state.mqttClient}/>} />
                        <Route path="/Info" exact component={() => <Info />} />
                        <Route path="/Sensors" exact component={() => <Sensors />} />
                        <Route path="/ProgramConfig" exact component={() => <ProgramConfig />} />
                        <Route path="/RunningProgram" exact component={() => <RunningProgram />} />
                      </Switch>
                    </main>
                  </Router>
                </div>
            </Row>
          </Container>
        </div>
      </MQTTConnector>
    );
  }
}

export default App;
