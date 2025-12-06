import app from "./app";
import initializeDatabase from "./config/db";
import ENV from "./config/env";

initializeDatabase();

app.listen(ENV.PORT, () => {
  console.log(`Server is running port: ${ENV.PORT}`);
});
