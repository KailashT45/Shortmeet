import { useState } from "react";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import "./App.css";
import axios from "axios";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer]= useState("")

  async function generateAnswer() {
    setAnswer("loading..");
    const response=await axios({
      url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDdoCQrg78Le-hDJtqKAjJ0tGYYf7tbY6g" ,
      method: "post",
      data: {
        contents: [
          {
            parts: [
              {
                text: question,
              },
            ],
          },
        ],
      },
    });
    setAnswer(response["data"]["candidates"][0]["content"]["parts"][0]["text"]);
  }

  return (
    <>
      <h1>chart ai</h1>
      <textarea value={question} 
      onChange={(e)=>setQuestion(e.target.value)} cols="30" rows="10"></textarea>
      <button onClick={generateAnswer}>generate ans</button>

      <p>{answer}</p>
    </>
  );
}

export default App;
