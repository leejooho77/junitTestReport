import React, { Component } from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import './App.css';
import TestCase from "./components/TestCase/TestCase";
import PageHeader from "./components/PageHeader/PageHeader";
import DeviceGroup from "./components/DeviceGroup/DeviceGroup";

class App extends Component {
  render() {
    return (
    	<Router>
	      <div className="App">
	        <Route path='/' component={PageHeader} />
	        <Route exact path='/' component={DeviceGroup} />
	        <Route path='/test/:testId' component={TestCase} />
	      </div>
	    </Router>
    )
  }
}

export default App;
