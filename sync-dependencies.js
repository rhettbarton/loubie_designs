import depcheck from 'depcheck';
import { execSync } from 'child_process';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

const options = {
  ignoreDirs: ['node_modules', 'dist', 'build'],
  ignoreMatches: [],
};

depcheck(process.cwd(), options).then((result) => {
  const missing = result.missing;
  const unused = result.dependencies.concat(result.devDependencies);

  console.log(dryRun ? "🔎 Dry run mode: No changes will be made.\n" : "");

  // Handle missing dependencies
  if (Object.keys(missing).length > 0) {
    console.log('⚠️  Missing dependencies detected:');
    console.log(missing);

    if (!dryRun) {
      for (const pkg of Object.keys(missing)) {
        console.log(`Installing ${pkg}...`);
        try {
          execSync(`npm install ${pkg}`, { stdio: 'inherit' });
        } catch (err) {
          console.error(`❌ Failed to install ${pkg}`, err);
        }
      }
    }
  } else {
    console.log('✅ No missing dependencies.');
  }

  // Handle unused dependencies
  if (unused.length > 0) {
    console.log('\n⚠️  Unused dependencies detected:');
    console.log(unused);

    if (!dryRun) {
      for (const pkg of unused) {
        console.log(`Removing ${pkg}...`);
        try {
          execSync(`npm uninstall ${pkg}`, { stdio: 'inherit' });
        } catch (err) {
          console.error(`❌ Failed to uninstall ${pkg}`, err);
        }
      }
    }
  } else {
    console.log('✅ No unused dependencies.');
  }

  console.log(
    dryRun
      ? "\n✨ Dry run complete. No changes were made."
      : "\n🎉 Done! package.json and package-lock.json are updated."
  );
});
