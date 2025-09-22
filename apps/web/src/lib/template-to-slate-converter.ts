import { Descendant } from 'slate';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { remarkToSlate } from 'remark-slate-transformer';
import { DocumentTemplate, TemplateSection, DocumentData } from '../types/template';
import TemplateProcessor from './template-processor';

// Типы для Slate элементов
type SlateElement = {
  type: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  children: SlateText[];
  [key: string]: any;
};

type SlateText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  [key: string]: any;
};

/**
 * Конвертер шаблонов в Slate формат для rich-text-editor
 */
export class TemplateToSlateConverter {
  /**
   * Конвертирует шаблон документа в Slate формат
   */
  static convertTemplateToSlate(template: DocumentTemplate, data?: DocumentData): Descendant[] {
    const slateNodes: Descendant[] = [];
    
    template.sections.forEach(section => {
      const sectionNodes = this.convertSectionToSlate(section, data);
      slateNodes.push(...sectionNodes);
    });
    
    // Добавляем пустой параграф в конце, если нет содержимого
    if (slateNodes.length === 0) {
      slateNodes.push({
        type: 'paragraph',
        children: [{ text: '' }]
      });
    }
    
    return slateNodes;
  }

  /**
   * Конвертирует секцию шаблона в Slate элементы
   */
  private static convertSectionToSlate(section: TemplateSection, data?: DocumentData): Descendant[] {
    const nodes: Descendant[] = [];
    
    switch (section.type) {
      case 'header':
        nodes.push(this.createHeaderElement(section, data));
        break;
        
      case 'contacts':
        nodes.push(...this.createContactsElements(section, data));
        break;
        
      case 'text':
        nodes.push(...this.createTextElements(section, data));
        break;
        
      case 'table':
        nodes.push(...this.createTableElements(section, data));
        break;
        
      case 'signature':
        nodes.push(this.createSignatureElement(section, data));
        break;
        
      default:
        nodes.push(...this.createTextElements(section, data));
    }
    
    return nodes;
  }

  /**
   * Создает заголовок
   */
  private static createHeaderElement(section: TemplateSection, data?: DocumentData): SlateElement {
    const content = this.processVariables(section.content, data?.variables);
    const align = section.style?.textAlign as 'left' | 'center' | 'right' | 'justify' || 'center';
    
    return {
      type: 'heading-one',
      align,
      children: [{ 
        text: content,
        bold: true,
        fontSize: section.style?.fontSize || '24px'
      }]
    };
  }

  /**
   * Создает элементы контактной информации
   */
  private static createContactsElements(section: TemplateSection, data?: DocumentData): SlateElement[] {
    const content = this.processVariables(section.content, data?.variables);
    const lines = content.split('\n').filter(line => line.trim());
    
    return lines.map(line => ({
      type: 'paragraph',
      align: section.style?.textAlign as any || 'left',
      children: [{ text: line.trim() }]
    }));
  }

  /**
   * Создает текстовые элементы
   */
  private static createTextElements(section: TemplateSection, data?: DocumentData): SlateElement[] {
    const content = this.processVariables(section.content, data?.variables);
    
    // Обработка специального случая для разделителя
    if (content.includes('_'.repeat(20))) {
      return [{
        type: 'paragraph',
        align: 'center',
        children: [{ text: content }]
      }];
    }
    
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    if (paragraphs.length === 0) {
      return [{
        type: 'paragraph',
        align: section.style?.textAlign as any || 'left',
        children: [{ text: content }]
      }];
    }
    
    return paragraphs.map(paragraph => {
      const align = section.style?.textAlign as 'left' | 'center' | 'right' | 'justify' || 'left';
      const fontSize = section.style?.fontSize;
      const fontWeight = section.style?.fontWeight;
      
      return {
        type: 'paragraph',
        align,
        children: [{
          text: paragraph.trim(),
          bold: fontWeight === 'bold',
          fontSize: fontSize
        }]
      };
    });
  }

  /**
   * Создает элементы таблицы
   */
  private static createTableElements(section: TemplateSection, data?: DocumentData): SlateElement[] {
    const nodes: SlateElement[] = [];
    
    // Заголовок таблицы
    if (section.content && section.content.trim()) {
      nodes.push({
        type: 'heading-three',
        children: [{ 
          text: section.content,
          bold: true
        }]
      });
    }
    
    // Создаем таблицу в текстовом формате (так как Slate не поддерживает таблицы из коробки)
    if (section.tableColumns && section.tableRows) {
      const tableData = data?.tableData?.[section.id] || section.tableRows;
      
      // Заголовки таблицы
      const headerText = section.tableColumns.map(col => col.name).join(' | ');
      nodes.push({
        type: 'paragraph',
        children: [{ text: headerText, bold: true }]
      });
      
      // Разделитель
      const separatorText = section.tableColumns.map(() => '---').join(' | ');
      nodes.push({
        type: 'paragraph',
        children: [{ text: separatorText }]
      });
      
      // Строки данных
      tableData.forEach(row => {
        const rowText = section.tableColumns!.map(col => {
          const value = row[col.id];
          if (col.type === 'currency' && typeof value === 'number') {
            return this.formatCurrency(value);
          }
          return String(value || '');
        }).join(' | ');
        
        nodes.push({
          type: 'paragraph',
          children: [{ text: rowText }]
        });
      });
    }
    
    return nodes;
  }

