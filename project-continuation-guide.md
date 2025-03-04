# Test Data Generator - Development Continuation Guide

## Project Overview

This is a Java application replicating the functionality of data generation tools like generatedata.com and Mockaroo. The application allows users to:

- Define customizable data columns
- Specify the number of rows to generate
- Output data in CSV, XML, and JSON formats
- Save and reuse generation templates
- Schedule one-time or recurring generations
- Generate test data in batch
- Analyze redline PDFs to extract variables

The project uses Java 21, Spring Boot, Java Faker, H2 (and eventually PostgreSQL) for backend, and will use React with TypeScript and Tailwind CSS for frontend.

## Architecture and Design Patterns

The project follows standard Spring Boot architecture with:

1. **Controllers**: REST API endpoints
2. **Services**: Business logic implementation
3. **Repositories**: Data access layer
4. **DTOs**: Data transfer objects for API requests/responses
5. **Entities**: JPA entities for database persistence
6. **Custom Exceptions**: For handling specific error cases

Key design patterns include:

- **Strategy Pattern**: For different data generators
- **Factory Pattern**: Through the DataTypeRegistry for creating data generators
- **Decorator Pattern**: In the AbstractDataGenerator implementation
- **Repository Pattern**: For data access
- **Builder Pattern**: For constructing complex objects

## Core Components

### Generator Framework

The data generation is built around these key components:

1. **DataGenerator Interface**: Defines the contract for all data generators
```java
public interface DataGenerator {
    String generate(Map<String, Object> constraints);
    String getType();
    Map<String, String> getConstraintsMetadata();
    Optional<String> validateConstraints(Map<String, Object> constraints);
}
```

2. **AbstractDataGenerator**: Base implementation with common functionality
3. **DataGeneratorType Annotation**: For auto-discovery of generator implementations
4. **DataTypeRegistry**: Central registry managing all available generators

The system allows for easy addition of new data types without modifying core code.

### Data Model

1. **Template**: Contains metadata and column definitions
2. **ColumnDefinition**: Defines a single column's properties (name, type, constraints)
3. **GenerationSchedule**: Defines scheduled generation jobs

### Output Formats

The system supports three output formats:
- CSV
- JSON
- XML

Each format is handled in the DataGenerationService with appropriate escaping and formatting.

### Batch Processing

Batch generation allows processing multiple templates at once, either sequentially or in parallel, implemented in BatchGenerationService.

### Scheduling System

Scheduling is implemented using Quartz Scheduler with:
- One-time scheduling
- Recurring scheduling using cron expressions
- Generation jobs persist results to the file system

## Implementation Details

### Data Generators

1. **FirstNameGenerator**: Generates random first names using Java Faker
2. **DateGenerator**: Generates random dates with formatting options

Constraints are passed as a Map<String, Object> to control generation behavior.

### Error Handling

A GlobalExceptionHandler provides consistent error responses across all API endpoints, handling:
- Template/Schedule not found
- Validation errors
- Data generation errors
- PDF analysis errors
- General exceptions

### Services

1. **DataGenerationService**: Core service for generating data based on templates
2. **BatchGenerationService**: Handles batch processing of multiple templates
3. **ScheduleService**: Manages scheduled generation jobs

## API Endpoints

### Template Management
- Create, read, update, delete templates and column definitions

### Data Generation
- Generate data based on templates
- Support for different output formats

### Batch Generation
- Generate data for multiple templates in a single request
- Support for parallel processing

### Schedule Management
- Create, read, update, delete generation schedules
- Support for one-time and recurring schedules

## Development Guidelines

### Adding New Data Generators

1. Create a new class that extends AbstractDataGenerator
2. Annotate with @Component and @DataGeneratorType
3. Implement the generate() method
4. Define constraints metadata
5. Implement constraint validation if needed

Example:
```java
@Component
@DataGeneratorType(
    category = "Personal",
    displayName = "Last Name",
    description = "Generates random last names"
)
public class LastNameGenerator extends AbstractDataGenerator {
    
    private final Faker faker;
    
    public LastNameGenerator() {
        super("lastName");
        this.faker = new Faker();
    }
    
    @Override
    public String generate(Map<String, Object> constraints) {
        // Implementation logic here
        return faker.name().lastName();
    }
    
    @Override
    public Map<String, String> getConstraintsMetadata() {
        // Define available constraints
        Map<String, String> metadata = new HashMap<>();
        return metadata;
    }
}
```

### Error Handling Best Practices

1. Throw specific exceptions from the custom exception classes
2. Let the GlobalExceptionHandler manage the response format
3. Include descriptive error messages
4. Log errors appropriately with context

### Database Operations

The project currently uses H2 for development and will migrate to PostgreSQL later.

JPA repositories handle database operations with:
- Standard CRUD operations
- Custom query methods
- Transaction management

### Testing Strategy

1. Unit tests for services and generators
2. Integration tests for APIs
3. Repository tests with test database

## Next Steps for Development

1. Complete the remaining data generators for other common data types
2. Implement PDF analysis functionality
3. Develop the React frontend
4. Add user authentication and authorization
5. Implement PostgreSQL migration
6. Add monitoring and metrics
7. Create comprehensive documentation

## Key Interfaces and Extension Points

1. **DataGenerator**: For adding new data types
2. **OutputFormatter**: For adding new output formats (currently embedded in DataGenerationService)
3. **Repository Interfaces**: For customizing data access
4. **REST Controllers**: For exposing new functionality

## Library and Framework Dependencies

1. **Spring Boot**: Core framework
2. **Java Faker**: For generating realistic test data
3. **Quartz Scheduler**: For scheduling jobs
4. **H2 Database**: For development persistence
5. **Apache PDFBox**: For PDF analysis (to be implemented)
6. **Jackson**: For JSON processing
7. **JUnit and Mockito**: For testing

## Implementation Challenges

1. **Handling Diverse Data Types**: The system must support a wide range of data types with different constraints.
2. **Performance**: For large datasets and batch processing, performance optimization is essential.
3. **PDF Variable Detection**: Detecting variables in redline PDFs requires robust parsing and pattern recognition.
4. **Parallel Processing**: Ensuring thread safety in parallel batch generation.

## Database Schema

The main entities are:
1. **templates**: Stores template definitions
2. **column_definitions**: Stores column definitions linked to templates
3. **column_constraints**: Stores constraints for column definitions
4. **generation_schedules**: Stores schedule information for data generation jobs

## Key Classes to Understand

1. **DataGenerationService**: Central service for data generation
2. **DataTypeRegistry**: Registry for all data generators
3. **BatchGenerationService**: Service for batch generation
4. **ScheduleService**: Service for managing schedules
5. **GenerationJob**: Quartz job for scheduled generation

## Configuration

The application.properties file contains:
- Server configuration
- Database configuration
- File upload settings
- Logging configuration
- Output directory settings

## Documentation and References

- **JavaDocs**: Throughout the codebase for detailed documentation
- **Custom Annotations**: For metadata and behavior customization
- **Error Handling**: Consistent error responses with meaningful messages
- **Logging**: Comprehensive logging for debugging and monitoring
