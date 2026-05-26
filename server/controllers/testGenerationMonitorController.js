const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const resultsFilePath = path.resolve(__dirname, '..', 'generated-tests', 'openapi-results.json');
const generatedOpenApiDir = path.resolve(__dirname, '..', 'generated-openapi');
const generatedTestsDir = path.resolve(__dirname, '..', 'generated-tests', 'openapi-generated');

const stateFilePath = path.resolve(__dirname, '..', '.openapi-task-state.json');

let activeProcesses = {
  generation: null,
  execution: null
};

let taskStatus = {
  generation: { status: 'idle', logs: '', lastRun: null, error: null },
  execution: { status: 'idle', logs: '', lastRun: null, error: null }
};

function saveTaskStatus() {
  try {
    fs.writeFileSync(stateFilePath, JSON.stringify(taskStatus, null, 2), 'utf8');
  } catch (err) {
    // Ignore write errors
  }
}

function loadTaskStatus() {
  if (fs.existsSync(stateFilePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
      if (data.generation && data.execution) {
        taskStatus = data;
        
        // Fail-safe: if status says running but no process is active, reset it to failed/idle after load
        if (taskStatus.generation.status === 'generating' && !activeProcesses.generation) {
          taskStatus.generation.status = 'failed';
          taskStatus.generation.logs += '\n--- INTERRUPTED BY SERVER RESTART ---';
          taskStatus.generation.error = 'Bị ngắt quãng do server khởi động lại';
        }
        if (taskStatus.execution.status === 'running' && taskStatus.execution.runSource !== 'cli' && !activeProcesses.execution) {
          taskStatus.execution.status = 'failed';
          taskStatus.execution.logs += '\n--- INTERRUPTED BY SERVER RESTART ---';
          taskStatus.execution.error = 'Bị ngắt quãng do server khởi động lại';
        }
      }
    } catch (err) {
      // Ignore read errors
    }
  }
}

// Initial load
loadTaskStatus();

function appendLogs(taskType, data) {
  let text = data.toString();
  // Strip ANSI escape codes
  text = text.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
  taskStatus[taskType].logs += text;
  if (taskStatus[taskType].logs.length > 200000) {
    taskStatus[taskType].logs = taskStatus[taskType].logs.slice(-100000);
  }
  saveTaskStatus();
}

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
  // Support both formats: Jest CLI --json (assertionResults) and Custom Reporter (testResults)
  const assertionResults = Array.isArray(testResult.assertionResults)
    ? testResult.assertionResults
    : (Array.isArray(testResult.testResults) ? testResult.testResults : []);

  const passedTests = assertionResults.filter((assertion) => assertion.status === 'passed').length;
  const failedTests = assertionResults.filter((assertion) => assertion.status === 'failed').length;
  const totalTests = assertionResults.length;
  
  const filePath = testResult.name || testResult.testFilePath || '';
  const controllerName = path.basename(filePath, '.test.js');
  const status = testResult.status || (failedTests > 0 ? 'failed' : 'passed');

  let durationMs = null;
  if (typeof testResult.startTime === 'number' && typeof testResult.endTime === 'number') {
    durationMs = testResult.endTime - testResult.startTime;
  } else if (testResult.perfStats && typeof testResult.perfStats.start === 'number' && typeof testResult.perfStats.end === 'number') {
    durationMs = testResult.perfStats.end - testResult.perfStats.start;
  } else if (testResult.perfStats && typeof testResult.perfStats.runtime === 'number') {
    durationMs = testResult.perfStats.runtime;
  }

  const startTime = testResult.startTime 
    ? formatTimestamp(testResult.startTime) 
    : (testResult.perfStats?.start ? formatTimestamp(testResult.perfStats.start) : null);
  const endTime = testResult.endTime 
    ? formatTimestamp(testResult.endTime) 
    : (testResult.perfStats?.end ? formatTimestamp(testResult.perfStats.end) : null);

  return {
    filePath,
    controllerName,
    status,
    totalTests,
    passedTests,
    failedTests,
    passRate: totalTests > 0 ? Number(((passedTests / totalTests) * 100).toFixed(1)) : 0,
    durationMs,
    startTime,
    endTime,
    failures: buildFailureList(assertionResults).slice(0, 5),
  };
}

