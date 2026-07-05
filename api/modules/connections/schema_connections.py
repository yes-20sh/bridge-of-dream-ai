from pydantic import BaseModel

class ConnectionDto(BaseModel):
    id: int
    name: str
    profile: str
    job: str
    company: str
    location: str
    email: str
    number: str
    lprofile: str
    linkedin_link: str

    class Config:
        from_attributes = True

class ConnectionCreate(BaseModel):
    target_linkedin_url: str
    name: str
    profile: str
    job: str
    company: str
    location: str
    email: str
    number: str
    lprofile: str
    linkedin_link: str

class ConnectionResponse(BaseModel):
    message: str
