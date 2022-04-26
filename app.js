const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, "./cricketTeam.db"),
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
  } catch (err) {
    console.log(`${err.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (DbObject) => {
  return {
    playerId: DbObject.player_id,
    playerName: DbObject.player_name,
    jerseyNumber: DbObject.jersey_number,
    role: DbObject.role,
  };
};

// get all players
app.get("/players/", async (request, response) => {
  try {
    const getPlayersQuery = `
    SELECT 
    * 
    FROM 
    cricket_team;`;
    const playersArray = await db.all(getPlayersQuery);
    response.send(playersArray.map(convertDbObjectToResponseObject));
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
});

// add player
app.post("/players/", async (request, response) => {
  try {
    const playerDetails = request.body;
    const { playerName, jerseyNumber, role } = playerDetails;
    const addPlayerDetailsQuery = `
  INSERT INTO 
  cricket_team (player_name, jersey_number, role)
  VALUES
  (
      '${playerName}',
      '${jerseyNumber}', 
      '${role}'
  );`;

    const dbResponse = await db.run(addPlayerDetailsQuery);
    response.send("Player Added to Team");
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
});

// get player
app.get("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const getPlayerQuery = `
    SELECT 
    * 
    FROM 
    cricket_team
    WHERE 
    player_id = '${playerId}';`;

    const player = await db.get(getPlayerQuery);
    response.send(convertDbObjectToResponseObject(player));
  } catch (err) {
    console.log(`${err.message}`);
    process.exit(1);
  }
});

// update player details
app.put("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const playerDetails = request.body;
    const { playerName, jerseyNumber, role } = playerDetails;
    const updatePlayerDetailsQuery = `
        UPDATE
        cricket_team
        SET
        player_name = '${playerName}',
        jersey_number ='${jerseyNumber}',
        role = '${role}'
        WHERE
        player_id = '${playerId}';
        `;
    const dbResponse = await db.run(updatePlayerDetailsQuery);
    response.send("Player Details Updated");
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
});

// delete player
app.delete("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const deletePlayerQuery = `
        Delete FROM 
        cricket_team
        WHERE
        player_id = '${playerId}';`;

    const dbResponse = await db.run(deletePlayerQuery);
    response.send("Player Removed");
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
});

module.exports = app;
