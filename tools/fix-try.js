const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const generate = require('@babel/generator').default;

const file = 'js/main.js';
const src = fs.readFileSync(file, 'utf8');

const ast = parser.parse(src, {
  sourceType: 'script',
  plugins: ['jsx','classProperties','optionalChaining','topLevelAwait']
});

let fixed = 0;
traverse(ast, {
  TryStatement(path) {
    const n = path.node;
    if (!n.handler && !n.finalizer) {
      n.handler = t.catchClause(t.identifier('e'), t.blockStatement([]));
      fixed++;
    }
  }
});

const out = generate(ast, { retainLines: true }).code;
fs.writeFileSync(file, out, 'utf8');
console.log(`Added empty catch to ${fixed} try-block(s).`);
