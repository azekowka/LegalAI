import { DocumentTemplate } from '../types/template';

export const confidentialityAgreementTemplate: DocumentTemplate = {
  id: 'confidentiality-agreement',
  name: 'Соглашение о Конфиденциальности',
  description: 'Шаблон соглашения о конфиденциальности',
  createdAt: new Date(),
  updatedAt: new Date(),
  variables: [
    {
      id: 'documentNumber',
      name: 'Номер документа',
      type: 'text',
      required: true,
      placeholder: '№123/2025'
    },
    {
      id: 'city',
      name: 'Город',
      type: 'text',
      required: true,
      placeholder: 'Алматы'
    },
    {
      id: 'day',
      name: 'День договора',
      type: 'number',
      required: true,
      placeholder: '01'
    },
    {
      id: 'month',
      name: 'Месяц договора',
      type: 'text',
      required: true,
      placeholder: 'января'
    },
    {
      id: 'year',
      name: 'Год договора',
      type: 'number',
      required: true,
      placeholder: '2025'
    },
    {
      id: 'disclosingCompanyName',
      name: 'Открывающая сторона - Название компании',
      type: 'text',
      required: true,
      placeholder: 'ТОО "Пример Компании"'
    },
    {
      id: 'disclosingOfficerPosition',
      name: 'Открывающая сторона - Должность ответственного лица',
      type: 'text',
      required: true,
      placeholder: 'Директор'
    },
    {
      id: 'disclosingOfficerName',
      name: 'Открывающая сторона - ФИО ответственного лица',
      type: 'text',
      required: true,
      placeholder: 'Иванов И.И.'
    },
    {
      id: 'receivingOfficerName',
      name: 'Принимающая сторона - ФИО ответственного лица',
      type: 'text',
      required: true,
      placeholder: 'Петров П.П.'
    },
    {
      id: 'receivingBIN',
      name: 'Принимающая сторона - ИИН',
      type: 'text',
      required: true,
      placeholder: '123456789012'
    }
  ],
  sections: [
    {
      id: 'title',
      type: 'header',
      content: 'Соглашение о Конфиденциальности № {{documentNumber}}',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '10px'
      }
    },
    {
      id: 'city-date',
      type: 'text',
      content: 'г. {{city}}',
      style: {
        textAlign: 'center',
        marginBottom: '5px'
      }
    },
    {
      id: 'agreement-date',
      type: 'text',
      content: '«{{day}}» {{month}} {{year}} г.',
      style: {
        textAlign: 'center',
        marginBottom: '20px'
      }
    },
    {
      id: 'parties',
      type: 'text',
      content: 'Раскрывающая сторона: {{disclosingCompanyName}} в лице {{disclosingOfficerPosition}} {{disclosingOfficerName}}, действующего на основании устава и Принимающая сторона: {{receivingOfficerName}} ИИН {{receivingBIN}}, совместно именуемые Стороны, по отдельности – Сторона, заключили соглашение (далее - Соглашение) о следующем:',
      style: {
        marginBottom: '20px'
      }
    },
    {
      id: 'subject',
      type: 'header',
      content: 'Предмет Соглашения',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '10px'
      }
    },
    {
      id: 'subject-content',
      type: 'text',
      content: 'Раскрывающая сторона предоставляет Принимающей стороне информацию, составляющую конфиденциальную информацию Раскрывающей стороны (далее – Конфиденциальная информация), которую Принимающая сторона обязуется сохранить в тайне и не разглашать третьим лицам.',
      style: {
        marginBottom: '20px'
      }
    },
    {
      id: 'information-transfer',
      type: 'header',
      content: 'Передача Конфиденциальной Информации',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '10px'
      }
    },
    {
      id: 'transfer-methods-title',
      type: 'text',
      content: 'Способы передачи Конфиденциальной информации:',
      style: {
        marginBottom: '5px'
      }
    },
    {
      id: 'transfer-methods-1',
      type: 'text',
      content: 'Передача материальных носителей, на которых зафиксирована Конфиденциальная информация.',
      style: {
        marginLeft: '20px',
        marginBottom: '5px'
      }
    },
    {
      id: 'transfer-methods-2',
      type: 'text',
      content: 'Передачи по электронной почте архива файла с паролем, содержащего Конфиденциальную информацию. В этом случае Раскрывающая сторона предоставляет Принимающей стороне пароль от архива по иным, предусмотренным Соглашением, каналам связи.',
      style: {
        marginLeft: '20px',
        marginBottom: '20px'
      }
    },
    {
      id: 'storage-disclosure',
      type: 'header',
      content: 'Хранение и Раскрытие Конфиденциальное Информации',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '10px'
      }
    },
    {
      id: 'storage-disclosure-content-1',
      type: 'text',
      content: 'Принимающая сторона обеспечивает хранение всей Конфиденциальной информации в тайне и не раскрывает ее третьим лицам.',
      style: {
        marginBottom: '5px'
      }
    },
    {
      id: 'storage-disclosure-content-2',
      type: 'text',
      content: 'Принимающая сторона несет ответственность за действия, приведшие к разглашению Конфиденциальной информации любым третьим лицам.',
      style: {
        marginBottom: '20px'
      }
    },
    {
      id: 'final-provisions',
      type: 'header',
      content: 'Заключительные Положения',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '10px'
      }
    },
    {
      id: 'final-provisions-content',
      type: 'text',
      content: 'Стороны признают надлежащим подписание Соглашения электронным путем. Такие документы приравниваются к документам на бумажном носителе. Для обмена документами должны использоваться адреса Сторон, согласованные в реквизитах Соглашения.',
      style: {
        marginBottom: '40px'
      }
    },
    {
      id: 'disclosing-party-title',
      type: 'text',
      content: 'Раскрывающая сторона:',
      style: {
        fontWeight: 'bold',
        marginBottom: '10px'
      }
    },
    {
      id: 'disclosing-party-info-1',
      type: 'text',
      content: '{{disclosingCompanyName}}',
      style: {
        marginBottom: '5px'
      }
    },
    {
      id: 'disclosing-party-info-2',
      type: 'text',
      content: '{{disclosingOfficerName}}',
      style: {
        marginBottom: '5px'
      }
    },
    {
      id: 'disclosing-party-info-3',
      type: 'text',
      content: '{{disclosingOfficerPosition}}',
      style: {
        marginBottom: '20px'
      }
    },
    {
      id: 'receiving-party-title',
      type: 'text',
      content: 'Принимающая сторона:',
      style: {
        fontWeight: 'bold',
        marginBottom: '10px'
      }
    },
    {
      id: 'receiving-party-info-1',
      type: 'text',
      content: '{{receivingOfficerName}}',
      style: {
        marginBottom: '5px'
      }
    },
    {
      id: 'receiving-party-info-2',
      type: 'text',
      content: '{{receivingBIN}}',
      style: {
        marginBottom: '5px'
      }
    }
  ]
};

export default confidentialityAgreementTemplate;
