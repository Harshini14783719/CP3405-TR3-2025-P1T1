const Mine = () => {
  return (
    <div style={{  'width': '100%', 'min-height': '100vh', }}>
      <h1>My Reservations</h1>
      <div style={{ 
        marginTop: '2rem', 
        padding: '2rem', 
        backgroundColor: '#ffffff', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' 
      }}>
        <p style={{ color: '#64748b', textAlign: 'center', fontSize: '1.1rem' }}>
          No reservations found. Make your first reservation in the Seat section.
        </p>
      </div>
    </div>
  );
};

export default Mine;
