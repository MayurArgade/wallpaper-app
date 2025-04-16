from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cloudinary
import cloudinary.uploader
import json
import logging

# Cloudinary Configuration
cloudinary.config( 
    cloud_name="dvpvasmkm",  # Your Cloudinary Cloud Name
    api_key="352899519153293",  # Your Cloudinary API Key
    api_secret="S7b33DCofv_oEf5xNICVVXpXxhc",  # Replace with your actual Cloudinary API secret
    secure=True
)

# Initialize FastAPI app
app = FastAPI()

# Adding CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, you can restrict this to specific domains for security
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

WALLPAPER_DB = "wallpapers.json"

# Load wallpapers from JSON file
def load_wallpapers():
    try:
        with open(WALLPAPER_DB, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return []

# Save wallpapers to JSON file
def save_wallpapers(data):
    with open(WALLPAPER_DB, "w") as file:
        json.dump(data, file, indent=4)

# Ensure the file is an image and handle file type validation
def is_valid_image(file: UploadFile) -> bool:
    allowed_extensions = ["jpg", "jpeg", "png", "webp"]
    file_extension = file.filename.split(".")[-1].lower()
    return file_extension in allowed_extensions

# Upload wallpaper route
@app.post("/api/upload/")
async def upload_wallpaper(
    file: UploadFile = File(...), 
    premium: str = Form(...),
):
    if not is_valid_image(file):
        raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")

    try:
        # Upload file to Cloudinary with transformations
        upload_result = cloudinary.uploader.upload(
            file.file, 
            format="webp",  # Ensure the image is in WebP format for optimization
            quality="auto",  # Automatically adjust quality for optimization
            width=800,  # Resize image to a maximum width (change as necessary)
            crop="limit"  # Ensure image is cropped within the given dimensions
        )
        cloudinary_url = upload_result['secure_url']

        # Convert "premium" field to boolean
        is_premium = premium.lower() == "true"

        # Add to the wallpaper database (JSON)
        wallpapers = load_wallpapers()
        wallpapers.append({"url": cloudinary_url, "premium": is_premium})
        save_wallpapers(wallpapers)

        return {
            "message": "Wallpaper uploaded successfully",
            "url": cloudinary_url,
            "premium": is_premium
        }
    except Exception as e:
        logging.error(f"Error uploading wallpaper: {e}")
        return {"message": "Error uploading wallpaper", "error": str(e)}

# Get wallpapers route
@app.get("/api/wallpapers")
async def get_wallpapers():
    try:
        wallpapers = load_wallpapers()  # Load from the JSON file
        return wallpapers
    except Exception as e:
        logging.error(f"Error fetching wallpapers: {e}")
        return {"message": "Error fetching wallpapers", "error": str(e)}
