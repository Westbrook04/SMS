package com.example.sms.repository;

import com.example.sms.entity.StudentClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentClassRepository  extends JpaRepository<StudentClass, String> {
}
