## 프로시저럴

*생성적이고 동적인 크리에이션 워크플로우.* **손으로 직접 만들지 않고 — 수학과 물리 연산으로 계산합니다.** 모든 디테일을 수동으로 배치하는 대신 규칙이나 알고리즘이 결과를 만들어 내기 때문에, 같은 로직이 무한한 변형을 만들어낼 수 있습니다.

손 모델링의 반대편입니다. 프로세스를 한 번 쓰고 형태를 생성하게 맡기는 방식입니다.

### 무엇을 주는가

- **생성적 출력** — 수동 배치 대신 파라미터(시드, 슬라이더, 입력)에서 지오메트리, 머티리얼, 씬 전체를 만들어내는 레시피.
- **공짜 변형** — 시드나 값을 하나 바꾸면 새롭고도 일관된 결과가 나옵니다. 반복과 탐구에 완벽합니다.
- **도구로서의 물리와 수학** — 힘, 노이즈, 성장 규칙, 제약이 작가의 손 대신 결과를 만듭니다.
- **재현성** — 같은 프로세스를 두 번 돌리면 같거나(의도에 따라 달라진) 같은 결과가 나오며, 시리즈와 시스템에 아주 좋습니다.

### 왜 여기서의 접근법인가

**Ashina** 같은 도구 — Blender Geometry Nodes로 만든 아시아 건축 생성기 — 가 이 접근법의 좋은 예입니다. 지붕이나 탑 각각을 손으로 모델링하는 대신, 도구가 건축의 규칙을 코드화해 그 규칙에서 형태를 생성합니다.

```python
# the idea, in pseudo-code
def roof(config):
    # a rule describes how a roof builds itself
    return [
        generate_curve(config["width"], config["curvature"]),
        extrude_along(curve),
        tile_surfaces()          # then material & shader take over
    ]

for seed in range(10):
    build(roof(roofs(seed)))     # ten variations, one recipe
```

### 어디에 맞는가

- **Ashina** — 지붕 생성기: 건축 규칙을 데이터로 담은 것.
- **셰이더** — 셰이더 자체가 프로시저럴입니다. 프래그먼트 프로그램이 곧 픽셀을 생성하는 규칙이니까요.
- **작품** — 단일 객체보다 형태의 한 가족을 탐구하는 시리즈.

### 전체 문서

프로시저럴 도구와 생성기는 소스와 함께 있습니다:

- [Ashina on GitHub](https://github.com/sazaam)