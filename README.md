# VotingWorks Election Management System (EMS) or VxServer

## Public Demo

- <https://ems.votingworks.app>

Each [pull request](https://github.com/votingworks/ems/pulls) will have a unique
demo url which can be found in the comments of the pull request.

## Install

Prerequisites:

- `git`
- `yarn`
- [`module-converter-sems`](https://github.com/votingworks/module-converter-sems.git)
- [`module-smartcards`](https://github.com/votingworks/module-smartcards/)

Then…

```
git clone https://github.com/votingworks/ems.git
cd ems
yarn install
```

## Run

1. Start
   [`module-converter-sems`](https://github.com/votingworks/module-converter-sems.git).
2. Start
   [`module-smartcards`](https://github.com/votingworks/module-smartcards/).
3. Start the app:

   ```
   yarn start
   ```

## Technical Implementation

This project was bootstrapped with
[Create React App](https://github.com/facebook/create-react-app).

[ESLint](https://eslint.org/) is configured to support TypeScript, additional
linting via [StyleLint](https://stylelint.io/) and formatting via
[Prettier](https://prettier.io/).
