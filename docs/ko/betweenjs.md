## BetweenJS

*브라우저를 위한 견고한 트윈 엔진* — 가볍고 의존성이 전혀 없는 애니메이션 엔진. DOM 요소, 캔버스 객체, Three.js 벡터, 일반 모델처럼 어떤 대상의 숫자 프로퍼티든 트윈할 수 있고, 풍부한 이징 시스템, 조합 가능한 그룹, 액션 트윈, CSS 3D 트랜스폼 전체 보간, 컬러 애니메이션을 제공합니다.

다른 모듈처럼 불러옵니다: `require('strawnode_modules/betweenjs')`. 정적 팩토리는 `window`에 **`BJS`** 로 노출되어 있습니다(`BTW` / `BetweenJS`도 동일).

### 빠른 시작

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

### 핵심 개념

- **Ticker** — 첫 플레이 시 자동으로 시작되고, 탭 전환 시 자동으로 멈추는 단일 `requestAnimationFrame` 루프.
- **트윈** — `AbstractTween`(라이프사이클/이벤트)과 `Tween`(실제 숫자 트윈).
- **대상과 매핑** — 숫자 프로퍼티를 가진 모든 것. 업데이터가 프로퍼티 읽기/쓰기, CSS 대시 변환, 상대값(`$100`), 스크롤, 알파, 컬러, 트랜스폼 행렬 분해/재조립을 처리합니다.
- **이징** — 11개 패밀리(`Linear`, `Quad`, `Cubic`, `Quart`, `Quint`, `Sine`, `Expo`, `Circ`, `Back`, `Bounce`, `Elastic`) × 4개 변형, 그리고 스스로 지속시간을 계산하는 `Custom`·`Physical` 이즈.
- **조합** — `serial()` / `parallel()` 그룹, 그리고 체이닝 데코레이터: `reverse`, `slice`, `scale`, `delay`, `repeat`.
- **액션 트윈** — `func`, `timeout`, `interval`, `load`, `animationframe`, `addChild`, `removeFromParent` — 시리얼 체인을 실제 순서로 블로킹합니다.
- **컬러** — `Color` 변환(`ColorMode.RGB/HSV/HSL`)과 `{r,g,b,a}` 보간.
- **모던 레이어** — 프로미스/`.then()`, `stagger`, 플루언트한 `timeline()`, 전역 제어(`pause`/`resume`/`stopAll`/`clear`), 가시성 변경 시 자동 일시정지.

### 이벤트

`start` · `play` · `update` · `change` · `finish` · `stop` · `reverse` · `repeat` · `pause` · `resume` · `complete` — 그리고 옵션 콜백 `onStart` / `onPlay` / `onUpdate` / `onDraw` / `onStop` / `onComplete` / `onRepeat` / `onReverse` / `onPause` / `onResume`.

### 어디에 맞는가

- **StrawExpress**의 `@focus` / `@toggle` 핸들러가 `BJS.*`로 페이지 템플릿을 애니메이션합니다.
- **DOMNodeProxy**의 `tween()` / `animate()`가 바로 `BJS.create`에 위임합니다.
- **이 사이트** — `sectionbehavior.js`가 BetweenJS로 셰이더와 프로젝트 슬라이드 전환을 구동합니다.

### 전체 문서

완전한 README는 소스와 함께 있습니다:

- [BetweenJS on GitHub](https://github.com/sazaam/BetweenJS)