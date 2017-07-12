var checksCtrlr = require("bolt-internal-checks");
var fsChecksCtrlr = require("../controllers/checks");

var express = require('express');

var apiFsCtrlr = require('../controllers/api-fs');

var router = express.Router();

//post: /link-temp/* 
//gets a temporary link to a file (doesn't work for folders)
//u can then use the link as the src of an img or href of an anchor tag...
//file (what of shortcut to file) is copied to public/bolt/temp/
//temp files are deleted when Bolt starts up, when apps that requested them close, when u POST: /unlink-temp/
/*
watches an fs for changes, and raises an event when such change occurs...u can listen for that event
it returns an ID to the watcher object so u can further manipulate it
*/
//router.post('/watch', apiFsCtrlr.watch);
/*
you pass in the ID of the watcher u want to close
*/
//router.post('/watcher/close', apiFsCtrlr.watcherClose);

/*
Append data to a file, creating the file if it doesn't yet exist.
'data' can be a string or a buffer
*/
router.post('/append/*', checksCtrlr.getAppName, checksCtrlr.forLoggedInUser, fsChecksCtrlr.forWriteAccess, apiFsCtrlr.appendFile);
router.post('/append-file/*', checksCtrlr.getAppName, checksCtrlr.forLoggedInUser, fsChecksCtrlr.forWriteAccess, apiFsCtrlr.appendFile);

//Checks to see if read access to the file exists
router.post('/read-access/*', checksCtrlr.getAppName, checksCtrlr.forLoggedInUser, fsChecksCtrlr.forReadAccess, apiFsCtrlr.readAccess);

//Checks to see if write access to the file exists
router.post('/write-access/*', checksCtrlr.getAppName, checksCtrlr.forLoggedInUser, fsChecksCtrlr.forWriteAccess, apiFsCtrlr.writeAccess);

module.exports = router;