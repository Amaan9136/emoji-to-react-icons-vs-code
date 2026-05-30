## Build
npm run bundle

## Re-Pack the Extension (As .vsix)
vsce package

## Install the VSIX directly in VS Code
code --install-extension emoji-to-react-icons-0.0.5.vsix

## Publish the Extension (Only after Dev - optional)
npx vsce publish