exports.getOpenApiGeneratedTestSummary = async (req, res) => {
  try {
    loadTaskStatus();
    const snapshot = safeReadJson(resultsFilePath);
    const yamlFiles = listFiles(generatedOpenApiDir, (fileName) => fileName.endsWith('.yaml') || fileName.endsWith('.yml'));
    const testFiles = listFiles(generatedTestsDir, (fileName) => fileName.endsWith('.test.js'));
    const resultsStat = fs.existsSync(resultsFilePath) ? fs.statSync(resultsFilePath) : null;

    if (!snapshot) {
      return res.status(200).json({
        success: true,
        available: false,
        generatedAt: resultsStat ? resultsStat.mtime.toISOString() : null,
        generationStatus: {
          status: taskStatus.generation.status,
          logs: taskStatus.generation.logs,
          lastRun: taskStatus.generation.lastRun,
          error: taskStatus.generation.error
        },
        executionStatus: {
          status: taskStatus.execution.status,
          logs: taskStatus.execution.logs,
          lastRun: taskStatus.execution.lastRun,
          error: taskStatus.execution.error
        },
        executionHistory: taskStatus.executionHistory || [],
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

    const isRunning = taskStatus.execution.status === 'running';
    let suites = [];
    let latestFailures = [];
    let summary = {};
    let runMetadata = {};

    if (isRunning && taskStatus.execution.suites) {
      suites = taskStatus.execution.suites;
      latestFailures = taskStatus.execution.latestFailures || [];
      summary = taskStatus.execution.summary || {};
      runMetadata = {
        startTime: taskStatus.execution.lastRun,
        endTime: null,
        success: false,
        openHandlesCount: 0
      };
    } else if (snapshot) {
      suites = Array.isArray(snapshot.testResults)
        ? snapshot.testResults.map((testResult) => buildSuiteSummary(testResult))
        : [];

      latestFailures = suites
        .filter((suite) => suite.status === 'failed')
        .flatMap((suite) => suite.failures.map((failure) => ({
          controllerName: suite.controllerName,
          title: failure.title,
          message: failure.message,
        })))
        .slice(0, 12);

      const passedTests = snapshot.numPassedTests || 0;
      const totalTests = snapshot.numTotalTests || 0;

      summary = {
        totalSuites: snapshot.numTotalTestSuites || 0,
        passedSuites: snapshot.numPassedTestSuites || 0,
        failedSuites: snapshot.numFailedTestSuites || 0,
        totalTests,
        passedTests,
        failedTests: snapshot.numFailedTests || 0,
        passRate: totalTests > 0 ? Number(((passedTests / totalTests) * 100).toFixed(1)) : 0,
        runtimeErrorSuites: snapshot.numRuntimeErrorTestSuites || 0,
        pendingSuites: snapshot.numPendingTestSuites || 0,
      };

      runMetadata = {
        startTime: formatTimestamp(snapshot.startTime),
        endTime: formatTimestamp(snapshot.endTime),
        success: snapshot.success,
        openHandlesCount: Array.isArray(snapshot.openHandles) ? snapshot.openHandles.length : 0,
      };
    } else {
      summary = {
        totalSuites: 0,
        passedSuites: 0,
        failedSuites: 0,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        passRate: 0,
      };
      runMetadata = {
        startTime: null,
        endTime: null,
        success: false,
        openHandlesCount: 0,
      };
    }

    return res.status(200).json({
      success: true,
      available: !!(snapshot || isRunning),
      generatedAt: resultsStat ? resultsStat.mtime.toISOString() : (snapshot ? formatTimestamp(snapshot.endTime) : null),
      lastRunAt: snapshot ? formatTimestamp(snapshot.endTime) : null,
      generationStatus: {
        status: taskStatus.generation.status,
        logs: taskStatus.generation.logs,
        lastRun: taskStatus.generation.lastRun,
        error: taskStatus.generation.error
      },
      executionStatus: {
        status: taskStatus.execution.status,
        logs: taskStatus.execution.logs,
        lastRun: taskStatus.execution.lastRun,
        error: taskStatus.execution.error
      },
      executionHistory: taskStatus.executionHistory || [],
      summary,
      artifacts: {
        controllerYamlCount: yamlFiles.length,
        generatedTestCount: testFiles.length,
        resultsFile: path.relative(path.resolve(__dirname, '..'), resultsFilePath),
        generatedTestsPath: path.relative(path.resolve(__dirname, '..'), generatedTestsDir),
      },
      runMetadata,
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

exports.generateTests = (req, res) => {
  if (taskStatus.generation.status === 'generating') {
    return res.status(400).json({ success: false, message: 'Đang tự sinh ca kiểm thử.' });
  }

  taskStatus.generation.status = 'generating';
  taskStatus.generation.logs = '--- BẮT ĐẦU TỰ ĐỘNG SINH CA KIỂM THỬ (Theo Thuật Toán Bài Báo) ---\n';
  taskStatus.generation.lastRun = new Date().toISOString();
  taskStatus.generation.error = null;
  saveTaskStatus();

  const child = spawn('node', ['test-generator/index.js'], {
    cwd: path.resolve(__dirname, '..'),
    shell: true
  });

  activeProcesses.generation = child;

  child.stdout.on('data', (data) => {
    appendLogs('generation', data);
  });

  child.stderr.on('data', (data) => {
    appendLogs('generation', data);
  });

  child.on('close', (code) => {
    activeProcesses.generation = null;
    if (code === 0) {
      taskStatus.generation.status = 'success';
      taskStatus.generation.logs += '\n--- TẠO CA KIỂM THỬ THÀNH CÔNG ---';
    } else {
      taskStatus.generation.status = 'failed';
      taskStatus.generation.logs += `\n--- TẠO CA KIỂM THỬ THẤT BẠI (Mã lỗi: ${code}) ---`;
      taskStatus.generation.error = `Quá trình kết thúc với mã lỗi ${code}`;
    }
    saveTaskStatus();
  });

  return res.status(202).json({ success: true, message: 'Đã bắt đầu sinh ca kiểm thử' });
};

exports.runTests = (req, res) => {
  if (taskStatus.execution.status === 'running') {
    return res.status(400).json({ success: false, message: 'Kiểm thử đang được thực thi.' });
  }

  taskStatus.execution.status = 'running';
  taskStatus.execution.runSource = 'web';
  taskStatus.execution.logs = '--- BẮT ĐẦU CHẠY KIỂM THỬ (JEST RUNNER) ---\n';
  taskStatus.execution.lastRun = new Date().toISOString();
  taskStatus.execution.error = null;
  saveTaskStatus();

  const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(cmd, ['run', 'test:openapi-generated'], {
    cwd: path.resolve(__dirname, '..'),
    shell: true,
    env: { ...process.env, RUN_FROM_MONITOR: 'true' }
  });

  activeProcesses.execution = child;

  child.stdout.on('data', (data) => {
    appendLogs('execution', data);
  });

  child.stderr.on('data', (data) => {
    appendLogs('execution', data);
  });

  child.on('close', (code) => {
    activeProcesses.execution = null;
    loadTaskStatus(); // Reload to capture any history changes written by custom reporter
    if (code === 0) {
      taskStatus.execution.status = 'success';
      taskStatus.execution.logs += '\n--- CHẠY KIỂM THỬ THÀNH CÔNG ---';
    } else {
      taskStatus.execution.status = 'failed';
      taskStatus.execution.logs += `\n--- CHẠY KIỂM THỬ KẾT THÚC (Mã: ${code}) ---`;
      taskStatus.execution.error = `Quá trình kết thúc với mã ${code}`;
    }
    saveTaskStatus();
  });

  return res.status(202).json({ success: true, message: 'Đã bắt đầu thực thi kiểm thử' });
};

exports.cancelTask = (req, res) => {
  const { type } = req.body;
  if (type !== 'generation' && type !== 'execution') {
    return res.status(400).json({ success: false, message: 'Loại tác vụ không hợp lệ.' });
  }

  const child = activeProcesses[type];
  if (!child) {
    return res.status(400).json({ success: false, message: 'Không có tác vụ nào đang chạy.' });
  }

  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', child.pid, '/f', '/t']);
    } else {
      child.kill('SIGINT');
    }
    
    taskStatus[type].status = 'failed';
    taskStatus[type].logs += '\n--- TÁC VỤ ĐÃ BỊ HỦY BỞI NGƯỜI DÙNG ---';
    taskStatus[type].error = 'Bị hủy bởi người dùng';
    activeProcesses[type] = null;
    saveTaskStatus();
 
    return res.status(200).json({ success: true, message: 'Đã hủy tác vụ thành công.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearAllData = (req, res) => {
  if (activeProcesses.generation || activeProcesses.execution) {
    return res.status(400).json({
      success: false,
      message: 'Không thể xóa dữ liệu khi có tác vụ đang chạy.'
    });
  }

  try {
    if (fs.existsSync(resultsFilePath)) {
      fs.unlinkSync(resultsFilePath);
    }

    if (fs.existsSync(stateFilePath)) {
      fs.unlinkSync(stateFilePath);
    }

    if (fs.existsSync(generatedOpenApiDir)) {
      const files = fs.readdirSync(generatedOpenApiDir);
      for (const file of files) {
        const p = path.join(generatedOpenApiDir, file);
        if (fs.statSync(p).isFile()) {
          fs.unlinkSync(p);
        }
      }
    }

    if (fs.existsSync(generatedTestsDir)) {
      const files = fs.readdirSync(generatedTestsDir);
      for (const file of files) {
        const p = path.join(generatedTestsDir, file);
        if (fs.statSync(p).isFile()) {
          fs.unlinkSync(p);
        }
      }
    }

    taskStatus = {
      generation: { status: 'idle', logs: '', lastRun: null, error: null },
      execution: { status: 'idle', logs: '', lastRun: null, error: null },
      executionHistory: []
    };

    return res.status(200).json({
      success: true,
      message: 'Đã xóa toàn bộ dữ liệu kiểm thử và kết quả.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa dữ liệu: ' + error.message
    });
  }
};