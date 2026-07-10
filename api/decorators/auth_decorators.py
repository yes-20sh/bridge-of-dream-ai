from functools import wraps
import inspect
from typing import Callable, Any
from fastapi import Request, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from shared.security.jwt_handler import verify_token
from enums.user_role import UserRole

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

def requires_role(allowed_roles: list[UserRole]) -> Callable:
    """
    Decorator to ensure the user is authenticated and has one of the allowed roles.
    Requires 'request: Request' to be in the endpoint's parameters.
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            request: Request = kwargs.get("request")
            if not request:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
                        
            if not request:
                raise RuntimeError("The @requires_role decorator requires a 'request: Request' parameter in the endpoint.")

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
                
            user_role_str = payload.get("role")
            
            # Fallback for older tokens or special admin conditions if needed
            if not user_role_str:
                user_email = payload.get("email", "")
                if UserRole.ADMIN in allowed_roles and user_email.endswith("@admin.com"):
                    user_role_str = UserRole.ADMIN.value
            
            if not user_role_str or user_role_str not in [r.value for r in allowed_roles]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Not enough permissions. Required roles: {[r.value for r in allowed_roles]}",
                )
                
            request.state.user = payload
            if inspect.iscoroutinefunction(func):
                return await func(*args, **kwargs)
            else:
                return await run_in_threadpool(func, *args, **kwargs)
        return wrapper
    return decorator
