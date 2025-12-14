from abc import ABC, abstractmethod

class TTSInterface(ABC):
    @abstractmethod
    async def synthesize(self, text: str, voice_sample_path: str | None, emotion: str | None, out_path: str) -> str:
        """Generate audio file from text, return output path."""
        raise NotImplementedError

class MockTTS(TTSInterface):
    async def synthesize(self, text: str, voice_sample_path: str | None, emotion: str | None, out_path: str) -> str:
        with open(out_path, "wb") as f:
            f.write(f"MOCK_WAV emotion={emotion or 'neutral'} text_len={len(text)}".encode("utf-8"))
        return out_path
