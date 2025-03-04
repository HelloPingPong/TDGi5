# Test Data Generator - Development Continuation Guide

## Project Overview

This Java application clones the functionality of data generation tools like generatedata.com and Mockaroo. The application allows users to generate test data for document variables used in Quadient Inspire and Quadient Designer, ensuring test data aligns with variables specified in redline PDFs. Key capabilities include:

- Defining customizable data columns with various data types and constraints
- Specifying the number of rows to generate
- Outputting data in CSV, XML, and JSON formats
- Saving and reusing generation templates
- Scheduling one-time or recurring generations
- Generating test data in batch mode (sequential or parallel)
- Analyzing redline PDFs to extract variables and infer appropriate data types

The project uses Java 21, Spring Boot, H2 database (with plans to migrate to PostgreSQL), and will have a React with TypeScript and Tailwind CSS frontend.

## Architecture and Design Patterns

The application follows a standard Spring Boot architecture with:

1. **Controllers**: REST API endpoints for template management, data generation, scheduling, batch processing, and PDF analysis
2. **Services**: Business logic implementation with clear separation of concerns
3. **Repositories**: Data access layer using Spring Data JPA
4. **DTOs**: Data transfer objects for API requests/responses
5. **Entities**: JPA entities for database persistence
6. **Custom Exceptions**: Specialized exception types for different error scenarios

Key design patterns include:

- **Strategy Pattern**: Used in the data generator framework, allowing different generation strategies for different data types
- **Factory Pattern**: Implemented in the DataTypeRegistry for creating and managing data generators
- **Decorator Pattern**: Applied in the AbstractDataGenerator implementation
- **Repository Pattern**: For data access via Spring Data JPA
- **Builder Pattern**: For constructing complex objects
- **Observer Pattern**: Used in the scheduling system

## Core Components

### Data Generator Framework

The data generation system is built around these key components:

1. **DataGenerator Interface**: Defines the contract for all data generators
```java
public interface DataGenerator {
    String generate(Map<String, Object> constraints);
    String getType();
    Map<String, String> getConstraintsMetadata();
    Optional<String> validateConstraints(Map<String, Object> constraints);
}
```

2. **AbstractDataGenerator**: Base implementation with common functionality, including constraint handling
3. **DataGeneratorType Annotation**: For auto-discovery and categorization of generator implementations
4. **DataTypeRegistry**: Central registry that manages all available generators
5. **Concrete Generators**: Implementations for specific data types (FirstName, Date, String, etc.)

### Data Model

1. **Template**: Contains metadata and column definitions for data generation
2. **ColumnDefinition**: Defines a single column's properties (name, type, constraints)
3. **GenerationSchedule**: Defines scheduled generation jobs (one-time or recurring)

### Output Formats

The system supports three output formats:
- **CSV**: Comma-separated values with proper escaping
- **JSON**: Properly formatted JSON array of objects
- **XML**: Well-formed XML with a configurable root element

Each format is handled in the DataGenerationService with appropriate escaping and formatting.

### Batch Processing

The BatchGenerationService allows processing multiple templates at once:
- Sequential processing for predictable order
- Parallel processing for improved performance
- Result aggregation and preview generation

### PDF Analysis

The PDFAnalysisService analyzes redline PDFs to extract variables:
- Extracts variables from annotations (underlines, highlights)
- Detects variables matching patterns like [[variableName]] or {{variableName}}
- Infers appropriate data types based on variable names
- Creates template with suitable column definitions and constraints

### Scheduling System

The scheduling system uses Quartz Scheduler to:
- Schedule one-time generation jobs
- Create recurring jobs using cron expressions
- Persist generation results to the file system
- Track execution history and results

## Implementation Details

### Data Generators

The project includes several data generator implementations:

1. **FirstNameGenerator**: Generates random first names using Java Faker
2. **DateGenerator**: Generates random dates with formatting options
3. **StringGenerator**: Generates random strings based on length or regex patterns

Constraints are passed as a Map<String, Object> to control generation behavior, with each generator supporting type-specific constraints.

### Error Handling

A GlobalExceptionHandler provides consistent error responses across all API endpoints, handling:
- Template/Schedule not found exceptions
- Validation errors
- Data generation exceptions
- PDF analysis exceptions
- Scheduler exceptions
- General exceptions

### Services

1. **DataGenerationService**: Core service for generating data based on templates
2. **BatchGenerationService**: Handles batch processing of multiple templates
3. **TemplateService**: Manages template creation, retrieval, updating, and deletion
4. **ScheduleService**: Manages generation schedules
5. **SchedulerService**: Integrates with Quartz Scheduler for job management
6. **PDFAnalysisService**: Analyzes PDFs to extract variables and create templates

## API Endpoints

### Template Management
- `POST /api/templates`: Create a new template
- `GET /api/templates/{id}`: Get a template by ID
- `GET /api/templates`: Get all templates (paginated)
- `PUT /api/templates/{id}`: Update a template
- `DELETE /api/templates/{id}`: Delete a template
- `GET /api/templates/search`: Search templates by name
- `GET /api/templates/datatypes`: Get available data types and metadata

### Data Generation
- `POST /api/generate`: Generate data based on a template
- `GET /api/generate/{templateId}`: Generate data via GET (useful for browser downloads)

### Batch Generation
- `POST /api/batch/generate`: Generate data for multiple templates

### Schedule Management
- `POST /api/schedules`: Create a new schedule
- `GET /api/schedules/{id}`: Get a schedule by ID
- `GET /api/schedules`: Get all schedules (paginated)
- `PUT /api/schedules/{id}`: Update a schedule
- `DELETE /api/schedules/{id}`: Delete a schedule
- `GET /api/schedules/byTemplate/{templateId}`: Get schedules for a template
- `GET /api/schedules/byStatus/{status}`: Get schedules by status
- `POST /api/schedules/{id}/activate`: Activate a schedule
- `POST /api/schedules/{id}/pause`: Pause a schedule

