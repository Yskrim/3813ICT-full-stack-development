# Typescript

### What is Typescript?

Typescript is an open source language from Microsoft
Typescript is a superset of JavaScript
Typescript is a compiled language -> compiler outputs JavaScript

This allows for static type checking (type of a variable is known at compile time) that dynamically typed languages like JS cannot do.

### Objects

In JavaScript:

- we can assign objects to variables
- we can access the properties of an object with `.` notation

```js
const person = {
	name: "Anton",
	age: 24,
};

person.name = "Antonio";
person.age = 25;
console.log(`${person.name} is ${person.age} years old`); // Antonio is 25 years old
```

In TypeScript:

- objects have types
- type of the object is specified by it's class

* JavaScript now also supports classes (ECMA Script ES6)

But generally, types are defined like this:

```ts
class person {
	name: string;
	age: number;
}

const person: Person = {
	name: "Anton",
	age: 24,
};
```

### Classes

The above is an example of a class definition and use of class to create an object of that class.

- Instance of the class be created with explicit property initialization like above
- Instance can also be created with `const person = new Person()` and then assign properties with `person.name = "Anton"; person.age = 24`
- However this is fairly redundant, so this is where the constructors come in.

### Constructor

Constructor is a method that creates instances of a class according to a specified structure.
It is run when an object is created from the class via `new` keyword.
Constructor uses the args to set the properties on an object on creation.

```ts
class Person {
	name: string;
	age: number;

	constructor() {
		this.name = "Anton";
		this.age = 24;
	}
}
```

- Constructor is a function defined inside of the class
- The `function` keyword is not used
- Constructors don't have return types/values;

### This notation

`this` is a special keyword that refers to the particular instance (current object) of the class.
If `this` is not used, compiler thinks the properties are not declared.
`this` is used to access class variables from within the class.

### Constructor parameters

We can declare parameters for the constructor method.

- These parameters allow to pass the values to use as initial values.
- If we add default values, it's not necessary to pass all the property values to the constructor, the empty ones will be defaulted by the constructor

```ts
class Person {
	name: string;
	age: number;

	constructor(name: string = "User", age: number = 20) {
		this.name = name;
		this.age = age;
	}

	function greet(){
        console.log(`Hello, my name is ${this.name} and I'm ${this.age} years old`);
    };
}

const person: Person = new Person("Anton"); // name is passed, age is not
person.greet(); // Hello, my name is Anton and I'm 20 years old // name = new, age = default
```

### Declaring properties with constructor parameters

TypeScript allows to declare properties in constructor params

- This reduces the lines count in class definition
- To declare contructor properties, they have to have access type `public/private`

```ts
class Person {
	name: string;
	age: number;

	constructor(
		public name: string = "User",
		public age: number = 20,
	) {
		this.name = name;
		this.age = age;
	}
}
```

### `Public / Private / Protected`

These are the access modifiers with different scope.
1. `Public` == propery is accessible outside the class 
2. `Private` == only within the method == change/fetch only with getter/setter methods
3. `Protected` == within class and subclasses.

It's not required to add the modifier to the properties, ts defaults it to public
But it is required to add the modifier when declaring properties in constructor