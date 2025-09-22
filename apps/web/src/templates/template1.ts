import { DocumentTemplate } from '../types/template';

export const commercialOfferTemplate: DocumentTemplate = {
  id: 'commercial-offer-kz',
  name: 'Коммерческое предложение',
  description: 'Шаблон коммерческого предложения для казахстанского рынка',
  category: 'business',
  createdAt: new Date(),
  updatedAt: new Date(),
  variables: [
    {
      id: 'companyName',
      name: 'Название компании',
      type: 'text',
      required: true,
      placeholder: 'ТОО "Название компании"',
      description: 'Полное наименование вашей компании'
    },
    {
      id: 'companyCity',
      name: 'Город компании',
      type: 'text',
      required: true,
      placeholder: 'Алматы',
      description: 'Город, где находится компания'
    },
    {
      id: 'companyPhone',
      name: 'Телефон компании',
      type: 'phone',
      required: true,
      placeholder: '+7 (777) 123-45-67',
      description: 'Контактный телефон'
    },
    {
      id: 'companyAddress',
      name: 'Адрес компании',
      type: 'text',
      required: true,
      placeholder: 'ул. Абая, 150',
      description: 'Физический адрес компании'
    },
    {
      id: 'companyEmail',
      name: 'E-Mail компании',
      type: 'email',
      required: true,
      placeholder: 'info@company.kz',
      description: 'Электронная почта для связи'
    },
    {
      id: 'companyBIN',
      name: 'БИН компании',
      type: 'text',
      required: true,
      placeholder: '123456789012',
      description: 'Бизнес-идентификационный номер'
    },
    {
      id: 'clientCompanyName',
      name: 'Название компании для КП',
      type: 'text',
      required: true,
      placeholder: 'ТОО "Клиент"',
      description: 'Название компании, для которой готовится КП'
    },
    {
      id: 'authorPosition',
      name: 'Должность автора КП',
      type: 'text',
      required: true,
      placeholder: 'Директор',
      description: 'Должность лица, подписывающего КП'
    },
    {
      id: 'authorName',
      name: 'ФИО автора КП',
      type: 'text',
      required: true,
      placeholder: 'Иванов И.И.',
      description: 'Полное имя автора КП'
    },
    {
      id: 'offerDate',
      name: 'Дата КП',
      type: 'date',
      required: true,
      defaultValue: new Date().toISOString().split('T')[0],
      description: 'Дата составления коммерческого предложения'
    }
  ],
  sections: [
    {
      id: 'header',
      type: 'header',
      content: 'Коммерческое предложение',
      style: {
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: '20px 0'
      }
    },
    {
      id: 'company-info',
      type: 'contacts',
      content: `{{companyName}} {{companyCity}}

Телефон: {{companyPhone}} Адрес: {{companyAddress}}

E-Mail: {{companyEmail}} БИН: {{companyBIN}}`,
      style: {
        textAlign: 'left',
        margin: '20px 0'
      }
    },
    {
      id: 'divider',
      type: 'text',
      content: '___________________________________________________________________________________________',
      style: {
        textAlign: 'center',
        margin: '10px 0'
      }
    },
    {
      id: 'client-name',
      type: 'text',
      content: '{{clientCompanyName}}',
      style: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '18px',
        margin: '20px 0'
      }
    },
    {
      id: 'offer-description',
      type: 'text',
      content: 'Коммерческое предложение',
      style: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '16px',
        margin: '10px 0'
      }
    },
    {
      id: 'offer-intro',
      type: 'text',
      content: '{{companyName}} имеет обширный опыт по {{serviceDescription}}. Наша компания предлагает услуги по {{serviceType}}',
      variables: [
        {
          id: 'serviceDescription',
          name: 'Описание услуг компании',
          type: 'text',
          required: true,
          placeholder: 'разработке программного обеспечения',
          description: 'Краткое описание основной деятельности'
        },
        {
          id: 'serviceType',
          name: 'Тип предлагаемых услуг',
          type: 'text',
          required: true,
          placeholder: 'созданию веб-приложений и мобильных решений',
          description: 'Конкретные услуги, которые вы предлагаете'
        }
      ]
    },
    {
      id: 'services-table',
      type: 'table',
      content: 'Предлагаемая позиция услуг или товаров',
      tableColumns: [
        {
          id: 'number',
          name: '#',
          type: 'number',
          editable: false
        },
        {
          id: 'service',
          name: 'Наименование',
          type: 'text',
          editable: true
        },
        {
          id: 'cost',
          name: 'Стоимость, тенге (без НДС)',
          type: 'currency',
          editable: true
        }
      ],
      tableRows: [
        {
          id: 'row-1',
          number: 1,
          service: 'Предлагаемая позиция услуг или товаров',
          cost: 'Стоимость'
        }
      ],
      style: {
        margin: '20px 0'
      }
    },
    {
      id: 'total-row',
      type: 'table',
      content: 'Итого',
      tableColumns: [
        {
          id: 'label',
          name: 'Итого:',
          type: 'text',
          editable: false
        },
        {
          id: 'total',
          name: 'Итоговая сумма',
          type: 'currency',
          editable: false,
          formula: 'SUM(services-table.cost)'
        }
      ],
      tableRows: [
        {
          id: 'total-row',
          label: 'Итого:',
          total: '{{totalAmount}}'
        }
      ],
      variables: [
        {
          id: 'totalAmount',
          name: 'Итоговая сумма',
          type: 'number',
          required: false,
          description: 'Автоматически рассчитывается из таблицы услуг'
        }
      ]
    },
    {
      id: 'closing-text',
      type: 'text',
      content: 'С наилучшими пожеланиями,',
      style: {
        margin: '30px 0 10px 0'
      }
    },
    {
      id: 'signature',
      type: 'signature',
      content: '{{authorPosition}} {{companyName}} {{authorName}}',
      style: {
        margin: '10px 0'
      }
    },
    {
      id: 'date',
      type: 'text',
      content: '{{offerDate}}',
      style: {
        margin: '10px 0'
      }
    }
  ]
};

export default commercialOfferTemplate;
