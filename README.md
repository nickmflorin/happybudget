# HappyBudget

[HappyBudget][homepage] is an application that provides modern, collaborative and web-based
budgeting tools for the film production industry. This repository serves as the client-side
application - a project built using the [React][react] framework which consumes a REST API developed
using [Django REST Framework][drf]. The REST API is developed and maintained in a separate
repository, [happybudget-api][api-repository].

This project is developed around the [Create React App][create-react-app] framework, but is in the
process of being migrated towards the [NextJS][nextjs] framework.

&copy; Nick Florin, 2022

### System Requirements

- [nvm][nvm]
- [Node][node] v18
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

[Node][node] is the engine that supports the application. This project uses [Node][node] v18. To
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

We now need to establish the version of [Node][node], 18, that will be used for this project. This
project comes equipped with a `.nvmrc` file that automatically tells [nvm][nvm] what version of
[Node][node] to use - but that version may still need to be installed.

First, instruct [nvm][nvm] to use the [Node][node] version specified by the `.nvmrc` file with the
following command:

```bash
$ nvm use
```

If you see an output similar to the following:

```bash
Found '/<path-to-repository>/happybudget/.nvmrc' with version <v18.0.0>
Now using node v18.0.0 (npm v8.6.0)
```

It means that the correct version of [Node][node] that is required for this project is already
installed with [nvm][nvm] and that version of [Node][node] is active for this project's directory.
The rest of this step can be skipped and you can proceed to the next step, "Dependencies".

On the other hand, if you see an error similar to the following:

```bash
Found '/<path-to-repository>/happybudget/.nvmrc' with version <v18.0.0>
N/A: version "v18.0.0 -> N/A" is not yet installed.

You need to run "nvm install v18.0.0" to install it before using it.
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
$ v18.x.x
```

At this point, if [nvm][nvm] is not pointing at the correct version of [Node][node] or is pointing
at a system installation of [Node][node], something went awry - consult a team member before
proceeding.

#### Step 2.b: Dependencies

When setting up the environment for the first time, you must do a fresh install of the dependencies:

```bash
$ npm install
```

This will install the project dependencies in the `package.json` file.

#### Step 2.c: ENV File

When running the application locally, there are two files that are used to define environment
variables that the application relies on:

1. `.env.local`
2. `.env.development`

The `.env.development` file is committed to source control, and its contents should not be changed
unless the intention is to commit the change to the application codebase. On the other hand,
`.env.local` is not committed to source control, and any environment variables placed in
`.env.local` will override those in `.env.development` (or `.env.production` if in a production
environment).

In certain cases you will need to create this `.env.local` file (in the project root) that defines
or overrides environment variables that the application relies on. In other cases, a `.env.local`
file will not be needed, as the environment variables defined in `.env.development` are suitable.

