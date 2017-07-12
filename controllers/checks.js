var errors = require("bolt-internal-errors");
var models = require("bolt-internal-models");
var utils = require("bolt-internal-utils");

var superagent = require('superagent');

const X_BOLT_APP_TOKEN = 'X-Bolt-App-Token';

module.exports = {
	//checks if file can be read from, and creates the request.fsName field to hold the unique name of the fs object
	forReadAccess: function(request, response, next) {
		var fsPath = request.params[0];
		var fsOwnerType = request.body.ownerType || 'user';

		var ownerName;
		if (fsOwnerType == 'app') ownerName = request.appName;
		else ownerName = request.user.name;

		superagent
			.post(process.env.BOLT_ADDRESS + '/api/db/fs/findone?owner=' + ownerName + '&ownerType=' + fsOwnerType + '&path=' + encodeURIComponent(fsPath))
			.set(X_BOLT_APP_TOKEN, request.bolt.token) //impersonating Bolt
			.send({ app: 'bolt-module-fs' })
			.end(function(err, fs) {
				if (!utils.Misc.isNullOrUndefined(fs)) {

					//allow the owner to pass
					if (ownerName == fs.owner.toLowerCase()) {
						request.fsName = fs.name;
						next();
						return;
					}

					if (!utils.Misc.isNullOrUndefined(fs.tenants)) { //tenants allowed
						if ("*" == fs.tenants) { //every body is allowed
							request.fsName = fs.name;
							next();
							return;
						}
						//there is a tenant list; are u listed?
						else if (fs.tenants.map(function(value){ return value.toLowerCase(); }).indexOf(ownerName) > -1) {
							request.fsName = fs.name;
							next();
							return;
						}
					}

					if (!utils.Misc.isNullOrUndefined(fs.guests)) { //guests allowed
						if ("*" == fs.guests) { //every body is allowed
							request.fsName = fs.name;
							next();
							return;
						}
						//there is a guest list; are u invited?
						else if (fs.guests.map(function(value){ return value.toLowerCase(); }).indexOf(ownerName) > -1) {
							request.fsName = fs.name;
							next();
							return;
						}
					}

					var error = new Error(errors['604']);
					response.end(utils.Misc.createResponse(null, error, 604));
				}
				else {
					response.end(utils.Misc.createResponse(null, err, 603));
				}
			});
	},
	//checks if file can be written to, and creates the request.fsName field to hold the unique name of the fs object
	forWriteAccess: function(request, response, next) {
		var fsPath = request.params[0];
		var fsOwnerType = request.body.ownerType || 'user';

		var ownerName;
		if (fsOwnerType == 'app') ownerName = request.appName;
		else ownerName = request.user.name;

		superagent
			.post(process.env.BOLT_ADDRESS + '/api/db/fs/findone?owner=' + ownerName + '&ownerType=' + fsOwnerType + '&path=' + encodeURIComponent(fsPath))
			.set(X_BOLT_APP_TOKEN, request.bolt.token) //impersonating Bolt
			.send({ app: 'bolt-module-fs' })
			.end(function(err, fs) {
				if (!utils.Misc.isNullOrUndefined(fs)) {

					//allow the owner to pass
					if (ownerName == fs.owner.toLowerCase()) {
						request.fsName = fs.name;
						next();
						return;
					}

					if (!utils.Misc.isNullOrUndefined(fs.tenants)) { //tenants allowed
						if ("*" == fs.tenants) { //every body is allowed
							request.fsName = fs.name;
							next();
							return;
						}
						//there is a tenant list; are u listed?
						else if (fs.tenants.map(function(value){ return value.toLowerCase(); }).indexOf(ownerName) > -1) {
							request.fsName = fs.name;
							next();
							return;
						}
					}

					//no guests allowed

					var error = new Error(errors['604']);
					response.end(utils.Misc.createResponse(null, error, 604));
				}
				else {
					response.end(utils.Misc.createResponse(null, err, 603));
				}
			});
	}
};
