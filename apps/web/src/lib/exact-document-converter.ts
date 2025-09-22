import { Descendant } from 'slate';
import { DocumentTemplate, DocumentData } from '../types/template';

/**
 * Конвертер для создания точной копии документа как на картинке
 */
export class ExactDocumentConverter {
  /**
   * Конвертирует шаблон в точную копию документа с картинки
   */
  static convertToExactLayout(template: DocumentTemplate, data?: DocumentData): Descendant[] {
    const nodes: Descendant[] = [];
    
    // 1. Заголовок "Коммерческое предложение"
    nodes.push({
      type: 'heading-one',
      align: 'center',
      children: [{
        text: 'Коммерческое предложение',
        bold: true,
        fontSize: '18px'
      }]
    });
    
    // 2. Пустая строка
    nodes.push({
      type: 'paragraph',
      children: [{ text: '' }]
    });
    
    // 3. Информация о компании с подчеркиваниями
    nodes.push({
      type: 'paragraph',
      children: [
        { text: 'Название компании', color: '#0066cc', underline: true },
        { text: ' ' },
        { text: 'Город компании', color: '#0066cc', underline: true }
      ]
    });
    
    // 4. Пустая строка
    nodes.push({
      type: 'paragraph',
      children: [{ text: '' }]
    });
    
    // 5. Контактная информация с подчеркиваниями
    nodes.push({
      type: 'paragraph',
      children: [
        { text: 'Телефон: ' },
        { text: 'Телефон компании', color: '#0066cc', underline: true },
        { text: ' Адрес: ' },
        { text: 'компании', color: '#0066cc', underline: true }
      ]
    });
    
    // 6. Пустая строка
    nodes.push({
      type: 'paragraph',
      children: [{ text: '' }]
    });
    
    // 7. Email и БИН с подчеркиваниями
    nodes.push({
      type: 'paragraph',
      children: [
        { text: 'E-Mail: ' },
        { text: 'E-Mail компании', color: '#0066cc', underline: true },
        { text: ' БИН: ' },
        { text: 'БИН компании', color: '#0066cc', underline: true }
      ]
    });
    
    // 8. Длинная линия подчеркивания
    nodes.push({
      type: 'paragraph',
      children: [{ text: '' }]
    });
    
    nodes.push({
      type: 'paragraph',
      children: [{
        text: '___________________________________________________________________________________________'
      }]
    });
    
    // 9. Короткая линия
    nodes.push({
      type: 'paragraph',
      children: [{
        text: '___________________________'
      }]
    });
    
    // 10. Пустая строка
    nodes.push({
      type: 'paragraph',
      children: [{ text: '' }]
    });
    
    // 11. Название компании для КП (центрированное, подчеркнутое)
    nodes.push({
      type: 'paragraph',
      align: 'center',
      children: [{
        text: 'Название компании для КП',
        color: '#0066cc',
        underline: true,
        bold: true
      }]
    });
    
    // 12. Пустая строка
    nodes.push({
      type: 'paragraph',
      children: [{ text: '' }]
    });
    
    // 13. "Коммерческое предложение" (центрированное, жирное)
    nodes.push({
      type: 'paragraph',
      align: 'center',
      children: [{
        text: 'Коммерческое предложение',
        bold: true
      }]
    });
    
    // 14. Описательный текст
    nodes.push({
      type: 'paragraph',
      children: [
        { text: 'Название компании', color: '#0066cc', underline: true },
        { text: ' имеет обширный опыт по ' },
        { text: 'Опыт компании', color: '#0066cc', underline: true },
        { text: '. Наша компания предлагает услуги по ' },
        { text: 'Название компании для КП', color: '#0066cc', underline: true }
      ]
    });
    
    // 15. Пустая строка
    nodes.push({
      type: 'paragraph',
      children: [{ text: '' }]
    });
    
    // 16. Таблица услуг
    nodes.push({
      type: 'table',
      children: [
        // Заголовок таблицы
        {
          type: 'table-row',
          children: [
            {
              type: 'table-cell',
              children: [{ text: '#', bold: true }]
            },
            {
              type: 'table-cell',
              children: [{ text: 'Наименование', bold: true }]
            },
            {
              type: 'table-cell',
              children: [{ text: 'Стоимость, тенге (без НДС)', bold: true }]
            }
          ]
        },
        // Строка данных
        {
          type: 'table-row',
          children: [
            {
              type: 'table-cell',
              children: [{ text: '1' }]
            },
            {
              type: 'table-cell',
              children: [
                { text: 'Предлагаемая', color: '#0066cc', underline: true },
                { text: '\n' },
                { text: 'позиция услуг или', color: '#0066cc', underline: true },
                { text: '\n' },
                { text: 'товаров', color: '#0066cc', underline: true }
              ]
            },
            {
              type: 'table-cell',
              children: [{ text: 'Стоимость', color: '#0066cc', underline: true }]
            }
          ]
        },
        // Пустая строка в таблице
        {
          type: 'table-row',
          children: [
            {
              type: 'table-cell',
              children: [{ text: '' }]
            },
            {
              type: 'table-cell',
              children: [{ text: 'Итого:', bold: true }]
            },
            {
              type: 'table-cell',
              children: [{ text: 'Итоговая сумма', color: '#0066cc', underline: true }]
            }
          ]
        }
      ]
    });
    
    // 17. Пустая строка
    nodes.push({
      type: 'paragraph',
      children: [{ text: '' }]
    });
    
    // 18. "С наилучшими пожеланиями,"
    nodes.push({
      type: 'paragraph',
      children: [{
        text: 'С наилучшими пожеланиями,'
      }]
    });
    
    // 19. Должность автора КП
    nodes.push({
      type: 'paragraph',
      children: [
        { text: 'Должность автора КП', color: '#0066cc', underline: true },
        { text: ' ' },
        { text: 'Название компании', color: '#0066cc', underline: true },
        { text: ' ' },
        { text: 'ФИО автора КП', color: '#0066cc', underline: true }
      ]
    });
    
    // 20. Пустая строка
    nodes.push({
      type: 'paragraph',
      children: [{ text: '' }]
    });
    
    // 21. Дата КП
    nodes.push({
      type: 'paragraph',
      children: [{
        text: 'Дата КП',
        color: '#0066cc',
        underline: true
      }]
    });
    
    return nodes;
  }

