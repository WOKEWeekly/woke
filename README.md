## Development Environment Setup

This following instructions should help you get your development environment up and running so that you can make changes and test code locally.

1. For starters, if you don't already have Node.js, download it from here: [https://nodejs.org/en/download/]

2. Clone this repository into a folder on your computer. Preferably, the folder should be empty.

3. Request the `config.env` file from #WOKEWeekly's Senior Developer and place it in your folder besides the cloned repository structure so that it looks something like the following:

    ```
    workspace
    ├── woke
    │   ├── src
    │   ├── .gitignore
    │   ├── Dockerfile
    │   ├── Jenkinsfile
    │   ├── README.md
    └─── config.env
    ```

    In the example above, `/workspace` is the name of the empty folder the repository was cloned into.

4. Open a command prompt / terminal and navigate to `woke/src`. Then run the following command to install this project's dependencies i.e. the `node_modules`:
   ```sh
   npm install
   ```

5. Run the following command to start the project in development mode:
   ```sh
   npm run dev
   ```

6. On any internet browser, go to `http://localhost:3000`. The website should be running in development mode.

## Run Service Tests

Before pushing your commits to this repository, especially after making changes to server-side code, you should ensure that all service tests pass. 

>**Note:** The following instructions assume that you have at least fulfilled instructions 1 - 4 from the [Development Environment Setup](#development-environment-setup) section.

To run all of the service tests:

1. Ensure you have a command prompt / terminal open at `woke/src`.

2. Run the following command:
   ```
   npm run test
   ```
   This should run all of the service tests using Mocha and display the test results.

   Alternatively, if you want to only run a single test suite, run the following command:
   ```
   npm run test -- ./test/[test-filename].js
   ```
   Replace  `[test-filename]` with the name of the test suite file.