  /**
   * Создает элемент подписи
   */
  private static createSignatureElement(section: TemplateSection, data?: DocumentData): SlateElement {
    const content = this.processVariables(section.content, data?.variables);
    
    return {
      type: 'paragraph',
      align: 'left',
      children: [{ 
        text: content,
        bold: true
      }]
    };
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
    
    // Удаляем незаполненные переменные
    result = result.replace(/{{[^}]+}}/g, '[Переменная не заполнена]');
    
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
   * Конвертирует Slate содержимое обратно в шаблон
   */
  static convertSlateToTemplate(slateContent: Descendant[], originalTemplate: DocumentTemplate): DocumentTemplate {
    // Это более сложная задача, которая требует анализа содержимого
    // и восстановления структуры шаблона
    
    const updatedTemplate: DocumentTemplate = {
      ...originalTemplate,
      sections: this.extractSectionsFromSlate(slateContent, originalTemplate.sections),
      updatedAt: new Date()
    };
    
    return updatedTemplate;
  }

  /**
   * Извлекает секции из Slate содержимого
   */
  private static extractSectionsFromSlate(
    slateContent: Descendant[], 
    originalSections: TemplateSection[]
  ): TemplateSection[] {
    // Простая реализация - объединяем все текстовое содержимое
    const textContent = this.slateToText(slateContent);
    
    // Обновляем первую секцию с новым содержимым
    const updatedSections = [...originalSections];
    if (updatedSections.length > 0) {
      updatedSections[0] = {
        ...updatedSections[0],
        content: textContent
      };
    }
    
    return updatedSections;
  }

  /**
   * Конвертирует Slate содержимое в простой текст
   */
  static slateToText(nodes: Descendant[]): string {
    return nodes.map(node => {
      if ('children' in node) {
        return node.children.map((child: any) => child.text || '').join('');
      }
      return '';
    }).join('\n\n');
  }

  /**
   * Создает пустой Slate документ
   */
  static createEmptySlateDocument(): Descendant[] {
    return [
      {
        type: 'paragraph',
        children: [{ text: '' }]
      }
    ];
  }

  /**
   * Проверяет, является ли Slate документ пустым
   */
  static isSlateDocumentEmpty(nodes: Descendant[]): boolean {
    if (nodes.length === 0) return true;
    
    if (nodes.length === 1) {
      const node = nodes[0];
      if ('children' in node && node.children.length === 1) {
        const child = node.children[0] as any;
        return !child.text || child.text.trim() === '';
      }
    }
    
    return false;
  }

  /**
   * Добавляет переменные шаблона как комментарии в Slate документ
   */
  static addTemplateVariablesInfo(template: DocumentTemplate): Descendant[] {
    const infoNodes: Descendant[] = [];
    
    // Добавляем информацию о доступных переменных
    infoNodes.push({
      type: 'blockquote',
      children: [{
        text: `Доступные переменные для шаблона "${template.name}":`,
        bold: true
      }]
    });
    
    // Глобальные переменные
    if (template.variables.length > 0) {
      infoNodes.push({
        type: 'paragraph',
        children: [{
          text: 'Основные переменные:',
          bold: true
        }]
      });
      
      template.variables.forEach(variable => {
        infoNodes.push({
          type: 'paragraph',
          children: [{
            text: `• {{${variable.id}}} - ${variable.name} (${variable.type})${variable.required ? ' [Обязательно]' : ''}`
          }]
        });
      });
    }
    
    // Переменные из секций
    const sectionVariables = template.sections
      .filter(section => section.variables && section.variables.length > 0)
      .flatMap(section => section.variables!);
      
    if (sectionVariables.length > 0) {
      infoNodes.push({
        type: 'paragraph',
        children: [{
          text: 'Дополнительные переменные:',
          bold: true
        }]
      });
      
      sectionVariables.forEach(variable => {
        infoNodes.push({
          type: 'paragraph',
          children: [{
            text: `• {{${variable.id}}} - ${variable.name} (${variable.type})${variable.required ? ' [Обязательно]' : ''}`
          }]
        });
      });
    }
    
    // Разделитель
    infoNodes.push({
      type: 'paragraph',
      children: [{ text: '─'.repeat(50) }]
    });
    
    return infoNodes;
  }
}

export default TemplateToSlateConverter;
