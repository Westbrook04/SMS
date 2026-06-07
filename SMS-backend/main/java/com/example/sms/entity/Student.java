package com.example.sms.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.*;

@Data
@Entity
public class Student {
    @Id
    private String studentId;      //学号
    private String studentName; //姓名

    @ManyToOne
    @JoinColumn(name = "class_id")
    private StudentClass studentClass; //所属班级

}
