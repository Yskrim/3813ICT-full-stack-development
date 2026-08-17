# Remote repositories

### Origin

origin/<reponame> is a remote version of the local <reponame>
Local changes must be pushed often

`git remote -v` -- view what's the configured remote's url
IF NONE
`get remote add origin <remote url>` -- configure remote if never done before.

### Pulling and fetching

`git fetch origin` -- fetch the changes from remote
`git log main..origin/main` -- see what's new
`git diff main origin/main` -- see what changed

`git pull` -- pull fetches data and merges fetched changes into current branch
`git pull -all` -- pull all updates for all branches

Pulling updates the current active branch as well, so untracked changes may be lost.
**Rule of thumb: `git fetch` is the "look before you leap" version**

### Merge conflicts

It happens when another person has pushed code on the same file I'm editing.
Git would now allow to push until conflict is resolved.

To fix this, I need to chose which version to keep or modify the code to include what another person has written and discard the unwanted code.

Essentially, in any scenario, when two people are working on the same file, with pushed updates, every other person needs to pull the most recent changes to add and push theirs.

### Forking

A fork is a copy of a repo. It allows to change anything without affecting the source.
Forks are used to:

1. Propose changes to someone else's project (like bug fixes, updates).
2. Use someone's project as a starting point of own idea (like adding features).

Normally it is done like this:

`(Fork the repo)
        └─── (Make the fix)
                └─── (Submit a pull request) to the project owner. 
                The code may be reviewed and tested before merging to the production.
`

### Pull requests

Are made to propose and collaborate on changes in a repo. The changes are made in a side branch, keeping the main safe from unwanted changes.

Pull request can only be opened if there are differences between the changed branch and the upstream branch. Also the merge destination branch may be specified in a request.
