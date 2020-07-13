# Contributing to The #WOKEWeekly Website

For starters, thank you for your interest in contributing to the #WOKEWeekly website repository.

When contributing, please discuss with [Zavid](https://github.com/zzavidd) before making any changes.

## Branches, Commits & Pull Requests

As is common practice, please ensure you are making your contributions via feature branches which branch off of the `master` branch.

In addition to the standard:

1. Have your branch names in `kebab-case` format i.e. all lowercase characters separating words with hyphens if need be. For example, `api-design`, `test-fix` and `page-refactor`.

2. Ensure that commits made to your branch are as small as possible. This makes your changes easier to review in the pull request. Endeavour to have each commit correct independently.

3. Rebase your branch onto the `master` branch before submitting a pull request to ensure alignment.

4. All pull requests need to pass the check builds as well as have received an approval from Zavid before merging. Upon approval, please ensure that you **squash & merge** to keep commit history clean.


## Code Syntax / Code Style

#### ESLint

It is strongly recommended that you install the [ESLint](https://eslint.org/) plugin in your text editor or IDE.

This plugin is very useful for highlighting problems while you're writing code and ensuring the code you're writing matches the standard convention for this repository.

#### Prettier

Additionally, you should also install the [Prettier](https://prettier.io/) plugin.

This allows you to format your files using the shortcut `Alt` + `Shift` + `F` and helps to maintain the stylistic convention for this repository.

## Run Service Tests

Before pushing your commits to this repository, especially after making changes to server-side code, you should ensure that all service tests pass. 

>**Note:** The following instructions assume that you have at least fulfilled instructions 1 - 5 from the [Development Environment Setup](./docs/dev-environment-setup.md) section.

To run all of the service tests:

1. Ensure you have a command prompt / terminal open at `woke/src`.

2. Run the following command to run all of the service tests using Mocha and display the test results:
   ```
   npm test
   ```

   Alternatively, if you want to only run a single test suite, run the following command:
   
   ```
   npm test ./test/[test-filename].js
   ```
   Replace  `[test-filename]` with the name of the test suite file.

## Troubleshooting

Remember to pull from `master` before making any changes to the code. It may also be necessary to `npm install` if dependencies have been changed by other contributors.

If there are any other issues or concerns, speak to Zavid and he'll be happy to assist.