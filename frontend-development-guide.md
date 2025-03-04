# Test Data Generator - Frontend Development Guide

## Project Overview

The Test Data Generator frontend is a React application that provides a user interface for creating test data based on customizable templates. It integrates with the Java Spring Boot backend to generate test data for document variables used in Quadient Inspire and Quadient Designer. The application follows JPMorgan Chase design styling and provides robust functionality for template management, data generation, scheduling, batch processing, and PDF analysis.

## Technology Stack

- **React**: Core UI library (with Function Components and Hooks)
- **TypeScript**: For type safety and enhanced developer experience
- **React Router**: For application routing and navigation
- **Feather Icons**: For consistent iconography throughout the application
- **CSS Modules**: For component-scoped styling

## Project Structure

```
src/
├── api/               # API client and service interfaces
│   ├── api-client.tsx # Base API client for HTTP requests
│   ├── batch-api.tsx  # Batch generation API
│   ├── generation-api.tsx # Data generation API
│   ├── pdf-api.tsx    # PDF analysis API
│   ├── schedule-api.tsx # Schedule management API
│   └── template-api.tsx # Template management API
├── components/        # Reusable UI components
│   ├── common/        # Generic UI components
│   │   ├── Button.tsx # Button component with variants
│   │   ├── Card.tsx   # Card layout component
│   │   └── ... 
│   ├── features/      # Feature-specific components
│   │   ├── templates/ # Template-related components
│   │   ├── generation/ # Generation-related components
│   │   └── ...
│   └── layout/        # Layout components
│       ├── MainLayout.tsx # Main application layout
│       ├── Header.tsx    # Application header
│       ├── Sidebar.tsx   # Navigation sidebar
│       └── Footer.tsx    # Application footer
├── hooks/             # Custom React hooks
│   └── useApi.tsx     # Hook for API interactions
├── pages/             # Page components
│   ├── Dashboard.tsx  # Dashboard page
│   ├── Templates.tsx  # Templates listing page
│   ├── TemplateForm.tsx # Template creation/editing page
│   └── ...
├── styles/            # Global styles
│   ├── global.css     # Global CSS styles
│   └── variables.css  # CSS variables for theming
├── App.tsx            # Root application component
├── index.tsx          # Application entry point
└── routes.tsx         # Application routing configuration
```

## Key Components and Features

### API Layer

The application includes a comprehensive API layer for interacting with the backend:

1. **Base API Client** (`api-client.tsx`): 
   - Handles all HTTP requests (GET, POST, PUT, DELETE)
   - Manages request headers and authentication
   - Provides error handling and response formatting
   - Supports file uploads and downloads

2. **Feature-specific API Modules**:
   - `template-api.tsx`: Template management operations
   - `generation-api.tsx`: Data generation operations
   - `schedule-api.tsx`: Schedule management operations
   - `batch-api.tsx`: Batch generation operations
   - `pdf-api.tsx`: PDF analysis operations

3. **API Response Interface**:
   ```typescript
   export interface ApiResponse<T> {
     data?: T;
     error?: string;
     status: number;
   }
   ```

### Custom Hooks

1. **useApi Hook** (`hooks/useApi.tsx`):
   - Manages loading, error, and data states for API calls
   - Provides execution function for triggering API calls
   - Supports immediate execution on component mount
   - Handles success and error callbacks

   ```typescript
   const {
     data,           // Response data
     isLoading,      // Loading state
     error,          // Error message
     status,         // HTTP status code
     execute,        // Function to call the API
     reset           // Function to reset states
   } = useApi(apiFunction, initialArgs, options);
   ```

### Common UI Components

1. **Button** (`components/common/Button.tsx`):
   - Supports multiple variants (primary, secondary, outline, text, danger, success)
   - Different sizes (small, medium, large)
   - Loading state with spinner
   - Icon support (left and right)
   - Fullwidth option

2. **Card** (`components/common/Card.tsx`):
   - Container component with header, body, and footer sections
   - Consistent styling with shadows and rounded corners

3. **Form Components**:
   - Input
   - Select
   - Checkbox
   - Radio buttons

4. **Feedback Components**:
   - Alert
   - Modal
   - Loader

### Layout Components

1. **MainLayout** (`components/layout/MainLayout.tsx`):
   - Contains the application structure with sidebar, header, content area, and footer
   - Handles responsive behavior
   - Manages sidebar collapse state

