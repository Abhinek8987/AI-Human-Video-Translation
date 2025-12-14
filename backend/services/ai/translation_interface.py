from abc import ABC, abstractmethod

class TranslationInterface(ABC):
    @abstractmethod
    async def translate(self, text: str, target_language: str) -> str:
        raise NotImplementedError

class MockTranslator(TranslationInterface):
    async def translate(self, text: str, target_language: str) -> str:
        return f"[{target_language}] {text}"
