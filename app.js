const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())
let db = null

const db_path = path.join(__dirname, 'cricketMatchDetails.db')
const initalizeDbAndServer = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server_Started!!!')
    })
  } catch (e) {
    console.log(e.message)
    process.exit(1)
  }
}

initalizeDbAndServer()
//API 1
app.get('/players/', async (request, response) => {
  const query = `
    SELECT *
    FROM player_details;
    `
  const query_result = await db.all(query)
  response.send(
    query_result.map(items => {
      return {
        playerId: items.player_id,
        playerName: items.player_name,
      }
    }),
  )
})

//API 2
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const query = `
    SELECT *
    FROM player_details
    WHERE
    player_id = ${playerId};
    `
  const query_result = await db.get(query)
  response.send({
    playerId: query_result.player_id,
    playerName: query_result.player_name,
  })
})

//API 3
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const query = `
    UPDATE
      player_details
    SET
      player_name = '${playerName}'
    WHERE
      player_id = ${playerId};
    `
  const query_result = await db.run(query)
  response.send('Player Details Updated')
})

//API 4
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const query = `
    SELECT *
    FROM match_details
    WHERE
    match_id = ${matchId};
    `
  const query_result = await db.get(query)
  response.send({
    matchId: query_result.match_id,
    match: query_result.match,
    year: query_result.year,
  })
})

//API 5
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const query = `
    SELECT
     match_id As matchId,
     match,
     year
    FROM 
      match_details Natural Join player_match_score
    WHERE
    player_id = ${playerId};
    `
  const query_result = await db.all(query)
  response.send(query_result)
})

//API 6
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const query = `
    SELECT
      player_id As playerId,
      player_name As playerName
    FROM 
      player_match_score Natural Join player_details
    WHERE
      match_id = ${matchId};
    
    `
  const query_result = await db.all(query)
  response.send(query_result)
})

//API 7
app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const query = `
    SELECT
      player_details.player_id AS playerId,
      player_details.player_name AS playerName,
      SUM(player_match_score.score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes 
    FROM 
        player_match_score INNER JOIN player_details 
        ON
        player_details.player_id = player_match_score.player_id
    WHERE
       player_details.player_id = ${playerId};
    
    `
  const query_result = await db.all(query)
  response.send(query_result)
})

module.exports = app