  /**
   * Конвертирует шаблон с заполненными данными
   */
  static convertWithData(template: DocumentTemplate, data: DocumentData): Descendant[] {
    const nodes: Descendant[] = [];
    const variables = data.variables;
    
    // 1. Заголовок "Коммерческое предложение"
    nodes.push({
      type: 'heading-one',
      align: 'center',
      children: [{
        text: 'Коммерческое предложение',
        bold: true,
        fontSize: '18px'
      }]
    });
    
    // 2. Пустая строка
    nodes.push({
      type: 'paragraph',
      children: [{ text: '' }]
    });
    
    // 3. Информация о компании
    nodes.push({
      type: 'paragraph',
      children: [
        { text: variables.companyName || 'Название компании', color: variables.companyName ? '#000' : '#0066cc', underline: !variables.companyName },
        { text: ' ' },
        { text: variables.companyCity || 'Город компании', color: variables.companyCity ? '#000' : '#0066cc', underline: !variables.companyCity }
      ]
    });
    
    // 4. Пустая строка
    nodes.push({
      type: 'paragraph',
      children: [{ text: '' }]
    });
    
    // 5. Контактная информация
    nodes.push({
      type: 'paragraph',
      children: [
        { text: 'Телефон: ' },
        { text: variables.companyPhone || 'Телефон компании', color: variables.companyPhone ? '#000' : '#0066cc', underline: !variables.companyPhone },
        { text: ' Адрес: ' },
        { text: variables.companyAddress || 'Адрес компании', color: variables.companyAddress ? '#000' : '#0066cc', underline: !variables.companyAddress }
      ]
    });
    
    // 6. Пустая строка
    nodes.push({
      type: 'paragraph',
      children: [{ text: '' }]
    });
    
    // 7. Email и БИН
    nodes.push({
      type: 'paragraph',
      children: [
        { text: 'E-Mail: ' },
        { text: variables.companyEmail || 'E-Mail компании', color: variables.companyEmail ? '#000' : '#0066cc', underline: !variables.companyEmail },
        { text: ' БИН: ' },
        { text: variables.companyBIN || 'БИН компании', color: variables.companyBIN ? '#000' : '#0066cc', underline: !variables.companyBIN }
      ]
    });
    
    // 8. Длинная линия подчеркивания
    nodes.push({
      type: 'paragraph',
      children: [{ text: '' }]
    });
    
    nodes.push({
      type: 'paragraph',
      children: [{
        text: '___________________________________________________________________________________________'
      }]
    });
    
    // 9. Короткая линия
    nodes.push({
      type: 'paragraph',
      children: [{
        text: '___________________________'
      }]
    });
    
    // 10. Пустая строка
    nodes.push({
      type: 'paragraph',
      children: [{ text: '' }]
    });
    
    // 11. Название компании для КП (центрированное)
    nodes.push({
      type: 'paragraph',
      align: 'center',
      children: [{
        text: variables.clientCompanyName || 'Название компании для КП',
        bold: true,
        color: variables.clientCompanyName ? '#000' : '#0066cc',
        underline: !variables.clientCompanyName
      }]
    });
    
    // 12. Пустая строка
    nodes.push({
      type: 'paragraph',
      children: [{ text: '' }]
    });
    
    // 13. "Коммерческое предложение" (центрированное, жирное)
    nodes.push({
      type: 'paragraph',
      align: 'center',
      children: [{
        text: 'Коммерческое предложение',
        bold: true
      }]
    });
    
    // 14. Описательный текст
    nodes.push({
      type: 'paragraph',
      children: [
        { text: variables.companyName || 'Название компании' },
        { text: ' имеет обширный опыт по ' },
        { text: variables.serviceDescription || 'Описание услуг компании', color: variables.serviceDescription ? '#000' : '#0066cc', underline: !variables.serviceDescription },
        { text: '. Наша компания предлагает услуги по ' },
        { text: variables.serviceType || 'Тип предлагаемых услуг', color: variables.serviceType ? '#000' : '#0066cc', underline: !variables.serviceType }
      ]
    });
    
    // 15. Пустая строка
    nodes.push({
      type: 'paragraph',
      children: [{ text: '' }]
    });
    
    // 16. Таблица услуг
    const tableData = data.tableData?.['services-table'] || [
      { id: 'row-1', number: 1, service: 'Предлагаемая позиция услуг или товаров', cost: 'Стоимость' }
    ];
    
    nodes.push({
      type: 'table',
      children: [
        // Заголовок таблицы
        {
          type: 'table-row',
          children: [
            {
              type: 'table-cell',
              children: [{ text: '#', bold: true }]
            },
            {
              type: 'table-cell',
              children: [{ text: 'Наименование', bold: true }]
            },
            {
              type: 'table-cell',
              children: [{ text: 'Стоимость, тенге (без НДС)', bold: true }]
            }
          ]
        },
        // Строки данных
        ...tableData.map((row: any) => ({
          type: 'table-row',
          children: [
            {
              type: 'table-cell',
              children: [{ text: String(row.number || '') }]
            },
            {
              type: 'table-cell',
              children: [{ text: String(row.service || '') }]
            },
            {
              type: 'table-cell',
              children: [{ text: String(row.cost || '') }]
            }
          ]
        })),
        // Строка итого
        {
          type: 'table-row',
          children: [
            {
              type: 'table-cell',
              children: [{ text: '' }]
            },
            {
              type: 'table-cell',
              children: [{ text: 'Итого:', bold: true }]
            },
            {
              type: 'table-cell',
              children: [{ 
                text: variables.totalAmount || 'Итоговая сумма',
                color: variables.totalAmount ? '#000' : '#0066cc',
                underline: !variables.totalAmount
              }]
            }
          ]
        }
      ]
    });
    
    // 17. Пустая строка
    nodes.push({
      type: 'paragraph',
      children: [{ text: '' }]
    });
    
    // 18. "С наилучшими пожеланиями,"
    nodes.push({
      type: 'paragraph',
      children: [{
        text: 'С наилучшими пожеланиями,'
      }]
    });
    
    // 19. Подпись
    nodes.push({
      type: 'paragraph',
      children: [
        { text: variables.authorPosition || 'Должность автора КП', color: variables.authorPosition ? '#000' : '#0066cc', underline: !variables.authorPosition },
        { text: ' ' },
        { text: variables.companyName || 'Название компании', color: variables.companyName ? '#000' : '#0066cc', underline: !variables.companyName },
        { text: ' ' },
        { text: variables.authorName || 'ФИО автора КП', color: variables.authorName ? '#000' : '#0066cc', underline: !variables.authorName }
      ]
    });
    
    // 20. Пустая строка
    nodes.push({
      type: 'paragraph',
      children: [{ text: '' }]
    });
    
    // 21. Дата КП
    nodes.push({
      type: 'paragraph',
      children: [{
        text: variables.offerDate || 'Дата КП',
        color: variables.offerDate ? '#000' : '#0066cc',
        underline: !variables.offerDate
      }]
    });
    
    return nodes;
  }
}

export default ExactDocumentConverter;
