import React from 'react';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container'
import Services from '../../services';

class Settings extends React.Component {
    state = {isLoading: true, emailNotify: true, Language: 'English' , email:''}

    handleSaveClick = (e) => {
        e.preventDefault();

        Services.Programs.updateSettings(this.state.Language,this.state.emailNotify,this.state.email)
        .then((res=>{
            if(res.error){
                Services.ServiceAlert.AlertService.error(res.message, {autoClose: true,keepAfterRouteChange:false});
            }
            else{
                Services.ServiceAlert.AlertService.success('Settings saved!', {autoClose: true});
                this.setState({message:res})
            }
        }))
        .catch((error => {
            Services.ServiceAlert.AlertService.error("Error saving settings: " + error.message, {autoClose: true,keepAfterRouteChange:false});
            console.error('There was an error!', error);
        }));

    }

    handleEmailNotifyChange = (e) => {
        this.setState({ emailNotify: e.target.checked });
    }

    handleEmailChange = (e) => {
        var val = this.state.email;
        val= e.target.value;

        this.setState({ email: val });
    }

    handleLanguageChange = (e) => {
        var lang;
        lang = e.target.value;

        this.setState({ Language: lang });
    }

    handleGetSettings (showLoading){
        var settingsdata='';
        var logdata='';
        if(showLoading){
            Services.ServiceAlert.AlertService.info("getting data...", {autoClose: false,keepAfterRouteChange:false});
        }
        this.setState({isLoading: true});
        Services.Programs.getSettings()
        .then((data=>{
            if(data.message!==undefined ){
              settingsdata=data.message;
            }

            this.setState({emailNotify: settingsdata.EMAIL_NOTIFY,email: settingsdata.EMAIL_TO, Language:settingsdata.LANGUAGE, isLoading:false });
    
            if(showLoading){
                Services.ServiceAlert.AlertService.clear();
            }
        }))
        .catch((error => { 
            Services.ServiceAlert.AlertService.clear();
            Services.ServiceAlert.AlertService.error('Error getting settings!', this.state.options);
            console.error('There was an error!', error);
        }));
      }

    componentDidMount(){
        this.handleGetSettings();
      }

    render() {
        return (
            <Container>
                <Card className="card-width-650">
                    <Card.Header as="h2">Settings</Card.Header>
                    <Card.Body>
                        <Form>
                            <Form.Group as={Row} controlId="formLanguage">
                                <Form.Label column sm="3">Language</Form.Label>
                                <Col sm="9">
                                    <Form.Control className="inpute-settings" as="select" onChange={this.handleLanguageChange} value={this.state.Language} >
                                        <option>English</option>
                                        <option>Italiano</option>
                                    </Form.Control>
                                </Col>
                            </Form.Group>
                            <Form.Group controlId="formEmailNotification">
                                <Form.Check type="switch" id="custom-switch" label="Email notification" onChange={this.handleEmailNotifyChange} checked={this.state.emailNotify} />
                            </Form.Group>
                            <Form.Group as={Row} controlId="formEmail">
                                <Form.Label column sm="3">Email</Form.Label>
                                <Col sm="9">
                                    <Form.Control className="inpute-settings" 
                                                type="text" 
                                                as="textarea" 
                                                rows={3} 
                                                placeholder="Enter email separated by semicolon ';'" 
                                                value={this.state.email} 
                                                onChange={this.handleEmailChange}
                                                disabled={!this.state.emailNotify}/>
                                </Col>
                            </Form.Group>
                            <Button variant="primary" type="submit" className="btn-fermenta" onClick={this.handleSaveClick}>
                                Save
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        );
    }
}

// Exporting the component
export default Settings;