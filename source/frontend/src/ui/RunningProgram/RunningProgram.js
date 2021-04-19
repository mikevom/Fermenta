import React from 'react';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Icons from '../../components/utilities/utils.icons';
import Services from '../../services';
import ElapsedTime from '../../components/ElapsedTime';
import DateTime from '../../components/DateTime';
import Temperature from '../../components/Temperature';
import Humidity from '../../components/Humidity';
import Distance from '../../components/Distance';
import Volume from '../../components/Volume';
import MainChart from './MainChart';
import Accordion from 'react-bootstrap/Accordion';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';


class RunningProgram extends React.Component {
  state = { RunningJob:'',RunningJobData:'',CurrentData:'',HistoricalData:[], isLoading:'false'}
  
  constructor(props, context) {
    super(props, context);
    
    // const initialState = {};
  }

  handleWSOpen(e){
    console.log('WebSocket open connection: '+ e);
  }

  handleWSMessage=(e)=>{
    try{
      const message = JSON.parse(e.data);
      if(message.Name==="currentData"){
        var histdata=this.state.HistoricalData;
        histdata.push(message.Value);
        this.setState({CurrentData: message.Value,HistoricalData: histdata});
      }
      else if(message.Name==="jobCompleted"){
        Services.ServiceAlert.AlertService.info("Program Completed", {autoClose: false,keepAfterRouteChange:true});
      }
      else if(message.Name==="cycleCompleted"){
        this.handleGetRunningProgram(true);
        Services.ServiceAlert.AlertService.info("Cycle Completed", {autoClose: true,keepAfterRouteChange:false});
      }
      else if(message.Name==="jobError"){
        Services.ServiceAlert.AlertService.error(message.Name, {autoClose: false,keepAfterRouteChange:true});
      }
    }
    catch(err){

    }
    //const message = JSON.parse(e.data);
    console.log('WebSocket Message: '+ e.data);
    
  }

  handleWSError(e){
    console.log('WebSocket Error Message: '+ e);
  }

  handleWSClose(e){
    console.log('WebSocket Close Connection: '+ e);
  }

  handleStop(){

  }

  handleGetRunningProgram (showLoading){
    var jobdata='';
    var logdata='';
    if(showLoading){
        Services.ServiceAlert.AlertService.info("getting data...", {autoClose: false,keepAfterRouteChange:false});
    }
    this.setState({isLoading: true});
    Services.Programs.getRunningProgram()
    .then((data=>{
        if(data.message!==undefined && data.message.DATA!== undefined){
          jobdata=JSON.parse(data.message.DATA);
        }

        Services.Programs.getJobLogs(data.message.ID)
        .then((logdata =>{
          if(logdata.message!==undefined){
            logdata=logdata.message;
          }

          var histdata=[];
          logdata.map((item,idx) =>{
            histdata.push(item.DATA);
            
          });

          if(histdata.length>0){
            this.setState({RunningJob: data.message,RunningJobData:jobdata, isLoading:false,HistoricalData:histdata, CurrentData: histdata[histdata.length-1] });
          }
          else{
            this.setState({RunningJob: data.message,RunningJobData:jobdata, isLoading:false,HistoricalData:histdata});
          }

          if(showLoading){
            Services.ServiceAlert.AlertService.clear();
          }
        }));
    }))
    .catch((error => { 
        Services.ServiceAlert.AlertService.clear();
        Services.ServiceAlert.AlertService.error('Error getting running program!', this.state.options);
        console.error('There was an error!', error);
    }));
  }

  componentDidMount(){

    const wsurl=  "ws://" + window.location.hostname + ":3000";
    this.ws = new WebSocket(wsurl);

    this.ws.onopen = this.handleWSOpen;

    this.ws.onmessage = this.handleWSMessage;

    this.ws.onerror = this.handleWSError;

    //this.ws.onclose = this.handleWSClose;

    this.handleGetRunningProgram(true);
  }

  componentWillUnmount() {
    this.ws.removeEventListener('error',this.handleWSError);
    this.ws.removeEventListener('message',this.handleWSMessage);
    this.ws.removeEventListener('close',this.handleWSClose);
    console.log("Close WebSocket")
    this.ws.close();
  }

