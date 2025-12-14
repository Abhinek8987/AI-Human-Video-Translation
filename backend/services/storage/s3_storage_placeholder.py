# Placeholder for AWS S3 storage implementation.
# Implement with boto3 and presigned URLs for production use.

class S3Storage:
    def __init__(self, bucket: str, base_prefix: str = ""):
        self.bucket = bucket
        self.base_prefix = base_prefix

    def save(self, rel_path: str, fileobj):
        raise NotImplementedError("Implement S3 upload here")

    def delete(self, rel_path: str):
        raise NotImplementedError

    def path(self, rel_path: str) -> str:
        return f"s3://{self.bucket}/{self.base_prefix}{rel_path}"
