# AI Study — 시각 백과사전

그림·비유·수식 해부·실무 사례로 AI 개념을 연결하는 공동 학습 저장소입니다.

![AI 시각 백과사전 협업 사용 방법](assets/how-to-use-v2.svg)

## 가장 쉬운 사용 방법

### 1. 공통 프롬프트 열기

[`prompts/agent-template.md`](prompts/agent-template.md)를 열고 프롬프트 전체를 복사합니다.

### 2. 대괄호만 채우기

아래처럼 주제와 원하는 수준을 입력합니다.

~~~text
이 저장소의 prompts/agent-template.md 지침대로 새 항목을 만들어줘.

주제: 조건부확률
대상: 완전 입문자
목표: p(A|B)를 읽고 디퓨전 역과정과 연결할 수 있기
난이도: 기초
선수지식: 자동 판단
기존 연결 항목: diffusion-prerequisites
강조: 그림과 직관, 수식 해부, 실무 사례
~~~

무엇을 선수지식으로 넣어야 할지 모르겠다면 `자동 판단`이라고 적으면 됩니다.

### 3. 에이전트에 저장소와 함께 전달하기

GitHub 저장소를 연결한 AI 에이전트에게 위 프롬프트를 전달합니다.
에이전트는 다음 파일을 읽고 같은 형식의 페이지를 만듭니다.

- [`AGENTS.md`](AGENTS.md): 모든 에이전트가 지켜야 하는 공통 규칙
- [`topics/diffusion-prerequisites.html`](topics/diffusion-prerequisites.html): 디자인과 설명 품질의 기준
- [`topics/_template.html`](topics/_template.html): 새 항목을 만드는 완성형 HTML 틀
- [`CONTRIBUTING.md`](CONTRIBUTING.md): 브랜치와 Pull Request 협업 규칙

### 4. 생성 결과 확인하기

에이전트가 새 브랜치와 Pull Request를 만들면 다음 항목을 확인합니다.

- 그림이나 흐름도만 봐도 전체 관계가 이해되는가?
- 수식 기호마다 읽는 법과 뜻이 있는가?
- 실제 AI 사례가 개념과 연결되어 있는가?
- 선수지식과 다음 학습 링크가 연결되어 있는가?
- 출처와 확인일이 적혀 있는가?

### 5. 검토 후 병합하기

협업자 중 한 명 이상이 내용을 확인한 뒤 Pull Request를 `main`에 병합합니다.
GitHub Pages가 활성화되어 있으면 병합된 내용이 백과사전 사이트에 자동 반영됩니다.

## 현재 항목

- [디퓨전 선수지식 전체](topics/diffusion-prerequisites.html)

## 폴더 안내

~~~text
AI_Study/
├── AGENTS.md                         # 에이전트 공통 규칙
├── CONTRIBUTING.md                   # 사람의 협업 규칙
├── index.html                        # 백과사전 첫 화면
├── assets/
│   └── how-to-use-v2.svg                # 사용방법 이미지
├── prompts/
│   ├── agent-template.md             # 공통 에이전트 프롬프트
│   └── create-topic.md               # 간단한 주제 생성 프롬프트
└── topics/
    ├── _template.html                # 새 문서용 시각 HTML 템플릿
    └── diffusion-prerequisites.html  # 기준 디자인 문서
~~~

## 협업 흐름

1. 저장소를 clone 또는 fork합니다.
2. `topic/<주제명>` 브랜치를 만듭니다.
3. [`AGENTS.md`](AGENTS.md)의 공통 규칙을 에이전트가 먼저 읽게 합니다.
4. [`prompts/agent-template.md`](prompts/agent-template.md)를 복사해 주제만 채웁니다.
5. [`topics/_template.html`](topics/_template.html)을 기반으로 새 항목을 작성합니다.
6. Pull Request를 열고 다른 구성원의 검토를 받습니다.
7. `main`에 병합되면 GitHub Pages가 자동 배포합니다.

## 문서 원칙

- 기존 내용을 임의로 삭제하거나 축약하지 않습니다.
- 글보다 관계도·흐름도·비교표·수식 해부를 우선합니다.
- 선수지식, 다음 학습, 관련 항목을 양방향으로 연결합니다.
- 수식은 기호의 발음·뜻·역할·문장으로 읽기를 포함합니다.
- 사실과 수치에는 출처와 확인일을 남깁니다.

에이전트 공통 규칙은 [AGENTS.md](AGENTS.md), 사람의 협업 규칙은 [CONTRIBUTING.md](CONTRIBUTING.md)를 확인하세요.
