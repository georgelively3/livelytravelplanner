plugins {
    id("org.springframework.boot") version "3.1.5"
    id("io.spring.dependency-management") version "1.1.3"
    id("java")
    id("jacoco")
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

dependencies {
    // Spring Boot Starters
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-security")
    
    // JWT
    implementation("io.jsonwebtoken:jjwt-api:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")
    
    // Database
    runtimeOnly("com.h2database:h2")
    
    // Development tools
    compileOnly("org.projectlombok:lombok")
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    annotationProcessor("org.projectlombok:lombok")
    
    // Testing
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("com.intuit.karate:karate-junit5:1.4.1")
}

// JaCoCo Configuration
jacoco {
    toolVersion = "0.8.10"
}

tasks.jacocoTestReport {
    dependsOn(tasks.test, tasks.compileJava, tasks.processResources)
    
    reports {
        xml.required.set(true)
        html.required.set(true)
    }
    
    classDirectories.setFrom(
        files(classDirectories.files.map {
            fileTree(it) {
                exclude("**/model/**")
            }
        })
    )
}

tasks.jacocoTestCoverageVerification {
    dependsOn(tasks.jacocoTestReport)
    
    violationRules {
        rule {
            limit {
                counter = "INSTRUCTION"
                value = "COVEREDRATIO"
                minimum = "0.75".toBigDecimal()
            }
        }
    }
    
    classDirectories.setFrom(
        files(classDirectories.files.map {
            fileTree(it) {
                exclude("**/model/**")
            }
        })
    )
}

// Custom task for running Karate tests separately
tasks.register<Test>("karateTest") {
    description = "Run Karate integration tests"
    group = "verification"
    
    useJUnitPlatform {
        includeEngines("junit-jupiter")
        includeTags("karate")
    }
    
    include("**/KarateTestRunner.*")
    
    testLogging {
        events("passed", "skipped", "failed")
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
        showStandardStreams = true
    }
    
    reports {
        html.outputLocation = layout.buildDirectory.dir("reports/karate-tests")
        junitXml.outputLocation = layout.buildDirectory.dir("test-results/karate-test")
    }
}

// Custom task for running unit tests only (excluding Karate)
tasks.register<Test>("unitTest") {
    description = "Run unit tests only (excluding Karate integration tests)"
    group = "verification"
    
    useJUnitPlatform {
        includeEngines("junit-jupiter")
        excludeTags("karate")
    }
    
    exclude("**/KarateTestRunner.*")
    
    testLogging {
        events("passed", "skipped", "failed")
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}

// Configure the main test task to run both unit and Karate tests
tasks.test {
    description = "Run all tests (unit + Karate integration tests)"
    
    useJUnitPlatform()
    
    testLogging {
        events("passed", "skipped", "failed")
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
    
    finalizedBy(tasks.jacocoTestReport)
}

// Ensure JaCoCo runs after tests
tasks.check {
    dependsOn(tasks.jacocoTestCoverageVerification)
}

// Spring Boot configuration
springBoot {
    buildInfo()
}

// Exclude Lombok from the final JAR
tasks.jar {
    enabled = false
    archiveClassifier = ""
}

tasks.bootJar {
    enabled = true
    archiveClassifier = ""
    exclude("**/*.original")
}