import { DocumentTemplate } from '../types/template';

export const actOfCompletedWorksTemplate: DocumentTemplate = {
  id: 'act-of-completed-works',
  name: 'Акт Выполненных Работ',
  description: 'Шаблон акта выполненных работ',
  createdAt: new Date(),
  updatedAt: new Date(),
  variables: [
    {
      id: 'appendixNumber',
      name: 'Номер Приложения',
      type: 'number',
      required: true,
      placeholder: '50'
    },
    {
      id: 'customerName',
      name: 'Полное наименование заказчика',
      type: 'text',
      required: true,
      placeholder: 'ТОО "Заказчик"'
    },
    {
      id: 'customerAddress',
      name: 'Адрес заказчика',
      type: 'text',
      required: true,
      placeholder: 'ул. Абая, 1'
    },
    {
      id: 'customerContact',
      name: 'Данные о средствах связи заказчика',
      type: 'text',
      required: true,
      placeholder: '+7 (777) 111-22-33'
    },
    {
      id: 'customerIINBIN',
      name: 'ИИН/БИН заказчика',
      type: 'text',
      required: true,
      placeholder: '123456789012'
    },
    {
      id: 'executorName',
      name: 'Полное наименование исполнителя',
      type: 'text',
      required: true,
      placeholder: 'ТОО "Исполнитель"'
    },
    {
      id: 'executorAddress',
      name: 'Адрес исполнителя',
      type: 'text',
      required: true,
      placeholder: 'ул. Ленина, 10'
    },
    {
      id: 'executorContact',
      name: 'Данные о средствах связи исполнителя',
      type: 'text',
      required: true,
      placeholder: '+7 (777) 444-55-66'
    },
    {
      id: 'executorIINBIN',
      name: 'ИИН/БИН исполнителя',
      type: 'text',
      required: true,
      placeholder: '123456789012'
    },
    {
      id: 'contractInfo',
      name: 'Информация о договоре (контракте)',
      type: 'text',
      required: true,
      placeholder: 'Договор №123 от 01.01.2023'
    },
    {
      id: 'documentNumber',
      name: 'Номер документа',
      type: 'text',
      required: true,
      placeholder: '1'
    },
    {
      id: 'compilationDate',
      name: 'Дата составления',
      type: 'date',
      required: true,
      defaultValue: new Date().toISOString().split('T')[0]
    },
  ],
  sections: [
    {
      id: 'appendix-info',
      type: 'text',
      content: 'Приложение {{appendixNumber}}\nк приказу Министра финансов\nРеспублики Казахстан\nот 20 декабря 2012 года № 562\nФорма Р-1',
      style: { textAlign: 'right', marginBottom: '30px' }
    },
    {
      id: 'customer-details',
      type: 'table',
      content: '',
      tableColumns: [
        { id: 'customerDetail', name: 'Заказчик', type: 'text', editable: false },
        { id: 'customerIINBIN', name: 'ИИН/БИН', type: 'text', editable: false, style: { width: '150px', border: '1px solid black', padding: '5px' } }
      ],
      tableRows: [
        {
          id: 'customer-row-1',
          customerDetail: '{{customerName}}, {{customerAddress}}, {{customerContact}}',
          customerIINBIN: '{{customerIINBIN}}'
        }
      ],
      style: { marginBottom: '20px' }
    },
    {
      id: 'executor-details',
      type: 'table',
      content: '',
      tableColumns: [
        { id: 'executorDetail', name: 'Исполнитель', type: 'text', editable: false },
        { id: 'executorIINBIN', name: 'ИИН/БИН', type: 'text', editable: false, style: { width: '150px', border: '1px solid black', padding: '5px' } }
      ],
      tableRows: [
        {
          id: 'executor-row-1',
          executorDetail: '{{executorName}}, {{executorAddress}}, {{executorContact}}',
          executorIINBIN: '{{executorIINBIN}}'
        }
      ],
      style: { marginBottom: '20px' }
    },
    {
      id: 'contract-header',
      type: 'text',
      content: 'Договор (контракт)',
      style: { fontWeight: 'bold', marginBottom: '5px' }
    },
    {
      id: 'contract-info',
      type: 'text',
      content: '{{contractInfo}}',
      style: { marginBottom: '20px' }
    },
    {
      id: 'document-date-table',
      type: 'table',
      content: '',
      tableColumns: [
        { id: 'docNumber', name: 'Номер документа', type: 'text', editable: false, style: { fontWeight: 'bold' } },
        { id: 'compDate', name: 'Дата составления', type: 'text', editable: false, style: { fontWeight: 'bold' } }
      ],
      tableRows: [
        {
          id: 'doc-date-row-1',
          docNumber: '{{documentNumber}}',
          compDate: '{{compilationDate}}'
        }
      ],
      style: { marginBottom: '20px' }
    },
    {
      id: 'main-title-after-table',
      type: 'header',
      content: 'АКТ ВЫПОЛНЕННЫХ РАБОТ',
      style: { textAlign: 'center', fontWeight: 'bold', fontSize: '16px', marginTop: '50px', textTransform: 'uppercase' }
    }
  ],
};

export default actOfCompletedWorksTemplate;
