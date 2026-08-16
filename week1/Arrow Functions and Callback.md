# Arrow functions and callback

## Functions

Are reusable blocks of code, when logic is repeated in an app.

```js
// function declaration
function addNums(a, b) {
	return a + b;
}
const a = 10;
const b = 20;
console.log(addNums(a, b)); // 30
```

A function declared explicitly will be hoisted and does not matter where it's located in the code.

A function can also be declared as a variable, though it will not be hoisted. This means it has to be declared before being used.

```js
const addNums = function (a, b) {
	return a + b;
};
```

There are certain shortcuts used to make it easier to follow in bigger functions and bigger files.

- Instead of writing the whole word `function` , it has been reduced to `=>`

```js
const addNums = (a, b) => {
    return a + b;
};
```

Then the `return` statement got redused, now the explicit return is replaced with implicit return statement.

- not only does the implicit return get rid of the `return`, it also takes away the brackets `{}` and the function is reduced to one line:

```js
const addNums = (a, b) => a + b;
```

- functions with a single parameter now lost the braces `()`

```js
const eventHandler = (e) => console.log(e.currentTarget);
```

- functions with no parameters keep the braces `()` but they are left empty.

```js
const confirmUpdate = () => console.log("Data Updated");
```

These shortcuts allow to write small functions that do not need to be declared, because keeping the name of each of those functions would bloat the file and take too much effort

```js
const buttons = document.querySelectorAll(".myButton");
buttons.forEach((button) => {
    button.addEventListener("click", () => {
        console.log(button.innerHTML);
    });
});
```

In this example, we don't care how many buttons are there, we're taking an array of buttons and add the same event listener to those buttons at once and this is the only place the click handler is declared for the whole document.

## The Event loop

JS doesnt have the notation of async code built into it. The JS engine has never done more than a single chunk of program at a moment.

What tells the JS engine to execute chunks of program? 
- JS engine runs inside a hosting environment - either web browser or Node.js. These environments have a built in mechanism -- **the event loop**. Event loop handles the execution of multiple chunks of program over time, invoking JS engine for each time.

JS is single-threaded language with a single call stack == can do one thing at a time.

Call stack - data structure that records what stage of the program is executed now. If a function has been called, its put on the stack and when it's done, its popped off the top of the stack.

Event loop monitors the call stack and callback queue only. If stack is empty it will take the first event from the queue and push it to the call stack which then runs it.

When Ajax requests to fetch data from the server, the response code is set up in a callback function, then the JS engine tells the hosting environment "I will suspend execution of this function now with this promise object, but when this network request gets a response, call this function back and I'll process it's response data/error message.". Then the browser is set up to listen for the response, and when the result comes back, it schedules the callback function to be executed by inserting it into the event loop.