var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var path = require('path');
var mongodb = require('mongodb');
var assert = require('assert');
var busboy = require('express-busboy');
//var ObjectId=mongodb.

var server = new mongodb.Server('127.0.0.1',27017,{});
var client = new mongodb.Db('SyrahDB',server,{});

//var client_db = new mongodb.Db('testing',server,{});

var app=express();
busboy.extend(app,{
  upload:true,
  path:'./upload/files'
});

//app.use(bodyParser());
app.set('port',process.env.PORT || 3000);
app.listen(app.get('port'),function(){
  console.log('Server started on http://localhost:3000');
});


//GET routing
app.get('/',function(req,res){
  console.log(req.url);
  res.type('text/html');
  res.sendFile(__dirname+'/public/log_in.html');
});

app.get('/about',function(req,res){
  console.log(req.url);
  res.type('text/plain');
  res.send('Syrah!!!');
});

app.get('/home',function(req,res){
  console.log(req.url);

  //check whether user has loged in
  client.open(function(err){
    if(err) console.log(err);
    client.collection('users',function(err,collection){
      collection.find().toArray(function(err,results){
        console.log(results);
        if(err) {
          console.log(err);
        }
        else{
          if(results[0].active){
            res.type('text/html');
            res.sendFile(__dirname+'/public/home.html');
          }
          else{
            res.type('text/palin');
            res.send('Please log in FIRST!');
          }
        }
        client.close();
      });
    });
  });



  //res.type('text/html');
  //res.sendFile(__dirname+'/public/home.html');
});

app.get('/search/getFile',function(req,res){
  console.log(req.url);
  console.log('search time sent');
  res.send('<ul>'
  + '<li>Click file name to download: <a href="/down/down.ADI">Download.adi</a>.</li>'
  + '</ul>');
});

app.get('*.*', function(req, res) {
  var realpath = __dirname + req.url;
  console.log(realpath);
  res.sendFile(realpath);
});


//POST routing
app.post('/share',function(req,res){
	console.log(req.url);
	console.log(req.body);

});


app.post('/login',function(req,res){
  console.log(req.url);
  //console.log(req.body);  //get the JSON data

  //deal with data
  var flag=false;
  client.open(function(err){
    if (err) console.log(err);

    client.collection('users',function(err,collection){
        if (err) console.log(err);
        console.log('[GreysTone-DB>users]');
        collection.find({userName:req.body.username}).toArray(function(err,results){
            console.log(results);
          if (err) {
              res.json({succ: false});
              console.log(err);
          }else {
              if(results.length==0) {res.json({succ: false});}
              else {
                  console.log("CORRECT>" + results[0].userPass);
                  console.log("USER--->" + req.body.pwd);
                  if(results[0].userPass==req.body.pwd) {
                      flag = true;
                      console.log('[SUCC]Identity Verified!');

                      //activate user
                      collection.update(
                      {'userName':req.body.username},
                    {'$set':{'active':true}},
                    function(err){
                      if(err)
                        console.log(err);
                        else{
                          console.log('update successfully');
                        }
                        client.close();
                      }
                    );
                    //end of activating user


                  }
                  else {
                      console.log('[ERR]Wrong Password!');
                  }

                  res.json({
                    succ: flag,
                    _id: results[0]._id
                  });
              }
          }
          client.close();
        });
    });
  });
});

/*
app.post('/logout',function(req,res) {
    var flag=true;

    client.open(function(err){
      if(err) console.log(err);
      client.collection('users',function(err){
        if(err) console.log(err);
        collection.update({},{$set:{active:false}});

      });
    });
    res.json({
        succ:flag
    });
});
*/

app.post('/update/preCol',function(req,res){
  console.log(req.url);
  console.log(req.body);
  var flag = false;

  console.log(typeof(req.body.contentx));
  console.log("=========");



  fs.writeFile(__dirname+'/upload/presetCol/pre.col', req.body.contentx, function(err) {
      if (err) throw err;
      console.log('[SUCC]presetCol Saved');
      flag = true;
  });

  res.json({ succ: flag });
});

app.post('/getPreCol',function(req,res){
  console.log(req.url);
  console.log(req.body);
  var flag = false;

  var rs = fs.createReadStream(__dirname+'/upload/presetCol/pre.col');
  var arr = '';
  rs.on("data", function (trunk){
    arr += trunk;
  });
  rs.on("end", function () {
    console.log(arr);
    //var back =   arr.split(',');

    //console.log(back);

    res.json(JSON.parse(arr));
    //res.json(back);
    res.end();
  });



});

