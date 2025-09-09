const mongoose = require('mongoose');

const subItemSchema = new mongoose.Schema({
    id: String,
    name: String,
    maxScore: Number
});

const categorySchema = new mongoose.Schema({
    id: String,
    name: String,
    weight: Number,
    subItems: [subItemSchema]
});

const assessmentComponentSchema = new mongoose.Schema({
    id: String,
    name: String,
    weight: Number,
    categories: [categorySchema]
});

const teacherSchema = new mongoose.Schema({
    realName: String,
    id: String,
    logoUrl: String
});

const courseSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    subject: String,
    gradeLevel: String,
    room: String,
    academicYear: String,
    semester: String,
    assessmentComponents: [assessmentComponentSchema],
    teacher: teacherSchema
});

const studentSchema = new mongoose.Schema({
    studentId: { type: String, unique: true },
    realName: String,
    nickname: String,
    rollNumber: String,
    gradeLevel: String,
    room: String,
    scores: Object
});

const Course = mongoose.model('Course', courseSchema);
const Student = mongoose.model('Student', studentSchema);

module.exports = { Course, Student };