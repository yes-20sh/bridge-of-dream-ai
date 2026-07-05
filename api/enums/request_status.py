from enum import Enum

class RequestStatus(str, Enum):
    PENDING = "pending"
    APPROVE = "approve"
    REJECT = "reject"
