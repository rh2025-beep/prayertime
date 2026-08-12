const { exec } = require('child_process');
exec('npx capacitor-assets generate --android', (err, stdout, stderr) => {
  if (err) {
    console.error('Error running capacitor-assets:', err);
    process.exit(1);
  }
  console.log('Assets generated successfully:');
  console.log(stdout);
  if (stderr) console.error(stderr);
});
