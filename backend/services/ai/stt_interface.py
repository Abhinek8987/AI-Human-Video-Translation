from abc import ABC, abstractmethod
from typing import List

class STTResult:
    def __init__(self, text: str, words: int):
        self.text = text
        self.words = words

class STTInterface(ABC):
    @abstractmethod
    async def transcribe(self, audio_path: str, language: str | None = None) -> STTResult:
        raise NotImplementedError

class MockSTT(STTInterface):
    async def transcribe(self, audio_path: str, language: str | None = None) -> STTResult:
        # Returns a mocked transcription
        text = "Hello world. This is a mock transcription."
        return STTResult(text=text, words=len(text.split()))
