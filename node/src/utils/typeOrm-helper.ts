import { Injectable } from '@nestjs/common';
import { ListArgs } from '../../common/types/list.args';
import { getFilterCondition } from '../../common/utils/typeOrm-filter';

@Injectable()
export class ArgsListService {
  /** Columns which can be search for the List filter */
  searchableColumns: string[];

  filterCondition(
    args?: ListArgs,
    customConditions?: Record<string, any>,
    populate?: string[],
  ) {
    const orderBy = { key: 'createdAt', value: 'DESC' };
    const pagination = args?.pagination || { limit: 10 };

    let condition = getFilterCondition(args.filters, this.searchableColumns);

    if (customConditions) condition = { ...condition, ...customConditions };

    const query = {};
    if (orderBy && !args.sort) {
      query['order'] = { [orderBy.key]: orderBy.value };
    }

    if (args.sort) {
      if (!query['order']) {
        query['order'] = {};
      }
      Object.keys(args.sort).forEach((key) => {
        query['order'][key] = args.sort[key];
      });
    }

    if (pagination.offset) {
      query['skip'] = pagination.offset;
    }

    if (pagination.limit) {
      query['take'] = pagination.limit;
    }
    if (populate) {
      query['relations'] = populate;
    }

    const filterQuery = { condition, query };
    return filterQuery;
  }
}
const getTimezoneDateTime = (dateTime: Date, timezone: string) => {
  const newDate = dateTime.toLocaleDateString('en-US', {
    timeZone: timezone,
  });
  return new Date(newDate);
};

export const convertUtcTimeToLocal = (dateTime: Date, timezone: string) => {
  if (/^([+-]\d{2}):(\d{2})$/.test(timezone)) {
    // keep this only when mobile implement the offset value
    const [sign, hours, minutes] = timezone.split(/:|\b/).map(Number);
    const timezoneOffsetInHours =
      (sign === -1 ? -1 : 1) * (hours + minutes / 60);

    return new Date(
      dateTime.getTime() + timezoneOffsetInHours * 60 * 60 * 1000,
    );
  } else if (/^[a-zA-Z_]+\/[a-zA-Z_]+$/.test(timezone)) {
    //TODO remove
    return getTimezoneDateTime(dateTime, timezone);
  }
  return dateTime;
};

export const convertLocalTimeToUtc = (dateTime: Date, timezone: string) => {
  if (/^([+-]\d{2}):(\d{2})$/.test(timezone)) {
    const [sign, hours, minutes] = timezone.split(/:|\b/).map(Number);
    const timezoneOffsetInHours =
      (sign === -1 ? -1 : 1) * (hours + minutes / 60);

    return new Date(
      dateTime.getTime() - timezoneOffsetInHours * 60 * 60 * 1000,
    );
  } else if (/^[a-zA-Z_]+\/[a-zA-Z_]+$/.test(timezone)) {
    const newDate = dateTime.toLocaleString('en-US', {
      timeZone: timezone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return new Date(newDate + ' UTC');
  }
  return dateTime;
};
