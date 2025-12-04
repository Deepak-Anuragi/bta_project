/**
 * Test Runner Component
 * Runs all game logic tests and displays results
 */

import React, { useEffect, useState } from 'react';
import { runAllTests } from '../utils/gameLogic.test';

const TestRunner = () => {
  const [testResults, setTestResults] = useState(null);
  const [testOutput, setTestOutput] = useState([]);

  useEffect(() => {
    // Capture console output
    const originalLog = console.log;
    const originalError = console.error;
    const output = [];

    console.log = (...args) => {
      output.push(args.join(' '));
      originalLog(...args);
    };

    console.error = (...args) => {
      output.push('ERROR: ' + args.join(' '));
      originalError(...args);
    };

    // Run tests
    const passed = runAllTests();
    setTestResults(passed);
    setTestOutput(output);

    // Restore console
    console.log = originalLog;
    console.error = originalError;
  }, []);

  if (testResults === null) {
    return <div>Running tests...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>{testResults ? '✅ Tests Passed!' : '❌ Tests Failed!'}</h2>
      </div>
      <pre style={styles.output}>
        {testOutput.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </pre>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    color: '#fff',
    fontFamily: 'monospace'
  },
  header: {
    marginBottom: '20px'
  },
  output: {
    backgroundColor: '#0a0a0a',
    padding: '15px',
    borderRadius: '4px',
    overflowX: 'auto',
    fontSize: '12px',
    lineHeight: '1.5'
  }
};

export default TestRunner;
