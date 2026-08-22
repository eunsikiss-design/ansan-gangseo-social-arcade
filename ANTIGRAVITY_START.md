# Google Antigravity 초기 지시문

Antigravity에서 이 프로젝트를 **Local Mode**로 연 다음, 아래 내용을 새 대화의 첫 메시지로 그대로 붙여 넣는다.

---

이 폴더는 기존에 개발하던 고등학교 통합사회 2 세로형 모바일 학습 게임 ‘통합사회 탐구 아케이드’이다.

먼저 코드를 수정하지 말고 다음 작업을 수행해라.

1. `PROJECT_HANDOFF.md`, `README.md`, `package.json`과 최근 Git 이력을 읽는다.
2. 현재 구현된 ACT 1의 M01~M06과 ACT 2의 M07~M12 전체 흐름을 파악한다.
3. 탐구 아카데미 복귀, 캐릭터 상황별 표정, ZERO Challenge, Evidence 제출, 권리 카드, 새로고침 후 이어하기 구조를 확인한다.
4. `public/assets/characters`와 `public/assets/icons`의 PNG 자산이 실제 화면에 어떻게 연결되는지 확인한다.
5. 개발 서버를 실행하고 모바일 세로 화면에서 현재 기능을 실제 사용자 관점으로 점검한다.
6. 기존 코드, 디자인, 데이터, Git 이력을 임의로 삭제하거나 전면 재작성하지 않는다.
7. 이미 구현된 ACT 2를 보존하고, ACT 3 또는 새로운 단원은 내가 요청하기 전까지 추가하지 않는다.
8. 대화 텍스트는 캐릭터 이미지와 분리된 HTML 텍스트로 유지한다.
9. 작업 전후에 `git status`를 확인하고 기존 변경을 보존한다.

현재 확인 기준 커밋은 `e5ce2ab revert: restore application to b2f2cee state`이다. 이후 커밋이 있다면 최신 Git 이력을 우선 확인한다.

우선 파일을 수정하지 말고 다음 내용을 보고해라.

- 프로젝트 구조
- 구현된 기능
- 현재 실행·테스트 상태
- 발견한 명백한 오류 또는 위험
- 다음 작업을 시작하기 전에 확인해야 할 사항

---

## 프로젝트 열기

Antigravity 2.0에서 다음 폴더를 프로젝트에 추가한다.

```text
D:\Codex\ansan-gangseo-social-arcade\new-chat
```

현재 폴더를 그대로 이어서 작업하려면 대화 시작 시 **Local Mode**를 선택한다.
