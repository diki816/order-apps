# 커피 주문 앱

## 1. 프로젝트 개요

### 1.1 프로젝트명
커피 주문 앱

### 1.2 프로젝트 목적
사용자가 커피 메뉴를 주문하고, 관리자가 주문을 관리할 수 있는 간단한 풀스택 웹 앱


### 1.3 개발 범위
- 주문하기 화면(메뉴 선택 및 장바구니 기능)
- 관리자 화면(재고 관리 및 주문 상태 관리)
- 데이터를 생성/조회/수정/삭제 할 수 있는 기능

## 2. 기술 스택
- Frontend: HTML, CSS, React, Javascript
- Backend: Node.js, Express
- Database: PostgreSQL

## 3. 기본 사항
- Frontend와 Backend는 분리하여 별도 개발
- 기본적인 웹 기술만 사용
- 학습 목적이므로 사용자 인증이나 결제 기능은 제외
- 메뉴는 커피만 있음

## 4. 주문하기 화면(PRD)

### 4.1 화면 개요
- 헤더: 좌측 로고 텍스트 `COZY`, 우측 내비게이션 `주문하기`, `관리자`
- 콘텐츠: 3열(모바일 1열) 메뉴 카드 리스트
- 하단: 장바구니 요약 카드(아이템 목록, 금액 합계, 주문하기 버튼)

### 4.2 핵심 목표
- 사용자에게 메뉴 탐색/옵션 선택/장바구니/주문 제출까지 최소 클릭으로 제공
- 3초 이내 주문 제출 응답(성공/실패 명확 피드백), 모바일 가독성 보장

### 4.3 주요 컴포넌트 및 동작
- 헤더
  - 로고 텍스트 `COZY`
  - 내비: `주문하기`(현재 페이지 강조), `관리자`(관리자 페이지 이동)
- 메뉴 카드(반복)
  - 이미지 플레이스홀더, 메뉴명(예: 아메리카노 ICE/HOT), 가격(원화)
  - 간단한 설명(2줄 이내)
  - 옵션 체크박스
    - `샷 추가 (+500원)`
    - `시럽 추가 (+0원)`
  - `담기` 버튼: 현재 옵션/수량 1개 기준으로 장바구니에 추가
- 장바구니 카드(페이지 하단)
  - 목록: 아이템명, 옵션 요약(예: 샷 추가), 수량, 라인 가격
  - 우측 영역: `총 금액` 강조 표기(예: 12,500원), `주문하기` 버튼

### 4.4 사용자 흐름
1) 페이지 진입 → 메뉴 목록 로드
2) 메뉴 카드에서 옵션 체크 → `담기` 클릭 → 장바구니에 항목 추가(토스트 안내)
3) 장바구니 확인 → 필요 시 동일 메뉴를 다시 담아 수량 증가 가능
4) `주문하기` 클릭 → 서버로 주문 생성 요청 → 성공 시 주문 번호 표시(간단 알림)

### 4.5 데이터 모델(프론트 기준)
- MenuItem: { id, name, temperature(ICE|HOT), price, description, imageUrl, isSoldOut }
- Option: { id, name, priceDelta }
- CartItem: { id, menuItemId, name, selectedOptions: Option[], quantity, unitPrice, linePrice }
- Cart: { items: CartItem[], subtotal, tax(10% 가정), total }

### 4.6 유효성/비즈니스 규칙
- 수량: 기본 1, 최대 20
- 가격 계산: unitPrice = basePrice + Σ(option.priceDelta)
  - linePrice = unitPrice × quantity
  - subtotal = Σ(linePrice)
  - tax = subtotal × 0.1(가정), total = subtotal + tax
- 품절: `isSoldOut=true`인 메뉴/옵션은 선택 불가, 이미 담긴 경우 주문 전 동기화로 경고 후 제거 유도

