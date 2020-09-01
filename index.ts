import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import Busboy from 'busboy';
import path from 'path';
import fs from 'fs';


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

app.get('/', function (req, res) {
  res.send('<html><head></head><body>\
             <form method="POST" enctype="multipart/form-data">\
              <input type="text" name="textfield"><br />\
              <input type="file" name="filefield"><br />\
              <input type="submit">\
            </form>\
          </body></html>');
res.end();
});

app.post('/', (req: Request, res: Response) => {
  console.log('req.headers', req.headers)
  const busboy = new Busboy({headers: req.headers});
  console.log('req.headers', req.headers)
  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    file.on('data', (data) => {
      console.log(`File [${fieldname}] got ${data.length} bytes`)
    })
    file.on('end', () => {
      console.log(`File [${fieldname}] Finished`)
    })
    const saveTo = path.join(__dirname, 'dir', path.basename(filename))
    console.log('saveTo', saveTo)
    const outStream = fs.createWriteStream(saveTo);
    file.pipe(outStream);
  });
  busboy.on('finish', () => {
    console.log('test finish')
    res.status(200).json({'connection': 'close'})
    // res.end('end ')
  })
  console.log('return')
  return req.pipe(busboy);
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`))