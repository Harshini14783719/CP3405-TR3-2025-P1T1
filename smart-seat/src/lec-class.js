import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const LecClass = () => {
  const [classroomBuilding, setClassroomBuilding] = useState('');
  const [classroomFloor, setClassroomFloor] = useState('');
  const [classroomRoom, setClassroomRoom] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookedSeats, setBookedSeats] = useState({});
  const [selectedSeatDetail, setSelectedSeatDetail] = useState(null);
  const [totalCapacity, setTotalCapacity] = useState(0);
  const [bookedCount, setBookedCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);
  const [userInfo, setUserInfo] = useState({});
  const seatMapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn || currentUser?.role !== 'lecturer') {
      navigate('/seat', { replace: true });
      return;
    }
    setUserInfo(currentUser);
  }, [navigate]);

  useEffect(() => {
    if (classroomBuilding === 'E') {
      setClassroomFloor('2');
    } else {
      setClassroomFloor('');
    }
  }, [classroomBuilding]);

  useEffect(() => {
    setClassroomRoom('');
  }, [classroomBuilding, classroomFloor]);

  useEffect(() => {
    setBookedSeats({});
    setSelectedSeatDetail(null);
    setBookedCount(0);
    setCancelledCount(0);
    setTotalCapacity(0);
  }, [classroomBuilding, classroomFloor, classroomRoom, selectedDate, selectedHour]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (seatMapRef.current && !seatMapRef.current.contains(event.target)) {
        setSelectedSeatDetail(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedHour) {
      const end = parseInt(selectedHour) + 1;
      setEndTime(end > 23 ? '00' : end.toString().padStart(2, '0'));
    } else {
      setEndTime('');
    }
  }, [selectedHour]);

  const getAvailableFloors = () => {
    switch (classroomBuilding) {
      case 'A':
      case 'B':
        return [1, 2, 3];
      case 'C':
        return [1, 2, 3, 4];
      case 'E':
        return [2];
      default:
        return [];
    }
  };

  const generateClassroomRooms = () => {
    if (!classroomBuilding || !classroomFloor) return [];
    let validRooms = [...Array(7).keys()].map(i => (i + 1).toString().padStart(2, '0'));
    if (classroomBuilding === 'C' && classroomFloor !== '1') {
      validRooms = validRooms.concat([13, 14, 15].map(num => num.toString()));
    }
    return validRooms.map(room => `${classroomBuilding}${classroomFloor}-${room}`);
  };

  const getRoomIdentifier = useCallback(() => {
    return classroomRoom;
  }, [classroomRoom]);

  const calculateTotalCapacity = (roomNum) => {
    if (['13', '14', '15'].includes(roomNum)) {
      return 140;
    }
    const is01To07 = roomNum && parseInt(roomNum, 10) >= 1 && parseInt(roomNum, 10) <= 7;
    return is01To07 ? 48 : 84;
  };

  const fetchBookingData = useCallback(async () => {
    const room = getRoomIdentifier();
    const roomNum = room.split('-')[1];
    if (!room || !selectedDate || !selectedHour || !endTime || !roomNum) return;
    setLoading(true);
    try {
      const response = await axios.get('/api/bookings/getBookedSeats', {
        params: {
          room,
          date: selectedDate,
          start_time: `${selectedHour}:00`,
          end_time: `${endTime}:00`
        }
      });
      const bookings = {};
      let booked = 0;
      let cancelled = 0;
      response.data.forEach(item => {
        bookings[item.seat_number] = {
          book_name: item.book_name,
          jcu_id: item.jcu_id || 'N/A',
          status: item.status
        };
        if (item.status === 0) booked++;
        if (item.status === 2) cancelled++;
      });
      setBookedSeats(bookings);
      setBookedCount(booked);
      setCancelledCount(cancelled);
      setTotalCapacity(calculateTotalCapacity(roomNum));
    } catch (error) {
      console.error('Error fetching booking details:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedHour, endTime, getRoomIdentifier]);

  useEffect(() => {
    if (classroomRoom && selectedDate && selectedHour) {
      fetchBookingData();
    }
  }, [classroomRoom, selectedDate, selectedHour, fetchBookingData]);

  const handleSeatClick = (seatNumber, event) => {
    if (!bookedSeats[seatNumber]) return;
    const seatElement = event.target;
    const rect = seatElement.getBoundingClientRect();
    const seatMapRect = seatMapRef.current.getBoundingClientRect();
    setSelectedSeatDetail({
      seat_number: seatNumber,
      book_name: bookedSeats[seatNumber].book_name,
      jcu_id: bookedSeats[seatNumber].jcu_id,
      x: rect.left - seatMapRect.left + 40,
      y: rect.top - seatMapRect.top - 60
    });
  };

  const renderClassroomType1 = () => {
    const roomNum = classroomRoom.split('-')[1];
    const is01To07 = roomNum && parseInt(roomNum, 10) >= 1 && parseInt(roomNum, 10) <= 7;
    return (
      <div className={`classroom-type1 ${is01To07 ? 'classroom-01-07' : ''}`}>
        <div className="left-wall-table table horizontal-table">
          <div className="table-seats top-seats">
            {[1, 2, 3].map(seatNum => (
              <div 
                key={seatNum}
                className={`seat ${bookedSeats[seatNum] ? (bookedSeats[seatNum].status === 0 ? 'booked' : 'cancelled') : ''}`}
                onClick={(e) => handleSeatClick(seatNum, e)}
                style={{ cursor: bookedSeats[seatNum] ? 'pointer' : 'default' }}
              >
                {seatNum}
              </div>
            ))}
          </div>
          <div className="table-seats bottom-seats">
            {[4, 5, 6].map(seatNum => (
              <div 
                key={seatNum}
                className={`seat ${bookedSeats[seatNum] ? (bookedSeats[seatNum].status === 0 ? 'booked' : 'cancelled') : ''}`}
                onClick={(e) => handleSeatClick(seatNum, e)}
                style={{ cursor: bookedSeats[seatNum] ? 'pointer' : 'default' }}
              >
                {seatNum}
              </div>
            ))}
          </div>
        </div>
        <div className="right-wall-table table horizontal-table">
          <div className="table-seats top-seats">
            {[7, 8, 9].map(seatNum => (
              <div 
                key={seatNum}
                className={`seat ${bookedSeats[seatNum] ? (bookedSeats[seatNum].status === 0 ? 'booked' : 'cancelled') : ''}`}
                onClick={(e) => handleSeatClick(seatNum, e)}
                style={{ cursor: bookedSeats[seatNum] ? 'pointer' : 'default' }}
              >
                {seatNum}
              </div>
            ))}
          </div>
          <div className="table-seats bottom-seats">
            {[10, 11, 12].map(seatNum => (
              <div 
                key={seatNum}
                className={`seat ${bookedSeats[seatNum] ? (bookedSeats[seatNum].status === 0 ? 'booked' : 'cancelled') : ''}`}
                onClick={(e) => handleSeatClick(seatNum, e)}
                style={{ cursor: bookedSeats[seatNum] ? 'pointer' : 'default' }}
              >
                {seatNum}
              </div>
            ))}
          </div>
        </div>
        <div className="front-wall-tables">
          {[2, 1, 3].map(tableNum => (
            <div key={`front-table-${tableNum}`} className="table vertical-table">
              {!is01To07 && (
                <>
                  <div className="table-seats top-seats">
                    {[13 + (tableNum - 1) * 12, 14 + (tableNum - 1) * 12, 15 + (tableNum - 1) * 12].map(seatNum => (
                      <div 
                        key={seatNum}
                        className={`seat ${bookedSeats[seatNum] ? (bookedSeats[seatNum].status === 0 ? 'booked' : 'cancelled') : ''}`}
                        onClick={(e) => handleSeatClick(seatNum, e)}
                        style={{ cursor: bookedSeats[seatNum] ? 'pointer' : 'default' }}
                      >
                        {seatNum}
                      </div>
                    ))}
                  </div>
                  <div className="table-seats bottom-seats">
                    {[16 + (tableNum - 1) * 12, 17 + (tableNum - 1) * 12, 18 + (tableNum - 1) * 12].map(seatNum => (
                      <div 
                        key={seatNum}
                        className={`seat ${bookedSeats[seatNum] ? (bookedSeats[seatNum].status === 0 ? 'booked' : 'cancelled') : ''}`}
                        onClick={(e) => handleSeatClick(seatNum, e)}
                        style={{ cursor: bookedSeats[seatNum] ? 'pointer' : 'default' }}
                      >
                        {seatNum}
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="table-seats left-seats">
                {[19 + (tableNum - 1) * 12, 20 + (tableNum - 1) * 12, 21 + (tableNum - 1) * 12].map(seatNum => (
                  <div 
                    key={seatNum}
                    className={`seat ${bookedSeats[seatNum] ? (bookedSeats[seatNum].status === 0 ? 'booked' : 'cancelled') : ''}`}
                    onClick={(e) => handleSeatClick(seatNum, e)}
                    style={{ cursor: bookedSeats[seatNum] ? 'pointer' : 'default' }}
                  >
                    {seatNum}
                  </div>
                ))}
              </div>
              <div className="table-seats right-seats">
                {[22 + (tableNum - 1) * 12, 23 + (tableNum - 1) * 12, 24 + (tableNum - 1) * 12].map(seatNum => (
                  <div 
                    key={seatNum}
                    className={`seat ${bookedSeats[seatNum] ? (bookedSeats[seatNum].status === 0 ? 'booked' : 'cancelled') : ''}`}
                    onClick={(e) => handleSeatClick(seatNum, e)}
                    style={{ cursor: bookedSeats[seatNum] ? 'pointer' : 'default' }}
                  >
                    {seatNum}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="back-wall-tables">
          {[2, 1, 3].map(tableNum => (
            <div key={`back-table-${tableNum}`} className="table vertical-table">
              {!is01To07 && (
                <>
                  <div className="table-seats top-seats">
                    {[49 + (tableNum - 1) * 12, 50 + (tableNum - 1) * 12, 51 + (tableNum - 1) * 12].map(seatNum => (
                      <div 
                        key={seatNum}
                        className={`seat ${bookedSeats[seatNum] ? (bookedSeats[seatNum].status === 0 ? 'booked' : 'cancelled') : ''}`}
                        onClick={(e) => handleSeatClick(seatNum, e)}
                        style={{ cursor: bookedSeats[seatNum] ? 'pointer' : 'default' }}
                      >
                        {seatNum}
                      </div>
                    ))}
                  </div>
                  <div className="table-seats bottom-seats">
                    {[52 + (tableNum - 1) * 12, 53 + (tableNum - 1) * 12, 54 + (tableNum - 1) * 12].map(seatNum => (
                      <div 
                        key={seatNum}
                        className={`seat ${bookedSeats[seatNum] ? (bookedSeats[seatNum].status === 0 ? 'booked' : 'cancelled') : ''}`}
                        onClick={(e) => handleSeatClick(seatNum, e)}
                        style={{ cursor: bookedSeats[seatNum] ? 'pointer' : 'default' }}
                      >
                        {seatNum}
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="table-seats left-seats">
                {[55 + (tableNum - 1) * 12, 56 + (tableNum - 1) * 12, 57 + (tableNum - 1) * 12].map(seatNum => (
                  <div 
                    key={seatNum}
                    className={`seat ${bookedSeats[seatNum] ? (bookedSeats[seatNum].status === 0 ? 'booked' : 'cancelled') : ''}`}
                    onClick={(e) => handleSeatClick(seatNum, e)}
                    style={{ cursor: bookedSeats[seatNum] ? 'pointer' : 'default' }}
                  >
                    {seatNum}
                  </div>
                ))}
              </div>
              <div className="table-seats right-seats">
                {[58 + (tableNum - 1) * 12, 59 + (tableNum - 1) * 12, 60 + (tableNum - 1) * 12].map(seatNum => (
                  <div 
                    key={seatNum}
                    className={`seat ${bookedSeats[seatNum] ? (bookedSeats[seatNum].status === 0 ? 'booked' : 'cancelled') : ''}`}
                    onClick={(e) => handleSeatClick(seatNum, e)}
                    style={{ cursor: bookedSeats[seatNum] ? 'pointer' : 'default' }}
                  >
                    {seatNum}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {selectedSeatDetail && (
          <div 
            className="seat-detail-popup"
            style={{
              left: `${selectedSeatDetail.x}px`,
              top: `${selectedSeatDetail.y}px`
            }}
          >
            <p className="popup-item"><strong>Name:</strong> {selectedSeatDetail.book_name}</p>
            <p className="popup-item"><strong>JCU ID:</strong> {selectedSeatDetail.jcu_id}</p>
          </div>
        )}
      </div>
    );
  };

  const renderClassroomType2 = () => {
    const rows = 10;
    const seatsPerSide = 7;
    const totalSeatsPerRow = seatsPerSide * 2;
    return (
      <div className="classroom-type2">
        <div className="staircase-area"></div>
        <div className="classroom-type2-rows">
          {[...Array(rows)].map((_, rowIndex) => {
            const rowNum = rowIndex + 1;
            const rowBaseNum = rowIndex * totalSeatsPerRow;
            const isStaircaseRow = rowNum <= 5;
            return (
              <div 
                key={`row-${rowNum}`} 
                className={`classroom-row ${isStaircaseRow ? 'staircase-row' : ''}`}
              >
                <div className="seat-group left-group">
                  {[...Array(seatsPerSide)].map((_, seatIndex) => {
                    const seatNum = rowBaseNum + seatIndex + 1;
                    return (
                      <div 
                        key={seatNum}
                        className={`seat ${bookedSeats[seatNum] ? (bookedSeats[seatNum].status === 0 ? 'booked' : 'cancelled') : ''}`}
                        onClick={(e) => handleSeatClick(seatNum, e)}
                        style={{ cursor: bookedSeats[seatNum] ? 'pointer' : 'default' }}
                      >
                        {seatNum}
                      </div>
                    );
                  })}
                </div>
                <div className="seat-group right-group">
                  {[...Array(seatsPerSide)].map((_, seatIndex) => {
                    const seatNum = rowBaseNum + seatsPerSide + seatIndex + 1;
                    return (
                      <div 
                        key={seatNum}
                        className={`seat ${bookedSeats[seatNum] ? (bookedSeats[seatNum].status === 0 ? 'booked' : 'cancelled') : ''}`}
                        onClick={(e) => handleSeatClick(seatNum, e)}
                        style={{ cursor: bookedSeats[seatNum] ? 'pointer' : 'default' }}
                      >
                        {seatNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {selectedSeatDetail && (
          <div 
            className="seat-detail-popup"
            style={{
              left: `${selectedSeatDetail.x}px`,
              top: `${selectedSeatDetail.y}px`
            }}
          >
            <p className="popup-item"><strong>Name:</strong> {selectedSeatDetail.book_name}</p>
            <p className="popup-item"><strong>JCU ID:</strong> {selectedSeatDetail.jcu_id}</p>
          </div>
        )}
      </div>
    );
  };

  const renderSeatMap = () => {
    if (loading) return <div className="loading-state">Loading seat map and booking data...</div>;
    if (!classroomRoom || !selectedDate || !selectedHour) return null;
    const roomNum = classroomRoom.split('-')[1];
    if (['13', '14', '15'].includes(roomNum)) {
      return renderClassroomType2();
    } else {
      return renderClassroomType1();
    }
  };

  const calculateAttendanceRate = () => {
    const totalBookings = bookedCount + cancelledCount;
    return totalBookings === 0 ? 0 : Math.round((bookedCount / totalBookings) * 100);
  };

  const calculateBookingPercentage = () => {
    return totalCapacity === 0 ? 0 : Math.round((bookedCount / totalCapacity) * 100);
  };

  return (
    <div>
      <style>
        {`
        .tutor-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
  margin-top: 45px;
  font-family: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
}
.tutor-sidebar {
  width: 28%;
  background-color: #ffffff;
  padding: 2.5rem;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}
.tutor-main {
  width: 72%;
  padding: 2.5rem;
  background-color: #f8fafc;
  overflow: auto;
}
.tutor-sidebar h2 {
  color: #0f172a;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  font-weight: 700;
}
.form-group {
  margin-bottom: 1.8rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.7rem;
  font-weight: 600;
  color: #334155;
  font-size: 0.95rem;
}
.form-control {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 1rem;
  color: #1e293b;
  background-color: #ffffff;
  transition: all 0.2s ease;
}
.form-control:focus {
  outline: none;
  border-color: #1e40af;
  box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.1);
}
.form-control:disabled {
  background-color: #f1f5f9;
  cursor: not-allowed;
  opacity: 0.8;
}
.end-time-display {
  margin-top: 0.5rem;
  padding: 0.85rem 1rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  font-size: 1rem;
}
.selection-summary {
  margin-top: 2.5rem;
  padding-top: 1.8rem;
  border-top: 1px solid #e2e8f0;
}
.selection-summary h3 {
  margin-bottom: 1.2rem;
  color: #0f172a;
  font-size: 1.1rem;
  font-weight: 600;
}
.selection-summary p {
  margin-bottom: 0.6rem;
  color: #334155;
  font-size: 0.95rem;
}
.tutor-content h1 {
  color: #0f172a;
  margin-bottom: 2.2rem;
  font-size: 2rem;
  font-weight: 700;
}
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100% - 5rem);
  min-height: 500px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  color: #64748b;
  font-size: 1.1rem;
  text-align: center;
  padding: 2rem;
}
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 600px;
  color: #1e40af;
  font-size: 1.1rem;
  font-weight: 600;
}
.location-view h2 {
  color: #1e40af;
  margin-bottom: 1.8rem;
  font-size: 1.4rem;
  font-weight: 600;
}
.booking-stats {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.stat-card {
  text-align: center;
  padding: 0 1.5rem;
}
.stat-card:not(:last-child) {
  border-right: 1px solid #e2e8f0;
}
.stat-title {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
.stat-value {
  color: #0f172a;
  font-size: 1.5rem;
  font-weight: 700;
}
.stat-percentage {
  color: #1e40af;
  font-size: 1.5rem;
  font-weight: 700;
}
.seat-map {
  background-color: #ffffff;
  border-radius: 8px;
  min-height: 600px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  position: relative;
}
.table {
  background-color: #e2e8f0;
  margin: 30px auto;
  position: relative;
}
.horizontal-table {
  width: 180px;
  height: 60px;
}
.vertical-table {
  width: 60px;
  height: 180px;
}
.seat {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #94a3b8;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
  margin: 0 8px;
}
.seat.booked {
  background-color: #ef4444;
}
.seat.cancelled {
  background-color: #94a3b8;
  opacity: 0.7;
}
.table-seats {
  display: flex;
  justify-content: center;
  position: absolute;
}
.top-seats {
  top: -40px;
  left: 0;
  right: 0;
}
.bottom-seats {
  bottom: -40px;
  left: 0;
  right: 0;
}
.left-seats {
  top: 0;
  bottom: 0;
  left: -50px;
  flex-direction: column;
  justify-content: center;
  gap: 15px;
}
.right-seats {
  top: 0;
  bottom: 0;
  right: -50px;
  flex-direction: column;
  justify-content: center;
  gap: 15px;
}
.classroom-type1 {
  position: relative;
  width: 1000px;
  height: 700px;
  border: 1px solid #e2e8f0;
  padding: 60px;
}
.classroom-01-07 {
  width: 1200px;
}
.classroom-01-07 .left-wall-table {
  left: 0px;
}
.classroom-01-07 .right-wall-table {
  right: 0px;
}
.classroom-01-07 .front-wall-tables,
.classroom-01-07 .back-wall-tables {
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  width: 600px;
  justify-content: center;
}
.left-wall-table {
  position: absolute;
  left: 60px;
  top: 50%;
  transform: translateY(-50%);
}
.right-wall-table {
  position: absolute;
  right: 60px;
  top: 50%;
  transform: translateY(-50%);
}
.front-wall-tables {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 100px;
}
.back-wall-tables {
  position: absolute;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 100px;
}
.classroom-type2 {
  width: 900px;
  padding: 0px;
  position: relative;
}
.classroom-type2-rows {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 2;
}
.classroom-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 30px;
}
.seat-group {
  display: flex;
  gap: 0px;
}
.left-group, .right-group {
  display: flex;
  justify-content: center;
}
.staircase-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background-color: #f1f5f9;
  z-index: 1;
}
.staircase-row {
  position: relative;
  z-index: 2;
}
.seat-detail-popup {
  position: absolute;
  background-color: #ffffff;
  border-radius: 6px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  padding: 0.8rem 1.2rem;
  z-index: 10;
  min-width: 180px;
  border: 1px solid #e2e8f0;
}
.popup-item {
  margin: 0.3rem 0;
  font-size: 0.9rem;
  color: #334155;
}
        `}
      </style>
      
      <div className="tutor-container">
        <div className="tutor-sidebar">
          <h2>Classroom Selection</h2>
          
          <div className="form-group">
            <label>Building</label>
            <select 
              value={classroomBuilding} 
              onChange={(e) => setClassroomBuilding(e.target.value)}
              className="form-control"
            >
              <option value="">Select a building</option>
              <option value="A">Building A</option>
              <option value="B">Building B</option>
              <option value="C">Building C</option>
              <option value="E">Building E</option>
            </select>
          </div>
          
          {classroomBuilding !== 'E' && (
            <div className="form-group">
              <label>Floor</label>
              <select 
                value={classroomFloor} 
                onChange={(e) => setClassroomFloor(e.target.value)}
                className="form-control"
                disabled={!classroomBuilding}
              >
                <option value="">Select a floor</option>
                {getAvailableFloors().map(floor => (
                  <option key={floor} value={floor}>Floor {floor}</option>
                ))}
              </select>
            </div>
          )}
          
          {classroomBuilding === 'E' && (
            <div className="form-group">
              <label>Floor</label>
              <input 
                type="text" 
                value="2" 
                readOnly 
                className="form-control"
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Room</label>
            <select 
              value={classroomRoom} 
              onChange={(e) => setClassroomRoom(e.target.value)}
              className="form-control"
              disabled={!classroomBuilding || (classroomBuilding !== 'E' && !classroomFloor)}
            >
              <option value="">Select a room</option>
              {generateClassroomRooms().map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-control"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="form-group">
            <label>Start Time (Hour)</label>
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(e.target.value)}
              className="form-control"
            >
              <option value="">Select hour</option>
              {[...Array(24).keys()].map(hour => (
                <option key={hour} value={hour.toString().padStart(2, '0')}>
                  {hour}:00
                </option>
              ))}
            </select>
          </div>
          
          {selectedHour && (
            <div className="form-group">
              <label>End Time</label>
              <div className="end-time-display">
                {`${endTime}:00`}
              </div>
            </div>
          )}
          
          <div className="selection-summary">
            <h3>Selection Summary</h3>
            <p>Building: {classroomBuilding || 'Not selected'}</p>
            <p>Floor: {classroomFloor ? `Floor ${classroomFloor}` : (classroomBuilding === 'E' ? 'Floor 2' : 'Not selected')}</p>
            <p>Room: {classroomRoom || 'Not selected'}</p>
            
            {selectedDate && selectedHour && (
              <p>Time: {selectedDate} {selectedHour}:00 - {endTime}:00</p>
            )}
          </div>
        </div>
        
        <div className="tutor-main">
          <div className="tutor-content">
            <h1>Tutor Classroom View</h1>
            
            {!classroomBuilding || (classroomBuilding !== 'E' && !classroomFloor) || !classroomRoom ? (
              <div className="empty-state">
                <p>Please complete the classroom selection to view booking details</p>
              </div>
            ) : !selectedDate || !selectedHour ? (
              <div className="empty-state">
                <p>Please select date and time to view classroom booking details</p>
              </div>
            ) : (
              <div className="location-view">
                <h2>Classroom {classroomRoom}</h2>
                
                <div className="booking-stats">
                  <div className="stat-card">
                    <div className="stat-title">Total Capacity</div>
                    <div className="stat-value">{totalCapacity}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Active Bookings</div>
                    <div className="stat-value">{bookedCount}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Cancelled Bookings</div>
                    <div className="stat-value">{cancelledCount}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Booking Rate</div>
                    <div className="stat-percentage">{calculateBookingPercentage()}%</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Attendance Rate</div>
                    <div className="stat-percentage">{calculateAttendanceRate()}%</div>
                  </div>
                </div>
                
                <div className="seat-map" ref={seatMapRef}>
                  {renderSeatMap()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default LecClass;