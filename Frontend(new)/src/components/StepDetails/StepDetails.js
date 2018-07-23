import React, { Component } from 'react';
import './StepDetails.css';

class StepDetails extends Component {
	render() {
		return (
			<div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal">&times;</button>
                        <h4 className="modal-title">{this.props.name}</h4>
                    </div>
                    <div className="modal-body">
                        <table className='table table-hover log-table-header'>
                        	<thead>
                        		<tr>
                        			<th>STEP #</th>
                        			<th>TEST</th>
                        			<th>RESULT</th>
                        		</tr>
                        		{this.props.steps}
                        	</thead>
                        </table>
                    </div>
                	<div className="modal-footer">
                    	<button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
		)
	}
}

export default StepDetails;