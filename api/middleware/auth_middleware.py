from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from shared.security.jwt_handler import verify_token

class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, public_paths=None):
        super().__init__(app)
        self.public_paths = public_paths or ["/api/auth/signin", "/api/auth/forgot-password", "/api/auth/verify-otp", "/api/auth/reset-password", "/docs", "/openapi.json", "/api/jobs/search", "/api/requests", "/api/general/cron"]

    async def dispatch(self, request: Request, call_next):
        # Skip validation for public paths and OPTIONS requests
        if request.method == "OPTIONS" or any(request.url.path.startswith(path) for path in self.public_paths):
            return await call_next(request)

        # Retrieve the token from Authorization header or cookies
        auth_header = request.headers.get("Authorization")
        token = None
        
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        else:
            token = request.cookies.get("access_token")

        if not token:
            return JSONResponse(
                status_code=401,
                content={"detail": "Not authenticated. Token missing."}
            )

        # Verify the token
        payload = verify_token(token)
        if not payload:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or expired token."}
            )

        # Inject the payload (user info) into the request state
        request.state.user = payload

        # Process the request
        response = await call_next(request)
        return response
