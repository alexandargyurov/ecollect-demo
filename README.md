# Sippet AI demo

This Create React App demo presents a fictional customer invoice and embeds the
`@sippet-ai/widget` chat/voice launcher for agent
`72fc884d-b7da-4697-8757-d9222bb14f17`, showing how support can sit directly
inside a billing portal.

## Setup

```sh
npm install
npm start
```

## Sippet packages

- SDK: `@sippet-ai/sdk-js` 0.0.20.
- Widget: `@sippet-ai/widget` 0.0.3.
  Newer upstream widget changes need a separate widget release; upgrading the
  SDK does not replace the widget's prebuilt bundle.

The SDK dashboard sends realtime session tokens through WebSocket `authToken`
instead of URL query parameters and omits them from the response log. Its secret
API key input is for local demos only; production integrations must mint tokens
on a backend and keep secret keys out of the browser.

## Widget configuration

The demo defaults to the production Sippet API and eCollect agent. Set the
`REACT_APP_SIPPET_*` variables from `.env.example` in your deployment environment
to override these defaults. Use only a browser-safe publishable key for
`REACT_APP_SIPPET_PUBLISHABLE_KEY`; never use a secret API key.

The installed widget's ESM assets are copied into `public/sippet-widget` during
install, start, and build so its lazy-loaded chat and voice chunks are served
from the same directory.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
