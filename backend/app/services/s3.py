import os
import boto3
from botocore.exceptions import ClientError
from datetime import datetime

# 환경변수로 AWS 키/시크릿과 버킷 정보 관리
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "ap-northeast-2")
BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "almaeng2-images")

# boto3 S3 클라이언트 생성
s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION,
)


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
            s3_client.upload_fileobj(
                Fileobj=file_obj,
                Bucket=BUCKET_NAME,
                Key=key,
                ExtraArgs={"ContentType": content_type, "ACL": "private"}  # private 유지
            )
            return True
        except ClientError as e:
            print(f"S3 업로드 에러: {e}")
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
            url = s3_client.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": BUCKET_NAME, "Key": key},
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            print(f"Presigned URL 생성 에러: {e}")
            return None
