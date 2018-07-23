var express = require('express');
var router = express.Router();
var parser = require('xml2js').parseString
var decompress = require('decompress')
var mongo_client = require('mongodb').MongoClient
var fs = require('fs')

var buildArray = [];
var globalReturn;
var globalBody;
var all_info;
var parsedInfo = [];
var filePath = 'JunitReport.tar.gz'

function importxml(filePath) {
    decompress(filePath, './').then((files)=>{
        var file = files[0].path;
        fs.readFile(file, function (err, data) {
            if (err) {
                console.log(err)
            }
            parser(data, function (err2, result) {
                if (err2) {
                    console.log(err)
                }
                globalReturn = result;
                all_info = globalReturn.testsuites.testsuite[0].testcase;
            })
        })   
    })         
}

importxml(filePath);

function getObject(globalReturn) {
    let date = globalReturn.testsuites.$.date;
    let time_stamp = globalReturn.testsuites.$.time;
    let map = getNumPassAndFailOfEachTest(all_info);
    let device_list = [];
    let body = {};

    for(let key in all_info) {
        let device_name;
        let test_name = '';
        let steps = all_info[key].steps[0].step;
        let parsed_step = [];
        let step_passed = 0;
        let step_failed = 0;
        let time;

        all_info[key].$.name.split('_').map((data, index)=>{
            if(index == 0) {
                device_name = data;
                if(!device_list.includes(device_name))
                    device_list.push(device_name);
            }
            else test_name += data + ' ';
        })
        time = parseFloat(all_info[key].$.time);

        if(checkNullOrUndefined(body[device_name])) {
            body[device_name] = {
                tests: {
                    date: date,
                    timestamp: time_stamp,
                    pass: map[device_name]['pass'],
                    fail: map[device_name]['fail'],
                    time: map[device_name]['time'],
                    testcases: []
                }
            }
        }

        steps.map((data, index)=>{
            if(data.$.status === 'pass') step_passed++;
            else step_failed++;
            parsed_step[index] = {};
            parsed_step[index]['description'] = data.stepname[0] + ':' + data.description[0];
            parsed_step[index]['result'] = data.result[0];
            parsed_step[index]['status'] = data.$.status;
        });

        let status;
        if(step_failed === 0) status = 'Passed';
        else status = 'Failed';
        let single_testcase = {
            name: test_name,
            pass: step_passed,
            fail: step_failed,
            time: time,
            status: status,
            steps: parsed_step
        };

        body[device_name]['tests']['testcases'].push(single_testcase);
    }

    for(let i = 0; i < device_list.length; i++) {
        let key = device_list[i];
        if(!checkNullOrUndefined(globalBody[key])) {
            if(globalBody[key].build == 0) { 
                globalBody[key].tests.push(body[key].tests);
                globalBody[key].build++;           
            } else {
                let buildnumber = globalBody[key].build - 1;
                if(body[key].tests.date == globalBody[key].tests[buildnumber].date && body[key].tests.timestamp == globalBody[key].tests[buildnumber].timestamp) {
                } else {
                    globalBody[key].tests.push(body[key].tests);
                    globalBody[key].build++;
                }
            }
        } else {
            globalBody[key] = {
                build: 0,
                tests: []
            }
            globalBody[key].tests.push(body[key].tests);
            globalBody[key].build++;
        }
    }

    return globalBody;
}

