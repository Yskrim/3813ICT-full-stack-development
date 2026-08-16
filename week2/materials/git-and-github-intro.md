# Git and github introduction

### What is git?

- free open source version control software.
- used for source code management + keeping track of changes in any set of files.
- stores data as series of snapshots of the content that has been staged inside hidden .git/
- is installed locally, but can be connected and used in the cloud.

### CI/CD (continuous integration/continuous delivery)

- software practice that automates integration of code and deployment of software from multiple contributors.
- Creates a workflow that:
  1. manages version control
  2. enables code review tools
  3. builds and automates deployment
- Human may or may not be in the workflow from development to deployment.
- CI/CD is out of scope for this subject.

### Git installation

`brew install git`
`git --version`

### What is github?

- web-based hosting for version control over git.
- offers distributed version control
- offers source code management (SCM)
- full git functionality + own features:
  1. access control
  2. bug tracking
  3. feature requests
  4. task management
  5. wikis for every project

Github has now 180M devs and 420M repos == largest host of source code in the world.
Github is owned by Microsoft.

### Other alternative remote clients:

- Gitlab
- Gitea
- Bitbucket
- Codeberg

### GH offers student subscription with all features for free while studying.

https://github.com/education/students // I already got it, but haven't checked what features it enables.

### how to make the first repo?

1. On github create a new repo
2. Add new files with GUI **like a looser**

OR if new empty project 

1. in a new local repo run `git init`
2. `git add .gitignore`
3. `git add README.md`
4. `git commit -m "first commit"`
5. `git branch -M main`
6. On GH create new project and copy link
7. `git remote add origin <link to emptry repo on GH>`
8. `git push -u origin main`

OR if project already exists locally and git history is tracked

1. `git remote add origin <fresh GH repo link>`
2. `git branch -M main`
3. `git push -u origin main`

### how to use then?
- create new branches to keep features separated.
- commit often
- push when ready
- Merge or rebase when feature is complete and production works well. (I use merge --no-ff to make commits tangible in the history + I don't have long elaborate projects.)
- Always keep a README.md to document details of a project.

README.md MUST contain:
- name of the package
- version number
- general description
- instructions on how to install and use
- any known issues and possible fixes
- authors

### Markdown language
Markdown is a lightweight markup lang with plaintext formatting syntax. 
Usually converted to HTML. 
Useful to store data with semantic markup not linked to the design system + add CSS later on the page + focus on content.
- created in 2004 by John Gruber and Aaron Swartz.
- easy-2-read and easy-2-write format. (I've been using it for a long time now. It's very quick and easy to style and edit)

