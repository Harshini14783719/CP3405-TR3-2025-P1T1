import numpy as np
import gymnasium as gym
import requests
from gym import spaces

class SeatBookingEnv(gym.Env):
    def __init__(self):
        super(SeatBookingEnv, self).__init__()
        self.action_space = spaces.Discrete(3) # 3 actions
        self.observation_space = spaces.Box(
            low=np.array([0, 0, 0, 0, 0], dtype=np.int32),
            high=np.array([5, 2, 1, 1, 23], dtype=np.int32),
            dtype=np.int32
        )
        self.state = None

    def set_user_state(self, userId):
        """Call the interface to obtain user status data"""
        response = requests.get(f'http://localhost:3000/api/rl-state?userId={userId}')
        data = response.json()

        # Quantification book_name
        book_purpose_code = 0 if data['book_purpose'] == 'exam_review' else 1 if data['book_purpose'] == 'study' else 2
        # Quantification role
        role_code = 0 if data['role'] == 'teacher' else 1
        # Quantified classroom types: Small classrooms (such as A1-01) are coded as 0,
        # and large classrooms (such as C2-13) are coded as 1
        room_num = int(data['room'].split('-')[1])
        room_code = 0 if room_num <= 12 else 1  # small room 01-12，large room 13-15

        self.state = np.array([
            data['bookingHistory'],
            book_purpose_code,
            role_code,
            room_code,
            data['hour']
        ])
        return self.state

    def _calculate_urgency(self):
        # priority：book_name(exam_review>study>Group discussion) > role(teacher>student) > booking_times(less is urgent)
        booking_history, book_name_code, role_code, _, _ = self.state
        urgency = 0
        # Booking purpose weight
        urgency += 3 if book_name_code == 0 else 2 if book_name_code == 1 else 1
        # Role weight
        urgency += 2 if role_code == 0 else 0
        # Booking frequency weight
        urgency += 2 if booking_history <= 1 else 1 if booking_history <= 3 else 0
        # Classify urgency levels
        return 3 if urgency >= 6 else 2 if urgency >= 3 else 1

    def _calculate_reward(self, action):
        urgency = self._calculate_urgency()
        reward = 0
        # action 0：recommended seats
        if action == 0:
            reward = 10 if urgency >= 2 else 2
        # action 1：recommended during off-peak hours
        elif action == 1:
            reward = 10 if urgency <= 1 else 2
        # action 2：limit the reservation time
        elif action == 2:
            reward = 10 if urgency == 1 else 2
        return reward

    def step(self, action):
        reward = self._calculate_reward(action)
        done = True
        return self.state, reward, done, {}

    def reset(self):
        self.state = np.array([0, 0, 0, 0, 0])
        return self.state


