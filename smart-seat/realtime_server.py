from flask import Flask, request, jsonify
import pandas as pd
import os


app = Flask(__name__)


dataset_path = "patterned_booking_data_with_bookid.csv"
if os.path.exists(dataset_path):
    historical_df = pd.read_csv(dataset_path)
else:
    historical_df = pd.DataFrame(columns=[
        'id', 'bookid', 'room', 'seat_number', 'date', 'weekday',
        'start_time', 'end_time', 'book_name', 'status'
    ])

