# Contributing

I'm really glad you're reading this, because we need volunteer developers to help this project come to fruition.

We love to receive contributions from our community — you! There are many ways to contribute, from writing tutorials or blog posts, improving the documentation, submitting bug reports and feature requests or writing code which can be incorporated into project itself.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.


## Code of Conduct

This project has adopted a Code of Conduct that we expect project participants to adhere to. Please read [the full text](https://github.com/lykmapipo/mongoose-gridfs/blob/master/CODE_OF_CONDUCT.md) so that you can understand what actions will and will not be tolerated.


## Open Development

All work happens directly on [GitHub](https://github.com/lykmapipo/mongoose-gridfs). Both core team members and external contributors send pull requests which go through the same review process.


## Branch Organization

We will do our best to keep the [`master` branch](https://github.com/lykmapipo/mongoose-gridfs/tree/master) in good shape, with tests passing at all times. 

If you send a pull request, please do it against the [`master` branch](https://github.com/lykmapipo/mongoose-gridfs/tree/master).


## Semantic Versioning

This project follows [semantic versioning](http://semver.org/). We release patch versions for bugfixes, minor versions for new features, and major versions for any breaking changes.


## Where to Find Known Issues

We are using [GitHub Issues](https://github.com/lykmapipo/mongoose-gridfs/issues) for all issues. Before filing a new task, try to make sure your problem doesn't already exist.


## Proposing a Change

If you intend to change the public API, or make any non-trivial changes to the implementation, we recommend [filing an issue](https://github.com/lykmapipo/mongoose-gridfs/issues/new). This lets us reach an agreement on your proposal before you put significant effort into it.

If you're only fixing a bug, it's fine to submit a pull request right away but we still recommend to file an issue detailing what you're fixing. This is helpful in case we don't accept that specific fix but want to keep track of the issue.


## Your First Pull Request

Working on your first Pull Request? You can learn how from this free video series:

**[How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)**

If you decide to fix an issue, please be sure to check the comment thread in case somebody is already working on a fix. If nobody is working on it at the moment, please leave a comment stating that you intend to work on it so other people don't accidentally duplicate your effort.

If somebody claims an issue but doesn't follow up for more than two weeks, it's fine to take it over but you should still leave a comment.


## Sending a Pull Request

The core team is monitoring for pull requests. We will review your pull request and either merge it, request changes to it, or close it with an explanation. We'll do our best to provide updates and feedback throughout the process.


## Style Guide

Look at [Airbnb's Style Guide](https://github.com/airbnb/javascript) will guide you in the right direction.

## Git Commit Guidelines

We have very precise rules over how our git commit messages can be formatted. This leads to **more readable messages** that are easy to follow when looking through the **project history**. But also, we use the git commit messages to **generate change log**.

The commit message formatting can be added using a typical git workflow or through the use of a CLI wizard ([Commitizen](https://github.com/commitizen/cz-cli)). To use the wizard, run `npm run cmt` in your terminal after staging your changes in git.

### Commit Message Format
Each commit message consists of a **header**, a **body** and a **footer**. The header has a special format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

Any line of the commit message cannot be longer 100 characters!. This allows the message to be easier to read on GitHub as well as in various git tools.

### Revert
If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted. A commit with this format is automatically created by the [`git revert`](https://git-scm.com/docs/git-revert) command.

### Type
Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing or correcting existing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Scope
The scope could be anything specifying place of the commit change. You can use `*` when the change affects more than a single scope.

### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

### Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

### Footer
The footer should contain any information about **Breaking Changes** and is also the place to [reference GitHub issues that this commit closes](https://help.github.com/articles/closing-issues-using-keywords/).

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.


## License

By contributing, you agree that your contributions will be licensed under its MIT license.


## Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

* (a) The contribution was created in whole or in part by me and I
  have the right to submit it under the open source license
  indicated in the file; or

* (b) The contribution is based upon previous work that, to the best
  of my knowledge, is covered under an appropriate open source
  license and I have the right under that license to submit that
  work with modifications, whether created in whole or in part
  by me, under the same open source license (unless I am
  permitted to submit under a different license), as indicated
  in the file; or

* (c) The contribution was provided directly to me by some other
  person who certified (a), (b) or (c) and I have not modified
  it.

* (d) I understand and agree that this project and the contribution
  are public and that a record of the contribution (including all
  personal information I submit with it, including my sign-off) is
  maintained indefinitely and may be redistributed consistent with
  this project or the open source license(s) involved.
