package com.example.sms.service;

import com.example.sms.entity.Student;
import com.example.sms.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {
    @Autowired
    private StudentRepository studentRepository;

    /**
     * 查找所有学生
     * @return
     */
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    /**
     * 根据学生Id查找学生
     * @param studentId
     * @return
     */
    public Student getStudentById(String studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(()->new RuntimeException("学生不存在："+studentId));
    }

    /**
     * 新增学生
     * @param student
     * @return
     */
    public Student addStudent(Student student) {
        return studentRepository.save(student);
    }

    /**
     * 根据学生Id删除学生
     * @param studentId
     */
    public void deleteStudent(String studentId) {
        studentRepository.deleteById(studentId);
    }

    public Student updateStudent(String studentId, Student student) {
        Student existingStudent = studentRepository.findById(studentId)
                .orElseThrow(()->new RuntimeException("学生不存在"));
        existingStudent.setStudentName(student.getStudentName());
        existingStudent.setStudentClass(student.getStudentClass());
        return studentRepository.save(existingStudent);
    }
}
