# DSL Meta-model for Workflow Platform

## 1. Core Entities

### Workflow
- **Description**: The top-level container for a complete business process
- **Properties**: 
  - name (String)
  - description (String)
  - version (String)
  - createdDate (DateTime)
  - modifiedDate (DateTime)
  - status (Enum{ACTIVE, INACTIVE, ARCHIVED})

### Activity
- **Description**: Individual work unit within a workflow
- **Properties**:
  - id (UUID)
  - name (String)
  - description (String)
  - type (String)
  - startPosition (Point)
  - endPosition (Point)
  - isStart (Boolean)
  - isEnd (Boolean)

### Task
- **Description**: Executable unit of work that performs specific operations
- **Properties**:
  - id (UUID)
  - name (String)
  - description (String)
  - implementation (String)
  - timeout (Integer)
  - retries (Integer)
  - inputParameters (Map<String, Object>)
  - outputParameters (Map<String, Object>)

## 2. Node Types

### Start Node
- **Description**: Entry point for workflow execution
- **Constraints**: 
  - Must have exactly one outgoing edge
  - Cannot have incoming edges

### End Node
- **Description**: Exit point for workflow execution
- **Constraints**:
  - Must have exactly one incoming edge
  - Cannot have outgoing edges

### Activity Node
- **Description**: Represents processing steps in workflow
- **Constraints**:
  - Can have multiple incoming and outgoing edges
  - Must have implementation specification
  - Optional task reference

### Gateway Node
- **Description**: Decision-making point with branching logic
- **Types**:
  - Exclusive Gateway (XOR)
  - Inclusive Gateway (OR)
  - Parallel Gateway (AND)
  - Event-based Gateway
- **Constraints**:
  - Must have at least one incoming edge
  - Must have at least one outgoing edge

## 3. Edge Types

### Sequence Flow
- **Description**: Direct execution flow between nodes
- **Properties**:
  - condition (String)
  - priority (Integer)
  - isDefault (Boolean)

### Message Flow
- **Description**: Communication flow between different contexts
- **Properties**:
  - messageId (String)
  - correlationKey (String)
  - async (Boolean)

### Association Flow
- **Description**: Documentation or annotation flow
- **Properties**:
  - documentation (String)
  - isBidirectional (Boolean)

## 4. Attributes

### Workflow Attributes
- **Name**: Unique identifier for workflow
- **Description**: Human-readable explanation
- **Version**: Semantic versioning for change tracking
- **Owner**: Workflow owner or team identifier
- **Tags**: Categorization metadata

### Node Attributes
- **Position**: Cartesian coordinates for UI visualization
- **Label**: Display text for UI 
- **Color**: Visual representation
- **Visibility**: Show/hide in UI
- **Documentation**: Inline help text

## 5. Relationships

### Workflow to Activity
- **Cardinality**: 1 to many
- **Description**: A workflow contains multiple activities

### Activity to Task
- **Cardinality**: 0 to 1 (optional)
- **Description**: Activities may reference executable tasks

### Activity to Node
- **Cardinality**: 1 to many
- **Description**: An activity may have multiple node representations

### Node to Node (Edge)
- **Cardinality**: Many to many
- **Description**: Nodes are connected through edges

### Task to Input/Output
- **Cardinality**: 1 to many
- **Description**: Tasks define parameter specifications

## 6. Constraints

### Structural Constraints
1. Every workflow must have at least one start node and one end node
2. Every node must be connected to at least one other node
3. No circular dependencies in execution flow
4. Gateway nodes must have at least one incoming and one outgoing edge
5. Activities must have a valid implementation reference

### Temporal Constraints
1. Time-based conditions must be valid expressions
2. Timeout values must be non-negative integers
3. Retries must be non-negative integers
4. Scheduling information must conform to ISO 8601 format

### Data Constraints
1. Parameter names must follow identifier naming conventions
2. Data types must match declaration requirements
3. Required parameters must be provided
4. Optional parameters may be omitted

## 7. Validation Rules

### Syntax Validation
- All required fields must be present
- All fields must use valid data types
- All identifiers must be unique within context
- All references must point to existing entities

### Semantic Validation
- Workflow consistency checks
- Activity type compatibility with implementation
- Edge condition syntax validation
- Parameter binding consistency

### Referential Validation
- All node references must be valid
- All task implementations must exist
- All parameters must be properly defined
- All conditions must be valid expressions

## 8. Serialization Rules

### Format Support
- JSON format for interchange
- XML format for legacy compatibility
- YAML format for human readability
- Binary format for efficient storage

### Schema Validation
- All serialized formats must validate against schema
- Version compatibility checks
- Migration path support
- Backward compatibility requirements

### Data Integrity
- Required field checks during serialization
- Cross-referencing consistency
- Type validation at serialization time
- Encoding standards compliance

## 9. Compliance Metadata Extension Points

### Audit Information
- Creation metadata (user, timestamp)
- Modification history
- Change tracking support
- Audit trail generation

### Regulatory Compliance
- Data protection attributes
- Privacy controls
- Access control policies
- Compliance status tracking

### Business Context
- Line of business classification
- Process maturity indicators
- Service level agreements
- Business rule enforcement

## 10. Determinism Rules for AI Code Generation

### Prediction Consistency
- Same inputs must produce identical outputs
- Deterministic parameter generation
- Consistent edge flow predictions
- Stable node positioning algorithms

### Execution Predictability
- Workflow execution path predictability
- Task execution results consistency
- Gateway decision outcome stability
- Error handling deterministic behavior

### Model Training Constraints
- Input data normalization requirements
- Output format specifications
- Validation constraint enforcement
- Generation quality metrics
</textarea>
</body>
</html>