package com.example.sms.controller;

import com.example.sms.entity.School;
import com.example.sms.service.SchoolService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schools")
public class SchoolController {

    private final SchoolService schoolService;

    public SchoolController(SchoolService schoolService) {
        this.schoolService = schoolService;
    }

    @GetMapping
    public List<School> getAll() {
        return schoolService.findAll();
    }

    @GetMapping("/{schoolCode}")
    public School getById(@PathVariable String schoolCode) {
        return schoolService.findById(schoolCode);
    }

    @PostMapping
    public School create(@RequestBody School school) {
        return schoolService.create(school);
    }

    @DeleteMapping("/{schoolCode}")
    public void delete(@PathVariable String schoolCode) {
        schoolService.deleteById(schoolCode);
    }
}
