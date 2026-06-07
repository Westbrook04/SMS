package com.example.sms.repository;

import com.example.sms.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, String> {
    /**
     * 统计某个班有多少个学生
     */
    long countByStudentClass_ClassId(String classId);
}
