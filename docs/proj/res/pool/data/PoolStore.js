﻿var Reflux = require('reflux');
var PoolActions = require('../action/PoolActions');
var Utils = require('../../../../public/script/utils');
var MsgActions = require('../../../../lib/action/MsgActions');
var FindNameActions = require('../../../../lib/action/FindNameActions');

var PoolStore = Reflux.createStore({
	listenables: [PoolActions],
	
	corpUuid: '',
	recordSet: [],
	startPage : 0,
	pageRow : 0,
	totalRow : 0,

    // uuid <--> name
    poolMap: {},

	init: function() {
	},
	getServiceUrl: function(action)
	{
		return Utils.projUrl+action;
	},
	
	fireEvent: function(operation, errMsg, self)
    {
        // 生成名称对照表
        if (self.corpUuid !== undefined && self.corpUuid !== null && self.corpUuid !== '') {
            var pMap = {};
            self.recordSet.map((node, i) => {
                pMap[node.uuid] = node.poolName;
            });

            self.poolMap[self.corpUuid] = pMap;
        }

		self.trigger({
			corpUuid: self.corpUuid,
			recordSet: self.recordSet,
			startPage: self.startPage,
			pageRow: self.pageRow,
			totalRow: self.totalRow,
			operation: operation,
			errMsg: errMsg
		});

		MsgActions.showError('res-pool', operation, errMsg);
	},
	
	onRetrieveResPool: function(corpUuid) {
		var self = this;
		var filter = {};
		filter.corpUuid = corpUuid;
		var url = this.getServiceUrl('res-pool/get-by-corp_uuid');
		Utils.doRetrieveService(url, filter, self.startPage, self.pageRow, self.totalRow).then(function(result) {
			if(result.errCode==null || result.errCode=='' || result.errCode=='000000'){
				self.recordSet = result.object.list;
				self.startPage = result.object.startPage;
				self.pageRow = result.object.pageRow;
				self.totalRow = result.object.totalRow;
				self.corpUuid = corpUuid;
				
				self.fireEvent('retrieve', '', self);
			}
			else{
				self.fireEvent('retrieve', "处理错误["+result.errCode+"]["+result.errDesc+"]", self);
			}
		}, function(value){
			self.fireEvent('retrieve', "调用服务错误", self);
		});
	},
	
	onRetrieveResPoolPage: function(corpUuid, startPage, pageRow) {
		this.startPage = startPage;
		this.pageRow = pageRow;
		this.onRetrieveResPool( corpUuid );
	},
	
	onInitResPool: function(corpUuid) {
		if( this.recordSet.length > 0 ){
			if( this.corpUuid === corpUuid ){
				this.fireEvent('retrieve', '', this);
				return;
			}
		}
		
		this.onRetrieveResPool(corpUuid);
	},
	
	onCreateResPool: function(pool) {
		var url = this.getServiceUrl('res-pool/create');
		Utils.recordCreate(this, pool, url);
	},
	
	onUpdateResPool: function(pool) {
		var url = this.getServiceUrl('res-pool/update');
		Utils.recordUpdate(this, pool, url);
	},
	
	onDeleteResPool: function(uuid) {
		var url = this.getServiceUrl('res-pool/remove');
		Utils.recordDelete(this, uuid, url);
	},
    onGetPoolName: function (corpUuid, uuid) {
        var pMap = this.poolMap[corpUuid];
        if (pMap !== undefined && pMap !== null) {
            var poolName = pMap[uuid];
            if (poolName === undefined || poolName === null) {
                poolName = uuid;
            }

            FindNameActions.findName('res_pool', uuid, poolName);
            return;
        }
        
        this.onRetrieveResPool(corpUuid);
    }
});

module.exports = PoolStore;

