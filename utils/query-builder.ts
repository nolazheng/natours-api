import { Query } from 'mongoose';

interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any;
}

// filter: 轉換查詢條件
const filter = (
  query: Query<any, any>,
  queryString: QueryString
): Query<any, any> => {
  const queryObj = { ...queryString };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  return query.find(JSON.parse(queryStr));
};

// sort: 排序
const sort = (query: Query<any, any>, queryString: QueryString) => {
  if (queryString.sort) {
    const sortBy = queryString.sort.split(',').join(' ');
    return query.sort(sortBy);
  }
  return query.sort('-createdAt');
};

// limitFields: 限制要選取的欄位
const limitFields = (query: Query<any, any>, queryString: QueryString) => {
  if (queryString.fields) {
    const fields = queryString.fields.split(',').join(' ');
    return query.select(fields);
  }
  return query.select('-__v');
};

// paginate: 分頁
const paginate = (query: Query<any, any>, queryString: QueryString) => {
  const page = Number(queryString.page) || 1;
  const limit = Number(queryString.limit) || 100;
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

// 將所有功能組合起來，依序執行各個轉換
export const createQueryBuilder = (
  query: Query<any, any>,
  queryString: QueryString
) => {
  return {
    filter() {
      const newQuery = filter(query, queryString);
      return createQueryBuilder(newQuery, queryString);
    },
    sort() {
      const newQuery = sort(query, queryString);
      return createQueryBuilder(newQuery, queryString);
    },
    limitFields() {
      const newQuery = limitFields(query, queryString);
      return createQueryBuilder(newQuery, queryString);
    },
    paginate() {
      const newQuery = paginate(query, queryString);
      return createQueryBuilder(newQuery, queryString);
    },
    // 取得最終的 query
    build() {
      return query;
    },
  };
};
