package com.resumeanalyser.controller;

import com.resumeanalyser.dto.DashboardStatsDto;
import com.resumeanalyser.security.UserPrincipal;
import com.resumeanalyser.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        DashboardStatsDto stats = dashboardService.getDashboardStats(userPrincipal);
        return ResponseEntity.ok(stats);
    }
}
