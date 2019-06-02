#### GridFSBucket.createWriteStream(optns) 

Creates a writable stream (GridFSBucketWriteStream) for writing buffers to GridFS for a custom file id. The stream's 'id' property contains
the resulting file's id.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | Valid options for write file. | &nbsp; |
| optns._id | `ObjectId`  | A custom id used to identify file doc. | *Optional* |
| optns.filename | `String`  | The value of the 'filename' key in the files doc. | &nbsp; |
| optns.chunkSizeBytes | `Number`  | Optional overwrite this bucket's chunkSizeBytes for this file. | *Optional* |
| optns.metadata | `Object`  | Optional object to store in the file document's `metadata` field. | *Optional* |
| optns.contentType | `String`  | Optional string to store in the file document's `contentType` field. | *Optional* |
| optns.aliases | `Array`  | Optional array of strings to store in the file document's `aliases` field. | *Optional* |
| optns.disableMD5&#x3D;false | `Boolean`  | If true, disables adding an md5 field to file data. | *Optional* |




##### Examples

```javascript

const bucket = createBucket();
const _id = new ObjectId();
const filename = 'filename.txt';
const readStream = fs.createReadStream(filename);
const writeStream = bucket.createWriteStream({_id, filename});
readStream.pipe(writeStream);
```


##### Returns


- `GridFSBucketWriteStream`  



#### GridFSBucket.createReadStream([optns]) 

Creates a readable stream (GridFSBucketReadStream) for streaming the file with the given name from GridFS. If there are multiple
files with the same name, this will stream the most recent file with the
given name (as determined by the `uploadDate` field). You can set the
`revision` option to change this behavior.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | Valid options for read existing file. | *Optional* |
| optns._id | `ObjectId`  | The id of the file doc | &nbsp; |
| optns.filename | `String`  | The name of the file doc to stream | *Optional* |
| options.revision&#x3D;-1 | `Number`  | The revision number relative to the oldest file with the given filename. 0 gets you the oldest file, 1 gets you<br>the 2nd oldest, -1 gets you the newest. | *Optional* |
| optns.start | `Number`  | Optional 0-based offset in bytes to start streaming from. | *Optional* |
| optns.end | `Number`  | Optional 0-based offset in bytes to stop streaming before. | *Optional* |




##### Examples

```javascript

const bucket = createBucket();
const _id = new ObjectId();
const filename = 'filename.txt';
const writeStream = fs.createWriteStream(filename);
const readStream = bucket.createReadStream({_id, filename});
readStream.pipe(writeStream);
```


##### Returns


- `GridFSBucketReadStream`  



#### GridFSBucket.writeFile(file, readstream[, done]) 

Write provided file into MongoDB GridFS




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| file | `Object`  | valid file details | &nbsp; |
| readstream | `ReadableStream`  | valid nodejs ReadableStream | &nbsp; |
| done | `Function`  | a callback to invoke on success or error | *Optional* |




##### Examples

```javascript

// large file
const bucket = createBucket();
const filename = 'filename.txt';
const readStream = fs.createReadStream(filename);
const writeStream = bucket.writeFile({ filename }, readStream);

// small file
const bucket = createBucket();
const filename = 'filename.txt';
const readStream = fs.createReadStream(filename);
bucket.writeFile({ filename }, readStream, (error, file) => { ... });
```


##### Returns


- `GridFSBucketWriteStream`  a GridFSBucketWriteStream instance.



#### GridFSBucket.readFile(optns[, done]) 

Read file from MongoDB GridFS




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | valid criteria for read existing file. | &nbsp; |
| optns._id | `ObjectId`  | The id of the file doc | &nbsp; |
| optns.filename | `String`  | The name of the file doc to stream | *Optional* |
| options.revision&#x3D;-1 | `Number`  | The revision number relative to the oldest file with the given filename. 0 gets you the oldest file, 1 gets you<br>the 2nd oldest, -1 gets you the newest. | *Optional* |
| optns.start | `Number`  | Optional 0-based offset in bytes to start streaming from. | *Optional* |
| optns.end | `Number`  | Optional 0-based offset in bytes to stop streaming before. | *Optional* |
| done | `Function`  | a callback to invoke on success or error. <br>Warn!: Pass callback if filesize is small enough.<br>Otherwise consider using stream instead. | *Optional* |




##### Examples

```javascript

// large file
const bucket = createBucket();
const filename = 'filename.txt';
const readStream = bucket.readFile({ filename });

// small file
const bucket = createBucket();
const filename = 'filename.txt';
bucket.readFile({ filename }, (error, buffer) => { ... });
```


##### Returns


