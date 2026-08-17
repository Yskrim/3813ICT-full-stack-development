# Git for Local repositories

`git init` -- start tracking verisons.
`git clone <GH link>` -- download a gh repo from the cloud.

### Workflow

`(User A)
    └── Adds changes ──┐
                    (STAGE)
                        └── Commit ──┐
                                (LOCAL REPO) ───┐
                                                ├── Push/Pull ──(REMOTE REPO)
                                (LOCAL REPO) ───┘
                        ┌── Commit ──┘
                    (STAGE)
    ┌── Adds changes ──┘
(User B)`

Files can be tracked and untracked, user decides what to track.
If files of specific extension are taking to much space -> they can be added to .gitignore:

- \*.pdf
- \*.mp4
- myrepo/\*.txt
- SystemFiles/

`git status` to see what has changed since last commit, what is current branch and other details
`git add .` to add everything OR `git add <filename>` to add specific file
`git restore --staged .` to unstage all added files OR `git restore --staged <filename>` for specific restore.
`git commit -m " -m is a message flag";` == a local commit
AFTER THIS
`git push -u origin <branch name>` if never pushed this repo OR `git push` if remote is set up already
`git reset HEAD~n` n for number of commits to go back. `--soft --hard` flags for more control.
`git push --force` override most recent commits with new local ones if head has been reset.

