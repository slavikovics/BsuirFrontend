// components/ui/test/index.jsx
import { useState } from "react";
import { TestStartScreen } from "./test-start-screen";
import { TestQuestions } from "./test-questions";
import { TestResults } from "./test-results";

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:8081";

export function TestPage() {
  const [testState, setTestState] = useState("start"); // start, loading, questions, results
  const [testData, setTestData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [results, setResults] = useState(null);

  const getToken = () => localStorage.getItem("jwt_token") || "";

  const parseTestData = (data) => {
    // Если пришел уже парсированный массив
    if (Array.isArray(data)) {
      return data.map(item => {
        // Проверяем, что answers - это массив объектов
        if (item.answers && Array.isArray(item.answers)) {
          return {
            question: item.question || '',
            answers: item.answers.map(answerObj => {
              // Преобразуем объект вида {"текст ответа": 0/1} в более удобный формат
              const entries = Object.entries(answerObj)[0] || ['', 0];
              return {
                text: entries[0],
                isCorrect: entries[1] === 1
              };
            })
          };
        }
        return item;
      });
    }
    
    // Если пришел объект с вложенным массивом
    if (data?.tests && Array.isArray(data.tests)) {
      return parseTestData(data.tests);
    }
    
    // Если пришел JSON-строка
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return parseTestData(parsed);
      } catch (e) {
        console.error("Ошибка парсинга JSON:", e);
        return [];
      }
    }
    
    return [];
  };

  const startTest = async (testParams) => {
    try {
      setTestState("loading");

      const token = getToken();
      if (!token) throw new Error("Требуется авторизация");

      const payload = {
        Query: testParams.query,
        MaxFiles: testParams.maxFiles || 10
      };

      console.log("Отправка запроса с payload:", payload);

      const res = await fetch(`${API_BASE_URL}/api/test/generate-and-get`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Ошибка от сервера:", text);
        throw new Error(text || `Ошибка генерации: ${res.status}`);
      }

      let data;
      const responseText = await res.text();
      console.log("Ответ сервера:", responseText);
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Ошибка парсинга JSON ответа:", e);
        // Попробуем почистить JSON
        const cleanedJson = responseText.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        data = JSON.parse(cleanedJson);
      }

      // Парсим тестовые данные в удобный формат
      const parsedData = parseTestData(data);
      console.log("Парсированные данные:", parsedData);

      if (!parsedData || parsedData.length === 0) {
        throw new Error("Пустой тест получен от сервера");
      }

      setTestData(parsedData);
      setUserAnswers({}); // сброс прошлых ответов
      setResults(null);
      setTestState("questions");
    } catch (error) {
      console.error("Ошибка при загрузке теста:", error);
      alert(error.message || "Ошибка при загрузке теста");
      setTestState("start");
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const submitTest = async () => {
    try {
      setTestState("loading");

      if (!testData || testData.length === 0) {
        throw new Error("Нет данных теста для отправки");
      }

      // Подготавливаем ответы для отправки
      const formattedAnswers = testData.map((question, index) => {
        const chosenIndex = userAnswers[index] !== undefined ? userAnswers[index] : null;
        const chosenAnswer = chosenIndex !== null ? question.answers[chosenIndex] : null;
        
        return {
          question: question.question,
          user_answer: chosenAnswer ? chosenAnswer.text : "Нет ответа",
          correct: chosenAnswer ? chosenAnswer.isCorrect : false
        };
      });

      console.log("Отправляемые ответы:", formattedAnswers);

      const token = getToken();
      if (!token) throw new Error("Требуется авторизация");

      const res = await fetch(`${API_BASE_URL}/api/test/result`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formattedAnswers)
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Ошибка при отправке результатов: ${res.status}`);
      }

      const data = await res.json();

      // Создаем correctAnswers для отображения результатов
      const correctAnswers = testData.map(q => {
        const idx = q.answers.findIndex(a => a.isCorrect);
        return idx === -1 ? 0 : idx;
      });

      const userAnswersArray = testData.map((_, idx) => {
        return userAnswers[idx] !== undefined ? userAnswers[idx] : null;
      });

      const resultsObj = {
        analysis: data.analysis || data?.analysis || (typeof data === 'string' ? data : ''),
        correctAnswers,
        userAnswers: userAnswersArray
      };

      setResults(resultsObj);
      setTestState("results");
    } catch (error) {
      console.error("Ошибка при отправке теста:", error);
      alert(error.message || "Ошибка при отправке теста");
      setTestState("questions");
    }
  };

  const restartTest = () => {
    setTestState("start");
    setTestData(null);
    setUserAnswers({});
    setResults(null);
  };

  if (testState === "start") {
    return <TestStartScreen onStart={startTest} />;
  }

  if (testState === "loading") {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (testState === "questions") {
    return (
      <TestQuestions
        testData={testData}
        userAnswers={userAnswers}
        onAnswerSelect={handleAnswerSelect}
        onSubmit={submitTest}
      />
    );
  }

  if (testState === "results") {
    return (
      <TestResults
        results={results}
        testData={testData}
        userAnswers={userAnswers}
        onRestart={restartTest}
      />
    );
  }

  return null;
}