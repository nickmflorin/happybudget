# Green Budget

### System Requirements

- yarn
- nvm

## Getting Started

#### Step 1: Repository

Clone this repository locally and `cd` into the directory.

```bash
$ git clone https://github.com/Saturation-IO/greenbudget-frontend.git
```

#### Step 2: Environment

##### Node Version

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

##### Dependencies

Now we need to setup the dependencies. We use [`yarn`](https://yarnpkg.com/)
as a package management system. This should be included as a part of the
`nvm` current node installation.

To install the dependencies, simply do

```bash
$ yarn install
```

This will install the project dependencies in the `package.json` file.

##### ENV File

Finally, we need to create and edit a `.env.local` file in the project root to
include the configuration that the frontend application relies on. This
file is not version tracked, and contains some sensitive information.  As such,
you will need to request the configuration parameters outside the ones shown below 
from a team member.

At a bare minimum, the `.env.local` file must contain the following configuration:

```bash
REACT_APP_API_DOMAIN=http://local.greenbudget.io:8000
REACT_APP_PRODUCTION_ENV=local
```

## Development

### Running Locally

Once the dependencies are installed via `yarn` and the `.env.local` file is
present, we need to setup our `/etc/hosts` file such that we can use `local.greenbudget.io`
as a valid domain for the local development server.

Edit your `/etc/hosts` file as follows:

```bash
$ sudo nano /etc/hosts
```

Add the following configuration to the file:

```bash
127.0.0.1       local.greenbudget.io
```

Now, when we start the development server, we will be able to access the application at
`local.greenbudget.io:3000`.

To start the development server, run the following command:

```bash
$ yarn start
```

