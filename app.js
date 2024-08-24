import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, Animal, TrainingLog } from './models.js';

dotenv.config();
const app = express();
const APP_PORT = process.env.PORT || 5000;


app.use(cors({ origin: true }));
app.use(express.json());


mongoose.connect(process.env.DATABASE_URI, {
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));


const JWT_SECRET = process.env.JWT_STRING;


const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access denied, token missing.' });
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(403).json({ error: 'Invalid token.' });
    }
  };





app.get('/api/health', (req, res) => {
  res.json({ healthy: true });
});

app.post('/api/user', async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
      }
  

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  

      const user = new User({ firstName, lastName, email, password: hashedPassword });
      await user.save();
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Server error.' });
    }
  });

  app.post('/api/user/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }
  

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(403).json({ error: 'Invalid email or password.' });
      }
  

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(403).json({ error: 'Invalid email or password.' });
      }
  

      res.status(200).json({ message: 'Login successful' });
    } catch (error) {
      res.status(500).json({ error: 'Server error.' });
    }
  });



  app.post('/api/user/verify', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }
  

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(403).json({ error: 'Invalid email or password.' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(403).json({ error: 'Invalid email or password.' });
      }
  
      // Issue JWT
      const token = jwt.sign(
        { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Server error.' });
    }
  });





  app.post('/api/animal', authenticateJWT, async (req, res) => {
    try {
      const { name, species, dateOfBirth } = req.body;
      const ownerId = req.user.id;
      if (!name || !species || !dateOfBirth) {
        return res.status(400).json({ error: 'All fields are required.' });
      }

      const animal = new Animal({ name, species, owner: ownerId, dateOfBirth });
      await animal.save();
      res.status(200).json(animal);
    } catch (error) {
      res.status(500).json({ error: 'Server error.' });
    }
  });
  
  

  app.post('/api/training', authenticateJWT, async (req, res) => {
    try {
      const { animalId, description, hours } = req.body;
      const userId = req.user.id;
      if (!animalId || !description || !hours) {
        return res.status(400).json({ error: 'All fields are required.' });
      }
  

      const animal = await Animal.findById(animalId);
      if (!animal) {
        return res.status(400).json({ error: 'Animal not found.' });
      }
  
 
      if (animal.owner.toString() !== userId) {
        return res.status(400).json({ error: 'This animal does not belong to the specified user.' });
      }
  

      const trainingLog = new TrainingLog({ animal: animalId, user: userId, description, hours });
      await trainingLog.save();
      res.status(200).json(trainingLog);
    } catch (error) {
      res.status(500).json({ error: 'Server error.' });
    }
  });




app.get('/api/admin/users', async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
  
      const users = await User.find()
        .select('-password')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const count = await User.countDocuments();
  
      res.status(200).json({
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error.' });
    }
  });


  app.get('/api/admin/animals', async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
  

      const animals = await Animal.find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
  

      const count = await Animal.countDocuments();
  
      res.status(200).json({
        animals,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error.' });
    }
  });

  app.get('/api/admin/training', async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
  

      const trainingLogs = await TrainingLog.find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
  

      const count = await TrainingLog.countDocuments();
  
      res.status(200).json({
        trainingLogs,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error.' });
    }
  });

  app.get('/', (req, res) => {
    res.json({"Hello": "World",
            "Version": 2})
})

app.listen(APP_PORT, () => {
    console.log(`API listening at http://localhost:${APP_PORT}`);
  });
