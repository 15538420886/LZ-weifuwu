import React from 'react';
import ReactMixin from 'react-mixin';
var Reflux = require('reflux');
import ServiceMsg from '../../../../lib/Components/ServiceMsg';
import ModalForm from '../../../../lib/Components/ModalForm';
import DictRadio from '../../../../lib/Components/DictRadio';
import SelectResTeam from '../../../lib/Components/SelectResTeam';
import SelectPool from '../../../lib/Components/SelectPool';

import CodeMap from '../../../../hr/lib/CodeMap';
import ProjCodeMap from '../../../lib/ProjCodeMap';
var Common = require('../../../../public/script/common');
var Utils = require('../../../../public/script/utils');

import { Form, Modal, Button, Input, Select, Col, Row, DatePicker } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

var ResMemberStore = require('../data/ResMemberStore.js');
var ResMemberActions = require('../action/ResMemberActions');
var ProjContext = require('../../../ProjContext');

var ChangeResMemberPage = React.createClass({
    getInitialState: function () {
        return {
            resMemberSet: {
                errMsg: ''
            },
            loading: false,
            resMember: {},
            poolUuid:'',
            teamUuid:'',
            hints: {},
            validRules: []
        }
    },

    mixins: [Reflux.listenTo(ResMemberStore, "onServiceComplete"), ModalForm('resMember'),ProjCodeMap(), CodeMap()],
    onServiceComplete: function (data) {
        if (data.operation === 'update') {
            if (data.errMsg === '') {
                // 成功，关闭窗口
                this.goBack();
            }
            else {
                // 失败
                this.setState({
                    loading: false,
                    resMemberSet: data
                });
            }
        }
    },

    // 第一次加载
    componentDidMount: function () {
        this.state.validRules = [
            { id: 'teamUuid', desc: '小组UUID', required: true, max: '24'},
            {id: 'poolUuid', desc:'资源池UUID', required: true, max: '24'},    
        ];

        this.initPage(this.props.resMember);
    },

    componentWillReceiveProps: function (newProps) {
        this.initPage(newProps.resMember);
    },

    initPage: function (resMember) {
        Utils.copyValue(resMember, this.state.resMember);
        
        // 生效日期和时间
        var member = this.state.resMember;
        if (member.poolUuid === member.resUuid) {
            // 需要增加调度指令
            member.resDate = '' + Common.getToday();
            member.resHour = '09:00';
        }

        this.setState({loading: false, hints: {}});
        if (typeof (this.refs.mxgBox) != 'undefined') {
            this.refs.mxgBox.clear();
        }
    },

    onClickSave: function () {
        var member = this.state.resMember;
        var poolUuid = member.poolUuid;
        var teamUuid = member.teamUuid;
        if (poolUuid === this.state.poolUuid && teamUuid === this.state.teamUuid) {
            this.goBack();
            return;
        }

        if (Common.formValidator(this, member)) {
            if (this.state.poolUuid !== poolUuid) {
                var resUuid = member.resUuid;

                var poolBox = this.refs.poolBox;
                var pool = poolBox.getPoolNode(this.state.poolUuid);
                member.poolUuid = this.state.poolUuid;
                member.poolCode = pool.poolCode;
                member.poolName = pool.poolName;

                if (poolUuid === resUuid) {
                    member.resUuid = this.state.poolUuid;
                    member.resName = member.poolName;
                }
            }

            member.teamUuid = this.state.teamUuid;
            this.setState({ loading: true });
            ResMemberActions.updateResMember2(this.state.resMember);
        }
    },
    handleOnSelectedPool: function (value) {
        if (this.state.poolUuid !== value) {
            this.state.teamUuid = "";
            this.setState({
                poolUuid: value,
            });
        }
    },
    handleOnSelectedTeam:function(value) {
        this.setState({
            teamUuid: value
        });
    },
    goBack: function () {
        this.props.onBack();
    },

    render: function () {
        var layout = 'horizontal';
        var layoutItem = 'form-item-' + layout;
        const formItemLayout = {
            labelCol: ((layout == 'vertical') ? null : { span: 4 }),
            wrapperCol: ((layout == 'vertical') ? null : { span: 20 }),
        };
        const formItemLayout2 = {
            labelCol: ((layout == 'vertical') ? null : { span: 8 }),
            wrapperCol: ((layout == 'vertical') ? null : { span: 16 }),
        };
        var hints = this.state.hints;
        var boo = this.state.resMember.userUuid ? false : true;

        var obj = this.state.resMember;
        var workYears = ProjContext.getDisplayWorkYears(obj.workBegin);
        var induYears = ProjContext.getDisplayWorkYears(obj.induBegin);
        var deptName = (obj.manType === "外协") ? obj.corpName : obj.deptName;
        var poolUuid = this.state.poolUuid;
        var corpUuid = ProjContext.selectedPool.corpUuid;
        var poolName = ProjContext.selectedPool.poolName;

        var dateTimeBox = (obj.poolUuid !== obj.resUuid) ? null :
            <Row>
                <Col span="12">
                    <FormItem {...formItemLayout2} label="生效日期" required={true} colon={true} className={layoutItem} help={hints.resDateHint} validateStatus={hints.resDateStatus}>
                        <DatePicker style={{ width: '100%' }} name="resDate" id="resDate" format={Common.dateFormat} value={this.formatDate(this.state.resMember.resDate, Common.dateFormat)} onChange={this.handleOnSelDate.bind(this, "resDate", Common.dateFormat)} />
                    </FormItem>
                </Col>
                <Col span="12">
                    <FormItem {...formItemLayout2} label="生效时间" required={true} colon={true} className={layoutItem} help={hints.resHourHint} validateStatus={hints.resHourStatus}>
                        <Input type="text" name="resHour" id="resHour" value={this.state.resMember.resHour} onChange={this.handleOnChange} />
                    </FormItem>
                </Col>
            </Row>;

        return (
            <div style={{ padding: "20px 0 16px 0px", height: '100%', overflowY: 'auto' }}>
                <ServiceMsg ref='mxgBox' svcList={['res-member/update']} />

                <Form layout={layout} style={{ width: '600px' }}>
                    <Row>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="员工编号" className={layoutItem}>
                                <Input type="text" name="staffCode" id="staffCode" value={this.state.resMember.staffCode} disabled={true} />
                            </FormItem>
                        </Col>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="姓名" className={layoutItem}>
                                <Input type="text" name="perName" id="perName" value={this.state.resMember.perName} disabled={true} />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="任职部门" className={layoutItem}>
                                <Input type="text" name="deptName" id="deptName" value={deptName} disabled={true} />
                            </FormItem>
                        </Col>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="归属地" className={layoutItem}>
                                <Input type="text" name="baseCity" id="baseCity" value={this.state.resMember.baseCity} disabled={true} />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="人员类型" className={layoutItem}>
                                <Input type="text" name="manType" id="manType" value={this.state.resMember.manType} disabled={true} />
                            </FormItem>
                        </Col>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="电话" className={layoutItem}>
                                <Input type="text" name="phoneno" id="phoneno" value={this.state.resMember.phoneno} disabled={true} />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="最高学历" className={layoutItem}>
                                <Input type="text" name="eduDegree" id="eduDegree" value={this.state.resMember.eduDegree} disabled={true} />
                            </FormItem>
                        </Col>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="毕业院校" className={layoutItem}>
                                <Input type="text" name="eduCollege" id="eduCollege" value={this.state.resMember.eduCollege} disabled={true} />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="工龄" className={layoutItem}>
                                <Col span='11'>
                                    <Input type="text" name="workYears_1" id="workYears_1" value={workYears.y} addonAfter="年" onChange={this.handleOnChange2} disabled={true} />
                                </Col>
                                <Col span='2' style={{ textAlign: 'center' }}>
                                </Col>
                                <Col span='11'>
                                    <Input type="text" name="workYears_2" id="workYears_2" value={workYears.m} addonAfter="月" onChange={this.handleOnChange2} disabled={true} />
                                </Col>
                            </FormItem>
                        </Col>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="行业经验" className={layoutItem}>
                                <Col span='11'>
                                    <Input type="text" name="induYears_1" id="induYears_1" value={induYears.y} addonAfter="年" onChange={this.handleOnChange2} disabled={true} />
                                </Col>
                                <Col span='2' style={{ textAlign: 'center' }}>
                                </Col>
                                <Col span='11'>
                                    <Input type="text" name="induYears_2" id="induYears_2" value={induYears.m} addonAfter="月" onChange={this.handleOnChange2} disabled={true} />
                                </Col>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="员工级别" className={layoutItem}>
                                <Input type="text" name="empLevel" id="empLevel" value={this.getLevelName(corpUuid, this.state.resMember.empLevel)} disabled={true} />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="技术级别" className={layoutItem}>
                                <Input type="text" name="techLevel" id="techLevel" value={this.state.resMember.techLevel} disabled={true} />
                            </FormItem>
                        </Col>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="管理级别" className={layoutItem}>
                                <Input type="text" name="manLevel" id="manLevel" value={this.state.resMember.manLevel} disabled={true} />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="技术岗位" className={layoutItem}>
                                <Input type="text" name="techUuid" id="techUuid" value={this.state.resMember.techName} disabled={true} />
                            </FormItem>
                        </Col>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="管理岗位" className={layoutItem}>
                                <Input type="text" name="manUuid" id="manUuid" value={this.state.resMember.manName} disabled={true} />
                            </FormItem>
                        </Col>
                    </Row>
                     <Row>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="项目名称" className={layoutItem}>
                                <Input type="text" name="resName" id="resName" value={this.state.resMember.resName} disabled={true} />
                            </FormItem>
                        </Col>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="项目地址" className={layoutItem}>
                                <Input type="text" name="resLoc" id="resLoc" value={this.state.resMember.resLoc} disabled={true} />
                            </FormItem>
                        </Col>
                    </Row>
                     <Row>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="原资源池" className={layoutItem}>
                                <Input type="text" name="poolUuid" id="poolUuid" value={poolName} disabled={true}  />
                            </FormItem>
                        </Col>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="原小组" className={layoutItem}>
                                 <Input type="text" name="poolUuid" id="poolUuid" value={this.getResTeamName(this.state.resMember.poolUuid,this.state.resMember.teamUuid)} disabled={true}  />
                            </FormItem>
                        </Col>
                    </Row>
                     <Row>
                        <Col span="12">
                            <FormItem {...formItemLayout2} label="新资源池" required={true} colon={true} className={layoutItem}  help={hints.poolUuidHint} validateStatus={hints.poolUuidStatus}>
                                <SelectPool ref='poolBox' corpUuid={corpUuid}  name="poolUuid" id="poolUuid" value={this.state.poolUuid} onSelect={this.handleOnSelectedPool}/>
                            </FormItem>
                        </Col>
                        <Col span="12"> 
                            <FormItem {...formItemLayout2} label="新小组" required={true} colon={true} className={layoutItem} help={hints.teamUuidHint} validateStatus={hints.teamUuidStatus}>
                                <SelectResTeam poolUuid={poolUuid}  name="teamUuid" id="teamUuid" value={this.state.teamUuid} onSelect={this.handleOnSelectedTeam}/>
                            </FormItem>
                        </Col>
                     </Row>
                     {dateTimeBox}
                    <FormItem style={{ textAlign: 'right', margin: '4px 0' }} required={false} colon={true} className={layoutItem}>
                        <Button key="btnOK" type="primary" size="large" disabled={boo} onClick={this.onClickSave} loading={this.state.loading}>保存</Button>{' '}
                        <Button key="btnClose" size="large" onClick={this.goBack}>取消</Button>
                    </FormItem>
                </Form>
            </div>
        );
    }
});

export default ChangeResMemberPage;

