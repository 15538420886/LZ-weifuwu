﻿var Reflux = require('reflux');
var SoftActions = require('../action/SoftActions');
var Utils = require('../../../public/script/utils');
var MsgActions = require('../../../lib/action/MsgActions');

var SoftStore = Reflux.createStore({
	listenables: [SoftActions],

	lastHostUuid:'',
	recordSet: [],
	startPage : 0,
	pageRow : 0,
	totalRow : 0,

	init: function() {
	},

	getServiceUrl: function(action)
	{
		return Utils.authUrl+action;
	},

	fireEvent: function(operation, errMsg, self)
	{
		self.trigger({

			recordSet: self.recordSet,
			startPage: self.startPage,
			pageRow: self.pageRow,
			totalRow: self.totalRow,
			operation: operation,
			errMsg: errMsg
		});

		MsgActions.showError('env-sys-soft', operation, errMsg);
	},

	onRetrieveEnvSysSoft: function(hostUuid) {
		var self = this;
		var filter = {
			"hostUuid":hostUuid
		};

		var url = this.getServiceUrl('env-sys-soft/get-by-hostUuid');
		Utils.doRetrieveService(url, filter, self.startPage, self.pageRow, self.totalRow).then(function(result) {
			if(result.errCode==null || result.errCode=='' || result.errCode=='000000'){
				self.recordSet = result.object.list;
				self.startPage = result.object.startPage;
				self.pageRow = result.object.pageRow;
				self.totalRow = result.object.totalRow;
				self.lastHostUuid = hostUuid;

				self.fireEvent('retrieve', '', self);
			}
			else{
				self.fireEvent('retrieve', "处理错误["+result.errCode+"]["+result.errDesc+"]", self);
			}
		}, function(value){
			self.fireEvent('retrieve', "调用服务错误", self);
		});
	},

	onRetrieveEnvSysSoftPage: function(startPage, pageRow,hostUuid) {
		this.startPage = startPage;
		this.pageRow = pageRow;
		this.onRetrieveEnvSysSoft(hostUuid);
	},


	onInitEnvSysSoft: function(hostUuid) {
		if( this.recordSet.length > 0 && hostUuid === this.lastHostUuid ){
			this.fireEvent('retrieve', '', this);
			return;	
		}

		this.onRetrieveEnvSysSoft(hostUuid);
	},

	onCreateEnvSysSoft: function(soft) {
		var url = this.getServiceUrl('env-sys-soft/create');
		Utils.recordCreate(this, soft, url);
	},

	onUpdateEnvSysSoft: function(soft) {
		var url = this.getServiceUrl('env-sys-soft/update');
		Utils.recordUpdate(this, soft, url);
	},

	onDeleteEnvSysSoft: function(uuid) {
		var url = this.getServiceUrl('env-sys-soft/remove');
		Utils.recordDelete(this, uuid, url);
	}
});

module.exports = SoftStore;
