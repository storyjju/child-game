# 게임 캔버스의 접근성 이름이 현재 스테이지를 따라가지 않는다

**Symptom**: 영어 마을에서도 게임 캔버스의 접근성 이름이 "산수 마을 게임 화면"으로 고정되어 있어, 화면에 보이는 제목 "영어 마을"과 어긋난다.

**Observed evidence**: `game/math-run/stage.tsx`의 `<canvas aria-label="산수 마을 게임 화면">`이 문자열 상수다. 코드 리뷰(`code-review low`)에서 지적됐고, 스크린 리더로 직접 확인하지는 않았다.

**Suspected cause**: 스테이지가 하나였을 때 만든 라벨을 스테이지가 늘어난 뒤에도 그대로 둔 것이다.

**What was tried**: 고치지 않았다. 인수 기준을 깨지 않고 스펙이 접근성 검증을 요구하지도 않아서 이번 범위에서는 기록만 했다.

**Proposed next step**: 라벨을 `${stage.name} 게임 화면`처럼 현재 스테이지 이름에서 만들고, 영어 마을에서 `getByLabelText`로 바뀐 이름을 확인한다.
