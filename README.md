# PDF UI Backend

> Online PDF insert, delete, rotate, split and merge

## Features

Visually organize pdf files online.

- SPLIT pdfs
- SPLIT by barcode (for example 3of9 barcode will be autosplit and name of file is value of barcode)
- MERGE pdfs
- ROTATE page
- REMOVE Page
- Download split pdfs in one zip or individually
- Send files to [Moodle Assignment Feedback Packager](https://bfritscher.github.io/moodle-assignment-feedback-packager/)


## Resources

- http://www.dafont.com/3of9-barcode.font
- pdftk, zbar-tools and ghostscript are used to manipulate the pdfs.


## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test

npm run deploy
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
