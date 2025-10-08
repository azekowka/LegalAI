import { DocumentTemplate } from '../types/template';

export const serviceAgreementTemplate: DocumentTemplate = {
  id: 'service-agreement',
  name: 'Договор возмездного оказания услуг',
  description: 'Шаблон договора возмездного оказания услуг',
  createdAt: new Date(),
  updatedAt: new Date(),
  variables: [
    {
      id: 'agreementNumber',
      name: 'Номер договора',
      type: 'text',
      required: true,
      placeholder: '№123/2025'
    },
    {
      id: 'agreementDate',
      name: 'Дата договора',
      type: 'date',
      required: true,
      defaultValue: new Date().toISOString().split('T')[0]
    },
    {
      id: 'placeOfAgreement',
      name: 'Место составления договора',
      type: 'text',
      required: true,
      placeholder: 'г. Алматы'
    },
    {
      id: 'customerCompany',
      name: 'Наименование Заказчика (компания)',
      type: 'text',
      required: true,
      placeholder: 'ТОО "Заказчик"'
    },
    {
      id: 'customerRepresentativePosition',
      name: 'Должность представителя Заказчика',
      type: 'text',
      required: true,
      placeholder: 'Директор'
    },
    {
      id: 'customerRepresentativeName',
      name: 'ФИО представителя Заказчика',
      type: 'text',
      required: true,
      placeholder: 'Иванов И.И.'
    },
    {
      id: 'customerRepresentativeBasis',
      name: 'Основание представителя Заказчика',
      type: 'text',
      required: true,
      placeholder: 'Устава'
    },
    {
      id: 'customerBIN',
      name: 'БИН Заказчика',
      type: 'text',
      required: true,
      placeholder: '123456789012'
    },
    {
      id: 'serviceProviderCompany',
      name: 'Наименование Исполнителя (компания)',
      type: 'text',
      required: true,
      placeholder: 'ТОО "Исполнитель"'
    },
    {
      id: 'serviceProviderRepresentativePosition',
      name: 'Должность представителя Исполнителя',
      type: 'text',
      required: true,
      placeholder: 'Директор'
    },
    {
      id: 'serviceProviderRepresentativeName',
      name: 'ФИО представителя Исполнителя',
      type: 'text',
      required: true,
      placeholder: 'Петров П.П.'
    },
    {
      id: 'serviceProviderRepresentativeBasis',
      name: 'Основание представителя Исполнителя',
      type: 'text',
      required: true,
      placeholder: 'Устава'
    },
    {
      id: 'serviceProviderBIN',
      name: 'БИН Исполнителя',
      type: 'text',
      required: true,
      placeholder: '123456789012'
    },
    {
      id: 'serviceDescription',
      name: 'Описание услуг',
      type: 'text',
      required: true,
      placeholder: 'по разработке программного обеспечения'
    },
    {
      id: 'applicationNumber',
      name: 'Номер Приложения',
      type: 'number',
      required: true,
      placeholder: '1'
    },
    {
      id: 'startDate',
      name: 'Дата начала оказания услуг',
      type: 'date',
      required: true,
      defaultValue: new Date().toISOString().split('T')[0]
    },
    {
      id: 'endDate',
      name: 'Дата завершения оказания услуг',
      type: 'date',
      required: true,
      defaultValue: new Date().toISOString().split('T')[0]
    },
    {
      id: 'materialApplicationNumber',
      name: 'Номер Приложения для материалов',
      type: 'number',
      required: false,
      placeholder: '2'
    },
    {
      id: 'notificationDays',
      name: 'Дни извещения (приемка услуг)',
      type: 'number',
      required: true,
      placeholder: '3'
    },
    {
      id: 'actSignDays',
      name: 'Дни подписания акта',
      type: 'number',
      required: true,
      placeholder: '5'
    },
    {
      id: 'terminationActSignDays',
      name: 'Дни подписания акта (при расторжении)',
      type: 'number',
      required: true,
      placeholder: '7'
    },
    {
      id: 'terminationPaymentDays',
      name: 'Дни оплаты (при расторжении)',
      type: 'number',
      required: true,
      placeholder: '10'
    },
    {
      id: 'totalCost',
      name: 'Общая стоимость услуг',
      type: 'number',
      required: true,
      placeholder: '100000'
    },
    {
      id: 'vatPercentage',
      name: 'Процент НДС',
      type: 'number',
      required: true,
      placeholder: '12'
    },
    {
      id: 'vatAmount',
      name: 'Сумма НДС',
      type: 'number',
      required: true,
      placeholder: '12000'
    },
    {
      id: 'prepaymentDays',
      name: 'Дни предварительной оплаты',
      type: 'number',
      required: true,
      placeholder: '5'
    },
    {
      id: 'latePaymentPenaltyPercent',
      name: 'Процент неустойки за просрочку оплаты',
      type: 'number',
      required: true,
      placeholder: '0.1'
    },
    {
      id: 'serviceDisruptionPenaltyPercent',
      name: 'Процент неустойки за нарушение сроков',
      type: 'number',
      required: true,
      placeholder: '0.5'
    },
    {
      id: 'confidentialityYears',
      name: 'Срок конфиденциальности (лет)',
      type: 'number',
      required: true,
      placeholder: '3'
    },
    {
      id: 'terminationNotificationDaysProvider',
      name: 'Дни извещения о расторжении (Исполнитель)',
      type: 'number',
      required: true,
      placeholder: '10'
    },
    {
      id: 'terminationNotificationDaysCustomer',
      name: 'Дни извещения о расторжении (Заказчик)',
      type: 'number',
      required: true,
      placeholder: '15'
    },
    {
      id: 'customerLegalName',
      name: 'Наименование юридического лица заказчика',
      type: 'text',
      required: true,
      placeholder: 'ТОО "Юр.лицо Заказчика"'
    },
    {
      id: 'customerAddress',
      name: 'Адрес заказчика',
      type: 'text',
      required: true,
      placeholder: 'ул. Примерная, 1'
    },
    {
      id: 'customerPhoneFax',
      name: 'Телефон/факс заказчика',
      type: 'phone',
      required: true,
      placeholder: '+7 (777) 111-22-33'
    },
    {
      id: 'customerIIK',
      name: 'ИИК заказчика',
      type: 'text',
      required: true,
      placeholder: 'KZ123456789012345678'
    },
    {
      id: 'customerIBAN',
      name: 'IBAN заказчика',
      type: 'text',
      required: true,
      placeholder: 'KZ123456789012345678'
    },
    {
      id: 'customerBankName',
      name: 'Наименование банка заказчика',
      type: 'text',
      required: true,
      placeholder: 'АО "Банк Заказчика"'
    },
    {
      id: 'customerBIC',
      name: 'БИК Заказчика',
      type: 'text',
      required: true,
      placeholder: 'ASDFKZKA'
    },
    {
      id: 'customerKBE',
      name: 'КБе Заказчика',
      type: 'text',
      required: true,
      placeholder: '19'
    },
    {
      id: 'customerPosition',
      name: 'Должность заказчика',
      type: 'text',
      required: true,
      placeholder: 'Директор'
    },
    {
      id: 'customerFullName',
      name: 'ФИО заказчика',
      type: 'text',
      required: true,
      placeholder: 'Иванов И.И.'
    },
    {
      id: 'serviceProviderLegalName',
      name: 'Наименование юридического лица исполнителя',
      type: 'text',
      required: true,
      placeholder: 'ТОО "Юр.лицо Исполнителя"'
    },
    {
      id: 'serviceProviderAddress',
      name: 'Адрес исполнителя',
      type: 'text',
      required: true,
      placeholder: 'ул. Другая, 2'
    },
    {
      id: 'serviceProviderPhoneFax',
      name: 'Телефон/факс исполнителя',
      type: 'phone',
      required: true,
      placeholder: '+7 (777) 444-55-66'
    },
    {
      id: 'serviceProviderIIK',
      name: 'ИИК исполнителя',
      type: 'text',
      required: true,
      placeholder: 'KZ987654321098765432'
    },
    {
      id: 'serviceProviderIBAN',
      name: 'IBAN исполнителя',
      type: 'text',
      required: true,
      placeholder: 'KZ987654321098765432'
    },
    {
      id: 'serviceProviderBankName',
      name: 'Наименование банка исполнителя',
      type: 'text',
      required: true,
      placeholder: 'АО "Банк Исполнителя"'
    },
    {
      id: 'serviceProviderBIC',
      name: 'БИК Исполнителя',
      type: 'text',
      required: true,
      placeholder: 'QWERTYUI'
    },
    {
      id: 'serviceProviderKBE',
      name: 'КБе Исполнителя',
      type: 'text',
      required: true,
      placeholder: '17'
    },
    {
      id: 'serviceProviderPosition',
      name: 'Должность исполнителя',
      type: 'text',
      required: true,
      placeholder: 'Директор'
    },
    {
      id: 'serviceProviderFullName',
      name: 'ФИО исполнителя',
      type: 'text',
      required: true,
      placeholder: 'Петров П.П.'
    }
  ],
  sections: [
    {
      id: 'agreement-title',
      type: 'text',
      content: 'Договор возмездного оказания услуг № {{agreementNumber}}',
      style: { textAlign: 'center', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }
    },
    {
      id: 'agreement-date-place',
      type: 'text',
      content: '{{placeOfAgreement}} «{{agreementDate}}» года',
      style: { textAlign: 'center', fontSize: '14px', marginBottom: '20px' }
    },
    {
      id: 'parties-intro',
      type: 'text',
      content: '{{customerCompany}}, которое представляет {{customerRepresentativePosition}} {{customerRepresentativeName}}, действующего на основании {{customerRepresentativeBasis}}, БИН {{customerBIN}}, именуемое в дальнейшем «Заказчик» с одной стороны и {{serviceProviderCompany}}, которое представляет {{serviceProviderRepresentativePosition}} {{serviceProviderRepresentativeName}}, действующего на основании {{serviceProviderRepresentativeBasis}}, БИН {{serviceProviderBIN}}, именуемое в дальнейшем «Исполнитель» с другой стороны, далее совместно именуемые «Стороны», заключили настоящий договор (далее - «Договор») о нижеследующем:'
    },
    {
      id: 'subject-title',
      type: 'header',
      content: '1. Предмет Договора',
      style: { fontWeight: 'bold' }
    },
    {
      id: 'subject-1-1',
      type: 'text',
      content: '1.1. По настоящему Договору Исполнитель обязуется оказать услуги {{serviceDescription}}, а Заказчик обязуется оплатить эти услуги.'
    },
    {
      id: 'subject-1-2',
      type: 'text',
      content: '1.2. Детальный перечень оказываемых по настоящему Договору услуг и их характеристики определяются в Приложении № {{applicationNumber}}, которое является неотъемлемой частью настоящего Договора.'
    },
    {
      id: 'subject-1-3',
      type: 'text',
      content: '1.3. По настоящему Договору Исполнитель должен оказать соответствующие услуги только лично Заказчику.'
    },
    {
      id: 'subject-1-4',
      type: 'text',
      content: '1.4. Услуги оказываются однократно.'
    },
    {
      id: 'subject-1-5',
      type: 'text',
      content: '1.5. Исполнитель обязан приступить к оказанию услуг {{startDate}} года и завершить оказание услуг {{endDate}} года.'
    },
    {
      id: 'rights-obligations-title',
      type: 'header',
      content: '2. Права и обязанности Сторон',
      style: { fontWeight: 'bold' }
    },
    {
      id: 'service-provider-obligations-title',
      type: 'text',
      content: '2.1.Исполнитель обязуется:',
      style: { fontWeight: 'bold' }
    },
    {
      id: 'service-provider-obligation-1',
      type: 'text',
      content: '2.1.1. оказать услуги с надлежащим качеством и в срок, предусмотренный условиями настоящего Договора;'
    },
    {
      id: 'service-provider-obligation-2',
      type: 'text',
      content: '2.1.2. оказать услуги с соответствии с теми требованиями и характеристиками, которые предусмотрены настоящим Договором;'
    },
    {
      id: 'service-provider-note-1',
      type: 'text',
      content: 'Примечание: Если законодательством или нормативно-техническими документами установлены обязательные требования в отношении соответствующих услуг, то услуги должны быть оказаны также с соблюдением таких требований.',
      style: { fontSize: '10px', fontStyle: 'italic' }
    },
    {
      id: 'service-provider-obligation-3',
      type: 'text',
      content: '2.1.3. предоставить в рамках материального обеспечения оказания услуг по настоящему Договору материалы и оборудование, виды и количество которых определяются в Приложении № {{materialApplicationNumber}}, которое является неотъемлемой частью настоящего Договора;'
    },
    {
      id: 'service-provider-obligation-4',
      type: 'text',
      content: '2.1.4. применять все необходимые для осуществления настоящего Договора материалы и оборудование;'
    },
    {
      id: 'service-provider-obligation-5',
      type: 'text',
      content: '2.1.5. соблюдать распорядок, установленный в месте оказания услуги;'
    },
    {
      id: 'service-provider-obligation-6',
      type: 'text',
      content: '2.1.6. предоставлять Заказчику по его запросу информацию о ходе оказания услуг.'
    },
    {
      id: 'service-provider-rights-title',
      type: 'text',
      content: '2.2.Исполнитель вправе:',
      style: { fontWeight: 'bold' }
    },
    {
      id: 'service-provider-right-1',
      type: 'text',
      content: '2.2.1. не приступать к оказанию услуг до полного исполнения Заказчиком обязанности по частичному обеспечению Исполнителя необходимыми для оказания услуг материалами и оборудованием; срок завершения оказания услуг в этом случае продлевается на время такого простоя Исполнителя;'
    },
    {
      id: 'service-provider-right-2',
      type: 'text',
      content: '2.2.2. обращаться к Заказчику для получения информации, необходимой для оказания услуг;'
    },
    {
      id: 'service-provider-right-3',
      type: 'text',
      content: '2.2.3. привлекать третьих лиц для оказания услуг по настоящему Договору только с письменного согласия Заказчика.'
    },
    {
      id: 'service-provider-note-2',
      type: 'text',
      content: 'Примечание: если в качестве Исполнителя выступает юридическое лицо, то работники такого юридического лица для целей исполнения настоящего договора не считаются третьими лицами.',
      style: { fontSize: '10px', fontStyle: 'italic' }
    },
    {
      id: 'service-provider-right-4',
      type: 'text',
      content: '2.2.4. оказать услуги досрочно;'
    },
    {
      id: 'service-provider-right-5',
      type: 'text',
      content: '2.2.5. требовать оплаты за оказанные услуги.'
    },
    {
      id: 'customer-obligations-title',
      type: 'text',
      content: '2.3.Заказчик обязуется:',
      style: { fontWeight: 'bold' }
    },
    {
      id: 'customer-obligation-1',
      type: 'text',
      content: '2.3.1. своевременно предоставить Исполнителю всю необходимую информацию для оказания услуг;'
    },
    {
      id: 'customer-obligation-2',
      type: 'text',
      content: '2.3.2. предоставить Исполнителю беспрепятственный доступ к месту оказания услуг;'
    },
    {
      id: 'customer-note-1',
      type: 'text',
      content: 'Примечание: Если услуги должны быть оказаны по месту нахождения Заказчика или иному месту, относящемуся к Заказчику, он обязан предоставить Исполнителю беспрепятственный доступ к месту оказания услуг.',
      style: { fontSize: '10px', fontStyle: 'italic' }
    },
    {
      id: 'customer-obligation-3',
      type: 'text',
      content: '2.3.3. предоставить в рамках материального обеспечения оказания услуг по настоящему Договору материалы и оборудование, виды и количество которых определяются в Приложении № {{materialApplicationNumber}}, которое является неотъемлемой частью настоящего Договора;'
    },
    {
      id: 'customer-obligation-4',
      type: 'text',
      content: '2.3.4. незамедлительно извещать Исполнителя о любых событиях и фактах, имеющих отношение к оказанию услуг или могущих оказать влияние на его выполнение;'
    },
    {
      id: 'customer-obligation-5',
      type: 'text',
      content: '2.3.5. своевременно оплатить стоимость оказанных услуг в соответствии с условиями настоящего Договора;'
    },
    {
      id: 'customer-obligation-6',
      type: 'text',
      content: '2.3.6. подписать акт оказанных услуг кроме случаев, предусмотренных настоящим Договором.'
    },
    {
      id: 'customer-rights-title',
      type: 'text',
      content: '2.4.Заказчик вправе:',
      style: { fontWeight: 'bold' }
    },
    {
      id: 'customer-right-1',
      type: 'text',
      content: '2.4.1. в любое время проверять ход и качество оказываемых услуг;'
    },
    {
      id: 'customer-right-2',
      type: 'text',
      content: '2.4.2. предъявлять обоснованные возражения в отношении качества и/или полноты оказания услуг;'
    },
    {
      id: 'customer-right-3',
      type: 'text',
      content: '2.4.3. если отступления от условий Договора или иные недостатки результата оказанной услуги в установленный Заказчиком разумный срок не были устранены, либо являются существенными и неустранимыми, отказаться от исполнения Договора и потребовать возмещения причиненных убытков.'
    },
    {
      id: 'acceptance-title',
      type: 'header',
      content: '3. Приемка оказанных услуг',
      style: { fontWeight: 'bold' }
    },
    {
      id: 'acceptance-3-1',
      type: 'text',
      content: '3.1. После полного оказания услуг в соответствии с условиями настоящего Договора Исполнитель не позднее {{notificationDays}} дней извещает об этом Заказчика. Не позднее {{actSignDays}} дней с момента получения Заказчиком вышеуказанного извещения Сторонами должен быть подписан акт оказанных услуг в двух экземплярах. Данный документ предоставляет Исполнителю право на оплату оказанным им услуг.'
    },
    {
      id: 'acceptance-3-2',
      type: 'text',
      content: '3.2. В случае неполного оказания Исполнителем услуг, предусмотренных условиями настоящего Договора, или оказания услуг с отклонением от необходимых требований и характеристик, которые предусмотрены настоящим Договором, Заказчик вправе отказаться от подписания акта оказанных услуг до момента полного устранения Исполнителем соответствующих недостатков.'
    },
    {
      id: 'acceptance-3-3',
      type: 'text',
      content: '3.3. При прекращении настоящего Договора до момента оказания услуг в полном объеме, Стороны составляют акт оказанных услуг в отношении фактически оказанных на момент прекращения Договора услуг. Такой акт должен быть составлен и подписан обеими Сторонами не позднее {{terminationActSignDays}} дней с момента прекращения действия настоящего Договора. Оплата указанных в таком акте услуг должна быть произведена Заказчиком не позднее {{terminationPaymentDays}} дней с момента подписания акта обеими Сторонами. В случаях, предусмотренных настоящим Договором, частично оказанные услуги оплате не подлежат.'
    },
    {
      id: 'acceptance-3-4',
      type: 'text',
      content: '3.4. Если Заказчик не подписал (отказался от подписания) акт оказанных услуг, Исполнитель вправе подписать данный акт в одностороннем порядке со своей Стороны. Такой односторонний акт приемки оказанных услуг предоставляет Исполнителю право потребовать от Заказчика оплаты оказанных услуг, если только Заказчик не докажет, что в соответствии с условиями настоящего Договора он имел право отказаться от подписания акта оказанных услуг.'
    },
    {
      id: 'acceptance-3-5',
      type: 'text',
      content: '3.5. Если услуги оказаны с недостатками, за которые Исполнитель отвечает, Заказчик, кроме прочих установленных законодательством требований, вправе также самостоятельно или с привлечением третьих лиц устранить такие недостатки и потребовать от Исполнителя возмещения своих расходов на их устранение.'
    },
    {
      id: 'acceptance-3-6',
      type: 'text',
      content: '3.6. Если услуги были оказаны Исполнителем некачественно либо оказались невыполненными вследствие недоброкачественности предоставленного Заказчиком материала или оборудования либо вследствие исполнения ошибочных указаний Заказчика, Исполнитель вправе требовать оплаты установленной цены с учётом выполненной части услуги.'
    },
    {
      id: 'acceptance-3-7',
      type: 'text',
      content: '3.7. Если до окончания оказания услуги возникла невозможность исполнения обязательства Исполнителя по вине Заказчика, Заказчик обязан оплатить Исполнителю стоимость услуг в полном объеме, предусмотренном Договором, независимо от фактического объема оказанных услуг.'
    },
    {
      id: 'acceptance-3-8',
      type: 'text',
      content: '3.8. Если до окончания оказания услуги возникла невозможность исполнения обязательства Исполнителя по вине Исполнителя, он не вправе требовать оплаты за фактически оказанные услуги, а также не вправе требовать от Заказчика возмещения расходов.'
    },
    {
      id: 'acceptance-3-9',
      type: 'text',
      content: '3.9. Если невозможность исполнения обязательства Исполнителя возникла не по вине Сторон Договора, Заказчик должен оплатить Исполнителю фактически оказанные им к этому моменту услуги.'
    },
    {
      id: 'acceptance-3-10',
      type: 'text',
      content: '3.10. Наступление невозможности исполнения обязательства Исполнителя независимо от основания её наступления влечет прекращение настоящего Договора. Такое прекращение Договора не освобождает его Стороны от осуществления вышеуказанных взаиморасчётов и от ответственности за нарушение обязательства при наличия оснований для её применения.'
    },
    {
      id: 'acceptance-3-11',
      type: 'text',
      content: '3.11. Риск случайной гибели или случайного повреждения материалов, оборудования или иного используемого для исполнения Договора имущества, несет Заказчик. В этом случае Заказчик должен в течение разумного срока за свой счёт заменить погибшее имущество пригодным для продолжения работы по Договору или за свой счёт восстановить поврежденное имущество. В противном случае Исполнитель вправе отказаться от исполнения настоящего Договора и потребовать оплаты той части услуг, которая была фактически оказана.'
    },
    {
      id: 'cost-payment-title',
      type: 'header',
      content: '4. Стоимость услуг и порядок расчетов',
      style: { fontWeight: 'bold' }
    },
    {
      id: 'cost-payment-4-1',
      type: 'text',
      content: '4.1. Общая стоимость услуг по настоящему Договору составляет {{totalCost}} тенге'
    },
    {
      id: 'cost-payment-4-2',
      type: 'text',
      content: '4.2. Сумма Договора включает в себя все расходы Исполнителя, связанные с оказанием услуг по настоящему Договору.'
    },
    {
      id: 'cost-payment-4-3',
      type: 'text',
      content: '4.3. Цена Договора включает в себя НДС ({{vatPercentage}}%) в сумме {{vatAmount}} тенге.'
    },
    {
      id: 'cost-payment-4-4',
      type: 'text',
      content: '4.4. Заказчик должен произвести полную предварительную оплату услуг в течение {{prepaymentDays}} с момента заключения настоящего Договора. До момента полной предварительной оплаты Исполнитель вправе не приступать к оказанию услуг; срок завершения оказания услуги в этом случае продлевается на время такого простоя Исполнителя.'
    },
    {
      id: 'cost-payment-4-5',
      type: 'text',
      content: '4.5. Оплата услуг производится путем внесения наличных денежных средств в кассу Исполнителя, либо в безналичном порядке на расчетный счет (карту) Исполнителя.'
    },
    {
      id: 'responsibility-title',
      type: 'header',
      content: '5. Ответственность Сторон',
      style: { fontWeight: 'bold' }
    },
    {
      id: 'responsibility-5-1',
      type: 'text',
      content: '5.1. За неисполнение или ненадлежащее исполнение своих обязательств по Договору Стороны несут ответственность в соответствии с действующим законодательством Республики Казахстан.'
    },
    {
      id: 'responsibility-5-2',
      type: 'text',
      content: '5.2. Исполнитель за нарушение начального и (или) конечного срока оказания услуг должен выплатить Заказчику неустойку в размере {{serviceDisruptionPenaltyPercent}}% от общей суммы Договора за каждый день соответствующего нарушения.'
    },
    {
      id: 'responsibility-5-3',
      type: 'text',
      content: '5.3. В случае просрочки исполнения Стороной настоящего Договора своих денежных обязательств она обязана уплатить другой Стороне Договора неустойку в размере {{latePaymentPenaltyPercent}}% от просроченной суммы за каждый день просрочки.'
    },
    {
      id: 'responsibility-5-4',
      type: 'text',
      content: '5.4. Уплата штрафов, пени и неустоек, а также возмещение убытков не освобождают Стороны от исполнения своих обязательств по настоящему Договору.'
    },
    {
      id: 'confidentiality-title',
      type: 'header',
      content: '6. Конфиденциальность',
      style: { fontWeight: 'bold' }
    },
    {
      id: 'confidentiality-6-1',
      type: 'text',
      content: '6.1. Стороны обязуются сохранять строгую конфиденциальность информации, полученной в ходе исполнения настоящего Договора, и принять все возможные меры, чтобы предохранить полученную информацию от разглашения.'
    },
    {
      id: 'confidentiality-6-2',
      type: 'text',
      content: '6.2. Передача конфиденциальной информации третьим лицам, опубликование или иное разглашение такой информации могут осуществляться только с письменного согласия другой Стороны независимо от причины прекращения действия настоящего Договора.'
    },
    {
      id: 'confidentiality-6-3',
      type: 'text',
      content: '6.3. Ограничения относительно разглашения информации не относятся к общедоступной информации или информации ставшей таковой не по вине Сторон.'
    },
    {
      id: 'confidentiality-6-4',
      type: 'text',
      content: '6.4. Стороны не несут ответственности в случае передачи информации субъектам, имеющим право ее затребовать в соответствии с законодательством Республики Казахстан.'
    },
    {
      id: 'confidentiality-6-5',
      type: 'text',
      content: '6.5. Обязательства по сохранению конфиденциальности информации действуют в течение времени действия настоящего Договора и {{confidentialityYears}} лет после прекращения его действия.'
    },
    {
      id: 'termination-title',
      type: 'header',
      content: '7. Расторжение Договора',
      style: { fontWeight: 'bold' }
    },
    {
      id: 'termination-7-1',
      type: 'text',
      content: '7.1. Исполнитель вправе в любое время отказаться от исполнения обязательств по настоящему Договору, письменно известив об этом Заказчика за {{terminationNotificationDaysProvider}} дней до расторжения Договора. В этом случае Исполнитель обязан возместить Заказчику убытки, причиненные расторжением Договора. Кроме того, Исполнитель в этом случае не вправе требовать оплаты услуг, выполненных в неполном объеме.'
    },
    {
      id: 'termination-7-2',
      type: 'text',
      content: '7.2. Если Исполнитель отказался от исполнения своих обязательств вследствие виновного нарушения Заказчиком своих обязательств по настоящему Договору, Исполнитель освобождается от возмещения таких убытков. Кроме того, Исполнитель в этом случае вправе требовать оплаты части услуг, фактически оказанных к этому моменту.'
    },
    {
      id: 'termination-7-3',
      type: 'text',
      content: '7.3. Заказчик вправе в любое время отказаться от исполнения настоящего Договора, письменно известив об этом Исполнителя за {{terminationNotificationDaysCustomer}} дней до расторжения Договора. В этом случае Заказчик обязан оплатить Исполнителю услуги, фактически оказанные им к моменту получения извещения Заказчика об отказе от исполнения настоящего Договора.'
    },
    {
      id: 'termination-7-4',
      type: 'text',
      content: '7.4. Прекращение настоящего Договора не освобождает его Стороны от исполнения своих обязательств в части составления и подписания актов оказанных услуг, а также оплаты услуг, фактически оказанных до момента прекращения Договора, за исключением случаев, предусмотренных настоящим Договором.'
    },
    {
      id: 'applicable-law-title',
      type: 'header',
      content: '8. Применимое право и порядок разрешения споров',
      style: { fontWeight: 'bold' }
    },
    {
      id: 'applicable-law-8-1',
      type: 'text',
      content: '8.1. К взаимоотношениям Сторон по настоящему Договору применяется законодательство Республики Казахстан.'
    },
    {
      id: 'applicable-law-8-2',
      type: 'text',
      content: '8.2. Перед обращением в суд за разрешением возникшего спора, Сторона настоящего Договора должна направить другой Стороне письменную претензию с указанием своих требований к другой Стороне, с предложением добровольного удовлетворения этих требований и срока для добровольного удовлетворения. Данный досудебный порядок считается соблюденным для цели обращения в суд с момента получения письменного отказа другой Стороны от удовлетворения требования либо при неполучении письменного ответа на претензию в течение 30 дней с момента получения претензии другой Стороной, либо при неудовлетворении другой Стороной изложенного в претензии требования в срок, указанный в претензии. Данный досудебный порядок не распространяется на требования, которые по своему характеру не предполагают возможность другой Стороны Договора удовлетворить их (о признании сделки недействительной и т.п.).'
    },
    {
      id: 'applicable-law-8-3',
      type: 'text',
      content: '8.3. Все споры, разногласия или требования, возникающие из настоящего Договора либо в связи с ним, в том числе касающиеся его нарушения, прекращения или недействительности, подлежат окончательному урегулированию в Арбитражном центре Национальной палаты предпринимателей Республики Казахстан «Атамекен» согласно его действующему Регламенту.'
    },
    {
      id: 'applicable-law-8-4',
      type: 'text',
      content: '8.4. Предметом, который подлежит рассмотрению арбитражем, являются все споры, разногласия или требования, возникающие из настоящего Договора либо в связи с ним, в том числе касающиеся его нарушения, прекращения или недействительности.'
    },
    {
      id: 'applicable-law-8-5',
      type: 'text',
      content: '8.5. Местом проведения арбитражного разбирательства будет – город Нур-Султан.'
    },
    {
      id: 'final-provisions-title',
      type: 'header',
      content: '9. Заключительные положения',
      style: { fontWeight: 'bold' }
    },
    {
      id: 'final-provisions-9-1',
      type: 'text',
      content: '9.1. Настоящий Договор, а также соглашения о его изменении или дополнении действительны лишь при условии облечения их в письменную форму путем подписания обеими Сторонами единого документа.'
    },
    {
      id: 'final-provisions-9-2',
      type: 'text',
      content: '9.2. Обо всех изменениях в банковских, почтовых, электронных и иных реквизитах Стороны обязаны извещать друг друга не позднее двух календарных дней с момента их официального утверждения. Все действия, совершенные Сторонами по старым адресам и счетам до поступления уведомлений об их изменении, считаются совершенными надлежащим образом.'
    },
    {
      id: 'final-provisions-9-3',
      type: 'text',
      content: '9.3. Стороны настоящим подтверждают, что на момент подписания Договора:\n- не находились под влиянием обмана, насилия, угрозы;\n- Договор оказания услуг не является мнимым и притворным;\n- обладают правоспособностью и дееспособностью, позволяющими вступать в гражданско-правовые отношения.'
    },
    {
      id: 'final-provisions-9-4',
      type: 'text',
      content: '9.4. Стороны пришли к соглашению нотариально не удостоверять настоящий Договор.'
    },
    {
      id: 'final-provisions-9-5',
      type: 'text',
      content: '9.5. Настоящий Договор составлен на русском языке, в двух подлинных экземплярах, по одному для каждой Стороны, каждый из которых имеет одинаковую юридическую силу.'
    },
    {
      id: 'requisites-title',
      type: 'header',
      content: '10. Реквизиты, юридические адреса и подписи Сторон:',
      style: { fontWeight: 'bold' }
    },
    {
      id: 'requisites-table',
      type: 'table',
      content: '',
      tableColumns: [
        { id: 'customer', name: 'Заказчик:', type: 'text', editable: false },
        { id: 'serviceProvider', name: 'Исполнитель:', type: 'text', editable: false }
      ],
      tableRows: [
        {
          id: 'row-1',
          customer: 'Наименование юридического лица заказчика\n{{customerLegalName}}',
          serviceProvider: 'Наименование юридического лица исполнителя\n{{serviceProviderLegalName}}'
        },
        {
          id: 'row-2',
          customer: 'адрес: {{customerAddress}}',
          serviceProvider: 'адрес: {{serviceProviderAddress}}'
        },
        {
          id: 'row-3',
          customer: 'тел./факс: {{customerPhoneFax}}',
          serviceProvider: 'тел./факс: {{serviceProviderPhoneFax}}'
        },
        {
          id: 'row-4',
          customer: 'БИН {{customerBIN}}',
          serviceProvider: 'БИН {{serviceProviderBIN}}'
        },
        {
          id: 'row-5',
          customer: 'ИИК {{customerIIK}}',
          serviceProvider: 'ИИК {{serviceProviderIIK}}'
        },
        {
          id: 'row-6',
          customer: 'IBAN {{customerIBAN}}',
          serviceProvider: 'IBAN {{serviceProviderIBAN}}'
        },
        {
          id: 'row-7',
          customer: 'в {{customerBankName}}',
          serviceProvider: 'в {{serviceProviderBankName}}'
        },
        {
          id: 'row-8',
          customer: 'БИК {{customerBIC}}',
          serviceProvider: 'БИК {{serviceProviderBIC}}'
        },
        {
          id: 'row-9',
          customer: 'КБе {{customerKBE}}',
          serviceProvider: 'КБе {{serviceProviderKBE}}'
        },
        {
          id: 'row-10',
          customer: 'Должность заказчика\n{{customerPosition}}',
          serviceProvider: 'Должность исполнителя\n{{serviceProviderPosition}}'
        },
        {
          id: 'row-11',
          customer: 'ФИО заказчика\n{{customerFullName}}',
          serviceProvider: 'ФИО исполнителя\n{{serviceProviderFullName}}'
        }
      ],
      style: { marginBottom: '20px' }
    }
  ]
};

export default serviceAgreementTemplate;
