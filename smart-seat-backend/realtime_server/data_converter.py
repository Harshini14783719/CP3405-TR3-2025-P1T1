import pandas as pd

# read csv_file
original_df = pd.read_csv("patterned_booking_data_1.4.csv")

# Extract and Convert fields:
# - Timestamp: Merge date and start_time into a full timestamp (e.g., "2025-10-31 14:00:00")
# -Seat ID: Concatenate room and seat_number (e.g. "C2-13_13")
# - status: Map Status to "Booked/Cancelled/Available" (can be adjusted according to business definition. Here, it is assumed that 1= booked, 2= occupied, and 0= available)
original_df["timestamp"] = original_df["date"] + " " + original_df["start_time"]
original_df["seat_id"] = original_df["room"] + "_" + original_df["seat_number"].astype(str)
original_df["status"] = original_df["status"].map({
    0: "available",
    1: "booked",
    2: "occupied"
})

# Filter the target columns and generate structured data
structured_df = original_df[["timestamp", "seat_id", "status"]].copy()

# Save as a new file (named "structured_booking_data.csv")
structured_df.to_csv("structured_booking_data.csv", index=False)

print("Data conversion completed! The structured data has been saved as structured_booking_data.csv")