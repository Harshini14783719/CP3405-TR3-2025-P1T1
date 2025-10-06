import React, { useState, useEffect } from 'react';

const Seat = () => {
  const [location, setLocation] = useState('');
  const [libraryFloor, setLibraryFloor] = useState('');
  const [classroomBuilding, setClassroomBuilding] = useState('');
  const [classroomFloor, setClassroomFloor] = useState('');
  const [classroomRoom, setClassroomRoom] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);

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
    setSelectedSeats([]);
  }, [location, classroomBuilding, classroomFloor, classroomRoom]);

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

  const toggleSeat = (seatId) => {
    setSelectedSeats(prev => 
      prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const renderCanteenSeats = () => {
    const columns = 3;
    const tablesPerColumn = 5;
    const seatsPerTable = 3;
    
    return (
      <div className="canteen-layout">
        {[...Array(columns)].map((_, colIndex) => (
          <div key={`col-${colIndex + 1}`} className="canteen-column">
            {[...Array(tablesPerColumn)].map((_, tableIndex) => (
              <div key={`table-${tableIndex + 1}`} className="table horizontal-table">
                <div className="table-seats top-seats">
                  {[...Array(seatsPerTable)].map((_, seatIndex) => {
                    const baseNum = (colIndex * tablesPerColumn + tableIndex) * seatsPerTable * 2;
                    const seatNum = baseNum + seatIndex + 1;
                    const seatId = `canteen_${seatNum}`;
                    return (
                      <div 
                        key={seatId}
                        className={`seat ${selectedSeats.includes(seatId) ? 'selected' : ''}`}
                        onClick={() => toggleSeat(seatId)}
                      >
                        {seatNum}
                      </div>
                    );
                  })}
                </div>
                <div className="table-seats bottom-seats">
                  {[...Array(seatsPerTable)].map((_, seatIndex) => {
                    const baseNum = (colIndex * tablesPerColumn + tableIndex) * seatsPerTable * 2 + seatsPerTable;
                    const seatNum = baseNum + seatIndex + 1;
                    const seatId = `canteen_${seatNum}`;
                    return (
                      <div 
                        key={seatId}
                        className={`seat ${selectedSeats.includes(seatId) ? 'selected' : ''}`}
                        onClick={() => toggleSeat(seatId)}
                      >
                        {seatNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderLibrarySeats = () => {
    const columns = 2;
    const tablesPerColumn = libraryFloor === '1' ? 4 : 8;
    const seatsPerTable = 4;
    
    return (
      <div className="library-layout">
        {[...Array(columns)].map((_, colIndex) => (
          <div key={`col-${colIndex + 1}`} className="library-column">
            {[...Array(tablesPerColumn)].map((_, tableIndex) => (
              <div key={`table-${tableIndex + 1}`} className="table horizontal-table">
                <div className="table-seats top-seats">
                  {[...Array(seatsPerTable)].map((_, seatIndex) => {
                    const baseNum = (colIndex * tablesPerColumn + tableIndex) * seatsPerTable * 2;
                    const seatNum = baseNum + seatIndex + 1;
                    const seatId = `lib${libraryFloor}_${seatNum}`;
                    return (
                      <div 
                        key={seatId}
                        className={`seat ${selectedSeats.includes(seatId) ? 'selected' : ''}`}
                        onClick={() => toggleSeat(seatId)}
                      >
                        {seatNum}
                      </div>
                    );
                  })}
                </div>
                <div className="table-seats bottom-seats">
                  {[...Array(seatsPerTable)].map((_, seatIndex) => {
                    const baseNum = (colIndex * tablesPerColumn + tableIndex) * seatsPerTable * 2 + seatsPerTable;
                    const seatNum = baseNum + seatIndex + 1;
                    const seatId = `lib${libraryFloor}_${seatNum}`;
                    return (
                      <div 
                        key={seatId}
                        className={`seat ${selectedSeats.includes(seatId) ? 'selected' : ''}`}
                        onClick={() => toggleSeat(seatId)}
                      >
                        {seatNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderClassroomType1 = () => {
    const roomNum = classroomRoom.split('-')[1];
    const is01To07 = roomNum && parseInt(roomNum, 10) >= 1 && parseInt(roomNum, 10) <= 7;
    
    return (
      <div className={`classroom-type1 ${is01To07 ? 'classroom-01-07' : ''}`}>
        <div className="left-wall-table table horizontal-table">
          <div className="table-seats top-seats">
            {[1, 2, 3].map(seatNum => {
              const seatId = `${classroomRoom}_left_top_${seatNum}`;
              return (
                <div 
                  key={seatId}
                  className={`seat ${selectedSeats.includes(seatId) ? 'selected' : ''}`}
                  onClick={() => toggleSeat(seatId)}
                >
                  {seatNum}
                </div>
              );
            })}
          </div>
          <div className="table-seats bottom-seats">
            {[4, 5, 6].map(seatNum => {
              const seatId = `${classroomRoom}_left_bottom_${seatNum}`;
              return (
                <div 
                  key={seatId}
                  className={`seat ${selectedSeats.includes(seatId) ? 'selected' : ''}`}
                  onClick={() => toggleSeat(seatId)}
                >
                  {seatNum}
                </div>
              );
            })}
          </div>
        </div>

        <div className="right-wall-table table horizontal-table">
          <div className="table-seats top-seats">
            {[7, 8, 9].map(seatNum => {
              const seatId = `${classroomRoom}_right_top_${seatNum}`;
              return (
                <div 
                  key={seatId}
                  className={`seat ${selectedSeats.includes(seatId) ? 'selected' : ''}`}
                  onClick={() => toggleSeat(seatId)}
                >
                  {seatNum}
                </div>
              );
            })}
          </div>
          <div className="table-seats bottom-seats">
            {[10, 11, 12].map(seatNum => {
              const seatId = `${classroomRoom}_right_bottom_${seatNum}`;
              return (
                <div 
                  key={seatId}
                  className={`seat ${selectedSeats.includes(seatId) ? 'selected' : ''}`}
                  onClick={() => toggleSeat(seatId)}
                >
                  {seatNum}
                </div>
              );
            })}
          </div>
        </div>

<div className="front-wall-tables">
  {[2, 1, 3].map(tableNum => ( // 原数组为 [1,2,3]，改为 [2,1,3]
    <div key={`front-table-${tableNum}`} className="table vertical-table">
      {/* 原有座位逻辑完全不变，仅修改tableNum顺序 */}
      {!is01To07 && (
        <>
          <div className="table-seats top-seats">
            {[13 + (tableNum - 1) * 12, 14 + (tableNum - 1) * 12, 15 + (tableNum - 1) * 12].map(seatNum => {
              const seatId = `${classroomRoom}_front${tableNum}_top_${seatNum}`;
              return (
                <div 
                  key={seatId}
                  className={`seat ${selectedSeats.includes(seatId) ? 'selected' : ''}`}
                  onClick={() => toggleSeat(seatId)}
                >
                  {seatNum}
                </div>
              );
            })}
          </div>
          <div className="table-seats bottom-seats">
            {[16 + (tableNum - 1) * 12, 17 + (tableNum - 1) * 12, 18 + (tableNum - 1) * 12].map(seatNum => {
              const seatId = `${classroomRoom}_front${tableNum}_bottom_${seatNum}`;
              return (
                <div 
                  key={seatId}
                  className={`seat ${selectedSeats.includes(seatId) ? 'selected' : ''}`}
                  onClick={() => toggleSeat(seatId)}
                >
                  {seatNum}
                </div>
              );
            })}
          </div>
        </>
      )}
      <div className="table-seats left-seats">
        {[19 + (tableNum - 1) * 12, 20 + (tableNum - 1) * 12, 21 + (tableNum - 1) * 12].map(seatNum => {
          const seatId = `${classroomRoom}_front${tableNum}_left_${seatNum}`;
          return (
            <div 
              key={seatId}
              className={`seat ${selectedSeats.includes(seatId) ? 'selected' : ''}`}
              onClick={() => toggleSeat(seatId)}
            >
              {seatNum}
            </div>
          );
        })}
      </div>
      <div className="table-seats right-seats">
        {[22 + (tableNum - 1) * 12, 23 + (tableNum - 1) * 12, 24 + (tableNum - 1) * 12].map(seatNum => {
          const seatId = `${classroomRoom}_front${tableNum}_right_${seatNum}`;
          return (
            <div 
              key={seatId}
              className={`seat ${selectedSeats.includes(seatId) ? 'selected' : ''}`}
              onClick={() => toggleSeat(seatId)}
            >
              {seatNum}
            </div>
          );
        })}
      </div>
    </div>
  ))}
</div>

  <div className="back-wall-tables">
  {[2, 1, 3].map(tableNum => ( // 原数组为 [1,2,3]，改为 [2,1,3]
    <div key={`back-table-${tableNum}`} className="table vertical-table">
      {/* 原有座位逻辑完全不变，仅修改tableNum顺序 */}
      {!is01To07 && (
        <>
          <div className="table-seats top-seats">
            {[49 + (tableNum - 1) * 12, 50 + (tableNum - 1) * 12, 51 + (tableNum - 1) * 12].map(seatNum => {
              const seatId = `${classroomRoom}_back${tableNum}_top_${seatNum}`;
              return (
                <div 
                  key={seatId}
                  className={`seat ${selectedSeats.includes(seatId) ? 'selected' : ''}`}
                  onClick={() => toggleSeat(seatId)}
                >
                  {seatNum}
                </div>
              );
            })}
          </div>
          <div className="table-seats bottom-seats">
            {[52 + (tableNum - 1) * 12, 53 + (tableNum - 1) * 12, 54 + (tableNum - 1) * 12].map(seatNum => {
              const seatId = `${classroomRoom}_back${tableNum}_bottom_${seatNum}`;
              return (
                <div 
                  key={seatId}
                  className={`seat ${selectedSeats.includes(seatId) ? 'selected' : ''}`}
                  onClick={() => toggleSeat(seatId)}
                >
                  {seatNum}
                </div>
              );
            })}
          </div>
        </>
      )}
      <div className="table-seats left-seats">
        {[55 + (tableNum - 1) * 12, 56 + (tableNum - 1) * 12, 57 + (tableNum - 1) * 12].map(seatNum => {
          const seatId = `${classroomRoom}_back${tableNum}_left_${seatNum}`;
          return (
            <div 
              key={seatId}
              className={`seat ${selectedSeats.includes(seatId) ? 'selected' : ''}`}
              onClick={() => toggleSeat(seatId)}
            >
              {seatNum}
            </div>
          );
        })}
      </div>
      <div className="table-seats right-seats">
        {[58 + (tableNum - 1) * 12, 59 + (tableNum - 1) * 12, 60 + (tableNum - 1) * 12].map(seatNum => {
          const seatId = `${classroomRoom}_back${tableNum}_right_${seatNum}`;
          return (
            <div 
              key={seatId}
              className={`seat ${selectedSeats.includes(seatId) ? 'selected' : ''}`}
              onClick={() => toggleSeat(seatId)}
            >
              {seatNum}
            </div>
          );
        })}
      </div>
    </div>
  ))}
</div>
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
                    const seatId = `${classroomRoom}_${seatNum}`;
                    return (
                      <div 
                        key={seatId}
                        className={`seat ${selectedSeats.includes(seatId) ? 'selected' : ''}`}
                        onClick={() => toggleSeat(seatId)}
                      >
                        {seatNum}
                      </div>
                    );
                  })}
                </div>
                <div className="seat-group right-group">
                  {[...Array(seatsPerSide)].map((_, seatIndex) => {
                    const seatNum = rowBaseNum + seatsPerSide + seatIndex + 1;
                    const seatId = `${classroomRoom}_${seatNum}`;
                    return (
                      <div 
                        key={seatId}
                        className={`seat ${selectedSeats.includes(seatId) ? 'selected' : ''}`}
                        onClick={() => toggleSeat(seatId)}
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
      </div>
    );
  };

  const renderSeatMap = () => {
    if (location === 'canteen') {
      return renderCanteenSeats();
    } else if (location === 'library' && libraryFloor) {
      return renderLibrarySeats();
    } else if (location === 'classroom' && classroomRoom) {
      const roomNum = classroomRoom.split('-')[1];
      if (['13', '14', '15'].includes(roomNum)) {
        return renderClassroomType2();
      } else {
        return renderClassroomType1();
      }
    }
    return null;
  };

  return (
    <div>
      <style>
        {`
        .seat-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
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
  overflow: auto;
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

.selection-summary .selected-seats {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f1f5f9;
  border-radius: 6px;
}

.selection-summary .selected-seats p {
  margin-bottom: 0.3rem;
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
  min-height: 600px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
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
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 8px;
}

.seat.selected {
  background-color: #1e40af;
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

.canteen-layout {
  display: flex;
  width: 100%;
  justify-content: space-around;
  padding: 20px;
}

.canteen-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.library-layout {
  display: flex;
  width: 100%;
  justify-content: space-around;
  padding: 20px;
}

.library-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
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
  bottom: 00px;
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
        `}
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
              <p>Floor: {classroomFloor ? `Floor ${classroomFloor}` : (classroomBuilding === 'E' ? 'Floor 2' : 'Not selected')}</p>
              <p>Room: {classroomRoom || 'Not selected'}</p>
            </>
          )}
          
          {selectedSeats.length > 0 && (
            <div className="selected-seats">
              <h4>Selected Seats:</h4>
              {selectedSeats.map(seat => {
                let roomIdentifier = '';
                let seatNumber = '';
                
                if (location === 'classroom' && classroomRoom) {
                  roomIdentifier = classroomRoom;
                  const seatParts = seat.split('_');
                  seatNumber = seatParts.pop();
                } else if (location === 'library' && libraryFloor) {
                  roomIdentifier = `Library Floor ${libraryFloor}`;
                  const seatParts = seat.split('_');
                  seatNumber = seatParts.pop();
                } else if (location === 'canteen') {
                  roomIdentifier = 'Canteen';
                  const seatParts = seat.split('_');
                  seatNumber = seatParts.pop();
                }
                
                return <p key={seat}>({roomIdentifier}) {seatNumber}</p>;
              })}
            </div>
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
                {renderSeatMap()}
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
                {renderSeatMap()}
              </div>
            </div>
          ) : location === 'classroom' && (!classroomBuilding || (classroomBuilding !== 'E' && !classroomFloor) || !classroomRoom) ? (
            <div className="empty-state">
              <p>Please complete the classroom selection to view seating</p>
            </div>
          ) : (
            <div className="location-view">
              <h2>Classroom {classroomRoom}</h2>
              <div className="seat-map">
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

export default Seat;