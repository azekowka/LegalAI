import { DocumentTemplate, TemplateSection, DocumentData, TableRow, DocumentTextStyle } from '../types/template';

/**
 * Процессор шаблонов для замены переменных и генерации документов
 */
export class TemplateProcessor {
  /**
   * Обработка шаблона с заменой переменных
   */
  static processTemplate(template: DocumentTemplate, data: DocumentData): string {
    let result = '';
    
    template.sections.forEach(section => {
      const processedSection = this.processSection(section, data);
      result += processedSection + '\n\n';
    });
    
    return result.trim();
  }

  /**
   * Обработка HTML шаблона с заменой переменных
   */
  static processTemplateToHTML(template: DocumentTemplate, data: DocumentData): string {
    let html = '<div class="document-template">';
    
    template.sections.forEach(section => {
      const processedSection = this.processSectionToHTML(section, data);
      html += processedSection;
    });
    
    html += '</div>';
    return html;
  }

  /**
   * Обработка отдельной секции
   */
  private static processSection(section: TemplateSection, data: DocumentData): string {
    let content = section.content;
    
    // Замена переменных в контенте
    content = this.replaceVariables(content, data.variables);
    
    // Обработка таблиц
    if (section.type === 'table' && section.tableColumns && section.tableRows) {
      content += '\n' + this.processTable(section, data);
    }
    
    return content;
  }

  /**
   * Обработка секции в HTML формат
   */
  private static processSectionToHTML(section: TemplateSection, data: DocumentData): string {
    let content = section.content;
    let html = '';
    
    // Определение CSS классов и стилей
    const styleAttr = this.generateStyleAttribute(section.style);
    const cssClass = `section-${section.type}`;
    
    // Замена переменных в контенте
    content = this.replaceVariables(content, data.variables);
    
    switch (section.type) {
      case 'header':
        html = `<h1 class="${cssClass}" ${styleAttr}>${this.escapeHtml(content)}</h1>`;
        break;
        
      case 'contacts':
        const contactLines = content.split('\n').filter(line => line.trim());
        html = `<div class="${cssClass}" ${styleAttr}>`;
        contactLines.forEach(line => {
          html += `<div class="contact-line">${this.escapeHtml(line)}</div>`;
        });
        html += '</div>';
        break;
        
      case 'table':
        html = `<div class="${cssClass}" ${styleAttr}>`;
        if (section.tableColumns && section.tableRows) {
          html += this.processTableToHTML(section, data);
        }
        html += '</div>';
        break;
        
      case 'signature':
        html = `<div class="${cssClass} signature" ${styleAttr}>${this.escapeHtml(content)}</div>`;
        break;
        
      default:
        // Обработка переносов строк для обычного текста
        const processedContent = this.escapeHtml(content).replace(/\n/g, '<br>');
        html = `<div class="${cssClass}" ${styleAttr}>${processedContent}</div>`;
    }
    
    return html;
  }

  /**
   * Замена переменных в тексте
   */
  private static replaceVariables(content: string, variables: Record<string, string | number>): string {
    let result = content;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value || ''));
    });
    
    // Удаление незаполненных переменных
    result = result.replace(/{{[^}]+}}/g, '');
    
    return result;
  }

  /**
   * Обработка таблицы в текстовом формате
   */
  private static processTable(section: TemplateSection, data: DocumentData): string {
    if (!section.tableColumns || !section.tableRows) return '';
    
    const tableData = data.tableData?.[section.id] || section.tableRows;
    let table = '';
    
    // Заголовки
    const headers = section.tableColumns.map(col => col.name).join(' | ');
    table += headers + '\n';
    table += section.tableColumns.map(() => '---').join(' | ') + '\n';
    
    // Данные
    tableData.forEach(row => {
      const rowData = section.tableColumns!.map(col => {
        const value = row[col.id];
        if (col.type === 'currency' && typeof value === 'number') {
          return this.formatCurrency(value);
        }
        return String(value || '');
      });
      table += rowData.join(' | ') + '\n';
    });
    
    return table;
  }

  /**
   * Обработка таблицы в HTML формат
   */
  private static processTableToHTML(section: TemplateSection, data: DocumentData): string {
    if (!section.tableColumns || !section.tableRows) return '';
    
    const tableData = data.tableData?.[section.id] || section.tableRows;
    let html = '<table class="document-table">';
    
    // Заголовки
    html += '<thead><tr>';
    section.tableColumns.forEach(col => {
      html += `<th class="table-header">${this.escapeHtml(col.name)}</th>`;
    });
    html += '</tr></thead>';
    
    // Данные
    html += '<tbody>';
    tableData.forEach((row, index) => {
      html += '<tr>';
      section.tableColumns!.forEach(col => {
        const value = row[col.id];
        let cellContent = '';
        
        if (col.type === 'currency' && typeof value === 'number') {
          cellContent = this.formatCurrency(value);
        } else {
          cellContent = this.escapeHtml(String(value || ''));
        }
        
        const cellClass = `table-cell cell-${col.type}`;
        html += `<td class="${cellClass}">${cellContent}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    
    return html;
  }

  /**
   * Генерация атрибута style из объекта стилей
   */
  private static generateStyleAttribute(style?: DocumentTextStyle): string {
    if (!style) return '';
    
    const styleString = Object.entries(style)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');
    
    return `style="${styleString}"`;
  }

  /**
   * Конвертация camelCase в kebab-case
   */
  private static camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Экранирование HTML
   */
  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Форматирование валюты
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
   * Вычисление итоговых сумм для таблиц
   */
  static calculateTableTotals(section: TemplateSection, tableData: TableRow[]): Record<string, number> {
    const totals: Record<string, number> = {};
    
    if (!section.tableColumns) return totals;
    
    section.tableColumns.forEach(col => {
      if (col.type === 'currency' || col.type === 'number') {
        const sum = tableData.reduce((acc, row) => {
          const value = row[col.id];
          return acc + (typeof value === 'number' ? value : 0);
        }, 0);
        totals[col.id] = sum;
      }
    });
    
    return totals;
  }

  /**
   * Валидация данных шаблона
   */
  static validateTemplateData(template: DocumentTemplate, data: DocumentData): string[] {
    const errors: string[] = [];
    
    // Проверка обязательных переменных
    template.variables.forEach(variable => {
      if (variable.required && !data.variables[variable.id]) {
        errors.push(`Обязательное поле "${variable.name}" не заполнено`);
      }
    });
    
    // Проверка переменных в секциях
    template.sections.forEach(section => {
      if (section.variables) {
        section.variables.forEach(variable => {
          if (variable.required && !data.variables[variable.id]) {
            errors.push(`Обязательное поле "${variable.name}" в секции "${section.content}" не заполнено`);
          }
        });
      }
    });
    
    return errors;
  }

  /**
   * Получение всех переменных из шаблона
   */
  static extractAllVariables(template: DocumentTemplate): Record<string, any> {
    const variables: Record<string, any> = {};
    
    // Глобальные переменные
    template.variables.forEach(variable => {
      variables[variable.id] = {
        ...variable,
        scope: 'global'
      };
    });
    
    // Переменные из секций
    template.sections.forEach(section => {
      if (section.variables) {
        section.variables.forEach(variable => {
          variables[variable.id] = {
            ...variable,
            scope: 'section',
            sectionId: section.id
          };
        });
      }
    });
    
    return variables;
  }
}

export default TemplateProcessor;
