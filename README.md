# Recharge Watch

Automatically watch for local file changes and sync them to your Recharge theme.

## Installation

```bash
npm install -g recharge-watch
```

## Usage

Navigate to your theme directory and run:

```bash
recharge-watch RECHARGE_STORE=https://example.admin.rechargeapps.com RECHARGE_THEME_ID=55555 RECHARGE_EMAIL=example@gmail.com RECHARGE_PASSWORD=test RECHARGE_CUSTOMER_ID=92374
```

## Features

- [x] Sync edited files
- [x] Sync deleted files
- [x] Sync created files

## TODO

- [ ] Do not allow editing live theme
- [ ] Open preview of theme automatically
- [ ] Automatically reload theme on change from the browser
- [ ] Before syncing changes to recharge validate that the content is valid for the content type

## Not Supported

- We only support syncing the top level directory (no subdirectories).
- We only support three file types: `.js`, `.html`, and `.svg`, `.css`.

## Publishing

To publish a new version of this package to npm:

**Note:** The `npm publish` command will automatically trigger a build process (specifically, `npm run build:release`) due to the `prepublishOnly` script in `package.json`.

1.  **Update the version:**
    ```bash
    npm version <patch|minor|major>
    ```
2.  **Publish to npm:**
    ```bash
    npm publish
    ```
3.  **Push tags to remote (optional but recommended):**
    ```bash
    git push --tags
    ```

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](LICENSE) file for details (though you'll need to create this file if you want to include the full license text).
