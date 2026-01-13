# highlightjs-liquidsoap

Syntax highlighting for [Liquidsoap](https://www.liquidsoap.info) in [highlight.js](https://highlightjs.org/).

## Usage

### Browser

```html
<script src="path/to/highlight.min.js"></script>
<script src="path/to/liquidsoap.min.js"></script>
<script>hljs.highlightAll();</script>
```

### Node.js

```javascript
const hljs = require('highlight.js');
const liquidsoap = require('highlightjs-liquidsoap');

hljs.registerLanguage('liquidsoap', liquidsoap);
```

### ES Modules

```javascript
import hljs from 'highlight.js';
import liquidsoap from 'highlightjs-liquidsoap';

hljs.registerLanguage('liquidsoap', liquidsoap);
```

## Supported Features

- Keywords: `def`, `let`, `if`, `then`, `else`, `elsif`, `end`, `begin`, `while`, `do`, `for`, `to`, `fun`, `try`, `catch`, `finally`, `open`
- Literals: `true`, `false`, `null`
- Comments: single-line (`#`) and nested multiline (`#< ... #>`)
- Strings: double and single quoted with interpolation (`#{...}`)
- Numbers: decimal, hexadecimal (`0x`), octal (`0o`), binary (`0b`), floats, scientific notation
- Encoders: `%mp3`, `%opus`, `%ffmpeg`, etc.
- Preprocessor: `%ifdef`, `%ifndef`, `%ifencoder`, `%ifnencoder`, `%ifversion`, `%include`
- Decorators: `@json.parse`, `@yaml.parse`, `@xml.parse`, `@sqlite.row`, `@sqlite.query`
- Regular expressions: `r/pattern/flags`
- Time predicates: `1h30m`, `8h-18h`
- Labeled arguments: `~label`
- Operators: `::`, `:=`, `??`, `?.`, `->`

## License

GPL-2.0-or-later
