const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const { Course, Student } = require('./models');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// ข้อมูลเริ่มต้นสำหรับ dropdowns
const subjectsList = ['English', 'Maths', 'Science', 'Thai', 'ICT', 'Global Skills', 'ART', 'Sport Club', 'Geography', 'Music', 'Wellbeing', 'History', 'Data Literacy', 'Reading & Presentation', 'Problem Solving', 'Chinese', 'Writing', 'Presentation'];
const gradeLevelsList = Array.from({ length: 13 }, (_, i) => `Y${i + 1}`);
const academicYears = [];
const currentYear = new Date().getFullYear();
for (let i = 0; i <= 10; i++) {
    academicYears.push(currentYear + i);
}
const semesters = ['Term 1', 'Term 2', 'Term 3'];

// เชื่อมต่อกับ MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Socket.IO Connection
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // เมื่อ Front-end ร้องขอข้อมูลทั้งหมด
    socket.on('requestInitialData', async () => {
        try {
            const courses = await Course.find({});
            const students = await Student.find({});
            // ส่งข้อมูล dropdowns กลับไปด้วย
            socket.emit('initialData', { 
                courses, 
                students,
                subjectsList,
                gradeLevelsList,
                academicYears,
                semesters
            });
        } catch (error) {
            console.error('Error fetching initial data:', error);
            socket.emit('error', 'Error fetching initial data.');
        }
    });

    socket.on('updateData', async (data) => {
        try {
            // ... (โค้ดส่วนนี้เหมือนเดิม)
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
