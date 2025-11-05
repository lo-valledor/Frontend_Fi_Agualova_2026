#!/usr/bin/env node
/**
 * Script de optimización automática para resolver warnings comunes de SonarQube
 *
 * Ejecutar: node scripts/sonar-optimizer.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

const PATTERNS = {
  // Reemplazar parseInt por Number.parseInt (si queda alguno)
  parseInt: {
    regex: /\bparseInt\(/g,
    replacement: 'Number.parseInt(',
    description: 'Reemplazar parseInt por Number.parseInt'
  },

  // Detectar forEach que podrían ser for...of (requiere análisis manual)
  forEach: {
    regex: /\.forEach\(\s*\(([^)]+)\)\s*=>\s*\{/g,
    description: 'Revisar .forEach() para convertir a for...of',
    manual: true
  },

  // Detectar parámetros no usados que deberían empezar con _
  unusedParams: {
    regex: /\(([a-z][a-zA-Z0-9]*),\s*([a-z][a-zA-Z0-9]*)\)\s*=>/g,
    description: 'Revisar parámetros no utilizados',
    manual: true
  }
};

class SonarOptimizer {
  filesProcessed = 0;
  changesApplied = 0;
  issuesFound = [];

  async optimize() {
    console.log('🔍 Buscando archivos para optimizar...\n');

    const files = await glob('app/**/*.{ts,tsx}', {
      ignore: [
        '**/node_modules/**',
        '**/build/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx'
      ]
    });

    console.log(`📁 Encontrados ${files.length} archivos\n`);

    for (const file of files) {
      await this.processFile(file);
    }

    this.printReport();
  }

  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      let modified = content;
      let fileChanged = false;

      // Aplicar patrones automáticos
      for (const [name, pattern] of Object.entries(PATTERNS)) {
        if (pattern.manual) {
          // Solo detectar para revisión manual
          const matches = content.match(pattern.regex);
          if (matches && matches.length > 0) {
            this.issuesFound.push({
              file: filePath,
              pattern: name,
              count: matches.length,
              description: pattern.description
            });
          }
        } else {
          // Aplicar automáticamente
          const before = modified;
          modified = modified.replace(pattern.regex, pattern.replacement);

          if (before !== modified) {
            fileChanged = true;
            const count = (before.match(pattern.regex) || []).length;
            this.changesApplied += count;
            console.log(
              `  ✅ ${path.basename(filePath)}: ${count} cambios (${pattern.description})`
            );
          }
        }
      }

      // Guardar si hubo cambios
      if (fileChanged) {
        fs.writeFileSync(filePath, modified, 'utf-8');
        this.filesProcessed++;
      }
    } catch (error) {
      console.error(`❌ Error procesando ${filePath}:`, error.message);
    }
  }

  /**
   * Imprime reporte final
   */
  printReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORTE DE OPTIMIZACIÓN SONARQUBE');
    console.log('='.repeat(60));
    console.log(`\n✅ Archivos modificados: ${this.filesProcessed}`);
    console.log(`✅ Cambios aplicados: ${this.changesApplied}`);

    if (this.issuesFound.length > 0) {
      console.log(
        `\n⚠️  Issues para revisión manual: ${this.issuesFound.length}`
      );
      console.log('\nTop 10 archivos con más issues:');

      const grouped = this.issuesFound.reduce((acc, issue) => {
        if (!acc[issue.file]) acc[issue.file] = [];
        acc[issue.file].push(issue);
        return acc;
      }, {});

      const topIssues = Object.entries(grouped)
        .sort(([, a], [, b]) => b.length - a.length)
        .slice(0, 10);

      for (const [file, issues] of topIssues) {
        const total = issues.reduce((sum, i) => sum + i.count, 0);
        console.log(`  📄 ${path.relative(process.cwd(), file)}`);
        console.log(
          `     ${total} issues: ${issues.map(i => i.pattern).join(', ')}`
        );
      }
    }

    console.log('\n' + '='.repeat(60));
  }
}

const optimizer = new SonarOptimizer();
try {
  await optimizer.optimize();
} catch (error) {
  console.error(error);
  process.exit(1);
}
