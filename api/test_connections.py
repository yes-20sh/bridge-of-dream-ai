import sys
import os

# Add api to path
sys.path.append('e:/bridge-of-dream-ai/api')

from core.supabase import get_db, SessionLocal
from modules.connections.services_connections import ConnectionsService
from shared.pagination.pagination_schema import PaginationParams

db = SessionLocal()
service = ConnectionsService(db)

try:
    params = PaginationParams(page=1, limit=10)
    result = service.get_saved_connections(user_id=1, params=params)
    print("Success:", result)
except Exception as e:
    print("Error:", type(e))
    import traceback
    traceback.print_exc()
