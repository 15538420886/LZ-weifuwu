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
import CreateBiziSkillPage from './Components/CreateBiziSkillPage';

var BiziSkillPage = React.createClass({
	getInitialState : function() {
		return {
			biziSkillSet: {
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
			biziSkillSet: data
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
	onClickUpdate:function(biziSkill,event){
		if(biziSkill != null){
			if(typeof(this.refs.createWindow) != 'undefined'){
				this.refs.createWindow.initPage(biziSkill);
			}
		}
	},
	onClickDelete:function(biziSkill,event){
		Modal.confirm({
			title: '删除确认',
			content: '是否删除选中的记录 【'+biziSkill.uuid+'】',
			okText: '确定',
			cancelText: '取消',
			onOk: this.onClickDelete2.bind(this, biziSkill)
		});
	},
	onClickDelete2 : function(biziSkill){
		this.setState({loading: true});
		ResumeActions.delBiziSkill(biziSkill.uuid);
	},
	render : function() {
		var recordSet=this.state.biziSkillSet.person.biziSkillList;
		const columns = [
		{
		    title: '技能类型',
		    dataIndex: 'skType',
		    key: 'skType',
		    width: 100,
        },
        {
		    title: '业务名称',
		    dataIndex: 'skName',
		    key: 'skName',
		    width: 280,
        },
        {
		    title: '熟练程度',
		    dataIndex: 'skLevel',
		    key: 'skLevel',
		    width: 100,
        },
        {
		    title: '使用时长',
		    dataIndex: 'skTime',
		    key: 'skTime',
		    width: 100,
        },
		{
			title: '',
			key: 'action',
			width: 80,
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
				<ServiceMsg ref='mxgBox' svcList={['biziSkillList/remove']}/>
				<div className='resume-body'>
					<Table columns={columns} dataSource={recordSet} rowKey={record => record.uuid} loading={this.state.loading} size="middle" pagination={false} bordered={Common.tableBorder}/>
				</div>
                <CreateBiziSkillPage ref="createWindow" />
			</div>
		);
	}
});

module.exports = BiziSkillPage;
