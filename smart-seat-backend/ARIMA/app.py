from flask import Flask, request, jsonify, send_from_directory
import json
import numpy as np
import os
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from datetime import datetime

app = Flask(__name__)
APP_ROOT = os.path.dirname(__file__)
IMAGE_FOLDER = APP_ROOT  # 存放预测图像的目录

# ----------------------------
# Load historical data
# ----------------------------
dataset_path = os.path.join(APP_ROOT, "patterned_booking_data_with_bookid_1.csv")
if os.path.exists(dataset_path):
    historical_df = pd.read_csv(dataset_path)
else:
    historical_df = pd.DataFrame(columns=[
        "id", "bookid", "room", "seat_number", "date",
        "start_time", "end_time", "book_name", "status"
    ])

# ----------------------------
# Load model parameters
# ----------------------------
model_params_path = os.path.join(APP_ROOT, "type_model_params.json")
if os.path.exists(model_params_path):
    with open(model_params_path, "r") as f:
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
else:
    history = {'large': np.array([]), 'small': np.array([])}
    d = {'large': 0, 'small': 0}
    best_params = {'large': (1,0,0), 'small': (1,0,0)}
    total_seats = {'large': 140, 'small': 60}

# ----------------------------
# Root route
# ----------------------------
@app.route('/')
def home():
    return "Smart Seat ARIMA Service is running! Use /realtime/predict or /add_booking API."

# ----------------------------
# Serve forecast images
# ----------------------------
@app.route('/get_plot/<room_type>')
def get_plot(room_type):
    if room_type not in ['large', 'small']:
        return jsonify({"status": "error", "message": "Invalid room type"}), 400
    filename = f"{room_type}_weekly_forecast.png"
    file_path = os.path.join(IMAGE_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({"status": "error", "message": "Plot not found. Run ARIMA forecast first."}), 404
    return send_from_directory(IMAGE_FOLDER, filename)

# ----------------------------
# Add new booking
# ----------------------------
@app.route('/add_booking', methods=['POST'])
def add_booking():
    global historical_df
    try:
        new_booking = request.get_json()
        date_obj = datetime.strptime(new_booking.get("date"), "%Y-%m-%d")
    except Exception as e:
        return jsonify({"status": "error", "message": f"Invalid date format: {str(e)}"}), 400

    new_row = {
        "id": len(historical_df) + 1,
        "bookid": new_booking.get("bookid"),
        "room": new_booking.get("room"),
        "seat_number": new_booking.get("seat_number"),
        "date": new_booking.get("date"),
        "start_time": new_booking.get("start_time"),
        "end_time": new_booking.get("end_time"),
        "book_name": new_booking.get("book_name"),
        "status": new_booking.get("status")
    }
    historical_df = pd.concat([historical_df, pd.DataFrame([new_row])], ignore_index=True)
    historical_df.to_csv(dataset_path, index=False)
    return jsonify({"status": "success", "message": "New booking received"})

# ----------------------------
# Real-time prediction
# ----------------------------
def update_and_predict(room_type, new_data):
    global history
    if len(new_data) > 0:
        history[room_type] = np.concatenate([history[room_type], new_data])
    model = ARIMA(history[room_type], order=best_params[room_type])
    results = model.fit()
    forecast = results.forecast(steps=1)[0]
    forecast_seats = max(0, min(int(round(forecast)), total_seats[room_type]))
    occupancy_rate = round(forecast_seats / total_seats[room_type], 2)
    return forecast_seats, occupancy_rate

@app.route('/realtime/predict', methods=['POST'])
def realtime_predict():
    try:
        data = request.get_json()
        room_type = data.get("room_type", "small")
        if room_type not in ['large', 'small']:
            return jsonify({"status": "error", "message": "Room type must be 'large' or 'small'"})
        new_data = np.array(data.get("new_occupied", []), dtype=int)
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

# ----------------------------
if __name__ == '__main__':
    print("The real-time data receiving server is started, waiting for new bookings...")
    app.run(host='0.0.0.0', port=8002, debug=True)
