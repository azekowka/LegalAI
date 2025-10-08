# Template Management Guide

This guide outlines the process for implementing new document templates and maintaining existing ones within the system.

## 1. Template Structure Overview

Document templates are defined using the `DocumentTemplate` interface located in `apps/web/src/types/template.ts`. A `DocumentTemplate` consists of global variables and an array of `TemplateSection` objects. Each `TemplateSection` can have its own type (e.g., `text`, `table`, `header`), content, and specific variables or table configurations.

### Core Interfaces:

- **`DocumentTemplate`**: The main interface for a document template.
  - `id`: Unique identifier for the template.
  - `name`: Display name of the template.
  - `description`: A brief description.
  - `variables`: An array of `TemplateVariable` objects that apply globally to the document.
  - `sections`: An array of `TemplateSection` objects that define the content and structure of the document.

- **`TemplateVariable`**: Defines a dynamic field that can be inserted into the document content.
  - `id`: Unique identifier for the variable (used in content like `{{variableId}}`).
  - `name`: Display name of the variable.
  - `type`: The type of input (`text`, `number`, `date`, `select`, `email`, `phone`, `currency`).
  - `required`: Boolean indicating if the variable is mandatory.
  - `defaultValue`, `options`, `placeholder`, `description`: Optional properties for better input control and user experience.

- **`TemplateSection`**: Represents a block of content within the document.
  - `id`: Unique identifier for the section.
  - `type`: The type of section (`text`, `table`, `signature`, `variables`, `header`, `contacts`).
  - `content`: The main text content of the section. This is where `{{variableId}}` placeholders are used.
  - `variables`: Optional, section-specific variables.
  - `tableColumns`, `tableRows`: Optional, for `table` type sections, defining column structure and initial row data.
  - `style`: Optional, `DocumentTextStyle` object for styling the section.

- **`TableColumn`**: Defines a column within a table section.
  - `id`: Unique identifier for the column.
  - `name`: Display name of the column.
  - `type`: Data type for the column (`text`, `number`, `currency`).
  - `editable`: Optional, boolean indicating if the column is editable.
  - `formula`: Optional, for computed column values.
  - `style`: Optional, `DocumentTextStyle` for column styling.

## 2. Implementing a New Template

To create a new document template, follow these steps:

### Step 2.1: Create the Template File

1.  **Create a new `.ts` file** in the `apps/web/src/templates/` directory. Name it descriptively, e.g., `my-new-agreement.ts`.

2.  **Define the `DocumentTemplate` object** in this file. Import the `DocumentTemplate` interface from `../types/template`.

    ```typescript
    import { DocumentTemplate } from '../types/template';

    export const myNewAgreementTemplate: DocumentTemplate = {
      id: 'my-new-agreement',
      name: 'My New Agreement',
      description: 'A template for my new agreement.',
      createdAt: new Date(),
      updatedAt: new Date(),
      variables: [
        {
          id: 'clientName',
          name: 'Client Name',
          type: 'text',
          required: true,
          placeholder: 'John Doe'
        },
        {
          id: 'agreementDate',
          name: 'Agreement Date',
          type: 'date',
          required: true,
        }
      ],
      sections: [
        {
          id: 'header',
          type: 'header',
          content: 'Agreement with {{clientName}}',
          style: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }
        },
        {
          id: 'introduction',
          type: 'text',
          content: 'This agreement is made on {{agreementDate}} between...',
        },
        // Add more sections as needed
      ],
    };

    export default myNewAgreementTemplate;
    ```

### Step 2.2: Register the Template

To make your new template available in the system, you need to register it. While the current implementation in `apps/web/src/app/dashboard/templates/page.tsx` uses a hardcoded `mockTemplates` array and conditional navigation, the ideal approach would be to fetch templates dynamically from a backend or a centralized configuration.

**Current (Temporary) Registration Method (to be improved):**

1.  **Open `apps/web/src/app/dashboard/templates/page.tsx`**.

2.  **Import your new template file** at the top of the file:

    ```typescript
    // ... existing imports ...
    import { confidentialityAgreementTemplate } from '@/templates/confidentiality-agreement';
    import { myNewAgreementTemplate } from '@/templates/my-new-agreement'; // Your new import
    ```

3.  **Add your template to the `mockTemplates` array** (or the actual data source once implemented):

    ```typescript
    const mockTemplates: Template[] = [
      // ... existing templates ...
      {
        id: myNewAgreementTemplate.id,
        name: myNewAgreementTemplate.name,
        documents: 0, // Placeholder, will be dynamic
        status: "Черновик", // Or "Опубликован"
        lastModified: new Date().toLocaleDateString("ru-RU", { /* ... */ }),
      },
    ];
    ```

4.  **Update the navigation logic** in the `onClick` handler for the table rows and the dropdown menu items to include your new template's route. This is currently hardcoded and should ideally be dynamic based on the template `id`.

    ```typescript
    // Example of adding to the onClick handler
    onClick={() => {
      // ... existing conditions ...
      } else if (template.id === myNewAgreementTemplate.id) {
        window.location.href = `/dashboard/templates/${myNewAgreementTemplate.id}`;
      }
    }}
    ```

## 3. Maintaining Current Templates

Maintaining existing templates involves updating their variables, sections, or styling.

1.  **Locate the template file** in `apps/web/src/templates/` (e.g., `confidentiality-agreement.ts`).

2.  **Modify the `variables` array** to add, remove, or update `TemplateVariable` definitions. Ensure `id`s are unique and consistent with their usage in `content`.

3.  **Adjust the `sections` array**:
    *   **Add a new section**: Create a new `TemplateSection` object and insert it into the `sections` array at the desired position.
    *   **Edit existing content**: Update the `content` property of a `TemplateSection`. Remember to use `{{variableId}}` for dynamic content.
    *   **Modify section type or style**: Change the `type` or `style` properties as needed.
    *   **Update table columns/rows**: For `table` type sections, adjust `tableColumns` and `tableRows`.

4.  **Update `name` and `description`** in the `DocumentTemplate` object if the template's purpose or display name changes.

## 4. Future Improvements

-   **Dynamic Template Loading**: Implement an API endpoint to fetch templates from a backend database instead of hardcoding them in `mockTemplates`. This would allow for easier management and scalability.
-   **Automated Navigation**: Dynamically generate navigation links based on template IDs, removing the need for manual updates in `page.tsx`.
-   **Template Editor UI**: Develop a user interface for creating and editing templates directly within the application, abstracting away the code-level modifications.
-   **Version Control for Templates**: Implement a system for tracking changes and versions of templates.
