import os
import shutil
from typing import BinaryIO

class LocalStorage:
    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    def save(self, rel_path: str, fileobj: BinaryIO):
        abs_path = os.path.join(self.base_dir, rel_path)
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        with open(abs_path, 'wb') as f:
            shutil.copyfileobj(fileobj, f)
        return abs_path

    def delete(self, rel_path: str):
        abs_path = os.path.join(self.base_dir, rel_path)
        if os.path.exists(abs_path):
            os.remove(abs_path)

    def path(self, rel_path: str) -> str:
        return os.path.join(self.base_dir, rel_path)
