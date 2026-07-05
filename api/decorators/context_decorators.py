from functools import wraps
import inspect
from typing import Callable, Any
from fastapi import Request
from fastapi.concurrency import run_in_threadpool
import uuid

def with_context(func: Callable) -> Callable:
    """
    Decorator to attach common request context (like request ID, client IP, etc.) 
    to request.state.context.
    Requires 'request: Request' to be in the endpoint's parameters.
    """
    @wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:
        request: Request = kwargs.get("request")
        if not request:
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
                    
        if not request:
            raise RuntimeError("The @with_context decorator requires a 'request: Request' parameter in the endpoint.")

        # Build generic request context
        context_data = {
            "request_id": request.headers.get("X-Request-ID", str(uuid.uuid4())),
            "user_agent": request.headers.get("User-Agent"),
            "client_ip": request.client.host if request.client else None,
            "path": request.url.path,
            "method": request.method,
        }
        
        # Attach context to request state
        request.state.context = context_data
        
        if inspect.iscoroutinefunction(func):
            return await func(*args, **kwargs)
        else:
            return await run_in_threadpool(func, *args, **kwargs)
        
    return wrapper
