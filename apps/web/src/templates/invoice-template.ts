import { DocumentTemplate } from '../types/template';

export const invoiceTemplate: DocumentTemplate = {
  id: 'invoice',
  name: 'Счет на оплату',
  description: 'Шаблон счета на оплату',
  category: 'financial',
  createdAt: new Date(),
  updatedAt: new Date(),
  variables: [
    {
      id: 'beneficiaryName',
      name: 'Имя поставщика',
      type: 'text',
      required: true,
      placeholder: 'ТОО "Поставщик"',
    },
    {
      id: 'beneficiaryBIN',
      name: 'БИН поставщика',
      type: 'text',
      required: true,
      placeholder: '123456789012',
    },
    {
      id: 'beneficiaryIBAN',
      name: 'IBAN поставщика',
      type: 'text',
      required: true,
      placeholder: 'KZ123456789012345678',
    },
    {
      id: 'beneficiaryBankName',
      name: 'Название банка бенефициара',
      type: 'text',
      required: true,
      placeholder: 'АО "Банк Поставщика"',
    },
    {
      id: 'beneficiaryKBE',
      name: 'КБЕ Банка бенефициара',
      type: 'text',
      required: true,
      placeholder: '17',
    },
    {
      id: 'beneficiaryBIC',
      name: 'БИК банка бенефициара',
      type: 'text',
      required: true,
      placeholder: 'ASDFKZKA',
    },
    {
      id: 'paymentPurpose',
      name: 'Назначение платежа',
      type: 'text',
      required: true,
      placeholder: 'Оплата за услуги',
    },
    {
      id: 'invoiceNumber',
      name: 'Номер счета',
      type: 'text',
      required: true,
      placeholder: '№12345',
    },
    {
      id: 'invoiceDate',
      name: 'Дата создания счета',
      type: 'date',
      required: true,
      defaultValue: new Date().toISOString().split('T')[0],
    },
    {
      id: 'supplierAddress',
      name: 'Адрес поставщика',
      type: 'text',
      required: true,
      placeholder: 'ул. Абая, 1',
    },
    {
      id: 'supplierPhone',
      name: 'Телефон(ы) поставщика',
      type: 'phone',
      required: true,
      placeholder: '+7 (777) 111-22-33',
    },
    {
      id: 'buyerBIN',
      name: 'БИН/ИИН покупателя',
      type: 'text',
      required: true,
      placeholder: '123456789012',
    },
    {
      id: 'buyerName',
      name: 'Имя покупателя',
      type: 'text',
      required: true,
      placeholder: 'ТОО "Покупатель"',
    },
    {
      id: 'buyerAddress',
      name: 'Адрес покупателя',
      type: 'text',
      required: true,
      placeholder: 'ул. Ленина, 10',
    },
    {
      id: 'buyerPhone',
      name: 'Телефон(ы) покупателя',
      type: 'phone',
      required: true,
      placeholder: '+7 (777) 444-55-66',
    },
    {
      id: 'contractNumber',
      name: 'Номер договора',
      type: 'text',
      required: false,
      placeholder: '№Д-123',
    },
    {
      id: 'contractDate',
      name: 'Дата заключения договора',
      type: 'date',
      required: false,
      defaultValue: new Date().toISOString().split('T')[0],
    },
    {
      id: 'totalAmount',
      name: 'Итоговая сумма',
      type: 'number',
      required: true,
      placeholder: '100000',
    },
    {
      id: 'vatSum',
      name: 'Сумма с НДС',
      type: 'number',
      required: false,
      placeholder: '12000',
    },
    {
      id: 'totalAmountInWords',
      name: 'Итоговая сумма (прописью)',
      type: 'text',
      required: true,
      placeholder: 'Сто тысяч тенге 00 тиын',
    },
    {
      id: 'executorFullName',
      name: 'ФИО исполнителя',
      type: 'text',
      required: true,
      placeholder: 'Исполнитель И.И.',
    },
  ],
  sections: [
    {
      id: 'beneficiary-table-header',
      type: 'table',
      content: '',
      tableColumns: [
        { id: 'label1', name: 'Бенефициар:', type: 'text', editable: false, style: { fontWeight: 'bold' } },
        { id: 'label2', name: 'БИН:', type: 'text', editable: false, style: { fontWeight: 'bold' } },
        { id: 'label3', name: 'ИИК:', type: 'text', editable: false, style: { fontWeight: 'bold' } },
      ],
      tableRows: [
        {
          id: 'beneficiary-row-1',
          label1: '{{beneficiaryName}}',
          label2: '{{beneficiaryBIN}}',
          label3: '{{beneficiaryIBAN}}',
        },
      ],
      style: { marginBottom: '10px' }
    },
    {
      id: 'bank-details-table-header',
      type: 'table',
      content: '',
      tableColumns: [
        { id: 'label1', name: 'Банк бенефициара:', type: 'text', editable: false, style: { fontWeight: 'bold' } },
        { id: 'label2', name: 'КБе:', type: 'text', editable: false, style: { fontWeight: 'bold' } },
        { id: 'label3', name: 'БИК:', type: 'text', editable: false, style: { fontWeight: 'bold' } },
        { id: 'label4', name: 'Код назначения платежа:', type: 'text', editable: false, style: { fontWeight: 'bold' } },
      ],
      tableRows: [
        {
          id: 'bank-details-row-1',
          label1: '{{beneficiaryBankName}}',
          label2: '{{beneficiaryKBE}}',
          label3: '{{beneficiaryBIC}}',
          label4: '{{paymentPurpose}}',
        },
      ],
      style: { marginBottom: '20px' }
    },
    {
      id: 'invoice-title',
      type: 'text',
      content: 'Счет на оплату № {{invoiceNumber}} от {{invoiceDate}}',
      style: { fontSize: '14px', fontWeight: 'bold', marginBottom: '20px' }
    },
    {
      id: 'supplier-details',
      type: 'text',
      content: 'Поставщик: БИН / ИИН {{beneficiaryBIN}}\n({{beneficiaryName}})\n{{supplierAddress}}\nтел.: {{supplierPhone}}',
      style: { marginBottom: '10px' }
    },
    {
      id: 'buyer-details',
      type: 'text',
      content: 'Покупатель: БИН / ИИН {{buyerBIN}}\n({{buyerName}})\n{{buyerAddress}}\nтел.: {{buyerPhone}}',
      style: { marginBottom: '10px' }
    },
    {
      id: 'contract-details',
      type: 'text',
      content: 'Договор: Договор № {{contractNumber}} от {{contractDate}}',
      style: { marginBottom: '20px' }
    },
    {
      id: 'items-table',
      type: 'table',
      content: '',
      tableColumns: [
        { id: 'num', name: '№', type: 'number', editable: false, style: { fontWeight: 'bold' } },
        { id: 'name', name: 'Наименование', type: 'text', editable: true, style: { fontWeight: 'bold' } },
        { id: 'qty', name: 'Кол-во', type: 'number', editable: true, style: { fontWeight: 'bold' } },
        { id: 'unit', name: 'Ед.', type: 'text', editable: true, style: { fontWeight: 'bold' } },
        { id: 'price', name: 'Цена', type: 'currency', editable: true, style: { fontWeight: 'bold' } },
        { id: 'amount', name: 'Сумма', type: 'currency', editable: true, style: { fontWeight: 'bold' } },
      ],
      tableRows: [
        {
          id: 'item-1',
          num: 1,
          name: 'Наименование позиции',
          qty: 1,
          unit: 'шт.',
          price: 100000,
          amount: 100000,
        },
      ],
      style: { marginBottom: '10px' }
    },
    {
      id: 'total-summary',
      type: 'text',
      content: 'Итого: Итоговая сумма\nВ том числе НДС: {{vatSum}} тенге',
      style: { textAlign: 'right', fontWeight: 'bold', marginBottom: '10px' }
    },
    {
      id: 'total-in-words',
      type: 'text',
      content: 'Всего наименований 1 на сумму {{totalAmount}} KZT\nВсего к оплате: {{totalAmountInWords}} тенге',
      style: { marginBottom: '20px' }
    },
    {
      id: 'executor-signature',
      type: 'text',
      content: 'Исполнитель: {{executorFullName}}',
      style: { fontWeight: 'bold' }
    },
  ],
};

export default invoiceTemplate;
