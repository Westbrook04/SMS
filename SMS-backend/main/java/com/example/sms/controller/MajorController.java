package com.example.sms.controller;

import com.example.sms.entity.Major;
import com.example.sms.service.MajorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/majors")
public class MajorController {

    private final MajorService majorService;

    public MajorController(MajorService majorService) {
        this.majorService = majorService;
    }

    @GetMapping
    public List<Major> getAll() {
        return majorService.findAll();
    }

    @GetMapping("/by-school/{schoolCode}")
    public List<Major> getBySchool(@PathVariable String schoolCode) {
        return majorService.findBySchoolCode(schoolCode);
    }

    @GetMapping("/{majorCode}")
    public Major getById(@PathVariable String majorCode) {
        return majorService.findById(majorCode);
    }

    @PostMapping
    public Major create(@RequestBody Major major) {
        return majorService.create(major);
    }

    @DeleteMapping("/{majorCode}")
    public void delete(@PathVariable String majorCode) {
        majorService.deleteById(majorCode);
    }
}
