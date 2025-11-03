from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
import numpy as np
import re
import pickle
import os
import pandas as pd

app = Flask(__name__)
CORS(app)

model_dir = '/app/models'
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

try:
    with open(os.path.join(model_dir, 'mood_encoder.pkl'), 'rb') as f:
        mood_encoder = pickle.load(f)
    with open(os.path.join(model_dir, 'room_encoder.pkl'), 'rb') as f:
        room_encoder = pickle.load(f)
    with open(os.path.join(model_dir, 'time_scaler.pkl'), 'rb') as f:
        scaler = pickle.load(f)
    with open(os.path.join(model_dir, 'room_seat_modes.pkl'), 'rb') as f:
        room_seat_modes = pickle.load(f)
    with open(os.path.join(model_dir, 'room_constraints.pkl'), 'rb') as f:
        room_constraints = pickle.load(f)
    print("successful")
except Exception as e:
    print(f"fail to load：{str(e)}")
    raise

class SeatRecommender(nn.Module):
    def __init__(self, num_rooms, num_moods, embedding_dim=32):
        super().__init__()
        self.room_emb = nn.Embedding(num_rooms, embedding_dim)
        self.mood_emb = nn.Embedding(num_moods, embedding_dim)
        self.fc1 = nn.Linear(embedding_dim*2 + 4 + 140, 1024)
        self.bn1 = nn.BatchNorm1d(1024)
        self.fc2 = nn.Linear(1024, 512)
        self.bn2 = nn.BatchNorm1d(512)
        self.fc3 = nn.Linear(512, 256)
        self.bn3 = nn.BatchNorm1d(256)
        self.fc4 = nn.Linear(256, 140)
        self.dropout = nn.Dropout(0.35)
        self.leaky_relu = nn.LeakyReLU(0.2)
    def forward(self, x):
        room_enc = x[:, 0].long()
        mood_enc = x[:, 1].long()
        num_feats = x[:, 2:6]
        reserved = x[:, 6:]
        room_emb = self.room_emb(room_enc).squeeze(1)
        mood_emb = self.mood_emb(mood_enc).squeeze(1)
        combined = torch.cat([room_emb, mood_emb, num_feats, reserved], dim=1)
        x = self.leaky_relu(self.bn1(self.fc1(combined)))
        x = self.dropout(x)
        x = self.leaky_relu(self.bn2(self.fc2(x)))
        x = self.dropout(x)
        x = self.leaky_relu(self.bn3(self.fc3(x)))
        x = self.dropout(x)
        x = self.fc4(x)
        return x

try:
    num_rooms = len(room_encoder.classes_) if hasattr(room_encoder, 'classes_') else 0
    num_moods = len(mood_encoder.classes_) if hasattr(mood_encoder, 'classes_') else 0
    model = SeatRecommender(num_rooms, num_moods)
    model.load_state_dict(torch.load(os.path.join(model_dir, 'seat_recommender.pth'), map_location=device, weights_only=True))
    model.to(device)
    model.eval()
    print("successful")
except Exception as e:
    print(f"fail：{str(e)}")
    raise

def extract_room_number(room_str):
    if not room_str or pd.isna(room_str):
        return 0
    match = re.search(r'\d+', str(room_str))
    return int(match.group()) if match else 0

def time_to_minutes(time_str):
    if not time_str:
        return 0
    try:
        parts = time_str.split(':')
        if len(parts) == 2:
            h, m = map(int, parts)
        elif len(parts) == 3:
            h, m, _ = map(int, parts)
        else:
            return 0
        return h * 60 + m
    except Exception as e:
        print(f"fail：{str(e)}")
        return 0

def parse_reserved_seats(reserved_str):
    seats = set()
    if not reserved_str:
        return seats
    for item in reserved_str.split(','):
        item = item.strip()
        if not item:
            continue
        try:
            if '-' in item:
                start, end = map(int, item.split('-'))
                seats.update(range(start, end + 1))
            else:
                seats.add(int(item))
        except:
            continue
    return seats

def get_max_seats(room_id):
    for key, seats in room_constraints.items():
        if key in str(room_id):
            return max(seats) if seats else 60
    return 60

@app.route('/api/predict-seat', methods=['POST'])
def predict_seat():
    try:
        req_data = request.get_json()
        print("=== Flask recive ===")
        print(req_data)
        
        if not req_data:
            return jsonify({'error': 'data error'}), 400

        room_id = req_data.get('room_id', '')
        time_slot = req_data.get('time_slot', '')
        booked_seats = req_data.get('booked_seats', '')
        user_mood = req_data.get('user_mood', 'unknown')

        room_number = extract_room_number(room_id)
        time_minutes = time_to_minutes(time_slot)
        time_norm = scaler.transform([[time_minutes]])[0][0] if scaler else 0

        try:
            mood_enc = mood_encoder.transform([user_mood])[0] if user_mood in mood_encoder.classes_ else 0
        except:
            mood_enc = 0
            print(f"unknown {user_mood}，defult 0")
        
        try:
            room_enc = room_encoder.transform([room_id])[0] if room_id in room_encoder.classes_ else 0
        except:
            room_enc = 0
            print(f"unknown {room_id}，defult 0")
        
        reserved_seats_set = parse_reserved_seats(booked_seats)
        reserved_count = len(reserved_seats_set)
        max_seats = get_max_seats(room_id)

        reserved = torch.zeros(140)
        for seat in reserved_seats_set:
            if 1 <= seat <= 140:
                reserved[seat - 1] = 1

        features = torch.tensor([room_enc, mood_enc, time_norm, room_number, reserved_count, max_seats], dtype=torch.float32)
        features = torch.cat([features, reserved]).to(device)
        features = features.unsqueeze(0)

        with torch.no_grad():
            output = model(features)
            _, predicted = torch.max(output.data, 1)
            seat_number = predicted.item() + 1

        if seat_number in reserved_seats_set:
            sorted_scores = torch.argsort(output.data, descending=True).squeeze().tolist()
            for idx in sorted_scores:
                candidate = idx + 1
                if candidate not in reserved_seats_set and 1 <= candidate <= max_seats:
                    seat_number = candidate
                    break
        
        print(f"=== Flask return ===")
        print(f"recommend：{seat_number}")
        return jsonify({'seat_number': int(seat_number)})
    
    except Exception as e:
        print(f"=== Flask fail ===")
        print(str(e))
        return jsonify({'error': f'fail：{str(e)}'}), 500

@app.route('/', methods=['GET'])
def index():
    return 'Smart Seat Flask Service is running!'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True, use_reloader=False)