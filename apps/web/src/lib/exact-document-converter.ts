import { Descendant } from 'slate';
import { DocumentTemplate, DocumentData } from '../types/template';

/**
 * Конвертер для создания точной копии документа как на картинке
 */
export class ExactDocumentConverter {
  static generateSlateNodes(template: DocumentTemplate, data?: DocumentData): Descendant[] {
    const nodes: Descendant[] = [];
    const variables = data?.variables || {};

    template.sections.forEach(section => {
      if (section.type === 'header') {
        nodes.push({
          type: 'heading-one',
          align: section.style?.textAlign || 'left',
          children: [{
            text: this.replaceVariables(section.content, template.variables, variables, data ? false : true),
            bold: section.style?.fontWeight === 'bold',
            fontSize: section.style?.fontSize || '18px'
          }]
        });
      } else if (section.type === 'text') {
        const children: any[] = [];
        const parts = section.content.split(/({{.*?}})/g);

        parts.forEach(part => {
          if (part.startsWith('{{') && part.endsWith('}}')) {
            const varId = part.slice(2, -2);
            const templateVar = template.variables.find(v => v.id === varId);
            const value = variables[varId];

            children.push({
              text: data && value !== undefined && value !== '' ? String(value) : templateVar?.name || varId,
              color: data && value !== undefined && value !== '' ? '#000' : '#0066cc',
              underline: data && value !== undefined && value !== '' ? false : true,
            });
          } else if (part === '\n') {
            children.push({ text: '' }); // Handle newlines if present in content string directly
          } else {
            children.push({ text: part });
          }
        });

        nodes.push({
          type: 'paragraph',
          align: section.style?.textAlign || 'left',
          children: children.length > 0 ? children : [{ text: '' }], // Ensure at least one child
          style: section.style // Pass through styles from template
        });
      } else if (section.type === 'table') {
        const tableData = data?.tableData?.[section.id] || [];
        const headerCells = section.tableColumns?.map(col => ({
          type: 'table-cell',
          children: [{ text: col.name, bold: true }]
        })) || [];

        const rows = [
          { type: 'table-row', children: headerCells },
          ...(section.tableRows || []).map(row => ({
            type: 'table-row',
            children: section.tableColumns?.map(col => ({
              type: 'table-cell',
              children: [{
                text: this.replaceVariables(String(row[col.id as keyof typeof row]), template.variables, variables, data ? false : true),
                color: data && variables[col.id] !== undefined && variables[col.id] !== '' ? '#000' : '#0066cc',
                underline: data && variables[col.id] !== undefined && variables[col.id] !== '' ? false : true,
              }]
            })) || []
          })),
          ...(tableData.length > 0 ? tableData.map((row: any) => ({
            type: 'table-row',
            children: section.tableColumns?.map(col => ({
              type: 'table-cell',
              children: [{ text: String(row[col.id] || '') }]
            })) || []
          })) : [])
        ];

        nodes.push({
          type: 'table',
          children: rows
        });
      }
    });

    return nodes;
  }

  private static replaceVariables(content: string, templateVariables: DocumentTemplate['variables'], dataVariables: Record<string, any>, showPlaceholder: boolean): string {
    return content.replace(/{{(.*?)}}/g, (match, varId) => {
      const templateVar = templateVariables.find(v => v.id === varId);
      const value = dataVariables[varId];

      if (showPlaceholder) {
        return templateVar?.name || varId;
      } else {
        return value !== undefined && value !== '' ? String(value) : (templateVar?.name || varId);
      }
    });
  }

  static convertToExactLayout(template: DocumentTemplate, data?: DocumentData): Descendant[] {
    return this.generateSlateNodes(template, data);
  }

  static convertWithData(template: DocumentTemplate, data: DocumentData): Descendant[] {
    return this.generateSlateNodes(template, data);
  }
}

export default ExactDocumentConverter;
