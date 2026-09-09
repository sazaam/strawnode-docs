## Type

*JavaScript를 위한 필수 클래스와 패키지.* 스택 전체의 맨 아래에 있는 **클래스·패키지 시스템** — 단 한 번의 `Type.define()` 호출 위에 세워진, ES6 이전의 OOP 레이어입니다. 클래스, 패키지, 인터페이스, 믹스인, 명명된 상속을 제공합니다. StrawExpress와 BetweenJS의 모든 클래스가 이것으로 정의됩니다.

StrawNode를 통해 로드되며, strawexpress/betweenjs보다 먼저 평가되어야 합니다. `window.Type`과 `window.Pkg`을 노출합니다. 의존성 없음.

### 무엇을 주는가

- **`Type.define()`** — 한 번의 호출로 클래스 정의: `inherits`, `interfaces`, `mixins`, `statics`, `protoinit`, `domain`, `constructor`.
- **패키지** — `Pkg.write('org.libspark.straw', …)`로 완전한 이름(`org.libspark.straw::Step` 같은) 아래 정의를 스코프에 넣습니다.
- **명명된 상속** — 서브클래스는 슈퍼클래스에 대한 살아 있는 `base`/`factory` 링크를 유지하고, 인터페이스는 정의 시점에 강제됩니다.
- **리플렉션** — 이름이나 해시로 클래스를 찾고, 인스턴스에 정규화된 클래스 이름을 물어볼 수 있습니다.
- **도메인 부착** — `domain: Type.appdomain`을 선언한 클래스는 단순 이름으로 `window`에 올라갑니다.

### 왜 기반인가

`strawexpress.js`와 `betweenjs.js` 모두 몸체를 `Pkg.write('org.libspark.straw', …)`로 감싸고, 모든 클래스를 `domain: Type.appdomain`으로 정의합니다. 바로 그 하나의 관례 덕분에 `window.Express`, `window.Step`, `window.Response`, `window.BJS`, 이징 패밀리들까지 전부 무료로 얻을 수 있고, 클래스 레지스트리(`Type.getDefinitionByName`)가 검색 가능한 부가 테이블로 따라옵니다.

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

### 어디에 맞는가

- **StrawNode**가 `type.js`를 가장 먼저 로드하고, `require()`는 심지어 타입 이름으로 클래스를 해석할 수 있습니다.
- **StrawExpress** — 모든 클래스(`Step`, `Response`, `Request`, `Express`, …)가 `Type.define`입니다.
- **BetweenJS** — 모든 클래스(트윈, 이즈, 티커, 컬러)가 `Type.define`입니다.

### 전체 문서

완전한 README는 소스와 함께 있습니다:

- [Type on GitHub](https://github.com/sazaam/Type)