### PDF Analysis
- `POST /api/pdf/analyze`: Analyze a redline PDF and extract variables

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

### Adding New Output Formats

To add a new output format:

1. Add a new value to the Template.OutputFormat enum
2. Implement a formatter method in DataGenerationService
3. Update controllers to handle the new format

### Scheduling Best Practices

1. For one-time schedules, set nextRunTime but leave cronExpression null
2. For recurring schedules, set a valid cronExpression
3. Use the SchedulerService to manage job lifecycle
4. Handle job execution results properly to update schedule status

### Error Handling Best Practices

1. Throw specific exceptions from the custom exception classes
2. Let the GlobalExceptionHandler manage the response format
3. Include descriptive error messages
4. Log errors appropriately with context
5. Use appropriate HTTP status codes for REST responses

### Database Operations

The project currently uses H2 for development and will migrate to PostgreSQL later.

JPA repositories handle database operations with:
- Standard CRUD operations
- Custom query methods
- Transaction management (@Transactional annotations)

### PDF Analysis Improvements

When improving the PDF analysis functionality:

1. Enhance variable detection with more sophisticated pattern matching
2. Improve data type inference based on variable context
3. Add support for extracting and inferring constraints
4. Consider machine learning approaches for complex documents

### Testing Strategy

1. Unit tests for services and generators
2. Integration tests for APIs
3. Repository tests with test database
4. End-to-end tests for critical flows

## Next Steps for Development

1. **Implement Additional Data Generators**:
   - Add generators for addresses, phone numbers, email addresses, etc.
   - Implement domain-specific generators for financial data
   - Create generators for complex document-specific data

2. **Enhance PDF Analysis**:
   - Improve variable detection accuracy
   - Add support for more complex redline formats
   - Implement better data type inference

3. **Develop Frontend**:
   - Implement React/TypeScript frontend following the structure in Project Structure.txt
   - Create intuitive UI for template management
   - Develop visualization components for generated data
   - Build scheduling and batch management interfaces

4. **Add Authentication and Authorization**:
   - Implement user authentication
   - Add role-based access control
   - Secure API endpoints

5. **Improve Performance**:
   - Optimize batch processing for large datasets
   - Add caching for frequently used templates
   - Implement more efficient data generation algorithms

6. **Migration to PostgreSQL**:
   - Update database configuration
   - Test with production-like data volumes
   - Implement database migration scripts

7. **Add Monitoring and Metrics**:
   - Implement health endpoints
   - Add performance metrics
   - Set up alerting for failed jobs

8. **Documentation**:
   - Create comprehensive API documentation
   - Develop user guides
   - Document extension points

## Key Interfaces and Extension Points

1. **DataGenerator**: For adding new data types
2. **OutputFormatter**: For adding new output formats
3. **Repository Interfaces**: For customizing data access
4. **REST Controllers**: For exposing new functionality
5. **PDF Analysis**: For enhancing variable detection

## Library and Framework Dependencies

The project uses several key libraries:

1. **Spring Boot**: Core framework (2.7.8)
2. **Java Faker**: For generating realistic test data
3. **Generex**: For regex-based string generation
4. **Quartz Scheduler**: For scheduling jobs
5. **Apache PDFBox**: For PDF analysis (2.0.28)
6. **Jackson**: For JSON processing
7. **H2 Database**: For development persistence
8. **JUnit and Mockito**: For testing (via Spring Boot Test)

## Database Schema

The main entities are:
1. **templates**: Stores template definitions
2. **column_definitions**: Stores column definitions linked to templates
3. **column_constraints**: Stores constraints for column definitions as key-value pairs
4. **generation_schedules**: Stores schedule information for data generation jobs

## File Generation and Storage

Generated data files:
1. Are saved to the `generated-data` directory for scheduled jobs
2. Include timestamps and metadata in filenames
3. Are returned directly to the client for on-demand generation
4. Support multiple formats (CSV, JSON, XML)

## Scheduler Implementation

The scheduling system:
1. Uses Quartz for job scheduling
2. Supports both cron-based recurring and one-time schedules
3. Persists job information in the database
4. Implements a periodic check for due jobs
5. Handles job execution failures gracefully

## PDF Analysis Implementation

The PDF analysis system:
1. Uses Apache PDFBox to extract content and annotations
2. Identifies variables through annotations and pattern matching
3. Infers data types based on variable names
4. Generates appropriate constraints for the inferred types
5. Creates a complete template ready for data generation

## Configuration

The application.properties file contains:
- Server configuration (port 8080, context path /tdg)
- Database configuration (H2 for development)
- JPA/Hibernate settings
- File upload limits (10MB)
- Logging configuration
- Output directory settings (generated-data)
- Compression and Actuator settings

## Documentation and References

- **JavaDocs**: Throughout the codebase for detailed documentation
- **Custom Annotations**: For metadata and behavior customization
- **Error Handling**: Consistent error responses with meaningful messages
- **Logging**: Comprehensive logging for debugging and monitoring

## Special Considerations for Continued Development

1. **Handling Large Files**:
   - When implementing large file processing, consider streaming approaches
   - Add pagination for large data returns
   - Implement progress tracking for long-running jobs

2. **Frontend Development**:
   - Ensure responsive design
   - Implement proper validation mirroring backend validation
   - Create intuitive interfaces for complex configuration

3. **Security**:
   - Implement CSRF protection
   - Add input validation at controller level
   - Consider rate limiting for API endpoints

4. **Testing Data Generators**:
   - Test edge cases for all generators
   - Verify constraint validation logic
   - Ensure generated data meets specified patterns and ranges
