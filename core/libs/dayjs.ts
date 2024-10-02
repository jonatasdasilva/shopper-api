import dayjs from 'dayjs';
import locale from 'dayjs/locale/pt-br';
import localizedFormat from 'dayjs/plugin/localizedFormat';

// format date
dayjs.locale(locale);
dayjs.extend(localizedFormat);

export { dayjs }