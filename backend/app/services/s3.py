import os
import boto3
from botocore.exceptions import ClientError
from datetime import datetime

# S3 클라이언트를 lazy initialization으로 생성
_s3_client = None

def get_s3_client():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_REGION", "ap-northeast-2"),
        )
    return _s3_client

def get_bucket_name():
    return os.getenv("S3_BUCKET_NAME", "almaeng2")


class S3Service:
    @staticmethod
    def upload_file(file_obj, key: str, content_type: str = "image/png"):
        """
        S3 버킷에 파일 업로드
        :param file_obj: 파일 객체 (예: FastAPI UploadFile.file)
        :param key: S3 내 저장 경로, 예: 'products/product1.png'
        :param content_type: MIME 타입
        :return: 업로드 성공 여부
        """
        try:
            client = get_s3_client()
            bucket = get_bucket_name()
            print(f"S3 업로드 시도: bucket={bucket}, key={key}")
            client.upload_fileobj(
                Fileobj=file_obj,
                Bucket=bucket,
                Key=key,
                ExtraArgs={"ContentType": content_type}
            )
            print(f"S3 업로드 성공: {key}")
            return True
        except ClientError as e:
            print(f"S3 업로드 에러: {e}")
            return False
        except Exception as e:
            print(f"S3 업로드 일반 에러: {type(e).__name__}: {e}")
            return False

    @staticmethod
    def generate_presigned_url(key: str, expires_in: int = 3600):
        """
        S3 presigned URL 생성
        :param key: S3 내 저장 경로
        :param expires_in: 유효기간(초)
        :return: presigned URL or None
        """
        try:
            url = get_s3_client().generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": get_bucket_name(), "Key": key},
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            print(f"Presigned URL 생성 에러: {e}")
            return None