  render() {
    var rows
    if(this.state.RunningJob!==undefined && this.state.RunningJob!==''){
      rows= this.state.RunningJobData.Cycles.map((item,idx) =>{   
        return (
          <React.Fragment>
            <Accordion.Toggle eventKey={item.Id} style={{cursor: 'pointer'}} as="tr">
              <td>{item.Id}</td>
              <td><DateTime datetime={item.StartTime}/></td>
              <td><Temperature Value={item.TargetTemperature}/></td>
              <td><ElapsedTime startdate={item.StartTime} elapsed={item.ElapsedTime}/></td>
              <td><DateTime datetime={item.EndTime}/></td>
            </Accordion.Toggle>
            <tr className="trBorder">
              <td colSpan="5" id="tdCollapse">
              <Accordion.Collapse eventKey={item.Id} colSpan="4">
                <React.Fragment>
                  <Row className="align-middle">
                    <Col xs="1">
                      Start
                    </Col>
                    <Col xs="auto">
                      <Temperature Value={item.StartTemperature} />
                      <Distance Value={item.StartDoughHeight} />
                      <Volume Value={item.StartDoughVolume} />
                    </Col>
                  </Row>
                </React.Fragment>
              </Accordion.Collapse>
              </td>
            </tr>
            <tr>
              <td colSpan="5" id="tdCollapse">
              <Accordion.Collapse eventKey={item.Id} colSpan="4">
                <React.Fragment>
                  <Row className="align-middle">
                    <Col xs="1">
                      End
                    </Col>
                    <Col xs="auto">
                      <Temperature Value={item.EndTemperature} />
                      <Distance Value={item.EndDoughHeight} />
                      <Volume Value={item.EndDoughVolume} />
                    </Col>
                  </Row>
                </React.Fragment>
              </Accordion.Collapse>
              </td>
            </tr>
          </React.Fragment>
        );
      });
      return (
        <Row> 
          {/* Running Program Card */}
          <Col sm="6" className="mb-3">
            <Card>
              <Card.Header >
              <ButtonToolbar aria-label="Toolbar with button groups" className="justify-content-between">
                    <ButtonGroup className="mr-2">
                        <h2>Active Program</h2>
                    </ButtonGroup>
                    <ButtonGroup className="ml-2"> 
                        <Button id="StopProgram" className="btn-fermenta mr-2 btn-dropdown" onClick={this.handleStop()}><Icons.StopLine fontSize="1.75em"/><div className="btn-dropdown-text">Stop</div></Button> 
                        <Button id="PauseProgram" className="btn-fermenta mr-2 btn-dropdown" onClick={this.handleStop()}><Icons.PauseLine fontSize="1.75em"/><div className="btn-dropdown-text">Pause</div></Button> 
                        <Button id="PlayProgram" className="btn-fermenta mr-2 btn-dropdown" onClick={this.handleStop()}><Icons.PlayLine fontSize="1.75em"/><div className="btn-dropdown-text">Play</div></Button> 
                    </ButtonGroup>    
                </ButtonToolbar>
              </Card.Header>
              <Card.Body>
                <Row style={{fontSize: '1.8em'}} className="align-middle">
                  <Col xs="12" >Name: {this.state.RunningJobData.Name}</Col>
                  <Col xs="12" md="auto"><DateTime datetime={this.state.RunningJob.STARTDATE} label="Started:"/></Col>
                  <Col xs="12" ><ElapsedTime startdate={this.state.RunningJob.STARTDATE} label="Elapsed Times:"/></Col>
                </Row>
            </Card.Body>
            </Card>
          </Col>
          
          {/* Current Data Card */}
          <Col sm="6" className="mb-3">
            <Card>
              <Card.Header as="h2">Current Data</Card.Header>
              <Card.Body>
                <Row style={{fontSize: '1.8em'}} className="align-middle">
                  <Col xs="6"><Temperature Value={this.state.CurrentData.Temperature} /></Col>
                  <Col xs="6"><Humidity Value={this.state.CurrentData.Humidity} /></Col>
                  <Col xs="6"><Distance Value={this.state.CurrentData.DoughHeight} /></Col>
                  <Col xs="6"><Volume Value={this.state.CurrentData.DoughVolume} /></Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Charts Card */}
          <Col xs="12" sm="12" md="12" className="mb-3">
            <Card>
              <Card.Header as="h2">Charts</Card.Header>
              <Card.Body>
                <MainChart data={this.state.HistoricalData}/>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Cycle Card */}
          <Col xs="12" sm="12" md="12" className="mb-3">
            <Card>
              <Card.Header as="h2">Cycles</Card.Header>
              <Card.Body>
                <Table responsive="sm" hover="true" style={{fontSize: '1.5em'}}>
                  <thead>    
                    <tr>    
                      <th width="10"><Icons.Hash /></th>
                      <th>Started</th>
                      <th>Target Temp</th>
                      <th><Icons.TimeLine/></th>
                      <th>Completed</th>
                    </tr> 
                  </thead>
                  <Accordion as="tbody">
                  {rows}
                  </Accordion>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      );
    }
    else{
      return (
        <Row>
          <Col>There is no Program running</Col>
        </Row>
      );
    }
  }
}

  // Exporting the component
export default RunningProgram;