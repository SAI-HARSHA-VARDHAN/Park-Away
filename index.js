var http=require('http');
var express=require('express');
var bodyparser=require('body-parser');
var MongoClient=require('mongodb').MongoClient;
var urlencoded=bodyparser.urlencoded({extended:true});
ObjectId = require('mongodb').ObjectId;
fs = require('fs-extra');
multer = require('multer');
util = require('util');
upload = multer({limits: {fileSize: 2000000 },dest:'/uploads/'});
var port = process.env.PORT || 3000;

var app=express();
app.set('view engine', 'ejs');
app.set("views",__dirname);

var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/'+'main.html');
})

app.get('/signup',function(req,res){
    res.sendFile(__dirname+'/'+'signup.html');
})

app.get('/login',function(req,res){
    res.sendFile(__dirname+'/'+'login.html');
})

// app.post('/adduser',urlencoded,upload.single('picture'),function(req,res){
//     if (req.file == null) {
//                 res.send("No file");
//     }
//     else{
//         var email=req.body.email;
//         query={email:email};
//         MongoClient.connect('mongodb://127.0.0.1:27017',{ useNewUrlParser: true },function(err,db){
//                 if(err) throw err;
//                 var db=db.db('hackdb');
//                 db.collection('users').find(query).toArray(function(err,result){
//                 if(result[0]){
//                     res.sendFile(__dirname+"/already.html");
//                 }
//                 else{
//                         var newImg = fs.readFileSync(req.file.path);
//                         var encImg = newImg.toString('base64');
//                         var newItem = {
//                             name: req.body.name,
//                             email: req.body.email,
//                             mobile: req.body.mobile,
//                             password: req.body.password,
//                             contentType: req.file.mimetype,
//                             size: req.file.size,
//                             img: Buffer(encImg, 'base64')
//                         };
//                         db.collection('users').insert(newItem, function(err, result){
//                         if (err) { console.log(err); };
//                             var newoid = new ObjectId(result.ops[0]._id);
//                             fs.remove(req.file.path, function(err) {
//                                 if (err) { console.log(err) };
//                                 res.send("inserted");
//                                 });
//                             });
//                     }
//                 }); 
//             });  
//     }
// })
app.post('/adduser',urlencoded,function(req,res){
        var email=req.body.email;
        query={email:email};
        MongoClient.connect('mongodb://127.0.0.1:27017',{ useNewUrlParser: true },function(err,db){
                if(err) throw err;
                var db=db.db('hackdb');
                db.collection('users').find(query).toArray(function(err,result){
                if(result[0]){
                    res.sendFile(__dirname+"/already.html");
                }
                else{
                            newItem={
                            name: req.body.name,
                            mobile: req.body.number,
                            password: req.body.password,
                            email:req.body.email,
                            aadhar:req.body.aadhar,
                            liscence:"",
                            image:""
                            }
                        db.collection('users').insert(newItem, function(err, result){
                        if (err) { console.log(err); };
                                 res.sendFile(__dirname+"/login.html");
                            });
                    }
                }); 
    });  
 });  

app.post('/validateuser',urlencoded,function(req,res){
    var a=req.body.email;
    var b=req.body.password;   
    var lat=req.body.lat;
    var lon=req.body.lon;
        MongoClient.connect('mongodb://127.0.0.1:27017',function(err,db){
        if(err) throw err;
        var db=db.db('hackdb');
        query={email:a};
        // var details=[];
        // db.collection('users').find().toArray(function(err,result){
        //     Array.prototype.push.apply(details,result);
        // });
        details={email:a,lat:lat,lon:lon};
        db.collection('users').find(query).toArray(function(err,result){
            if(err) throw err;
            if (result[0]){
                if(result[0].password==b){
                    res.render('category',details);
            }
                else{
                res.sendFile(__dirname+"/incorrectpswd.html");
                }
            }
            else{
                res.sendFile(__dirname+"/doregister.html");
            }
        });
    });
})

app.post('/asuser',urlencoded,function(req,res){
    var email=req.body.email;
    var lat=req.body.lat;
    var lon=req.body.lon;
    var curr=[];
    var all=[];
        MongoClient.connect('mongodb://127.0.0.1:27017',function(err,db){
        if(err) throw err;
        var db=db.db('hackdb');
        query={email:email};
        details={lat:lat,lon:lon,email:email};
        db.collection('users').find().toArray(function(err,result){
            Array.prototype.push.apply(all,result);
                db.collection('users').find(query).toArray(function(err,result){
                if(err) throw err;
                if(result[0].liscence==''){
                    lat1=lat;
                    lon1=lon;
                db.collection('providers').find().toArray(function(err,result){
                for(var i=0;i<result.length;i++){
                        lat2=result[i].lat;
                        lon2=result[i].lon;
                        var unit='K';
                    if ((lat1 == lat2) && (lon1 == lon2)) {
                        result[i].distance=0;
                    }
                    else {
                    var radlat1 = Math.PI * lat1/180;
                    var radlat2 = Math.PI * lat2/180;
                    var theta = lon1-lon2;
                    var radtheta = Math.PI * theta/180;
                    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                    if (dist > 1) {
                        dist = 1;
                    }
                    dist = Math.acos(dist);
                    dist = dist * 180/Math.PI;
                    dist = dist * 60 * 1.1515;
                    if (unit=="K") { dist = dist * 1.609344 }
                    if (unit=="N") { dist = dist * 0.8684 }
                    result[i].distance=Math.round(dist);
                }
            }
                for(var i=0;i<result.length;i++){
                    for(var j=0;j<result.length-1;j++){
                        if(result[j].distance>result[j+1].distance){
                            var t=result[j];
                            result[j]=result[j+1];
                            result[j+1]=t;
                        }
                    }
                }
                lat1=result[0].lat;
                lon1=result[0].lon;
                email=result[0].email;
                    res.render('dispuser',{email:email,lat:lat,lon:lon,lat1:lat1,lon1:lon1});
            });
                }
                else{
                    res.render('reguser',{email:email,lat:lat,lon:lon});
                }
            });  
        });
    });
})

