package com.ai_hackathon.app.repository;

import com.ai_hackathon.app.entity.SystemParameter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SystemParameterRepository extends JpaRepository<SystemParameter, Long> {

    @Query("SELECT sp FROM SystemParameter sp WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(sp.key) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(sp.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<SystemParameter> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    boolean existsByKeyIgnoreCase(String key);

    @Query(value = "SELECT COUNT(*) > 0 FROM command_parameter_mappings WHERE parameter_id = :parameterId",
           nativeQuery = true)
    boolean isInUse(@Param("parameterId") Long parameterId);
}
