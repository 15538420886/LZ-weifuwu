﻿import React from 'react';
import ReactMixin from 'react-mixin';
var Reflux = require('reflux');
import ServiceMsg from '../../../../lib/Components/ServiceMsg';
import ModalForm from '../../../../lib/Components/ModalForm';
import DictRadio from '../../../../lib/Components/DictRadio';
var Common = require('../../../../public/script/common');
var Utils = require('../../../../public/script/utils');

import { Form, Modal, Button, Input, Select, Tabs, Col, Row, DatePicker} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

import SearchProjMember from '../../../lib/Components/SearchProjMember';
var ProjRoleStore = require('../data/ProjRoleStore.js');
var ProjRoleActions = require('../action/ProjRoleActions');
var ProjContext = require('../../../ProjContext');

var UpdateProjRolePage = React.createClass({
	getInitialState : function() {
		return {
			projRoleSet: {
				operation : '',
				errMsg : ''
			},
			loading: false,
			modal: false,
			projRole: {},
			hints: {},
			validRules: []
		}
	},

	mixins: [Reflux.listenTo(ProjRoleStore, "onServiceComplete"), ModalForm('projRole')],
	onServiceComplete: function(data) {
	  if( data.operation === 'update'){
		  if( data.errMsg === ''){
			  // 成功，关闭窗口
			  this.goBack();
		  }
		  else{
			  // 失败
			  this.setState({
				  loading: false,
				  projRoleSet: data
			  });
		  }
	  }
	},

	// 第一次加载
	componentDidMount : function(){
		this.state.validRules = [
			{id: 'roleName', desc:'角色', required: true, max: '64'},
			{id: 'perName', desc:'姓名', required: true, max: '32'},
			{id: 'beginDate', desc:'开始日期', required: false, max: '24'},
			{id: 'endDate', desc:'结束日期', required: false, max: '24'},
		];
		this.initPage( this.props.projRole );
	},
	
	componentWillReceiveProps: function (newProps) {
		this.initPage( newProps.projRole );
	},

	initPage: function(projRole)
	{
		Utils.copyValue(projRole, this.state.projRole);
		
		if (this.refs.empSearchBox !== undefined) {
            this.refs.empSearchBox.setValue(projRole.perName);
        }

		this.setState({ loading: false, hints: {} });
		if(typeof(this.refs.mxgBox) != 'undefined' ){
			this.refs.mxgBox.clear();
		}
	},

	onSelectProjRole:function(data){
        this.state.projRole.memo2 = data.deptName;
		this.state.projRole.staffCode = data.staffCode;
        this.state.projRole.perName = data.perName;
        this.refs.empSearchBox.setValue(data.perName);

        this.setState({
           user:data,
        })
    },

	onClickSave : function(){
		if(Common.formValidator(this, this.state.projRole)){
			this.state.projRoleSet.operation = '';
			this.setState({loading: true});
			ProjRoleActions.updateProjRole( this.state.projRole );
		}
	},

	goBack:function(){
        this.props.onBack();
    },

    onTabChange:function(activeKey){
        if(activeKey === '1'){
            this.props.onBack();
        }
    },

	render : function(){
		var layout='horizontal';
		var layoutItem='form-item-'+layout;
		const formItemLayout = {
			labelCol: ((layout=='vertical') ? null : {span: 4}),
			wrapperCol: ((layout=='vertical') ? null : {span: 20}),
		};

		var hints=this.state.hints;
        var projUuid = ProjContext.selectedProj.uuid;
		return (
			<div style={{overflow:'hidden', height:'100%', paddingLeft: '4px'}}>
				<Tabs defaultActiveKey="2"  onChange={this.onTabChange} tabBarStyle={{paddingLeft: '16px', margin: '-36px 0 0'}} style={{width: '100%', height: '100%', padding: '36px 0 0'}}>
					<TabPane tab="返回" key="1" style={{width: '100%', height: '100%'}}>
					</TabPane>
					<TabPane tab="修改管理员" key="2" style={{width: '100%', height: '100%'}}>
                        <div style={{padding:"20px 0 16px 0px", height: '100%',overflowY: 'auto'}}>
			            	<ServiceMsg ref='mxgBox' svcList={['proj-role/update']}/>
			            	
                           <Form layout={layout} style={{width:'450px'}}>
                           		<Row>
                           			<Col span="24">
                           				<FormItem {...formItemLayout} label="角色" required={true} colon={true} className={layoutItem} help={hints.roleNameHint} validateStatus={hints.roleNameStatus}>
											<DictRadio name="roleName" id="roleName" value={this.state.projRole.roleName} appName='项目管理' optName='角色' onChange={this.onRadioChange}/>
										</FormItem>
                           			</Col>
                           		</Row>								
								<Row>
									<Col span="24">
										<FormItem {...formItemLayout} label="姓名" required={true} colon={true} className={layoutItem} help={hints.perNameHint} validateStatus={hints.perNameStatus}>
											<SearchProjMember projUuid={projUuid} showError={this.showError} ref='empSearchBox' type="text"  name="perName" id="perName" value={this.state.projRole.perName} onSelectMember={this.onSelectProjRole}/>
										</FormItem>
									</Col>
								</Row>
								<FormItem {...formItemLayout} label="开始日期" required={false} colon={true} className={layoutItem} help={hints.beginDateHint} validateStatus={hints.beginDateStatus}>
									<DatePicker style={{width:'100%'}} name="beginDate" id="beginDate"  value={this.formatDate(this.state.projRole.beginDate, Common.dateFormat)}  format={Common.dateFormat} onChange={this.handleOnSelDate.bind(this,"beginDate", Common.dateFormat)} />
								</FormItem>					
								<FormItem {...formItemLayout} label="结束日期" required={false} colon={true} className={layoutItem} help={hints.endDateHint} validateStatus={hints.endDateStatus}>
									<DatePicker style={{width:'100%'}}  name="endDate" id="endDate" value={this.formatDate(this.state.projRole.endDate, Common.dateFormat)}  format={Common.dateFormat} onChange={this.handleOnSelDate.bind(this,"endDate", Common.dateFormat)} />
								</FormItem>
								<FormItem style={{textAlign:'right',margin:'4px 0'}} required={false} colon={true} className={layoutItem}>
									<Button key="btnOK" type="primary" size="large" onClick={this.onClickSave} loading={this.state.loading}>保存</Button>{' '}
									<Button key="btnClose" size="large" onClick={this.goBack}>取消</Button>
								</FormItem>
							</Form>
                        </div>
                    </TabPane>
                </Tabs>
	        </div>
		);
	}
});

export default UpdateProjRolePage;

