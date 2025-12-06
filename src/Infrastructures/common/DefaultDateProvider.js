const DateProvider = require('../../Applications/common/DateProvider');

class DefaultDateProvider extends DateProvider {
  getUtcNowString() {
    return new Date().toISOString();
  }
}

module.exports = DefaultDateProvider;
