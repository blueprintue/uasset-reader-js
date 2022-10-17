# Uasset Reader JS
Read and extract informations of `.uasset` files from Unreal Engine in javascript.  
[Here a Live Demo.](https://blueprintue.com/tools/uasset-reader.html)

## How to use
First you need to import `uasset-reader.min.js` in your page.
```js
const file = document.getElementById("file-input").files[0];
const buffer = await file.arrayBuffer();
const bytes = new Uint8Array(buffer);
new window.blueprintUE.uasset.ReaderUasset().analyze(bytes);
```

### Main Methods
#### analyze([bytes: Uint8Array]): Uasset
This method read each byte to extract data from current `.uasset` file.

## How to dev
### Requirements
Currently using:
* node v14.19.1
* npm 8.6.0

### First run
Install [Gulp](https://gulpjs.com/) & packages

```bash
npm install --global gulp-cli
npm install
```

Then run:

```bash
gulp
```

It will create in `dist` folder:
* `uasset-reader-min.js`: js file to put online 

At the end, gulp watch is launched for js files.

The demos files is for explaing how works uasset-reader.

### Other Gulp Commands
* `gulp js`: generate js file for dev and prod

### Tests
Run tests
```bash
npm test
```

### JSDoc
First you have to install jsdoc.
```bash
npm install -g jsdoc
```
Then you can generate the documentation.
```bash
npm run jsdoc
```
The output folder is jsdoc located at the root of the project.

### ESlint
Output in terminal
```bash
npm run eslint
```

Output in `eslint_out.html`
```bash
npm run eslint-export
```
