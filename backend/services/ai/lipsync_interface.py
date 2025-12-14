from abc import ABC, abstractmethod

class LipSyncInterface(ABC):
    @abstractmethod
    async def apply(self, video_path: str, audio_path: str, out_path: str) -> str:
        raise NotImplementedError

class MockLipSync(LipSyncInterface):
    async def apply(self, video_path: str, audio_path: str, out_path: str) -> str:
        with open(out_path, "wb") as f:
            f.write(b"MOCK_LIPSYNC_VIDEO")
        return out_path
