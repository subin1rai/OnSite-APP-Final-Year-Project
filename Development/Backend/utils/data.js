const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    requests:[{
        from:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message:{
            type: String,
            required: true
        },
        status:{
            type: String,
            required: true,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'        
        },
    }]   ,
    friends:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    ]
});

const user = mongoose.model('User', userSchema);


const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message:  String,
    timeStamp:{
        type: Date,
        default: Date.now
    }

 })