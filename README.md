# HappyBudget

[HappyBudget][homepage] is an application that provides modern, collaborative and web-based
budgeting tools for the film production industry. This repository serves as the client-side
application - a project built using the [React][react] framework which consumes a REST API developed
using [Django REST Framework][drf]. The REST API is developed and maintained in a separate
repository, [happybudget-api][api-repository].

This project is developed around the [Create React App][create-react-app] framework, but is in the
process of being migrated towards the [NextJS][nextjs] framework.

&copy; Nick Florin, 2022

**This project is protected by registered U.S. copyright TXu 2-319-982.**

### System Requirements

- [nvm][nvm]
- [Node][node] v20
- [postgres][postgres]

## Getting Started

This section of the documentation outlines - at a high level - how to setup your local machine and
your local environment to properly run and contribute to the application.

### Step 1: Repository

Clone this repository locally and `cd` into the directory.

```bash
$ git clone git@github.com:nickmflorin/happybudget.git
```

### Step 2: Environment

After the repository is cloned, the next step is to setup your local development environment.

#### Step 2.a: Node

[Node][node] is the engine that supports the application. This project uses [Node][node] v20. To
install the correct version of [Node][node], we will use [nvm][nvm] - a [Node][node] version
manager.

**Important**: Do not use a system installation of [Node][node]. It will complicate your development
environment.

##### Step 2.a.i: NVM

We use [nvm][nvm] to manage [Node][node] versions. It allows us to isolate the version of
[Node][node] being used to the project directory, avoiding conflicts with global or system
installations of [Node][node].

