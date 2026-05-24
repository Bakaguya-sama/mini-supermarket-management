const fs = require('fs');
const path = require('path');

const { generateOpenApiSpec } = require('../swaggerDef');
const { generateNominalTests, generateFaultTests } = require('./testSuiteGenerator');
const { generateJestFile } = require('./codeGen');
const { validateSpec } = require('./validateSpec');

function clearGeneratedTests(outputDir) {
  if (!fs.existsSync(outputDir)) {
    return;
  }

  for (const entry of fs.readdirSync(outputDir)) {
    if (entry.endsWith('.test.js')) {
      fs.unlinkSync(path.join(outputDir, entry));
    }
  }
}

function normalizeControllerFilter(filters = []) {
  return filters
    .map((filter) => filter.replace(/\.test\.js$/i, '').replace(/\.js$/i, ''))
    .filter(Boolean);
}

function listYamlSpecs(specDir) {
  if (!fs.existsSync(specDir)) {
    return [];
  }

  return fs
    .readdirSync(specDir)
    .filter((entry) => entry.endsWith('.yaml') || entry.endsWith('.yml'))
    .map((entry) => path.join(specDir, entry));
}

function extractOperationsFromSpec(spec) {
  const operations = [];
  const methods = ['get', 'post', 'put', 'patch', 'delete'];

  for (const [routePath, pathItem] of Object.entries(spec.paths || {})) {
    for (const method of methods) {
      const operation = pathItem[method];
      if (!operation) {
        continue;
      }

      operations.push({
        path: routePath,
        method: method.toUpperCase(),
        operationId: operation.operationId || `${method}${routePath}`,
      });
    }
  }

  return operations;
}

function run() {
  const specsDir = path.resolve(__dirname, '..', 'generated-openapi');
  const outputDir = path.resolve(__dirname, '..', 'generated-tests', 'openapi-generated');
  const selectedControllers = normalizeControllerFilter(process.argv.slice(2));

  console.log('🚀 Starting OpenAPI test generation...\n');
  console.log('🔍 Regenerating openapi.yaml...');
  generateOpenApiSpec();

  const specFiles = listYamlSpecs(specsDir);
  const filteredSpecFiles = selectedControllers.length > 0
    ? specFiles.filter((specFile) => selectedControllers.includes(path.basename(specFile, path.extname(specFile))))
    : specFiles;

  console.log(`🧭 Found ${filteredSpecFiles.length} controller YAML files\n`);

  clearGeneratedTests(outputDir);

  for (const specFile of filteredSpecFiles) {
    const controllerName = path.basename(specFile, path.extname(specFile));

    console.log(`🧩 Generating tests for ${controllerName}...`);
    console.log(`   → source YAML: ${path.relative(path.resolve(__dirname, '..'), specFile)}`);

    const spec = validateSpec(specFile);
    const operations = extractOperationsFromSpec(spec);

    console.log(`   → ${operations.length} operations from YAML`);

    const nominalTests = generateNominalTests(operations, spec);
    const faultTests = generateFaultTests(operations, spec);
    const outputPath = path.join(outputDir, `${controllerName}.test.js`);

    console.log(`   Nominal: ${nominalTests.length} | Fault: ${faultTests.length}`);
    generateJestFile(controllerName, nominalTests, faultTests, outputPath);
  }

  console.log('\n▶ Run the generated controller suites with:');
  console.log('   npx jest generated-tests/openapi-generated --verbose');
}

run();