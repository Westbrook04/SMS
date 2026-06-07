package com.example.sms.controller;


import com.example.sms.entity.Student;
import com.example.sms.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    @Autowired
    private StudentService studentService;

    @GetMapping
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    @GetMapping("/{studentId}")
    public Student getStudent(@PathVariable String studentId) {
        return studentService.getStudentById(studentId);
    }

    @PostMapping
    public Student addStudent(@RequestBody Student student) {
        return studentService.addStudent(student);
    }

    @DeleteMapping("/{studentId}")
    public void deleteStudent(@PathVariable String studentId) {
        studentService.deleteStudent(studentId);
    }

    @PutMapping("/{studentId}")
    public Student updateStudent(@PathVariable String studentId,@RequestBody Student student) {
        return studentService.updateStudent(studentId,student);
    }
}
