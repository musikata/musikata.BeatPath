exports.config = {
  // Use phantomjs via ghostdriver (should already be running)
  seleniumAddress: 'http://localhost:4444',
  capabilities: {'browserName': 'phantomjs'},

  jasmineNodeOpts: {
    showColors: true,
  }
};
