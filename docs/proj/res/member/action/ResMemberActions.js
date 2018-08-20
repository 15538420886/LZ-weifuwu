var Reflux = require('reflux');

var ResMemberActions = Reflux.createActions([
	'createResMember',
	'deleteResMember',
    'updateResMember',
    'updateResMember2',     // �����Դ��
	'retrieveResMember',
	'retrieveEmpJob',
	'retrieveResMemberPage',
	'initResMember',
	'clearResMember',
	'batchCreateResMember',
]);

module.exports = ResMemberActions;