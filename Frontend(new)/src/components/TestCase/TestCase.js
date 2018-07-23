import React, {Component} from 'react';
import axios from 'axios';
import swal from 'sweetalert2';
import ReactLoading from 'react-loading';
import StepDetails from '../StepDetails/StepDetails';
import './TestCase.css';

class TestCase extends Component {

    constructor() {
        super();
        this.state = {
            report: []
        }
    }

    componentDidMount() {
        axios.get('http://localhost:3002/devices').then((response) => {
            this.setState({report: response.data})

        }).catch((error) => {
            console.log(error);
        })

    }

   render() {
        let data = this.state.report;
        let device_index = this.props.match.params.testId;
        if(data.length === 0) {
            return (
                <ReactLoading className='loading' type='spinningBubbles' color='#FFA500' height={50} width={50} />
            )
        }
        else {
            console.log(data);
            let deviceNames = [];
            let numOfBuild = [];
            let testDetail = [];
            
            for(let key in data) {
                if(key !== "_id") {
                    deviceNames.push(key);
                    numOfBuild.push(data[key].build);
                    testDetail.push(data[key].tests);
                }
            }

            let device_name = deviceNames[device_index];
            let testDetails = testDetail[device_index]; 
            let testcases = [];
            let logHistory = [];
            let build = [];
            let modalId = 0;

            testDetails.reverse().map((data, index)=>{
                if(data !== null) {
                    testcases = data.testcases.map((testData, testIndex)=>{
                        const logs = testData.steps.map((logData, logIndex)=>{
                            if(logData.status !== 'pass') {
                                return (
                                    <tr className='log-failed'>
                                        <td className='step-num'><div>{logIndex + 1}</div></td>
                                        <td className='step-det'><div>{logData.description}</div></td>
                                        <td className='step-res'>
                                            <button className='btn fail-button' onClick={()=>swal({
                                                type: 'error',
                                                width: 700,
                                                html: `<table className="table table-hover detail-table"> 
                                                        <thead> 
                                                            <tr> 
                                                                <th>EXPECTED</th> 
                                                                <th>ACTUAL</th> 
                                                            </tr> 
                                                        </thead> 
                                                        <tbody> 
                                                            <tr> 
                                                                <td>${logData.description.split(':')[1]}</td> 
                                                                <td>${logData.result}</td> 
                                                            </tr> 
                                                        </tbody> 
                                                      </table>`
                                            })}>
                                                Failed
                                            </button>
                                        </td>
                                    </tr>
                                )
                            } else {
                                return(
                                    <tr className='log-success'>
                                        <td className='step-num'><div>{logIndex + 1}</div></td>
                                        <td className='step-det'><div>{logData.description}</div></td>
                                        <td className='step-res'>
                                            <button className='btn succ-button' onClick={()=>swal({
                                                type: 'success',
                                                width: 700,
                                                html: `<table className="table table-hover detail-table"> 
                                                        <thead> 
                                                            <tr> 
                                                                <th>EXPECTED</th> 
                                                                <th>ACTUAL</th> 
                                                            </tr> 
                                                        </thead> 
                                                        <tbody> 
                                                            <tr> 
                                                                <td>${logData.description.split(':')[1]}</td> 
                                                                <td>${logData.result}</td> 
                                                            </tr> 
                                                        </tbody> 
                                                      </table>`
                                            })}>
                                                Passed
                                            </button>
                                        </td>
                                    </tr>
                                )
                            }
                        });

                        logHistory.push(logs);

                        return (
                            <tr>
                                <td>{testData.name}</td>
                                <td>{testData.time + 's'}</td>
                                <td><div className='box-table succ-box'>{testData.pass}</div></td>
                                <td><div className='box-table fail-box'>{testData.fail}</div></td>
                                {testData.status === 'Passed'
                                ?
                                    <td>
                                        <button className='btn succ-button' data-toggle='modal' data-target={'#modal' + modalId}>
                                            {testData.status}
                                        </button>
                                    </td>
                                :
                                    <td>
                                        <button className='btn fail-button' data-toggle='modal' data-target={'#modal' + modalId}>
                                            {testData.status}
                                        </button>
                                    </td>
                                }
                                <div className="modal fade" id={'modal' + modalId} role="dialog">
                                    <StepDetails name={testData.name} steps={logHistory[modalId]} />
                                </div>
                                <span className='modal-id'>{modalId++}</span>
                            </tr>
                        )
                    })

                    build.push( 
                        // 'Build ' + (testDetails.length - index)
                        <tr data-toggle="collapse" data-target={"#build" + index} className='accordian-toggle collapsed'>
                            <td className='table-header-build'>{`${testDetails[index].date} / ${testDetails[index].timestamp}`}</td>
                            <td className='table-header-time'>{((data.time*100)/100).toFixed(2) + 's'}</td>
                            <td className='table-header-status'>
                                <div className='box-table succ-box'>{data.pass}</div>
                            </td>
                            <td className='table-header-status'>
                                <div className='box-table fail-box'>{data.fail}</div>
                            </td>
                            <td></td>
                        </tr>
                    )

                    build.push(
                        <tr>
                            <td colSpan='12' className="hiddenRow">
                                <div className="accordion-body collapse" id={"build" + index}>
                                    <div className='log-container'>
                                        <table className='table table-hover inner-table'>
                                            <thead>
                                                <tr>
                                                    <th>TEST CASE</th>
                                                    <th>TIME DURATION</th>
                                                    <th>STEPS PASSED</th>
                                                    <th>STEPS FAILED</th>
                                                    <th>FINAL STATUS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {testcases}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    );
                } else {
                    build.push(
                        <tr data-toggle="collapse" data-target={"#build" + index} className='accordian-toggle collapsed'>
                            <td className='table-header-build'>{'Build ' + (testDetails.length - index)}</td>
                            <td className='table-header-time'>0s</td>
                            <td className='table-header-status'>
                                <div className='box-table succ-box'>0</div>
                            </td>
                            <td className='table-header-status'>
                                <div className='box-table fail-box'>0</div>
                            </td>
                            <td></td>
                        </tr>    
                    )
                }
            });            

            return (
                <div className='test-case-container container-fluid'>
                    <h3 className='test-case header'>
                        {device_name}
                    </h3>
                    <table className='table test-case-table table-hover'>
                        <thead>
                            <tr>
                                <th>DATE / TIME</th>
                                <th>TIME DURATION</th>
                                <th>TEST PASSED</th>
                                <th>TEST FAILED</th>
                                <th>{`  `}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {build}
                        </tbody>
                    </table>
                </div>
            )
        }
    }
}

export default TestCase