For environment variables that need to be specified in the `.env.local` file - if there are any -
please reach out to a team member when you reach this step. For more information, please refer to
the below section in this documentation, "Environment".

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
$ npm run dev
```

**Note**: If changes were made to the `package.json` file, you may need to install the dependencies
via `npm install`.

Once the development server is running, you should start your work.

#### Building

Before committing any changes you have made, you must ensure that you validate your work by ensuring
that you can successfully build the project:

```bash
$ npm run build
```

This is required because [NextJS][nextjs] does not perform type checks while the development server
is running. Only the `build` command will compile the code and run all type checks.

Sometimes, you may get misleading results from the local build. For instance, you might notice that
the build is failing due to errors that you had just fixed, but were not picked up in the subsequent
build. This can happen because [NextJS][nextjs] will cache part of the build. To fix this, or as as
a general sanity-check, clear the cache before running the build:

```bash
$ rm -rf ./.next
$ npm run build
```

**Note**: [NextJS][nextjs] will also automatically perform linting checks during the `build`
process - any linting errors will result in the build failing automatically but linting warnings
will not. This includes linting performed by [ESLint][eslint], [Stylelint][stylelint] and
[Prettier][prettier].

#### Linting

This project uses [ESLint][eslint] to lint files that are not CSS or SCSS based,
[Stylelint][stylelint] to lint files that are CSS or SCSS based, and [Prettier][prettier] inside of
the [ESLint][eslint] configuration which will format and lint files of all types.

[NextJS][nextjs] will automatically perform linting checks during the `build` process, but it is
desired that they be performed independently without performing the entire `build` process, use the
following command:

```bash
$ npm run lint
```

This will run [ESLint][eslint], [Stylelint][stylelint] and [Prettier][prettier] on the project.

With that being said, the project's [Jest][jest] testing suite is configured to perform linting and
formatting checks via [ESLint][eslint], [Stylelint][stylelint] and [Prettier][prettier] as well.
This is the recommended way to perform the checks, because the output is much, much more suitable
for debugging and the hot reloading feature of [Jest][jest] will save you a lot of time.

This can be done simply as:

```bash
$ npm run test
```

**Note**: The `npm run lint` command is actually not run during the build and is excluded from the
`JenkinsFile`. Instead, the linting checks are performed indirectly via the [Jest][jest] testing
suite, which will also perform unit tests and other checks not related to linting. For more
information, please refer to the [Testing Documentation](src/docs/TESTING.md).

##### Formatting & Code Style

The philosophy that the project has in regard to formatting and/or code styles can be summarized as
follows:

> There is usually not a right or wrong answer, but it is better to choose than to not.

In other words, many formatting rules were not chosen for a specific reason other than having a
decision. It is better to rely on the available formatting tools to remove as much ambiguity as
possible, rather than spending time debating or arguing the rules themselves.

## Environment

There are 3 distinct environments that the application runs in, with the current environment being
dictated by the `NODE_ENV` environment variable:

| Environment (`NODE_ENV`) | Default Environment File | Override Environment File | Overridden by `.env.local` |
|:------------------------:|:------------------------:|:-------------------------:|:--------------------------:|
|      `development`       |    `.env.development`    | `.env.development.local`  |            Yes             |
|       `production`       |    `.env.production`     |  `.env.production.local`  |            Yes             |
|          `test`          |       `.env.test`        |            N/A            |             No             |

Additionally, there is a third environment file, `.env`, that contains environment variables that
define environment variables for _all_ environments.

For each environment the default environment file specifies defaults that the environment variable
will have for the file's associated environment. These files should _always_ be committed to source
control.

When the environment is `development`, the default environment variables will be loaded from
`.env.development`. Similarly, when the environment is `production`, the default environment
variables will be loaded from `.env.production`. Finally, when the environment is `test`, the
default environment variables will be loaded from `.env.test`. In each case, any environment
variables defined in the environment specific file, `.env.${NODE_ENV}`, will override those defined
in the global environment variable file, `.env`.

### Local Overrides

It is often necessary that the environment variables for any given environment be overridden, either
locally in development or on a server. When overriding the default environment variables for a given
environment is required, a `.env.local` file is used. The environment variables defined in this file
will override the default environment variables _only when in a `production` or `development`
environment_. If the environment is `test`, the environment variables in `.env.local` will not be
loaded.

Note that if you would like to override the environment variables for just a single environment, a
corresponding `.env.development.local` or `.env.production.local` file can be used. Each of these
files will be given precedence over the `.env.local` file.

For further documentation regarding the environment configuration, please see the
[NextJS Documentation](https://nextjs.org/docs/basic-features/environment-variables).

### Environment Variables

The environment variables that are currently used in the application are documented as follows:


| Name                                                     | Base Default |    Dev Default     |   Prod Default    | Test Default |
|----------------------------------------------------------|:------------:|:------------------:|:-----------------:|:------------:|
|                                                          |    `.env`    | `.env.development` | `.env.production` | `.env.test`  |
| `ROARR_LOG`                                              |     N/A      |       `true`       |      `true`       |     N/A      |
| Controls whether or not logs are emitted on the server.  |              |                    |                   |              |
| `NEXT_PUBLIC_ROARR_BROWSER_LOG`                          |     N/A      |       `true`       |      `false`      |     N/A      |
| Controls whether or not logs are emitted in the browser. |              |                    |                   |              |
| `NEXT_PUBLIC_TABLE_DEBUG`                                |     N/A      |      `false`       |        N/A        |     N/A      |
| Controls whether or not AG Grid tables are rendered in "debug" mode. For more information about "debug" mode, please refer [to the AG Grid documentation](https://www.ag-grid.com/react-data-grid/grid-options#reference-miscellaneous-debug). | | | |
| `NEXT_PUBLIC_API_DOMAIN`                                 | N/A          | `http://local.happybudget.io:8000` |        N/A        | N/A          |
| `NEXT_PUBLIC_APP_DOMAIN`                                 | N/A          | `http://local.happybudget.io:3000` |        N/A        | N/A          |
| `NEXT_PUBLIC_PRODUCTION_ENV`                             | N/A          | `local`                            |        N/A        | N/A          |
| `NEXT_PUBLIC_BILLING_ENABLED`                            | N/A          | `false`                            |      `false`      | N/A          |
| `NEXT_PUBLIC_SOCIAL_AUTHENTICATION_ENABLED`              | N/A          | `false`                            |      `false`      | N/A          |
| `NEXT_PUBLIC_AG_GRID_KEY`                                | N/A          | `<token>`                          |     `<token>`     | N/A          |

