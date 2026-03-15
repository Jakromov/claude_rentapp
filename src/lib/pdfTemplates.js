/**
 * pdfmake document definitions for DOKON documents.
 * Both are opened in a new browser tab for printing.
 */

function formatDate(dateStr) {
  if (!dateStr) return '___________'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function checkbox(checked) {
  return checked ? '[x]' : '[ ]'
}

/**
 * Rental Agreement (Договор аренды) document definition.
 */
export function rentalAgreementDoc(rental) {
  const { agreement_no, courier, scooter, tariff, start_date, end_date, license_no, license_issue_date } = rental

  return {
    content: [
      { text: 'ДОГОВОР АРЕНДЫ СКУТЕРА', style: 'title' },
      { text: `№ ${agreement_no}`, style: 'subtitle' },
      { text: `от ${formatDate(start_date)}`, style: 'subtitle', margin: [0, 0, 0, 16] },

      { text: 'СТОРОНЫ ДОГОВОРА', style: 'sectionHeader' },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            [{ text: 'ФИО арендатора', style: 'label' }, { text: courier?.full_name || '', style: 'value' }],
            [{ text: 'Паспорт', style: 'label' }, { text: courier?.passport_no || '', style: 'value' }],
            [{ text: 'Телефон', style: 'label' }, { text: courier?.phone || '', style: 'value' }],
            [{ text: 'Вод. удостоверение', style: 'label' }, { text: license_no || '', style: 'value' }],
            [{ text: 'Дата выдачи ВУ', style: 'label' }, { text: formatDate(license_issue_date), style: 'value' }],
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 16],
      },

      { text: 'ТРАНСПОРТНОЕ СРЕДСТВО', style: 'sectionHeader' },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            [{ text: 'Модель', style: 'label' }, { text: scooter?.model || '', style: 'value' }],
            [{ text: 'Гос. номер', style: 'label' }, { text: scooter?.plate || '', style: 'value' }],
            [{ text: 'VIN', style: 'label' }, { text: scooter?.vin || '', style: 'value' }],
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 16],
      },

      { text: 'УСЛОВИЯ АРЕНДЫ', style: 'sectionHeader' },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            [
              { text: 'Тариф', style: 'label' },
              {
                text: [
                  `${checkbox(tariff === 'daily')} Посуточно  `,
                  `${checkbox(tariff === 'weekly')} Еженедельно  `,
                  `${checkbox(tariff === 'monthly')} Ежемесячно`,
                ],
                style: 'value',
              },
            ],
            [{ text: 'Начало аренды', style: 'label' }, { text: formatDate(start_date), style: 'value' }],
            [{ text: 'Окончание аренды', style: 'label' }, { text: formatDate(end_date), style: 'value' }],
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 32],
      },

      { text: 'ПОДПИСИ', style: 'sectionHeader' },
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'Арендодатель:', style: 'signLabel' },
              { text: '\n\n', },
              { text: '________________________', style: 'signLine' },
              { text: '(подпись / ФИО)', style: 'signHint' },
            ],
          },
          {
            width: '50%',
            stack: [
              { text: 'Арендатор:', style: 'signLabel' },
              { text: '\n\n', },
              { text: '________________________', style: 'signLine' },
              { text: `${courier?.full_name || ''}`, style: 'signHint' },
            ],
          },
        ],
      },
    ],
    styles: {
      title: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 4] },
      subtitle: { fontSize: 12, alignment: 'center', color: '#555' },
      sectionHeader: { fontSize: 11, bold: true, margin: [0, 0, 0, 6], color: '#333', decoration: 'underline' },
      label: { fontSize: 10, color: '#666' },
      value: { fontSize: 10, bold: true },
      signLabel: { fontSize: 10, bold: true, margin: [0, 0, 0, 8] },
      signLine: { fontSize: 10 },
      signHint: { fontSize: 8, color: '#888', margin: [0, 2, 0, 0] },
    },
    defaultStyle: { font: 'Roboto', fontSize: 10 },
    pageMargins: [40, 40, 40, 40],
  }
}

/**
 * Doverenost (Доверенность) document definition.
 */
export function doverenostDoc(rental) {
  const { courier, scooter, start_date, end_date, license_no, license_issue_date } = rental

  return {
    content: [
      { text: 'ДОВЕРЕННОСТЬ', style: 'title' },
      { text: 'на управление транспортным средством', style: 'subtitle', margin: [0, 0, 0, 24] },

      {
        text: [
          { text: 'Настоящая доверенность выдана ' },
          { text: courier?.full_name || '___________', bold: true },
          { text: ', паспорт: ' },
          { text: courier?.passport_no || '___________', bold: true },
          { text: ', водительское удостоверение № ' },
          { text: license_no || '___________', bold: true },
          { text: `, выданное ${formatDate(license_issue_date)},` },
        ],
        style: 'body',
        margin: [0, 0, 0, 12],
      },

      {
        text: [
          { text: 'на право управления транспортным средством: ' },
          { text: scooter?.model || '___________', bold: true },
          { text: ', гос. номер: ' },
          { text: scooter?.plate || '___________', bold: true },
          { text: ', VIN: ' },
          { text: scooter?.vin || '___________', bold: true },
          { text: '.' },
        ],
        style: 'body',
        margin: [0, 0, 0, 12],
      },

      {
        text: [
          { text: 'Срок действия доверенности: с ' },
          { text: formatDate(start_date), bold: true },
          { text: ' по ' },
          { text: formatDate(end_date), bold: true },
          { text: '.' },
        ],
        style: 'body',
        margin: [0, 0, 0, 40],
      },

      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'Доверитель:', style: 'signLabel' },
              { text: '\n\n' },
              { text: '________________________', style: 'signLine' },
              { text: '(подпись / ФИО)', style: 'signHint' },
              { text: '\n\nМ.П.', style: 'signHint' },
            ],
          },
          {
            width: '50%',
            stack: [
              { text: 'Доверенное лицо:', style: 'signLabel' },
              { text: '\n\n' },
              { text: '________________________', style: 'signLine' },
              { text: `${courier?.full_name || ''}`, style: 'signHint' },
            ],
          },
        ],
      },
    ],
    styles: {
      title: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 4] },
      subtitle: { fontSize: 12, alignment: 'center', color: '#555' },
      body: { fontSize: 11, lineHeight: 1.4 },
      signLabel: { fontSize: 10, bold: true, margin: [0, 0, 0, 8] },
      signLine: { fontSize: 10 },
      signHint: { fontSize: 8, color: '#888', margin: [0, 2, 0, 0] },
    },
    defaultStyle: { font: 'Roboto', fontSize: 11 },
    pageMargins: [50, 50, 50, 50],
  }
}
