## Development Environment Setup

The following instructions should help you get your development environment up and running so that you can make changes and test code locally.

1. For starters, if you don't already have Node.js, download it from [here](https://nodejs.org/en/download/).

2. Clone this repository into a folder on your computer. Preferably, the folder should be empty.

3. Request the `config.env` file from [Zavid](https://github.com/zzavidd) and place it in the `src` directory.

4. Open a command prompt / terminal and navigate to `src`. Then run the following command to install this project's dependencies i.e. the `node_modules`:
   ```sh
   npm install
   ```

5. Run the following command to start the project in development mode:
   ```sh
   npm run dev
   ```

6. On any internet browser, go to `http://localhost:3000`. The website should be running in development mode.

Before contributing code to this repository, please read our [contributing guidelines](../CONTRIBUTING.md).