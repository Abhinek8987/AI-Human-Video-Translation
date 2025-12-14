from pydantic import BaseModel
from typing import Optional, List

class User(BaseModel):
    user_id: str
    email: str

class JobHistoryItem(BaseModel):
    job_id: str
    target_language: str
    created_at: str
    duration_sec: int
    words: int
    status: str

class Dashboard(BaseModel):
    total_videos: int
    total_words: int
    total_time_sec: int
    history: List[JobHistoryItem]
