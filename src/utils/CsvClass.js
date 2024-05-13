const { parse } = require('csv-parse/sync');

class CSVClass {
  constructor(fileBuffer) {
    this.buffer = fileBuffer;
  }

  processFile() {
    return parse(this.buffer, {
      columns: (header) => header.map((column) => column.toLowerCase()),
      skip_empty_lines: true,
    });
  }
}

module.exports = CSVClass;
