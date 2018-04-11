# XenaGoWidget

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

React widget for analyzing expression of tissue samples within a pathway.

[build-badge]: https://img.shields.io/travis/user/repo/master.png?style=flat-square
[build]: https://travis-ci.org/user/repo

[npm-badge]: https://img.shields.io/npm/v/npm-package.png?style=flat-square
[npm]: https://www.npmjs.org/package/npm-package

[coveralls-badge]: https://img.shields.io/coveralls/nathandunn/Xena/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/nathandunn/repo


## To Run

   npm install

   npm start

## To Build

   npm run build


## TODO

- add cell-lines 
- add expression data 
- integration with Viper functional analysis 
- add outlier pathways 


- integrate as new Xena page 
- improve / fix clustering for accuracy and performance 

## Possible todo

- put gene selection below pathway selection (and then only show the tissue view for genes)
- allow multiple selection of genes / pathways with statistics (gene enrichment)
   - provide combined statistics matches
   - (allow visible selection of fields)
- side-by-side comparison of different analysis
   - provide statistics for comparisons
- allow selection of multiple cohorts (displayed vertically)
- allow selection of different criteria for scoring 
- add different (drill-down) filters for scores, etc. 
- allow different ways to shade, including z-score, only percentage, etc. etc. 
- allow creation of custom pathways sets by selecting available genes (with lookup)
- allow hiding pathways
- show trees for hierarchical clustering 
- show camplot
- show annotations for hovered / selected (are these the functional annotations?)





## Important biological questions

- what genes are involved / dominant in these pathways for 'X' affects 
- what is the combined affect of these genes on various pathways for this set of selected genes 
