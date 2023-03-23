const express = require("express");
const app = express();
const path = require("path");

const sqlite3 = require("sqlite3");

const { open } = require("sqlite");
const dbPath = path.join(__dirname, "cricketTeam.db");
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// API 1 GET

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
   SELECT 
   *
   FROM
   cricket_team
   `;

  const dbObject = await db.all(getPlayersQuery);
  response.send(
    dbObject.map((each_player) => convertDbObjectToResponseObject(each_player))
  );
});
const convertDbObjectToResponseObject = (eachplayer) => {
  return {
    playerId: eachplayer.player_id,
    playerName: eachplayer.player_name,
    jerseyNumber: eachplayer.jersey_number,
    role: eachplayer.role,
  };
};

// API POST

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = request.body;
  const createPlayerQuery = ` insert into cricket_team(player_name,
    jersey_number,role) 
    values('${playerName}',${jerseyNumber},'${role}');`;
  const createPlayerQueryResponse = await db.run(createPlayerQuery);
  response.send(`Player Added to Team`);
});

//API get
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuery = `select * from cricket_team where 
  player_id = ${playerId};`;
  const getPlayerDetailsQueryResponse = await db.get(getPlayerDetailsQuery);
  response.send(convertDbObjectToResponseObject(getPlayerDetailsQueryResponse));
});

// API put

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerDetailsQuery = `update cricket_team set 
  player_name = '${playerName}' , jersey_number = ${jerseyNumber} , role = '${role}' 
  where player_id = ${playerId};`;
  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});

// delete the player details
//API 5

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
