from abc import ABC, abstractmethod

class EmotionInterface(ABC):
    @abstractmethod
    async def detect(self, audio_path: str) -> str:
        """Return a coarse emotion label (e.g., neutral, happy, sad, serious)."""
        raise NotImplementedError

class MockEmotion(EmotionInterface):
    async def detect(self, audio_path: str) -> str:
        return "neutral"
