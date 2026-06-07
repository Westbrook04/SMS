package com.example.sms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "major")
public class Major {

    @Id
    @Column(length = 2)
    private String majorCode;

    @Column(nullable = false, length = 50)
    private String majorName;

    @ManyToOne
    @JoinColumn(name = "school_code")
    private School school;

    public String getMajorCode() { return majorCode; }
    public void setMajorCode(String majorCode) { this.majorCode = majorCode; }
    public String getMajorName() { return majorName; }
    public void setMajorName(String majorName) { this.majorName = majorName; }
    public School getSchool() { return school; }
    public void setSchool(School school) { this.school = school; }
}
