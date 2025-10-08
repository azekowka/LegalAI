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
    {
      id: 'workName',
      name: 'Наименование работ',
      type: 'text',
      required: true,
      placeholder: 'Разработка ПО'
    },
    {
      id: 'workCompletionDate',
      name: 'Дата выполнения работ',
      type: 'date',
      required: true,
      defaultValue: new Date().toISOString().split('T')[0]
    },
    {
      id: 'reportDetails',
      name: 'Сведения об отчете',
      type: 'text',
      required: false,
      placeholder: 'Отчет №1 от 01.01.2023'
    },
    {
      id: 'unitOfMeasurement',
      name: 'Ед. измерения',
      type: 'text',
      required: true,
      placeholder: 'шт.'
    },
    {
      id: 'quantityCompleted',
      name: 'Кол-во выполнено работ',
      type: 'number',
      required: true,
      placeholder: '10'
    },
    {
      id: 'pricePerUnit',
      name: 'Цена за ед.',
      type: 'currency',
      required: true,
      placeholder: '10000'
    },
    {
      id: 'costWithoutVAT',
      name: 'Стоимость без НДС',
      type: 'currency',
      required: true,
      placeholder: '100000'
    },
    {
      id: 'vatAmountKZT',
      name: 'НДС в KZT',
      type: 'currency',
      required: true,
      placeholder: '12000'
    },
    {
      id: 'totalQuantity',
      name: 'Итого Кол-во',
      type: 'number',
      required: true,
      placeholder: '10'
    },
    {
      id: 'totalCost',
      name: 'Итого Стоимость',
      type: 'currency',
      required: true,
      placeholder: '100000',
    },
    {
      id: 'totalVAT',
      name: 'Итого НДС, в KZT',
      type: 'currency',
      required: true,
      placeholder: '12000',
    },
    {
      id: 'inventoryDetails',
      name: 'Наименование, количество, стоимость запасов',
      type: 'text',
      required: false,
      placeholder: 'Компьютеры (5 шт) - 500000 KZT'
    },
    {
      id: 'attachmentPageCount',
      name: 'Кол-во страниц в приложении',
      type: 'number',
      required: true,
      placeholder: '5'
    },
    {
      id: 'attachmentDocuments',
      name: 'Перечень документов в приложении',
      type: 'text',
      required: false,
      placeholder: 'Отчеты, графики'
    },
    {
      id: 'executorPosition',
      name: 'Исполнитель - должность',
      type: 'text',
      required: true,
      placeholder: 'Директор'
    },
    {
      id: 'executorFullNameSignature',
      name: 'Исполнитель - ФИО',
      type: 'text',
      required: true,
      placeholder: 'Петров П.П.'
    },
    {
      id: 'customerPositionSignature',
      name: 'Заказчик - должность',
      type: 'text',
      required: true,
      placeholder: 'Директор'
    },
    {
      id: 'customerFullNameSignature',
      name: 'Заказчик - ФИО',
      type: 'text',
      required: true,
      placeholder: 'Иванов И.И.'
    },
    {
      id: 'signingDate',
      name: 'Дата подписания (принятия) работ (услуг)',
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
    },
    {
      id: 'work-details-table',
      type: 'table',
      content: '',
      tableColumns: [
        { id: 'col1', name: '№', type: 'text', editable: false, style: { fontWeight: 'bold', width: '3%' } },
        { id: 'col2', name: 'Наименование работ', type: 'text', editable: true, style: { fontWeight: 'bold', width: '25%' } },
        { id: 'col3', name: 'Дата выполнения работ', type: 'text', editable: true, style: { fontWeight: 'bold', width: '12%' } },
        { id: 'col4', name: 'Сведения об отчете', type: 'text', editable: true, style: { fontWeight: 'bold', width: '12%' } },
        { id: 'col5', name: 'Ед. измерения', type: 'text', editable: true, style: { fontWeight: 'bold', width: '8%' } },
        { id: 'col6', name: 'Выполнено работ\nкол-во', type: 'number', editable: true, style: { fontWeight: 'bold', width: '8%' } },
        { id: 'col7', name: 'Выполнено работ\nцена за ед.', type: 'currency', editable: true, style: { fontWeight: 'bold', width: '12%' } },
        { id: 'col8', name: 'Выполнено работ\nстоимость', type: 'currency', editable: true, style: { fontWeight: 'bold', width: '10%' } },
        { id: 'col9', name: 'Выполнено работ\nв том числе НДС в KZT', type: 'currency', editable: true, style: { fontWeight: 'bold', width: '10%' } },
      ],
      tableRows: [
        {
          id: 'work-row-1',
          col1: '1',
          col2: '{{workName}}',
          col3: '{{workCompletionDate}}',
          col4: '{{reportDetails}}',
          col5: '{{unitOfMeasurement}}',
          col6: '{{quantityCompleted}}',
          col7: '{{pricePerUnit}}',
          col8: '{{costWithoutVAT}}',
          col9: '{{vatAmountKZT}}',
        },
        {
          id: 'work-row-total',
          col1: 'Итого',
          col2: '',
          col3: '',
          col4: '',
          col5: '',
          col6: '{{totalQuantity}}',
          col7: 'x',
          col8: '{{totalCost}}',
          col9: '{{totalVAT}}',
        },
      ],
      style: { marginBottom: '20px' }
    },
    {
      id: 'inventory-usage',
      type: 'text',
      content: 'Сведения об использовании запасов, полученных от заказчика\n{{inventoryDetails}}',
      style: { marginBottom: '20px' }
    },
    {
      id: 'attachments',
      type: 'text',
      content: 'Приложение: Перечень документации, в том числе отчет(ы) о маркетинговых, научных исследованиях, консультационных и прочих услугах (обязательны при его (их) наличии) на {{attachmentPageCount}} страниц {{attachmentDocuments}}',
      style: { marginBottom: '30px' }
    },
    {
      id: 'signatures-table',
      type: 'table',
      content: '',
      tableColumns: [
        { id: 'providerLabel', name: 'Сдал (Исполнитель)', type: 'text', editable: false, style: { fontWeight: 'bold' } },
        { id: 'customerLabel', name: 'Принял (Заказчик)', type: 'text', editable: false, style: { fontWeight: 'bold' } }
      ],
      tableRows: [
        {
          id: 'signature-row-1',
          providerLabel: '{{executorPosition}}\n{{executorFullNameSignature}}',
          customerLabel: '{{customerPositionSignature}}\n{{customerFullNameSignature}}'
        }
      ],
      style: { marginBottom: '20px' }
    },
    {
      id: 'signing-date',
      type: 'text',
      content: 'Дата подписания (принятия) работ (услуг)\n{{signingDate}}',
      style: { textAlign: 'right' }
    }
  ],
};

export default actOfCompletedWorksTemplate;