Instructions for installing [nvm][nvm] can be found
[here](https://github.com/nvm-sh/nvm#installing-and-updating), but are also mentioned below for
purposes of completeness:

First, simply run the install script:

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

The above command will download a script and then run it. The script first clones the [nvm][nvm]
repository at `~/.nvm` and then attempts to add the following source lines to your machine's shell
profile script (`~/.bash_profile`, `~/.zshrc`, `~/.profile`, or `~/.bashrc`):

```bash
$ export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```

**Note**: _This installation will automatically make changes to your shell profile script. The exact
file will depend on the type of machine you are running as well as the period of time in which the
machine was created. Most likely, your shell profile script will be `~/.zshrc` - which is the shell
profile used for Mac's created since the introduction of the M1 processor._

Since the [nvm][nvm] installation involved making changes to your shell profile script behind the
scenes, in order for those changes to take effect you need to source your `~/.zshrc` (or whatever
shell script your system uses):

```bash
$ . ~/.zshrc`
```

Finally, verify that your system recognizes the `nvm` command by running the following:

```bash
$ nvm
```

##### Step 2.a.ii Node Version

We now need to establish the version of [Node][node], 20, that will be used for this project. This
project comes equipped with a `.nvmrc` file that automatically tells [nvm][nvm] what version of
[Node][node] to use - but that version may still need to be installed.

First, instruct [nvm][nvm] to use the [Node][node] version specified by the `.nvmrc` file with the
following command:

```bash
$ nvm use
```

If you see an output similar to the following:

```bash
Found '/<path-to-repository>/happybudget/.nvmrc' with version <v20.0.0>
Now using node v20.0.0 (npm v8.6.0)
```

It means that the correct version of [Node][node] that is required for this project is already
installed with [nvm][nvm] and that version of [Node][node] is active for this project's directory.
The rest of this step can be skipped and you can proceed to the next step, "Dependencies".

On the other hand, if you see an error similar to the following:

```bash
Found '/<path-to-repository>/happybudget/.nvmrc' with version <v20.0.0>
N/A: version "v20.0.0 -> N/A" is not yet installed.

You need to run "nvm install v20.0.0" to install it before using it.
```

It means that the correct version of [Node][node] that is required for this project is not already
installed with [nvm][nvm], and must be installed before using it. To do this, simply run the
following command:

```bash
$ nvm install
```

This command will use [nvm][nvm] to install the correct version of [Node][node] that is required for
this project, based on the specification in the project's `.nvmrc` file.

Finally, all that is left to do is to instruct [nvm][nvm] to use this version of [Node][node] by
executing the following command:

```bash
$ nvm use
```

For a sanity check, confirm that [nvm][nvm] is pointing to the correct version of [Node][node] in
the project directory by executing the following command:

```bash
$ nvm current
```

The output of this command should be similar to the following:

```bash
$ v20.x.x
```

At this point, if [nvm][nvm] is not pointing at the correct version of [Node][node] or is pointing
at a system installation of [Node][node], something went awry - consult a team member before
proceeding.

#### Step 2.b: Dependencies

When setting up the environment for the first time, you must do a fresh install of the dependencies:

```bash
$ yarn install
```

This will install the project dependencies in the `package.json` file.

#### Step 2.c: ENV File

When running the application locally, the `.env.local` file is used to define environment
variables that the application relies on.

For environment variables that need to be specified in the `.env.local` file - if there are any -
please reach out to a team member when you reach this step.

##### FontAwesome Caveat

For whatever reason, the geniuses at FontAwesome decided that the only way to authenticate your
license is to include the authentication token in your OS's environment. This means that storing the
token in your `.env.local` file will not authenticate our FontAwesome license.

To do this, simply edit your `~/.zshrc` (or `~/.bash_profile`, or whatever your default shell
profile is):

```bash
$ nano ~/.zshrc
```

Then, simply add the line:

```bash
export FONTAWESOME_NPM_AUTH_TOKEN=37B2CABC-2FBC-4340-B5BD-0375475CF95D
```

Source your shell profile and then the FontAwesome token should be available to the application.

```bash
$ . ~/.zshrc
```

#### Step 2.d: Hosts Configuration

Before running the development server, we need to setup our `/etc/hosts` file such that we can use
`local.happybudget.io` as a valid domain for the local development server.

Note that this step is also performed while configuring the [happybudget-api][api-repository]
repository for local development - so if you already configured that repository properly this step
can be skipped.

Edit your `/etc/hosts` file as follows:

```bash
$ sudo nano /etc/hosts
```

Add the following configuration to the file:

```bash
127.0.0.1       local.happybudget.io
```

Now, when we start the development server, we will be able to access the application at
`local.happybudget.io:3000`.

## Development

### IDE

This project is optimized for development using the [VSCode][vscode] IDE. While other IDEs may also
work in this repository, you must take steps to ensure that our editor configurations (like trimmed
whitespace, indentation, and `prettyprint` with [Prettier][prettier]) that are applied to this
repository while using [VSCode][vscode] are also consistently applied in your IDE. This ensures that
your commits will conform to the established repository style.

### Workflow

#### Pulling

The typical workflow should always begin by pulling down the latest state of the repository from
[GitHub](https://github.com/):

```bash
$ git pull
```

#### Running Locally

### Running Locally

After pulling down the latest state of the repository, the development server can be started by
running the following command:

```bash
$ yarn start
```

**Note**: If changes were made to the `package.json` file, you may need to install the dependencies
via `yarn install`.

Once the development server is running, you should start your work.

#### Building

Before committing any changes you have made, you must ensure that you validate your work by ensuring
that you can successfully build the project:

```bash
$ yarn build
```

#### Linting

This project uses [ESLint][eslint] and [Prettier][prettier] inside of
the [ESLint][eslint] configuration which will format and lint files of all types.

```bash
$ yarn lint
```

This will run [ESLint][eslint] and [Prettier][prettier] on the project.

##### Formatting & Code Style

The philosophy that the project has in regard to formatting and/or code styles can be summarized as
follows:

> There is usually not a right or wrong answer, but it is better to choose than to not.

In other words, many formatting rules were not chosen for a specific reason other than having a
decision. It is better to rely on the available formatting tools to remove as much ambiguity as
possible, rather than spending time debating or arguing the rules themselves.

[homepage]: ./ReadMe.md
[api-repository]: https://github.com/nickmflorin/happybudget-api
[react]: https://reactjs.org/
[drf]: https://www.django-rest-framework.org/
[create-react-app]: https://reactjs.org/docs/create-a-new-react-app.html
[nvm]: https://github.com/nvm-sh/nvm
[node]: https://nodejs.org/en/
[postgres]: https://www.postgresql.org/
[prettier]: https://prettier.io/
[vscode]: https://code.visualstudio.com/
[eslint]: https://eslint.org/
