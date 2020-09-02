import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import Busboy from 'busboy';
  /*
    different listeners in busboy : on - 
                                        file(< string >fieldname, < ReadableStream >stream, < string >filename, < string >transferEncoding, < string >mimeType) -> data, end, limit
                                        field(< string >fieldname, < string >value, < boolean >fieldnameTruncated, < boolean >valueTruncated, < string >transferEncoding, < string >mimeType) - Emitted for each new non-file field found.
                                        partsLimit() -  Emitted when specified parts limit has been reached. No more 'file' or 'field' events will be emitted.
                                        filesLimit() - Emitted when specified files limit has been reached. No more 'file' events will be emitted.
                                        fieldsLimit() - Emitted when specified fields limit has been reached. No more 'field' events will be emitted.
                                        finish 
  */
import path from 'path';
import fs from 'fs';


const PORT : number | string = process.env.PORT || 4000;

const app : express.Application = express();

// logging tool to indicate "steps" that are called on, before they are done
app.use(morgan('tiny'))

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
              <input type="file" name="file1"><br />\
              <input type="submit">\
            </form>\
          </body></html>');
res.end();
});

app.post('/', (req: Request, res: Response) => {
  const busboy : busboy.Busboy = new Busboy({headers: req.headers}); // {host, connection, content-length, cache-control, origin, upgrade-insecure-requests, dnt, content-type, accept, sec-fetch-site, sec-fetch-mode, sec-fetch-dest, referer, accept-encoding, accept-language, cookie (and user-agent)}
  /* another argument option: limits: {
                                        files: integer,
                                        field: integer,
                                        fileSize: integer,
                                        fieldSize: integer,
                                        fieldNameSize: integer,
                                      }
  */
  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    /*
      fieldname : filefield, string
      file : FileStream (ReadableStream)
      filename : name.type, string
      encoding : 'Content-Transfer-Encoding', string
      mimetype : 'Content-Type', string (in this case 'image/jpeg' | 'image/png')
      outStream : WriteStream
    */
    /*
      file.resume() - will discard the content of this stream
    */
    file.on('data', (chunk) => {
      console.log(`File [${fieldname}] got ${chunk.length} bytes`)
      /* validation
        f(mimetype != 'image/png')
        f(mimetype != 'image/jpeg')
      */
      // abortion
      /*
        ??  file.resume();
            return res.json({
                success: false,
                message: 'Invalid file format'
            });
        ??  self.req.unpipe();
            return;
        ??  self.req.unpipe(busboy);
            // `Connection: close` is important here, to ensure the socket is closed after
            // we write our response.
            self.res.writeHead(400, { 'Connection': 'close' });
            self.res.end();
      */
      file.once('end', () => {
        console.log(`File [${fieldname}] Finished`)
        // upload to 
        /*
          ??  fstream = fs.createWriteStream(__dirname + '/tmp/' + timestamp + filename);
              file.pipe(fstream);
              fstream.on('close', function () {
                  return res.json({
                      success: true
                  });
              });
        */
      })
    })
    // if limits are set
    file.on('limit', function() {
      console.log('limit reached!');
      req.unpipe(busboy);
      res.status(500).end('Limit Reached');  // Not doing anything...
    });
    const saveTo = path.join(__dirname/*current location*/, 'dir', path.basename(filename))
    console.log('saveTo', saveTo)
    const outStream = fs.createWriteStream(saveTo);
    // console.log('outStream', outStream)
    // console.log('file.pipe', file.pipe.toString())
    file.pipe(outStream); //outStream is 'destination'
  });
  busboy.on('finish', () => {
    console.log('test finish')
    res.writeHead(303, { Connection: 'close', Location: '/' }); // this closes the socket?
    // What is writeHead?
    res.end('end ') // stops the stream?
  })
  console.log('return') // being accessed before finished upload
  return req.pipe(busboy);// what is req.pipe
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`))


  // Close connection with specified reason and http code, default: 400 Bad Request.
  const closeConnection = (code : number , reason : string, req : Request, res : Response, busboy : busboy.Busboy) => {
    req.unpipe(busboy);
    res.writeHead(code || 400, { Connection: 'close' });
    res.end(reason || 'Bad Request');
  };