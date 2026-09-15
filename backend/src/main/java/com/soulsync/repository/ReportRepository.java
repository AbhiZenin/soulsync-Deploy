package com.soulsync.repository;
import com.soulsync.domain.Report; import com.soulsync.domain.Enums.ReportStatus; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ReportRepository extends JpaRepository<Report, UUID> { List<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status); }
