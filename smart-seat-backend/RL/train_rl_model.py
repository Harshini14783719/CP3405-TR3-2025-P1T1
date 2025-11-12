from stable_baselines3 import PPO
from seat_booking_env import SeatBookingEnv

env = SeatBookingEnv()
model = PPO("MlpPolicy", env, verbose=1)
model.learn(total_timesteps=10000)
model.save("seat_booking_rl_model")