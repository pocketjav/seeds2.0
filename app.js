const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const mysql = require('mysql');
const cookieParser = require('cookie-parser');

const utils = require('./private/utils');
// test
const testUser = require('./test/json/test-user.json');
const testUserYard = require('./test/json/test-user-yards.json');

// mysql
let connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "seedstest"
});
// EJS engine
app.set('view engine', 'ejs');
// ACCESS TO PUBLIC DATA
app.use(express.static('public'));
// ACCESS TO BROWSER COOKIES
app.use(cookieParser());

// bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


// session validation
app.all('*', (req, res, next) => {

    // LOGIN
    let isLogged = req.cookies.isLogged;
    let isLoggedSat = req.cookies.izloggedzat;

    if ( isLogged === 'true' ) {
        connection.query("select SU_name, SU_last_name from seeds_users where SA_token = '"+isLoggedSat+"';", function (error, results, fields) {
            if (error) {
                res.json({success:'false', message:'Server error'});
                throw error;
            }

            if(results.length===1){
                console.log('User exists, login success');
                if(req.path === '/login'){
                    res.redirect('/');
                } else {
                    next();
                }
            }
            else {
                console.log('User DON`T exists, login FAILED');
                res.render('pages/login');
            }
        });

    } else if(req.path === '/loginrequest' || req.path === '/signup'){
        next();
    } else{
        res.render('pages/login');
    }
});

// LOGIN
app.get('/login', (req, res)=>{
    console.log('login page');
    res.render('pages/login');
});

app.post('/loginrequest',upload.array(), (req, res) => {
    // let reqFull = req.body;
    let reqEmail = req.body.email;
    let reqPass = req.body.pass;

    connection.query("select SA_token from seeds_accounts where SA_email = '"+reqEmail+"' and SA_pass = '"+reqPass+"';", function (error, results, fields) {
        if (error) {
            res.json({success:'false', message:'Server error'});
            throw error;
        }
        // user = results[1];
        // userName = user.user_first_name;

        console.log('Results: ',results);

        console.log('Results length: ',results.length);

        if(results.length===1){
            /**
             * TODO POST the current date on success
             *
             * if the login is successful, insert the current date
             * into SEEDS_SESSION table
             *
             */
            res.json({success:'true', sat:results[0].SA_token});
        }
        else {
            res.json({success:'false', message:'Wrong email or password'});
        }

    });

});

// SIGNUP
app.post('/signup', upload.array(), (req, res) =>{
    let newUserCredentials = req.body;
    let newUserToken =' ';
    console.log('new user credentials', newUserCredentials);

    connection.query("select SA_id from seeds_accounts ORDER BY SA_id DESC LIMIT 1;", function (error, results, fields) {
        if (error) {
            res.json({success:'false', message:'Server error'});
            throw error;
        }
        let lastId = results[0].SA_id;

        console.log('last id: ', lastId, typeof lastId);

        newUserToken = utils.enconde64('SE'+(lastId+1)+'ED'+newUserCredentials.email);

        console.log('new user token: ', newUserToken);

        connection.query("INSERT INTO seeds_accounts (SA_token, SA_email, SA_pass, SA_date_created)\n" +
            "VALUES ('"+newUserToken+"', '"+newUserCredentials.email+"','"+newUserCredentials.password+"', '"+newUserCredentials.date+"');", function (q2_error, q2_results, q2_fields) {
            if (q2_error) {
                res.json({success:'false', message:'Server error'});
                throw q2_error;
            }
            console.log('new account done');

            connection.query("INSERT INTO seeds_users (SA_token, SU_name, SU_last_name)\n" +
                "VALUES ('"+newUserToken+"', 'New User', '');", function (q3_error, q3_results, q3_fields) {
                if (q3_error) {
                    res.json({success:'false', message:'Server error'});
                    throw q3_error;
                }
                console.log('new user done');
                res.status(200).json({success:'true',message:'new user created'});
            });

        });



    });


});
// HOMEPAGE
app.get('/', (req, res) =>{

    let userTkn = req.cookies.izloggedzat;
    let user = {},
        userName = '',
        yards = [];

    console.log('tok', userTkn);

    connection.query("SELECT users.SU_name, users.SU_last_name, yards.SY_name, yards.SY_type \n" +
        "FROM seeds_users AS users \n" +
        "INNER JOIN seeds_yards AS yards \n" +
        "ON users.SA_token = yards.SA_token\n" +
        "WHERE users.SA_token='"+userTkn+"';", function (error, results, fields) {
        if (error) {
            throw error;
        }
        console.log(results);

        if (results.length === 0) {
            connection.query("select * from seeds_users where SA_token='"+userTkn+"';", function (err, results, fields) {
                user.name = results[0].SU_name;
                user.lastName = results[0].SU_last_name;

                userName = user.name +' '+ user.lastName;

                res.render('pages/home',{
                    user : userName,
                    yards : yards
                });
            });
        } else {
            let rows = results.length;

            user.name = results[0].SU_name;
            user.lastName = results[0].SU_last_name;

            userName = user.name + ' ' + user.lastName;

            console.log('rows: ', rows);
            for (let x = 0; x < rows; x++) {
                console.log('iteration: ', x);
                console.log(results[x]);

                yards.push({
                    name: results[x].SY_name,
                    type: results[x].SY_type,
                    ubication: '',
                    areaQuantity: '',
                    areaUnity: '',
                    description: ''
                });
            }
            res.render('pages/home', {
                user: userName,
                yards: yards
            });

        }
    });
});

