cd moonlight_components
cp ./package-build.json ./package.json
npm run build
cp ./package-npm.json ./package.json
npm publish