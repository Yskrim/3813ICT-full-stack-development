# Files with Express

- File system with NodeJS
- File uploading with Express

### File system

- Node includes fs module to access the file system
- The `fs` is responsible for all the async or sync file i/o operations
- Most common i/o would be
  - `fs.readFile()` == read,
  - `fs.writeFile()` == write,
  - `fs.unlink()` == delete

```js
const fs = require("fs");

// async, executes next line while this thread is processing
fs.readFile("testFile.txt", function (err, data) {
	if (err) throw err;
	console.log("1:", data);
});

// utf8 is an encoding rule to get text, not bytecode
// readFileSync waits until the whole file is loaded before running next line;
const data = fs.readFileSync("testFile.txt", "utf8");
console.log("2:", data);

const string = "This is the fs.writeFile() test case";
fs.writeFile("test.txt", string, function (err) {
	if (err) console.log(err);
	console.log("Write operation complete");
});

fs.unlink("test.txt", function () {
	console.log("test.txt deleted.");
});
```

### Uploading with Express

In a fresh app:

- npm install formidable == module for parsing form data (data uploads)
- npm install express == doenst have a built-in form data parser.

