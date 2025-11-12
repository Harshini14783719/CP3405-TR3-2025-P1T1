import os
from fastapi import Query
from fastapi import FastAPI
from stable_baselines3 import PPO
from .seat_booking_env import SeatBookingEnv


current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "seat_booking_rl_model")

model = PPO.load(model_path)
env = SeatBookingEnv()
app = FastAPI()
@app.get("/decision")
def get_decision(user_id: int = Query(...)):
    try:
        env.set_user_state(user_id)
        action, _ = model.predict(env.state)
        if action == 0:
            return {"message": "📌 It is recommended that you choose the priority seat by the window"}
        elif action == 1:
            return {"message": "⚠️ It is recommended that you make a reservation during off-peak hours (such as 7:00-9:00 or 19:00-21:00)"}
        elif action == 2:
            return {"message": "⏰ You are only allowed to make reservations during the period from 14:00 to 15:00"}
        else:
            return {"message": "There are no special prompts for now"}
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"error": str(e)}