## StrawNode & StrawExpress

*코드를 쓰고, 새로고침하면 반영됩니다.* 번들러 없이. 빌드 단계 없이. `npm run dev` 없이. 브라우저, 편집기, 그리고 `require()`만 있으면 됩니다.

StrawNode는 **브라우저에서 동작하는 CommonJS 모듈 시스템**입니다 — 자바스크립트를 직접 로드하고 평가합니다. 번들러도, 트랜스파일러도 없습니다. StrawExpress는 그 자매 라이브러리로, **브라우저 안에서 완전히 실행되는 Express 스타일 웹 프레임워크** — 해시 라우팅, 미들웨어, Step 탐색 트리를 갖추고 있습니다.

### 스크립트 태그 하나로

<pre><code>&lt;script src=&quot;strawnode.js?starter=./app/&quot;&gt;&lt;/script&gt;</code></pre>

StrawNode는 자기 스크립트의 URL을 읽어 프로젝트 루트를 찾아낸 뒤 `app/`을 먼저 가져옵니다(`package.json`의 `main` 해석). 이어서 모든 모듈의 `require(...)` 호출을 재귀적으로 스캔해 의존성 트리 전체를 **비동기로** 미리 가져오고, 캐시에서 **동기적으로** 평가한 후 앱을 부팅합니다.

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

### `require()`는 어떻게 동작하나

- **모듈 해석** — `./file`, `./dir/`(via `package.json`의 `main`/`index` → `index.js`), 그리고 bare `strawnode_modules/name` 아이디(`node_modules`의 브라우저 상당).
- **모듈 컨텍스트** — 각 모듈은 `module`, `require`, `exports`, `__filename`, `__dirname`, `__parameters`, `__public_root`, `__script_root`를 자기 것으로 갖고 평가됩니다. 안쪽의 `require()` 호출은 해당 모듈의 디렉터리를 기준으로 해석됩니다.
- **파라미터** — `require(id, newparams)`는 `?key=value` 쿼리스트링을 `__parameters` / `module.params`에 병합합니다.
- **디버그** — `require.resolve(id)`는 해석된 URL을 출력하고, `require.getGraph()`는 `{cache, edges, stack}`을 돌려줍니다.

### 라우팅, Express 스타일

- `app.get('/path', handler)`로 라우트를 등록하고, `:param` 세그먼트는 정규식 매치로 컴파일됩니다. `app.get('*')`이 404 캐치올입니다.
- `app.use(fn)`은 before 미들웨어(`/path`에 한정 가능)이고, `app.use('after', fn)`은 탐색 후 훅입니다.
- `app.listen('JSAddress')`는 해시-URL 리스너 체인을 부팅합니다.
- **Step 라이프사이클 훅** — Response의 `@focus`, `@toggle`, `@open`, `@close`에 애니메이션을 걸 수 있습니다.

```js
app.get('/about', function(req, res){
  res.render('about', { title: 'About' });
});
```

### 탐색은 트리로

Step은 중첩된 트리를 이루며 싱글턴 루트(아이디 `'@'`)를 갖습니다. `Step.play(child)`, `next()`, `prev()`, `handleUp()`, `handleDown()`이 트리를 걷고, `Hierarchy`가 URL을 통해 이를 구동합니다:

```
AddressChanger (hashchange) → Hierarchy.redistribute(value)
   → formulate(path)        → route matching (regexp / :param / 404)
   → CommandQueue           → Step.open() / Step.close()
   → res.render()           → StrawJade template into the page
```

이 트리 덕분에 깊은 섹션(이 사이트의 프로젝트 스텝처럼)이 실제 라우트처럼 동작합니다.

### 로캘을 아는 주소

`AddressHierarchy` + `AddressChanger`는 `xx`가 2글자 로캘(`en`, `ko`, …)인 `#/xx/path/` 라우트를 해석합니다. 로캘을 바꾸면 노드 밖으로 나가지 않고 `i18next.changeLanguage`를 통해 번역을 다시 바인딩합니다.

### 어디에 맞는가

- **StrawNode**가 모든 것을 로드합니다: `require('strawexpress')`는 Express 싱글턴을, `require('strawnode_modules/betweenjs')`는 `BJS`를 돌려줍니다.
- **StrawExpress**가 탐색과 렌더링을 책임집니다 — 이 사이트의 모든 모듈 · 템플릿 · 라우트가 여기를 통과합니다.
- **Type**은 그 아래의 기반입니다(자세한 내용은 [Type](/#/{{lang}}/docs/code/type/)); **BetweenJS**가 전환을 애니메이션합니다(자세한 내용은 [BetweenJS](/#/{{lang}}/docs/code/betweenjs/)).

### 전체 문서

완전한 README는 소스와 함께 있습니다:

- [StrawNode on GitHub](https://github.com/sazaam/strawnode)
- [StrawExpress on GitHub](https://github.com/sazaam/strawexpress)