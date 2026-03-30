from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth as auth_router
from routers import posts as posts_router
from routers import upload as upload_router
from routers import themes as themes_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="UniRoast API", version="1.0.0")
app.include_router(auth_router.router)
app.include_router(posts_router.router)
app.include_router(upload_router.router)
app.include_router(themes_router.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://uniroast.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "UniRoast API is running! 🚀"}