## BetweenJS

*ブラウザのための堅牢なトゥイーン* — 軽量で依存ゼロのアニメーションエンジン。DOM要素、キャンバスオブジェクト、Three.jsのベクトル、プレーンなモデルなど、あらゆるターゲットの数値プロパティをトゥイーンできます。豊富なイージングシステム、組み合わせ可能なグループ、アクショントゥイーン、CSS 3Dトランスフォームの完全な補間、カラーアニメーションを備えています。

他のモジュールと同じように読み込みます: `require('strawnode_modules/betweenjs')`。静的ファクトリは `window` に **`BJS`** として存在します（`BTW` / `BetweenJS` も同様）。

### クイックスタート

```js
// One-liner
BJS.to(el, { left: 500 }, 2, Quad.easeOut).play();

// create() — everything as options
BJS.create({
  target: el, to: { left: 500, top: 300 },
  time: 2, ease: Quad.easeOut, delay: 0.5, repeat: 2,
  transform: { translateX: 200, rotate: 45 },
  onComplete: function(){ /* … */ }
}).play();

// Compose — serial / parallel
BJS.serial(
  BJS.to(el, { left: 500 }, 1),
  BJS.func(function(){ console.log('midpoint'); }),
  BJS.to(el, { top: 300 }, 1)
).play();

// Fluent chain
BJS.to(el, { left: 500 }, 2).reverse().delay(0.3).play();
```

### 中核となる概念

- **ティッカー** — 最初の再生で自動的に始まり、タブ切り替えで自動的に停止する単一の `requestAnimationFrame` ループ。
- **トゥイーン** — `AbstractTween`（ライフサイクル/イベント）と `Tween`（具体的な数値トゥイーン）。
- **ターゲットとマッピング** — 数値プロパティを持つものなら何でも。アップデーターがプロパティの読み書き、CSSのダッシュ変換、相対値（`$100`）、スクロール、アルファ、カラー、トランスフォーム行列の分解/再構成を扱います。
- **イージング** — 11ファミリー（`Linear`、`Quad`、`Cubic`、`Quart`、`Quint`、`Sine`、`Expo`、`Circ`、`Back`、`Bounce`、`Elastic`）× 4バリアント、さらに自身で持続時間を計算する `Custom` と `Physical` のイーズ。
- **コンポジション** — `serial()` / `parallel()` グループ、そしてチェーン可能なデコレーター: `reverse`、`slice`、`scale`、`delay`、`repeat`。
- **アクショントゥイーン** — `func`、`timeout`、`interval`、`load`、`animationframe`、`addChild`、`removeFromParent` — シリアルチェーンを実際の順序でブロックします。
- **カラー** — `ColorMode.RGB/HSV/HSL` を用いた `Color` 変換、`{r,g,b,a}` として補間。
- **モダンレイヤー** — Promise/`.then()`、`stagger`、流暢な `timeline()`、グローバル制御（`pause`/`resume`/`stopAll`/`clear`）、可視性変更時の自動一時停止。

### イベント

`start` · `play` · `update` · `change` · `finish` · `stop` · `reverse` · `repeat` · `pause` · `resume` · `complete` — さらにオプションのコールバック `onStart` / `onPlay` / `onUpdate` / `onDraw` / `onStop` / `onComplete` / `onRepeat` / `onReverse` / `onPause` / `onResume`。

### どこに位置づけられるか

- **StrawExpress** の `@focus` / `@toggle` ハンドラーが `BJS.*` でページテンプレートをアニメーションします。
- **DOMNodeProxy** の `tween()` / `animate()` は直接 `BJS.create` に委譲します。
- **このサイト** — `sectionbehavior.js` がシェーダーとプロジェクトスライドのトランジションをBetweenJSで駆動します。

### 完全なドキュメント

完全なREADMEはソースとともにあります:

- [BetweenJS on GitHub](https://github.com/sazaam/BetweenJS)
