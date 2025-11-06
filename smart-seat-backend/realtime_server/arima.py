import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller
from statsmodels.stats.diagnostic import acorr_ljungbox
import itertools
import os

# Weekday mapping (global variable)
weekday_map = {0: 'Monday', 1: 'Tuesday', 2: 'Wednesday', 3: 'Thursday', 4: 'Friday', 5: 'Saturday', 6: 'Sunday'}

# --------------------------
# Data Loading and Preprocessing
# --------------------------
def load_and_process_data(csv_path="patterned_booking_data_with_bookid.csv"):
    if not os.path.exists(csv_path):
        return pd.DataFrame()
    df = pd.read_csv(csv_path)
    df['date'] = pd.to_datetime(df['date'])
    df['weekday'] = df['date'].dt.weekday  # 0=Monday, 6=Sunday
    df['hour_slot'] = pd.to_datetime(df['start_time'], format='%H:%M:%S').dt.hour
    df['occupied'] = df['status'].isin([1, 2])  # Status 1/2 are considered occupied
    df['room_id'] = df['room'].apply(lambda x: int(x.split('-')[1]))
    df['class_type'] = df['room_id'].apply(lambda x: 'large' if x >= 13 else 'small')  # Classify room type
    # Group by (type, weekday, hour, date) to count total occupied seats per timeslot
    grouped = df[df['occupied']].groupby(['class_type', 'weekday', 'hour_slot', 'date'])[
        'seat_number'].sum().reset_index()
    grouped = grouped.sort_values(by=['class_type', 'weekday', 'hour_slot', 'date'])

    print(f"聚合后的数据量：{len(grouped)} 条")
    print("前5条聚合数据：")
    print(grouped.head())

    return grouped

# --------------------------
# Time Series Testing Tools
# --------------------------
def adf_test(series):
    """Stationarity test (Augmented Dickey-Fuller)"""
    result = adfuller(series)
    return result[1] <= 0.05  # Stationary if p-value ≤ 0.05


def white_noise_test(series):
    """White noise test (Ljung-Box)"""
    max_lags = min(10, len(series) - 1)
    lb_test = acorr_ljungbox(series, lags=max_lags, return_df=True)
    p_values = lb_test['lb_pvalue'].values
    return not all(p > 0.05 for p in p_values)  # Return True if not white noise

# --------------------------
# ARIMA Parameter Optimization
# --------------------------
def get_best_arima_params(series, diff_order):
    """Find optimal ARIMA parameters (p, d, q)"""
    p = range(0, 3)
    q = range(0, 3)
    pdq = list(itertools.product(p, q))
    best_aic = float('inf')
    best_params = None
    for (p, q) in pdq:
        try:
            model = ARIMA(series, order=(p, diff_order, q))
            fit = model.fit()
            if fit.aic < best_aic:
                best_aic = fit.aic
                best_params = (p, diff_order, q)
        except:
            continue
    return best_params


# --------------------------
# Multi-Day Forecasting and Visualization
# --------------------------
def forecast_and_visualize(grouped):
    """Generate 7-day forecast and visualize results"""
    all_forecasts = []
    if grouped.empty:
        return pd.DataFrame()

    for class_type in ['small', 'large']:
        for weekday in range(7):  # Iterate through 7 days of the week
            for hour_slot in range(8, 22):  # Iterate through 8:00-21:00
                # Filter data for current type, weekday, and hour
                mask = (grouped['class_type'] == class_type) & \
                       (grouped['weekday'] == weekday) & \
                       (grouped['hour_slot'] == hour_slot)

                ts = grouped[mask]['seat_number'].values
                if len(ts) < 10 or len(np.unique(ts)) < 2:
                    continue  # 样本量不足或波动不足时跳过

                # Stationarity processing (differencing)
                original_ts = ts.copy()
                diff_order = 0
                if not adf_test(ts):
                    ts = np.diff(ts)
                    diff_order = 1
                    if not adf_test(ts):
                        ts = np.diff(ts)
                        diff_order = 2

                # Skip if data is white noise
                if not white_noise_test(ts):
                    continue

                # Optimize parameters and forecast next 7 days
                best_params = get_best_arima_params(original_ts, diff_order)
                if not best_params:
                    continue
                model = ARIMA(original_ts, order=best_params)
                fit = model.fit()
                forecast = fit.forecast(steps=7)  # Forecast next 7 days
                forecast = np.round(forecast).astype(int)
                forecast = np.maximum(forecast, 0)  # Ensure non-negative forecasts

                # Store forecast results
                for i in range(7):
                    forecast_weekday = (weekday + i) % 7  # Cycle through weekdays
                    all_forecasts.append({
                        'class_type': class_type,
                        'forecast_weekday': forecast_weekday,
                        'hour_slot': hour_slot,
                        'forecast_seats': forecast[i],
                        'forecast_weekday_en': weekday_map[forecast_weekday]
                    })

    forecast_df = pd.DataFrame(all_forecasts)
    plot_weekly_forecast(forecast_df) # Generate visualization

    forecast_df.to_json('forecast_results.json', orient='records', force_ascii=False)
    print("The prediction result is saved forecast_results.json")

    return forecast_df


def plot_weekly_forecast(forecast_df):
    """Plot 7-day timeslot forecast comparison"""
    for class_type in ['small', 'large']:
        plt.figure(figsize=(16, 8))
        # Plot separate lines for each weekday
        for weekday in range(7):
            subset = forecast_df[(forecast_df['class_type'] == class_type) &
                                 (forecast_df['forecast_weekday'] == weekday)]
            subset = subset.sort_values('hour_slot')
            plt.plot(subset['hour_slot'], subset['forecast_seats'],
                     marker='o', label=weekday_map[weekday], alpha=0.8)

        # Chart styling
        total_seats = 140 if class_type == 'large' else 60
        plt.title(f'{class_type.capitalize()} Classroom - 7-Day Seat Booking Forecast (ARIMA Model)', fontsize=14)
        plt.xlabel('Hour of Day (8:00-21:00)', fontsize=12)
        plt.ylabel('Number of Booked Seats', fontsize=12)
        plt.xticks(range(8, 22))  # X-axis shows 8-21 hours
        plt.ylim(0, total_seats)  # Y-axis limited to total seats
        plt.grid(alpha=0.3)
        plt.legend(title='Weekday', bbox_to_anchor=(1.05, 1), loc='upper left')  # Legend on right
        plt.tight_layout()  # Auto-adjust layout
        plt.savefig(f'{class_type}_weekly_forecast.png', dpi=300)
        plt.close()
        print(f"{class_type.capitalize()} classroom weekly forecast plot saved.")


# --------------------------
if __name__ == "__main__":
    grouped_data = load_and_process_data()
    forecast_df = forecast_and_visualize(grouped_data)

    if forecast_df.empty:
        print("No forecast generated (insufficient data or empty dataset).")
    else:
        print(f"Forecast completed. Generated {len(forecast_df)} predictions.")