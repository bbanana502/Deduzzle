# Deduzzle

힌트만으로 숨겨진 숫자를 추론하는 로직 퍼즐 게임입니다. 시행착오(트라이얼 앤 에러)로는 풀 수 없고, 오직 논리적 추론만으로 단 하나의 정답에 도달하도록 설계되어 있습니다.

## 컨셉

- 자릿수는 서로 다른 숫자로 구성된 자연수 (예: 4자리, 5자리, 7자리 등 플레이어가 직접 설정)
- 게임 시작 시 범위, 대소 비교, 합/차, 배수, 홀짝, 포함/제외 등 다양한 유형의 힌트가 제시됨
- 힌트들은 서로 유기적으로 연결되어 있어, 하나를 풀면 다음 힌트를 풀 실마리가 됨
- 정답 시도 시 맞았는지 틀렸는지만 알려주고, 어느 자리가 맞았는지는 알려주지 않음 (트라이얼로 뚫는 것을 방지)
- 정답을 맞히면 그동안의 모든 시도 기록을 자리별로 복기해서 보여줌 (어디서 잘못 추론했는지 확인 가능)
- 플레이 중 힌트가 더 필요하면 추가 힌트를 요청할 수 있음 (단, 점수에 반영됨)
- 자리별 후보 숫자를 지워나가는 메모장 + 자유 메모 기능 (스도쿠 연필 메모 방식)
- 이지모드(오답 시 자리별 정확/포함/불일치 색 피드백) / 하드모드(정오답만 공개) 난이도 선택

## 기술 스택

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS + Zustand
- **Backend**: Next.js API Routes (퍼즐 생성 및 정답 비교는 서버에서만 처리, 클라이언트에 정답 노출 안 함)
- **DB/Auth**: Supabase (Postgres + Auth, 익명 로그인) — 게임 기록 저장, 랭킹 기능
- **배포**: Vercel (예정)

## 시작하기

```bash
npm install
npm run dev
```

`.env.local`에 아래 세 값을 채워야 합니다 (Supabase 프로젝트 **Project Settings > API**에서 확인):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

DB 스키마는 `supabase/migrations/*.sql`에 있으며, Supabase 프로젝트의 SQL Editor에서 순서대로 실행하거나 `supabase db push`로 적용합니다.

## 진행 상황

핵심 게임 플레이(퍼즐 생성, 힌트, 정답 판정, 복기, 랭킹, 메모, 난이도 모드)가 로컬 및 실제 Supabase 프로젝트 기준으로 동작 확인된 상태입니다. 테스트 코드, 배포, 남용 방지 등은 계속 진행 중입니다.

## 라이선스

TBD