### 4.7 상태 및 피드백
- 로딩: 최초 목록 스켈레톤, 주문 요청 중 버튼 스피너
- 성공: 담기 성공 토스트, 주문 성공 시 주문 번호/안내
- 실패: 네트워크/검증 오류 배너 + 재시도

### 4.8 접근성/반응형
- 키보드 포커스 가능, 모달 사용 시 포커스 트랩(현재는 카드형 UI, 모달 없음)
- 스크린리더 레이블: 이미지 대체 텍스트, 버튼 라벨 정확 표기
- 레이아웃: 데스크톱 3열, 태블릿 2열, 모바일 1열 그리드

### 4.9 성능/품질
- 이미지 lazy-loading, 고정 width/height 제공
- 간단 캐싱: 메뉴 목록 5분 메모리 캐시(프론트)
- 오류 재시도: 지수 백오프 2회

### 4.10 분석 지표(선택)
- 노출: 페이지 뷰, 카드 노출/클릭
- 상호작용: 옵션 선택, 담기 성공/실패
- 전환: 주문 성공/실패(사유 코드)

### 4.11 오픈 이슈
- 세금/요율 고정 10% 가정 — 서버 확정 필요
- 메뉴/옵션 실제 목록 및 가격은 관리자 페이지와 동기화 전제

## 5. 관리자 화면(PRD)

### 5.1 화면 개요
- 헤더: 좌측 로고 `COZY`, 우측 내비 `주문하기`, `관리자`(현재 강조)
- 관리자 대시보드 카드: 총 주문, 주문 접수, 제조 중, 제조 완료 카운터
- 재고 현황 섹션: 각 메뉴 카드에 수량 표시와 `+`, `-` 버튼
- 주문 현황 섹션: 주문 리스트(일시, 항목/수량/가격)와 우측 `주문 접수` 버튼

### 5.2 목표 및 성공 기준
- 목표: 실시간으로 재고를 관리하고, 신규 주문을 신속히 접수/처리
- 성공 기준
  - 재고 증감이 1초 내 UI 반영
  - 주문 접수 클릭 후 상태가 즉시 `주문 접수` → `제조 중`으로 변환(가정)
  - 대시보드 카운터가 주문 상태 변경과 일관되게 동기화

### 5.3 주요 컴포넌트 및 동작
- 대시보드 카운터
  - 표시: `총 주문`, `주문 접수`, `제조 중`, `제조 완료`
  - 데이터 소스: 서버 통계 API 또는 주문 목록 집계
- 재고 카드(반복)
  - 항목: 메뉴명(예: 아메리카노 ICE/HOT, 카페라떼), 현재 재고 수량(예: 10개)
  - `+`, `-` 버튼: 1단위 증감, 하한 0, 상한 999(가정)
  - 서버 동기화 실패 시 이전 값로 롤백 및 경고 토스트
- 주문 리스트 항목
  - 필드: 주문시각, 항목 요약(메뉴/옵션/수량), 금액, 상태
  - 액션: `주문 접수` 버튼(대기 상태에서만 노출)
  - 접수 클릭 시 상태 변경: `대기` → `주문 접수`(또는 `제조 중`), 카운터 갱신

### 5.4 상태 모델(프론트)
- InventoryItem: { id, name, quantity }
- OrderSummary: { id, createdAt, items: { name, options: string[], quantity, linePrice }[], totalPrice, status }
- AdminStats: { totalOrders, accepted, inProgress, completed }

### 5.5 API 계약(초안)
- GET /api/admin/stats → AdminStats
- GET /api/admin/inventory → InventoryItem[]
- PATCH /api/admin/inventory/:id { op: 'inc'|'dec', amount: number } → InventoryItem
- GET /api/admin/orders?status=pending|accepted|inProgress|completed → OrderSummary[]
- POST /api/admin/orders/:id/accept → { status: 'accepted'|'inProgress' }

