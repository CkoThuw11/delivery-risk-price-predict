# Backend Setup (Django)

## Navigate to the project directory
```bash
cd delivery-risk-price-predict
```

## Create and activate a virtual environment:
```bash
python -m venv venv
```
Then activate them
```bash
venv\Scripts\activate
```

## Install backend dependencies:
```bash
pip install -r requirements.txt
```

## Set up the Django project
```bash
django-admin startproject backend
```

## Run the Django development server:
```bash
cd backend
python manage.py runserver
```
The backend server will be available at http://localhost:8000.

## Navigate to the project root directory:
```bash
cd ..
```

# Create a React app 
```bash
npm create vite@latest frontend -- --template react
```
Framework --> React
Variant --> Javascript

## Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```
## Run the React development server:
```bash
npm run dev
```

The frontend server will be available at http://localhost:5173

NOTE: MAKE SURE YOU HAVE ALREADY INSTALL Nodejs 