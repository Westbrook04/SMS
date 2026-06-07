package com.example.sms.dto;

public class ClassWithCountResponse {

    private String classId;
    private String className;
    private long studentCount;

    // 构造函数
    public ClassWithCountResponse(String classId, String className, long studentCount) {
        this.classId = classId;
        this.className = className;
        this.studentCount = studentCount;
    }

    // getter 方法（Spring Boot 序列化 JSON 时需要）
    public String getClassId() {
        return classId;
    }

    public String getClassName() {
        return className;
    }

    public long getStudentCount() {
        return studentCount;
    }


}
