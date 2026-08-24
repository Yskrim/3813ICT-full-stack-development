# Node.js Modules and Packages

## Modules

- writing in the same file can get messy
- files get large and hard to maintain
- may cause merge conflicts

Modules encapsulate related code into a single unit of code serving it's own purpose. This includes all functions and structures related to one task in a single file.

Module exports are the instructions that tell Node what bits of code to export fron the file and make them public to the remaining codebase.

Modules are imported into other files using the `require()` method in commonjs.

```js
// myModule.js
const string = "Hello ";
const default = "Usermname";
const greet = name => string + (name ? name : default);

module.exports = {
    greet,
    default,
}

// usingModule.js
const myModule = require("./myModule");
console.log(myModule.greet("Alice")); // "Hello Alice"
console.log(myModule.greet()); // "Hello Username"
console.log(myModule.default) // "Username"
```

### CommonJS VS ES6 modules

- CommonJS is the default module format in JS
- Node supports ES6 module format from 13.2.0
- CommonJS uses `module.exports` and `require()` to publish and import modules
- ES6 uses `import` and `import { methodName } from "./modulePath"` either from a file extension `.mjs` or `type: module` in `package.json` file to mark it using ES6 format.

### Packages

- Projects can be made easily by using packages.
- Packages provide prewritten code to achieve some functionality.
- No need to reinvent the wheel if it already exists.

Public npm registry is a database of JS packages, each comprised of software and metadata.

Own packages may be uploaded to NPM via GitHub public registry.

### Packages and NPM
NPM projects have a `package.json` file that describes a list of packages used by the project. It includes:
1. Name of the project
2. the author
3. version
4. dependencies (third party packages used for the project)
5. other metadata

`package.json` makes build process reproducible >> easier to share by knowing what dependencies need to be installed to work.

A module is any file or directory in `node_modules/` dir that can be loaded by `require()` or `import {} from "path"`