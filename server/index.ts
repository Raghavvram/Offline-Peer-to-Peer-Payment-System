import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import sqlite3 from 'sqlite3';
import cors from 'cors';

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, balance REAL)");
  db.run("INSERT INTO users (name, balance) VALUES ('Sender', 1000)");
  db.run("INSERT INTO users (name, balance) VALUES ('Receiver', 500)");
  db.run("CREATE TABLE transactions (id INTEGER PRIMARY KEY, sender_id INTEGER, receiver_id INTEGER, amount REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

wss.on('connection', (ws) => {
  const clientId = Date.now().toString() + Math.random().toString();
  console.log(`Client connected: ${clientId}`);

  ws.send(JSON.stringify({ type: 'clientId', data: clientId }));

  sendUsersData(ws);
  ws.on('close', () => {
    console.log(`Client disconnected: ${clientId}`);
  });
});

function broadcast(data: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

function sendUsersData(ws: WebSocket) {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return;
    }
    ws.send(JSON.stringify({ type: 'users', data: rows }));
  });
}

app.post('/send', express.json(), (req, res) => {
  let { senderId, receiverId, amount } = req.body;
  senderId = Number(senderId);
  receiverId = Number(receiverId);
  amount = Number(amount);

  if (!senderId || !receiverId || isNaN(amount) || amount <= 0) {
    return res.status(400).send('Invalid input');
  }

  db.get("SELECT balance FROM users WHERE id = ?", [senderId], (err, senderRow: any) => {
    if (err || !senderRow) {
      return res.status(400).send('Invalid sender');
    }
    if (senderRow.balance < amount) {
      return res.status(400).send('Insufficient balance');
    }

    db.get("SELECT balance FROM users WHERE id = ?", [receiverId], (err, receiverRow: any) => {
      if (err || !receiverRow) {
        return res.status(400).send('Invalid receiver');
      }

      db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        db.run("UPDATE users SET balance = balance - ? WHERE id = ?", [amount, senderId]);
        db.run("UPDATE users SET balance = balance + ? WHERE id = ?", [amount, receiverId]);
        db.run("INSERT INTO transactions (sender_id, receiver_id, amount) VALUES (?, ?, ?)", [senderId, receiverId, amount], function (err) {
          if (err) {
            db.run("ROLLBACK");
            return res.status(500).send('Transaction failed');
          }
          db.run("COMMIT", (err) => {
            if (err) {
              return res.status(500).send('Commit failed');
            }
            db.all("SELECT * FROM users", [], (err, rows) => {
              if (!err) broadcast({ type: 'users', data: rows });
            });
            db.all("SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 10", [], (err, rows) => {
              if (!err) broadcast({ type: 'transactions', data: rows });
            });
            res.status(200).send('Transaction successful');
          });
        });
      });
    });
  });
});

app.get('/users', (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json(rows);
  });
});

app.get('/transactions', (req, res) => {
  db.all("SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 10", [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json(rows);
  });
});

server.listen(8081, () => {
  console.log('Server started on port 8081');
});