package karate;

import com.intuit.karate.junit5.Karate;

/**
 * Karate Test Runner for API Integration Tests
 * 
 * This runner will execute all .feature files in the karate folder
 * and provides comprehensive API testing for the Travel Planner application.
 */
class KarateTestRunner {
    
    @Karate.Test
    Karate testHealth() {
        return Karate.run("classpath:karate/health-test.feature").relativeTo(getClass());
    }
    
    @Karate.Test
    Karate testSetupOnly() {
        return Karate.run("classpath:karate/setup-test.feature").relativeTo(getClass());
    }
    
    @Karate.Test
    Karate testAll() {
        return Karate.run().relativeTo(getClass());
    }
    
    @Karate.Test
    Karate testAuth() {
        return Karate.run("classpath:karate/auth").relativeTo(getClass());
    }
    
    @Karate.Test
    Karate testTrips() {
        return Karate.run("classpath:karate/trips").relativeTo(getClass());
    }
    
    @Karate.Test
    Karate testPersonas() {
        return Karate.run("classpath:karate/personas").relativeTo(getClass());
    }
}