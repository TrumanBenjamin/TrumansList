# Overview

For this module, I chose to make my own version of Craigslist! This uses a MongoDB Atlas cloud database to store all relevant information on each vehicle that is listed on the website. I have two tables total- one to store the majority of the information on the vehicle and a card image, and another for additional images that would be used in the dedicated vehicle display page. This program is quite simple, but allows the user to add, modify and delete vehicle information. There is a second section that allows you to view all vehicle listings as well. 

I used Craiglist extensively growing up- buying go-karts and dirt bikes and whatever I could get my hands on with a small engine. So, I decided to build my own! I remember Craigslist as always being extremely simple and easy to use, so I jumped in with that in mind. And I was able to do just that! 


[Software Demo Video]https://youtu.be/PmZhI9P4NK8

# Cloud Database

I used a MongoDB Atlas database for this module. This is an easy-to-use, free software that works perfectly for this scenario. This service is a NoSQL service.

My database includes two related collections with a one-to-many structure that is best used for this use-case. I have a collection called "vehicles" and one called "vehicleImages." The vehicles collection stores information such as: title, price, mileage, description, mainImageUrl, available, createdAt and UpdatedAt. The vehicleImages collection stores images like the vehicleId (this is the relation to the vehicles collection), imageUrl, createdAt and updatedAt. 

# Development Environment

I used VSC for my development environment, MongoDB Atlas, Node.js and local browser for testing. 

JavaScript, Node.js, Express.js, MongoDB Node Driver, HTML/CSS/JS and Fetch API were the programming languages I chose to use.

# Useful Websites

{Make a list of websites that you found helpful in this project}

- [Web Site Name]https://www.mongodb.com/docs/atlas/
- [Web Site Name]https://expressjs.com/en/4x/api.html

# Future Work

I will add authentication for the add/modify/delete section. This will only be accessible to authorized users, and will allow users to access their respective listings and modify all information stored in the cloud database. 

I will create a listing spotlight page, so that you can click on the cards and see more information and images associated with the listing. This will function similarly to Craigslist and will be a good way for users to interact with the listings. 

Another small thing I'll add is an "add photos" box that opens up the user's images folder so they can add/drop in photos instead of manually typing in the connection string. 