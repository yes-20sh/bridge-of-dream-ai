from fastapi import APIRouter
from modules.request.routes_request import router as requests_router
from modules.user.routes_user import router as user_router
from modules.auth.routes_auth import router as auth_router
from modules.jobs_search.job_search_route import router as jobs_search_router
from modules.resume_ats.resume_ats_route import router as resume_ats_router
from modules.save_jobs.routes_save_jobs import router as save_jobs_router
from modules.connections.routes_connections import router as connections_router
from modules.apply_link.apply_link_route import router as apply_link_router
from modules.job_applied.job_applied_route import router as job_applied_router
from modules.general.general_route import router as general_router

router = APIRouter()

# Include module routers
router.include_router(requests_router)
router.include_router(user_router)
router.include_router(auth_router)
router.include_router(jobs_search_router)
router.include_router(resume_ats_router)
router.include_router(save_jobs_router)
router.include_router(connections_router)
router.include_router(apply_link_router)
router.include_router(job_applied_router)
router.include_router(general_router)
