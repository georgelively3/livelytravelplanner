plugins {
    id("org.springframework.boot") version "3.1.5" apply false
    id("io.spring.dependency-management") version "1.1.3" apply false
    kotlin("jvm") version "1.8.22" apply false
}

// Common configuration for all projects
allprojects {
    group = "com.travelplanner"
    version = "0.0.1-SNAPSHOT"
    
    repositories {
        mavenCentral()
    }
}

// Common configuration for subprojects
subprojects {
    tasks.withType<Test> {
        useJUnitPlatform()
        testLogging {
            events("passed", "skipped", "failed")
            exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
        }
    }
}