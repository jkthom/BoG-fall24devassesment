import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true }, // user's first name
    lastName: { type: String, required: true }, // user's last name
    email: { type: String, required: true, unique: true }, // user's email
    password: { type: String, required: true } // user's password (for Level 3 and beyond)
});


const User = mongoose.model('User', userSchema);

// Animal Schema
const animalSchema = new mongoose.Schema({
    name: { type: String, required: true }, // animal's name
    hoursTrained: { type: Number, default: 0 }, // total number of hours the animal has been trained
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // reference to the owner's ID
    dateOfBirth: { type: Date, required: true } // animal's date of birth
});

const Animal = mongoose.model('Animal', animalSchema);

// Training Log Schema
const trainingLogSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now }, // date of training log
    description: { type: String, required: true }, // description of training log
    hours: { type: Number, required: true }, // number of hours the training log records
    animal: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true }, // reference to the animal
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // reference to the user
    trainingLogVideo: { type: String } // pointer to training log video in cloud storage (for Expert level)
});

const TrainingLog = mongoose.model('TrainingLog', trainingLogSchema);

export { User, Animal, TrainingLog };
