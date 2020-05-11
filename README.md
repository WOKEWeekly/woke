## Development Environment Setup

This following instructions should help you get your development environment up and running so that you can make changes and test code locally.

1. For starters, if you don't already have Node.js, download it from [here](https://nodejs.org/en/download/).

2. Clone this repository into a folder on your computer. Preferably, the folder should be empty.

3. Request the `config.env` file from #WOKEWeekly's Senior Developer and place it in the `src` directory.

4. Open a command prompt / terminal and navigate to `src`. Then run the following command to install this project's dependencies i.e. the `node_modules`:
   ```sh
   npm install
   ```

5. Run the following command to start the project in development mode:
   ```sh
   npm run dev
   ```

6. On any internet browser, go to `http://localhost:3000`. The website should be running in development mode.

## Linting and Prettifying

It is strongly recommended that you install the [ESLint](https://eslint.org/) plugin in your text editor.

This plugin is very useful for highlighting problems while you're writing code and ensuring the code you're writing matches standard convention.

To scan the source files for linting errors or warnings, run the following command:
```
npm run lint
```

Is it also important to ensure that code is correctly formatted before committing. In order to ensure this, run the following command:
```
npm run prettify
```


## Run Service Tests

Before pushing your commits to this repository, especially after making changes to server-side code, you should ensure that all service tests pass. 

>**Note:** The following instructions assume that you have at least fulfilled instructions 1 - 5 from the [Development Environment Setup](#development-environment-setup) section.

To run all of the service tests:

1. Ensure you have a command prompt / terminal open at `woke/src`.

2. Run the following command to run all of the service tests using Mocha and display the test results:
   ```
   npm run test
   ```

   Alternatively, if you want to only run a single test suite, run the following command:
   
   ```
   npm run test -- ./test/[test-filename].js
   ```
   Replace  `[test-filename]` with the name of the test suite file.