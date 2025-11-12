import sys
from stable_baselines3 import PPO
from seat_booking_env import SeatBookingEnv

def get_decision(userId):
    model = PPO.load("seat_booking_rl_model")  # Load the trained model
    env = SeatBookingEnv()
    env.set_user_state(userId)
    action, _ = model.predict(env.state)

    # Map actions to front-end prompts
    if action == 0:
        return "📌 It is recommended that you choose the priority seat by the window"
    elif action == 1:
        return "⚠️ It is recommended that you make a reservation during off-peak hours (such as 7:00-9:00 or 19:00-21:00)"
    elif action == 2:
        return "⏰ You are only allowed to make reservations during the period from 14:00 to 15:00"
    else:
        return "There are no special prompts for now"

if __name__ == "__main__":
    userId = sys.argv[1]
    decision = get_decision(userId)
    print(decision)