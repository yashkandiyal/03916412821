import express from "express";
import axios from "axios";
const app = express();
const port = 9876;

const windowSize = 10;
let numberWindow = [];

const thirdPartyAPIs = {
  p: "http://20.244.56.144/test/primes",
  f: "http://20.244.56.144/test/fibo",
  e: "http://20.244.56.144/test/even",
  r: "http://20.244.56.144/test/rand",
};

const fetchNumber = async (type) => {
  try {
    const response = await axios.get(
      thirdPartyAPIs[type],
      { timeout: 500 },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    if (response.data && response.data.number) {
      return response.data.number;
    }
  } catch (error) {
    console.error(error);
  }
  return null;
};
//checking if the number is unique
const isUnique = (number) => !numberWindow.includes(number);
//updating the number window
const updateWindow = (newNumber) => {
  if (numberWindow.length >= windowSize) {
    numberWindow.shift();
  }
  numberWindow.push(newNumber);
};
//using a higher order function reduce to calculate the average of the numbers
const calculateAverage = () => {
  const sum = numberWindow.reduce((acc, num) => acc + num, 0);
  return numberWindow.length ? sum / numberWindow.length : 0;
};
//get request
app.get("/numbers/:type", async (req, res) => {
  const type = req.params.type;
  const validTypes = ["p", "f", "e", "r"];

  if (!validTypes.includes(type)) {
    return res.status(400).send({ error: "Invalid number type" });
  }
  //initializing the number window
  const prevWindowState = [...numberWindow];
  //fetching the number
  const newNumber = await fetchNumber(type);
  if (newNumber !== null && isUnique(newNumber)) {
    updateWindow(newNumber);
  }
  //sending the response
  const avg = calculateAverage();
  const response = {
    windowPrevState: prevWindowState,
    windowCurrState: numberWindow,
    numbers: [newNumber],
    avg: avg.toFixed(2),
  };

  res.send(response);
});
//starting the server at the given port:9876
app.listen(port, () => {
  console.log(`port running at http://localhost:${port}`);
});
