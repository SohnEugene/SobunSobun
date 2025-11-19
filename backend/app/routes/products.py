from fastapi import APIRouter, HTTPException, status, UploadFile, File
from typing import List
from app.models import (
    RegisterProductRequest,
    RegisterProductResponse,
    Product
)
from app.services.firebase import firebase_service
from app.services.s3 import S3Service

router = APIRouter(
    prefix="/products",
    tags=["products"]
)


@router.get("/", response_model=List[Product])
async def get_all_products():
    """
    Get all products

    This endpoint retrieves all products from the products collection.

    Returns:
        List of Product objects with full details

    Raises:
        ProductDataCorruptedException: 500 if product data is corrupted
        ProductException: 500 for other errors
    """
    products = firebase_service.get_all_products()
    return products


@router.post("/", response_model=RegisterProductResponse, status_code=status.HTTP_201_CREATED)
async def register_product(product_request: RegisterProductRequest):
    """
    Create a new product

    This endpoint creates a new product in the products collection.
    The server generates a sequential product_id (prod_001, prod_002, ...).

    Args:
        product_request: Product creation data
            - name: Product name
            - price: Product price
            - description: Product description (optional)
            - image_url: Product image URL (optional)
            - tags: Product tags (optional)

    Returns:
        RegisterProductResponse with pid (product_id)

    Raises:
        ProductException: 500 for product creation errors
    """
    product_data = product_request.model_dump()
    product_id = firebase_service.register_product(product_data)

    return RegisterProductResponse(
        pid=product_id
    )


@router.get("/{pid}", response_model=Product)
async def get_product_by_id(pid: str):
    """
    Get a product by ID

    This endpoint retrieves detailed information about a specific product.

    Args:
        product_id: Product ID (e.g., "prod_001")

    Returns:
        Product object with full details

    Raises:
        ProductNotFoundException: 404 if product not found
        ProductException: 500 for other errors
    """
    product = firebase_service.get_product_by_id(pid)
    return product

@router.put("/{pid}", status_code=status.HTTP_200_OK)
async def update_product(pid: str, product_request: RegisterProductRequest):
    """
    Update a product by ID

    Args:
        pid: Product ID (e.g., "prod_001")
        product_request: Updated product data

    Returns:
        Success message

    Raises:
        ProductNotFoundException: 404 if product not found
        ProductException: 500 for other errors
    """
    product_data = product_request.model_dump()
    firebase_service.update_product(pid, product_data)
    return {"message": f"Product {pid} updated successfully"}

@router.delete("/{pid}", status_code=status.HTTP_200_OK)
async def delete_product(pid: str):
    """
    Delete a product by ID

    Args:
        pid: Product ID (e.g., "prod_001")

    Returns:
        Success message

    Raises:
        ProductNotFoundException: 404 if product not found
        ProductException: 500 for other errors
    """
    firebase_service.delete_product(pid)
    return {"message": f"Product {pid} deleted successfully"}


@router.post("/{pid}/image", status_code=status.HTTP_200_OK)
async def upload_product_image(pid: str, file: UploadFile = File(...)):
    """
    Upload an image for a product to S3

    Args:
        pid: Product ID (e.g., "prod_001")
        file: Image file to upload

    Returns:
        Success message with S3 key

    Raises:
        HTTPException: 404 if product not found
        HTTPException: 500 if upload fails
    """
    # Verify product exists
    product = firebase_service.get_product_by_id(pid)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product {pid} not found")

    # Determine content type
    content_type = file.content_type or "image/png"

    # Create S3 key
    file_extension = file.filename.split(".")[-1] if file.filename else "png"
    s3_key = f"products/{pid}.{file_extension}"

    # Upload to S3
    success = S3Service.upload_file(file.file, s3_key, content_type)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to upload image to S3")

    # Update product with S3 key
    firebase_service.update_product(pid, {"image_key": s3_key})

    return {"message": f"Image uploaded successfully", "s3_key": s3_key}


@router.get("/{pid}/image-url", status_code=status.HTTP_200_OK)
async def get_product_image_url(pid: str, expires_in: int = 3600):
    """
    Get presigned URL for product image

    Args:
        pid: Product ID (e.g., "prod_001")
        expires_in: URL expiration time in seconds (default: 3600)

    Returns:
        Presigned URL for the product image

    Raises:
        HTTPException: 404 if product or image not found
        HTTPException: 500 if URL generation fails
    """
    # Get product to find image key
    product = firebase_service.get_product_by_id(pid)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product {pid} not found")

    # Get image key from product
    image_key = product.get("image_key") if isinstance(product, dict) else getattr(product, "image_key", None)
    if not image_key:
        # Try default key pattern
        image_key = f"products/{pid}.png"

    # Generate presigned URL
    url = S3Service.generate_presigned_url(image_key, expires_in)
    if not url:
        raise HTTPException(status_code=500, detail="Failed to generate presigned URL")

    return {"url": url, "expires_in": expires_in}
