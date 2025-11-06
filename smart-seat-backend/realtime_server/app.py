from flask import Flask, request, jsonify, send_from_directory
import json
import numpy as np
import os
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

app = Flask(__name__)
IMAGE_FOLDER = os.path.join(os.path.dirname(__file__), '')

dataset_path = "structured_booking_data.csv"
if os.path.exists(dataset_path):
    historical_df = pd.read_csv(dataset_path)
else:
    historical_df = pd.DataFrame(columns=["id", "bookid", "room", "seat_number", "date",
        "weekday", "start_time", "end_time", "book_name", "status"
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





# Define the interface to receive new reservation data
@app.route('/add_booking', methods=['POST'])
def add_booking():
    global historical_df
    new_booking = request.json

    bookid = new_booking.get("bookid")
    room = new_booking.get("room")
    seat_number = new_booking.get("seat_number")
    date = new_booking.get("date")
    weekday = new_booking.get("weekday")
    start_time = new_booking.get("start_time")
    end_time = new_booking.get("end_time")
    book_name = new_booking.get("book_name")
    status = new_booking.get("status")

    # new data_line
    new_row = {
        "id": len(historical_df) + 1,  # 自动生成id
        "bookid": bookid,
        "room": room,
        "seat_number": seat_number,
        "date": date,
        "weekday": weekday,
        "start_time": start_time,
        "end_time": end_time,
        "book_name": book_name,
        "status": status
    }

    # add in history data
    historical_df = pd.concat([historical_df, pd.DataFrame([new_row])], ignore_index=True)
    historical_df.to_csv(dataset_path, index=False)  # 保存更新后的数据集

    return jsonify({"status": "success", "message": "real data has received"})

# Starting the server
if __name__ == '__main__':
    print("The real-time data receiving server is started, waiting for a new reservation...")
    app.run(host='0.0.0.0', port=8000)