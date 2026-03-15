# MVP Scope for Workflow Designer

## 1. Node Types Included in MVP

- **Start Event Node**
  - User task node
  - Service task node
  - Script task node

## 2. Edge Types Included in MVP

- **Sequence Flow**
- **Message Flow**

## 3. BPMN Features Explicitly Excluded

- **Sub-processes (Embedded, Call, Ad-hoc)**
- **Multi-instance Activities**
- **Compensating Activities**
- **Transactions**
- **Event-based gateways**
- **Boundary events**
- **Error handlers**
- **Timer events**
- **Conditional events**
- **Link events**
- **Escalation events**
- **Signal events**
- **Message events (with complex conditions)**
- **Business rule tasks**
- **Receive tasks**
- **Manual tasks**
- **Exclusive gateways**
- **Inclusive gateways**
- **Parallel gateways**
- **Multi-instance gateways**
- **Complex gateways**
- **Ad-hoc gateways**
- **Callable elements (sub-process reuse)**
- **Process variables**
- **Process instances**
- **Task assignments**
- **Task delegation**
- **Task notifications**
- **User task forms**
- **Task comments**
- **Task attachments**
- **Task escalations**
- **Task priorities**
- **Task due dates**
- **Task reminders**
- **Task time tracking**
- **Task statistics**
- **Task reporting**
- **Process audit logging**
- **Process metrics**
- **Process dashboards**
- **Process analytics**
- **User roles and permissions**
- **Group assignments**
- **User groups**
- **Role-based access control**
- **Permission inheritance**
- **Security policies**
- **Data encryption**
- **Data backup**
- **Data recovery**
- **High availability**
- **Fault tolerance**
- **Disaster recovery**
- **System monitoring**
- **Application health checks**
- **Performance monitoring**
- **Resource allocation**
- **Cost tracking**
- **Billing and invoicing**
- **Payment processing**
- **Integration with external systems**
- **Web services**
- **API management**
- **Workflow routing rules**
- **Workflow conditions**
- **Workflow expressions**
- **Script compilation**

## 4. Validation Rules Mandatory in MVP

- **Node reference validation**: Every node must have a unique ID
- **Sequence flow validation**: Every node must have valid incoming and outgoing flows
- **Process start validation**: Every process must have a start event
- **Process end validation**: Every process must have an end event
- **Node type validation**: All node types must be one of the supported types
- **Edge type validation**: All edges must be one of the supported types
- **Loop validation**: Process must not contain loops that would cause infinite execution
- **Validation of required fields**: All required node fields must be filled

## 5. YAML Export Features Required in MVP

- **Process definition export with nodes and edges**
- **Export of node properties**
- **Export of edge properties**
- **Serialization of workflow structure**
- **YAML schema compliance**
- **Support for nested nodes**

## 6. Compliance Metadata Fields Included in MVP

- **Workflow ID**
- **Creation timestamp**
- **Last modified timestamp**
- **Author**
- **Version**

## 7. Plugin Capabilities Postponed

- **Custom node types**
- **Custom node properties**
- **Custom edge properties**
- **Plugin-based validation rules**
- **Custom export formats**
- **Custom import formats**
- **Plugin marketplace**
- **Plugin versioning**

## 8. Acceptance Criteria for MVP

- [ ] Workflow designer allows basic node creation and positioning
- [ ] Workflow designer supports basic editing of node properties
- [ ] Workflow designer allows basic connecting of nodes
- [ ] Workflow designer supports basic saving of workflow
- [ ] Workflow designer supports basic loading of workflow
- [ ] Export of workflow to YAML format
- [ ] Basic validation of workflow structure
- [ ] Visual representation of workflow with correct node types and flows
- [ ] Support for process start and end events
- [ ] Workflow can be exported without errors
- [ ] Users can view all workflow elements
- [ ] Workflow designer is responsive
- [ ] Workflow designer handles minimal set of edge types
- [ ] All mandatory validation rules are enforced
- [ ] Exported YAML is valid and readable
- [ ] All required compliance metadata fields are present
- [ ] Process workflow definition loading is successful
- [ ] Basic node duplication and deletion works
- [ ] Workflow diagram can be zoomed and panned
- [ ] Workflow rendering is consistent
- [ ] Workflow designer provides basic undo/redo functionality
</BEGIN_ARG