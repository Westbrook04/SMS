package com.example.sms.entity;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class StudentClass {
    @Id
    private String classId;     //班级编号

    private String className;   //班级名称

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getClassId() {
        return classId;
    }

    public void setClassId(String classId) {
        this.classId = classId;
    }

}
