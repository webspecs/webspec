
# webspec — a tool to manage WebSpecs

In the Web Platform Specs project, we've taken great care to make sure things are as easy and
straightforward as possible for developers. But we can't magic absolutely *everything* away
just like that. Some aspects, like the legalese bits or some recurring technical items, remain
somewhat in the way.

However this doesn't mean we can't hide them away behind a tool! That's what `webspec` does.

## Installation

    npm install -g webspec

## `webspec new [--dir /path/to/dir]`

Enters the wizard that helps you create a new WebSpec from scratch (don't use that for one you're
forking of course). It is recommended, but not required, that the directory be a freshly checked out
GitHub repository (that's where it will have to go eventually, and having it right away provides
more useful information to the tool). The `--dir` option can be shortened to `-d`; it defaults to
the current directory.

## `webspec check`

Runs a series of automated checks to make sure your WebSpec adheres to the guidelines, does some
linting, etc.

## `webspec version`

Gives you the version of the tool.

## `webspec help`

Prints a help message.
