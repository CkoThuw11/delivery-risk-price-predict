# Database Setup
Copy scripts in setup_database.sql --> Running it within MySQL Workbench

Don't hesitate to ask for help if you need 

# Backend Setup 

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

## Create Migrations
```bash
python manage.py makemigrations
```

## Apply Migrations
```bash
python manage.py migrate
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

# Frontend Setup
## Navigate to the frontend directory and install dependencies:
```bash
cd frontend
```
## Countinue run the following command
```bash
npm install
```
## Run the React development server:
```bash
npm run dev
```
NOTE: MAKE SURE YOU HAVE ALREADY INSTALL Nodejs 
The frontend server will be available at http://localhost:5173
