from flask import Flask, request, jsonify
import pandas as pd
import os


app = Flask(__name__)


dataset_path = "patterned_booking_data_1.4.csv"
if os.path.exists(dataset_path):
    historical_df = pd.read_csv(dataset_path)
else:
    historical_df = pd.DataFrame(columns=[
        'id', 'bookid', 'room', 'seat_number', 'date', 'weekday',
        'start_time', 'end_time', 'book_name', 'status'
    ])



# Define the interface to receive new reservation data
@app.route('/add_booking', methods=['POST'])
def add_booking():
    global historical_df

    # Receive new reservation data from the front end
    new_booking = request.json
    print("Received new reservation data：", new_booking)

    # Generate a new id (add 1 to the original data)
    new_id = len(historical_df) + 1
    new_booking['id'] = new_id

    # Adding the new data to the historical data
    new_row = pd.DataFrame([new_booking])
    historical_df = pd.concat([historical_df, new_row], ignore_index=True)

    # Save the updated dataset (overwriting the original file)
    historical_df.to_csv(dataset_path, index=False)
    print("Data has been updated for total", len(historical_df), " records")

    # Telling the frontend "Receive successful"
    return jsonify({"status": "success", "message": "A new reservation has been saved"})