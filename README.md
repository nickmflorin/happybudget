# Green Budget

### System Requirements

- yarn
- nvm

## Getting Started

### Step 1: Repository

Clone this repository locally and `cd` into the directory.

```bash
$ git clone https://github.com/Saturation-IO/greenbudget-frontend.git
```

### Step 2: Environment

#### Node Version

Install [`nvm`](https://github.com/nvm-sh/nvm) first. This will
allow you to manage your Node version on a project basis.

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
```

Use `nvm` to establish the version of Node that you will use with this project.
Typically, version 16.0.0 is a safe bet, but anything lower than 12.0.0 is likely
a candidate to cause a problem.

```bash
$ nvm install 16.0.0
$ nvm use 16.0.0
```

Confirm that `nvm` is pointing at the correct Node version:

```bash
$ nvm current
$ v10.12.0
```

Next, we need to install `yarn`:

```bash
npm install --global yarn
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
REACT_APP_API_DOMAIN=http://local.greenbudget.io:8000
REACT_APP_DOMAIN=http://local.greenbudget.io:3000
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
`local.greenbudget.io` as a valid domain for the local development server.

Edit your `/etc/hosts` file as follows:

```bash
$ sudo nano /etc/hosts
```

Add the following configuration to the file:

```bash
127.0.0.1       local.greenbudget.io
```

Now, when we start the development server, we will be able to access the
application at `local.greenbudget.io:3000`.

To start the development server, run the following command:

```bash
$ yarn start
```

