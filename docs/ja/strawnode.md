## StrawNode & StrawExpress

*コードを書き、リロードし、見る。* バンドラーなし。ビルドステップなし。`npm run dev` なし。ブラウザとエディタ、そして `require()` だけ。

StrawNodeは**ブラウザ側のCommonJSモジュールシステム**です: JavaScriptを直接読み込み、評価します — バンドラーもトランスパイラもありません。StrawExpressはその姉妹ライブラリです: **完全にブラウザ内で動くExpress風のWebフレームワーク**で、ハッシュルーティング、ミドルウェア、Stepナビゲーションツリーを備えています。

### 一つのscriptタグ

<pre><code>&lt;script src=&quot;strawnode.js?starter=./app/&quot;&gt;&lt;/script&gt;</code></pre>

StrawNodeは自身のscript URLを読み取り、プロジェクトルートを特定し、`app/` を先読みし（`package.json` → `main` を解決）、すべてのモジュールを再帰的にスキャンして `require(...)` 呼び出しを見つけ、依存ツリー全体を**非同期で**先読みし、その後キャッシュから**同期的に**評価してアプリを起動します。

```js
// app/index.js — plain Node-style modules
var express = require('strawexpress');
var myThing = require('./my-thing');

var app = express();
app.get('/', function(req, res) {
  res.render('home', { title: 'My Site' });
});
app.listen('JSAddress', function() {
  app.createClient().get('/', app.routes).initJSAddress();
});
```

### `require()` の振る舞い

- **モジュール解決** — `./file`、`./dir/`（`package.json` の `main`/`index` → `index.js` 経由）、そして素の `strawnode_modules/name` id（`node_modules` のブラウザ版）。
- **モジュールコンテキスト** — 各モジュールは `module`、`require`、`exports`、`__filename`、`__dirname`、`__parameters`、`__public_root`、`__script_root` を設定して評価されます。内部の `require()` 呼び出しはそのモジュールのディレクトリを基準に解決されます。
- **パラメータ** — `require(id, newparams)` は `?key=value` クエリ文字列を `__parameters`/`module.params` にマージします。
- **デバッグ** — `require.resolve(id)` は解決されたURLを出力します。`require.getGraph()` は `{cache, edges, stack}` を返します。

### Express流のルーティング

- `app.get('/path', handler)` はルートを登録します。`:param` セグメントは正規表現マッチにコンパイルされます。`app.get('*')` は404のキャッチオールです。
- `app.use(fn)` は前段ミドルウェア（グローバル、または `/path` にスコープ）。`app.use('after', fn)` はナビゲーション後のフックです。
- `app.listen('JSAddress')` はハッシュURLのリスナーチェーンを起動します。
- **Stepライフサイクルフック** — Response上の `@focus`、`@toggle`、`@open`、`@close` が、アニメーションを差し込む場所です。

```js
app.get('/about', function(req, res){
  res.render('about', { title: 'About' });
});
```

### ツリーとしてのナビゲーション

Stepはシングルトンルート（id `'@'`）を持つ入れ子のツリーを形成します。`Step.play(child)`、`next()`、`prev()`、`handleUp()`、`handleDown()` がそれを辿り、`Hierarchy` がURLから駆動します:

```
AddressChanger (hashchange) → Hierarchy.redistribute(value)
   → formulate(path)        → route matching (regexp / :param / 404)
   → CommandQueue           → Step.open() / Step.close()
   → res.render()           → StrawJade template into the page
```

このツリーがあるからこそ、深いセクション（このサイトのプロジェクトステップなど）が本物のルートのように振る舞います。

### ロケール対応アドレス

`AddressHierarchy` + `AddressChanger` は `#/xx/path/` ルートを解析します。ここで `xx` は2文字のロケール（`en`、`ko`、…）です。ロケールを切り替えると、ノードを離れることなく `i18next.changeLanguage` 経由で翻訳が再バインドされます。

### どこに位置づけられるか

- **StrawNode** がすべてを読み込みます: `require('strawexpress')` はExpressシングルトンを返し、`require('strawnode_modules/betweenjs')` は `BJS` を返します。
- **StrawExpress** がナビゲーションとレンダリングを担います — このサイトのすべてのモジュール、テンプレート、ルートはそれを通じて配線されています。
- **Type** は両者の下の基盤です（[Type](/#/{{lang}}/docs/code/type/) を参照）。**BetweenJS** がトランジションをアニメーションします（[BetweenJS](/#/{{lang}}/docs/code/betweenjs/) を参照）。

### 完全なドキュメント

完全なREADMEはソースとともにあります:

- [StrawNode on GitHub](https://github.com/sazaam/strawnode)
- [StrawExpress on GitHub](https://github.com/sazaam/strawexpress)