2. **Sidebar** (`components/layout/Sidebar.tsx`):
   - Navigation menu with icons and text
   - Collapsible design
   - Active state highlighting
   - JPMorgan Chase branded styling

3. **Header** (`components/layout/Header.tsx`):
   - Application header with page title
   - Search functionality
   - User profile and notification indicators
   - Sidebar toggle button

### Feature-Specific Components

1. **Template Components**:
   - Template listing
   - Template form for creation and editing
   - Column definition form
   - Data type selector

2. **Generation Components**:
   - Generation form
   - Result preview
   - Download options

3. **PDF Analysis Components**:
   - PDF uploader
   - Analysis progress indicator
   - Variable extraction preview
   - Template generation from extracted variables

## Core Pages

### Dashboard (`pages/Dashboard.tsx`)

- Overview of application statistics
- Recent activity list
- Upcoming schedules
- Quick action buttons for common tasks

### Templates Management (`pages/Templates.tsx`, `pages/TemplateForm.tsx`)

- List of available templates with filtering and search
- Template creation and editing interface
- Column definition management
- Data type configuration

### Generate Data (`pages/GenerateData.tsx`)

- Template selection
- Output format configuration (CSV, JSON, XML)
- Row count specification
- Data preview and download options

### Schedules (`pages/Schedules.tsx`)

- Schedule listing with status indicators
- Creation interface for one-time and recurring schedules
- Cron expression builder with presets
- Schedule activation/deactivation controls

### Batch Generation (`pages/BatchGeneration.tsx`)

- Multiple template selection
- Batch configuration options
- Parallel/sequential processing options
- Batch results with individual download options

### PDF Analysis (`pages/PDFAnalysis.tsx`)

- PDF file upload interface
- Analysis progress visualization
- Extracted variables display
- Variable type editing
- Template generation from analysis results

## Styling and Theming

The application uses a comprehensive theming system based on CSS variables:

1. **Color Scheme**:
   - Primary colors based on JPMorgan Chase branding
   - Secondary colors for various state indicators
   - Neutral color palette for backgrounds, borders, and text

2. **Typography**:
   - Font family: Open Sans
   - Font sizes from extra small to 4XL
   - Font weights from light to bold

3. **Spacing System**:
   - Consistent spacing scale from 0.25rem to 5rem

4. **Component Design**:
   - Consistent border radius, shadows, and transitions
   - Status indicators using branded colors
   - Interactive elements with appropriate hover/focus states

## Routing Configuration

The application uses React Router for navigation with a structure defined in `routes.tsx`:

```typescript
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      {
        path: 'templates',
        children: [
          { index: true, element: <Templates /> },
          { path: 'new', element: <TemplateForm /> },
          { path: ':id', element: <TemplateForm /> },
          { path: ':id/edit', element: <TemplateForm /> }
        ]
      },
      { path: 'generate', element: <GenerateData /> },
      {
        path: 'schedules',
        children: [
          { index: true, element: <Schedules /> },
          { path: ':id', element: <Schedules /> }
        ]
      },
      { path: 'batch', element: <BatchGeneration /> },
      { path: 'pdf-analysis', element: <PDFAnalysis /> },
      { path: '*', element: <NotFound /> }
    ]
  }
]);
```

## State Management

The application uses React's built-in state management:

1. **Local Component State**:
   - `useState` hook for component-specific state
   - `useEffect` hook for side effects and data fetching

2. **API State Management**:
   - Custom `useApi` hook for handling API-related state

3. **Form State Management**:
   - Controlled components for form inputs
   - Local state for form values and validation

## API Integration Patterns

1. **Data Fetching**:
   ```typescript
   const {
     data: templatesData,
     isLoading: isLoadingTemplates,
     error: templatesError,
     execute: fetchTemplates
   } = useApi(getTemplates, [], { immediate: true });
   ```

2. **Data Submission**:
   ```typescript
   const {
     isLoading: isSubmitting,
     error: submitError,
     execute: submitTemplate
   } = useApi(createTemplate);

   const handleSubmit = async () => {
     const response = await submitTemplate(formData);
     if (response.data) {
       // Handle success
     }
   };
   ```

3. **File Uploads**:
   ```typescript
   const {
     isLoading: isUploading,
     error: uploadError,
     execute: uploadPdf
   } = useApi(analyzePdf);

   const handleFileUpload = async (file: File) => {
     const response = await uploadPdf(file);
     if (response.data) {
       // Handle successful upload
     }
   };
   ```

## Feature Implementation Guidelines