app.post('/addEntry',function(req,res){
  console.log(req.url);
  console.log(req.body);

  var _JS_IN_=req.body;

  //------------------------------------------
  //add date

  delete _JS_IN_.request;
  //_JS_IN_.id = (GENERATE ID - from MongoDB Driver);  //Add id
  var d = new Date();
  console.log('date:'+d);

  var uMonth = d.getMonth()+1;
  if(uMonth<10)
    uMonth='0'+uMonth.toString();
  else
    uMonth=uMonth.toString();

  var uDate=d.getDate();
  if(uDate<10)
    uDate="0"+uDate.toString();
  else
    uDate=uDate.toString();

  var uHours=d.getHours();
  if(uHours<10)
    uHours="0"+uHours.toString();
  else
    uHours=uHours.toString();

  var uMinutes=d.getMinutes();
  if(uMinutes<10)
    uMinutes="0"+uMinutes.toString();
  else
    uMinutes=uMinutes.toString();

  var uSeconds=d.getSeconds();
  if(uSeconds<10)
    uSeconds="0"+uSeconds.toString();
  else
    uSeconds=uSeconds.toString();

  _JS_IN_.date = d.getFullYear().toString()+uMonth+uDate+uHours+uMinutes+uSeconds;
  _JS_IN_.date = parseInt(_JS_IN_.date);
  console.log('date::::::\n'+_JS_IN_.date);
  _JS_IN_.valid = 1;                    //New data is valid
  //------------------------------------------
  //insert into db
  var flag=true;
  client.open(function(err){
    if (err) {
      console.log(err);
      flag=false;
    }
    client.collection('log',function(err,collection){
      if (err) {
        console.log(err);
        flag=false;
      }
      console.log('We are now able to perform queries.\n');
      collection.insert(_JS_IN_,function(err){
        if (err){
          console.log(err);
          flag=false;
        }
        else console.log("insert successfully.\n");

        res.json({success:flag});
        client.close();
      });
    });
  });
  //------------------------------------------
  //res.json({ success: flag });
});

app.post('/query',function(req,res){
  console.log(req.url);
  console.log(req.body);
  //deal with data
  //find operation
  var query=req.body.query;
  var projection=req.body.projection;
  var page=req.body.page;
  var num=req.body.num;


  if(query.date!=undefined){
    query.date.$gt=parseInt(query.date.$gt);
    query.date.$lt=parseInt(query.date.$lt);
  }
  console.log(query.date);

  //console.log(projection);

  //query.valid=parseInt(query.valid);
  query.valid=1;
  //console.log("query: ");
  //console.log(query);
  page=parseInt(page);
  num=parseInt(num);
  var flag=false;
  console.log("query:\n"+query);
  client.open(function(err){
    if (err) console.log(err);
    client.collection('log',function(err,collection){
      if (err) console.log(err);
      console.log('Querying:We are now able to perform queries.\n');
      collection.find(query,projection).toArray(function(err,results){
        if (err) console.log(err);
        console.log('1111111111111');
        console.log(results.length);
        flag=true;
        //_DB_STORE_ = results;

        console.log("it is fine_________________________________");

        var _DB_STORE_=[];
        for(var i=20*(page-1),j=0;i<results.length&&j<20;i++,j++){
          _DB_STORE_[_DB_STORE_.length]=results[i];

        }
        console.log(_DB_STORE_);
        res.json({
            info:_DB_STORE_,
            total:results.length
          });

        //res.json(results);

        client.close();
      });
    });
  });
});

app.post('/home/delete',function(req,res){
  console.log(req.url);
  console.log(req.body);
  console.log(req.body._id);
  //deal with data
  var ObjectID=mongodb.ObjectID;
  //var o_id=new BSON.ObjectID(req.body._id);
  console.log('shit');
  client.open(function(err){
    if (err) console.log(err);
    client.collection('log',function(err,collection){
      if (err) console.log(err);
      console.log('Deleting:We are now able to perform queries.\n');
      collection.update({'_id':new ObjectID(req.body._id)},{$set:{'valid':0}},function(err){
        if (err) console.log(err);
        client.close();
        res.json({succ:true});
      });
    });
  });

  //res.json({ success: 'bool' });
});

