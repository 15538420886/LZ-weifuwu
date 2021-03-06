import React from 'react';
import ReactMixin from 'react-mixin';
var Reflux = require('reflux');
import { Form, Row, Col, Modal, Button, Input, Select, DatePicker, Spin} from 'antd';
const { MonthPicker, RangePicker } = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option;
const InputGroup = Input.Group;


import ServiceMsg from '../../../../lib/Components/ServiceMsg';
import ModalForm from '../../../../lib/Components/ModalForm';
import DictSelect from '../../../../lib/Components/DictSelect';
import UserProjSelect from '../../../../proj/lib/Components/UserProjSelect';
import LeaveInput from '../../../lib/Components/LeaveInput';
var Common = require('../../../../public/script/common');
var Utils = require('../../../../public/script/utils');

var LeaveApplyStore = require('../data/LeaveApplyStore.js');
var LeaveApplyActions = require('../action/LeaveApplyActions');

var CancelUnpaidLeavePage = React.createClass({
	getInitialState : function() {
		return {
			workDailySet: {},
			loading: false,
			modal: false,
			leaveApply: {},
			hints: {},
			validRules: []
		}
	},

	mixins: [Reflux.listenTo(LeaveApplyStore, "onServiceComplete"), ModalForm('leaveApply')],
	onServiceComplete: function(data) {
		this.setState({
			loading: false,
			workDailySet: data
		});
	},

	// 第一次加载
	componentDidMount : function(){
		this.state.validRules = [
			{id: 'releaseDay', desc:'销假日期', required: true, max: '16'},
            { id: 'spend', desc: '实修天数', required: true, max: '16'},
		];
		this.initPage(this.props.leaveApply);
	},
	
	initPage: function(leaveApply)
	{
		this.state.hints = {};
		Utils.copyValue(leaveApply, this.state.leaveApply);
		var accrued = leaveApply.accrued;
		var bf1 = '0', bf2 = '0';
		var pos = accrued.indexOf('.');
		if (pos > 0) {
			bf1 = accrued.substr(0, pos);
			bf2 = accrued.substr(pos + 1);
		}
		else {
			bf1 = accrued;
		}
		this.state.leaveApply.accruedDay = bf1;
		this.state.leaveApply.accruedHour = bf2;
		this.state.leaveApply.spend='';
		this.state.leaveApply.releaseDay = Common.getToday()+'';
		this.state.loading = false;
		if( !this.state.modal && typeof(this.refs.mxgBox) != 'undefined' ){
			this.refs.mxgBox.clear();
		}
		
		this.setState({
            loading: false,
        });
	},

	onClickSave : function(){
		var accruedDay = this.refs.LeaveInput.state.accruedDay;
		var accruedHour = this.refs.LeaveInput.state.accruedHour;
		accruedHour = parseInt(accruedHour) > 0 ? '.' + accruedHour : '';
		this.state.leaveApply.spend = accruedDay + accruedHour;

		if(Common.formValidator(this, this.state.leaveApply)){
			var userProj = this.refs.userProj.getUserProjNode();
            this.state.leaveApply.projName = userProj.projName;
			this.setState({loading: true});
			LeaveApplyActions.cancelLeaveApply( this.state.leaveApply );
		}
	},

    render: function () {
        var layout = 'horizontal';
        var layoutItem = 'form-item-' + layout;
        const formItemLayout = {
            labelCol: ((layout == 'vertical') ? null : { span: 3 }),
            wrapperCol: ((layout == 'vertical') ? null : { span: 21 }),
        };
        const formItemLayout2 = {
            labelCol: ((layout == 'vertical') ? null : { span: 6 }),
            wrapperCol: ((layout == 'vertical') ? null : { span: 18 }),
        };
        const formItemLayout3 = {
            labelCol: ((layout == 'vertical') ? null : { span: 7 }),
            wrapperCol: ((layout == 'vertical') ? null : { span: 17 }),
        };

		var hints=this.state.hints;
        const dateFormat = Common.dateFormat;

        var status = this.state.leaveApply.status;
        var isProv = (status === '待休假');
		var form = 
			<Form layout={layout} style={{width:'700px'}}>
				<Row>
					<Col span={12}>
						<FormItem {...formItemLayout2} label="假期类型" required={false} colon={true} className={layoutItem} >
							<Input type="text" name="leaveType" id="leaveType" value={this.state.leaveApply.leaveType }  readOnly={true}/>
						</FormItem>
					</Col>
				</Row>
				<Row>
					<Col span={12}>
						<FormItem {...formItemLayout2} label="项目组" required={false} colon={true} className={layoutItem} >
							<UserProjSelect ref="userProj" name="projUuid" id="projUuid" value={this.state.leaveApply.projUuid} onSelect={this.handleOnSelected.bind(this, "projUuid")}/>
						</FormItem>
					</Col>
				</Row>
				<Row>
					<Col span="12">
						<FormItem {...formItemLayout2} label="开始日期" required={true} colon={true} className={layoutItem}>
							<Col span="13">
								<FormItem help={hints.beginDateHint} validateStatus={hints.beginDateStatus}>
									<DatePicker style={{ width: '100%' }} name="beginDate" id="beginDate" value={this.formatDate(this.state.leaveApply.beginDate, dateFormat)} format={dateFormat} onChange={this.handleOnSelDate.bind(this, "beginDate", dateFormat)} readOnly={true} />
								</FormItem>
							</Col>
							<Col span="11">
								<FormItem help={hints.beginHourHint} validateStatus={hints.beginHourStatus} style={{ margin: '0 0 0 8px' }}>
									<InputGroup compact>
										<Input style={{ width: '65%' }} type="text" name="beginHour" id="beginHour" value={this.state.leaveApply.beginHour} onChange={this.handleOnChange} readOnly={true} />
										<Input style={{ width: '35%', textAlign: 'center' }} defaultValue="时" readOnly={true} />
									</InputGroup>
								</FormItem>
							</Col>
						</FormItem>
					</Col>
					<Col span="12">
						<FormItem {...formItemLayout3} label="结束日期" required={true} colon={true} className={layoutItem}>
							<Col span="13">
								<FormItem help={hints.endDateHint} validateStatus={hints.endDateStatus}>
									<DatePicker style={{ width: '100%' }} name="endDate" id="endDate" value={this.formatDate(this.state.leaveApply.endDate, dateFormat)} format={dateFormat} onChange={this.handleOnSelDate.bind(this, "endDate", dateFormat)} readOnly={true} />
								</FormItem>
							</Col>
							<Col span="11">
								<FormItem className={layoutItem} help={hints.endHourHint} validateStatus={hints.endHourStatus} style={{ margin: '0 0 0 8px' }}>
									<InputGroup compact>
										<Input style={{ width: '65%' }} type="text" name="endHour" id="endHour" value={this.state.leaveApply.endHour} onChange={this.handleOnChange} readOnly={true} />
										<Input style={{ width: '35%', textAlign: 'center' }} defaultValue="时" readOnly={true} />
									</InputGroup>
								</FormItem>
							</Col>
						</FormItem>
					</Col>
				</Row>
				<Row>
					<Col span="12">
						<FormItem {...formItemLayout2} label="申请天数" required={false} colon={true} className={layoutItem}>
                            <LeaveInput ref='LeaveInput' type={'dayoff'} readOnly={true} value={this.state.leaveApply}></LeaveInput>
						</FormItem>
					</Col>
					<Col span="12">
						<FormItem {...formItemLayout3} label="备注" required={false} colon={true} className={layoutItem} >
							<Input type="text" name="memo2" id="memo2" value={this.state.leaveApply.memo2 } readOnly={true}/>
						</FormItem>
					</Col>
				</Row>
				<FormItem {...formItemLayout} label="休假事由" required={false} colon={true} className={layoutItem} >
					<Input type="textarea" name="reason" id="reason" value={this.state.leaveApply.reason } readOnly={true} />
				</FormItem>
				<Row>
					<Col span="12">
						<FormItem {...formItemLayout2} label="销假日期" required={true} colon={true} className={layoutItem} help={hints.releaseDayHint} validateStatus={hints.releaseDayStatus}>
							<DatePicker name="releaseDay" id="releaseDay" value={this.formatDate(this.state.leaveApply.releaseDay, dateFormat)} format={dateFormat} onChange={this.handleOnSelDate.bind(this, "releaseDay", dateFormat)} />
						</FormItem>
					</Col>
					<Col span="12">
						<FormItem {...formItemLayout3} label="实休天数" required={true} colon={true} className={layoutItem}  help={hints.spendHint} validateStatus={hints.spendStatus}>
                            <LeaveInput ref='LeaveInput' type={'dayoff'} readOnly={false} value={this.state.leaveApply} realLeave={true}></LeaveInput>
						</FormItem>
					</Col>
				</Row>
				<div key="footerDiv" style={{ display: 'block', textAlign: 'right' }}>
					<Button key="btnOK" type="primary" size="large" onClick={this.onClickSave} loading={this.state.loading} disabled={!isProv}>保存</Button>{' '}
					<Button key="btnClose" size="large" onClick={this.toggle}>取消</Button>
				</div>
			</Form>
		return (
			<div style={{padding:"24px 0 16px 20px", height: '100%',overflowY: 'auto'}}>
				<ServiceMsg ref='mxgBox' svcList={['leave_apply/cancel']}/>
				{this.state.loading ? <Spin>{form}</Spin> : form}
			</div>
		);
	}
});

export default CancelUnpaidLeavePage;