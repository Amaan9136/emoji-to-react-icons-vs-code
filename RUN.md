## Build
npm run bundle

## Re-Pack the Extension (As .vsix)
vsce package

## Publish the Extension
npx vsce publish

## Install the VSIX directly in VS Code
code --install-extension emoji-to-react-icons-0.0.2.vsix