var config = require("bolt-internal-config");
var errors = require("bolt-internal-errors");
var models = require("bolt-internal-models");
var utils = require("bolt-internal-utils");

var fs = require('fs');
var fse = require('fse');
var path = require("path");
var mongodb = require('mongodb');
var superagent = require('superagent');

const X_BOLT_APP_TOKEN = 'X-Bolt-App-Token';

/*
**Impersonating Bolt**
bolt-module-fs registers various collections
bolt-module-fs also lists Bolt (bolt) as a tenant to each of its collection
	meaning bolt has write (and read) access to its collections
when accessing any of those collections, we use bolt's app token (request.appName) instead of the app token for bolt-module-fs
we can use bolt's app token because bolt-module-fs installs (hopefully) as a system app
we have to use bolt's app token because bolt-module-fs can't have an app token of its own since it is a module (see its package.json)
*/

/*
**Schema for request body**
{
	type: String
}
X-Bolt-App-Token

**Schema for an fs object**
{
	owner: String //the apps (if type=app) or users (if type=user) that owns this file
	ownerType: String //values: app|user
	guests: String | [String] //the apps (if type=app) or users (if type=user) that have read access
	tenants: String | [String] //the apps (if type=app) or users (if type=user) that have write access

	dateCreated: Date
	dateDeleted: Date
	displayName: String,
	target: String //the path to the actual file/folder, remote or local
	targetType: remote|local(default)
	name: String
	path: String //full path of the file
	parent: String //name of parent fs
	type: file(default)|folder
	visibility: visible|hidden|deleted
}
*/

module.exports = {
	appendFile: function(request, response){
		superagent
			.post(process.env.BOLT_ADDRESS + '/api/db/fs/findone?name=' + request.fsName + '&type=file')
			.set(X_BOLT_APP_TOKEN, request.bolt.token) //see **Impersonating Bolt** above to understand this line
			.send({ app: 'bolt-module-fs' })
			.end(function(err, fsObj) {
				if (!utils.Misc.isNullOrUndefined(fsObj)) {
					if (fsObj.targetType == 'local') {
						var staticPath = 'fs/';

						if (fsObj.ownerType == 'app') staticPath += 'apps/';
						else staticPath += 'users/';

						staticPath += fsObj.owner + '/' + fsObj.target;

						fs.appendFile(staticPath, response.body.data || '', response.body.options || 'utf8', (e) => {
							if (!utils.Misc.isNullOrUndefined(e)) {
								response.end(utils.Misc.createResponse(null, err, 612));
							}
							else {
								fsObj = utils.Misc.sanitizeModel(fsObj, ['__v', 'target']);
								utils.Events.fire('file-changed', 
									{ 
										body: { action: 'append', data: response.body.data || '', fs: fsObj } 
									}, 
									request.bolt.token, function(eventError, eventResponse){});
								response.send(utils.Misc.createResponse(fsObj));
							}
						});
					}
					else {
						//remote files not yet supported
						response.end(utils.Misc.createResponse(null, err, 603));
					}
				}
				else {
					response.end(utils.Misc.createResponse(null, err, 603));
				}
			});
	},
	readAccess: function(request, response){
		superagent
			.post(process.env.BOLT_ADDRESS + '/api/db/fs/findone?name=' + request.fsName + '&type=file')
			.set(X_BOLT_APP_TOKEN, request.bolt.token) //see **Impersonating Bolt** above to understand this line
			.send({ app: 'bolt-module-fs' })
			.end(function(err, fsObj) {
				if (!utils.Misc.isNullOrUndefined(fsObj)) {
					fsObj = utils.Misc.sanitizeModel(fsObj, ['__v', 'target']);
					response.send(utils.Misc.createResponse(fsObj));
				}
				else {
					response.end(utils.Misc.createResponse(null, err, 603));
				}
			});
	},
	writeAccess: function(request, response){
		superagent
			.post(process.env.BOLT_ADDRESS + '/api/db/fs/findone?name=' + request.fsName + '&type=file')
			.set(X_BOLT_APP_TOKEN, request.bolt.token) //see **Impersonating Bolt** above to understand this line
			.send({ app: 'bolt-module-fs' })
			.end(function(err, fsObj) {
				if (!utils.Misc.isNullOrUndefined(fsObj)) {
					fsObj = utils.Misc.sanitizeModel(fsObj, ['__v', 'target']);
					response.send(utils.Misc.createResponse(fsObj));
				}
				else {
					response.end(utils.Misc.createResponse(null, err, 603));
				}
			});
	}
};
