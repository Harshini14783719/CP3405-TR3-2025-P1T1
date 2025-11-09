from flask import Flask, request, jsonify, send_from_directory
import json
import numpy as np
import os
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from datetime import datetime

app = Flask(__name__)
IMAGE_FOLDER = os.path.join(os.path.dirname(__file__), '')

dataset_path = "structured_booking_data.csv"
if os.path.exists(dataset_path):
    historical_df = pd.read_csv(dataset_path)
else:
    historical_df = pd.DataFrame(columns=["id", "bookid", "room", "seat_number", "date",
     "start_time", "end_time", "book_name", "status"
    ])


# Loading model parameters (new add)
with open("type_model_params.json", "r") as f:
    model_data = json.load(f)
history = {
    'large': np.array(model_data['large']['history']),
    'small': np.array(model_data['small']['history'])
}
d = {
    'large': model_data['large']['d'],
    'small': model_data['small']['d']
}
best_params = {
    'large': tuple(model_data['large']['best_params']),
    'small': tuple(model_data['small']['best_params'])
}
total_seats = {
    'large': model_data['large']['total_seats'],
    'small': model_data['small']['total_seats']
}

# Image access interface
@app.route('/get_plot/<room_type>')
def get_plot(room_type):
    if room_type not in ['large', 'small']:
        return "Invalid room type", 400
    filename = f"{room_type}_forecast_plot.png"
    if not os.path.exists(os.path.join(IMAGE_FOLDER, filename)):
        return "Plot not found. Please run arima_model.py first.", 404
    return send_from_directory(IMAGE_FOLDER, filename)


# Define the interface to receive new reservation data
@app.route('/add_booking', methods=['POST'])
def add_booking():
    global historical_df
    new_booking = request.json

    bookid = new_booking.get("bookid")
    room = new_booking.get("room")
    seat_number = new_booking.get("seat_number")
    date = new_booking.get("date")
    start_time = new_booking.get("start_time")
    end_time = new_booking.get("end_time")
    book_name = new_booking.get("book_name")
    status = new_booking.get("status")

    try:
        date_obj = datetime.strptime(date, "%Y-%m-%d")
        extracted_weekday = date_obj.weekday()  # 动态生成星期值
    except Exception as e:
        return jsonify({"status": "error", "message": f"Invalid date format: {str(e)}"}), 400

    # new data_line
    new_row = {
        "id": len(historical_df) + 1,  # 自动生成id
        "bookid": bookid,
        "room": room,
        "seat_number": seat_number,
        "date": date,
        "start_time": start_time,
        "end_time": end_time,
        "book_name": book_name,
        "status": status
    }

    # add in history data
    historical_df = pd.concat([historical_df, pd.DataFrame([new_row])], ignore_index=True)
    historical_df.to_csv(dataset_path, index=False)  # 保存更新后的数据集
    return jsonify({"status": "success", "message": "real data has received"})


# Real-time prediction core logic
def update_and_predict(room_type, new_data):
    global history
    history[room_type] = np.concatenate([history[room_type], new_data])
    model = ARIMA(history[room_type], order=best_params[room_type])
    results = model.fit()
    forecast = results.forecast(steps=1)[0]
    forecast_seats = max(0, min(int(round(forecast)), total_seats[room_type]))
    occupancy_rate = round(forecast_seats / total_seats[room_type], 2)
    return forecast_seats, occupancy_rate


# Real-time prediction interface
@app.route('/realtime/predict', methods=['POST'])
def realtime_predict():
    try:
        data = request.get_json()
        room_type = data.get("room_type", "small")
        new_data = np.array(data.get("new_occupied", []), dtype=int)
        if room_type not in ['large', 'small']:
            return jsonify({"status": "error", "message": "Room type must be large or small"})
        forecast, rate = update_and_predict(room_type, new_data)
        return jsonify({
            "status": "success",
            "room_type": room_type,
            "current_occupied": int(history[room_type][-1]) if len(history[room_type]) > 0 else 0,
            "forecast_occupied": forecast,
            "occupancy_rate": rate,
            "total_seats": total_seats[room_type]
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})


if __name__ == '__main__':
    print("The real-time data receiving server is started, waiting for a new reservation...")
    app.run(host='0.0.0.0', port=8000, debug=True)
