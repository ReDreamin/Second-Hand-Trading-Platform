package com.secondhand.platform.controller;

import com.secondhand.platform.dto.ApiResponse;
import com.secondhand.platform.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final FileUploadService fileUploadService;

    @PostMapping("/image")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("file") MultipartFile file) {
        String url = fileUploadService.uploadImage(file);
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", url)));
    }
}
