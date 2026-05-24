const fs = require('fs');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const yaml = require('js-yaml');

function buildSpec(apiFiles) {
  return swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Mini Supermarket API',
        version: '1.0.0',
        description: 'API cho hệ thống quản lý siêu thị mini',
      },
      servers: [{ url: 'http://localhost:5000' }],
      components: {
        schemas: {
          IdParam: {
            type: 'string',
            pattern: '^[0-9a-fA-F]{24}$',
          },
          PaginationQuery: {
            type: 'object',
            properties: {
              page: { type: 'integer', minimum: 1, default: 1 },
              limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            },
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              message: { type: 'string', example: 'Validation failed' },
            },
          },
        },
      },
    },
    apis: apiFiles,
  });
}

function writeYamlSpec(outputPath, spec) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, yaml.dump(spec), 'utf8');
}

function generateOpenApiSpec() {
  const outputPath = path.join(__dirname, 'openapi.yaml');
  const controllersDir = path.join(__dirname, 'controllers');
  const specsDir = path.join(__dirname, 'generated-openapi');
  const apiFiles = fs
    .readdirSync(controllersDir)
    .filter((file) => file.endsWith('.js') && !file.endsWith('.OLD.js'))
    .map((file) => path.join(controllersDir, file));

  const spec = buildSpec(apiFiles);
  writeYamlSpec(outputPath, spec);

  fs.rmSync(specsDir, { recursive: true, force: true });
  fs.mkdirSync(specsDir, { recursive: true });

  const controllerSpecs = [];
  for (const filePath of apiFiles) {
    const controllerSpec = buildSpec([filePath]);
    const controllerName = path.basename(filePath, '.js');
    const controllerOutputPath = path.join(specsDir, `${controllerName}.yaml`);

    writeYamlSpec(controllerOutputPath, controllerSpec);
    controllerSpecs.push({
      controllerName,
      outputPath: controllerOutputPath,
      spec: controllerSpec,
    });
  }

  return { spec, outputPath, controllerSpecs };
}

if (require.main === module) {
  const { outputPath, controllerSpecs } = generateOpenApiSpec();
  console.log(`✅ openapi.yaml đã được tạo tại ${outputPath}`);
  console.log(`✅ Generated ${controllerSpecs.length} controller YAML files in generated-openapi/`);
}

module.exports = {
  generateOpenApiSpec,
};
