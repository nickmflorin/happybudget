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
Typically, version 8.17.0 is a safe bet, as anything lower than 8.0.0 is likely
a candidate to cause a problem.

```bash
$ nvm install 10.12.0
$ nvm use 10.12.0
```

Confirm that `nvm` is pointing at the correct Node version:

```bash
$ nvm current
$ v10.12.0
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
file is not version tracked, and you should ask a team member for the values that
are needed to populate the `.env.local` file.

## Development

### Running Locally

Once the dependencies are installed via `yarn` and the `.env.local` file is
present, all you need to do to start the development server is the following

```bash
$ yarn start
```

#### Local Domain Caveat

Our authentication protocols rely on the ability to set cookies in the response that dictate user sessions and
information.  Recent Google Chrome security improvements have introduced the caveat that the browser no longer
considers `localhost` a valid domain, so setting cookies in the backend for the frontend application no longer
works when running the application on `localhost`.  For this reason, the application is configured locally to
**only** work on `127.0.0.1:3000`, not `localhost:3000`.
