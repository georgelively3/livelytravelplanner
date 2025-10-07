rootProject.name = "livelytravelplanner"

include("backend", "frontend")

// Configure project names
project(":backend").name = "travel-planner-backend"
project(":frontend").name = "travel-planner-frontend"