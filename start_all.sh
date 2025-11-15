#!/bin/zsh

# --- 一键启动所有服务 ---
#
# 使用方法:
# 1. 将此脚本放在您的项目根目录中 (包含 smart-seat-backend 和 smart-seat 的地方)。
# 2. 在终端中运行 `chmod +x start_all.sh` 使其可执行。
# 3. 运行 `./start_all.sh` 来启动所有服务。

echo "🚀  开始启动所有智能座位预定服务..."
echo "----------------------------------------"

# 获取脚本所在的目录作为项目根目录
PROJECT_ROOT=$(pwd)
BACKEND_DIR="$PROJECT_ROOT/smart-seat-backend"
FRONTEND_DIR="$PROJECT_ROOT/smart-seat"

# --- 启动 Python 后端服务 (在 rl_env_conda 环境中) ---

# 使用 conda run -n <环境名> <命令> 是在脚本中运行conda环境的最佳方式
# 它会自动处理环境激活，并且更可靠。

echo "🐍  [1/6] 启动 ARIMA 服务..."
cd "$BACKEND_DIR/ARIMA"
conda run -n rl_env_conda python app.py &

echo "🧠  [2/6] 启动 Model Service (seat-predict)..."
cd "$BACKEND_DIR/model-service"
conda run -n rl_env_conda python seat-predict.py &

echo "🤖  [3/6] 启动 RL API 服务 (Uvicorn)..."
cd "$BACKEND_DIR/RL"
conda run -n rl_env_conda python -m uvicorn rl_api:app --port 8000 --reload &


# --- 启动 Node.js 后端服务 ---

echo "🟩  [4/6] 启动 RL 目录下的 Node App (app.js)..."
cd "$BACKEND_DIR/RL"
node app.js &

echo "🟩  [5/6] 启动 Backend 主服务 (index.js)..."
cd "$BACKEND_DIR"
node index.js &


# --- 启动 Node.js 前端服务 ---

echo "⚛️   [6/6] 启动 React 前端 (npm start)..."
cd "$FRONTEND_DIR"
npm start &

echo "----------------------------------------"
echo "✅  所有服务已在后台启动！"
echo "您可以关闭此终端窗口，服务将继续运行。"
echo "要停止所有服务，请运行 ./stop_all.sh 脚本。"