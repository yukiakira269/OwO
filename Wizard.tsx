import React, { Component, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import PubSub from "pubsub-js";
import { withRouter } from 'react-router-dom';

class Wizard extends Component<any, any>{

    constructor(props: any) {
        super(props);
    }

    componentDidMount() {
        PubSub.subscribe("ROUTE_SUCCESS", this.handleRouteSuccess);
    }

    componentWillUnmount() {
        PubSub.unsubscribe("ROUTE_SUCCESS");
    }

    handleRouteSuccess = (msg: any, data: any) => {
        this.props.history.push(data.RedirectPage);
    }

    handleConfigurationClick = (e: any) => {
        this.props.history.push('/Configuration');
    }

    handleRoomClick = (e: any) => {
        this.props.history.push('/Room');
    }

    handleLoadsClick = (e: any) => {
        this.props.history.push('/Loads');
    }

    handleEquipmentClick = (e: any) => {
        this.props.history.push('/Equipment');
    }

    handleScenesClick = (e: any) => {
        this.props.history.push('/Scenes');
    }

    handleInterfacesClick = (e: any) => {
        this.props.history.push('/Interfaces');
    }
    handleActionsClick = (e: any) => {
        this.props.history.push('/Actions');
    }
    handleReportsClick = (e: any) => {
        this.props.history.push('/Reports');
    }
    
    handleDeployCodeClick = (e: any) => {
        this.props.history.push('/DeployCode');
    }
    

    
    render() {
        return (<div className="container">
            <nav className="raptor-navbar" id="navbar">
                <ul className="list-inline raptor-list-inline">
                    <li  className="list-inline-item"><button data-tab="configuration" id="allowed" className="btn btn-primary raptor-nav-btn-primary" onClick={(e) => this.handleConfigurationClick(e)}>Configuration</button></li>
                    <li className="list-inline-item"><button data-tab="room" className="btn btn-primary raptor-nav-btn-primary" onClick={(e) => this.handleRoomClick(e)}>Room</button></li>
                    <li className="list-inline-item"><button data-tab="loads" className="btn btn-primary raptor-nav-btn-primary" onClick={(e) => this.handleLoadsClick(e)}>Loads</button></li>
                    <li className="list-inline-item"><button data-tab="equipment" className="btn btn-primary raptor-nav-btn-primary" onClick={(e) => this.handleEquipmentClick(e)}>Equipment</button></li>
                    <li className="list-inline-item"><button data-tab="scenes" className="btn btn-primary raptor-nav-btn-primary" onClick={(e) => this.handleScenesClick(e)}>Scenes</button></li>
                    <li className="list-inline-item"><button data-tab="interface" className="btn btn-primary raptor-nav-btn-primary" onClick={(e) => this.handleInterfacesClick(e)}>Interfaces</button></li>
                    <li className="list-inline-item"><button data-tab="actions" className="btn btn-primary raptor-nav-btn-primary" onClick={(e) => this.handleActionsClick(e)}>Actions</button></li>
                    <li className="list-inline-item"><button data-tab="reports" className="btn btn-primary raptor-nav-btn-primary" onClick={(e) => this.handleReportsClick(e)}>Reports</button></li>
                    <li className="list-inline-item"><button data-tab="deploy" className="btn btn-primary raptor-nav-btn-primary" onClick={(e) => this.handleDeployCodeClick(e)}>Deploy</button></li>
                </ul>
            </nav>
        </div>)
    }
}

export default withRouter(Wizard);;