from pydantic import BaseModel

class HeaderMetricsResponse(BaseModel):
    network: int
    applied: int
    saved: int
