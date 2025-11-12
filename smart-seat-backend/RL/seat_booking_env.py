import numpy as np
import gymnasium as gym
import requests
from gymnasium import spaces


class SeatBookingEnv(gym.Env):
    """
    Custom Environment for Seat Booking Recommendation compatible with Gymnasium API.
    """

    def __init__(self):
        # Use modern super() call
        super().__init__()
        # Define action and observation space
        # 3 actions: 0=recommend seats, 1=recommend off-peak, 2=limit time
        self.action_space = spaces.Discrete(3)
        # Observation space: [bookingHistory, book_purpose, role, room_type, hour]
        self.observation_space = spaces.Box(
            low=np.array([0, 0, 0, 0, 0], dtype=np.int32),
            high=np.array([5, 2, 1, 1, 23], dtype=np.int32),
            dtype=np.int32
        )
        # Initialize state. It will be overwritten by reset() or set_user_state()
        self.state = None
        self.max_steps = 1  # This is a single-step (bandit-style) environment

    def set_user_state(self, userId):
        """
        Call the interface to obtain user status data.
        This is a custom method, not part of the standard Gym API.
        """
        response = requests.get(f'http://localhost:4000/api/rl-state?userId={userId}')
        data = response.json()

        # Quantification book_purpose
        book_purpose_map = {'exam_review': 0, 'study': 1}
        book_purpose_code = book_purpose_map.get(data['book_purpose'], 2)  # Default to 2 for other purposes
        # Quantification role
        role_code = 0 if data['role'] == 'teacher' else 1
        # Quantified classroom types: Small classrooms (e.g., A1-01) = 0, Large (e.g., C2-13) = 1
        room_num = int(data['room'].split('-')[1])
        room_code = 0 if room_num <= 12 else 1

        self.state = np.array([
            data['bookingHistory'],
            book_purpose_code,
            role_code,
            room_code,
            data['hour']
        ], dtype=np.int32)  # Ensure dtype matches observation space
        return self.state

    def _calculate_urgency(self):
        # priority：book_purpose(exam_review>study>Group discussion) > role(teacher>student) > booking_times(less is urgent)
        booking_history, book_purpose_code, role_code, _, _ = self.state
        urgency = 0
        # Booking purpose weight
        urgency += {0: 3, 1: 2}.get(book_purpose_code, 1)  # exam_review=3, study=2, other=1
        # Role weight
        urgency += 2 if role_code == 0 else 0  # teacher=2, student=0
        # Booking frequency weight
        urgency += 2 if booking_history <= 1 else 1 if booking_history <= 3 else 0
        # Classify urgency levels
        return 3 if urgency >= 6 else 2 if urgency >= 4 else 1  # Adjusted thresholds for better distribution

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
        """
        UPDATED for Gymnasium API.
        Returns 5 values: obs, reward, terminated, truncated, info.
        """
        reward = self._calculate_reward(action)

        # Since this is a single-step task, it's always 'terminated' after one step.
        terminated = True
        truncated = False  # Not truncated by a time limit

        info = {}

        # The state does not change after the action in this specific problem setup
        observation = self.state

        return observation, reward, terminated, truncated, info

    def reset(self, seed=None, options=None):
        """
        UPDATED for Gymnasium API.
        Accepts seed and options, returns (obs, info) tuple.
        """
        # We need to call super().reset(seed=seed) to correctly seed the RNG
        super().reset(seed=seed)

        # Reset the state to a default initial state
        self.state = np.array([0, 0, 0, 0, 0], dtype=np.int32)

        observation = self.state
        info = {}

        return observation, info