// PROFILE
app.get('/profile', (req, res) =>{
    let userTkn = req.cookies.izloggedzat;
    let user = {},
        userName = '',
        location='N/A';

        connection.query("select * from seeds_users where SA_token='"+userTkn+"';", function (err, results, fields) {
            user.name = results[0].SU_name;
            user.lastName = results[0].SU_last_name;

            userName = user.name +' '+ user.lastName;

            res.render('pages/profile',{
                user : userName,
                location : location
            });
        });
});

//Yards
app.post('/addyard',upload.array(), (req, res) => {
    // let reqFull = req.body;
    let formInfo = req.body;
    console.log(formInfo)

    connection.query("SELECT MAX(SY_id) lastid FROM seeds_yards;", function (err, results, fields) {
        if (err) {
            res.json({success:'false', message:'Server error'});
            throw err;
        }
        console.log(results[0].lastid+1)
        connection.query("insert into seeds_yards VALUES ('"+formInfo.user+"', "+(results[0].lastid+1)+", '"+formInfo.name+"', '"+formInfo.crop+"', '"+formInfo.type+"', '"+formInfo.location+"', '"+formInfo.description+"', '"+formInfo.area+"', '"+formInfo.unity+"');", function (q2_error, q2_results, q2_fields) {
            if (q2_error) {
                res.json({success:'false', message:'Server error'});
                throw q2_error;
            }
            console.log('yard_added');
            res.json({success:'true'});

        });
    }); 
});

app.get('/yards', (req, res) =>{
    let userTkn = req.cookies.izloggedzat;
    
    let yards = [];
    connection.query("select * from seeds_yards where SA_token='"+userTkn+"';", function (err, results, fields) {
        let rows = results.length;

        for( let i = 0; i < rows ; i++ ){
            yards.push({
                id: results[i].SY_id,
                name: results[i].SY_name,
                type: results[i].SY_type,
                ubication: results[i].SY_location,
                areaQuantity: results[i].SY_qty,
                areaUnity: results[i].SY_qty_u,
                description: results[i].SY_description
            });
        }

        res.render('pages/yards',{
            yards : yards
           
        });
    });
});

app.get('/historial', (req, res) =>{
    let userTkn = req.cookies.izloggedzat;
    let useryard = req.cookies.yid;
    let yards = [];
    connection.query("select ys.SA_token, y.SY_id, y.SYu_id, y.SYu_month, y.SYu_year, y.SYu_production_qty, y.SYu_production_qty_measure, y.SYu_income, y.SYu_investment, y.SYu_currency from seeds_yards as ys inner join seeds_yard as y on ys.SY_id = y.SY_id where y.SY_id='"+useryard+"';", function (err, results, fields) {
        let rows = results.length;

        for( let i = 0; i < rows ; i++ ){
            console.log(results[i])
            yards.push({
                syid: results[i].SY_id,
                syuid: results[i].SYu_id,
                syumonth: results[i].SYu_month,
                syuyear: results[i].SYu_year,
                syuproduction: results[i].SYu_production_qty,
                syumeasure: results[i].SYu_production_qty_measure,
                syuincome: results[i].SYu_income,
                syuinvestment: results[i].SYu_investment,
                syucurrency: results[i].SYu_currency
            });
        }

        res.render('pages/yard',{
            yards : yards,
            currentyard: useryard
        });
    });
 });
 app.post('/addyardinfo',upload.array(), (req, res) => {
    // let reqFull = req.body;
    let formInfo = req.body;
    console.log(formInfo)

    connection.query("SELECT MAX(SYu_id) lastid FROM seeds_yard;", function (err, results, fields) {
        if (err) {
            res.json({success:'false', message:'Server error'});
            throw err;
        }
        console.log(results[0].lastid+1)
        connection.query("insert into seeds_yard VALUES ('"+formInfo.yardid+"', "+(results[0].lastid+1)+", '"+formInfo.mes+"', '"+parseInt(formInfo.year)+"', '"+formInfo.produccion+"', '"+formInfo.medida+"', '"+formInfo.ganancia+"', '"+formInfo.inversion+"', '"+formInfo.moneda+"');", function (q2_error, q2_results, q2_fields) {
            if (q2_error) {
                res.json({success:'false', message:'Server error'});
                throw q2_error;
            }
            console.log('yard_added');
            res.json({success:'true'});

        });
    }); 
});
// 404
app.use(function (req, res, next) {
    res.status(404).render('pages/404');
});
// START SERVER
app.listen(3000, ()=> console.log('server up on port 3000'));

