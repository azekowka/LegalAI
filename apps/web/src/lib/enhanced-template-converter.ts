import { Descendant } from 'slate';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { remarkToSlate } from 'remark-slate-transformer';
import { DocumentTemplate, TemplateSection, DocumentData, TableRow, TableColumn } from '../types/template';
import TemplateProcessor from './template-processor';

/**
 * Улучшенный конвертер шаблонов с использованием remark-slate-transformer
 * для красивого отображения всех элементов включая таблицы, цветной текст и т.д.
 */
export class EnhancedTemplateConverter {
  private static remarkProcessor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkToSlate as any, {
      // Настройка для таблиц
      table: {
        type: 'table',
        children: []
      },
      tableRow: {
        type: 'table-row',
        children: []
      },
      tableCell: {
        type: 'table-cell',
        children: []
      },
      // Настройка для заголовков
      heading: (node: any, next: any) => ({
        type: `heading-${node.depth}`,
        children: next(node.children)
      }),
      // Настройка для списков
      list: (node: any, next: any) => ({
        type: node.ordered ? 'numbered-list' : 'bulleted-list',
        children: next(node.children)
      }),
      listItem: {
        type: 'list-item',
        children: []
      },
      // Настройка для ссылок
      link: (node: any, next: any) => ({
        type: 'link',
        url: node.url,
        children: next(node.children)
      }),
      // Настройка для кода
      code: {
        type: 'code-block',
        children: []
      },
      // Настройка для цитат
      blockquote: {
        type: 'blockquote',
        children: []
      }
    } as any);

  /**
   * Конвертирует шаблон документа в Slate формат с использованием remark
   */
  static convertTemplateToSlate(template: DocumentTemplate, data?: DocumentData): Descendant[] {
    try {
      // Создаем markdown из шаблона
      const markdown = this.templateToMarkdown(template, data);
      
      // Конвертируем markdown в Slate с помощью remark
      const result = this.remarkProcessor.processSync(markdown);
      const slateNodes = result.result as Descendant[];
      
      // Добавляем дополнительную обработку для специальных элементов
      const enhancedNodes = this.enhanceSlateNodes(slateNodes, template, data);
      
      return enhancedNodes.length > 0 ? enhancedNodes : this.getDefaultContent();
    } catch (error) {
      console.error('Ошибка конвертации шаблона:', error);
      return this.getDefaultContent();
    }
  }

  /**
   * Конвертирует шаблон в Markdown формат
   */
  private static templateToMarkdown(template: DocumentTemplate, data?: DocumentData): string {
    let markdown = '';
    
    template.sections.forEach(section => {
      const sectionMarkdown = this.sectionToMarkdown(section, data);
      if (sectionMarkdown.trim()) {
        markdown += sectionMarkdown + '\\n\\n';
      }
    });
    
    return markdown;
  }

  /**
   * Конвертирует секцию в Markdown
   */
  private static sectionToMarkdown(section: TemplateSection, data?: DocumentData): string {
    const content = this.processVariables(section.content, data?.variables);
    
    switch (section.type) {
      case 'header':
        return `# ${content}`;
        
      case 'contacts':
        // Преобразуем контакты в список
        const contactLines = content.split('\\n').filter(line => line.trim());
        return contactLines.map(line => `- ${line.trim()}`).join('\\n');
        
      case 'text':
        // Проверяем на специальные случаи
        if (content.includes('_'.repeat(20))) {
          return `---`; // Горизонтальная линия
        }
        
        // Определяем уровень заголовка по стилю
        if (section.style?.fontWeight === 'bold' && section.style?.fontSize) {
          const fontSize = parseInt(section.style.fontSize);
          if (fontSize >= 20) return `## ${content}`;
          if (fontSize >= 16) return `### ${content}`;
        }
        
        return content;
        
      case 'table':
        return this.tableToMarkdown(section, data);
        
      case 'signature':
        return `**${content}**`;
        
      default:
        return content;
    }
  }

  /**
   * Конвертирует таблицу в Markdown формат
   */
  private static tableToMarkdown(section: TemplateSection, data?: DocumentData): string {
    if (!section.tableColumns || !section.tableRows) {
      return section.content || '';
    }
    
    const tableData = data?.tableData?.[section.id] || section.tableRows;
    let markdown = '';
    
    // Заголовок таблицы
    if (section.content && section.content.trim()) {
      markdown += `### ${section.content}\\n\\n`;
    }
    
    // Заголовки столбцов
    const headers = section.tableColumns.map(col => col.name);
    markdown += `| ${headers.join(' | ')} |\\n`;
    
    // Разделитель
    const separator = section.tableColumns.map(() => '---');
    markdown += `| ${separator.join(' | ')} |\\n`;
    
    // Строки данных
    tableData.forEach(row => {
      const rowData = section.tableColumns!.map(col => {
        const value = row[col.id];
        if (col.type === 'currency' && typeof value === 'number') {
          return this.formatCurrency(value);
        }
        return String(value || '');
      });
      markdown += `| ${rowData.join(' | ')} |\\n`;
    });
    
    return markdown;
  }

  /**
   * Улучшает Slate узлы дополнительными возможностями
   */
  private static enhanceSlateNodes(nodes: Descendant[], template: DocumentTemplate, data?: DocumentData): Descendant[] {
    return nodes.map(node => this.enhanceNode(node, template, data));
  }

  /**
   * Улучшает отдельный узел
   */
  private static enhanceNode(node: any, template: DocumentTemplate, data?: DocumentData): Descendant {
    // Добавляем стили для заголовков
    if (node.type && node.type.startsWith('heading-')) {
      return {
        ...node,
        align: 'center',
        children: node.children.map((child: any) => ({
          ...child,
          bold: true
        }))
      };
    }
    
    // Улучшаем таблицы
    if (node.type === 'table') {
      return {
        ...node,
        className: 'document-table',
        children: node.children.map((row: any) => ({
          ...row,
          children: row.children.map((cell: any) => ({
            ...cell,
            className: 'table-cell'
          }))
        }))
      };
    }
    
    // Обрабатываем переменные в тексте
    if (node.children) {
      return {
        ...node,
        children: node.children.map((child: any) => {
          if (child.text && typeof child.text === 'string') {
            // Выделяем переменные цветом
            const hasVariables = child.text.includes('{{') && child.text.includes('}}');
            if (hasVariables) {
              return {
                ...child,
                backgroundColor: '#fef3c7', // Желтый фон для переменных
                color: '#92400e' // Коричневый текст
              };
            }
          }
          return child;
        })
      };
    }
    
    return node;
  }

  /**
   * Обрабатывает переменные в тексте
   */
  private static processVariables(content: string, variables?: Record<string, string | number>): string {
    if (!variables) return content;
    
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value || ''));
    });
    
    return result;
  }

  /**
   * Форматирует валюту
   */
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('kk-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Возвращает содержимое по умолчанию
   */
  private static getDefaultContent(): Descendant[] {
    return [
      {
        type: 'paragraph',
        children: [{ text: 'Загрузка шаблона...' }]
      }
    ];
  }

  /**
   * Конвертирует Slate обратно в Markdown
   */
  static slateToMarkdown(nodes: Descendant[]): string {
    return nodes.map(node => this.nodeToMarkdown(node)).join('\\n\\n');
  }

  /**
   * Конвертирует узел в Markdown
   */
  private static nodeToMarkdown(node: any): string {
    if (node.type === 'paragraph') {
      return node.children.map((child: any) => {
        let text = child.text || '';
        if (child.bold) text = `**${text}**`;
        if (child.italic) text = `*${text}*`;
        if (child.underline) text = `<u>${text}</u>`;
        return text;
      }).join('');
    }
    
    if (node.type && node.type.startsWith('heading-')) {
      const level = parseInt(node.type.replace('heading-', ''));
      const prefix = '#'.repeat(level);
      const text = node.children.map((child: any) => child.text || '').join('');
      return `${prefix} ${text}`;
    }
    
    if (node.type === 'bulleted-list') {
      return node.children.map((item: any) => 
        `- ${this.nodeToMarkdown(item)}`
      ).join('\\n');
    }
    
    if (node.type === 'numbered-list') {
      return node.children.map((item: any, index: number) => 
        `${index + 1}. ${this.nodeToMarkdown(item)}`
      ).join('\\n');
    }
    
    if (node.type === 'list-item') {
      return node.children.map((child: any) => child.text || '').join('');
    }
    
    if (node.type === 'table') {
      // Простая обработка таблиц
      return node.children.map((row: any) => {
        const cells = row.children.map((cell: any) => 
          cell.children.map((child: any) => child.text || '').join('')
        );
        return `| ${cells.join(' | ')} |`;
      }).join('\\n');
    }
    
    if (node.type === 'blockquote') {
      const text = node.children.map((child: any) => child.text || '').join('');
      return `> ${text}`;
    }
    
    if (node.type === 'code-block') {
      const text = node.children.map((child: any) => child.text || '').join('');
      return `\`\`\`\\n${text}\\n\`\`\``;
    }
    
    // По умолчанию
    if (node.children) {
      return node.children.map((child: any) => child.text || '').join('');
    }
    
    return '';
  }

  /**
   * Создает пустой документ
   */
  static createEmptyDocument(): Descendant[] {
    return [
      {
        type: 'paragraph',
        children: [{ text: '' }]
      }
    ];
  }

  /**
   * Добавляет информацию о переменных в начало документа
   */
  static addVariablesInfo(template: DocumentTemplate): Descendant[] {
    const infoNodes: Descendant[] = [];
    
    // Информационный блок
    infoNodes.push({
      type: 'blockquote',
      children: [{
        text: `📝 Шаблон: ${template.name}`,
        bold: true,
        color: '#1f2937'
      }]
    });
    
    infoNodes.push({
      type: 'blockquote',
      children: [{
        text: `💡 Доступные переменные (используйте формат {{variableName}}):`,
        color: '#6b7280'
      }]
    });
    
    // Список переменных
    const allVariables = [...template.variables];
    template.sections.forEach(section => {
      if (section.variables) {
        allVariables.push(...section.variables);
      }
    });
    
    if (allVariables.length > 0) {
      infoNodes.push({
        type: 'bulleted-list',
        children: allVariables.map(variable => ({
          type: 'list-item',
          children: [{
            text: `{{${variable.id}}} - ${variable.name}`,
            color: variable.required ? '#dc2626' : '#059669'
          }]
        }))
      });
    }
    
    // Разделитель
    infoNodes.push({
      type: 'paragraph',
      children: [{ text: '─'.repeat(50), color: '#d1d5db' }]
    });
    
    return infoNodes;
  }
}

export default EnhancedTemplateConverter;
