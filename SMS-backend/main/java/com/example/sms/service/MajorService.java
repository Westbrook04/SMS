package com.example.sms.service;

import com.example.sms.entity.Major;
import com.example.sms.repository.MajorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MajorService {

    private final MajorRepository majorRepository;

    public MajorService(MajorRepository majorRepository) {
        this.majorRepository = majorRepository;
    }

    public List<Major> findAll() {
        return majorRepository.findAll();
    }

    public List<Major> findBySchoolCode(String schoolCode) {
        return majorRepository.findBySchoolSchoolCode(schoolCode);
    }

    public Major findById(String majorCode) {
        return majorRepository.findById(majorCode)
                .orElseThrow(() -> new RuntimeException("专业不存在: " + majorCode));
    }

    public Major create(Major major) {
        if (majorRepository.existsById(major.getMajorCode())) {
            throw new RuntimeException("专业代码已存在: " + major.getMajorCode());
        }
        return majorRepository.save(major);
    }

    public void deleteById(String majorCode) {
        if (!majorRepository.existsById(majorCode)) {
            throw new RuntimeException("专业不存在: " + majorCode);
        }
        majorRepository.deleteById(majorCode);
    }
}
