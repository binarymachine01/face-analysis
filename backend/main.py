import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import boto3

import os
from dotenv import load_dotenv

load_dotenv()


rekognition_client = boto3.client('rekognition',
                                  aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                                  aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                                  region_name=os.getenv("AWS_REGION"))

app = FastAPI()

# Endpoint to analyze face in image
@app.post("/analyze-face")
async def analyze_face(file: UploadFile = File(...)):
    # Read the image file
    image_bytes = await file.read()

    try:
        # Call AWS Rekognition to detect faces
        response = rekognition_client.detect_faces(
            Image={'Bytes': image_bytes},
            Attributes=['ALL']  # This includes all available facial attributes
        )

        # Parse Rekognition response and structure result
        faces = response.get('FaceDetails', [])
        results = []

        for face in faces:
            result = {
                "bounding_box": face['BoundingBox'],
                "confidence": face['Confidence'],
                "emotion": face['Emotions'],
                "smile": face.get('Smile', {}).get('Value', 'Not detected'),
                "age_range": face['AgeRange'],
                "gender": face.get('Gender', {}).get('Value', 'Not detected'),
                "mouth_open": face.get('MouthOpen', {}).get('Value', 'Not detected'),
                "eyes_open": face.get('EyesOpen', {}).get('Value', 'Not detected')
            }
            results.append(result)

        return JSONResponse(content={"faces": results})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


if __name__ == "__main__":
    uvicorn.run(app=app, host='127.0.0.1', port=8081)