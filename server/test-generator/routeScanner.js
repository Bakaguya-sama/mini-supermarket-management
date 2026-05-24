const fs = require('fs');
const path = require('path');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function normalizeMountPath(mountPath) {
  return mountPath.replace(/\/+$/, '') || '/';
}

function parseMountMap(serverFilePath) {
  const content = readFile(serverFilePath);
  const mountMap = new Map();
  const routeRegex = /app\.use\(\s*['"]([^'"]+)['"]\s*,\s*require\(\s*['"]\.\/routes\/([^'"]+)['"]\s*\)\s*\)/g;

  for (const match of content.matchAll(routeRegex)) {
    const mountPath = normalizeMountPath(match[1]);
    const routeFile = `${match[2]}.js`;
    if (!mountMap.has(routeFile)) {
      mountMap.set(routeFile, []);
    }
    mountMap.get(routeFile).push(mountPath);
  }

  return mountMap;
}

function parseControllerAliases(routeFilePath) {
  const content = readFile(routeFilePath);
  const aliasMap = new Map();
  const requireRegex = /const\s+(?:\{([^}]+)\}|([A-Za-z0-9_]+))\s*=\s*require\(\s*['"](?:\.\.\/)+controllers\/([A-Za-z0-9_.-]+)['"]\s*\);/g;

  for (const match of content.matchAll(requireRegex)) {
    const controllerFile = `${match[3]}.js`;

    if (match[2]) {
      aliasMap.set(match[2].trim(), controllerFile);
      continue;
    }

    const destructuredNames = (match[1] || '')
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);

    for (const name of destructuredNames) {
      const aliasName = name.split(':').pop().trim();
      aliasMap.set(aliasName, controllerFile);
    }
  }

  return aliasMap;
}

function extractHandlerExpression(routeLine) {
  const handlerMatch = routeLine.match(/router\.(?:get|post|put|patch|delete)\(\s*['"][^'"]+['"]\s*,([\s\S]*?)\)\s*;?\s*$/);
  if (!handlerMatch) {
    return null;
  }

  const args = handlerMatch[1].split(',').map((part) => part.trim()).filter(Boolean);
  if (args.length === 0) {
    return null;
  }

  return args[args.length - 1].replace(/\)+$/, '').trim();
}

function resolveControllerFile(handlerExpression, aliasMap, fallbackControllerFile) {
  if (!handlerExpression) {
    return fallbackControllerFile;
  }

  const baseToken = handlerExpression.split('.')[0].trim();
  if (aliasMap.has(baseToken)) {
    return aliasMap.get(baseToken);
  }

  if (/Controller$/.test(baseToken)) {
    return `${baseToken}.js`;
  }

  return fallbackControllerFile;
}

function scanRouteFile(filePath, mountPaths) {
  const content = readFile(filePath);
  const operations = [];
  const lines = content.split(/\r?\n/);
  const routeRegex = /^\s*router\.(get|post|put|patch|delete)\(\s*(['"])([^'"]+)\2\s*,[\s\S]*\)\s*;?\s*$/;
  const aliasMap = parseControllerAliases(filePath);
  const fallbackControllerFile = `${path.basename(filePath, '.js').replace(/Routes$/i, 'Controller')}.js`;

  for (const line of lines) {
    const match = line.match(routeRegex);
    if (!match) {
      continue;
    }

    const method = match[1].toUpperCase();
    const routePath = match[3];
    const handlerExpression = extractHandlerExpression(line);
    const controllerFile = resolveControllerFile(handlerExpression, aliasMap, fallbackControllerFile);
    const operationId = handlerExpression ? handlerExpression.split('.').pop() : `${method.toLowerCase()}${routePath}`;

    for (const mountPath of mountPaths) {
      const normalizedMount = normalizeMountPath(mountPath);
      const normalizedRoute = routePath.startsWith('/') ? routePath : `/${routePath}`;
      const fullPath = normalizedMount === '/' ? normalizedRoute : `${normalizedMount}${normalizedRoute}`;

      operations.push({
        path: fullPath,
        method,
        operationId,
        controllerFile,
        routePath,
        routeFile: path.basename(filePath),
      });
    }
  }

  return operations;
}

function scanRoutes() {
  const serverDir = path.join(__dirname, '..');
  const routesDir = path.join(serverDir, 'routes');
  const serverFile = path.join(serverDir, 'server.js');
  const mountMap = parseMountMap(serverFile);

  const routeFiles = fs
    .readdirSync(routesDir)
    .filter((file) => file.endsWith('.js') && !file.endsWith('.OLD.js'));

  const operations = [];

  for (const routeFile of routeFiles) {
    const filePath = path.join(routesDir, routeFile);
    const mountPaths = mountMap.get(routeFile) || [];

    if (mountPaths.length === 0) {
      const baseName = routeFile.replace(/Routes\.js$/i, '').replace(/\.js$/i, '');
      mountPaths.push(`/api/${baseName}`);
    }

    operations.push(...scanRouteFile(filePath, mountPaths));
  }

  const unique = new Map();
  for (const operation of operations) {
    const key = `${operation.method}:${operation.path}`;
    if (!unique.has(key)) {
      unique.set(key, operation);
    }
  }

  return [...unique.values()].sort((left, right) => {
    if (left.path === right.path) {
      return left.method.localeCompare(right.method);
    }
    return left.path.localeCompare(right.path);
  });
}

function scanRoutesByController() {
  const operations = scanRoutes();
  const groups = new Map();

  for (const operation of operations) {
    const controllerKey = path.basename(operation.controllerFile, '.js');
    if (!groups.has(controllerKey)) {
      groups.set(controllerKey, []);
    }
    groups.get(controllerKey).push(operation);
  }

  return [...groups.entries()]
    .map(([controllerName, controllerOperations]) => ({
      controllerName,
      controllerFile: `${controllerName}.js`,
      operations: controllerOperations,
    }))
    .sort((left, right) => left.controllerName.localeCompare(right.controllerName));
}

module.exports = {
  scanRoutes,
  scanRoutesByController,
};