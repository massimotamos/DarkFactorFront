# Semantic Application Composer  
## Architecture Intent & DSL Strategy

### 1. Vision

The objective of this project is to build a **projectional semantic application composer**, inspired by environments such as:

- TIBCO BusinessWorks
- Mendix
- Camunda Modeler
- JetBrains MPS

The system must allow users to:

- visually compose application semantics
- model workflows, UI, integration, data and security
- produce a **formal DSL representation**
- generate executable software artifacts (Java, C++, etc.)

The visual editor is **not the end product**.  
It is a **projectional editor for a domain‑specific language (DSL)**.

---

### 2. Core Principle

The visual model is only a **projection of a semantic DSL**.

Therefore:

UI Model ≠ DSL  
Visual graph = projection layer  
DSL = canonical source of truth

---

### 3. DSL Philosophy

The DSL must:

- be deterministic
- be language‑agnostic
- describe application semantics
- not describe UI layout
- support code generation
- support validation
- support simulation

Current JSON export is only:

→ a serialization of the visual graph  
→ NOT the final DSL

Example target DSL:

application CustomerOnboarding {

  workflow RegistrationFlow {

    start OnUserTrigger

    form CustomerForm {
      fields: CustomerIdentity
    }

    validate CustomerRules

    integrate CreateCustomer via REST POST "/api/customers"

    approve ManagerRole

    notify EmailChannel

    end Success
  }

}

---

### 4. Node Semantics Model

Each palette node represents:

- a semantic primitive
- not a UI component
- not a frontend artifact

Example mapping:

| Visual Node | Semantic Meaning |
|-----------|------------------|
| Form | user data capture contract |
| Validation | rule engine invocation |
| REST Call | integration operation |
| Role | security domain binding |
| Policy | governance constraint |
| Entity | domain model |
| Task | executable business step |

---

### 5. Architecture Target

Angular Projectional Editor  
        ↓  
Semantic Graph Engine  
        ↓  
Formal DSL Model  
        ↓  
DSL Compiler / Code Generator  
        ↓  
Runtime Execution Engine  

---

### 6. DSL Compiler Goals

The compiler must generate:

- Spring Boot services
- REST APIs
- Domain entities
- Workflow orchestration logic
- Policy enforcement layers
- UI scaffolding

Future:

- C++ runtime generation
- event-driven architecture generation
- Kubernetes deployment descriptors

---

### 7. Modeling Paradigm

The system follows:

→ Domain‑specific multimodeling paradigm  

Concerns include:

- workflow semantics
- UI semantics
- data semantics
- security semantics
- integration semantics

These must converge into a **single coherent executable model**.

---

### 8. Current State

Implemented:

- Angular semantic canvas
- drag‑drop projectional editor
- node categorization system
- graph serialization

Missing:

- formal DSL grammar
- semantic compiler
- validation engine
- runtime generation layer

---

### 9. Next Strategic Steps

1. Define DSL grammar formally (EBNF)
2. Define semantic meta‑model
3. Implement DSL internal representation (AST)
4. Replace JSON export with DSL export
5. Implement semantic validation engine
6. Implement Java code generator
7. Introduce runtime orchestration layer

---

### 10. Long Term Vision

The system becomes:

→ A semantic application operating system

Users will design:

- enterprise systems
- integration platforms
- workflow engines
- domain platforms

without writing imperative code.

The DSL becomes the **primary programming paradigm**.

---

### 11. Important Constraint

The visual editor must never become:

- a low‑code UI toy
- a form builder
- a BPMN clone

It must remain:

→ a projectional semantic programming environment
