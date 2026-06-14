---
description: "Tạo test cases cho file/component/class. Dùng: /quality/write-test <đường dẫn file>"
allowed-tools: Bash, Read, Write, Grep
---

# /quality/write-test — Tạo Tests

**Target file:** $ARGUMENTS

## Bước 1 — Đọc file cần test

```bash
# Xác định loại file
# .tsx / .ts trong fe/ → Vitest + React Testing Library
# .java trong be/ → JUnit 5 + Mockito
```

Đọc `$ARGUMENTS` để hiểu:
- Exported functions / components / classes
- Dependencies (hooks, API calls, services)
- Business logic cần verify
- Edge cases và error paths

## Bước 2A — FE Tests (nếu file trong `fe/src/`)

Đọc test tương tự trong `fe/src/test/` để nắm pattern.

**Test file location:** `fe/src/test/[mirror-path]/[filename].test.ts(x)`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock dependencies
vi.mock('@/lib/api/...', () => ({ ... }))
vi.mock('@/hooks/...', () => ({ ... }))
vi.mock('@tanstack/react-router', () => ({ useRouter: () => ({ navigate: vi.fn() }) }))

// QueryClient wrapper nếu component dùng TanStack Query
function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

describe('[ComponentName]', () => {
  beforeEach(() => { vi.clearAllMocks() })

  // Happy path
  it('renders correctly', () => { ... })
  it('calls API on submit', async () => { ... })
  
  // Error paths  
  it('shows error toast on API failure', async () => { ... })
  it('shows validation error when field empty', async () => { ... })
  
  // Edge cases
  it('handles null/undefined props gracefully', () => { ... })
})
```

**Coverage targets theo SonarQube (≥ 80%):**
- Render mặc định
- User interactions (click, change, submit)
- Async flows (loading → success → error)
- Conditional renders (if/else branches)
- Callback props được gọi đúng

## Bước 2B — BE Tests (nếu file trong `be/src/`)

Đọc test tương tự trong `be/src/test/` để nắm pattern.

**Test file location:** `be/src/test/java/[mirror-path]/[ClassName]Test.java`

```java
@ExtendWith(MockitoExtension.class)
class [ClassName]Test {

    @Mock
    private [Dependency]Repository repo;
    
    @InjectMocks
    private [ClassName]ServiceImpl service;

    // Happy path
    @Test
    void methodName_whenValidInput_returnsExpected() {
        // Arrange
        when(repo.findById(1L)).thenReturn(Optional.of(entity));
        // Act
        var result = service.method(1L);
        // Assert
        assertThat(result.getId()).isEqualTo(1L);
        verify(repo).findById(1L);
    }
    
    // Error paths
    @Test
    void methodName_whenNotFound_throwsAppException() {
        when(repo.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.method(99L))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.X_NOT_FOUND);
    }
}
```

## Bước 3 — Verify tests pass

**FE:**
```bash
cd fe && npx vitest run src/test/[path-to-test] --reporter=verbose
```

**BE:**
```bash
cd be && ./mvnw.cmd test -pl . -Dtest=[ClassName]Test -q
```

## Bước 4 — Check coverage

```bash
cd fe && npm run test:coverage 2>&1 | grep -A5 "[filename]"
```

## Output
- File test đã tạo: `[path]`
- Tests: X passed
- Coverage trên file target: X%
