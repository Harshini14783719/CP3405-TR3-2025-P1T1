from flask import Flask, request, jsonify
import pandas as pd
import os

app = Flask(__name__)

dataset_path = "structured_booking_data.csv"
if os.path.exists(dataset_path):
    historical_df = pd.read_csv(dataset_path)
else:
    # 初始化时只保留目标格式的列：timestamp、seat_id、status
    historical_df = pd.DataFrame(columns=["timestamp", "seat_id", "status"])

# Define the interface to receive new reservation data
@app.route('/add_booking', methods=['POST'])
def add_booking():
    global historical_df
    new_booking = request.json

    timestamp = new_booking.get("timestamp")
    seat_id = new_booking.get("seat_id")
    status = new_booking.get("status")

    # new data_line
    new_row = {
        "timestamp": timestamp,
        "seat_id": seat_id,
        "status": status
    }

    # add in history data
    historical_df = pd.concat([historical_df, pd.DataFrame([new_row])], ignore_index=True)
    historical_df.to_csv(dataset_path, index=False)  # 保存更新后的数据集

    return jsonify({"status": "success", "message": "实时数据已接收"})

# Starting the server
if __name__ == '__main__':
    print("The real-time data receiving server is started, waiting for a new reservation...")
    app.run(host='0.0.0.0', port=8000)