app.post('/home/update',function(req,res){
  console.log(req.url);
  console.log(req.body);
  //deal with data
  var ObjectID=mongodb.ObjectID;

  //var _JS_UP_ = req.body.query;

  client.open(function(err){
    if (err) console.log(err);
    client.collection('log',function(err,collection){
      if (err) console.log(err);
      console.log('We are now able to perform queries.\n');
      collection.update(
        {_id: new ObjectID(req.body._id)},
        {$set:req.body.query},
        function(err){
          if (err) console.log(err);
          client.close();
          res.json({succ:true});
        });
      });
    });

  //res.json({ success: 'bool' });
});

function InsertIntoDB(i,queryTemp){

  if(i*1000>=queryTemp.length){
    console.log('Insertion Complete');
    client.close();
    return;
  }

  console.log(i);
  //console.log(queryTemp);
  var _DB_IN_=new Array();
  for(var j=0;j<1000&&(i*1000+j<queryTemp.length);j++)
    _DB_IN_[_DB_IN_.length]=queryTemp[i*1000+j];

  console.log(_DB_IN_);

  client.collection('log',function(err,collection){
    if (err) {
        console.log(err);
      }
    console.log('We are now able to perform queries.\n');
    collection.insert(_DB_IN_,function(err){

      //client.close();
    if (err){
      console.log(err);
      flag=false;
    }
    else {
    console.log("insert successfully.\n");

    InsertIntoDB(i+1,queryTemp);

    }
    });

  });
}

app.post('/importFile', function(req, res){
  console.log(req.url);
  //deal with data
  console.log(req.files);
  var path = req.files.upfile.file;
  console.log("path: "+path);
  fs.readFile(path, function(err, data) {
    console.log("shitshitshit");
    if(err) {
      console.log(err);
    } else {
      console.log(path);
      console.log("********************");
      console.log(data);
      console.log("********************");

      var dataStr = data.toString().split(/\<|\>|\r\n/);
      console.log(typeof(dataStr));
      console.log("==========================");
      console.log(dataStr);
      console.log("********************");

      console.log("READ FILE SYNC END");
      res.end();
      var tempHead = new Array();
      var tempCont = new Array();
      var trimmedData = new Array();
      var flag1 = 0;
      var flag2 = 0;

      for(var i = 0; i<dataStr.length; i++) {
        trimmedData[i] = dataStr[i].replace(/(^\s*)|(\s*$)/g,"");
      }
      var trimmedStr = trimmedData.toString();
      console.log(trimmedStr);
      var begin = trimmedData.indexOf("EOH");
      console.log(begin);

      var queryTemp = "[";
      for(var i = begin+1; i<trimmedData.length;i++) {
        if(trimmedData[i]!='EOR') {
          if(trimmedData[i]!=""&&trimmedData[i]!=undefined) {
            if(trimmedData[i].indexOf(':')!=-1) {
              tempHead[flag1++] = trimmedData[i].substring (0, trimmedData[i].indexOf(':') );
            } else {
              tempCont[flag2++] = trimmedData[i];
            }
          }
        } else {
          queryTemp = queryTemp.concat("{");
          for(var j = 0; j < tempHead.length;j++) {
            queryTemp = queryTemp.concat("\"").concat(tempHead[j]).concat("\"").concat("\:");
            queryTemp = queryTemp.concat("\"").concat(tempCont[j]).concat("\"");
            if(j != tempHead.length - 1) queryTemp = queryTemp.concat("\,");
          }


          var d = new Date();
          //console.log('date:'+d);

          var uMonth = d.getMonth()+1;
          if(uMonth<10)
            uMonth='0'+uMonth.toString();
            else
              uMonth=uMonth.toString();

              var uDate=d.getDate();
              if(uDate<10)
                uDate="0"+uDate.toString();
                else
                  uDate=uDate.toString();

                  var uHours=d.getHours();
                  if(uHours<10)
                    uHours="0"+uHours.toString();
                    else
                      uHours=uHours.toString();

                      var uMinutes=d.getMinutes();
                      if(uMinutes<10)
                        uMinutes="0"+uMinutes.toString();
                        else
                          uMinutes=uMinutes.toString();

                          var uSeconds=d.getSeconds();
                          if(uSeconds<10)
                            uSeconds="0"+uSeconds.toString();
                            else
                              uSeconds=uSeconds.toString();

                              date = d.getFullYear().toString()+uMonth+uDate+uHours+uMinutes+uSeconds;

          queryTemp = queryTemp.concat(",\"date\": ");
          queryTemp = queryTemp.concat(date);
          queryTemp = queryTemp.concat(",\"valid\":");
          queryTemp = queryTemp.concat("1");

          queryTemp = queryTemp.concat("}\,");
          tempHead = new Array();
          tempCont = new Array();
          flag1 = 0;
          flag2 = 0;
        }
      }
      queryTemp = queryTemp.substring(0, queryTemp.length-1);
      queryTemp = queryTemp.concat("]");
      console.log('********************');
      console.log(queryTemp);
      console.log('********************');
    }

    //insert into DB

    var Temp_in=JSON.parse(queryTemp);
    client.open(function(err){
      if (err) {
        console.log(err);
      }
      InsertIntoDB(0,Temp_in);
    });

  });
});

