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

## How to Dev
`npm test` or `docker buildx bake test` to test and coverage  
`npm run build` or `docker buildx bake build` to create dist js file minified  
`npm run jsdoc` or `docker buildx bake jsdoc` to generate documentation  
`npm run eslint` or `docker buildx bake lint` to run eslint  
`npm run eslint:fix` to run eslint and fix files
