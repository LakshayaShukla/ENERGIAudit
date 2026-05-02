from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import engine, Base, SessionLocal
from app.routers import auth, energy, audits, savings, notifications, roi, admin, recommendations, reports, badges
from app.models import User
import seed

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            print("Database is empty. Running auto-seeder...")
            seed.seed()
    except Exception as e:
        print(f"Auto-seed failed: {e}")
    finally:
        db.close()
    yield

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EnergiAudit API",
    description="Energy Intelligence & Optimization Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(energy.router)
app.include_router(audits.router)
app.include_router(savings.router)
app.include_router(notifications.router)
app.include_router(roi.router)
app.include_router(admin.router)
app.include_router(recommendations.router)
app.include_router(reports.router)
app.include_router(badges.router)


@app.get("/")
def root():
    return {"message": "EnergiAudit API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
