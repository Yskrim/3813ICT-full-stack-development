# Intro to JavaScript

### JavaScript

- released in 1995 for Netscape browser
- not related to Java
- is an Interpreted, Object-Oriented, Functional language
- supports most basic datatypes, objects, arrays, maps, classes and constructors

#### Whese is it used?

1. Browsers
2. Servers == Node
3. Applications == web apps and more

### Document Object Model (DOM)

It is the way JS interacts with web pages.
DOM is a hierarchy of:

- Tags
- Attributes
- Structure
- Events

#### How does it work?

JS accesses info about the web page with DOM:

- finds specific tag by name, class, id
- Accesses the attributes/contents of that tag

JS changes the contents of a web page with DOM:

- Modify tab attributes
- Add event handlers
- Create/Delete elements
- Change contents

#### DOM Hierrarchy

`Window
└──document
    └── <html>
        ├── <head>
        │   └── <title>
        └── <body>
            ├── <header>
            ├── <main>
            │   ├── <h1>
            │   └── <p>
            └── <footer>`

#### Accessing a DOM element

```html
<body>
	<h1 id="heading">Heading</h1>
	<h2 class="subheading">sub</h2>
	<p class="content">text1</p>
	<p class="content">text2</p>
	<p class="content">text3</p>
	<div>nothing inside</div>
</body>
```

```js
const element = document.getElementById("heading"); // access element by id
const sub = document.querySelector(".subheading"); // access element by class
const arrayOfElements = document.querySelectorAll(".content"); // access all elements of the same class
const div = document.getElementByTagName("div"); // access by tag name
```

### Variables and scope

There are three ways to declare a variable:

- let
- var
- const

##### `let`

- block scoped
- cannot redeclare
- mutable
- use for counters, in loops, etc

Example:

```js
console.log(count); // error, used before declaration
let count; // undefined
let count = 1; // SyntaxError: already declared
count = 2; // 2
let count = 3; // SyntaxError: already declared
```

##### `var`

- function scoped
- hoisted
- initialized as undefined
- `AVOI USING`
- can be redeclared

Example:

```js
console.log(count); // undefinded, hoisted
var count; // undefined
var count = 1; // 1
var count = 2; // 2
```

##### `const`

- block scoped
- cannot redeclare
  immutable
- `USE BY DEFAULT`

Example:

```js
console.log(count); // error, used before declaration
const count; // undefined
var count = 1; // 1
var count = 2; // 2
```

### If statements:

```js
// basic syntax
if (condition) {
	//code
}

// single action on condition
if (condition) singleLineOfCode();

//ternary operator
condition ? actionIfTrue() : actionIfFalse();
```

### Loops:

Basic loops do something repeatedly, either definitely or indefinitely

```js
//basic syntax
for (let i = 0; i < 10; i++) {
	// loop logic
}

//while loop
while (condition) {
	// loop logic
}

// do while loop
do {
	// loop logic
} while (condition);
```

Objects can also be iterated over with special loops.
`for...of loop` - loop takes one of many items like in an array and operates with each one

```js
for (let prop of object) {
	// loop logic
}

const names = ["Anton", "Sam", "Priya"];
for (let name of names) {
	console.log(name); // "Anton", "Sam", "Priya"
}
```

`for...in loop` - loop abstracts basic counting loop

```js
for (let key in object) {
	// loop logic
}

const arr = ["a", "b", "c"];
for (let i in arr) {
  console.log(i); // "0", "1", "2"  (strings, not numbers)
}

const person = { name: "Anton", role: "student" };
for (let key, value in person) {
  console.log(key); // "name", "role"
}
```

There are some methods available on objects, that allow to abstract the basic loop syntax

```js
// object iteration loop
array.forEach((item) => {
	// loop logic
});
array.map((item) => {
	// returns new array
	//map logic
});
array.filter((item) => {
	// returns new filtered array
	//filer logic
});
```

### Functions

Reusable blocks of code, can be exported and imported

```js
function functionName(parameters) {
	//function logic
	return somethingOrNothing; // optional
}

const myFunction = (parameters) => {
	//function logic
	return somethingOrNothing; // optional
};
```

### Strings

Arrays of characters, special object in JS.

- iterable
- primitive
- immutable
- support interpolation with ``
- comparison is lexicographical (by char code)
- - symbol concatenates types into strings

```js
const string = "Hello"
string[0] // "H"
string.toUpperCase() // "HELLO"
string.slice() // [ "H", "e", "l", "l", "o"]
string.length() // 5
typeof string // "string" -- primitive
"otherString".length() // 11, works too
console.log(`${string}, Anton`) // "Hello, Anton" -- interpolation
"5" + 3 // "53"
5 + 4 + "" // "9"
"apple" < "banana" // true; (a code = 64) < (b code = 65)
[..."abc"] // ["a", "b", "c"] == spreading of an object (array)
```