## Package Installs

The `npm` tool is great - it really simplifies package management in a JS based application. While
it is understandable that the tool does not offer this (due to the autogenerated nature of a
`package.json` file) it would be helpful at times if comments could be left near associated packages
to provide reasoning for why sometimes more obscure and "not-directly-imported" packages are
installed.

Since we cannot do that, this section of the documentation is dedicated to outlining brief reasons
why a given package may be installed, when the reason is _not obvious_.

1. [`@babel/runtime`](https://www.npmjs.com/package/@babel/runtime): This package is installed to
   avoid the following error that is sometimes seen when running tests using [Jest][jest]:

   ```bash
   Uncaught TypeError: _interopRequireDefault is not a function
   ```

   [Credit](https://github.com/reactjs/react-transition-group/issues/698)

2. [`pretty-format`](https://www.npmjs.com/package/pretty-format): This package is used by
   [Jest][jest] to render highlighted, formatted "diffs" when tests that compare two different
   values fail. There are often times collisions with third-party packages that also use this
   package, so installing it manually prevents those collisions from causing problems during tests.

   [Credit](https://stackoverflow.com/questions/73735599/jest-failed-tests-no-longer-provide-failure-info-only-maxlength-error)

3. [`ts-jest`](https://www.npmjs.com/package/ts-jest): This package is required to properly run
   [SASS][sass] unit tests in [Jest][jest].

   When [SASS][sass] tests are being run, the `testEnvironment` configuration for [Jest][jest] needs
   to be altered to `"node"` (which is not what is used for the other tests in the application).
   When the [SASS][sass] tests run, [Jest][jest] is pointed to a single entry-point file,
   `src/styles/tests/scss.spec.ts`, which then uses the `"sass-true"` package to collect
   `*.test.scss` files and run them. Since the entrypoint file is a `.ts` file, the `ts-jest`
   package is required such that [Jest][jest] can properly parse the file when the `testEnvironment`
   is `"node"`.

4. [`jest-expect-message`](https://www.npmjs.com/package/jest-expect-message): This package allows
   us to use the [Jest][jest] `expect` method with an optionally provided second argument, which can
   be provided as a custom error message that should be raised if the `expect` fails. This is very
   useful in situations where additional context will help a developer more quickly and easily
   diagnose test failures.

   This package requires that the file string `"node_modules/jest-expect-message/types/index.d.ts"`
   is added to the `files` option of the `tsconfig.json` and that `"jest-expect-message"` is added
   to the `setupFilesAfterEnv` option for the [Jest][jest] config (in
   `src/__tests__/components/jest.config.ts`).

[homepage]: ./ReadMe.md
[api-repository]: https://github.com/nickmflorin/happybudget-api
[react]: https://reactjs.org/
[drf]: https://www.django-rest-framework.org/
[create-react-app]: https://reactjs.org/docs/create-a-new-react-app.html
[nvm]: https://github.com/nvm-sh/nvm
[node]: https://nodejs.org/en/
[postgres]: https://www.postgresql.org/
[nextjs]: https://nextjs.org/
[prettier]: https://prettier.io/
[vscode]: https://code.visualstudio.com/
[stylelint]: https://stylelint.io/
[eslint]: https://eslint.org/
[jest]: https://jestjs.io/docs/getting-started
[sass]: https://sass-lang.com/
