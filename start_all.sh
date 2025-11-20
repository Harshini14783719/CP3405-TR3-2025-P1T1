#!/bin/zsh

# --- One-Click Start for All Services ---
#
# Usage:
# 1. Put this script in your project root directory (the one that contains smart-seat-backend and smart-seat).
# 2. Run `chmod +x start_all.sh` in the terminal to make it executable.
# 3. Run `./start_all.sh` to start all services.

echo "🚀  Starting all Smart Seat Reservation services..."
echo "----------------------------------------"

# Use the directory where this script is executed as the project root
PROJECT_ROOT=$(pwd)
BACKEND_DIR="$PROJECT_ROOT/smart-seat-backend"
FRONTEND_DIR="$PROJECT_ROOT/smart-seat"

# --- Start Python backend services (in rl_env_conda environment) ---

# Using `conda run -n <env_name> <command>` is the recommended way to run a conda environment inside scripts.
# It automatically handles environment activation and is more reliable.

echo "🐍  [1/6] Starting ARIMA service..."
cd "$BACKEND_DIR/ARIMA"
conda run -n rl_env_conda python app.py &

echo "🧠  [2/6] Starting Model Service (seat-predict)..."
cd "$BACKEND_DIR/model-service"
conda run -n rl_env_conda python seat-predict.py &

echo "🤖  [3/6] Starting RL API service (Uvicorn)..."
cd "$BACKEND_DIR/RL"
conda run -n rl_env_conda python -m uvicorn rl_api:app --port 8000 --reload &


# --- Start Node.js backend services ---

echo "🟩  [4/6] Starting Node app in RL directory (app.js)..."
cd "$BACKEND_DIR/RL"
node app.js &

echo "🟩  [5/6] Starting main backend service (index.js)..."
cd "$BACKEND_DIR"
node index.js &


# --- Start Node.js frontend service ---

echo "⚛️   [6/6] Starting React frontend (npm start)..."
cd "$FRONTEND_DIR"
npm start &

echo "----------------------------------------"
echo "✅  All services have been started in the background!"
echo "You can close this terminal window; the services will keep running."
echo "To stop all services, please run the ./stop_all.sh script."