app.post('/exportFile',function(req,res){
  console.log(req.url);
  console.log(req.body);

  var query=req.body.query;

 if(query.date!=undefined){
    query.date.$gt=parseInt(query.date.$gt);
    query.date.$lt=parseInt(query.date.$lt);
  }

  console.log(query);

  console.log('^^^^^^^^^^^^^');
  console.log(query);
  console.log('^^^^^^^^^^^^^');
  var flag=false;
  console.log("query:\n"+query);
  client.open(function(err){
    if (err) console.log(err);
    client.collection('log',function(err,collection){
      if (err) console.log(err);
      console.log('We are now able to perform queries.\n');
      collection.find(query).toArray(function(err,results){
        if (err) console.log(err);
        console.log("*****")
        //  console.log(results);
        var jsontemp = JSON.stringify(results);
        var jsontemp2 = jsontemp.split(/\,|\[|\]|\{|\}/);
        console.log(jsontemp2);

        console.log("--------");
        var tempHead = new Array();
        var tempContent = new Array();
        var flag1 = 0;
        var flag2 = 0;
        //----------------------------
        //MAKE UP THE FILE TO BE DOWNLOADED
        for(var k = 0; k < jsontemp2.length; k++) {
          if(jsontemp2[k] != "") {
            var temp = jsontemp2[k].split(/\:|\"/);
            console.log(temp);

            var iii = 0;
            for(var m = 0; m < temp.length; m++) {
              if(temp[m]!="" && iii == 0){
                tempHead[flag1++] = temp[m];
                iii = 1;
              } else if (temp[m]!="" && iii == 1) {
                tempContent[flag2++] = temp[m];
                iii = 0;
              }
            }
          }
        }
        console.log("$$$$$$$$$");
        console.log(tempHead);
        console.log(tempContent);
        console.log("$$$$$$$$$");

        var tempResult = "This file is created by SyrahData.\n"
        var tempResult = "Copyright(C) 2013-2015 NO Sleepless Nights! Group. All rights reserved.\n"
        tempResult = tempResult.concat("\n\<EOH\>\n");

        for(var n = 0; n < tempHead.length; n++) {
          if(tempHead[n] == "_id" || tempHead[n] == "date"){
          } else if(tempHead[n] == "valid") {
            tempResult = tempResult.concat("\<EOR\>\n");
          } else {
            tempResult = tempResult.concat("\<").concat(tempHead[n]).concat(":").concat(tempContent[n].length).concat("\>");
            tempResult = tempResult.concat(tempContent[n]);
          }

        }

        console.log("$$$$$$$$$$$$$")
        console.log(tempResult);
        console.log("#############");

        fs.writeFile(__dirname+'/down/down.ADI', tempResult, function(err) {
          if(err) {
            console.log(err);
            throw err;
          }
          res.json({ success: 'true' });
          console.log('Finished!');
        });

        //FILE STORE FINISHED-----------------------------


        /*res.download(__dirname + '/down/down.ADI','record_download.ADI',function(){
          console.log('file sent');
          return;
        });*/



        console.log('1111111');

      });
    });
  });
});

//error handler

app.use(function(req,res){
  console.log(req.url);
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function(err,req,res,next){
  res.type('text/plain');
  res.status(500);
  res.send('500-Server Error');
});
