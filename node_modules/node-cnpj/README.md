# CNPJ [![npm](http://img.shields.io/npm/v/node-cnpj.svg)](https://www.npmjs.com/package/node-cnpj) ![Downloads](https://img.shields.io/npm/dm/node-cnpj.svg) [![License](https://img.shields.io/npm/l/node-cnpj.svg)](LICENSE)

Funções utilitárias para tratamento de CNPJ.

Installation
------------

```bash
npm install node-cnpj --save
```

Examples
--------

* [CNPJ Validation](#cnpj-validation)
* [CNPJ Mask](#cnpj-mask)
* [CNPJ UnMask](#cnpj-unmask)
* [CNPJ is Masked](#cnpj-is-masked)
* [Random CNPJ Generation](#random-cnpj-generation)

Cnpj Validation
--------------

```js
const cnpj = require('node-cnpj');

cnpj.validate('12.345.678/1234-56'); // returns TRUE
cnpj.validate('12345678123456');     // returns TRUE

cnpj.validate('11111111111'); // returns FALSE

```

CNPJ Mask
---------

```js
const cnpj = require('node-cnpj');

cnpj.mask('12345678123456'); // returns '12.345.678/1234-56'

```

CNPJ UnMask
-----------

```js
const cnpj = require('node-cnpj');

cnpj.unMask('12.345.678/1234-56'); // returns '12345678123456'

```

CNPJ Is Masked
--------------

```js
const cnpj = require('node-cnpj');

cnpj.isMasked('12.345.678/1234-56'); // returns TRUE
cnpj.isMasked('12345678123456');     // returns FALSE

```

Random CNPJ Generation
----------------------

```js
const cnpj = require('node-cnpj');

cnpj.generate();     // returns a valid CNPJ without mask
cnpj.generate(true); // returns a valid CNPJ with mask

```

Test and development
--------------------

* Install external dependencies: **``npm install``**
* Run the test suite without coverage: **``npm test``**
* Run the test suite with coverage: **``npm run testdox``**

How to Contribute
-----------------

* Open a pull request or an issue about what you want to implement / change. We're glad for any help!
* Please be aware that we'll only accept fully tested code.

Contributors
------------

 * **Leonardo Thibes <leonardothibes@gmail.com>**

LICENSE
=======

Copyright (c) 2017-2023 Leonardo Thibes

The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
