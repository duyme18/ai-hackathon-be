package com.ai_hackathon.app;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// Requires a running MariaDB — run manually or in CI with a real DB container.
@SpringBootTest
@Disabled("Requires live MariaDB — skipped in unit test phase")
class AppApplicationTests {

    @Test
    void contextLoads() {
    }
}
