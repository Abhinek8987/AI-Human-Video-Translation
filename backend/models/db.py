# Placeholder for MongoDB or other DB integration.
# For demo, main.py uses in-memory stores.

from typing import Any

class InMemoryDB:
    def __init__(self):
        self.users = {}
        self.jobs = {}
        self.history = {}

DB = InMemoryDB()
