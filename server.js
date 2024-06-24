import express from 'express';
import passport from 'passport';
import path from 'path';
import bodyparser from 'body-parser';
import assistantsRouter from './routes/api/assistants.js';
import suitesRouter from './routes/api/suites.js';
import providersRouter from './routes/api/providers.js'
import morgan from 'morgan';
import passportConfig from './config/passport.js'
import connectMongo from './db/index.js';


const app = express();

//Loggger
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

//Body parser configuration
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

//Use routes
app.use('/api/assistants', assistantsRouter);
app.use('/api/suites', suitesRouter);
app.use('/api/providers', providersRouter);

//production
if(process.env.NODE_ENV === 'production'){
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  });
}

//Db config
const dbUri = async () =>  (await import('./config/keys.js')).default
if((await dbUri()).mongoURI && (await dbUri()).mongoURI !== undefined) connectMongo((await dbUri()).mongoURI)
else console.log("DB connection url not found, aborting connection...")

//Passport configuration
app.use(passport.initialize());
passportConfig(passport)

const port = process.env.PORT || 7000;
app.listen(port, () => console.log(`Server running on port ${port}`));