### 5.6 유효성/비즈니스 규칙
- 재고 수량은 정수 0~999, 음수 불가
- 주문 접수는 `pending` 상태에서만 가능; 중복 클릭 방지(비활성화/스피너)
- 상태 전이(예시): pending → accepted → inProgress → completed

### 5.7 사용자 흐름
1) 관리자 진입 → 대시보드/재고/주문 목록 동시 로드
2) 재고 증감 필요 시 `+`/`-` 클릭 → 서버 반영 성공 시 카운터/품절 상태 전파
3) 신규 주문 확인 → `주문 접수` 클릭 → 상태 변경 및 대시보드 갱신

### 5.8 오류/피드백/접근성
- 네트워크 실패: 배너 표시, 자동 재시도 1회, 수동 재시도 버튼 제공
- 낙관적 업데이트 사용 시 실패 롤백 알림
- 키보드 조작: `+`/`-`/버튼 포커스 가능, 스크린리더 라벨 제공

### 5.9 성능/품질
- 데이터 폴링 또는 서버 이벤트(추후 SSE/WebSocket)로 신선도 유지(초기엔 폴링 10초)
- 리스트 가상화는 주문이 100건 이상일 때 고려

### 5.10 감사/로그
- 인벤토리 변경 로그: who(없음이면 'admin'), what, delta, when
- 주문 상태 변경 로그: orderId, old→new, when

### 5.11 오픈 이슈
- 정확한 상태 모델(accepted vs inProgress) 정의 확정 필요
- 권한/인증은 학습 범위 밖이나, 추후 보호 필요

## 6. 백엔드 설계 (Backend Design)

### 6.1 데이터베이스 스키마 (PostgreSQL)

ERD (Entity Relationship Diagram) 요약:
- `menu_items`는 여러 `options`를 가질 수 있다 (through `menu_item_options`).
- `orders`는 여러 `order_items`를 포함한다.
- `order_items`는 주문된 특정 `menu_item`을 가리킨다.
- `order_items`는 여러 `options`를 가질 수 있다 (through `order_item_options`).

---

**1. `menu_items` table**
- 메뉴 정보를 저장합니다.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | 메뉴 아이템 고유 ID |
| `name` | `VARCHAR(255)` | `NOT NULL` | 메뉴 이름 (예: "아메리카노 (ICE)") |
| `description` | `TEXT` | | 메뉴 설명 |
| `price` | `INTEGER` | `NOT NULL`, `DEFAULT 0` | 기본 가격 |
| `image_url` | `VARCHAR(255)` | | 메뉴 이미지 URL |
| `stock_quantity`| `INTEGER` | `NOT NULL`, `DEFAULT 0` | 현재 재고 수량 |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 생성 시각 |

**2. `options` table**
- 모든 메뉴에 공통적으로 적용될 수 있는 옵션 정보를 저장합니다.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | 옵션 고유 ID |
| `name` | `VARCHAR(255)` | `NOT NULL`, `UNIQUE` | 옵션 이름 (예: "샷 추가") |
| `price_delta` | `INTEGER` | `NOT NULL`, `DEFAULT 0` | 가격 변동량 |

**3. `menu_item_options` table (Join Table)**
- 메뉴와 옵션 간의 다대다 관계를 정의합니다.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `menu_item_id`| `INTEGER` | `FOREIGN KEY (menu_items.id)` | 메뉴 아이템 ID |
| `option_id` | `INTEGER` | `FOREIGN KEY (options.id)` | 옵션 ID |
| | | `PRIMARY KEY (menu_item_id, option_id)` | |

**4. `orders` table**
- 고객의 주문 정보를 저장합니다.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | 주문 고유 ID |
| `total_price` | `INTEGER` | `NOT NULL` | 주문 총액 (세금 포함) |
| `status` | `VARCHAR(50)`| `NOT NULL`, `DEFAULT 'pending'` | 주문 상태 ('pending', 'inProgress', 'completed') |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 주문 시각 |

