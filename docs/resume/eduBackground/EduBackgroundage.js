'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import ReactMixin from 'react-mixin';
import Context from '../resumeContext';
var Reflux = require('reflux');
import {Button, Table, Icon, Modal} from 'antd';
var Common = require('../../public/script/common');
import ServiceMsg from '../../lib/Components/ServiceMsg';
var ResumeStore = require('../resume/data/ResumeStore');
var ResumeActions = require('../resume/action/ResumeActions');
import CreateEduPage from './Components/CreateEduPage';



var EduBgdpage = React.createClass({
	getInitialState : function() {
		return {
			eduSet: {
				person: {},
				resumeID: '',
				operation:'',
				errMsg: ''
			},
			loading: false,
		}
	},

	mixins: [Reflux.listenTo(ResumeStore, "onServiceComplete")],
	onServiceComplete: function(data) {
		this.setState({
			loading: false,
			eduSet: data
		});
	},
	componentDidMount : function(){
		var app=Context.resumeApp;
		this.setState({loading: true});
		if(app.id){
			ResumeActions.getResumeByID(app.id);
		}else{
			var id = window.loginData.authUser.userId;
			ResumeActions.getResumeByIdCode(id);
		}
	},
	onClickUpdate:function(edu,event){
		if(edu != null){
			if(typeof(this.refs.createWindow) != 'undefined'){
				this.refs.createWindow.initPage(edu);
			}
		}
	},
	onClickDelete:function(edu,event){
		Modal.confirm({
			title: '删除确认',
			content: '是否删除选中的记录 【'+edu.uuid+'】',
			okText: '确定',
			cancelText: '取消',
			onOk: this.onClickDelete2.bind(this, edu)
		});
	},
	onClickDelete2 : function(edu){
		this.setState({loading: true});
		ResumeActions.delEdu(edu.uuid);
	},

	render : function() {
		var recordSet=this.state.eduSet.person.eduList;
		const columns = [
		{
			title: '学校',
			dataIndex: 'schName',
			key: 'schName',
			width: 160,
		},
		{
			title: '专业',
			dataIndex: 'deptName',
			key: 'deptName',
			width: 300,
		},
		{
			title: '学历/学位',
			dataIndex: 'qualName',
			key: 'qualName',
			width: 300,
		},

		{
			title: '',
			key: 'action',
			width: 100,
			render: (text, record) => (
			<span>
				<a href="#" onClick={this.onClickUpdate.bind(this, record)} title='修改'><Icon type={Common.iconUpdate}/></a>
				<span className="ant-divider" />
				<a href="#" onClick={this.onClickDelete.bind(this, record)} title='删除'><Icon type={Common.iconRemove}/></a>
			</span>
			),
		}
		];

		return (
			<div className='resume-page'>
				<ServiceMsg ref='mxgBox' svcList={['eduList/remove']}/>
				<div className='resume-body'>
					<Table columns={columns} dataSource={recordSet} rowKey={record => record.uuid} loading={this.state.loading} pagination={false} size="middle" bordered={Common.tableBorder}/>
				</div>
                <CreateEduPage ref="createWindow" />
			</div>
		);
	}
});

module.exports = EduBgdpage;
