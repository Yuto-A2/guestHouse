# [Portfolio] A website of an online marketplace for short-and-long-term homestays (Rent House)
![renthouse](https://github.com/user-attachments/assets/f72c38e5-287f-4adc-a8e0-5af86f71fc53)

## Name of The Service

Rent House

## Summary

For a school project, I developed a house rental website using PHP. Later, I challenged myself to recreate the entire project from scratch using the MERN stack (MongoDB, Express, React, and Node.js).

Guests can make reservations, modify their bookings, check their reservations, view their profiles, and edit their profile information.

In addition, admin users can add and edit guest houses.

For security, passwords are encrypted and salted using Passport.

URL: (https://guest-house-if7i.vercel.app/)

## Production period

About one month.

## Main Feature

### Users

* User registration.
* Login. (via email and password)
* Password reset (Only loged in user).
* View and update personal profile page (Only loged in user).
* Create a reservation and update it (Only loged in user).

### Properties

* View property listings and detailed information.
* Admin users can add, update, and delete properties.

### Review
* Users can post reviews after logging in.
* Reviews can be viewed by all users.
* Only the user who created a review can delete it.

## Tools

* Frontend
  * CSS, React, Typescript
    
* Backend/DB
  * Node.js, MongDB
 
* Framework
  * Express
 
* CI/CD
  * Vercel
 
* Source Code Management
  * Git/GitHub
 
* Others
  * Passport etc

## Database

### Guest

* Fname: string
* lname: string
* email: string
* phone_num: string

### Property

* Address: string
* property_type: string

### Reservation

* Start_date: Date
* End_date: Date
* guest: string (ref: guest)
* property: string (ref: property)

### Review

* Body: string
* Rating: number
* Author: string (ref: guest)
* Property: string (ref: property)





