# #WOKEWeekly

This is the GitHub repository for the #WOKEWeekly website, which is live at https://www.wokeweekly.co.uk.

## Development Installation

1. Request the `config.env` file from this repository's administrator and place it in the file as follows:

    ```
    /workspace
    ├── /woke
    │   ├── /src
    │   ├── .gitignore
    │   ├── Dockerfile
    │   ├── Jenkinsfile
    │   ├── README.md
    └─── config.env
    ```

2. Navigate to `/src` and run `npm install` to install `node_modules`.

3. Run `npm run dev` to start the project in development mode.

4. Browse `http://localhost:3000`.



<!-- ## Enable server debugging -->