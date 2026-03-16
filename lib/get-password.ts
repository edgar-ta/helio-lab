import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10; // Match whatever your login route uses
const plainPassword = "demo1234";
(async function() {
    const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    console.log(hash);
})();
