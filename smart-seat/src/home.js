const Home = () => {
  return (
    <div>
      <style>
        {`
          .home-container {
  width: 100%;
  min-height: 100vh;
          }

          .home-title {
          margin: 0;
          }

          .home-description {
          color: #64748b;
          font-size: 1.1rem;
          margin-top: 1.5rem;
          max-width: 800px;
          }`
        }
      </style>


      <div className="home-container">
        <h1 className="home-title">Welcome to Smart Seat</h1>
        <p className="home-description">
          Efficiently reserve seats in classrooms, canteen, or library with our smart reservation system.
          Select "Seat" from the navigation menu to start your reservation.
        </p>
      </div>
    </div>
  );
};


export default Home;