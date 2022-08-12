const express = require('express')
const morgan = require('morgan')
const { Prohairesis} = require('prohairesis')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const dotenv = require('dotenv');

const app = express();
const port = process.env.PORT || 3000;
const connection = mysql.createConnection({
    host: 'us-cdbr-east-06.cleardb.net',
    user: 'bf725890ac50da',
    password: '12939397',
    database: 'heroku_e5c4576accbba07',
    port: '3306'
})
// function to handle disconnects
function handleDisconnect() {
    connection2 = mysql.createConnection(connection);
  
    connection2.connect(function(err) {              
      if(err) {                                    
        console.log('error when connecting to db:', err);
        setTimeout(handleDisconnect, 3000); 
      }                                     
    });                                     
    connection2.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
        handleDisconnect();                         
      } else {                                     
        throw err;                                  
      }
    });
  }
  
handleDisconnect();
//configuring database to site
dotenv.config()
const mySQLString = process.env.CLEARDB_DATABASE_URL
const database = new Prohairesis(mySQLString)


// all express get set and post functions
app
    .use(morgan('dev'))
    .use(express.urlencoded({ extended: false }))
    .use(bodyParser.json())

    .set('views', './public/views')
    .set('view engine', 'ejs')

    //routing
    .get('/', (req, res) => {

        connection.query(`SELECT * FROM coursemodules`, (error, rows) => {
            if(error) throw error;

            if(!error) {
                console.log(rows)
                res.render('index', { rows })

            }
        })

    })


    .get('/createmodule', (req, res) => {
        res.render('createmodule')
    })

    //POST requests
    .post('/createmodule', async (req, res) => {
        const body = req.body
        await database.execute(`
            INSERT INTO coursemodules (
                title,
                body,
                date_added,
                due_date
            ) VALUES (
                @title,
                @body,
                NOW(),
                @due_date
            )
        `, {
            title: body.title,
            body: body.body,
            due_date: body.due_date
        })
        res.redirect('/')
    })

    .listen(port, () => console.log(`Server listening on port ${port}`))