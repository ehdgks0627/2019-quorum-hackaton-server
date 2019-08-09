import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import session from 'express-session'
import ejs from 'ejs'
import http from 'http'

import ContractRouter from './routes/contract/index'
import MemberRouter from './routes/member/index'
import TokenRouter from './routes/token/index'

var app = express()
var server = http.createServer(app)

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://ec2-52-79-251-29.ap-northeast-2.compute.amazonaws.com:8080');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use('/static', express.static(path.join(__dirname, 'public')))

app.use(session({
  key: 'QELS_SID',
  secret: 'f={/jBwJ:#.euKSyxFb9eF{mwQaYR6',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24000 * 60 * 60
  }
}))

app.disable('etag')


var tokenRouter = new TokenRouter()
app.use('/token', tokenRouter.router)

var memberRouter = new MemberRouter()
app.use('member', memberRouter.router)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error.jade')
})


server.listen(3000, function (){
  console.log('App started')
})
