3813ICT-my-first-git

# TASK1: Setting up GitHub -- DONE

    Create a new git repo and clone it to IDE

---

# TASK2: Cloning and pushing changes -- DONE

- Run `npm init` and create a new node project.
- Add `index.js` and make it `console.log("Hello world")`

---

# TASK3: -- Writing the ReadMe DONE

Writing the README.md

- Project title
- A project description
- install instructions
- run instructions
- write a table of weeks for the course, and the course content

# my-first-git

### Description

This is a lab2 project for 3813ICT - Full stack development
The idea behind this project is to practice git and markdown language.

### install instructions

1. If you don't have node installed, run `brew install node` on macOS OR `winget install OpenJS.NodeJS.LTS` on windows OR `nvm install --lts` on linux.
2. Clone this repo from git with `git clone https://github.com/Yskrim/3813ICT-my-first-git.git`

### Run instructions

1. Run `cd 3813ICT-my-first-git` to open directory
2. Run `node index.js` to run the program.

### Table of weeks for the course

| week |                          topic                          |
| :--: | :-----------------------------------------------------: |
|  1   |             introduction to JS and Node.js              |
|  2   |        code version control with git and github         |
|  3   |                   Node.js as a server                   |
|  4   |                         Angular                         |
|  5   | Data persistence, Services and HTTP request to a server |
|  6   |            Reactive Programming and Sockets             |
|  7   |              Working on Assignment Phase 1              |
|  8   |               NoSQL database and mongoDB                |
|  9   |             MongoDB via Node.js and Angular             |
|  10  |              Unit and integration testing               |
|  11  |                   End to end testing                    |
|  12  |            Assignment Phase 2 Demonstration             |

---

# TASK 4: Branching -- DONE

1. On your local machine, create a new branch called "adding-function" and check out this branch.
2. In index.js, add a function that adds two numbers, and after the "Hello World", print out the sum of 5+10 by calling this function.
3. Push the changes to the branch with the commit message "added adding function"

```js
const addFunc = (a, b) => a + b;
console.log(addFunc(5, 10));
```

# TASK 5 – Merge Conflicts

- Find a partner and have him/her clone your repository and check out the master branch.
- Your partner should change the "Hello World" to "I caused a merge conflict."
- Afterwards your partner should check their changes back into the master branch with the commit message "partner changes".

If there is no partner available for you, you may 
- get back the github website, 
- change the file index.js in the master branch, and commit the change in the github website. 
- Now attempt to merge the local branch "adding function" into the master branch at GitHub. This will involve several steps. 
- You need to pull the latest version from the github website, which will create a merge conflict that need to be resolved.

```js
console.log("Hello world!");

const addFunc = (a, b) => a + b;
console.log(addFunc(5, 10));

<<<<<<< HEAD
console.log("Part 2 of the task");
=======
console.log("I edited this file lol");
>>>>>>> main
```