"""
PRATHOMIX API router registry.
All routers are auto-discovered from this package.
"""
from .chatbot  import router as chatbot_router
from .leads    import router as leads_router
from .projects import router as projects_router
from .contact  import router as contact_router

__all__ = [
    "chatbot_router",
    "leads_router",
    "projects_router",
    "contact_router",
]
