const fs = require("fs");
const path = require("path");

/**
 * Build-time script to fix markdown table spacing issues.
 * 
 * Problem: When text immediately follows a markdown table without a blank line,
 * markdown parsers interpret it as part of the table.
 * 
 * Solution: Automatically insert a blank line after tables during build.
 * 
 * Design decisions:
 * - Runs during build, not at runtime (zero performance impact)
 * - Modifies files in-place in src/assets (safe for deployment)
 * - Only fixes files that have the issue (minimal changes)
 * - Idempotent: safe to run multiple times
 */

const ASSETS_DIR = path.join(__dirname, "..", "src", "assets");

/**
 * Fixes markdown table spacing by ensuring a blank line after tables.
 * Only adds blank line if text immediately follows the table.
 */
function fixTableSpacing(content) {
  // Match markdown table rows (lines with | at start and end)
  // followed immediately by a non-empty line that doesn't start with |
  // 
  // Explanation of regex:
  // ^(\|.+\|)       - Match a table row (starts and ends with |)
  // (\r?\n)         - Capture the newline
  // (?=\S)          - Look ahead for non-whitespace (immediate content)
  // (?!\|)          - Negative lookahead: not another table row
  const tableRegex = /^(\|.+\|)(\r?\n)(?=\S)(?!\|)/gm;
  
  // Replace with table row + two newlines (adds blank line)
  return content.replace(tableRegex, '$1$2$2');
}

/**
 * Recursively processes all markdown files in a directory
 */
function processDirectory(dirPath, stats = { processed: 0, fixed: 0 }) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const itemPath = path.join(dirPath, item);

    // Skip generated JSON files
    if (item === "manifest.json" || 
        item === "search-index.json" || 
        item === "reference-graph.json") {
      continue;
    }

    if (fs.statSync(itemPath).isDirectory()) {
      processDirectory(itemPath, stats);
    } else if (item.endsWith('.md')) {
      stats.processed++;
      
      const content = fs.readFileSync(itemPath, 'utf-8');
      const fixedContent = fixTableSpacing(content);
      
      if (content !== fixedContent) {
        fs.writeFileSync(itemPath, fixedContent, 'utf-8');
        stats.fixed++;
        const relativePath = path.relative(ASSETS_DIR, itemPath);
        console.log(`  ✓ Fixed: ${relativePath}`);
      }
    }
  }

  return stats;
}

/**
 * Main execution
 */
function main() {
  console.log("========================================");
  console.log("Fixing markdown table spacing...");
  console.log("========================================");
  console.log();

  if (!fs.existsSync(ASSETS_DIR)) {
    console.error("❌ Assets directory does not exist:", ASSETS_DIR);
    process.exit(1);
  }

  console.log("📁 Processing directory:", ASSETS_DIR);
  console.log();

  const stats = processDirectory(ASSETS_DIR);

  console.log();
  console.log("========================================");
  console.log("✨ Processing complete!");
  console.log(`   Processed: ${stats.processed} files`);
  console.log(`   Fixed: ${stats.fixed} files`);
  console.log("========================================");
}

// Run the script
try {
  main();
} catch (error) {
  console.error("❌ Error fixing markdown tables:", error);
  process.exit(1);
}

