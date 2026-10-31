// Makes a registered user an admin:  node make-admin.js your@email.com
require('dotenv').config();
const { sequelize, User } = require('./models');

(async () => {
  const email = (process.argv[2] || '').trim();
  if (!email) {
    console.log('Usage: node make-admin.js your@email.com');
    process.exit(1);
  }
  await sequelize.sync();
  const [count] = await User.update({ role: 'admin' }, { where: { email } });
  console.log(
    count
      ? `Done. ${email} is now an admin. Log out and log in again on the website.`
      : `No account found with the email ${email}. Register on the website first, then run this again.`
  );
  process.exit(0);
})().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
