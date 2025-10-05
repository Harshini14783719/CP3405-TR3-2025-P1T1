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
  );
};

export default Seat;