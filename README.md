# VotingWorks Election Management System

The EMS (Election Management System) app will be used in the following ways:

- An election offical can:
  - [ ] create an election file with single-seat contests on a single ballot.
  - [ ] download `election.json` file which can be imported into BMD.

## Public Demo

The `master` branch of this repo is auto-deployed to:

- <https://ems.votingworks.app>

Each [pull request](https://github.com/votingworks/ems/pulls) will have a unique
demo url which can be found in the comments of the pull request.

## Local Development

- `yarn install` - Install the dependencies.
- `yarn start` - Run the app locally.
- `yarn test`- Run tests in interactive mode.
- `yarn test:precommit` - Run all tests and display coverage report.

See `package.json` for all available scripts.

## Technical Implementation

This project was bootstrapped with
[Create React App](https://github.com/facebook/create-react-app) for TypeScript.
It uses [Styled Components](https://www.styled-components.com/docs/) instead of
`css` directly.

[ESLint](https://eslint.org/), [TSLint](https://palantir.github.io/tslint/), and
[Prettier](https://prettier.io/) are used to maintain clean code.

[Jest](https://jestjs.io/), [dom-testing-library](https://testing-library.com)
and [react-testing-library](https://github.com/kentcdodds/react-testing-library)
are used to test components and end-to-end user flows.

A pre-commit hook will run all lint and test scripts. View `package.json` for
all available scripts.
