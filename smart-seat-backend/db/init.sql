CREATE DATABASE IF NOT EXISTS smart_seat;
USE smart_seat;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'student',
  name VARCHAR(255) NULL,
  jcu_id VARCHAR(8) NULL UNIQUE,
  gender VARCHAR(10) NULL,
  birthday DATE NULL,
  major VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS bookings;
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room VARCHAR(50) NOT NULL,
  seat_number INT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  book_name VARCHAR(100) NOT NULL,
  book_id INT NOT NULL,
  status TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_booking (room, seat_number, date, start_time),
  CONSTRAINT fk_booking_user FOREIGN KEY (book_id) REFERENCES users (id) ON DELETE CASCADE
);

INSERT INTO users (email, password, role, name, jcu_id, gender, birthday, major)
VALUES ('test@jcu.edu.au', '$2a$10$EixZaYb051a2U6k8G9Kz2e8G9H0i1J2K3L4M5N6O7P8Q9R0S1T2U', 'student', 'Test User', '12345678', 'male', '2000-01-01', 'Computer Science');

INSERT INTO bookings (room, seat_number, date, start_time, end_time, book_name, book_id, status)
VALUES ('library-1', 5, CURDATE(), '14:00:00', '16:00:00', 'Test User', 1, 0);

INSERT INTO users (id, email, password, role, name, jcu_id)
VALUES (99999999, 'system@smartseat.local', '', 'system', 'System', '00000000');
