const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

module.exports = app

const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
let db = null

const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDbServer()

//Get Players API
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
        SELECT player_id AS playerId, 
        player_name as playerName
        FROM player_details 
        ORDER BY player_id;
    `
  const playersArray = await db.all(getPlayersQuery)
  response.send(playersArray)
})

//Get player api
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT player_id AS playerId, 
        player_name as playerName
        FROM player_details 
        WHERE player_id = ${playerId};
  `
  const player = await db.get(getPlayerQuery)
  response.send(player)
})

//update player api
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName} = playerDetails
  const updatePlayerquery = `
    UPDATE player_details 
    SET 
    player_name = '${playerName}'
    WHERE player_id = ${playerId};
  `
  await db.run(updatePlayerquery)
  response.send('Player Details Updated')
})

//get match api
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getMatchQuery = `
    SELECT match_id as matchId,
    match, year 
    FROM match_details 
    WHERE match_id = ${matchId};
  `
  const match = await db.get(getMatchQuery)
  response.send(match)
})

//get match of player api
app.get('/players/:playerId/matches/', async (request, response) => {
  const {playerId} = request.params
  const getMatchPlayerQuery = `
    SELECT match_details.match_id as matchId, match, year
    FROM match_details inner join player_match_score 
    on match_details.match_id = player_match_score.match_id
    WHERE player_id = ${playerId};
  `
  const matchplayer = await db.all(getMatchPlayerQuery)
  response.send(matchplayer)
})

//get player of match api
app.get('/matches/:matchId/players/', async (request, response) => {
  const {matchId} = request.params
  const getPlayerMatchQuery = `
    SELECT player_details.player_id as playerId, player_name as playerName
    FROM player_details inner join player_match_score on 
    player_details.player_id = player_match_score.player_id 
    WHERE match_id = ${matchId};
  `
  const playerMatch = await db.all(getPlayerMatchQuery)
  response.send(playerMatch)
})

//get statistics of players api
app.get('/players/:playerId/playerScores/', async (request, response) => {
  const {playerId} = request.params
  const getStatisticsquery = `
    SELECT player_details.player_id as playerId, player_name as playerName, sum(score) as totalScore, sum(fours) as totalFours,
    sum(sixes) as totalSixes
    FROM player_details inner join player_match_score on 
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId}
    ;
  `
  const statistics = await db.all(getStatisticsquery)
  response.send(...statistics)
})
