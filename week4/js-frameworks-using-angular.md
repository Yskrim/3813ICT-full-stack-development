# JavaScript Frameworks using Angular

## What is Angular

Angular is a frontend MVC(Model View Controller) framework by Google

It has two major versions:

1. AngularJS 1.
2. Angular 2.

- Angular was originally designed to work with JS
- Version 2 was rewritten to work with TypeScript, that is why JS was removed from the name
- Angular does not run on a server, but can communicate servers to access data
- Angular apps compile to JS (TS compilation), that is loaded into the browser and run locally as a single-paged website.
- The `index.html` page is the single parent html document used to display the Angular app
- There is no navigating to another HTML, only rendering DOM elements for the current page (like React)
- Angular is designed to provide better structure to large JS projects.

---



## Angular concepts

Angular has 6 main concepts to front-end dev:

1. Modules
2. Components
3. Templates
4. Data binding
5. Services
6. Directives



### 1. Modules

Angular apps are modular -> use modularity system `NgModules`

`NgModules` are containers that group blocks of functionality that belong together. This includes components, directives, services

`NgModules` can import functionality from another `NgModule` and export their functionality for use in other modules. (`export/import{}` modules OR `module.exports/require()` commonjs)

#### AppModule

The first module to learn is`AppModule`

- it represents the entire application



### 2. Components

- Components control a patch of screen called `view`.
- The component's application logic is defined inside a class.
- The class interacts with the view through an API of properties and methods.

A component performs these tasks:

- Creates and displays HTMl and CSS for the component
- Handles any events within component
- Manages any data displayed/entered into component



### 3. Templates

Template is a HTML file that defines how a view for a component is rendered.

### 4. Data binding

Data binding is the process that connects a component to it's template and allows data and events flow between these components.
In MVC terms, it's the synchronization between the `model`(data) and the `view`.

### 5. Services

- Services provide reusable functionalities that are independent of the views
- *Components should not fetch or save data directly*
- fetching and saving data should be delegated to a service. Since the service is independent of the view, it can be reused anywhere in the app where the data should be communicated.



### 6. Directives

Директивы - это классы, которые добавляют дополнительное поведение элементам ДОМ.

There are three kinds of directives:

1. Components -- Directive with a template
  - компонент это тоже директива,
  - самая распространенная
  - на них строится вся структура приложения

```ts
@Component({
	selector: "app-user-card",
	template: `<div>{{ name }}</div>`,
})
export class UserCardComponent {
	name = "Anton";
}
```

1. Structural Directives -- change the DOM layout, add and remove DOM elements
  - Меняют структуру ДОМ
  - Добавляют/удаляют/повторяют элементы

```html
@If (isLoggedIn) {
    <div> Youre logged in </div>
}
@for (item of items; track item.id){
    <li>{{ item.name }}</li>
}
```

1. Attribute Directives -- change the appearance or behavior of an element, component or other directive
  - Меняют внешний вид/ поведение элемента
    - Не меняют структуру ДОМ.
    - `ngClass` -- динамическое добавление/удаление CSS класса. (clfx analogy)
    - `ngStyle` -- динамические инлайн стили
    - `ngModel` -- двустороннее связывание данных

```ts
@Directive({
    selector: '[appHighlight]'
})
export class HighlightDirective {
    constructor(private el: ElemetRef){
        el.nativeElement.style.backgroundColor = 'yellow';
    }
}
```

---

## Installing Angular

- Install Node
- run `npm install -g @angular/cli` from any dir with `-g` flag for global

Angular CLI provides an auto-generation tool for the files and file structure

### Creating a new project

- create a dir for the app
- cd into that dir
- run `ng new <app-name>` 
  `new` flag tells ng to generate all the files required for a new default app
  `<app-name>` is the name of the root directory
- installer will promt questions
  - `Angular Routing` - say no
  - `format of stylesheet` - pick CSS

---

## Project Structure

Angular generates system files for the app

