import bcrypt from "bcryptjs";

async function generateHashedPassword(password: string) {
  try {
    // generate dynamic salt rounds
    const saltRounds = parseInt(process.env.SALT as string);
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error(error);
  }
}

export default generateHashedPassword;
