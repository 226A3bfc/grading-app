const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const { Course, Student } = require('./models');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static('public'));

mongoose.connect('mongodb+srv://pinitwan_db_user:X2gufl8HDE5xcCz1@cluster0.gcikeel.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('requestInitialData', async () => {
        try {
            const courses = await Course.find({});
            const students = await Student.find({});
            socket.emit('initialData', { courses, students });
        } catch (error) {
            console.error('Error fetching initial data:', error);
            socket.emit('error', 'Error fetching initial data.');
        }
    });

    socket.on('updateData', async (data) => {
        try {
            if (data.activeCourse) {
                await Course.findOneAndUpdate({ id: data.activeCourse.id }, data.activeCourse, { upsert: true, new: true });
            }
            if (data.students) {
                for (const student of data.students) {
                    await Student.findOneAndUpdate({ studentId: student.studentId }, student, { upsert: true, new: true });
                }
            }
            const courses = await Course.find({});
            const students = await Student.find({});
            io.emit('dataUpdated', { courses, students });
        } catch (error) {
            console.error('Error saving data:', error);
            socket.emit('error', 'Error saving data.');
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});