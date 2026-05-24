const fs = require('fs');
const path = require('path');

const resultsFilePath = path.resolve(__dirname, '..', 'generated-tests', 'openapi-results.json');
const generatedOpenApiDir = path.resolve(__dirname, '..', 'generated-openapi');
const generatedTestsDir = path.resolve(__dirname, '..', 'generated-tests', 'openapi-generated');

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return null;
  }
}

function listFiles(directoryPath, predicate) {
  if (!fs.existsSync(directoryPath)) {
    return [];
  }

  return fs
    .readdirSync(directoryPath)
    .filter(predicate)
    .map((fileName) => path.join(directoryPath, fileName));
}

function formatTimestamp(value) {
  if (!value) {
    return null;
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return null;
  }

  return new Date(numericValue).toISOString();
}

function buildFailureList(assertionResults = []) {
  return assertionResults
    .filter((assertion) => assertion.status === 'failed')
    .map((assertion) => ({
      title: assertion.title,
      message: assertion.failureMessages?.[0] || 'Test failed without an explicit message',
    }));
}

function buildSuiteSummary(testResult = {}) {
  const assertionResults = Array.isArray(testResult.assertionResults)
    ? testResult.assertionResults
    : [];

  const passedTests = assertionResults.filter((assertion) => assertion.status === 'passed').length;
  const failedTests = assertionResults.filter((assertion) => assertion.status === 'failed').length;
  const totalTests = assertionResults.length;
  const durationMs = typeof testResult.startTime === 'number' && typeof testResult.endTime === 'number'
    ? testResult.endTime - testResult.startTime
    : null;

  return {
    filePath: testResult.name || '',
    controllerName: path.basename(testResult.name || '', '.test.js'),
    status: testResult.status || 'unknown',
    totalTests,
    passedTests,
    failedTests,
    passRate: totalTests > 0 ? Number(((passedTests / totalTests) * 100).toFixed(1)) : 0,
    durationMs,
    startTime: formatTimestamp(testResult.startTime),
    endTime: formatTimestamp(testResult.endTime),
    failures: buildFailureList(assertionResults).slice(0, 5),
  };
}

exports.getOpenApiGeneratedTestSummary = async (req, res) => {
  try {
    const snapshot = safeReadJson(resultsFilePath);
    const yamlFiles = listFiles(generatedOpenApiDir, (fileName) => fileName.endsWith('.yaml') || fileName.endsWith('.yml'));
    const testFiles = listFiles(generatedTestsDir, (fileName) => fileName.endsWith('.test.js'));
    const resultsStat = fs.existsSync(resultsFilePath) ? fs.statSync(resultsFilePath) : null;

    if (!snapshot) {
      return res.status(200).json({
        success: true,
        available: false,
        generatedAt: resultsStat ? resultsStat.mtime.toISOString() : null,
        summary: {
          totalSuites: 0,
          passedSuites: 0,
          failedSuites: 0,
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          passRate: 0,
        },
        artifacts: {
          controllerYamlCount: yamlFiles.length,
          generatedTestCount: testFiles.length,
        },
        suites: [],
        latestFailures: [],
        message: 'Chưa có snapshot openapi-results.json. Hãy chạy npm run test:openapi-generated để tạo dữ liệu.',
      });
    }

    const suites = Array.isArray(snapshot.testResults)
      ? snapshot.testResults.map((testResult) => buildSuiteSummary(testResult))
      : [];

    const latestFailures = suites
      .filter((suite) => suite.status === 'failed')
      .flatMap((suite) => suite.failures.map((failure) => ({
        controllerName: suite.controllerName,
        title: failure.title,
        message: failure.message,
      })))
      .slice(0, 12);

    const passedTests = snapshot.numPassedTests || 0;
    const totalTests = snapshot.numTotalTests || 0;

    return res.status(200).json({
      success: true,
      available: true,
      generatedAt: resultsStat ? resultsStat.mtime.toISOString() : formatTimestamp(snapshot.endTime),
      lastRunAt: formatTimestamp(snapshot.endTime),
      summary: {
        totalSuites: snapshot.numTotalTestSuites || 0,
        passedSuites: snapshot.numPassedTestSuites || 0,
        failedSuites: snapshot.numFailedTestSuites || 0,
        totalTests,
        passedTests,
        failedTests: snapshot.numFailedTests || 0,
        passRate: totalTests > 0 ? Number(((passedTests / totalTests) * 100).toFixed(1)) : 0,
        runtimeErrorSuites: snapshot.numRuntimeErrorTestSuites || 0,
        pendingSuites: snapshot.numPendingTestSuites || 0,
      },
      artifacts: {
        controllerYamlCount: yamlFiles.length,
        generatedTestCount: testFiles.length,
        resultsFile: path.relative(path.resolve(__dirname, '..'), resultsFilePath),
        generatedTestsPath: path.relative(path.resolve(__dirname, '..'), generatedTestsDir),
      },
      runMetadata: {
        startTime: formatTimestamp(snapshot.startTime),
        endTime: formatTimestamp(snapshot.endTime),
        success: snapshot.success,
        openHandlesCount: Array.isArray(snapshot.openHandles) ? snapshot.openHandles.length : 0,
      },
      suites,
      latestFailures,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};