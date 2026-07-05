import cloudinary.uploader
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException, Depends
import io
import json
import docx
from typing import Optional
from shared.database.model_user import UserModel
from shared.database.model_resume import ResumeModel
from modules.user.schema_user import UserProfileUpdate
from core.supabase import get_db

class UserService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def update_user_profile(self, user_id: int, profile_data: UserProfileUpdate):
        user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        update_data = profile_data.dict(exclude_unset=True)
        if "jobRoles" in update_data:
            user.job_roles = update_data.pop("jobRoles")
        if "jobTypes" in update_data:
            user.job_types = update_data.pop("jobTypes")
        
        for key, value in update_data.items():
            setattr(user, key, value)
            
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_user_profile(self, user_id: int):
        user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        latest_resume = self.db.query(ResumeModel).filter(ResumeModel.user_id == user_id).order_by(ResumeModel.created_at.desc()).first()

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "mobile": user.mobile,
            "jobRoles": user.job_roles,
            "jobTypes": user.job_types,
            "locations": user.locations,
            "companies": user.companies,
            "resume": latest_resume
        }

    async def process_and_save_resume(self, user_id: int, file: UploadFile):
        # 1. Read file content
        content = await file.read()
        
        # 2. Upload to Cloudinary
        try:
            # We upload as 'raw' so it doesn't get processed as an image if it's a docx/pdf
            upload_result = cloudinary.uploader.upload(content, resource_type="raw", public_id=f"user_{user_id}_{file.filename}")
            cloudinary_url = upload_result.get("secure_url")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {str(e)}")
            
        # 3. Extract Text
        extracted_text = ""
        filename_lower = file.filename.lower()
        
        try:
            if filename_lower.endswith((".docx", ".doc")) and docx:
                doc = docx.Document(io.BytesIO(content))
                extracted_text = "\n".join(paragraph.text for paragraph in doc.paragraphs)
            else:
                extracted_text = "Text extraction not supported for this format or parsing library not installed."
        except Exception as e:
            extracted_text = f"Failed to extract text: {str(e)}"
            
        # Store extracted info as JSON
        extracted_data = {
            "text": extracted_text,
            "filename": file.filename
        }
        
        # 4. Save to DB
        resume = ResumeModel(
            user_id=user_id,
            cloudinary_url=cloudinary_url,
            extracted_data=extracted_data
        )
        
        self.db.add(resume)
        self.db.commit()
        self.db.refresh(resume)
        
        return resume

    async def update_user_profile_and_resume(self, user_id: int, profile_data: Optional[str], file: Optional[UploadFile]):
        if profile_data:
            import json
            profile_dict = json.loads(profile_data)
            self.update_user_profile(user_id, UserProfileUpdate(**profile_dict))
        
        if file:
            await self.process_and_save_resume(user_id, file)
            
        return {
            "message": "Profile updated successfully",
            "code": 200
        }
