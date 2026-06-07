package com.example.sms.service;

import com.example.sms.entity.School;
import com.example.sms.repository.SchoolRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SchoolService {

    private final SchoolRepository schoolRepository;

    public SchoolService(SchoolRepository schoolRepository) {
        this.schoolRepository = schoolRepository;
    }

    public List<School> findAll() {
        return schoolRepository.findAll();
    }

    public School findById(String schoolCode) {
        return schoolRepository.findById(schoolCode)
                .orElseThrow(() -> new RuntimeException("学院不存在: " + schoolCode));
    }

    public School create(School school) {
        if (schoolRepository.existsById(school.getSchoolCode())) {
            throw new RuntimeException("学院代码已存在: " + school.getSchoolCode());
        }
        return schoolRepository.save(school);
    }

    public void deleteById(String schoolCode) {
        if (!schoolRepository.existsById(schoolCode)) {
            throw new RuntimeException("学院不存在: " + schoolCode);
        }
        schoolRepository.deleteById(schoolCode);
    }
}