- `src/app` is the component dir, has all files to be uploaded to the web server.
- `src/index.html` is the root html file.
- `package.json` is the package file, lists all installed packages.
- dont worry about others in this course?


#### main.ts

- `src/main.ts` is the main ts script, 
  - all other files are loaded through this script.
  - defines which of the angular mode files will be bootstrapped as the root module/entry component.
  - inserting a bootstrapped component triggers a cascade component creation, fills the tree of components for the app.



#### AppModule

`AppModule` represents the entire application
    - defined in the `src/app/app.module.ts`
    - imports `AppComponent` from `./app.component`

```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
```



#### Components

- 4 files start with app.component.*
  1. `app.component.css` -- stylesheet for the component (optional + included in app.component.ts)
  2. `app.component.html` -- component html (optional + included in app.component.ts)
  3. `app.component.spec.ts` -- used for testing, not used in this course
  4. `app.component.ts` -- TS file, containing the code for the component.


```ts
// AppComponent
import { Component } from '@angular/core';

@Component({ // component decorator
    selector: 'app-root', // html tag for the component
    templateUrl: './app.component.html', // defines path to the html 
    styleUrls: ['./app.component.css'] // array defines paths to the css imports
})
export class AppComponent {
    title = 'app';
}
```

#### Component selector

Each component has a selector == I am to define my own HTML tags for the components.

```html
<menu></menu>
<navBar></navBar>
<signUpForm></signUpForm>
```
None of these tags are part of HTML, but as long as they're defined as Angular components with these selectors, Angular will replace them with their HTML respective templates and components.

#### Index.html

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title>My App</title>
        <base href="/" />
        <meta name="viewport" content=“width=device-width, initial-scale=1” />
        <link rel="icon" type="image/png" href="assets/icon/favicon.png" />
    </head>
    <body>
        <app-root></app-root> <!-- the app component selector is "app-root" => it will be placed anywhere where this tag is-->
    </body>
</html>
```

---

## Templates

Templates contain HTML that forms the `view` of the component.
The template doesn't have to be a separate HTML file. It can be included directly as a string.

```ts
import { Component } from '@angular/core';
@Component({
    selector: 'my-app',
    template: '<h1>Hello {{ name }}</h1>'
})
export class AppComponent { name = 'Angular'; }
```

- the AppComponent class defines a property name with the initial value 'Angular'
- the name is then used in the template with {{name}}, that inserts the value of the name into HTML directly.

---

## Data binding
Data binding is fundamental technique of modern web development.
- Data bingind creates a dynamic connection between the HTML and the data that it was bound to.
- If data changes, HTML will be automatically updated, without needing to write any code to perform the update.

In the template, properties are surrounded with {{}} to denote one way data binding.

### Building an Angular project
Angular's purpose is to make building larger websites more manageable
- the contents of src/ are not in optimal form to distribute to a large audience.
- we should build the contents of src/ into more compact representation for distribution
- `ng build` runs the building process that creates a distributable package that contains code for a fully functional Angular website

### The dist/ directory
- `ng build` creates a dist/ 
- this is the code to upload to the webserver
- contains index.html and several JS files(compiled from TS)
- the *.map files are used for debugging (not running the app)


---

## Running Application
A build app must be served.
When building an app, it's slow to build, upload and reload the webpage
`ng serve` is the command that runs it's own development server and automatically updates on changes.
`--open` flag will also attempt to open and load in the browser.

* `ng serve --open`


---

## CSS framework - Bootstrap

CSS framework allows to create standards complain webpages with CSS quicker
Bootstrap is used in this course.
- run `npm install bootstrap –save` in the root dir to install
- update the `angular.json` to add bootstrap to angular.

Example of the updated line:
```json
"styles" : [
    "node_modules/bootstrap/dist/css/bootstrap.min.css",
    "src/styles.css"
]
```

--- 

## Commands for angular

Install Angular CLI
`npm install –g @angular/cli`

Create New App
`ng new my-app`

Build New App
`ng build`

Serve New App
`ng serve --open`