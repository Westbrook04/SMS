package com.example.sms.service;

import com.example.sms.dto.ClassWithCountResponse;
import com.example.sms.entity.StudentClass;
import com.example.sms.repository.StudentClassRepository;
import com.example.sms.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentClassService {
    @Autowired
    private StudentClassRepository studentClassRepository;

    @Autowired
    private StudentRepository studentRepository;

    /**
     * 查询所有班级
     * @return List
     */
    public List<ClassWithCountResponse> findAll() {
        List<StudentClass> classes = studentClassRepository.findAll();
        return classes.stream()
                .map(cls -> new ClassWithCountResponse(
                        cls.getClassId(),
                        cls.getClassName(),
                        studentRepository.countByStudentClass_ClassId(cls.getClassId())
                ))
                .collect(Collectors.toList());
    }


    /**
     * 根据班级编号查单个班级
     * @param classId
     * @return StudentClass
     */
    public StudentClass findById(String classId){
        return studentClassRepository.findById(classId)
                .orElseThrow(()->new RuntimeException("班级不存在："+ classId));
    }

    /**
     * 创建班级
     * @param studentClass
     * @return
     */
    public StudentClass createClass(StudentClass studentClass) {
        return studentClassRepository.save(studentClass);
    }

    /**
     * 删除班级
     * @param classId
     */
    public void deleteById(String classId) {
        studentClassRepository.deleteById(classId);
    }
}