- `GridFSBucketReadStream`  a GridFSBucketReadStream instance.



#### GridFSBucket.deleteFile(_id, done) 

Remove an existing file and its chunks.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| _id | `ObjectId`  | The id of the file doc | &nbsp; |
| done | `Function`  | a callback to invoke on success or error | &nbsp; |




##### Examples

```javascript

const bucket = createBucket();
bucket.deleteFile(_id, (error, results) => { ... });
```


##### Returns


- `Void`



#### GridFSBucket.findOne(optns, done) 

find an existing file using options provided




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | valid find criteria | &nbsp; |
| done | `Function`  | a callback to invoke on success or error | &nbsp; |




##### Examples

```javascript

const bucket = createBucket();
bucket.findOne({ _id }, (error, file) => { ... });
bucket.findOne({ filename }, (error, file) => { ... });
```


##### Returns


- `Object`  existing file details



#### GridFSBucket.findById(_id, done) 

find an existing file with given objectid




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| _id | `ObjectId`  | valid objectid of the existing file | &nbsp; |
| done | `Function`  | a callback to invoke on success or error | &nbsp; |




##### Examples

```javascript

const bucket = createBucket();
bucket.findById(_id, (error, file) => { ... });
```


##### Returns


- `Object`  existing file details



#### GridFSBucket._handleFile(request, file, done) 

write file to the bucket and return information on how to access the file in the future




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| request | `Object`  | injected request from multer | &nbsp; |
| file | `Object`  | injected file object from multer | &nbsp; |
| done | `Function`  | a callback to invoke on success or error | &nbsp; |




##### Examples

```javascript

const express = require('express');
const multer  = require('multer');
const { createBucket } = require('mongoose-gridfs');
const app = express();
const storage = createBucket(); // createBucket(optns)
const upload = multer({ storage });

app.post('/profile', upload.single('avatar'), (req, res, next) => {
  // req.file is the `avatar` file
  // req.body contains the text fields
});
```


##### Returns


- `Void`



#### GridFSBucket._removeFile(request, file, done) 

remove existing file from bucket




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| request | `Object`  | injected request from multer | &nbsp; |
| file | `Object`  | injected file object from multer | &nbsp; |
| done | `Function`  | a callback to invoke on success or error | &nbsp; |




##### Examples

```javascript

const express = require('express');
const multer  = require('multer');
const { createBucket } = require('mongoose-gridfs');
const app = express();
const storage = createBucket(); // createBucket(optns)
const upload = multer({ storage });

app.post('/profile', upload.single('avatar'), (req, res, next) => {
  // req.file is the `avatar` file
  // req.body contains the text fields
});
```


##### Returns


- `Void`



#### createBucket([optns]) 

Create GridFSBucket




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | Optional settings. | *Optional* |
| optns.connection | `Connection`  | = mongoose.connection] A valid instance of mongoose connection. | *Optional* |
| optns.bucketName&#x3D;&quot;fs&quot; | `String`  | The 'files' and 'chunks' collections will be prefixed with the bucket name followed by a dot. | *Optional* |
| optns.chunkSizeBytes&#x3D;255 | `Number`  | * 1024] Number of bytes stored in each chunk. Defaults to 255KB | *Optional* |
| optns.writeConcern | `Object`  | Optional write concern to be passed to write operations, for instance `{ w: 1 }` | *Optional* |
| optns.readPreference | `Object`  | Optional read preference to be passed to read operations | *Optional* |




##### Examples

```javascript

const bucket = createBucket();
const bucket = createBucket({ bucketName });
const bucket = createBucket({ buketName, connection });
```


##### Returns


- `GridFSBucket`  an instance of GridFSBucket



#### createModel([optns, plugins]) 

Create GridFSBucket files collection model




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | Optional settings. | *Optional* |
| optns.connection | `Connection`  | = mongoose.connection] A valid instance of mongoose connection. | *Optional* |
| optns.modelName&#x3D;&quot;File&quot; | `String`  | Valid model name to use with mongoose | *Optional* |
| optns.bucketName&#x3D;&quot;fs&quot; | `String`  | The 'files' and 'chunks' collections will be prefixed with the bucket name followed by a dot. | *Optional* |
| optns.chunkSizeBytes&#x3D;255 | `Number`  | * 1024] Number of bytes stored in each chunk. Defaults to 255KB | *Optional* |
| optns.writeConcern | `Object`  | Optional write concern to be passed to write operations, for instance `{ w: 1 }` | *Optional* |
| optns.readPreference | `Object`  | Optional read preference to be passed to read operations | *Optional* |
| plugins | `Function`  | list of valid mongoose plugin to apply to file schema | *Optional* |




