import React, {Component} from 'react';
import styles from './DeviceGroup.css'
import axios from "axios/index";
import { Grid, Panel } from 'react-bootstrap';
import ReactLoading from 'react-loading';
import PHONE from '../img/PHONE.png';
import TABLET from '../img/TABLET.png';

class DeviceGroup extends Component {

    constructor() {
        super();
        this.state = {
            info: [],
            report: []
        }
    }

    componentDidMount() {
        axios.get('http://localhost:3002/info').then((response) => {
            this.setState({info: response.data})
        }).catch((error) => {
            console.log(error);
        })

        axios.get('http://localhost:3002/devices').then((response) => {
            this.setState({report: response.data})
        }).catch((error) => {
            console.log(error);
        })
    }

    render() {
        const currentUrl = window.location.hostname
        let data = this.state.report;
        let info = this.state.info;
        if(data.length === 0 || info.length === 0) {
            return (
                <ReactLoading className='loading' type='spinningBubbles' color='#FFA500' height={50} width={50} />
            )
        }
        else {
            let deviceName = [];
            let deviceType = [];
            let deviceFrom = [];
            let deviceOs = [];
            let version = [];
            let numOfBuild = [];
            let testDetail = [];
            let testcasesrender = [];
            let latestBuilds = [];
            console.log(data);
            for(let key in data) {
                if(key !== "_id") {
                    deviceName.push(key);
                    numOfBuild.push(data[key].build);
                    testDetail.push(data[key].tests);
                    deviceType.push(info[key].category);
                    deviceFrom.push(info[key].manufacture);
                    deviceOs.push(info[key].os);
                    version.push(info[key].version);
                    latestBuilds.push(`${data[key].tests[data[key].build - 1].date}:${data[key].tests[data[key].build - 1].timestamp}`);
                }
            }

            let testrows = [];

            deviceName.map((data, index)=>{
                let className = `moduletest`;
                let panelId = `testmodule${index}`;
                let numPassed = testDetail[index][testDetail[index].length-1].pass;
                let numFailed = testDetail[index][testDetail[index].length-1].fail;
                if(numPassed > 0 && numFailed === 0) {
                    className += `-success`;
                }

                testrows.push(
                    <div className='col-md-5th'>
                        <Panel className={className} id={panelId}>
                            <Panel.Title className='test-toggle'>
                            { deviceType[index] === 'PHONE' &&
                                <img className='device-image' src={PHONE} />
                            } { deviceType[index] === 'TABLET' &&
                                <img className='device-image' src={TABLET} />
                            }
                            </Panel.Title>
                            <Panel.Body>
                                <div className='test-name'>
                                    {deviceName[index]}
                                </div>
                                <div className='device-info'>
                                    {`${deviceFrom[index]}/${deviceOs[index]}`}
                                </div>
                                <div className='device-version'>
                                    {`VERSION: ${version[index]}`}
                                </div>
                                <button className='test-summary'>
                                    <div className='build'>{`${latestBuilds[index].split(':')[0]}`}</div>
                                    <div className='box fail-box'>{numFailed}</div>
                                    <div className='box succ-box'>{numPassed}</div>
                                </button>
                                <button className='btn btn-history' 
                                    onClick={()=>{
                                        var newWin = window.open(`http://${currentUrl}/test/${index}`, "_blank");
                                        newWin.addEventListener("load", function() {
                                            newWin.document.title = deviceName[index];
                                        });
                                    }
                                }>
                                    History
                                </button>
                            </Panel.Body>
                        </Panel>   
                    </div>
                )

                if((index + 1)%5 === 0 || (index + 1) === deviceName.length) {
                    testcasesrender.push(testrows);
                    testrows = [];
                }
            })

            let testcases = [];
            testcasesrender.map((data, index)=>{
                testcases.push(
                    <div className='row row-device'>
                        {data}
                    </div>
                )
            })

            return (
                <div className='modules-container'>
                    <h1 className='testsuitename'>Current Devices</h1>
                    <div className='test-container'>
                        <Grid>
                            {testcases}
                        </Grid>
                    </div>
                </div>

            )
        }
    }
}

export default DeviceGroup