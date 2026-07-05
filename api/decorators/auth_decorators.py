from functools import wraps
import inspect
from typing import Callable, Any
from fastapi import Request, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from shared.security.jwt_handler import verify_token

def _get_token_from_request(request: Request) -> str:
    """Extract token from cookies or Authorization header."""
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    return token

def public(func: Callable) -> Callable:
    """
    Decorator for public routes. 
    Effectively a no-op but useful for explicit documentation of route access.
    """
    @wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:
        if inspect.iscoroutinefunction(func):
            return await func(*args, **kwargs)
        else:
            return await run_in_threadpool(func, *args, **kwargs)
    return wrapper

def user(func: Callable) -> Callable:
    """
    Decorator to ensure the user is authenticated.
    Requires 'request: Request' to be in the endpoint's parameters.
    """
    @wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:
        request: Request = kwargs.get("request")
        if not request:
            # Try to find request in args
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
        
        if not request:
            raise RuntimeError("The @user decorator requires a 'request: Request' parameter in the endpoint.")

        token = _get_token_from_request(request)
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
            )
        
        payload = verify_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
            
        # Optional: You can attach the user payload to the request state
        request.state.user = payload
        
        if inspect.iscoroutinefunction(func):
            return await func(*args, **kwargs)
        else:
            return await run_in_threadpool(func, *args, **kwargs)
    return wrapper

def admin(func: Callable) -> Callable:
    """
    Decorator to ensure the user is an admin.
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
            raise RuntimeError("The @admin decorator requires a 'request: Request' parameter in the endpoint.")

        token = _get_token_from_request(request)
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
            )
        
        payload = verify_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
            
        # TODO: Implement your actual admin role check here.
        # Since UserModel doesn't currently have a 'role' field, this is a placeholder check.
        # Example: if payload.get("role") != "admin":
        user_email = payload.get("email", "")
        is_admin = user_email.endswith("@admin.com") # PLACEHOLDER LOGIC
        
        if not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions (Admin required)",
            )
            
        request.state.user = payload
        if inspect.iscoroutinefunction(func):
            return await func(*args, **kwargs)
        else:
            return await run_in_threadpool(func, *args, **kwargs)
    return wrapper
