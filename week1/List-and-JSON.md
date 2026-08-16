# Arrays and JSON

### List API commands

List = Array
Array is a high level data structure == list-like object.

```js
const array = [1, 3, 2];
array.push(4);                                  // [1, 3, 2, 4]
array.pop();                                    // [1, 3, 2]
array[0];                                       // 1
array.indexOf(3);                               // 1
array.sort((a, b) => b - a);                    // [2, 3, 1]
array.reverse();                                // [1, 3, 2]
array.slice(1, 2);                              // [3] == does not affect the original == non-destructive
array.splice(0, 1);                             // [3, 2] == remove any item from an array == destructive
array.length();                                 // 2
array.reduce((sum, n) => sum + n, 0);           // 6 == combine everything


const fruits = ["apple", "banana", "cherry"];  
fruits.unshift("apricot");                      // ["apricot", "apple", "banana", "cherry"]
fruits.shift();                                 // ["apple", "banana", "cherry"]
fruits.splice(1, 1, "kiwi");                    // ["apple", "kiwi", "cherry"]
fruits.map(f => f.toUpperCase());               // ["APPLE", "KIWI", "CHERRY"]
fruits.filter(f => f.length > 4);               // ["apple", "cherry"]
fruits.slice(1, 3);                             // ["kiwi", "cherry"] non-desctructive
fruits.includes("banana");                      // true/false
fruits.find(f => f.startsWith("b"));            // returns the first match: "banana"
fruits.findIndex(f => f.startsWith("b"));       // returns its index: 1
fruits.some(f => f.length > 5);                 // true if ANY item matches
fruits.every(f => f.length > 3);                // true if ALL items match
fruits.forEach(f => console.log(f));            // run a function per item, no return value
fruits.join(", ");                              // "apple, cherry, kiwi" — array to string
"a,b,c".split(",");                             // ["a", "b", "c"] — string to array
```



### JSON

JavaScript Object Notation

- stores data
- transports data
- syntax is derived from JS object syntax

```js
const obj = { name: "Anton", age: 24 };        // JS object — a live data structure
const json = '{"name":"Anton","age":24}';      // JSON — just a string
```

Examples:

```js
//JavaScript
const object = {
    name : "griffithUni",
    address: {
        country : "Australia",
        state : "Queensland",
        city : "Brisbane",
    },
    institutes : 20,
    programmes: [
        ICT : {
            durationYears: 3,
            level: "Bachelor",
            modules: 24,
            majors : [
                {name : "Software Dev"},
                {name : "Cybersec"},
                {name : "Data science"}
            ],
        },
    ],
}

//JSON
const json = `{
    "name" : "griffithUni",
    "address" : {
        "country" : "Australia",
        "state" : "Queensland",
        "city" : "Brisbane"
    },
    "institutes" : 20,
    "programmes" : [
        "ICT" : {
            "durationYears" : 3,
            "level" : "Bachelor",
            "modules" : 24,
            "majors" : [
                {"name" : "Software Dev"},
                {"name" : "Cybersec"},
                {"name" : "Data science"}
            ]
        }
    ]
}`;
```



### JSON to and from an Object

```js
JSON.stringify(obj);   // object → JSON string
JSON.parse(json);      // JSON string → object
```

### Restrictions of JSON

- JSON cannot store nested methods, they are just dropped when object is stringified.
- Keys must be "double quoted"
- Only allows strings, numbers, booleans, null, array, object >> other types discarded
- trailing commas not allowed
- comments not allowed
- single quotes not allowed, only double