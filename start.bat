@echo off
echo Starting Movie Recommendation System...
echo.
echo Installing dependencies...
call npm install
echo.
echo Installing client dependencies...
cd client
call npm install
cd ..
echo.
echo Starting the application...
echo Frontend will be available at: http://localhost:5173
echo Backend API will be available at: http://localhost:5000
echo.
call npm run dev