function getInfo(globalReturn) {
    let device_info = {};
    let info;
    let splited_info;
    let name;
    let category;
    let model;
    let os;
    let manufacture;
    let version;
    let canProceed = false;

    all_info.map((data, index)=>{
        data.steps[0].step.map((moreData, innerIndex)=>{
            if(moreData.description[0].includes('Devices Information ')) {
                info = moreData.result[0].split(':')[1];
                splited_info = info.split(' ');
                for(let j = 0; j < splited_info.length; j++) {
                    if(splited_info[j].includes('category')) {
                        category = splited_info[j];
                        category = category.split('=')[1];
                        category = category.substring(1, category.length - 1);
                        canProceed = true;
                    }
                    if(canProceed) {
                        if(splited_info[j].includes('manufacture')) {
                            manufacture = '';
                            while(!splited_info[j].includes('model')) {
                                manufacture += splited_info[j] + ' ';
                                j++;
                            }
                            manufacture = manufacture.split('=')[1].trim();
                            manufacture = manufacture.substring(1, manufacture.length - 1).toUpperCase();
                        }
                        if(splited_info[j].includes('model')) {
                            model = splited_info[j];
                            model = model.split('=')[1];
                            model = model.substring(1, model.length - 1);
                            if(model.includes('samsung')) {
                                model = model.split('-')[1] + model.split('-')[2];
                            } else {
                                if(model.split('-').length > 1)
                                    model = model.split('-')[0] + model.split('-')[1];
                            }
                            model = model.toUpperCase();
                        }
                        if(splited_info[j].includes('name')) {
                            name = '';
                            while(!splited_info[j].includes('os')) {
                                name += splited_info[j] + ' ';
                                j++;
                            }
                            name = name.split('=')[1].trim();
                            name = name.substring(1, name.length - 1)
                        }
                        if(splited_info[j].includes('os')) {
                            os = splited_info[j];
                            os = os.split('=')[1];
                            os = os.substring(1, os.length - 1).toUpperCase();
                        }
                        if(splited_info[j].includes('version=')) {
                            version = splited_info[j];
                            version = version.split('=')[1];
                            version = version.substring(1, version.length - 1);
                        }

                        if(name !== undefined && model !== undefined && category !== undefined && os !== undefined && manufacture !== undefined && version != undefined) {
                            device_info[model] = {
                                category: category,
                                name: name,
                                os: os,
                                manufacture: manufacture,
                                version: version
                            };
                            name = undefined;
                            category = undefined;
                            model = undefined;
                            os = undefined;
                            manufacture = undefined;
                            version = undefined;
                            canProceed = false;
                        }
                    }
                }
            }
        })
    })

    return device_info;
}

function checkNullOrUndefined(something) {
    if(something == null || something == undefined) return true;
    else return false;
}

function getNumPassAndFailOfEachTest(something) {
    let device_map = {};
    let device_name;
    something.map((data, index)=>{
        device_name = data.$.name.split("_")[0];
        if(!(device_name in device_map)) {
            device_map[device_name] = {
                pass: 0,
                fail: 0,
                time: 0
            }
        }    
        if('failure' in data) {
            device_map[device_name]['fail']++;
        } else device_map[device_name]['pass']++;
        device_map[device_name]['time'] += parseFloat(data.$.time);
    })
    return device_map;
}

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// have to implement new small app that hit this url after the test complete! update first!
router.get('/update', function (req, res, next) {
    importxml(filePath);
    res.send('updated');
})

router.get('/', function (req, res, next) {
    res.send(globalReturn)
});

// have to implement new small app that hit this url after the test complete! parsed second!
router.get('/parsed', function (req, res, next) {
    let body;
    // should be changed to url for mongodb in the cloud!
    mongo_client.connect('mongodb://localhost:27017/', { useNewUrlParser: true }, function (err, db) {
        if (err) throw err
        var dbo = db.db("mydb");
        dbo.collection('devices').findOne({}).then((result)=>{
            if(result !== null) {
                globalBody = result;
                dbo.collection('devices').deleteOne(result, function(deleteErr, deleteDoc) {
                    if(deleteErr) throw deleteErr;
                })
            } else globalBody = {};

            body = getObject(globalReturn);

            dbo.collection('devices').insertOne(body, function(insertErr, insertDoc) {
                if(insertErr) throw insertErr;
            })

            res.send(body);
        }).catch((err)=>{
            console.log(err);
        })     
    })
    
})

router.get('/info', function(req, res, next) {
    let info = getInfo(globalReturn);
    // should be changed to url for mongodb in the cloud!
    mongo_client.connect('mongodb://localhost:27017/', { useNewUrlParser: true }, function (err, db) {
        if (err) throw err

        var dbo = db.db("mydb");
        dbo.collection('info').findOne({}, function(findErr, result) {
            if(findErr) throw findErr;
            else {
                if(result == null) {
                    dbo.collection('info').insertOne(info, function(insertErr, insertDoc) {
                        if(insertErr) throw insertErr;
                    })
                    res.send(info);
                } else res.send(result);
            }
        })
    })
    
})


module.exports = router;
