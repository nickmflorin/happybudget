# HappyBudget

&copy; Nick Florin, 2022

### System Requirements

- yarn
- nvm
- node v17.0.0

## Getting Started

### Step 1: Repository

Clone this repository locally and `cd` into the directory.

```bash
$ git clone https://github.com/nickmflorin/happybudget.git
```

### Step 2: Environment

#### Node

[Node](https://nodejs.org/en/) is the engine that supports the application.

##### NVM

We use [`nvm`](https://github.com/nvm-sh/nvm) to manage [Node](https://nodejs.org/en/) versions.  It allows us to isolate
the version of [Node](https://nodejs.org/en/) being used to the project directory, avoiding conflicts with globally
installed versions of [Node](https://nodejs.org/en/).

To install [`nvm`](https://github.com/nvm-sh/nvm), simply run the following command:

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
```

This command will automatically add the following to your `~/.zshrc`:

```bash
$ export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```

In order for the changes to the `~/.zshrc` to take effect, we need to source it:

```bash
$ . ~/.zshrc`
```

Now, when we run `nvm` in the terminal, the system should recognize the command.

##### Node Version

We now need to establish the version of [Node](https://nodejs.org/en/), 17.0.0, that will be used for this
project.  To do this, simply install the version of [Node](https://nodejs.org/en/) locally to this project
using [`nvm`](https://github.com/nvm-sh/nvm):

```bash
$ nvm install 17.0.0
```

Then, tell [`nvm`](https://github.com/nvm-sh/nvm) this is the version we want to use:

```bash
$ nvm use 17.0.0
```

Confirm that [`nvm`](https://github.com/nvm-sh/nvm) is pointing at the correct [Node](https://nodejs.org/en/) version
before proceeding:

```bash
$ nvm current
$ v17.0.0
```

##### Yarn

Now that v17.0.0 of [Node](https://nodejs.org/en/) is installed, we should have access to [npm](https://www.npmjs.com/),
as [Node](https://nodejs.org/en/) comes equipped with it.  We will use [npm](https://www.npmjs.com/) to install
[yarn](https://yarnpkg.com/), which we will use to manage dependencies in this project:

```bash
$ npm install --global yarn
```

#### Dependencies

Now we need to setup the dependencies. We use [`yarn`](https://yarnpkg.com/)
as a package management system. This should be included as a part of the
`nvm` current node installation.

To install the dependencies, simply do

```bash
$ yarn install
```

This will install the project dependencies in the `package.json` file.

#### ENV File

Finally, we need to create and edit a `.env.local` file in the project root to
include the configuration that the frontend application relies on. This
file is not version tracked, and contains some sensitive information.

For the configuration parameters that are sensitive, you will need to request
the configuration from a team member when setting up.

For the non-sensitive configuration, you can reference the `base_env` file in
the project root for the configuration you will need to start the app locally:

```
REACT_APP_API_DOMAIN=http://local.happybudget.io:8000
REACT_APP_DOMAIN=http://local.happybudget.io:3000
REACT_APP_PRODUCTION_ENV=local
```

Note that these 3 parameters are the only configuration parameters that are
required to start the application - however, the other sensitive configuration
parameters are needed to authenticate our licenses for things like AG Grid and
FontAwesome - so the application will not behave as expected until those
configurations are present in the `.env.local` file.

##### FontAwesome Caveat

For whatever reason, the geniuses at FontAwesome decided that the only way to
authenticate your license is to include the authentication token in your OS's
environment.  This means that storing the token in your `.env.local` file will
not authenticate our FontAwesome license.

To do this, simply edit your `~/.zshrc` (or `~/.bash_profile`, or whatever your
default shell profile is):

```bash
$ nano ~/.zshrc
```

Then, simply add the line:

```bash
export FONTAWESOME_NPM_AUTH_TOKEN=37B2CABC-2FBC-4340-B5BD-0375475CF95D
```

Source your shell profile and then the FontAwesome token should be available to
the application.

```bash
$ . ~/.zshrc
```

## Development

### Workflow

Developers should be free to use whatever workflow works best for them, and the
IDE they use is an important aspect of that workflow.

#### IDE

While it is not required that a developer use
[VSCode](https://code.visualstudio.com/), it is strongly, strongly recommended
that they do.  Usage of [VSCode](https://code.visualstudio.com/) will mean that
the setup for the team's code environment will more seamlessly integrate into
your workflow.

If [VSCode](https://code.visualstudio.com/) is not the ideal IDE for you, that
is fine - but it is your responsibility to make sure that the IDE of your
choosing is properly setup for the team's code environment, which primary relates
to (but is not limited to) linting.

##### Extensions

If using [VSCode](https://code.visualstudio.com/), please make sure to
install the `"dbaeumer.vscode-eslint"` extension from the
[VSCode](https://code.visualstudio.com/) marketplace.

##### `settings.json`

For [VSCode](https://code.visualstudio.com/) to function properly with the
code environment configuration remote to this repository, you should add the
following configurations to your `settings.json` file:

```json
{
	"eslint.options": {},
	"eslint.validate": [
		"javascript",
		"javascriptreact",
		"typescript",
		"typescriptreact"
	],
	"editor.codeActionsOnSave": {
		"source.fixAll.eslint": true
	},
	"[typescript]": {
		"editor.defaultFormatter": "esbenp.prettier-vscode"
	},
	"[typescriptreact]": {
		"editor.defaultFormatter": "esbenp.prettier-vscode"
	},
	"editor.rulers": [
		80,
		100
	],
	"scss.lint.duplicateProperties": "warning",
	"scssFormatter.singleQuote": true,
	"prettier.useTabs": false,
	"eslint.format.enable": true,
	"prettier.jsxSingleQuote": true,
	"prettier.jsxBracketSameLine": true,
	"prettier.printWidth": 120,
	"eslint.alwaysShowStatus": true,
	"eslint.packageManager": "yarn",
	"eslint.run": "onSave",
	"typescript.validate.enable": true
}
```

### Running Locally

Once the dependencies are installed via `yarn` and the `.env.local` file is
present, we need to setup our `/etc/hosts` file such that we can use
`local.happybudget.io` as a valid domain for the local development server.

Note that this step is also performed while configuring the
[happybudget-api](https://github.com/nickmflorin/happybudget-api.git)
repository for local development - so if you already configured that
repository properly this step can be skipped.

Edit your `/etc/hosts` file as follows:

```bash
$ sudo nano /etc/hosts
```

Add the following configuration to the file:

```bash
127.0.0.1       local.happybudget.io
```

Now, when we start the development server, we will be able to access the
application at `local.happybudget.io:3000`.

To start the development server, run the following command:

```bash
$ yarn start
```

