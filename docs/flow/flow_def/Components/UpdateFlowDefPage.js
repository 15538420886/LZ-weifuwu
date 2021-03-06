import React from 'react';
import ReactMixin from 'react-mixin';
var Reflux = require('reflux');
import { Form, Modal, Button, Input, Select, Row, Col} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

import DictSelect from '../../../lib/Components/DictSelect';
import ServiceMsg from '../../../lib/Components/ServiceMsg';
import ModalForm from '../../../lib/Components/ModalForm';
var Common = require('../../../public/script/common');
var Utils = require('../../../public/script/utils');

var FlowDefStore = require('../data/FlowDefStore.js');
var FlowDefActions = require('../action/FlowDefActions');

var UpdateFlowDefPage = React.createClass({
    getInitialState : function() {
        return {
            flowDefSet: {},
            loading: false,
            modal: false,
            flowDef: {},
            hints: {},
            validRules: []
        }
    },

    mixins: [Reflux.listenTo(FlowDefStore, "onServiceComplete"), ModalForm('flowDef')],
    onServiceComplete: function(data) {

        if(this.state.modal && data.operation === 'update'){
            if( data.errMsg === ''){
                // 成功，关闭窗口
                this.setState({
                    modal: false
                });
            }
            else{
                // 失败
                this.setState({
                    loading: false,
                    flowDefSet: data
                });
            }
        }
    },

    // 第一次加载
    componentDidMount : function(){
        this.state.validRules = [
            { id: 'flowBook', desc: '规章制度', max: 24,},
            { id: 'flowCode', desc: '流程编号', required: true, max: 24, datatype: 'number',},
            { id: 'specialType', desc: '特批方式', max: 24,},
            { id: 'formUrl', desc: '表单地址', required: true, max: 256,},
        ];
    },

    initPage: function(flowDef)
    {
        this.state.hints = {};
        Utils.copyValue(flowDef, this.state.flowDef);

        this.state.loading = false;
        if( !this.state.modal && typeof(this.refs.mxgBox) != 'undefined' ){
            this.refs.mxgBox.clear();
        }
    },

    onClickSave : function(){
        if(Common.formValidator(this, this.state.flowDef)){
            this.setState({loading: true});
            FlowDefActions.updateFlowDef( this.state.flowDef );

        }
    },

    render : function() {
        var layout='horizontal';
        var layoutItem='form-item-'+layout;
        const formItemLayout = {
            labelCol: ((layout=='vertical') ? null : {span: 4}),
            wrapperCol: ((layout=='vertical') ? null : {span: 20}),
        };
        const formItemLayout2 = {
            labelCol: ((layout == 'vertical') ? null : { span: 8 }),
            wrapperCol: ((layout == 'vertical') ? null : { span: 16 }),
        };

        var hints=this.state.hints;
        return (
            <Modal visible={this.state.modal} width='540px' title="修改审批流程信息" maskClosable={false} onOk={this.onClickSave} onCancel={this.toggle}
                   footer={[
                       <div key="footerDiv" style={{display:'block', textAlign:'right'}}>
                           <ServiceMsg ref='mxgBox' svcList={['flow-def/update']}/>
                           <Button key="btnOK" type="primary" size="large" onClick={this.onClickSave} loading={this.state.loading}>保存</Button>{' '}
                           <Button key="btnClose" size="large" onClick={this.toggle}>取消</Button>
                       </div>
                   ]}
            >
                <Form layout={layout}>
                    <Row type="flex">
                        <Col span={12}>
                            <FormItem {...formItemLayout2} className={layoutItem} label='流程编号' required={true} colon={true} help={hints.flowCodeHint} validateStatus={hints.flowCodeStatus}>
                                <Input type='text' name='flowCode' id='flowCode' value={this.state.flowDef.flowCode} onChange={this.handleOnChange} />
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...formItemLayout2} className={layoutItem} label='流程名称' required={true} colon={true} help={hints.flowNameHint} validateStatus={hints.flowNameStatus}>
                                <Input type='text' name='flowName' id='flowName' value={this.state.flowDef.flowName} onChange={this.handleOnChange} />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row type="flex">
                        <Col span={12}>
                            <FormItem {...formItemLayout2} className={layoutItem} label="流程类型"  colon={true} style={{marginBottom: '20px'}}>
                                <DictSelect name="flowDefType" id="flowDefType" value={this.state.flowDef.flowType} appName='流程管理' optName='流程类型' onSelect={this.handleOnSelected.bind(this, "flowType")}/>
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...formItemLayout2} className={layoutItem} label="特批方式"  colon={true} style={{marginBottom: '20px'}}>
                                <DictSelect name="flowDefType" id="flowDefType" value={this.state.flowDef.specialType} appName='流程管理' optName='流程特批类型' onSelect={this.handleOnSelected.bind(this, "specialType")}/>
                            </FormItem>
                        </Col>
                    </Row>
                    <FormItem {...formItemLayout} className={layoutItem} label='表单地址' required={true} colon={true} help={hints.formUrlHint} validateStatus={hints.formUrlStatus}>
                        <Input type='text' name='formUrl' id='formUrl' value={this.state.flowDef.formUrl} onChange={this.handleOnChange} />
                    </FormItem>
                    <FormItem {...formItemLayout} className={layoutItem} label='规章制度' colon={true} help={hints.flowBookHint} validateStatus={hints.flowBookStatus}>
                        <Input type='textarea' name='flowBook' id='flowBook' style={{height: '100px'}} value={this.state.flowDef.flowBook} onChange={this.handleOnChange} />
                    </FormItem>
                </Form>
            </Modal>
        );
    }
});

export default UpdateFlowDefPage;