// types/template.ts
export interface TemplateVariable {
    id: string;
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'email' | 'phone' | 'currency';
    required: boolean;
    defaultValue?: string;
    options?: string[];
    placeholder?: string;
    description?: string;
  }
  
  export interface TableRow {
    id: string;
    [key: string]: string | number;
  }
  
  export interface TableColumn {
    id: string;
    name: string;
    type: 'text' | 'number' | 'currency';
    editable?: boolean;
    formula?: string; // для вычисляемых столбцов
    style?: DocumentTextStyle; // Добавлено свойство style
  }
  
  export interface TemplateSection {
    id: string;
    type: 'text' | 'table' | 'signature' | 'variables' | 'header' | 'contacts';
    content: string;
    variables?: TemplateVariable[];
    tableColumns?: TableColumn[];
    tableRows?: TableRow[];
    style?: DocumentTextStyle;
  }
  
  export interface DocumentTemplate {
    id: string;
    name: string;
    description: string;
    sections: TemplateSection[];
    variables: TemplateVariable[]; // глобальные переменные для всего документа
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Дополнительные типы для работы с документами
  export interface DocumentData {
    templateId: string;
    variables: Record<string, string | number>;
    tableData?: Record<string, TableRow[]>;
  }
  
  export interface GeneratedDocument {
    id: string;
    templateId: string;
    title: string;
    content: string;
    htmlContent: string;
    data: DocumentData;
    createdAt: Date;
  }

export type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontFamily?: string;
};

export type CustomElement = {
  type: string;
  children: (CustomElement | CustomText)[];
  [key: string]: any; // Allow other properties like align, url, etc.
};

interface DocumentTextStyle {
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  margin?: string;
  padding?: string;
  marginBottom?: string;
  marginLeft?: string;
  fontStyle?: string;
  marginTop?: string;
  [key: string]: string | undefined;
}

interface DocumentTableColumn {
    id: string;
    name: string;
    type: 'text' | 'number' | 'currency';
    editable?: boolean;
    formula?: string; // для вычисляемых столбцов
  }

declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement;
    Text: CustomText;
  }
}