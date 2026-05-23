import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from '../errors/index.js';


export const daysAgo = (days) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date;
};

export const resolveDateWindow = ({ from, to, defaultDays }) => {
  const resolvedTo = to ? new Date(to) : new Date();
  const resolvedFrom = from ? new Date(from) : daysAgo(defaultDays);

  if (Number.isNaN(resolvedFrom.getTime()) || Number.isNaN(resolvedTo.getTime())) {
    throw new ApiError('Invalid date in `from`/`to`', HTTP_STATUS.BAD_REQUEST);
  }
  if (resolvedFrom > resolvedTo) {
    throw new ApiError('`from` must be earlier than or equal to `to`', HTTP_STATUS.BAD_REQUEST);
  }
  return { from: resolvedFrom, to: resolvedTo };
};
