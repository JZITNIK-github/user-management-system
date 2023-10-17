const bcrypt = require('bcrypt');

// Generate hashed password
const generateHashedPassword = async (password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

// Verify the hashed password
const verifyHashedPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Example usage
async function runExample() {
  const originalPassword = 'nevim';
  const hashedPassword = await generateHashedPassword(originalPassword);

  console.log('Hashed Password:', hashedPassword);

  // Checking the hashed password
  const isPasswordValid = await verifyHashedPassword(originalPassword, hashedPassword);

  if (isPasswordValid) {
    console.log('Password is valid');
  } else {
    console.log('Password is invalid');
  }
}

runExample();
