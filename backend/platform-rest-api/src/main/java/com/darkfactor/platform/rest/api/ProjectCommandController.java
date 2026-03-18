package com.darkfactor.platform.rest.api;

import com.darkfactor.platform.rest.api.dto.ProjectSnapshotRequest;
import com.darkfactor.platform.rest.api.dto.ProjectDocumentResponse;
import com.darkfactor.platform.rest.api.dto.ProjectSnapshotResponse;
import com.darkfactor.platform.rest.api.dto.TraceabilityViewResponse;
import com.darkfactor.platform.rest.api.dto.ValidationViewResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectCommandController {
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ProjectSnapshotResponse createProject(@Valid @RequestBody ProjectSnapshotRequest request) {
    return new ProjectSnapshotResponse(
        request.document().project().id(),
        request.document().versioning().documentVersion(),
        "dsl/" + request.document().project().slug() + "/v" + request.document().versioning().documentVersion() + ".json",
        "PERSISTENCE_STUB"
    );
  }

  @GetMapping("/{projectId}")
  public ProjectSnapshotResponse findProject(@PathVariable String projectId) {
    return new ProjectSnapshotResponse(projectId, 1L, "dsl/" + projectId + "/v1.json", "READ_STUB");
  }

  @GetMapping("/{projectId}/document")
  public ProjectDocumentResponse findProjectDocument(@PathVariable String projectId) {
    return new ProjectDocumentResponse(null);
  }

  @GetMapping("/{projectId}/traceability")
  public TraceabilityViewResponse findTraceability(@PathVariable String projectId) {
    return new TraceabilityViewResponse(List.of());
  }

  @GetMapping("/{projectId}/validation")
  public ValidationViewResponse findValidation(@PathVariable String projectId) {
    return new ValidationViewResponse(List.of());
  }
}
