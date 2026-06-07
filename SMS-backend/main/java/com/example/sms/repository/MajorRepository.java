package com.example.sms.repository;

import com.example.sms.entity.Major;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MajorRepository extends JpaRepository<Major, String> {
    List<Major> findBySchoolSchoolCode(String schoolCode);
}