app.post('/reguser',urlencoded,function(req,res){
                            var email=req.body.email;
                            var lon=req.body.lon;
                            var lat=req.body.lat;
                            query={email:email};
                            MongoClient.connect('mongodb://127.0.0.1:27017',function(err,db){
                            if(err) throw err;
                            var db=db.db('hackdb');
                     db.collection('users').find(query).toArray(function(err,result1){
                        var name=result1[0].name;
                        var mobile=result1[0].mobile;
                        newItem={
                            name:name,
                            email:email,
                            mobile:mobile,
                            lat:lat,
                            lon:lon,
                        }
                        lat1=lat;
                        lon1=lon;
                db.collection('providers').find().toArray(function(err,result){
                for(var i=0;i<result.length;i++){
                        lat2=result[i].lat;
                        lon2=result[i].lon;
                        var unit='K';
                    if ((lat1 == lat2) && (lon1 == lon2)) {
                        result[i].distance=0;
                    }
                    else {
                    var radlat1 = Math.PI * lat1/180;
                    var radlat2 = Math.PI * lat2/180;
                    var theta = lon1-lon2;
                    var radtheta = Math.PI * theta/180;
                    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                    if (dist > 1) {
                        dist = 1;
                    }
                    dist = Math.acos(dist);
                    dist = dist * 180/Math.PI;
                    dist = dist * 60 * 1.1515;
                    if (unit=="K") { dist = dist * 1.609344 }
                    if (unit=="N") { dist = dist * 0.8684 }
                    result[i].distance=Math.round(dist);
                }
            }
                for(var i=0;i<result.length;i++){
                    for(var j=0;j<result.length-1;j++){
                        if(result[j].distance>result[j+1].distance){
                            var t=result[j];
                            result[j]=result[j+1];
                            result[j+1]=t;
                        }
                    }
                }
                lat1=result[0].lat;
                lon1=result[0].lon;
                var email=result[0].email;
                    res.render('dispuser',{email:email,lat:lat,lon:lon,lat1:lat1,lon1:lon1});
            });
                 });
                });
            })

app.post('/asprovider',upload.single('picture'),urlencoded,function(req,res){
    var email=req.body.email;
    var lat=req.body.lat;
    var lon=req.body.lon;
    var curr=[];
        MongoClient.connect('mongodb://127.0.0.1:27017',function(err,db){
        if(err) throw err;
        var db=db.db('hackdb');
        query={email:email};
                db.collection('providers').find(query).toArray(function(err,result){
                if(err) throw err;
                if(result[0]){
                    curr=result[0];
                    res.render('dispprovider',{details:curr});
                }
                else{
                   res.render('regprovider',{email:email,lat:lat,lon:lon});
                }
            });
    });
})



app.post('/regprovider',upload.single('picture'),urlencoded,function(req,res){
                            var email=req.body.email;
                            var lon=req.body.lon;
                            var lat=req.body.lat;
                            var initial=0;
                            var book=[];
                            var newImg = fs.readFileSync(req.file.path);
                            var encImg = newImg.toString('base64');
                            var type =req.file.mimetype;
                            var size = req.file.size;
                            var img =  Buffer(encImg, 'base64');
                            query={email:email};
                            MongoClient.connect('mongodb://127.0.0.1:27017',function(err,db){
                            if(err) throw err;
                            var db=db.db('hackdb');
                     db.collection('users').find(query).toArray(function(err,result){
                        var name=result[0].name;
                        var mobile=result[0].mobile;
                        newItem={
                            name:name,
                            email:email,
                            mobile:mobile,
                            lat:lat,
                            lon:lon,
                            type:type,
                            size:size,
                            img:img,
                            earnings:initial,
                            bookings:book
                        }
                        db.collection('providers').insert(newItem, function(err, result){
                            var curr=result[0];
                        if (err) { console.log(err); };
                                 res.render('dispprovider',{details:curr});
                        });
                 });
                });
            })

app.post('/book',urlencoded,function(req,res){
    var email = req.body.email;
    res.render('confirm',{email:email});
})

app.post('/back',urlencoded,function(req,res){
    res.sendFile(__dirname+"/login.html");
})

app.post('/final',urlencoded,function(req,res){
    var email = req.body.email;
    var earn = req.body.earn;
    MongoClient.connect('mongodb://127.0.0.1:27017',function(err,db){
        if(err) throw err;
        var db=db.db('hackdb');
        var book=[],f=0;
        query={email:email};
        db.collection('providers').find(query).toArray(function(err,result){
            if(err) throw err;
            Array.prototype.push.apply(book,result[0].bookings);
            var n =Number(result[0].earnings)+Number(earn);
            var today = new Date();  
            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            var de = {date:date,earn:earn};
            for(i=0;i<book.length;i++){
                if(de.date==book[i].date){
                    book[i].earn=Number(book[i].earn)+Number(earn);
                    f=1;
                    break;
                }
            }
            if(f==0){
                book.push(de);
            }
            myquery={email:email};
              var newvalues = { $set: {earnings: n, bookings: book } };
             db.collection("providers").updateOne(myquery, newvalues , function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
            });
            res.render('final',{final:result});
        });
    });
})

app.listen(port);