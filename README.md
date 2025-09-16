# Lung Vision

LungVision is a transformative, AI-powered initiative aimed at revolutionizing early lung cancer detection through the integration of multi-modal data. The platform fuses imaging data (PET/CT) and molecular biomarkers to enhance diagnostic accuracy via deep learning. Central to LungVision is a Clinical Decision Support System (CDSS) that performs both classification (malignancy detection) and regression (risk scoring), providing real-time, explainable insights to assist clinicians at the point of care.

## Installation
```
cd Lung-Vision
npm install
npm run dev
```
It will run the frontend on `localhost:5173/`

### Run Model Pipeline
- Unizp the `All_Files/` directory into the `backend/` directory
- In `backend/` directory create and activate python virtual envireonment (for windows) and install requirements
```
python -m venv env
env/Scripts/activate
pip install -r requirements.txt
cd All_Files
pip install -r requirements.txt
```
- Install PyTorch + torchvision (CPU build, easiest to get started):
```
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```
- Install imaging and plotting libs used by the API:
```
pip install opencv-python pydicom SimpleITK numpy pandas matplotlib seaborn
```
_Note: If you have a CUDA GPU and want a faster build, install the appropriate CUDA wheel for torch/vision from PyTorch’s site instead of the CPU command above._

- Start the API server:
Go to the All_Files directory and run
```
python .\start_server.py --host 127.0.0.1 --port 8090
```
your server will be running on `localhost` port `8090`.

### Run backend server
- Go to the `backend/lung_vision`
- Run the migrations
```
python manage.py makemigrations
python manage.py migrate
```
- Start the server
```
python manage.py runserver
```
It will start the server on `localhost` on port `8000`

