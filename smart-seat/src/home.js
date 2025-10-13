const Home = () => {
  return (
    <div>
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }

          html {
            scroll-behavior: smooth;
          }

          body {
            color: #333;
          }

          .navbar {
            background-color: #1a365d;
            color: white;
            padding: 1rem 5%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }

          .logo {
            font-size: 1.5rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .logo-icon {
            font-size: 1.8rem;
          }

          .nav-links {
            display: flex;
            gap: 2rem;
          }

          .nav-links a {
            color: white;
            text-decoration: none;
            font-weight: 500;
            transition: opacity 0.3s;
          }

          .nav-links a:hover {
            opacity: 0.8;
          }

          .hero {
            background-color: #f8fafc;
            padding: 8rem 5% 10rem;
            background-image: linear-gradient(135deg, #1a365d 0%, #2563eb 100%);
            color: white;
            position: relative;
            overflow: hidden;
          }

          .hero::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100px;
            background-image: linear-gradient(to top, white, transparent);
          }

          .hero-content {
            max-width: 800px;
            position: relative;
            z-index: 10;
          }

          .hero h1 {
            font-size: 3.5rem;
            margin-bottom: 1.5rem;
            line-height: 1.2;
          }

          .hero p {
            font-size: 1.2rem;
            margin-bottom: 2.5rem;
            opacity: 0.9;
            max-width: 600px;
          }

          .btn {
            display: inline-block;
            background-color: #f97316;
            color: white;
            padding: 0.8rem 2rem;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
            font-size: 1rem;
          }

          .btn:hover {
            background-color: #ea580c;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
          }

          .section {
            padding: 8rem 5%;
          }

          .section-title {
            font-size: 2.2rem;
            color: #1a365d;
            margin-bottom: 4rem;
            text-align: center;
            position: relative;
          }

          .section-title::after {
            content: '';
            position: absolute;
            bottom: -12px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 4px;
            background-color: #2563eb;
            border-radius: 2px;
          }

          .about-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5rem;
            align-items: center;
          }

          .about-text h3 {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            color: #1e293b;
          }

          .about-text p {
            margin-bottom: 1.5rem;
            color: #64748b;
          }

          .about-image {
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }

          .about-image img {
            width: 100%;
            height: auto;
            display: block;
          }

          .features {
            background-color: #f8fafc;
          }

          .features-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 3rem;
          }

          .feature-card {
            background-color: white;
            padding: 2.5rem;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            transition: transform 0.3s, box-shadow 0.3s;
          }

          .feature-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.1);
          }

          .feature-icon {
            font-size: 2.5rem;
            color: #2563eb;
            margin-bottom: 1.5rem;
          }

          .feature-card h3 {
            font-size: 1.4rem;
            margin-bottom: 1rem;
            color: #1e293b;
          }

          .feature-card p {
            color: #64748b;
          }

          .audiences {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 4rem;
          }

          .audience-card {
            padding: 3rem;
            border-radius: 12px;
            background-color: white;
            border: 1px solid #e2e8f0;
            transition: all 0.3s;
          }

          .audience-card:hover {
            border-color: #2563eb;
            box-shadow: 0 10px 25px rgba(37, 99, 235, 0.08);
          }

          .audience-card h3 {
            font-size: 1.6rem;
            margin-bottom: 1.5rem;
            color: #1a365d;
            display: flex;
            align-items: center;
            gap: 0.8rem;
          }

          .audience-card ul {
            list-style-position: inside;
            color: #64748b;
          }

          .audience-card li {
            margin-bottom: 1rem;
          }

          .how-it-works {
            background-color: #f8fafc;
          }

          .steps {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 2rem;
            position: relative;
          }

          .steps::before {
            content: '';
            position: absolute;
            top: 50px;
            left: 0;
            width: 100%;
            height: 4px;
            background-color: #cbd5e1;
            z-index: 1;
          }

          .step {
            background-color: white;
            padding: 2rem 1.5rem;
            border-radius: 12px;
            text-align: center;
            position: relative;
            z-index: 2;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          }

          .step-number {
            width: 40px;
            height: 40px;
            background-color: #2563eb;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin: 0 auto 1.5rem;
          }

          .step h3 {
            margin-bottom: 1rem;
            color: #1e293b;
          }

          .step p {
            color: #64748b;
            font-size: 0.95rem;
          }

          .testimonials {
            padding-bottom: 10rem;
          }

          .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 3rem;
          }

          .testimonial-card {
            background-color: white;
            padding: 2.5rem;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            border-top: 4px solid #2563eb;
          }

          .testimonial-text {
            font-style: italic;
            margin-bottom: 1.5rem;
            color: #475569;
          }

          .testimonial-author {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .author-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #e2e8f0;
            overflow: hidden;
          }

          .author-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .author-info h4 {
            color: #1e293b;
            font-size: 1rem;
          }

          .author-info p {
            color: #64748b;
            font-size: 0.9rem;
          }

          .cta {
            background-color: #1a365d;
            color: white;
            padding: 8rem 5%;
            text-align: center;
            position: relative;
            overflow: hidden;
          }

          .cta::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          }

          .cta-content {
            max-width: 700px;
            margin: 0 auto;
            position: relative;
            z-index: 2;
          }

          .cta h2 {
            font-size: 2.5rem;
            margin-bottom: 1.5rem;
          }

          .cta p {
            font-size: 1.1rem;
            margin-bottom: 3rem;
            opacity: 0.9;
          }

          .footer {
            background-color: #0f172a;
            color: #94a3b8;
            padding: 5rem 5% 2rem;
          }

          .footer-content {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 4rem;
            margin-bottom: 4rem;
          }

          .footer-logo {
            color: white;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .footer-desc {
            margin-bottom: 2rem;
            max-width: 300px;
          }

          .footer-links h4 {
            color: white;
            margin-bottom: 1.5rem;
            font-size: 1.1rem;
          }

          .footer-links ul {
            list-style: none;
          }

          .footer-links li {
            margin-bottom: 1rem;
          }

          .footer-links a {
            color: #94a3b8;
            text-decoration: none;
            transition: color 0.3s;
          }

          .footer-links a:hover {
            color: white;
          }

          .copyright {
            text-align: center;
            padding-top: 2rem;
            border-top: 1px solid #1e293b;
            font-size: 0.9rem;
          }

          /* Mobile Navigation */
          .mobile-bottom-nav {
            display: none;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px;
            background-color: #ffffff;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
            z-index: 9998;
            justify-content: space-around;
            align-items: center;
          }

          .mobile-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #4E5969;
            text-decoration: none;
            font-size: 10px;
            width: 33.33%;
            height: 100%;
          }

          .active-mobile-nav-item {
            color: #165DFF;
          }

          .mobile-nav-icon {
            font-size: 20px;
            margin-bottom: 4px;
          }

          /* Media Queries for Tablet and Mobile */
          @media (max-width: 1024px) {
            .hero h1 {
              font-size: 2.8rem;
            }
            
            .features-grid {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .testimonials-grid {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .footer-content {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 768px) {
            .navbar .nav-links {
              display: none;
            }
            
            .hero {
              padding: 6rem 5% 8rem;
            }
            
            .hero h1 {
              font-size: 2.2rem;
            }
            
            .hero p {
              font-size: 1rem;
            }
            
            .section {
              padding: 5rem 5%;
            }
            
            .section-title {
              font-size: 1.8rem;
            }
            
            .about-container {
              grid-template-columns: 1fr;
              gap: 3rem;
            }
            
            .features-grid {
              grid-template-columns: 1fr;
            }
            
            .audiences {
              grid-template-columns: 1fr;
              gap: 2rem;
            }
            
            .steps {
              grid-template-columns: 1fr;
              gap: 3rem;
            }
            
            .steps::before {
              display: none;
            }
            
            .testimonials-grid {
              grid-template-columns: 1fr;
            }
            
            .testimonials {
              padding-bottom: 8rem;
            }
            
            .cta h2 {
              font-size: 2rem;
            }
            
            .footer-content {
              grid-template-columns: 1fr;
              gap: 2rem;
            }
            
            /* Show mobile bottom navigation */
            .mobile-bottom-nav {
              display: flex;
            }
            
            /* Adjust content for mobile nav */
            .footer {
              padding-bottom: 80px;
            }
            
            .cta {
              padding-bottom: 6rem;
            }
          }

          @media (max-width: 480px) {
            .hero h1 {
              font-size: 1.8rem;
            }
            
            .btn {
              padding: 0.7rem 1.5rem;
              font-size: 0.9rem;
            }
            
            .feature-card, .audience-card, .step, .testimonial-card {
              padding: 1.5rem;
            }
            
            .cta h2 {
              font-size: 1.6rem;
            }
          }
        `}
      </style>

      <section className="hero">
        <div className="hero-content">
          <h1>Smart Seat Reservation System</h1>
          <p>Streamline your campus experience with our intuitive seat booking platform designed exclusively for university students and faculty.</p>
          <a href="/seat" className="btn">Reserve a Seat Now</a>
        </div>
      </section>

      <section id="about" className="section">
        <h2 className="section-title">About Smart Seat</h2>
        <div className="about-container">
          <div className="about-text">
            <h3>Revolutionizing Campus Space Management</h3>
            <p>Smart Seat is an innovative reservation system developed specifically for university campuses to address the challenges of finding and securing seats in high-demand areas such as libraries, classrooms, and canteens.</p>
            <p>Our mission is to create a seamless experience that saves time for both students and faculty, allowing them to focus on what truly matters - education and research.</p>
            <p>Launched in 2023, Smart Seat has already been adopted by 5 major universities, serving over 25,000 users daily with an average satisfaction rate of 96%.</p>
          </div>
          <div className="about-image">
            <img src="https://picsum.photos/id/24/800/600" alt="Students using Smart Seat in library" />
          </div>
        </div>
      </section>

      <section id="features" className="section features">
        <h2 className="section-title">Our Advantages</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Instant Reservations</h3>
            <p>Book your preferred seat in seconds with our streamlined booking process, accessible from any device.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Real-time Availability</h3>
            <p>Check live updates of seat availability across campus locations to plan your day effectively.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Smart Reminders</h3>
            <p>Receive timely notifications about your upcoming reservations and any changes to your bookings.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Usage Analytics</h3>
            <p>Gain insights into your study patterns and optimize your schedule with personalized analytics.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Flexible Modifications</h3>
            <p>Easily adjust or cancel your reservations without hassle, with clear policies for last-minute changes.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Access</h3>
            <p>Integrated with university authentication systems to ensure secure and authorized access only.</p>
          </div>
        </div>
      </section>

      <section id="audiences" className="section">
        <h2 className="section-title">For Whom We Designed</h2>
        <div className="audiences">
          <div className="audience-card">
            <h3>🎓 Students</h3>
            <ul>
              <li>Reserve study spaces in libraries during peak exam periods</li>
              <li>Book group project rooms with multimedia equipment</li>
              <li>Secure seats in popular canteen areas during lunch hours</li>
              <li>Plan your daily schedule with reliable seat availability</li>
              <li>Join waiting lists for fully booked high-demand areas</li>
            </ul>
          </div>
          <div className="audience-card">
            <h3>👨‍🏫 Faculty</h3>
            <ul>
              <li>Reserve lecture halls and seminar rooms for additional sessions</li>
              <li>Book consultation spaces for student meetings</li>
              <li>Schedule research time in specialized laboratory areas</li>
              <li>Manage departmental space allocations efficiently</li>
              <li>Access usage reports for better resource planning</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section how-it-works">
        <h2 className="section-title">How Smart Seat Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Log In</h3>
            <p>Access the system using your university credentials for secure authentication.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Select Location</h3>
            <p>Choose from available campus locations including libraries, classrooms, and canteens.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Choose Time</h3>
            <p>Select your preferred date and time slot for your reservation.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Confirm & Enjoy</h3>
            <p>Receive your confirmation and QR code for easy check-in at your reserved seat.</p>
          </div>
        </div>
      </section>

      <section id="testimonials" className="section testimonials">
        <h2 className="section-title">What Our Users Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p className="testimonial-text">"Smart Seat has transformed how I plan my study sessions. No more wasted time searching for available seats during exam week. It's a game-changer!"</p>
            <div className="testimonial-author">
              <div className="author-avatar">
                <img src="https://picsum.photos/id/64/100/100" alt="Student" />
              </div>
              <div className="author-info">
                <h4>Sarah Johnson</h4>
                <p>Third-year Computer Science Student</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-text">"As a professor, I appreciate how easily I can reserve spaces for my office hours. The system integrates seamlessly with our university calendar."</p>
            <div className="testimonial-author">
              <div className="author-avatar">
                <img src="https://picsum.photos/id/91/100/100" alt="Professor" />
              </div>
              <div className="author-info">
                <h4>Dr. Michael Chen</h4>
                <p>Professor of Mechanical Engineering</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-text">"Managing library resources has become so much easier with Smart Seat. We've seen a 40% reduction in conflicts and complaints since implementation."</p>
            <div className="testimonial-author">
              <div className="author-avatar">
                <img src="https://picsum.photos/id/26/100/100" alt="Librarian" />
              </div>
              <div className="author-info">
                <h4>Emily Rodriguez</h4>
                <p>University Library Manager</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-content">
          <h2>Ready to Transform Your Campus Experience?</h2>
          <p>Join thousands of students and faculty who have simplified their daily campus routine with Smart Seat's intuitive reservation system.</p>
          <a href="/seat" className="btn">Reserve Your Seat Today</a>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">🪑</span>
              <span>Smart Seat</span>
            </div>
            <p className="footer-desc">Revolutionizing campus space management with smart, efficient seat reservation solutions for universities.</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="/seat">Reserve Seat</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">User Guide</a></li>
              <li><a href="#">Contact Support</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Contact</h4>
            <ul>
              <li><a href="#">support@smartseat.edu</a></li>
              <li><a href="#">+1 (555) 123-4567</a></li>
              <li><a href="#">University Campus, Building 10</a></li>
            </ul>
          </div>
        </div>
        <div className="copyright">
          <p>&copy; {new Date().getFullYear()} Smart Seat. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};
export default Home;