**5. `order_items` table**
- 특정 주문에 포함된 개별 메뉴 아이템들을 저장합니다.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | 주문 아이템 고유 ID |
| `order_id` | `INTEGER` | `FOREIGN KEY (orders.id)` | 주문 ID |
| `menu_item_id`| `INTEGER` | `FOREIGN KEY (menu_items.id)` | 메뉴 아이템 ID |
| `quantity` | `INTEGER` | `NOT NULL`, `DEFAULT 1` | 수량 |
| `unit_price` | `INTEGER` | `NOT NULL` | 주문 시점의 단가 (기본가 + 옵션가) |

**6. `order_item_options` table (Join Table)**
- 주문된 특정 아이템에 어떤 옵션이 선택되었는지 저장합니다.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `order_item_id`| `INTEGER` | `FOREIGN KEY (order_items.id)` | 주문 아이템 ID |
| `option_id` | `INTEGER` | `FOREIGN KEY (options.id)` | 선택된 옵션 ID |
| | | `PRIMARY KEY (order_item_id, option_id)` | |

---

### 6.2 API 명세 (API Specification)

#### **Menu API**

- **`GET /api/menu`**: 모든 메뉴 아이템과 선택 가능한 옵션 목록을 조회합니다.
  - **Response Body**:
    ```json
    [
      {
        "id": 1,
        "name": "아메리카노 (ICE)",
        "description": "시원하고 깔끔한 맛",
        "price": 4000,
        "imageUrl": "...",
        "isSoldOut": false,
        "options": [
          { "id": 1, "name": "샷 추가", "priceDelta": 500 },
          { "id": 2, "name": "시럽 추가", "priceDelta": 0 }
        ]
      }
    ]
    ```

#### **Order API**

- **`POST /api/orders`**: 신규 주문을 생성합니다.
  - **Request Body**:
    ```json
    {
      "items": [
        {
          "menuItemId": 1,
          "quantity": 2,
          "options": [1, 2] // Option IDs
        }
      ],
      "totalPrice": 9000
    }
    ```
  - **Response Body**:
    ```json
    {
      "orderId": 123,
      "message": "주문이 성공적으로 접수되었습니다."
    }
    ```

#### **Admin API**

- **`GET /api/admin/stats`**: 대시보드 통계를 조회합니다.
  - **Response Body**:
    ```json
    {
      "totalOrders": 100,
      "pending": 10,
      "inProgress": 5,
      "completed": 85
    }
    ```

- **`GET /api/admin/inventory`**: 전체 메뉴의 재고 현황을 조회합니다.
  - **Response Body**:
    ```json
    [
      { "id": 1, "name": "아메리카노 (ICE)", "stockQuantity": 20 },
      { "id": 2, "name": "아메리카노 (HOT)", "stockQuantity": 4 }
    ]
    ```

- **`PATCH /api/admin/inventory/:id`**: 특정 메뉴의 재고를 수정합니다.
  - **Request Body**:
    ```json
    {
      "quantity": 25
    }
    ```
  - **Response Body**:
    ```json
    { "id": 1, "name": "아메리카노 (ICE)", "stockQuantity": 25 }
    ```

- **`GET /api/admin/orders`**: 주문 목록을 조회합니다. (상태별 필터링 가능)
  - **Query Parameter**: `?status=pending` (optional)
  - **Response Body**:
    ```json
    [
      {
        "id": 123,
        "createdAt": "2025-10-20T13:00:00Z",
        "totalPrice": 9000,
        "status": "pending",
        "items": [
          { "name": "아메리카노 (ICE)", "quantity": 2, "options": ["샷 추가", "시럽 추가"] }
        ]
      }
    ]
    ```

- **`PATCH /api/admin/orders/:id/status`**: 주문 상태를 변경합니다.
  - **Request Body**:
    ```json
    {
      "status": "inProgress"
    }
    ```
  - **Response Body**:
    ```json
    {
      "orderId": 123,
      "newStatus": "inProgress"
    }
    ```