##### Examples

```javascript

const File = createModel(); // => fs.files
const Photo = createModel({ modelName }); // => photos.files
const Photo = createModel({ modelName, connection }); // => photos.files
```


##### Returns


- `GridFSBucket`  an instance of GridFSBucket




#### FileSchema.methods.write(stream[, done]) 

Write provided file into MongoDB GridFS




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| stream | `stream.Readable`  | readable stream | &nbsp; |
| done | `Function`  | a callback to invoke in success or error | *Optional* |




##### Examples

```javascript

const attachment = new Attachment({ filename });
attachment.write(readablestream, (error, attached) => {
 //=> {_id: ..., filename: ..., ... }
});
```


##### Returns


- `Model`  valid instance of mongoose model.



#### FileSchema.methods.read([done]) 

Read file from MongoDB GridFS




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| options.revision&#x3D;-1 | `Number`  | The revision number relative to the oldest file with the given filename. 0 gets you the oldest file, 1 gets you<br>the 2nd oldest, -1 gets you the newest. | *Optional* |
| optns.start | `Number`  | Optional 0-based offset in bytes to start streaming from. | *Optional* |
| optns.end | `Number`  | Optional 0-based offset in bytes to stop streaming before. | *Optional* |
| done | `Function`  | a callback to invoke on success or error. <br>Warn!: Pass callback if filesize is small enough.<br>Otherwise consider using stream instead. | *Optional* |




##### Examples

```javascript

// small file
Attachment.findById(_id, (error, attachment) => {
  attachment.read((error, content) => { ... });
});

// large file
Attachment.findById(_id, (error, attachment) => {
  const readstream = attachment.read();
  stream.on('error', fn);
  stream.on('data', fn);
  stream.on('close', fn);
});
```


##### Returns


- `GridFSBucketReadStream`  a GridFSBucketReadStream instance.



#### FileSchema.methods.unlink(done) 

Remove an existing file and its chunks.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| done | `Function`  | a callback to invoke on success or error | &nbsp; |




##### Examples

```javascript

attachment.unlink((error, unlinked) => {
 //=> {_id: ..., filename: ..., ... }
});
```


##### Returns


- `Model`  mongoose model instance



#### FileSchema.statics.write(file, stream[, done]) 

Write provided file into MongoDB GridFS




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| file | `Object`  | valid file details | &nbsp; |
| stream | `stream.Readable`  | readable stream | &nbsp; |
| done | `Function`  | a callback to invoke in success or error | *Optional* |




##### Examples

```javascript

// large file
const writeStream = Attachment.write({ filename }, readStream);

// small file
Attachment.write({ filename }, readstream, (error, file) => {
 //=> {_id: ..., filename: ..., ... }
});
```


##### Returns


- `GridFSBucketWriteStream`  a GridFSBucketWriteStream instance.



#### FileSchema.statics.read(optns[, done, done]) 

Read file from MongoDB GridFS




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | valid criteria for read existing file. | &nbsp; |
| optns._id | `ObjectId`  | The id of the file doc | &nbsp; |
| optns.filename | `String`  | The name of the file doc to stream | *Optional* |
| options.revision&#x3D;-1 | `Number`  | The revision number relative to the oldest file with the given filename. 0 gets you the oldest file, 1 gets you<br>the 2nd oldest, -1 gets you the newest. | *Optional* |
| optns.start | `Number`  | Optional 0-based offset in bytes to start streaming from. | *Optional* |
| optns.end | `Number`  | Optional 0-based offset in bytes to stop streaming before. | *Optional* |
| done | `Function`  | a callback to invoke on success or error. <br>Warn!: Pass callback if filesize is small enough.<br>Otherwise consider using stream instead. | *Optional* |
| done | `Function`  | a callback to invoke on success or error | *Optional* |




##### Examples

```javascript

// small file
Attachment.read({ _id }, (error, content) => { ... });

// large file
const readstream = Attachment.read({ _id });
stream.on('error', fn);
stream.on('data', fn);
stream.on('close', fn);
```


##### Returns


- `GridFSBucketReadStream`  a GridFSBucketReadStream instance.



#### FileSchema.statics.unlink(_id, done) 

Remove an existing file and its chunks.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| _id | `ObjectId`  | The id of the file doc | &nbsp; |
| done | `Function`  | a callback to invoke on success or error | &nbsp; |




##### Examples

```javascript

Attachment.unlink(_id, (error, unlinked) => {
 //=> {_id: ..., filename: ..., ... }
});
```


##### Returns


- `Model`  mongoose model instance




*Documentation generated with [doxdox](https://github.com/neogeek/doxdox).*
