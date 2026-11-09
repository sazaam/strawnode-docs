## Type

*JavaScriptのための必須クラスとパッケージ。* スタック全体の最下層にある**クラスとパッケージのシステム** — 単一の `Type.define()` 呼び出しの上に築かれた、クラス、パッケージ、インターフェース、ミックスイン、名前付き継承を提供するpre-ES6のOOPレイヤー。StrawExpressとBetweenJSのすべてのクラスはこれを通じて定義されています。

StrawNode経由で読み込まれ、strawexpress/betweenjsより前に評価される必要があります。`window.Type` と `window.Pkg` を公開します。依存関係はありません。

### 何をもたらすか

- **`Type.define()`** — 一度の呼び出しでのクラス定義: `inherits`、`interfaces`、`mixins`、`statics`、`protoinit`、`domain`、`constructor`。
- **パッケージ** — `Pkg.write('org.libspark.straw', …)` は、`org.libspark.straw::Step` のような完全修飾名の下に定義をスコープします。
- **名前付き継承** — サブクラスはスーパークラスへの生きた `base`/`factory` リンクを保ち、インターフェースは定義時に強制されます。
- **リフレクション** — 名前またはハッシュでクラスを引けます。インスタンスに完全修飾クラス名を尋ねられます。
- **ドメインアタッチ** — `domain: Type.appdomain` を宣言したクラスは、その単純名で `window` に載ります。

### なぜこれが基盤なのか

`strawexpress.js` と `betweenjs.js` はどちらも本体を `Pkg.write('org.libspark.straw', …)` で包み、すべてのクラスを `domain: Type.appdomain` で定義しています。この一つの規約のおかげで、`window.Express`、`window.Step`、`window.Response`、`window.BJS`、イージングファミリーなどがすべて無料で手に入ります。クラスレジストリ（`Type.getDefinitionByName`）は発見可能なサイドテーブルとして機能します。

```js
Type.define({
  pkg: 'org.libspark.straw::step',
  name: 'Step',
  domain: window,
  inherits: EventDispatcher,
  constructor: function Step(id, commandOpen, commandClose){ /* … */ }
});
// → window.Step, fullqualifiedclassname 'org.libspark.straw::step::Step'
```

### どこに位置づけられるか

- **StrawNode** が最初に `type.js` を読み込みます。`require()` は型名でクラスを解決することさえできます。
- **StrawExpress** — すべてのクラス（`Step`、`Response`、`Request`、`Express`、…）が `Type.define` です。
- **BetweenJS** — すべてのクラス（トゥイーン、イーズ、ティッカー、カラー）が `Type.define` です。

### 完全なドキュメント

完全なREADMEはソースとともにあります:

- [Type on GitHub](https://github.com/sazaam/Type)
