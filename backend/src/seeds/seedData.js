require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const College = require('../models/College');
const Review = require('../models/Review');

const seedDatabase = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      College.deleteMany({}),
      Review.deleteMany({}),
    ]);

    const users = await User.create([
      {
        name: 'Karthik Sundaram (Admin)',
        email: 'admin@college.edu',
        password: 'Password123!',
        role: 'admin',
      },
      {
        name: 'Dr. R. Ramanujam (Professor)',
        email: 'teacher@college.edu',
        password: 'Password123!',
        role: 'teacher',
      },
      {
        name: 'Thirumoorthi M',
        email: 'student1@college.edu',
        password: 'Password123!',
        role: 'student',
      },
      {
        name: 'Priya Dharshini',
        email: 'student2@college.edu',
        password: 'Password123!',
        role: 'student',
      },
      {
        name: 'Vigneshwaran K',
        email: 'student3@college.edu',
        password: 'Password123!',
        role: 'student',
      },
    ]);

    const adminUser = users[0];
    const teacher = users[1];
    const student1 = users[2];
    const student2 = users[3];
    const student3 = users[4];

    const colleges = await College.create([
      {
        name: 'Indian Institute of Technology Madras (IIT Madras)',
        location: 'Sardar Patel Road, Guindy',
        city: 'Chennai',
        state: 'Tamil Nadu',
        description: 'Premier national technical and research institute ranked #1 in NIRF across India for multiple consecutive years.',
        website: 'https://www.iitm.ac.in',
        establishedYear: 1959,
        createdBy: adminUser._id,
      },
      {
        name: 'College of Engineering, Guindy (Anna University - CEG)',
        location: '12 Sardar Patel Road, Guindy',
        city: 'Chennai',
        state: 'Tamil Nadu',
        description: 'One of the oldest technical institutes in Asia, known for outstanding engineering pedigree, research, and alumni network.',
        website: 'https://ceg.annauniv.edu',
        establishedYear: 1794,
        createdBy: adminUser._id,
      },
      {
        name: 'PSG College of Technology',
        location: 'Avinashi Road, Peelamedu',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        description: 'Government-aided autonomous engineering college renowned for strong industry-institute interaction and placements.',
        website: 'https://www.psgtech.edu',
        establishedYear: 1951,
        createdBy: adminUser._id,
      },
      {
        name: 'National Institute of Technology Tiruchirappalli (NIT Trichy)',
        location: 'Tanjore Main Road, National Highway 67, Thuvakudi',
        city: 'Tiruchirappalli',
        state: 'Tamil Nadu',
        description: 'Top-ranked National Institute of Technology in India, recognized for research output, Festember cultural fest, and campus life.',
        website: 'https://www.nitt.edu',
        establishedYear: 1964,
        createdBy: adminUser._id,
      },
      {
        name: 'Thiagarajar College of Engineering (TCE)',
        location: 'Thiruparankundram',
        city: 'Madurai',
        state: 'Tamil Nadu',
        description: 'Historic institution affiliated to Anna University, recognized for strong academic excellence and community development.',
        website: 'https://www.tce.edu',
        establishedYear: 1957,
        createdBy: adminUser._id,
      },
      {
        name: 'Loyola College',
        location: 'Sterling Road, Nungambakkam',
        city: 'Chennai',
        state: 'Tamil Nadu',
        description: 'Renowned autonomous arts and science institution consistently ranked among the top colleges in India.',
        website: 'https://www.loyolacollege.edu',
        establishedYear: 1925,
        createdBy: adminUser._id,
      },
    ]);

    const reviews = [
      {
        college: colleges[0]._id,
        user: student1._id,
        rating: 5,
        title: 'World-class research culture and ecosystem',
        comment: 'IITM Research Park, top-tier professors, and outstanding robotics and AI labs. Campus surrounded by lush greenery and wildlife.',
      },
      {
        college: colleges[0]._id,
        user: teacher._id,
        rating: 5,
        title: 'Exceptional intellectual environment',
        comment: 'Students here are exceptionally driven. The interdisciplinary research centers offer unmatched academic freedom and grant support.',
      },
      {
        college: colleges[1]._id,
        user: student2._id,
        rating: 5,
        title: 'Historic heritage with stellar placements',
        comment: 'CEG legacy speaks for itself. Core engineering departments and faculty are remarkable, and campus life inside Guindy is vibrant.',
      },
      {
        college: colleges[1]._id,
        user: student3._id,
        rating: 4,
        title: 'Affordable fee with top tier campus opportunities',
        comment: 'Kurukshetra fest and technical clubs give great exposure. Hostels are classic and sports facilities are well maintained.',
      },
      {
        college: colleges[2]._id,
        user: student1._id,
        rating: 5,
        title: 'Industry collaboration benchmark in Coimbatore',
        comment: 'Hands-on practical training with PSG Industrial Institute is incomparable. Top choice for mechanical, production, and CSE in TN.',
      },
      {
        college: colleges[3]._id,
        user: student2._id,
        rating: 5,
        title: 'Best NIT in India without a doubt',
        comment: 'Festember and Pragyan fests are unforgettable. Peer quality from all across India pushes you to grow exponentially.',
      },
      {
        college: colleges[4]._id,
        user: student3._id,
        rating: 4,
        title: 'Top engineering college in South Tamil Nadu',
        comment: 'Disciplined academic environment, supportive professors, and very strong placement training in Madurai region.',
      },
      {
        college: colleges[5]._id,
        user: student2._id,
        rating: 5,
        title: 'Unmatched legacy in arts and commerce',
        comment: 'Loyola campus gives great exposure to social consciousness, debate, and career opportunities in Chennai.',
      },
    ];

    for (const rev of reviews) {
      await Review.create(rev);
    }

    for (const col of colleges) {
      await Review.calculateAverageRating(col._id);
    }

    process.stdout.write('Database seeded successfully!\n');
    process.stdout.write(`Created ${users.length} users, ${colleges.length} colleges, ${reviews.length} reviews.\n`);
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    process.stderr.write(`Seeding failed: ${error.message}\n`);
    await disconnectDB();
    process.exit(1);
  }
};

seedDatabase();
