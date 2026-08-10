# Node.js

### Intro to node
- JS released in may 1995
- Js used for client-side scripting
- Node.js released in 2009 == runtime environment built on Google V8 runtime engine 
- Node is built with C, C++ and JS
- New JS features are automatically added to Node via V8
- Node.js apps are written in JS and can be run withing Node.js runtime on every OS.
- Node uses Event-Driven, Non-Blocking I/O model == makes it lightweight and efficient

### Non-blocking IO 
another name for Asynchronous (async) IO which is a form of IO processing that uses multiple threads and allows synchronous code to execute while waiting on the async responses.

### Event-Driven IO
1. language manages the events in a queue == event loop
2. Then this loop is delegated into async tasks
3. Then the runtime delegates threads for each task and returns a promise
4. Promises is a state of the task - either completed or not
5. Each thread either resolves it's promise or not, while the rest of the code is being executed >> non-blocking IO

### Web Frameworks
Most of the projects consist of the same code being rewritten all the time. This code doesnt even relate to the logic of the app, mostly packages, drivers, dependencies and etc.
Web frameworks provide API commands that automate web app setup and maintenance, reducing the time spent on coding.
Web frameworks are used in many different contexts in modern development:
- Convention over Configuration (CoC)
- Don't repeat yourself (DRY)
- Use REST
- Use Model View Controller (MVC) model
- Don't Reinvent the Wheel

### NPM 
== Node Package Manager
- Follows the "Don't Reinvent the Wheel" statement
- world's largest software library
- package manager
- installer
- works via command line
- comes installed with Node.js

### How to install node

Mac: `brew install node`
Win: through the .exe installer