### Adding New Components

1. Create a new component file in the appropriate directory
2. Define TypeScript interfaces for props
3. Implement the component with proper typing
4. Export the component

Example:
```typescript
import React from 'react';
import './MyComponent.css';

interface MyComponentProps {
  title: string;
  description?: string;
  onAction?: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  description, 
  onAction 
}) => {
  return (
    <div className="my-component">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {onAction && (
        <button onClick={onAction}>Action</button>
      )}
    </div>
  );
};

export default MyComponent;
```

### Adding New Pages

1. Create a new page component in the `pages` directory
2. Add the route to `routes.tsx`
3. Add navigation link in the sidebar if needed

### Adding New API Services

1. Define interfaces for request and response data
2. Add service functions to the appropriate API file
3. Use the base `apiRequest` function for HTTP requests

Example:
```typescript
export interface NewFeatureRequest {
  name: string;
  config: Record<string, any>;
}

export interface NewFeatureResponse {
  id: string;
  name: string;
  status: string;
}

export async function createNewFeature(
  request: NewFeatureRequest
): Promise<ApiResponse<NewFeatureResponse>> {
  return post<NewFeatureResponse>('/new-feature', request);
}
```

### Form Handling

1. Use controlled components for form inputs
2. Manage form state with `useState`
3. Validate inputs before submission
4. Show appropriate loading and error states

Example:
```typescript
const [formData, setFormData] = useState({
  name: '',
  description: '',
  type: 'default'
});

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData({
    ...formData,
    [name]: value
  });
};

const handleSubmit = async () => {
  // Validation
  if (!formData.name) {
    setError('Name is required');
    return;
  }
  
  // Submission
  const response = await submitForm(formData);
  if (response.data) {
    // Handle success
  }
};
```

## Best Practices

### TypeScript Usage

1. Define interfaces for component props
2. Define interfaces for API request/response data
3. Use type guards for conditional rendering
4. Leverage TypeScript utility types (Pick, Omit, Partial, etc.)

### Error Handling

1. Use try/catch blocks for error handling
2. Display user-friendly error messages
3. Log detailed errors to console in development
4. Handle different types of errors appropriately (validation, network, server)

### Performance Optimization

1. Use memoization with `useMemo` and `useCallback`
2. Implement pagination for large data sets
3. Lazy load components with `React.lazy` and `Suspense`
4. Use proper key props in lists for efficient rendering

### Accessibility

1. Use semantic HTML elements
2. Include proper ARIA attributes
3. Ensure keyboard navigation
4. Maintain sufficient color contrast
5. Provide text alternatives for non-text content

### Responsive Design

1. Use media queries for different screen sizes
2. Test on various devices and orientations
3. Implement mobile-first design
4. Use relative units (rem, em) for sizing

## Next Steps for Development

1. **Authentication and Authorization**:
   - Login and registration screens
   - Role-based access control
   - Protected routes
   - Token management

2. **Enhanced Data Visualization**:
   - Charts and graphs for generated data
   - Interactive data previews
   - Sample data visualization

3. **Advanced PDF Analysis**:
   - Multi-page document support
   - Variable detection improvements
   - Confidence scoring for type inference
   - Custom mapping capabilities

4. **Template Management Enhancements**:
   - Template versioning
   - Template categories and tags
   - Template sharing and collaboration
   - Import/export capabilities

5. **Reporting and Analytics**:
   - Usage statistics
   - Generation history
   - Template popularity metrics
   - System performance monitoring

6. **User Experience Improvements**:
   - Guided tours and onboarding
   - Keyboard shortcuts
   - Bulk operations
   - Saved preferences

## Ongoing Maintenance

1. **Code Quality**:
   - Implement unit testing with Jest and React Testing Library
   - Set up integration tests for critical workflows
   - Add ESLint and Prettier for code consistency
   - Conduct regular code reviews

2. **Documentation**:
   - Maintain up-to-date component documentation
   - Document API interfaces and responses
   - Create user guides for complex features
   - Provide developer onboarding materials

3. **Performance Monitoring**:
   - Track application load time
   - Monitor API response times
   - Watch for memory leaks
   - Analyze bundle size

## Conclusion

The Test Data Generator frontend provides a robust and extensible foundation for generating test data with a user-friendly interface. By following the guidelines and patterns established in this codebase, developers can efficiently maintain and extend the application's capabilities while ensuring a consistent user experience that aligns with JPMorgan Chase's brand and usability standards.
