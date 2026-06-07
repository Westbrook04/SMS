package com.example.sms.controller;

import com.example.sms.entity.StudentClass;
import com.example.sms.service.StudentClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.sms.dto.ClassWithCountResponse;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
public class StudentClassController {
    @Autowired
    private StudentClassService studentClassService;

    /**
     * 查询所有班级
     * @return
     */
    @GetMapping
    public List<ClassWithCountResponse> getAllStudentClasses() {
        return studentClassService.findAll();
    }


    @GetMapping("/{classId}")
    public StudentClass getStudentClass(@PathVariable String classId) {
        return studentClassService.findById(classId);
    }

    @PostMapping
    public StudentClass addStudentClass(@RequestBody StudentClass studentClass) {
        return studentClassService.createClass(studentClass);
    }

    @DeleteMapping("/{classId}")
    public void deleteStudentClass(@PathVariable String classId) {
        studentClassService.deleteById(classId);
    }
}
