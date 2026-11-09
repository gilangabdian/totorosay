# totorosay
[![NPM Version](https://img.shields.io/npm/v/totorosay?color=black)](https://www.npmjs.com/package/totorosay)

![totoro](./assets/totoro.png)

Inspired by cowsay, but the character for this is Totoro. Make Totoro say anything in your CLI


## Usage
Without needing to install:
```bash
npx totorosay "Hello, World!"
```

Or install globally:

```bash
npm i -g totorosay
totorosay "Hello, World!"
```

Or use it as dependency:

```bash
npm i totorosay
```
Use it in your code

```ts
// app.js
import totorosay from 'totorosay';
// or import {totorosay} from 'totorosay';

console.log(totorosay('Hello, World!'))
// and then run with: node app.js
```


## License
MIT