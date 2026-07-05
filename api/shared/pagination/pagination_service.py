from sqlalchemy.orm import Query
from math import ceil
from typing import TypeVar, Sequence
from .pagination_schema import PaginationParams, PaginatedResponse

T = TypeVar("T")

def paginate_query(query: Query, params: PaginationParams) -> PaginatedResponse[T]:
    """
    Paginate a SQLAlchemy query.
    
    Args:
        query: The SQLAlchemy query object to paginate
        params: Pagination parameters (page, limit)
        
    Returns:
        A PaginatedResponse object containing the data and pagination metadata
    """
    total = query.count()
    total_pages = ceil(total / params.limit) if params.limit > 0 else 0
    
    offset = (params.page - 1) * params.limit
    
    # Execute query with offset and limit
    items = query.offset(offset).limit(params.limit).all()
    
    return PaginatedResponse(
        total=total,
        page=params.page,
        limit=params.limit,
        total_pages=total_pages,
        data=items
    )
