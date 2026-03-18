const fs = require("fs");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function run() {

  const exercises = JSON.parse(
    fs.readFileSync("ex_exercise.json", "utf8")
  );

  const { data, error } = await supabase
    .from("exercise")
    .insert(exercises);

  if (error) {
    console.error(error);
  } else {
    console.log("Inserted:", data.length);
  }
}

run();