import AppError from './AppError.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const paginate = (page, limit) => {
    const parsedPage = Number(page ?? DEFAULT_PAGE);
    const parsedLimit = Number(limit ?? DEFAULT_LIMIT);

    if(!Number.isInteger(parsedPage) || parsedPage < 1) {
        throw new AppError('Invalid page parameter', 400);
    }

    if(!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > MAX_LIMIT) {
        throw new AppError('Invalid limit parameter', 400);
    }

    return {
        page: parsedPage,
        limit: parsedLimit,
        skip: (parsedPage - 1) * parsedLimit,
    };
};

export const buildPaginationMeta = (page, limit, totalCount) => {
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    return {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
};

export default paginate;