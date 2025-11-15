// src/components/BookingSuccess.js

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BookingSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get booking information and any potential errors from the route state
    const { bookings, error } = location.state || {};

    const handleBack = () => {
        // Navigate back to the seat selection page
        navigate('/seat');
    };

    // If no booking information is found, display an error message
    if (!bookings || bookings.length === 0) {
        return (
            <div style={styles.container}>
                <h1 style={styles.header}>Action Failed</h1>
                <p>No booking information was found. Please try again.</p>
                <button onClick={handleBack} style={styles.button}>Go Back</button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Booking Successful!</h1>
            <p style={styles.subHeader}>Please scan the QR code(s) below with your mobile phone to check in.</p>
            {error && <p style={styles.errorText}>{error}</p>}

            <div style={styles.qrContainer}>
                {bookings.map((booking, index) => (
                    <div key={index} style={styles.qrItem}>
                        <h3>Seat Number: {booking.seat_number}</h3>
                        <img src={booking.qrcode} alt={`Seat ${booking.seat_number} QR Code`} style={styles.qrImage} />
                    </div>
                ))}
            </div>

            <button onClick={handleBack} style={styles.button}>Return or Continue Booking</button>
        </div>
    );
};

// Basic styling for the component
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: '#f8fafc',
        fontFamily: 'sans-serif',
        textAlign: 'center',
    },
    header: {
        fontSize: '2.5rem',
        color: '#0f172a',
        marginBottom: '1rem',
    },
    subHeader: {
        fontSize: '1.2rem',
        color: '#334155',
        marginBottom: '2rem',
    },
    errorText: {
        color: '#dc2626',
        backgroundColor: '#fee2e2',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '2rem',
    },
    qrContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '2rem',
        marginBottom: '3rem',
    },
    qrItem: {
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
    qrImage: {
        width: '200px',
        height: '200px',
        marginTop: '1rem',
    },
    button: {
        backgroundColor: '#1e40af',
        color: 'white',
        border: 'none',
        padding: '1rem 2rem',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
    },
};

export default BookingSuccess;