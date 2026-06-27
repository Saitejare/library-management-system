const buildBookQuery = (query) => {
  const filter = {};

  if (query.search) {
    const regex = new RegExp(query.search, 'i');
    filter.$or = [
      { title: regex },
      { author: regex },
      { isbn: regex },
    ];
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.language) {
    filter.language = query.language;
  }

  if (query.year) {
    const year = parseInt(query.year, 10);
    if (!Number.isNaN(year)) {
      filter.publishedYear = year;
    }
  }

  return filter;
};

const getSort = (sortBy, order) => {
  const allowed = ['title', 'author', 'publishedYear', 'createdAt'];
  const sortField = allowed.includes(sortBy) ? sortBy : 'createdAt';
  const sortOrder = order === 'asc' ? 1 : -1;
  return { [sortField]: sortOrder };
};

module.exports = {
  buildBookQuery,
  getSort,
};
