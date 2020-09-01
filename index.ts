import express, { NextFunction, Request, Response } from 'express';

const PORT : number | string = process.env.PORT || 4000;

const app : express.Application = express();

// creates a middleware to define communication type,
// because there is not indication for which endpoint, ut applies to all
app.use((req : Request, res : Response, next : NextFunction) => {
  // a request from any source can access
  res.header('Access-Control-Allow-Origin', '*');
  // which headers are supported by CORS requests
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, Accept, Content-Type, X-Requested-With',
    );
  // which methods are supported in this server
  res.header(
    'Access-Control-Allow-Methods',
    'GET, PUT, DELETE, POST',
    );
  // as this is a middleware definition,
  // the NextFunction is called to continue to the next step of any endpoint.
  next()
})