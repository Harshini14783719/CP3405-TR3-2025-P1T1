import React, { useState, useEffect } from 'react';
import axios from 'axios';
const SeatRecords = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const statusMap = { 0: 'Upcoming', 1: 'Completed', 2: 'Canceled', 3: 'Expired' };

  useEffect(() => {
    const fetchUserAndBookings = async () => {
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) throw new Error('User information missing, please log in again');
        
        const currentUser = JSON.parse(currentUserStr);
        if (!currentUser.id) throw new Error('User information missing, please log in again');
        
        const userId = currentUser.id;
        const userResponse = await axios.get('/api/users/me', {
          headers: { 'user-id': userId }
        });
        setUserInfo(userResponse.data);

        const bookingsResponse = await axios.get('/api/bookings');
        const userBookings = bookingsResponse.data.filter(
          booking => booking.book_id === parseInt(userId)
        );
        const sortedBookings = userBookings.sort((a, b) => {
          const timeA = new Date(`${a.date} ${a.start_time}`).getTime();
          const timeB = new Date(`${b.date} ${b.start_time}`).getTime();
          return timeB - timeA;
        });
        setBookings(sortedBookings);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndBookings();
  }, []);

  const formatLocation = (room) => {
    if (room.startsWith('library-')) return `Library - Floor ${room.split('-')[1]}`;
    if (room === 'canteen') return 'Canteen';
    if (room.includes('-')) {
      const [buildingFloor, roomNum] = room.split('-');
      return `Teaching Building ${buildingFloor.charAt(0)} - Room ${buildingFloor.slice(1)}-${roomNum}`;
    }
    return room;
  };

  return (
    <div className="records-container">
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          }
          .records-container {
            width: 100%;
            min-height: 100vh;
            background-color: #f8fafc;
            padding: 2.5rem 3rem;
          }
          .records-header {
            margin-bottom: 2rem;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 1rem;
          }
          .records-header h1 {
            color: #0f172a;
            font-size: 1.8rem;
            font-weight: 600;
          }
          .records-header p {
            color: #64748b;
            font-size: 1rem;
            margin-top: 0.5rem;
          }
          .loading-state, .error-state, .empty-state {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 400px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            color: #64748b;
            font-size: 1.1rem;
          }
          .error-state {
            color: #ef4444;
          }
          .records-table-container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            overflow: hidden;
          }
          .records-table {
            width: 100%;
            border-collapse: collapse;
          }
          .records-table th {
            background-color: #1e40af;
            color: #ffffff;
            text-align: left;
            padding: 1.2rem 1.5rem;
            font-size: 0.95rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .records-table td {
            padding: 1.2rem 1.5rem;
            color: #334155;
            font-size: 0.95rem;
            border-bottom: 1px solid #f1f5f9;
          }
          .records-table tr:last-child td {
            border-bottom: none;
          }
          .records-table tr:hover td {
            background-color: #f8fafc;
          }
          .status-badge {
            display: inline-block;
            padding: 0.3rem 0.6rem;
            border-radius: 4px;
            font-size: 0.85rem;
            font-weight: 600;
          }
          .status-upcoming {
            background-color: #dbeafe;
            color: #1e40af;
          }
          .status-completed {
            background-color: #dcfce7;
            color: #166534;
          }
          .status-canceled {
            background-color: #fee2e2;
            color: #b91c1c;
          }
          .status-expired {
            background-color: #fef3c7;
            color: #92400e;
          }
          .time-display {
            color: #1e40af;
            font-weight: 500;
          }
        `}
      </style>
      <div className="records-header">
        <h1>My Booking Records</h1>
        {userInfo && <p>Username: {userInfo.name} | User ID: {userInfo.id}</p>}
      </div>
      {loading ? (
        <div className="loading-state">Loading booking records...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">No booking records available</div>
      ) : (
        <div className="records-table-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>Booking Location</th>
                <th>Seat Number</th>
                <th>Booking Date</th>
                <th>Booking Time Slot</th>
                <th>Booking Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td>{formatLocation(booking.room)}</td>
                  <td>{booking.seat_number}</td>
                  <td>{booking.date}</td>
                  <td className="time-display">
                    {booking.start_time} - {booking.end_time}
                  </td>
                  <td>
                    <span 
                      className={`status-badge status-${
                        booking.status === 0 ? 'upcoming' : 
                        booking.status === 1 ? 'completed' : 
                        booking.status === 2 ? 'canceled' : 'expired'
                      }`}
                    >
                      {statusMap[booking.status] || 'Unknown Status'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default SeatRecords;