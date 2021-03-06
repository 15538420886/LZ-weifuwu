﻿import React from 'react';
import ReactMixin from 'react-mixin';
var Reflux = require('reflux');
import ServiceMsg from '../../../lib/Components/ServiceMsg';
var Validator = require('../../../public/script/common');
import DictRadio from '../../../lib/Components/DictRadio';
import ModalForm from '../../../lib/Components/ModalForm';
import { Form, Modal, Button, Input} from 'antd';
const FormItem = Form.Item;
var DictStore = require('../data/DictStore');
var DictActions = require('../action/DictActions');

var CreateDictPage = React.createClass({
	getInitialState : function() {
		return {
			dictSet: {
				operation : '',
				errMsg : ''
			},
			loading: false,
			modal: false,
			dict: {},
			hints: {},
			validRules: []
		}
	},
	mixins: [Reflux.listenTo(DictStore, "onServiceComplete"), ModalForm('dict')],
	onServiceComplete: function(data) {
		if(this.state.modal && data.operation === 'create'){
			if( data.errMsg === ''){
				// 成功
				this.setState({
					modal: false
				});
			}
			else{
				// 失败
				this.setState({
					loading: false,
					dictSet: data
				});
			}
		}
	},

	// 第一次加载
	componentDidMount : function(){
		this.state.validRules = [
			{id: 'codeValue', desc:'代码值', required: true, max: 64},
			{id: 'codeDesc', desc:'代码名称',required: true, max: 128},
			{id: 'paraStatus', desc:'状态',required: true, max: 1}
		];
	},

	clear : function(codeUuid,groupUuid){
		this.state.hints = {};
		this.state.dict.uuid='';
		this.state.dict.codeValue='';
		this.state.dict.codeDesc='';
		this.state.dict.paraStatus='1';
		this.state.dict.codeUuid = codeUuid;
		this.state.dict.envUuid = "N/A";
		this.state.dict.groupUuid = groupUuid;

		this.state.loading = false;
	    this.state.dictSet.operation = '';
	    if( !this.state.modal && typeof(this.refs.mxgBox) != 'undefined'){
	      this.refs.mxgBox.clear();
	    }
	},

	onClickSave : function(){
		if(Validator.formValidator(this, this.state.dict)){
			this.setState({ loading: true });
			DictActions.createSysCodeData( this.state.dict );
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
		return (
			<Modal visible={this.state.modal} width='540px' title="增加内容" maskClosable={false} onOk={this.onClickSave} onCancel={this.toggle}
			  footer={[
			  	<div key="footerDiv" style={{display:'block', textAlign:'right'}}>
					<ServiceMsg ref='mxgBox' svcList={['SysCodeData/create']} />
			   		<Button key="btnOK" type="primary" size="large" loading={this.state.loading} onClick={this.onClickSave}>保存</Button>{' '}
			   		<Button key="btnClose" size="large" onClick={this.toggle}>取消</Button>
			   </div>
			  ]}
			>
		   		<Form layout={layout}>
					<FormItem {...formItemLayout} required={true} label="代码值" colon={true} className={layoutItem} help={hints.codeValueHint} validateStatus={hints.codeValueStatus}>
						<Input type="text" name="codeValue" id="codeValue" value={this.state.dict.codeValue} onChange={this.handleOnChange}/>
					</FormItem>
					<FormItem {...formItemLayout} required={true} label="代码名称" colon={true} className={layoutItem} help={hints.codeDescHint} validateStatus={hints.codeDescStatus}>
						<Input type="textarea" name="codeDesc" id="codeDesc" value={this.state.dict.codeDesc} onChange={this.handleOnChange}  style={{height:'80px'}}/>
					</FormItem>
					<FormItem {...formItemLayout} label="状态" colon={true} className={layoutItem} help={hints.paraStatusHint} validateStatus={hints.paraStatusStatus}>
						<DictRadio name="paraStatus" id="paraStatus" appName='common' optName='启用状态' onChange={this.onRadioChange} value={this.state.dict.paraStatus}/>
					</FormItem>
				</Form>
			</Modal>
		);
	}
});

export default CreateDictPage;
