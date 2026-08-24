const fs = require("fs");

// async, executes next line while this thread is processing
// fs.readFile("testFile.txt", function (err, data) {
// 	if (err) throw err;
// 	console.log("1:", data);
// });

// utf8 is an encoding rule to get text, not bytecode
// readFileSync waits until the whole file is loaded before running next line;
// const data = fs.readFileSync("testFile.txt", "utf8");
// console.log("2:", data);


const string = 'This is the fs.writeFile() test case'
fs.writeFile('test.txt', string, function(err){
    if(err) console.log(err);
    console.log("Write operation complete");
})

fs.unlink("test.txt", function (){
    console.log('test.txt deleted.');
})