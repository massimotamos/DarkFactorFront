import { Injectable } from '@angular/core';
import { FullStackApplicationAst, SemanticNodeAst } from '../models/semantic-ast.models';

export interface GeneratedCodeFile {
  path: string;
  content: string;
  category: 'build' | 'backend' | 'frontend';
}

export interface GeneratedCodeBundle {
  files: GeneratedCodeFile[];
}

@Injectable({ providedIn: 'root' })
export class CodeGenerationService {
  generate(ast: FullStackApplicationAst): GeneratedCodeBundle {
    const files: GeneratedCodeFile[] = [
      {
        path: 'generated/backend/pom.xml',
        category: 'build',
        content: this.renderPom(ast)
      },
      {
        path: 'generated/backend/src/main/java/com/darkfactor/generated/security/AppRole.java',
        category: 'backend',
        content: this.renderRoles(ast.roles)
      },
      {
        path: 'generated/backend/src/main/java/com/darkfactor/generated/web/ApplicationController.java',
        category: 'backend',
        content: this.renderApplicationController(ast)
      },
      {
        path: 'generated/frontend/src/app/app.routes.ts',
        category: 'frontend',
        content: this.renderRoutes(ast.views)
      },
      {
        path: 'generated/frontend/src/app/services/generated-api.service.ts',
        category: 'frontend',
        content: this.renderFrontendApiService(ast.tasks)
      }
    ];

    for (const entity of ast.entities) {
      files.push({
        path: `generated/backend/src/main/java/com/darkfactor/generated/domain/${this.toClassName(entity.name)}.java`,
        category: 'backend',
        content: this.renderEntity(entity)
      });
    }

    for (const task of ast.tasks) {
      files.push({
        path: `generated/backend/src/main/java/com/darkfactor/generated/service/${this.toClassName(task.name)}Service.java`,
        category: 'backend',
        content: this.renderTaskService(task)
      });
    }

    for (const view of ast.views) {
      const componentName = this.toFileName(view.name);
      files.push({
        path: `generated/frontend/src/app/views/${componentName}/${componentName}.component.ts`,
        category: 'frontend',
        content: this.renderViewComponentTs(view)
      });
      files.push({
        path: `generated/frontend/src/app/views/${componentName}/${componentName}.component.html`,
        category: 'frontend',
        content: this.renderViewComponentHtml(view)
      });
    }

    return { files };
  }

  private renderPom(ast: FullStackApplicationAst): string {
    const artifactId = this.toFileName(ast.application.name) || 'generated-app';
    return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.darkfactor.generated</groupId>
  <artifactId>${artifactId}</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <name>${this.escapeXml(ast.application.name)}</name>
  <description>Generated Spring Boot backend skeleton from semantic DSL.</description>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.5</version>
    <relativePath />
  </parent>

  <properties>
    <java.version>21</java.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>`;
  }

  private renderRoles(roles: SemanticNodeAst[]): string {
    const enumMembers = roles.length > 0
      ? roles.map((role) => `  ${this.toEnumValue(role.key)}`).join(',\n')
      : '  DEFAULT_USER';

    return `package com.darkfactor.generated.security;

public enum AppRole {
${enumMembers}
}
`;
  }

  private renderEntity(entity: SemanticNodeAst): string {
    const className = this.toClassName(entity.name);
    return `package com.darkfactor.generated.domain;

public class ${className} {
  private String id;

  // Semantic key: ${entity.key}
  // Description: ${entity.description}
  // Prompt: ${entity.prompt || 'No prompt provided.'}

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }
}
`;
  }

  private renderTaskService(task: SemanticNodeAst): string {
    const className = `${this.toClassName(task.name)}Service`;
    return `package com.darkfactor.generated.service;

import org.springframework.stereotype.Service;

@Service
public class ${className} {

  // Semantic category: ${task.kind ?? 'unspecified'}
  // Semantic key: ${task.key}
  // Prompt: ${task.prompt || 'No prompt provided.'}

  public void execute() {
    // TODO: Implement generated behavior for ${task.label}.
  }
}
`;
  }

  private renderApplicationController(ast: FullStackApplicationAst): string {
    return `package com.darkfactor.generated.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/application")
public class ApplicationController {

  @GetMapping("/structure")
  public String structure() {
    return "${this.escapeJava(ast.application.name)}";
  }
}
`;
  }

  private renderRoutes(views: SemanticNodeAst[]): string {
    const imports = views
      .map((view) => {
        const componentName = this.toClassName(view.name);
        const fileName = this.toFileName(view.name);
        return `import { ${componentName}Component } from './views/${fileName}/${fileName}.component';`;
      })
      .join('\n');

    const routes = views
      .map((view) => {
        const routePath = this.toRoutePath(view.key || view.name);
        return `  { path: '${routePath}', component: ${this.toClassName(view.name)}Component }`;
      })
      .join(',\n');

    return `${imports}
import { Routes } from '@angular/router';

export const appRoutes: Routes = [
${routes}
];
`;
  }

  private renderViewComponentTs(view: SemanticNodeAst): string {
    const className = `${this.toClassName(view.name)}Component`;
    const fileName = this.toFileName(view.name);
    return `import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-${fileName}',
  standalone: true,
  templateUrl: './${fileName}.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ${className} {}
`;
  }

  private renderViewComponentHtml(view: SemanticNodeAst): string {
    return `<section>
  <h1>${this.escapeHtml(view.label)}</h1>
  <p>${this.escapeHtml(view.description)}</p>
</section>
`;
  }

  private renderFrontendApiService(tasks: SemanticNodeAst[]): string {
    const methods = tasks
      .map((task) => `  ${this.toMethodName(task.name)}(): void {\n    // TODO: Call backend for ${task.label}.\n  }`)
      .join('\n\n');

    return `import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GeneratedApiService {
${methods || '  // No generated task endpoints yet.'}
}
`;
  }

  private toClassName(value: string): string {
    return this.toWords(value)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') || 'GeneratedArtifact';
  }

  private toMethodName(value: string): string {
    const words = this.toWords(value);
    if (words.length === 0) {
      return 'executeGeneratedTask';
    }

    return words[0] + words.slice(1).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  }

  private toFileName(value: string): string {
    return this.toWords(value).join('-') || 'generated-artifact';
  }

  private toRoutePath(value: string): string {
    return this.toWords(value).join('-') || '';
  }

  private toEnumValue(value: string): string {
    return this.toWords(value).join('_').toUpperCase() || 'DEFAULT_USER';
  }

  private toWords(value: string): string[] {
    return value
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
  }

  private escapeJava(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private escapeHtml(value: string): string {
    return this.escapeXml(value);
  }
}
