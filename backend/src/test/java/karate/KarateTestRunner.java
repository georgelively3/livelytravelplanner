package karate;

import com.intuit.karate.junit5.Karate;

/**
 * Karate Test Runner for API Integration Tests
 * 
 * This runner executes individual .feature files with proper test data isolation
 * using unique email generation and test helpers for reliable testing.
 */
class KarateTestRunner {
    
    @Karate.Test
    Karate testHealth() {
        return Karate.run("classpath:karate/health-test.feature").relativeTo(getClass());
    }
    
    @Karate.Test
    Karate testSignup() {
        return Karate.run("classpath:karate/signup-test.feature").relativeTo(getClass());
    }
    
    @Karate.Test
    Karate testLogin() {
        return Karate.run("classpath:karate/login-test.feature").relativeTo(getClass());
    }
    
    @Karate.Test
    Karate testTripsAPI() {
        return Karate.run("classpath:karate/trips-test.feature").relativeTo(getClass());
    }
}