import os
import requests
from fastapi import FastAPI, Query
from pydantic import BaseModel
import torch
from torchvision import transforms, models
from torch import nn
import numpy as np
from PIL import Image
import cv2
# Remove: import face_recognition
from io import BytesIO
from typing import Optional
from fastapi.responses import JSONResponse
from torchvision.models import ResNeXt50_32X4D_Weights

app = FastAPI()

# Google Drive file ID and download logic
GDRIVE_FILE_ID = "1Sk6n5Bmdv2QRSDZCzOGFdiVlRxa4eckD"
MODEL_PATH = "checkpoint.pt"

def download_from_gdrive(file_id, dest_path):
    URL = "https://docs.google.com/uc?export=download"
    session = requests.Session()
    response = session.get(URL, params={'id': file_id}, stream=True)
    token = None
    for key, value in response.cookies.items():
        if key.startswith('download_warning'):
            token = value
    if token:
        params = {'id': file_id, 'confirm': token}
        response = session.get(URL, params=params, stream=True)
    with open(dest_path, "wb") as f:
        for chunk in response.iter_content(32768):
            if chunk:
                f.write(chunk)

if not os.path.exists(MODEL_PATH):
    print("Downloading model from Google Drive...")
    download_from_gdrive(GDRIVE_FILE_ID, MODEL_PATH)
    print("Download complete.")

# Model definition (from Predict.ipynb)
class Model(nn.Module):
    def __init__(self, num_classes, latent_dim=2048, lstm_layers=1, hidden_dim=2048, bidirectional=False):
        super(Model, self).__init__()
        model = models.resnext50_32x4d(weights=ResNeXt50_32X4D_Weights.IMAGENET1K_V1)
        self.model = nn.Sequential(*list(model.children())[:-2])
        self.lstm = nn.LSTM(latent_dim, hidden_dim, lstm_layers, bidirectional)
        self.relu = nn.LeakyReLU()
        self.dp = nn.Dropout(0.4)
        self.linear1 = nn.Linear(2048, num_classes)
        self.avgpool = nn.AdaptiveAvgPool2d(1)
    def forward(self, x):
        batch_size, seq_length, c, h, w = x.shape
        x = x.view(batch_size * seq_length, c, h, w)
        fmap = self.model(x)
        x = self.avgpool(fmap)
        x = x.view(batch_size, seq_length, 2048)
        x_lstm, _ = self.lstm(x, None)
        return fmap, self.dp(self.linear1(x_lstm[:, -1, :]))

# Load model

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = Model(2).to(device)
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.eval()

# Preprocessing (as in Predict.ipynb)
im_size = 112
mean = [0.485, 0.456, 0.406]
std = [0.229, 0.224, 0.225]
preprocess = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((im_size, im_size)),
    transforms.ToTensor(),
    transforms.Normalize(mean, std)
])

# Load OpenCV Haar Cascade for face detection
CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
face_cascade = cv2.CascadeClassifier(CASCADE_PATH)

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float

def extract_face_from_image(image):
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4)
    if len(faces) == 0:
        return None
    x, y, w, h = faces[0]
    face_img = image[y:y+h, x:x+w, :]
    return preprocess(face_img)

@app.get("/predict", response_model=PredictionResponse)
def predict(
    image_url: Optional[str] = Query(None, description="URL of the image to predict"),
    video_url: Optional[str] = Query(None, description="URL of the video to predict")
):
    try:
        with torch.no_grad():
            if video_url:
                video_path = "temp_video.mp4"
                r = requests.get(video_url)
                with open(video_path, "wb") as f:
                    f.write(r.content)
                vidObj = cv2.VideoCapture(video_path)
                frames = []
                count = 20
                total_frames = int(vidObj.get(cv2.CAP_PROP_FRAME_COUNT))
                frame_idxs = np.linspace(0, max(total_frames-1, 0), count, dtype=int)
                last_face = None
                for idx in frame_idxs:
                    vidObj.set(cv2.CAP_PROP_POS_FRAMES, idx)
                    success, frame = vidObj.read()
                    if not success:
                        continue
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4)
                    if len(faces) > 0:
                        x, y, w, h = faces[0]
                        face_img = frame[y:y+h, x:x+w, :]
                        face_img = cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB)
                        last_face = face_img
                    else:
                        face_img = last_face if last_face is not None else None
                    if face_img is not None:
                        face_tensor = preprocess(face_img)
                        frames.append(face_tensor)
                vidObj.release()
                os.remove(video_path)
                if len(frames) == 0:
                    return JSONResponse(status_code=400, content={"prediction": "error", "confidence": 0.0, "detail": "No faces found in video."})
                while len(frames) < 20:
                    frames.append(frames[-1])
                input_tensor = torch.stack(frames).unsqueeze(0).to(device)
            elif image_url:
                r = requests.get(image_url)
                img = np.array(Image.open(BytesIO(r.content)).convert('RGB'))
                face_tensor = extract_face_from_image(img)
                if face_tensor is None:
                    return JSONResponse(status_code=400, content={"prediction": "error", "confidence": 0.0, "detail": "No face found in image."})
                input_tensor = torch.stack([face_tensor for _ in range(20)]).unsqueeze(0).to(device)
            else:
                return JSONResponse(status_code=400, content={"prediction": "error", "confidence": 0.0, "detail": "No image_url or video_url provided."})
            fmap, logits = model(input_tensor)
            sm = nn.Softmax(dim=1)
            logits = sm(logits)
            _, prediction = torch.max(logits, 1)
            confidence = logits[:, int(prediction.item())].item()
            label = "REAL" if prediction.item() == 1 else "FAKE"
            return {"prediction": label, "confidence": float(confidence)}
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)}) 