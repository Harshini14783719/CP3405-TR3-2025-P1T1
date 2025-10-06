import React, { useState } from 'react';
import './seat.css';

const Seat = () => {
  const [location, setLocation] = useState('');
  const [libraryFloor, setLibraryFloor] = useState('');
  const [classroomBuilding, setClassroomBuilding] = useState('');
  const [classroomFloor, setClassroomFloor] = useState('');
  const [classroomRoom, setClassroomRoom] = useState('');

  const generateClassroomRooms = () => {
    if (!classroomBuilding || !classroomFloor) return [];
    
    const validRooms = [...Array(7).keys()].map(i => (i + 1).toString().padStart(2, '0'))
      .concat([13, 14, 15].map(num => num.toString()));
    
    return validRooms.map(room => `${classroomBuilding}${classroomFloor}-${room}`);
  };

  return (
    <div>
      <style>
        {`
        .seat-container {
  display: flex;
  min-height: calc(100vh - 80px);
  width: 100%;
}

.seat-sidebar {
  width: 28%;
  background-color: #ffffff;
  padding: 2.5rem;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}

.seat-main {
  width: 72%;
  padding: 2.5rem;
  background-color: #f8fafc;
}

.seat-sidebar h2 {
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

.seat-content h1 {
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

.location-view h2 {
  color: #1e40af;
  margin-bottom: 1.8rem;
  font-size: 1.4rem;
  font-weight: 600;
}

.seat-map {
  background-color: #ffffff;
  border-radius: 8px;
  min-height: 500px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  color: #64748b;
  text-align: center;
  font-size: 1.05rem;
  max-width: 60%;
}`
}
      </style>
    <div className="seat-container">
      <div className="seat-sidebar">
        <h2>Select Location</h2>
        
        <div className="form-group">
          <label>Location</label>
          <select 
            value={location} 
            onChange={(e) => setLocation(e.target.value)}
            className="form-control"
          >
            <option value="">Select a location</option>
            <option value="classroom">Classroom</option>
            <option value="canteen">Canteen</option>
            <option value="library">Library</option>
          </select>
        </div>
        
        {location === 'library' && (
          <div className="form-group">
            <label>Library Floor</label>
            <select 
              value={libraryFloor} 
              onChange={(e) => setLibraryFloor(e.target.value)}
              className="form-control"
            >
              <option value="">Select a floor</option>
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
            </select>
          </div>
        )}
        
        {location === 'classroom' && (
          <>
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
            
            <div className="form-group">
              <label>Floor</label>
              <select 
                value={classroomFloor} 
                onChange={(e) => setClassroomFloor(e.target.value)}
                className="form-control"
                disabled={!classroomBuilding}
              >
                <option value="">Select a floor</option>
                {[1, 2, 3, 4, 5].map(floor => (
                  <option key={floor} value={floor}>Floor {floor}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Room</label>
              <select 
                value={classroomRoom} 
                onChange={(e) => setClassroomRoom(e.target.value)}
                className="form-control"
                disabled={!classroomBuilding || !classroomFloor}
              >
                <option value="">Select a room</option>
                {generateClassroomRooms().map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>
          </>
        )}
        
        <div className="selection-summary">
          <h3>Selection Summary</h3>
          <p>Location: {location ? location.charAt(0).toUpperCase() + location.slice(1) : 'Not selected'}</p>
          
          {location === 'library' && (
            <p>Floor: {libraryFloor ? `Floor ${libraryFloor}` : 'Not selected'}</p>
          )}
          
          {location === 'classroom' && (
            <>
              <p>Building: {classroomBuilding || 'Not selected'}</p>
              <p>Floor: {classroomFloor ? `Floor ${classroomFloor}` : 'Not selected'}</p>
              <p>Room: {classroomRoom || 'Not selected'}</p>
            </>
          )}
        </div>
      </div>
      
      <div className="seat-main">
        <div className="seat-content">
          <h1>Seat Reservation</h1>
          
          {!location ? (
            <div className="empty-state">
              <p>Please select a location from the sidebar to view available seats</p>
            </div>
          ) : location === 'canteen' ? (
            <div className="location-view">
              <h2>Canteen Seating</h2>
              <div className="seat-map">
                <div className="placeholder-content">Canteen seat layout visualization will appear here</div>
              </div>
            </div>
          ) : location === 'library' && !libraryFloor ? (
            <div className="empty-state">
              <p>Please select a floor to view library seating</p>
            </div>
          ) : location === 'library' ? (
            <div className="location-view">
              <h2>Library - Floor {libraryFloor}</h2>
              <div className="seat-map">
                <div className="placeholder-content">Library floor {libraryFloor} seat layout visualization will appear here</div>
              </div>
            </div>
          ) : location === 'classroom' && (!classroomBuilding || !classroomFloor || !classroomRoom) ? (
            <div className="empty-state">
              <p>Please complete the classroom selection to view seating</p>
            </div>
          ) : (
            <div className="location-view">
              <h2>Classroom {classroomRoom}</h2>
              <div className="seat-map">
                <div className="placeholder-content">Classroom {classroomRoom} seat layout visualization will appear here</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default Seat;