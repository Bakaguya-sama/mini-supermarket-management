const fs = require('fs');
const path = require('path');

class OpenApiTestReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
    this.stateFilePath = path.resolve(__dirname, '..', '.openapi-task-state.json');
    this.resultsFilePath = path.resolve(__dirname, '..', 'generated-tests', 'openapi-results.json');
    this.isTargetSuite = false;
  }

  onRunStart(results, options) {
    // We do not know yet if Target Suite will be run. We will flag it in onTestStart.
  }

  onTestStart(test) {
    const isGeneratedTest = test.path.replace(/\\/g, '/').includes('generated-tests/openapi-generated');
    if (isGeneratedTest && !this.isTargetSuite) {
      this.isTargetSuite = true;
      this.updateStatusStart();
    }
  }

  onTestResult(test, testResult, aggregatedResults) {
    const isGeneratedTest = test.path.replace(/\\/g, '/').includes('generated-tests/openapi-generated');
    if (isGeneratedTest) {
      this.isTargetSuite = true;
      const controllerName = path.basename(test.path, '.test.js');
      const statusStr = testResult.numFailingTests > 0 ? 'FAIL' : 'PASS';
      const logLine = `${statusStr === 'PASS' ? '✅' : '❌'} ${statusStr} - ${controllerName} (${testResult.numPassingTests}/${testResult.numPassingTests + testResult.numFailingTests} tests passed)\n`;
      this.appendExecutionLogsAndSuite(logLine, testResult);
    }
  }

  onRunComplete(contexts, results) {
    if (this.isTargetSuite) {
      const durationMs = (results.perfStats && results.perfStats.runtime)
        ? results.perfStats.runtime
        : (results.startTime ? (Date.now() - results.startTime) : 0);
      const durationSec = (durationMs / 1000).toFixed(2);

      const summaryLog = `\n--- KẾT QUẢ KIỂM THỬ ---
Tổng số test suites: ${results.numTotalTestSuites}
Suites thành công: ${results.numPassedTestSuites}
Suites thất bại: ${results.numFailedTestSuites}
Tổng số ca kiểm thử: ${results.numTotalTests}
Ca kiểm thử thành công: ${results.numPassedTests}
Ca kiểm thử thất bại: ${results.numFailedTests}
Tỉ lệ thành công: ${results.numTotalTests > 0 ? ((results.numPassedTests / results.numTotalTests) * 100).toFixed(1) : 0}%
Thời gian chạy: ${durationSec}s\n`;

      const success = results.numFailedTests === 0;
      this.updateStatusComplete(results, summaryLog, success);

      // Write results JSON to disk
      try {
        const dir = path.dirname(this.resultsFilePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(this.resultsFilePath, JSON.stringify(results, null, 2), 'utf8');
      } catch (err) {
        console.error('Failed to write openapi-results.json:', err);
      }
    }
  }

  loadStatus() {
    let taskStatus = {
      generation: { status: 'idle', logs: '', lastRun: null, error: null },
      execution: { status: 'idle', logs: '', lastRun: null, error: null },
      executionHistory: []
    };

    if (fs.existsSync(this.stateFilePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.stateFilePath, 'utf8'));
        if (data.generation && data.execution) {
          taskStatus = data;
        }
      } catch (err) {
        // Ignore
      }
    }
    return taskStatus;
  }

  saveStatus(taskStatus) {
    try {
      fs.writeFileSync(this.stateFilePath, JSON.stringify(taskStatus, null, 2), 'utf8');
    } catch (err) {
      // Ignore
    }
  }

  updateStatusStart() {
    const taskStatus = this.loadStatus();
    if (process.env.RUN_FROM_MONITOR !== 'true') {
      taskStatus.execution.status = 'running';
      taskStatus.execution.runSource = 'cli';
      taskStatus.execution.logs = '--- BẮT ĐẦU CHẠY KIỂM THỬ (JEST RUNNER) ---\n';
      taskStatus.execution.lastRun = new Date().toISOString();
      taskStatus.execution.error = null;
    }
    taskStatus.execution.suites = [];
    taskStatus.execution.latestFailures = [];
    taskStatus.execution.summary = {
      totalSuites: 0,
      passedSuites: 0,
      failedSuites: 0,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      passRate: 0,
      runtimeErrorSuites: 0,
      pendingSuites: 0
    };
    this.saveStatus(taskStatus);
  }

  formatTimestamp(value) {
    if (!value) return null;
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return null;
    return new Date(numericValue).toISOString();
  }

  buildFailureList(testResults = []) {
    return testResults
      .filter((tc) => tc.status === 'failed')
      .map((tc) => ({
        title: tc.title,
        message: tc.failureMessages?.[0] || 'Test failed without an explicit message',
      }));
  }

  buildSuiteSummary(testResult = {}) {
    const testCases = Array.isArray(testResult.testResults)
      ? testResult.testResults
      : [];

    const passedTests = testCases.filter((tc) => tc.status === 'passed').length;
    const failedTests = testCases.filter((tc) => tc.status === 'failed').length;
    const totalTests = testCases.length;
    
    const startTimeMs = testResult.perfStats?.start;
    const endTimeMs = testResult.perfStats?.end;
    const durationMs = (startTimeMs && endTimeMs) ? (endTimeMs - startTimeMs) : null;

    const controllerName = path.basename(testResult.testFilePath || '', '.test.js');
    const status = (failedTests > 0 || testResult.failureMessage) ? 'failed' : 'passed';

    return {
      filePath: testResult.testFilePath || '',
      controllerName,
      status,
      totalTests,
      passedTests,
      failedTests,
      passRate: totalTests > 0 ? Number(((passedTests / totalTests) * 100).toFixed(1)) : 0,
      durationMs,
      startTime: this.formatTimestamp(startTimeMs),
      endTime: this.formatTimestamp(endTimeMs),
      failures: this.buildFailureList(testCases).slice(0, 5),
    };
  }

  appendExecutionLogsAndSuite(text, testResult) {
    const taskStatus = this.loadStatus();
    if (process.env.RUN_FROM_MONITOR !== 'true') {
      taskStatus.execution.logs += text;
      if (taskStatus.execution.logs.length > 200000) {
        taskStatus.execution.logs = taskStatus.execution.logs.slice(-100000);
      }
    }

    if (!taskStatus.execution.suites) taskStatus.execution.suites = [];
    if (!taskStatus.execution.latestFailures) taskStatus.execution.latestFailures = [];
    if (!taskStatus.execution.summary) {
      taskStatus.execution.summary = {
        totalSuites: 0,
        passedSuites: 0,
        failedSuites: 0,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        passRate: 0,
        runtimeErrorSuites: 0,
        pendingSuites: 0
      };
    }

    const suiteSummary = this.buildSuiteSummary(testResult);
    taskStatus.execution.suites.push(suiteSummary);

    taskStatus.execution.summary.totalSuites += 1;
    if (suiteSummary.status === 'passed') {
      taskStatus.execution.summary.passedSuites += 1;
    } else {
      taskStatus.execution.summary.failedSuites += 1;
    }
    taskStatus.execution.summary.totalTests += suiteSummary.totalTests;
    taskStatus.execution.summary.passedTests += suiteSummary.passedTests;
    taskStatus.execution.summary.failedTests += suiteSummary.failedTests;
    const total = taskStatus.execution.summary.totalTests;
    const passed = taskStatus.execution.summary.passedTests;
    taskStatus.execution.summary.passRate = total > 0 ? Number(((passed / total) * 100).toFixed(1)) : 0;

    if (suiteSummary.status === 'failed') {
      suiteSummary.failures.forEach((fail) => {
        taskStatus.execution.latestFailures.push({
          controllerName: suiteSummary.controllerName,
          title: fail.title,
          message: fail.message,
        });
      });
      taskStatus.execution.latestFailures = taskStatus.execution.latestFailures.slice(-12);
    }

    this.saveStatus(taskStatus);
  }

  updateStatusComplete(results, summaryLog, success) {
    const taskStatus = this.loadStatus();
    
    if (process.env.RUN_FROM_MONITOR !== 'true') {
      taskStatus.execution.status = success ? 'success' : 'failed';
      taskStatus.execution.logs += summaryLog;
      taskStatus.execution.logs += success ? '\n--- CHẠY KIỂM THỬ THÀNH CÔNG ---' : '\n--- CHẠY KIỂM THỬ THẤT BẠI ---';
      taskStatus.execution.error = success ? null : `${results.numFailedTests} ca kiểm thử thất bại`;
      taskStatus.execution.lastRun = new Date().toISOString();
    }

    // Clean up temporary suites/latestFailures/summary since we are done
    delete taskStatus.execution.suites;
    delete taskStatus.execution.latestFailures;
    delete taskStatus.execution.summary;

    // History log (Always record)
    if (!taskStatus.executionHistory) {
      taskStatus.executionHistory = [];
    }

    const durationMs = (results.perfStats && results.perfStats.runtime)
      ? results.perfStats.runtime
      : (results.startTime ? (Date.now() - results.startTime) : 0);

    const historyItem = {
      timestamp: new Date().toISOString(),
      totalSuites: results.numTotalTestSuites,
      passedSuites: results.numPassedTestSuites,
      failedSuites: results.numFailedTestSuites,
      totalTests: results.numTotalTests,
      passedTests: results.numPassedTests,
      failedTests: results.numFailedTests,
      passRate: results.numTotalTests > 0 ? Number(((results.numPassedTests / results.numTotalTests) * 100).toFixed(1)) : 0,
      success,
      durationMs
    };

    taskStatus.executionHistory.unshift(historyItem);
    taskStatus.executionHistory = taskStatus.executionHistory.slice(0, 5); // Keep last 5 runs

    this.saveStatus(taskStatus);
  }
}

module.exports = OpenApiTestReporter;
